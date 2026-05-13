const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// POST - Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, nome, cpf, senha FROM usuarios WHERE LOWER(nome) = LOWER(?) OR cpf = ? LIMIT 1',
      [usuario, usuario]
    );
    connection.release();

    const user = rows[0];

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
      'INSERT INTO usuarios (nome, cpf, senha) VALUES (?, ?, ?)',
      [usuario, cpf, senha]
    );
    connection.release();

    res.status(201).json({
      success: true,
      id: result.insertId,
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
