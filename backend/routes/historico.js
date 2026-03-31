const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todo o histórico de animais
router.get('/historico-animal', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM historico_animal ORDER BY data_evento DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter histórico por ID
router.get('/historico-animal/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM historico_animal WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Histórico por animal ID
router.get('/historico-animal/animal/:animal_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM historico_animal WHERE animal_id = ? ORDER BY data_evento DESC',
      [req.params.animal_id]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico do animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo registro no histórico
router.post('/historico-animal', async (req, res) => {
  try {
    const { animal_id, tipo_evento, descricao, usuario_id } = req.body;
    const id = require('crypto').randomBytes(6).toString('hex');
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO historico_animal (id, animal_id, tipo_evento, descricao, usuario_id, data_evento) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, animal_id, tipo_evento, descricao, usuario_id]
    );
    connection.release();
    res.status(201).json({ id, ...req.body, data_evento: new Date() });
  } catch (error) {
    console.error('Erro ao criar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar registro no histórico
router.put('/historico-animal/:id', async (req, res) => {
  try {
    const { animal_id, tipo_evento, descricao, usuario_id } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE historico_animal SET animal_id = ?, tipo_evento = ?, descricao = ?, usuario_id = ? WHERE id = ?',
      [animal_id, tipo_evento, descricao, usuario_id, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar registro no histórico
router.delete('/historico-animal/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM historico_animal WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Histórico deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
