// Configuração centralizada da API
// ✅ Integração com backend MySQL em localhost:3001
const USE_LOCAL_DB = false;  // 🔄 Alterado para usar API real do backend

const isLocalNetwork = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  || /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname);

const API_BASE_URL = `http://${window.location.hostname}:3001`; // Host dinâmico para funcionar em localhost e em rede local

console.log(`🔗 API configurada: ${USE_LOCAL_DB ? '💾 BANCO DE DADOS LOCAL (IndexedDB)' : '📡 API REMOTA - ' + API_BASE_URL}`);

