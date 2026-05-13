// Configuração centralizada da API - Banco de Dados Local (IndexedDB + localStorage)
const USE_LOCAL_DB = true;  // ✅ Banco de dados local - sem MySQL

const isLocalNetwork = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  || /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname);

const API_BASE_URL = USE_LOCAL_DB
  ? 'LOCAL_DB'  // Marcador especial para usar DB local
  : (isLocalNetwork
    ? `http://${window.location.hostname}:3000`
    : 'https://arpaa-production.up.railway.app');

console.log(`🔗 API configurada: ${USE_LOCAL_DB ? '💾 BANCO DE DADOS LOCAL (IndexedDB)' : API_BASE_URL}`);
