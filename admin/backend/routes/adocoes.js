const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todas as adoções
router.get('/adocoes', async (req, res) => {
  try {
    const rows = getAll('adocoes');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar adoções:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter adoção por ID
router.get('/adocoes/:id', async (req, res) => {
  try {
    const adocao = getById('adocoes', req.params.id);
    if (!adocao) {
      return res.status(404).json({ error: 'Adoção não encontrada' });
    }
    res.json(adocao);
  } catch (error) {
    console.error('Erro ao buscar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova adoção
router.post('/adocoes', async (req, res) => {
  try {
    const { animal_id, adotante_id, data_adocao, status } = req.body;
    const id = crypto.randomBytes(6).toString('hex');
    const adocao = insertItem('adocoes', { id, animal_id, adotante_id, data_adocao, status });
    res.status(201).json(adocao);
  } catch (error) {
    console.error('Erro ao criar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar adoção
router.put('/adocoes/:id', async (req, res) => {
  try {
    const { animal_id, adotante_id, data_adocao, status } = req.body;
    const updated = updateItem('adocoes', req.params.id, { animal_id, adotante_id, data_adocao, status });
    if (!updated) {
      return res.status(404).json({ error: 'Adoção não encontrada' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar adoção
router.delete('/adocoes/:id', async (req, res) => {
  try {
    const deleted = deleteById('adocoes', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Adoção não encontrada' });
    }
    res.json({ message: 'Adoção deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
