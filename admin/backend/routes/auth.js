const express = require('express');
const router = express.Router();
const { findOne, insertItem } = require('../db/localdb');

// POST - Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

<<<<<<< HEAD
    const user = findOne('usuarios', (u) => String(u.nome) === String(usuario));
=======
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, nome, cpf, senha FROM usuarios WHERE nome = ?',
      [usuario]
    );
    connection.release();
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710

    if (!user || user.senha !== senha) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    res.json({
      success: true,
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Registrar novo usuário
router.post('/registro', async (req, res) => {
  try {
    const { usuario, senha, cpf } = req.body;

    if (!usuario || !senha || !cpf) {
      return res.status(400).json({ error: 'Usuário, senha e CPF são obrigatórios' });
    }

    const exists = findOne('usuarios', (u) => String(u.nome) === String(usuario));

<<<<<<< HEAD
    if (exists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const newUser = insertItem('usuarios', {
      nome: usuario,
      senha,
      is_admin: 0,
      created_at: new Date().toISOString()
    });
=======
    // Verificar se usuário já existe
    const [exists] = await connection.query(
      'SELECT id FROM usuarios WHERE nome = ? OR cpf = ?',
      [usuario, cpf]
    );

    if (exists.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Usuário ou CPF já existe' });
    }

    // Criar novo usuário
    const [result] = await connection.query(
      'INSERT INTO usuarios (nome, cpf, senha) VALUES (?, ?, ?)',
      [usuario, cpf, senha]
    );

    connection.release();
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710

    res.status(201).json({
      success: true,
      id: newUser.id,
      usuario,
      cpf,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Verificar se está logado
router.get('/verificar-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
