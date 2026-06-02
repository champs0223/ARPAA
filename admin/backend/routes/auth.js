const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret-in-env';
const JWT_EXPIRE_SECONDS = 8 * 60 * 60; // 8 horas

const sessions = new Map();

function base64UrlEncode(buffer) {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64');
}

function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRE_SECONDS
  };

  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(body)));
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function verifyJwt(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(
    crypto.createHmac('sha256', JWT_SECRET).update(message).digest()
  );

  const signatureBuffer = Buffer.from(encodedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function createSession(user) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, {
    id: user.id,
    is_admin: Boolean(user.is_admin),
    createdAt: Date.now()
  });
  return token;
}

function createAuthToken(user) {
  if (JWT_SECRET && JWT_SECRET !== 'replace-this-secret-in-env') {
    return signJwt({ id: user.id, nome: user.nome, is_admin: Boolean(user.is_admin) });
  }
  return createSession(user);
}

function verifyToken(token) {
  if (!token) {
    return null;
  }

  if (token.split('.').length === 3) {
    return verifyJwt(token);
  }

  return sessions.get(token) || null;
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação ausente' });
    }

    const session = verifyToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const [rows] = await pool.query('SELECT id, nome, is_admin FROM usuarios WHERE id = ?', [session.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Usuário inexistente' });
    }

    req.user = {
      id: rows[0].id,
      nome: rows[0].nome,
      is_admin: Boolean(session.is_admin || rows[0].is_admin),
      role: Boolean(session.is_admin || rows[0].is_admin) ? 'admin' : 'user'
    };

    next();
  } catch (error) {
    console.error('Erro ao autenticar token:', error.message);
    res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
}

function ensureAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Acesso administrativo é necessário' });
  }
  next();
}

// POST - Login
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, nome, cpf, senha, is_admin FROM usuarios WHERE LOWER(nome) = LOWER(?) OR cpf = ? LIMIT 1',
      [usuario, usuario]
    );

    const user = rows[0];

    if (!user || user.senha !== senha) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const token = createAuthToken(user);

    return res.json({
      success: true,
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      is_admin: Boolean(user.is_admin),
      token,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    console.error(error.stack);
    return res.status(500).json({ error: 'Erro interno ao efetuar login. Verifique o servidor.' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// POST - Registrar novo usuário (admin apenas)
router.post('/registro', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const { usuario, senha, cpf, is_admin } = req.body;

    if (!usuario || !senha || !cpf) {
      return res.status(400).json({ error: 'Usuário, senha e CPF são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [existing] = await connection.query(
      'SELECT id FROM usuarios WHERE nome = ? OR cpf = ? LIMIT 1',
      [usuario, cpf]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Usuário ou CPF já existe' });
    }

    const [result] = await connection.query(
      'INSERT INTO usuarios (nome, cpf, senha, is_admin) VALUES (?, ?, ?, ?)',
      [usuario, cpf, senha, is_admin ? 1 : 0]
    );
    connection.release();

    res.status(201).json({
      success: true,
      id: result.insertId,
      usuario,
      cpf,
      is_admin: Boolean(is_admin),
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Verificar credenciais administrativas
router.post('/admin/verify-credentials', async (req, res) => {
  try {
    const { usuarioId, senha } = req.body;

    if (!usuarioId || !senha) {
      return res.status(400).json({ error: 'ID de usuário e senha são obrigatórios' });
    }

    const [rows] = await pool.query(
      'SELECT id, is_admin FROM usuarios WHERE id = ? AND senha = ? LIMIT 1',
      [usuarioId, senha]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!rows[0].is_admin) {
      return res.status(403).json({ error: 'Permissão administrativa necessária' });
    }

    return res.json({ success: true, is_admin: Boolean(rows[0].is_admin) });
  } catch (error) {
    console.error('Erro ao validar credenciais:', error.message);
    return res.status(500).json({ error: 'Erro interno ao validar credenciais' });
  }
});

// GET - Verificar token e retornar usuário
router.get('/admin/me', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, nome: req.user.nome, is_admin: req.user.is_admin });
});

// GET - Listar todos os usuários internos (admin somente)
router.get('/admin/usuarios', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, cpf, is_admin FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar usuários internos:', error.message);
    res.status(500).json({ error: 'Erro interno ao listar usuários' });
  }
});

// PUT - Atualizar usuário interno (admin somente)
router.put('/admin/usuarios/:id', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const { nome, cpf, is_admin } = req.body;
    const updates = [];
    const params = [];

    if (nome != null) {
      updates.push('nome = ?');
      params.push(nome);
    }
    if (cpf != null) {
      updates.push('cpf = ?');
      params.push(cpf);
    }
    if (typeof is_admin === 'boolean') {
      updates.push('is_admin = ?');
      params.push(is_admin ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(req.params.id);
    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const [rows] = await pool.query('SELECT id, nome, cpf, is_admin FROM usuarios WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário interno:', error.message);
    res.status(500).json({ error: 'Erro interno ao atualizar usuário' });
  }
});

// PUT - Redefinir senha de usuário interno (admin somente)
router.put('/admin/usuarios/:id/senha', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const { senha } = req.body;
    if (!senha) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    const [result] = await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senha, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha de usuário:', error.message);
    res.status(500).json({ error: 'Erro interno ao redefinir senha' });
  }
});

// DELETE - Remover usuário interno (admin somente)
router.delete('/admin/usuarios/:id', authenticateToken, ensureAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ success: true, message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário interno:', error.message);
    res.status(500).json({ error: 'Erro interno ao remover usuário' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.ensureAdmin = ensureAdmin;
