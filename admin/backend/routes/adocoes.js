const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todas as adoções
router.get('/adocoes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM adocoes');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar adoções:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter adoção por ID
router.get('/adocoes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM adocoes WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adoção não encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova adoção
router.post('/adocoes', async (req, res) => {
  try {
    const { animal_id, adotante_id, data_adocao, status } = req.body;
    const id = require('crypto').randomBytes(6).toString('hex');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO adocoes (id, animal_id, adotante_id, data_adocao, status) VALUES (?, ?, ?, ?, ?)',
      [id, animal_id, adotante_id, data_adocao, status]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    console.error('Erro ao criar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar adoção
router.put('/adocoes/:id', async (req, res) => {
  try {
    const { animal_id, adotante_id, data_adocao, status } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE adocoes SET animal_id = ?, adotante_id = ?, data_adocao = ?, status = ? WHERE id = ?',
      [animal_id, adotante_id, data_adocao, status, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar adoção
router.delete('/adocoes/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM adocoes WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Adoção deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
