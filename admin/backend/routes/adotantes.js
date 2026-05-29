const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../db/connection');
const auth = require('./auth');

function adaptAdotanteRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    endereco: row.endereco,
    complemento: row.complemento,
    cidade: row.cidade,
    estado: row.estado,
    cpf: row.cpf,
    idade: row.idade,
    trabalha: row.tem_trabalha || row.trabalha || row.trabalha || '',
    criancas: row.tem_criancas || row.criancas || '',
    pets: row.tem_pets || row.pets || '',
    quintal: row.tem_quintal || row.quintal || '',
    observacoes: row.observacoes || ''
  };
}

// GET - Listar todos os adotantes
router.get('/adotantes', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM adotantes ORDER BY nome ASC');
    res.json(rows.map(adaptAdotanteRow));
  } catch (error) {
    console.error('Erro ao listar adotantes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter adotante por ID
router.get('/adotantes/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM adotantes WHERE id = ?', [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }
    res.json(adaptAdotanteRow(rows[0]));
  } catch (error) {
    console.error('Erro ao buscar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo adotante
router.post('/adotantes', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      endereco,
      complemento,
      cidade,
      estado,
      cpf,
      idade,
      trabalha,
      criancas,
      pets,
      quintal,
      observacoes
    } = req.body;

    const id = crypto.randomBytes(6).toString('hex').toUpperCase();
    await pool.execute(
      `INSERT INTO adotantes (
        id, nome, email, telefone, endereco, complemento, cidade, estado,
        cpf, idade, tem_trabalha, tem_criancas, tem_pets, tem_quintal, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        nome,
        email,
        telefone,
        endereco,
        complemento,
        cidade,
        estado,
        cpf,
        idade || null,
        trabalha || '',
        criancas || '',
        pets || '',
        quintal || '',
        observacoes || ''
      ]
    );

    const [rows] = await pool.execute('SELECT * FROM adotantes WHERE id = ?', [id]);
    res.status(201).json(adaptAdotanteRow(rows[0]));
  } catch (error) {
    console.error('Erro ao criar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Registrar adotante manualmente a partir do modal de adoção (MySQL)
router.post('/admin/adotantes', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  const {
    nome,
    endereco,
    email,
    telefone,
    complemento,
    cidade,
    estado,
    cpf,
    idade,
    trabalha,
    criancas,
    pets,
    quintal,
    observacoes
  } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e E-mail são obrigatórios para registrar o adotante' });
  }

  try {
    const idUnico = crypto.randomBytes(6).toString('hex').toUpperCase();
    const query = `INSERT INTO adotantes
      (id, nome, endereco, email, telefone, complemento, cidade, estado, cpf, idade,
       tem_trabalha, tem_criancas, tem_pets, tem_quintal, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await pool.execute(query, [
      idUnico,
      nome,
      endereco,
      email,
      telefone,
      complemento || '',
      cidade || '',
      estado || '',
      cpf || null,
      idade || null,
      trabalha || '',
      criancas || '',
      pets || '',
      quintal || '',
      observacoes || ''
    ]);

    return res.status(201).json({ message: 'Adotante registrado com sucesso no MySQL!' });
  } catch (error) {
    console.error('❌ Erro no backend ao registrar adotante via modal:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar adotante no banco' });
  }
});

// PUT - Atualizar adotante
router.put('/adotantes/:id', async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      endereco,
      complemento,
      cidade,
      estado,
      cpf,
      idade,
      trabalha,
      criancas,
      pets,
      quintal,
      observacoes
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE adotantes SET
        nome = ?, email = ?, telefone = ?, endereco = ?, complemento = ?, cidade = ?, estado = ?,
        cpf = ?, idade = ?, tem_trabalha = ?, tem_criancas = ?, tem_pets = ?, tem_quintal = ?, observacoes = ?
      WHERE id = ?`,
      [
        nome,
        email,
        telefone,
        endereco,
        complemento || '',
        cidade || '',
        estado || '',
        cpf || null,
        idade || null,
        trabalha || '',
        criancas || '',
        pets || '',
        quintal || '',
        observacoes || '',
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }

    const [rows] = await pool.execute('SELECT * FROM adotantes WHERE id = ?', [req.params.id]);
    res.json(adaptAdotanteRow(rows[0]));
  } catch (error) {
    console.error('Erro ao atualizar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar adotante
router.delete('/adotantes/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM adotantes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Adotante não encontrado' });
    }
    res.json({ message: 'Adotante deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar adotante:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
