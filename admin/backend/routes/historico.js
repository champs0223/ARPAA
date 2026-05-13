const express = require('express');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById, filterItems } = require('../db/localdb');

// GET - Listar todo o histórico de animais
router.get('/historico-animal', async (req, res) => {
  try {
    const rows = getAll('historico_animal').sort((a, b) => new Date(b.data_evento) - new Date(a.data_evento));
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter histórico por ID
router.get('/historico-animal/:id', async (req, res) => {
  try {
    const registro = getById('historico_animal', req.params.id);
    if (!registro) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    res.json(registro);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Histórico por animal ID
router.get('/historico-animal/animal/:animal_id', async (req, res) => {
  try {
    const rows = filterItems('historico_animal', (item) => String(item.animal_id) === String(req.params.animal_id))
      .sort((a, b) => new Date(b.data_evento) - new Date(a.data_evento));
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
    const registro = insertItem('historico_animal', {
      animal_id,
      tipo_evento,
      descricao,
      usuario_id,
      data_evento: new Date().toISOString()
    });
    res.status(201).json(registro);
  } catch (error) {
    console.error('Erro ao criar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar registro no histórico
router.put('/historico-animal/:id', async (req, res) => {
  try {
    const { animal_id, tipo_evento, descricao, usuario_id } = req.body;
    const updated = updateItem('historico_animal', req.params.id, {
      animal_id,
      tipo_evento,
      descricao,
      usuario_id
    });
    if (!updated) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar registro no histórico
router.delete('/historico-animal/:id', async (req, res) => {
  try {
    const deleted = deleteById('historico_animal', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    res.json({ message: 'Histórico deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar histórico:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
