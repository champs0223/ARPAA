const mysql = require('mysql2/promise');

const config = {
  host: 'hopper.proxy.rlwy.net',
  port: 55302,
  user: 'root',
  password: 'GRmZFEYJgGNFOVRyQkBCRlWCPLnJTxHo',
  database: 'railway'
};

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(config);
    
    console.log('🔍 VERIFICANDO ESTRUTURA DO BANCO DE DADOS\n');
    
    // Listar tabelas
    console.log('📋 TABELAS NO BANCO:');
    console.log('════════════════════════════════════════\n');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(t => {
      console.log('✓', Object.values(t)[0]);
    });
    
    // Estrutura usuarios
    console.log('\n📋 COLUNAS DA TABELA USUARIOS:');
    console.log('════════════════════════════════════════\n');
    const [usuariosStruct] = await connection.query('DESCRIBE usuarios');
    console.table(usuariosStruct);
    
    // Estrutura animais
    console.log('\n📋 COLUNAS DA TABELA ANIMAIS:');
    console.log('════════════════════════════════════════\n');
    const [animaisStruct] = await connection.query('DESCRIBE animais');
    console.table(animaisStruct);
    
    // Primeiros registros de animais
    console.log('\n📋 EXEMPLOS DE DADOS - ANIMAIS:');
    console.log('════════════════════════════════════════\n');
    const [animais] = await connection.query('SELECT * FROM animais LIMIT 2');
    console.table(animais);
    
    // Primeiros usuários
    console.log('\n📋 EXEMPLOS DE DADOS - USUÁRIOS:');
    console.log('════════════════════════════════════════\n');
    const [usuarios] = await connection.query('SELECT id, nome FROM usuarios LIMIT 3');
    console.table(usuarios);
    
    connection.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkSchema();
