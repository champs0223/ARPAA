const express = require('express');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todos os tratamentos
router.get('/tratamentos', async (req, res) => {
  try {
    const rows = getAll('tratamentos');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar tratamentos:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter tratamento por ID
router.get('/tratamentos/:id', async (req, res) => {
  try {
    const tratamento = getById('tratamentos', req.params.id);
    if (!tratamento) {
      return res.status(404).json({ error: 'Tratamento não encontrado' });
    }
    res.json(tratamento);
  } catch (error) {
    console.error('Erro ao buscar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo tratamento
router.post('/tratamentos', async (req, res) => {
  try {
    const { animal_id, tipo_tratamento, data_inicio, data_termino, descricao, veterinario_id } = req.body;
    const tratamento = insertItem('tratamentos', { animal_id, tipo_tratamento, data_inicio, data_termino, descricao, veterinario_id });
    res.status(201).json(tratamento);
  } catch (error) {
    console.error('Erro ao criar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar tratamento
router.put('/tratamentos/:id', async (req, res) => {
  try {
    const { animal_id, tipo_tratamento, data_inicio, data_termino, descricao, veterinario_id } = req.body;
    const updated = updateItem('tratamentos', req.params.id, { animal_id, tipo_tratamento, data_inicio, data_termino, descricao, veterinario_id });
    if (!updated) {
      return res.status(404).json({ error: 'Tratamento não encontrado' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar tratamento
router.delete('/tratamentos/:id', async (req, res) => {
  try {
    const deleted = deleteById('tratamentos', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tratamento não encontrado' });
    }
    res.json({ message: 'Tratamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tratamento:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
