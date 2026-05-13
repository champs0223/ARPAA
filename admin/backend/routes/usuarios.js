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
<<<<<<< HEAD
    const { nome, email, telefone, tipo } = req.body;
    const user = insertItem('usuarios', { nome, email, telefone, tipo });
    res.status(201).json(user);
=======
    const { nome, cpf, senha } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO usuarios (nome, cpf, senha) VALUES (?, ?, ?)',
      [nome, cpf, senha]
    );
    connection.release();
    res.status(201).json({ id: result.insertId, nome, cpf });
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar usuário
router.put('/usuarios/:id', async (req, res) => {
  try {
<<<<<<< HEAD
    const { nome, email, telefone, tipo } = req.body;
    const updated = updateItem('usuarios', req.params.id, { nome, email, telefone, tipo });
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(updated);
=======
    const { nome, cpf, senha } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE usuarios SET nome = ?, cpf = ?, senha = ? WHERE id = ?',
      [nome, cpf, senha, req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, nome, cpf });
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error.message);
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
