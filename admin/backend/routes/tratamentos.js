const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todos os tratamentos
router.get('/tratamentos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM tratamentos');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar tratamentos:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter tratamento por ID
router.get('/tratamentos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM tratamentos WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tratamento não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo tratamento
router.post('/tratamentos', async (req, res) => {
  try {
    const { animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id } = req.body;
    const id = require('crypto').randomBytes(6).toString('hex');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO tratamentos (id, animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    console.error('Erro ao criar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar tratamento
router.put('/tratamentos/:id', async (req, res) => {
  try {
    const { animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE tratamentos SET animal_id = ?, tipo_tratamento = ?, data_inicio = ?, data_termino = ?, veterinario_id = ? WHERE id = ?',
      [animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar tratamento
router.delete('/tratamentos/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM tratamentos WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Tratamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
