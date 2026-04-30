const fs = require('fs');
const path = require('path');

/**
 * Script para fazer backup dos dados locais em JSON
 * Uso: node backup-db.js
 */

const backupDatabase = async () => {
  const dbPath = path.join(__dirname, 'data.json');
  const backupDir = path.join(__dirname, 'backups');
  
  // Criar pasta de backups se não existir
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Nome do arquivo de backup com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `arpaa-backup-${timestamp}.json`);
  
  try {
    // Verificar se arquivo de dados existe
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Arquivo de dados não encontrado:', dbPath);
      return false;
    }
    
    // Copiar arquivo de dados para backup
    fs.copyFileSync(dbPath, backupPath);
    
    const stats = fs.statSync(backupPath);
    console.log('\n✅ Backup criado com sucesso!');
    console.log('📁 Caminho:', backupPath);
    console.log('📊 Tamanho:', `${(stats.size / 1024).toFixed(2)} KB`);
    console.log('🕐 Data:', new Date().toLocaleString('pt-BR'));
    
    return true;
  } catch (error) {
    console.error('\n❌ Erro ao fazer backup:', error.message);
    return false;
  }
};

// Executar se for chamado diretamente
if (require.main === module) {
  backupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { backupDatabase };
