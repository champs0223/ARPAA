const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todos os adotantes
router.get('/adotantes', async (req, res) => {
  try {
    const rows = getAll('adotantes');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar adotantes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter adotante por ID
router.get('/adotantes/:id', async (req, res) => {
  try {
    const adotante = getById('adotantes', req.params.id);
    if (!adotante) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }
    res.json(adotante);
  } catch (error) {
    console.error('Erro ao buscar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo adotante
router.post('/adotantes', async (req, res) => {
  try {
    const { nome, email, telefone, endereco, cidade, estado, cpf } = req.body;
    const id = crypto.randomBytes(6).toString('hex');
    const adotante = insertItem('adotantes', { id, nome, email, telefone, endereco, cidade, estado, cpf });
    res.status(201).json(adotante);
  } catch (error) {
    console.error('Erro ao criar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar adotante
router.put('/adotantes/:id', async (req, res) => {
  try {
    const { nome, email, telefone, endereco, cidade, estado, cpf } = req.body;
    const updated = updateItem('adotantes', req.params.id, { nome, email, telefone, endereco, cidade, estado, cpf });
    if (!updated) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar adotante
router.delete('/adotantes/:id', async (req, res) => {
  try {
    const deleted = deleteById('adotantes', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }
    res.json({ message: 'Adotante deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
