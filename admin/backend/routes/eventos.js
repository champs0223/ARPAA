const express = require('express');
const { pool } = require('../db/connection');
const auth = require('./auth');
const router = express.Router();

// GET - Listar todos os eventos (público)
router.get('/public/eventos', async (req, res) => {
  try {
    const [eventos] = await pool.query(
      'SELECT id, nome, data, horario, local, descricao FROM eventos ORDER BY data ASC'
    );
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// GET - Listar eventos do admin
router.get('/admin/eventos', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  try {
    const [eventos] = await pool.query(
      'SELECT id, nome, data, horario, local, descricao FROM eventos ORDER BY data ASC'
    );
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// POST - Criar novo evento
router.post('/admin/eventos', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  const { nome, data, local, endereco, horario, descricao } = req.body;

  if (!nome || !data || !local) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO eventos (nome, data, horario, local, endereco, descricao) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, data, horario || null, local, endereco || null, descricao || null]
    );

    res.status(201).json({ 
      id: result.insertId, 
      nome, 
      data, 
      horario, 
      local, 
      endereco, 
      descricao 
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});
// PUT - Atualizar evento
router.put('/admin/eventos/:id', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, data, local, endereco, horario, descricao } = req.body;

  if (!nome || !data || !local) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE eventos SET nome = ?, data = ?, horario = ?, local = ?, endereco = ?, descricao = ? WHERE id = ?',
      [nome, data, horario || null, local, endereco || null, descricao || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({ 
      id: parseInt(id), 
      nome, 
      data, 
      horario, 
      local, 
      endereco, 
      descricao 
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE - Remover evento
router.delete('/admin/eventos/:id', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM eventos WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

module.exports = router;