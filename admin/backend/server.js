const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. CONFIGURAÇÃO DE CORS (Deve ser a primeira coisa!)
app.use(cors({
  origin: true, // Permite qualquer origem (inclusive GitHub Codespaces)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// 2. MIDDLEWARE MANUAL PARA GARANTIR CABEÇALHOS (Segunda camada de proteção)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Debug: show environment
console.log('=== SERVER INITIALIZATION ===');
console.log('DATABASE_TYPE: Local JSON storage');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('============================');

// Importar conexão local e inicialização
const { testConnection } = require('./db/localdb');
const { initDatabase } = require('./db/init');

// Importar rotas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const animaisRoutes = require('./routes/animais');
const adotantesRoutes = require('./routes/adotantes');
const adocoesRoutes = require('./routes/adocoes');
const resgatesesRoutes = require('./routes/resgates');
const tratamentosRoutes = require('./routes/tratamentos');
const vacinasRoutes = require('./routes/vacinas');
const historicoRoutes = require('./routes/historico');

// Middlewares de Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para upload de arquivos
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Pasta temporária para uploads
app.use('/uploads', express.static('uploads')); // Servir arquivos estáticos da pasta uploads

// Servir páginas estáticas do admin e do site quando necessário
app.use('/admin', express.static(path.join(__dirname, '..')));
app.use('/site', express.static(path.join(__dirname, '../../public')));

// Redirecionamento para a página de login administrativa
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'ARPAA Backend'
  });
});

// Redirecionar a raiz para o site público com barra final
app.get('/', (req, res) => {
  res.redirect('/site/');
});

// Garantir que /site sem barra final redirecione para /site/
app.get('/site', (req, res) => {
  res.redirect('/site/');
});

// Rotas da API
app.use('/', authRoutes);
app.use('/', usuariosRoutes);
app.use('/', animaisRoutes);
app.use('/', adotantesRoutes);
app.use('/', adocoesRoutes);
app.use('/', resgatesesRoutes);
app.use('/', tratamentosRoutes);
app.use('/', vacinasRoutes);
app.use('/', historicoRoutes);

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    try {
      const connected = await testConnection();
      if (connected) {
        console.log('✓ Banco de dados conectado com sucesso');
        
        // Inicializar tabelas se necessário
        await initDatabase();
      } else {
        console.warn('⚠ Aviso: Não foi possível conectar ao banco de dados');
      }
    } catch (dbError) {
      console.warn('⚠ Aviso de DB:', dbError.message);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✓ Servidor ARPAA rodando em http://0.0.0.0:${PORT}`);
      console.log(`✓ CORS configurado para aceitar requisições externas`);
      console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Banco de dados: Local JSON storage\n`);
    });
    
    server.on('error', (err) => {
      console.error('SERVER ERROR:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Erro CRÍTICO ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Tratar encerramento gracioso
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
