const express = require('express');
const router = express.Router();
const auth = require('./auth');
const { pool } = require('../db/connection');
const { getAll } = require('../db/localdb');

router.get('/doacoes/summary', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  try {
    // Tratamento case-insensitive para os tipos de doações ('Dinheiro', 'Racao', etc.)
    const query = `
      SELECT
        SUM(CASE WHEN LOWER(tipo) = 'dinheiro' THEN quantidade ELSE 0 END) AS dinheiro,
        SUM(CASE WHEN LOWER(tipo) = 'racao' THEN quantidade ELSE 0 END) AS racao,
        SUM(CASE WHEN LOWER(tipo) = 'medicamento' THEN quantidade ELSE 0 END) AS medicamentos,
        SUM(CASE WHEN LOWER(tipo) IN ('higiene', 'limpeza', 'conforto', 'insumos') THEN quantidade ELSE 0 END) AS outros_insumos
      FROM doacoes
    `;

    const [rows] = await pool.execute(query);
    const result = rows[0] || {};

    return res.json({
      dinheiro: Number(result.dinheiro || 0),
      racao: Number(result.racao || 0),
      medicamentos: Number(result.medicamentos || 0),
      outros_insumos: Number(result.outros_insumos || 0)
    });
  } catch (error) {
    // Intercepta de forma limpa o erro de tabela inexistente no MySQL sem quebrar o Node
    console.warn('ℹ️ [Aviso Seguro] Tabela doações não encontrada no MySQL. Usando fallback local:', error.message);

    try {
      const doacoes = getAll('doacoes') || [];
      const totals = doacoes.reduce(
        (acc, item) => {
          const quantidade = Number(item.quantidade || 0);
          const tipoFormatado = String(item.tipo || '').toLowerCase();

          if (tipoFormatado === 'dinheiro') {
            acc.dinheiro += quantidade;
          } else if (tipoFormatado === 'racao') {
            acc.racao += quantidade;
          } else if (tipoFormatado === 'medicamento') {
            acc.medicamentos += quantidade;
          } else if (['higiene', 'limpeza', 'conforto', 'insumos'].includes(tipoFormatado)) {
            acc.outros_insumos += quantidade;
          }
          return acc;
        },
        { dinheiro: 0, racao: 0, medicamentos: 0, outros_insumos: 0 }
      );

      return res.json(totals);
    } catch (fallbackError) {
      // Proteção total secundária: se até o banco de dados local falhar, entrega um JSON zerado padrão
      return res.json({ dinheiro: 0, racao: 0, medicamentos: 0, outros_insumos: 0 });
    }
  }
});

module.exports = router;
