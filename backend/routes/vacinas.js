const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todas as vacinas
router.get('/vacinas', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM vacinas');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar vacinas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter vacina por ID
router.get('/vacinas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM vacinas WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vacina não encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova vacina
router.post('/vacinas', async (req, res) => {
  try {
    const { animal_id, nome_vacina, data_aplicacao, validade, veterinario_id } = req.body;
    const id = require('crypto').randomBytes(6).toString('hex');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO vacinas (id, animal_id, nome_vacina, data_aplicacao, validade, veterinario_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, animal_id, nome_vacina, data_aplicacao, validade, veterinario_id]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    console.error('Erro ao criar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar vacina
router.put('/vacinas/:id', async (req, res) => {
  try {
    const { animal_id, nome_vacina, data_aplicacao, validade, veterinario_id } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE vacinas SET animal_id = ?, nome_vacina = ?, data_aplicacao = ?, validade = ?, veterinario_id = ? WHERE id = ?',
      [animal_id, nome_vacina, data_aplicacao, validade, veterinario_id, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar vacina
router.delete('/vacinas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM vacinas WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Vacina deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
