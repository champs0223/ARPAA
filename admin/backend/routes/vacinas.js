const express = require('express');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todas as vacinas
router.get('/vacinas', async (req, res) => {
  try {
    const rows = getAll('vacinas');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar vacinas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter vacina por ID
router.get('/vacinas/:id', async (req, res) => {
  try {
    const vacina = getById('vacinas', req.params.id);
    if (!vacina) {
      return res.status(404).json({ error: 'Vacina não encontrada' });
    }
    res.json(vacina);
  } catch (error) {
    console.error('Erro ao buscar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova vacina
router.post('/vacinas', async (req, res) => {
  try {
    const { animal_id, nome_vacina, data_aplicacao, validade, lote, fabricante, veterinario_id } = req.body;
    const vacina = insertItem('vacinas', { animal_id, nome_vacina, data_aplicacao, validade, lote, fabricante, veterinario_id });
    res.status(201).json(vacina);
  } catch (error) {
    console.error('Erro ao criar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar vacina
router.put('/vacinas/:id', async (req, res) => {
  try {
    const { animal_id, nome_vacina, data_aplicacao, validade, lote, fabricante, veterinario_id } = req.body;
    const updated = updateItem('vacinas', req.params.id, { animal_id, nome_vacina, data_aplicacao, validade, lote, fabricante, veterinario_id });
    if (!updated) {
      return res.status(404).json({ error: 'Vacina não encontrada' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar vacina
router.delete('/vacinas/:id', async (req, res) => {
  try {
    const deleted = deleteById('vacinas', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Vacina não encontrada' });
    }
    res.json({ message: 'Vacina deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vacina:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
