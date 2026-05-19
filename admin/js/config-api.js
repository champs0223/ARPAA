// Configuração centralizada da API - Conectando ao Backend Node.js + MySQL
const USE_LOCAL_DB = false;  // ✅ Usando backend com MySQL
const API_BACKEND_PORT = 3001; // Porta do backend Node.js local

const isLocalNetwork = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  || /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname);

const API_BASE_URL = `http://${window.location.hostname}:3001`;

console.log(`🔗 API configurada: ${USE_LOCAL_DB ? '💾 BANCO DE DADOS LOCAL (IndexedDB)' : API_BASE_URL}`);
