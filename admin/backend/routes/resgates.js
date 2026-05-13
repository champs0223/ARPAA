const express = require('express');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todos os resgates
router.get('/resgates', async (req, res) => {
  try {
    const rows = getAll('resgates');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar resgates:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter resgate por ID
router.get('/resgates/:id', async (req, res) => {
  try {
    const resgate = getById('resgates', req.params.id);
    if (!resgate) {
      return res.status(404).json({ error: 'Resgate não encontrado' });
    }
    res.json(resgate);
  } catch (error) {
    console.error('Erro ao buscar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo resgate
router.post('/resgates', async (req, res) => {
  try {
    const { animal_id, local_resgate, data_resgate, descricao, resgatado_por } = req.body;
    const resgate = insertItem('resgates', { animal_id, local_resgate, data_resgate, descricao, resgatado_por });
    res.status(201).json(resgate);
  } catch (error) {
    console.error('Erro ao criar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar resgate
router.put('/resgates/:id', async (req, res) => {
  try {
    const { animal_id, local_resgate, data_resgate, descricao, resgatado_por } = req.body;
    const updated = updateItem('resgates', req.params.id, { animal_id, local_resgate, data_resgate, descricao, resgatado_por });
    if (!updated) {
      return res.status(404).json({ error: 'Resgate não encontrado' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar resgate
router.delete('/resgates/:id', async (req, res) => {
  try {
    const deleted = deleteById('resgates', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Resgate não encontrado' });
    }
    res.json({ message: 'Resgate deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar resgate:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
