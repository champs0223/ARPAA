const { pool } = require('./db/connection');

async function cleanupBase64Records() {
  try {
    // First, let's see how many records have Base64
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM animais WHERE foto_url LIKE 'data:image/%'"
    );
    console.log(`Encontrados ${rows[0].count} registros com Base64.`);

    if (rows[0].count > 0) {
      // Delete the records
      const [result] = await pool.execute(
        "DELETE FROM animais WHERE foto_url LIKE 'data:image/%'"
      );
      console.log(`Deletados ${result.affectedRows} registros com Base64.`);
    } else {
      console.log('Nenhum registro com Base64 encontrado.');
    }
  } catch (error) {
    console.error('Erro ao limpar registros:', error);
  } finally {
    process.exit();
  }
}

cleanupBase64Records();