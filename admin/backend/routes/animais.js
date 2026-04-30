const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar todos os animais SEM fotos (otimizado para listagens)
router.get('/animais-simples', async (req, res) => {
  try {
    const rows = getAll('animais');
    // Remover fotos base64 para reduzir tamanho da resposta
    const animaisSimples = rows.map(animal => ({
      id: animal.id,
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca,
      sexo: animal.sexo,
      idade_aproximada: animal.idade_aproximada,
      porte: animal.porte,
      data_resgate: animal.data_resgate,
      status: animal.status,
      descricao: animal.descricao,
      registrado_por: animal.registrado_por,
      created_at: animal.created_at,
      updated_at: animal.updated_at,
      // foto_base64 intencionalmenteosmitida
    }));
    res.json(animaisSimples);
  } catch (error) {
    console.error('Erro ao listar animais simples:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Listar todos os animais
router.get('/animais', async (req, res) => {
  try {
    const rows = getAll('animais');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar animais:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter animal por ID
router.get('/animais/:id', async (req, res) => {
  try {
    const animal = getById('animais', req.params.id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Erro ao buscar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET - Rota especial: Animais com informações do usuário
router.get('/animais-com-usuario', async (req, res) => {
  try {
    const animais = getAll('animais');
    const usuarios = getAll('usuarios');

    const rows = animais
      .map((animal) => ({
        ...animal,
        nome_usuario: usuarios.find((u) => String(u.id) === String(animal.registrado_por))?.nome || null
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar animais com usuário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo animal (com foto em base64)
router.post('/animais', upload.single('foto'), async (req, res) => {
  try {
<<<<<<< HEAD
    let foto_base64 = null;

    if (req.file) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        foto_base64 = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('Erro ao processar arquivo:', fileError);
        return res.status(500).json({ error: 'Erro ao processar foto' });
      }
    }

    const { nome, especie, raca, sexo, idade_aproximada, porte, data_resgate, status, descricao, registrado_por } = req.body;

    const animal = insertItem('animais', {
      nome,
      especie,
      raca,
      sexo: sexo || 'desconhecido',
      idade_aproximada,
      porte: porte || 'desconhecido',
      data_resgate,
      status: status || 'resgatado',
      descricao,
      foto_base64,
      registrado_por
    });

    res.status(201).json(animal);
=======
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
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710
  } catch (error) {
    console.error('Erro ao criar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar animal
router.put('/animais/:id', upload.single('foto'), async (req, res) => {
  try {
<<<<<<< HEAD
    let foto_base64 = req.body.foto_base64 || null;

    if (req.file) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        foto_base64 = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('Erro ao processar arquivo:', fileError);
        return res.status(500).json({ error: 'Erro ao processar foto' });
      }
    }

    const { nome, especie, raca, sexo, idade_aproximada, porte, data_resgate, status, descricao, registrado_por } = req.body;
    const updated = updateItem('animais', req.params.id, {
      nome,
      especie,
      raca,
      sexo: sexo || 'desconhecido',
      idade_aproximada,
      porte: porte || 'desconhecido',
      data_resgate,
      status: status || 'resgatado',
      descricao,
      foto_base64,
      registrado_por
    });

    if (!updated) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    res.json(updated);
=======
    const { nome, especie, raca, sexo, idade_aproximada, porte, data_resgate, local_resgate, status, descricao, foto_url, registrado_por, vacinado, castrado, vermifugado, temperamento, convive_criancas, convive_animais } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE animais SET nome = ?, especie = ?, raca = ?, sexo = ?, idade_aproximada = ?, porte = ?, data_resgate = ?, local_resgate = ?, status = ?, descricao = ?, foto_url = ?, registrado_por = ?, vacinado = ?, castrado = ?, vermifugado = ?, temperamento = ?, convive_criancas = ?, convive_animais = ? WHERE id = ?',
      [nome, especie, raca, sexo || 'desconhecido', idade_aproximada, porte || 'desconhecido', data_resgate, local_resgate, status || 'resgatado', descricao, foto_url, registrado_por, vacinado || '', castrado || '', vermifugado || '', temperamento || '', convive_criancas || '', convive_animais || '', req.params.id]
    );
    connection.release();
    res.json({ id: req.params.id, ...req.body });
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710
  } catch (error) {
    console.error('Erro ao atualizar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar animal
router.delete('/animais/:id', async (req, res) => {
  try {
    const deleted = deleteById('animais', req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    res.json({ message: 'Animal deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
