const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'hopper.proxy.rlwy.net',
  port: 55302,
  user: 'root',
  password: 'GRmZFEYJgGNFOVRyQkBCRlWCPLnJTxHo',
  database: 'railway',
  multipleStatements: true
};

async function createSchema() {
  try {
    console.log('🔧 Conectando ao banco de dados...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Conectado!');

    // Ler arquivo SQL
    const sqlFile = path.join(__dirname, 'create-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executando script SQL...\n');
    
    // Executar todas as queries
    await connection.query(sql);

    console.log('\n✅ Tabelas criadas com sucesso!\n');

    // Listar tabelas
    console.log('📋 TABELAS CRIADAS:');
    console.log('═══════════════════════════════════════');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`  ✓ ${tableName}`);
    });

    // Verificar estrutura de uma tabela
    console.log('\n📊 ESTRUTURA DA TABELA usuarios:');
    console.log('═══════════════════════════════════════');
    const [usuariosStruct] = await connection.query('DESCRIBE usuarios');
    console.table(usuariosStruct);

    console.log('\n✅ Schema criado com sucesso!');
    connection.end();
  } catch (error) {
    console.error('❌ Erro ao criar schema:', error.message);
    process.exit(1);
  }
}

createSchema();
