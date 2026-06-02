// Configuração centralizada da API - Conectando ao Backend Node.js + MySQL
const USE_LOCAL_DB = false;  // ✅ Usando backend com MySQL
const API_BACKEND_PORT = 3001; // Porta do backend Node.js local

const isLocalNetwork = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  || /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname);

const API_BASE_URL = `http://${window.location.hostname}:3001`;

function getAdminToken() {
  return localStorage.getItem('adminToken')
    || sessionStorage.getItem('adminToken')
    || localStorage.getItem('token')
    || sessionStorage.getItem('token')
    || '';
}

function getAuthHeaders(contentType = 'application/json') {
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAdminHeaders(contentType = 'application/json') {
  return getAuthHeaders(contentType);
}

console.log(`🔗 API configurada: ${USE_LOCAL_DB ? '💾 BANCO DE DADOS LOCAL (IndexedDB)' : API_BASE_URL}`);

// -----------------------
// Utilitários de número / totais de doações
// -----------------------

function parsePortugueseNumber(value) {
  if (typeof value === 'number') return value;
  if (value == null) return 0;
  let s = String(value).trim();
  if (!s) return 0;
  // Remover símbolo de moeda e espaços
  s = s.replace(/R\$|r\$/g, '').replace(/\s/g, '');
  // Se usar separador milhares '.' e decimal ',' (pt-BR), converter corretamente
  if (s.indexOf('.') > -1 && s.indexOf(',') > -1 && s.lastIndexOf('.') < s.lastIndexOf(',')) {
    s = s.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // Caso comum: apenas vírgula como decimal ou já com ponto
    s = s.replace(/,/g, '.');
  }
  // Remover qualquer caractere que não seja dígito, sinal ou ponto
  s = s.replace(/[^0-9.-]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function calcularTotaisDoacoes(doacoesArray) {
  const totals = { dinheiro: 0, racao: 0, medicamentos: 0, outros_insumos: 0 };
  if (!Array.isArray(doacoesArray)) return totals;
  for (const d of doacoesArray) {
    if (!d) continue;
    const tipo = String(d.tipo || '').toLowerCase();
    const quantidade = parsePortugueseNumber(d.quantidade);
    if (tipo === 'dinheiro') totals.dinheiro += quantidade;
    else if (tipo === 'racao') totals.racao += quantidade;
    else if (tipo === 'medicamento') totals.medicamentos += quantidade;
    else if (['higiene', 'limpeza', 'conforto'].includes(tipo)) totals.outros_insumos += quantidade;
    else {
      // Outras categorias não contabilizadas nos cartões principais
    }
  }
  return totals;
}

function atualizarTotaisDoacoesDOM(doacoesArray) {
  const totals = calcularTotaisDoacoes(doacoesArray);
  const elDin = document.getElementById('totalDinheiro');
  const elRacao = document.getElementById('totalRacao');
  const elMed = document.getElementById('totalMedicamentos');
  const elOutros = document.getElementById('totalOutrosInsumos');

  if (elDin) elDin.innerText = Number(totals.dinheiro || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (elRacao) elRacao.innerText = `${Number(totals.racao || 0)} KG`;
  if (elMed) elMed.innerText = `${Number(totals.medicamentos || 0)} un`;
  if (elOutros) elOutros.innerText = `${Number(totals.outros_insumos || 0)} un`;

  return totals;
}

// Disponibilizar globalmente para páginas que incluam config-api.js
window.parsePortugueseNumber = parsePortugueseNumber;
window.calcularTotaisDoacoes = calcularTotaisDoacoes;
window.atualizarTotaisDoacoesDOM = atualizarTotaisDoacoesDOM;

// Função unificada para gerar headers de autenticação (padrão 'Bearer')
function buildAuthHeaders(providedToken = null, contentType = 'application/json') {
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  const token = providedToken || getAdminToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Expor aliases seguros no escopo global sem sobrescrever nomes existentes
window.buildAuthHeaders = window.buildAuthHeaders || buildAuthHeaders;
window.getAuthHeaders = window.getAuthHeaders || getAuthHeaders;
window.getAdminHeaders = window.getAdminHeaders || getAdminHeaders;

// Criar namespace específico para evitar colisões globais
window.arpaa = window.arpaa || {};
window.arpaa.parsePortugueseNumber = window.arpaa.parsePortugueseNumber || parsePortugueseNumber;
window.arpaa.calcularTotaisDoacoes = window.arpaa.calcularTotaisDoacoes || calcularTotaisDoacoes;
window.arpaa.atualizarTotaisDoacoesDOM = window.arpaa.atualizarTotaisDoacoesDOM || atualizarTotaisDoacoesDOM;
window.arpaa.buildAuthHeaders = window.arpaa.buildAuthHeaders || buildAuthHeaders;
window.arpaa.getAdminHeaders = window.arpaa.getAdminHeaders || getAdminHeaders;
