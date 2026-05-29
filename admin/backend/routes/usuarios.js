const express = require('express');
const router = express.Router();
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todos os usuários
router.get('/usuarios', async (req, res) => {
  try {
    const rows = getAll('usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter usuário por ID
router.get('/usuarios/:id', async (req, res) => {
  try {
    const user = getById('usuarios', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo usuário
router.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, telefone, tipo } = req.body;
    const user = insertItem('usuarios', { nome, email, telefone, tipo });
    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar usuário
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { nome, email, telefone, tipo, cpf, is_admin } = req.body;
    const updated = updateItem('usuarios', req.params.id, { nome, email, telefone, tipo, cpf, is_admin });
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Redefinir senha do usuário
router.put('/usuarios/:id/senha', async (req, res) => {
  try {
    const { senha } = req.body;
    if (!senha) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    const user = getById('usuarios', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updated = updateItem('usuarios', req.params.id, { senha });
    res.json({ success: true, message: 'Senha redefinida com sucesso', user: updated });
  } catch (error) {
    console.error('Erro ao redefinir senha do usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar usuário
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const deleted = deleteById('usuarios', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
