const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// Verificar se estamos em produção (Railway)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

console.log('🌍 Ambiente:', isProduction ? 'PRODUÇÃO (Cloudinary)' : 'DESENVOLVIMENTO (Local)');

// Configuração baseada no ambiente
let upload;

if (isProduction) {
  // Em produção: usar Cloudinary
  upload = multer({
    storage: multer.memoryStorage(), // Armazenar em memória para enviar ao Cloudinary
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB max
    }
  });
} else {
  // Em desenvolvimento: usar storage local
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const randomString = Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      cb(null, `${name}-${timestamp}-${randomString}${ext}`);
    }
  });

  upload = multer({
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
      fileSize: 5 * 1024 * 1024 // 5MB max
    }
  });
}

// POST - Upload de foto
router.post('/upload', upload.single('foto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    let fotoUrl;

    if (isProduction) {
      // Upload para Cloudinary
      console.log('📤 Enviando foto para Cloudinary...');

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'arpaa-animais',
            public_id: `animal-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
            transformation: [
              { width: 800, height: 600, crop: 'limit' }, // Otimizar tamanho
              { quality: 'auto' } // Otimizar qualidade
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      fotoUrl = result.secure_url;
      console.log('✅ Foto enviada para Cloudinary:', fotoUrl);

    } else {
      // Desenvolvimento: usar URL local
      fotoUrl = `/uploads/${req.file.filename}`;
      console.log('💾 Foto salva localmente:', fotoUrl);
    }

    res.json({
      success: true,
      message: 'Foto enviada com sucesso',
      foto_url: fotoUrl,
      filename: req.file.filename || 'cloudinary-file'
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error.message);
    res.status(500).json({
      error: error.message || 'Erro ao fazer upload da foto',
      details: isProduction ? 'Verifique as configurações do Cloudinary' : 'Erro no storage local'
    });
  }
});

module.exports = router;
