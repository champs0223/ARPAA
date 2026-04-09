const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  // 1. O MySQL2 às vezes ignora a porta se ela for passada como String do .env
  port: Number(process.env.DB_PORT) || 3306, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  // 2. O aviso (Warning) ocorre aqui. O nome correto é 'keepAliveDelay'
  keepAliveDelay: 10000 
});

// Função para testar conexão
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Conexão com MySQL estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    // Se cair aqui, ele vai mostrar o erro real do Railway (ex: Timeout ou Auth)
    console.error('✗ Erro ao conectar no banco de dados:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };
