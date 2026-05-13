const { ensureStore } = require('./localdb');

// Script para inicializar o armazenamento local JSON
const initDatabase = async () => {
  console.log('🔄 Verificando armazenamento local...\n');

  try {
    ensureStore();
    console.log('✓ Arquivo de dados local criado ou já existente.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar armazenamento local:', error.message);
    return false;
  }
};

// Executar inicialização se for chamado diretamente
if (require.main === module) {
  initDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { initDatabase };
