const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todos os resgates
router.get('/resgates', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM resgates');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar resgates:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter resgate por ID
router.get('/resgates/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM resgates WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Resgate não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo resgate
router.post('/resgates', async (req, res) => {
  try {
    const { animal_id, local_resgate, data_resgate, responsavel_id } = req.body;
    const id = require('crypto').randomBytes(6).toString('hex');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO resgates (id, animal_id, local_resgate, data_resgate, responsavel_id) VALUES (?, ?, ?, ?, ?)',
      [id, animal_id, local_resgate, data_resgate, responsavel_id]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    console.error('Erro ao criar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar resgate
router.put('/resgates/:id', async (req, res) => {
  try {
    const { animal_id, local_resgate, data_resgate, responsavel_id } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE resgates SET animal_id = ?, local_resgate = ?, data_resgate = ?, responsavel_id = ? WHERE id = ?',
      [animal_id, local_resgate, data_resgate, responsavel_id, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar resgate
router.delete('/resgates/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM resgates WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Resgate deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
