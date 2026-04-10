const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

// GET - Listar todos os animais
router.get('/animais', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM animais');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar animais:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter animal por ID
router.get('/animais/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM animais WHERE id = ?', [req.params.id]);
    connection.release();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Rota especial: Animais com informações do usuário
router.get('/animais-com-usuario', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT a.*, u.nome as nome_usuario
      FROM animais a
      LEFT JOIN usuarios u ON a.registrado_por = u.id
      ORDER BY a.created_at DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar animais com usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo animal
router.post('/animais', async (req, res) => {
  try {
    const { nome, especie, raca, sexo, idade_aproximada, porte, data_resgate, local_resgate, status, descricao, foto_url, registrado_por, vacinado, castrado, vermifugado, temperamento, convive_criancas, convive_animais } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO animais (nome, especie, raca, sexo, idade_aproximada, porte, data_resgate, local_resgate, status, descricao, foto_url, registrado_por, vacinado, castrado, vermifugado, temperamento, convive_criancas, convive_animais, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [nome, especie, raca, sexo || 'desconhecido', idade_aproximada, porte || 'desconhecido', data_resgate, local_resgate, status || 'resgatado', descricao, foto_url, registrado_por, vacinado || '', castrado || '', vermifugado || '', temperamento || '', convive_criancas || '', convive_animais || '']
    );
    
    // Buscar o animal criado
    const [newAnimal] = await connection.query('SELECT * FROM animais WHERE id = ?', [result.insertId]);
    connection.release();
    
    res.status(201).json(newAnimal[0] || { message: 'Animal criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar animal
router.put('/animais/:id', async (req, res) => {
  try {
    const { nome, especie, raca, sexo, idade_aproximada, porte, data_resgate, local_resgate, status, descricao, foto_url, registrado_por, vacinado, castrado, vermifugado, temperamento, convive_criancas, convive_animais } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE animais SET nome = ?, especie = ?, raca = ?, sexo = ?, idade_aproximada = ?, porte = ?, data_resgate = ?, local_resgate = ?, status = ?, descricao = ?, foto_url = ?, registrado_por = ?, vacinado = ?, castrado = ?, vermifugado = ?, temperamento = ?, convive_criancas = ?, convive_animais = ? WHERE id = ?',
      [nome, especie, raca, sexo || 'desconhecido', idade_aproximada, porte || 'desconhecido', data_resgate, local_resgate, status || 'resgatado', descricao, foto_url, registrado_por, vacinado || '', castrado || '', vermifugado || '', temperamento || '', convive_criancas || '', convive_animais || '', req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Erro ao atualizar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar animal
router.delete('/animais/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM animais WHERE id = ?', [req.params.id]);
    connection.release();
    res.json({ message: 'Animal deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
