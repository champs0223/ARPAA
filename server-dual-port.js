#!/usr/bin/env node

/**
 * ARPAA - Servidor Dual Port
 * Porta 3000: Painel Admin (/admin)
 * Porta 5000: Site Público (/public)
 * 
 * Ambos compartilham IndexedDB via localStorage (offline-first)
 * 
 * Uso: node server-dual-port.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuração
const ADMIN_PORT = 3000;
const PUBLIC_PORT = 5000;

// Mime types
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Função para servir arquivos estáticos
function createServerHandler(baseDir) {
  return (req, res) => {
    // Normalizar caminho
    let filePath = path.join(baseDir, req.url);
    
    // Se é diretório, tentar servir index.html
    if (req.url === '/') {
      filePath = path.join(baseDir, 'index.html');
    }

    // Segurança: evitar path traversal
    const realPath = fs.realpathSync(baseDir);
    const requested = fs.realpathSync(filePath);
    
    if (!requested.startsWith(realPath)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access Denied');
      return;
    }

    // Ler arquivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Se não encontrar, tentar com /index.html para SPAs
          if (!filePath.endsWith('index.html')) {
            filePath = path.join(baseDir, 'index.html');
            fs.readFile(filePath, (err2, data2) => {
              if (err2) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data2);
              }
            });
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          }
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server Error: ' + err.message);
        }
        return;
      }

      // Determinar content-type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end(data);
    });
  };
}

// Criar servidor ADMIN (porta 3000)
const adminDir = path.join(__dirname, 'admin');
const adminServer = http.createServer(createServerHandler(adminDir));

adminServer.listen(ADMIN_PORT, '0.0.0.0', () => {
  console.log(`\n✅ Painel Administrativo rodando em: http://localhost:${ADMIN_PORT}`);
  console.log(`   Diretório: ${adminDir}\n`);
});

// Criar servidor PUBLIC (porta 5000)
const publicDir = path.join(__dirname, 'public');
const publicServer = http.createServer(createServerHandler(publicDir));

publicServer.listen(PUBLIC_PORT, '0.0.0.0', () => {
  console.log(`✅ Site Público rodando em: http://localhost:${PUBLIC_PORT}`);
  console.log(`   Diretório: ${publicDir}\n`);
});

// Tratamento de erros
adminServer.on('error', (err) => {
  console.error(`❌ Erro no servidor Admin (porta ${ADMIN_PORT}):`, err.message);
});

publicServer.on('error', (err) => {
  console.error(`❌ Erro no servidor Public (porta ${PUBLIC_PORT}):`, err.message);
});

// Informações adicionais
console.log('╔════════════════════════════════════════════════════╗');
console.log('║          ARPAA - Dual Port Server                 ║');
console.log('║     Sistema de Adoção Offline (IndexedDB)         ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log('\n🔗 Acessar:');
console.log(`   Admin:  http://localhost:${ADMIN_PORT}`);
console.log(`   Público: http://localhost:${PUBLIC_PORT}\n`);
console.log('💾 Dados: Salvos localmente em IndexedDB (sem banco de dados)\n');
console.log('⏸️  Pressione CTRL+C para parar\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando servidores...');
  adminServer.close(() => console.log('✅ Servidor Admin encerrado'));
  publicServer.close(() => console.log('✅ Servidor Público encerrado'));
  process.exit(0);
});
