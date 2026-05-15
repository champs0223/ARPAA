const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db/connection');
const { getAll, getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// ✨ CONFIGURAR MULTER PARA SALVAR ARQUIVOS LOCALMENTE EM /public/uploads/
const uploadDir = path.join(__dirname, '../../public/uploads');

// Criar pasta se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Pasta /public/uploads/ criada');
}

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único baseado em timestamp + random
    const timestamp = Date.now();
    const randomString = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${timestamp}-${randomString}${ext}`;
    cb(null, filename);
  }
});

// Configurar upload com validações
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

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
    const [rows] = await pool.query('SELECT * FROM animais');
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

// POST - Criar novo animal (salvar foto como arquivo local)
router.post('/animais', upload.single('foto'), async (req, res) => {
  try {
    let foto_url = req.body.foto_url || null;

    // ✨ NOVO: Salvar arquivo localmente em vez de Base64
    if (req.file) {
      // Usar a URL relativa do arquivo salvo
      foto_url = `/uploads/${req.file.filename}`;
      console.log(`✅ Imagem salva localmente: ${foto_url}`);
    }

    const {
      nome,
      especie,
      raca,
      sexo,
      idade_aproximada,
      porte,
      data_resgate,
      local_resgate,
      status,
      descricao,
      registrado_por,
      vacinado,
      castrado,
      vermifugado,
      temperamento,
      convive_criancas,
      convive_animais
    } = req.body;

    const query = `
      INSERT INTO animais (
        nome, especie, raca, sexo, idade_aproximada, porte, data_resgate,
        local_resgate, status, descricao, foto_url, registrado_por,
        vacinado, castrado, vermifugado, temperamento,
        convive_criancas, convive_animais
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      nome,
      especie,
      raca,
      sexo || 'desconhecido',
      idade_aproximada,
      porte || 'desconhecido',
      data_resgate || null,
      local_resgate || null,
      status || 'resgatado',
      descricao || null,
      foto_url,
      registrado_por || null,
      vacinado || '',
      castrado || '',
      vermifugado || '',
      temperamento || null,
      convive_criancas || '',
      convive_animais || ''
    ];

    const [result] = await pool.query(query, params);
    const [savedRows] = await pool.query('SELECT * FROM animais WHERE id = ?', [result.insertId]);

    res.status(201).json(savedRows[0] || { id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar animal:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar animal (salvar foto como arquivo local)
router.put('/animais/:id', upload.single('foto'), async (req, res) => {
  try {
    // Obter animal atual para manter foto anterior se não houver novo upload
    const [animalAtual] = await pool.query('SELECT foto_url FROM animais WHERE id = ?', [req.params.id]);
    let foto_url = animalAtual && animalAtual[0] ? animalAtual[0].foto_url : null;

    // ✨ NOVO: Salvar arquivo localmente em vez de Base64
    if (req.file) {
      // Se há uma foto anterior que era Base64, ela será substituída
      foto_url = `/uploads/${req.file.filename}`;
      console.log(`✅ Imagem atualizada localmente: ${foto_url}`);
    }

    const { 
      nome, 
      especie, 
      raca, 
      sexo, 
      idade_aproximada, 
      porte, 
      data_resgate, 
      local_resgate,
      status, 
      descricao, 
      registrado_por,
      vacinado,
      castrado,
      vermifugado,
      temperamento,
      convive_criancas,
      convive_animais
    } = req.body;

    const query = `
      UPDATE animais 
      SET nome = ?, especie = ?, raca = ?, sexo = ?, idade_aproximada = ?, 
          porte = ?, data_resgate = ?, local_resgate = ?, status = ?, 
          descricao = ?, foto_url = ?, registrado_por = ?,
          vacinado = ?, castrado = ?, vermifugado = ?, temperamento = ?,
          convive_criancas = ?, convive_animais = ?
      WHERE id = ?
    `;

    const params = [
      nome || null,
      especie || null,
      raca || null,
      sexo || 'desconhecido',
      idade_aproximada || null,
      porte || 'desconhecido',
      data_resgate || null,
      local_resgate || null,
      status || 'resgatado',
      descricao || null,
      foto_url,
      registrado_por || null,
      vacinado || '',
      castrado || '',
      vermifugado || '',
      temperamento || null,
      convive_criancas || '',
      convive_animais || '',
      req.params.id
    ];

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    const [updatedRows] = await pool.query('SELECT * FROM animais WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0] || { id: req.params.id });
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
