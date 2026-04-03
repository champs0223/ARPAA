const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todos os usuários
router.get('/usuarios', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM usuarios');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter usuário por ID
router.get('/usuarios/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo usuário
router.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, telefone, tipo } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO usuarios (nome, email, telefone, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, telefone, tipo]
    );
    connection.release();
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar usuário
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { nome, email, telefone, tipo } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, tipo = ? WHERE id = ?',
      [nome, email, telefone, tipo, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar usuário
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
