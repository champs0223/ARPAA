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

    const user = findOne('usuarios', (u) => String(u.nome) === String(usuario));

    if (!user || user.senha !== senha) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    res.json({
      success: true,
      id: user.id,
      nome: user.nome,
      is_admin: user.is_admin,
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
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const exists = findOne('usuarios', (u) => String(u.nome) === String(usuario));

    if (exists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const newUser = insertItem('usuarios', {
      nome: usuario,
      senha,
      is_admin: 0,
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      id: newUser.id,
      usuario,
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
