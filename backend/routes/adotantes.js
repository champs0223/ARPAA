const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todos os adotantes
router.get('/adotantes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM adotantes');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar adotantes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter adotante por ID
router.get('/adotantes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM adotantes WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo adotante
router.post('/adotantes', async (req, res) => {
  try {
    const { nome, email, telefone, endereco, cidade, estado, cpf } = req.body;
    const id = require('crypto').randomBytes(6).toString('hex');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO adotantes (id, nome, email, telefone, endereco, cidade, estado, cpf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nome, email, telefone, endereco, cidade, estado, cpf]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    console.error('Erro ao criar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar adotante
router.put('/adotantes/:id', async (req, res) => {
  try {
    const { nome, email, telefone, endereco, cidade, estado, cpf } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE adotantes SET nome = ?, email = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cpf = ? WHERE id = ?',
      [nome, email, telefone, endereco, cidade, estado, cpf, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar adotante
router.delete('/adotantes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM adotantes WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Adotante deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
