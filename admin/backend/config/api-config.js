/**
 * Configuração centralizada da API
 * Use esta URL em todos os clientes frontend
 */

// Detectar ambiente e montar URL base
const getApiBaseUrl = () => {
  // Em desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // Em GitHub Codespaces
  if (window.location.hostname.includes('.preview.app.github.dev')) {
    const baseUrl = window.location.origin.replace(/\d+-/, '').replace('.preview', '');
    return baseUrl.replace('3000', '3000'); // Porta pode variar
  }
  
  // Em produção Railway ou outro serviço
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Padrão: usar mesma origem da página
  return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL, getApiBaseUrl };
}
