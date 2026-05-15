const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Debug: show environment
console.log('=== SERVER INITIALIZATION ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT || 3000);
console.log('============================');

const { pool, testConnection } = require('./db/connection');

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
const uploadRoutes = require('./routes/upload');
const eventosRoutes = require('./routes/eventos');
const solicitacoesRoutes = require('./routes/solicitacoes');

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'ARPAA Backend'
  });
});

// Rotas da API
app.use('/api', authRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', animaisRoutes);
app.use('/api', adotantesRoutes);
app.use('/api', adocoesRoutes);
app.use('/api', resgatesesRoutes);
app.use('/api', tratamentosRoutes);
app.use('/api', vacinasRoutes);
app.use('/api', historicoRoutes);
app.use('/api', uploadRoutes);
app.use('/api', eventosRoutes);
app.use('/api', solicitacoesRoutes);

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
    // Testar conexão com banco de dados (não é crítica para iniciar)
    try {
      const connected = await testConnection();
      if (connected) {
        console.log('✓ Banco de dados conectado com sucesso');
      } else {
        console.warn('⚠ Aviso: Não foi possível conectar ao banco de dados (reconectará automaticamente)');
      }
    } catch (dbError) {
      console.warn('⚠ Aviso de DB:', dbError.message);
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✓ Servidor ARPAA rodando em http://0.0.0.0:${PORT}`);
      console.log(`✓ CORS habilitado para todas as origens`);
      console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Banco de dados: ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);
      console.log(`✓ Server listening on all interfaces\n`);
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
