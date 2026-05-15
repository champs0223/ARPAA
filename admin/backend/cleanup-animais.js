const { pool } = require('./db/connection');

async function limparAnimais() {
  try {
    // Contar registros antes
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM animais"
    );
    console.log(`Encontrados ${rows[0].count} animais registrados.`);

    if (rows[0].count > 0) {
      // Deletar todos os registros
      const [result] = await pool.execute(
        "DELETE FROM animais"
      );
      console.log(`✅ ${result.affectedRows} animais deletados com sucesso.`);
    } else {
      console.log('Nenhum animal para deletar.');
    }
  } catch (error) {
    console.error('Erro ao limpar animais:', error);
  } finally {
    process.exit();
  }
}

limparAnimais();