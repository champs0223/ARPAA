const express = require('express');
const auth = require('./auth');
const { pool } = require('../db/connection');
const { getAll } = require('../db/localdb');
const router = express.Router();

/**
 * POST /api/metricas/sessao
 * Rota pública para registrar início/fim de sessão e tempo de permanência.
 */
router.post('/metricas/sessao', async (req, res) => {
  try {
    const { session_id, tempo_permanencia_segundos } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id é obrigatório' });
    }

    const [result] = await pool.execute(
      'INSERT INTO sessoes_visitantes (token_sessao, tempo_permanencia_segundos, data_hora) VALUES (?, ?, NOW())',
      [session_id, Number.isFinite(Number(tempo_permanencia_segundos)) ? Number(tempo_permanencia_segundos) : null]
    );

    res.status(201).json({ id: result.insertId, token_sessao: session_id });
  } catch (error) {
    console.error('Erro ao registrar sessão de visitante:', error);
    res.status(500).json({ error: 'Erro ao registrar sessão de visitante' });
  }
});

/**
 * POST /api/metricas/clique
 * Rota pública para registrar interações de clique no site.
 */
router.post('/metricas/clique', async (req, res) => {
  try {
    const { session_id, animal_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id é obrigatório' });
    }

    const [result] = await pool.execute(
      'INSERT INTO cliques_interacoes (token_sessao, id_animal, data_hora) VALUES (?, ?, NOW())',
      [session_id, animal_id || null]
    );

    res.status(201).json({ id: result.insertId, token_sessao: session_id });
  } catch (error) {
    console.error('Erro ao registrar clique de interação:', error);
    res.status(500).json({ error: 'Erro ao registrar clique de interação' });
  }
});

/**
 * GET /api/metricas/summary
 * Resumo de métricas de engajamento para o Dashboard.
 */
router.get('/metricas/summary', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  try {
    const [visitantesRows] = await pool.query(
      'SELECT COUNT(DISTINCT token_sessao) AS visitantes_unicos, AVG(tempo_permanencia_segundos) AS media_segundos FROM sessoes_visitantes'
    );

    const [cliquesRows] = await pool.query(
      'SELECT COUNT(*) AS cliques_animais FROM cliques_interacoes WHERE id_animal IS NOT NULL'
    );

    const [pedidosRows] = await pool.query(
      'SELECT COUNT(*) AS total_pedidos, SUM(status = "Aprovado") AS pedidos_aprovados FROM solicitacoes_adocao'
    );

    const [animaisRows] = await pool.query(
      'SELECT SUM(LOWER(status) = "adotado") AS adotados, SUM(LOWER(status) IN ("disponivel", "disponível")) AS disponiveis FROM animais'
    );

    const visitantesUnicos = Number(visitantesRows[0]?.visitantes_unicos || 0);
    const mediaSegundos = Number(visitantesRows[0]?.media_segundos || 0);
    const cliquesAnimais = Number(cliquesRows[0]?.cliques_animais || 0);
    const totalPedidos = Number(pedidosRows[0]?.total_pedidos || 0);
    const pedidosAprovados = Number(pedidosRows[0]?.pedidos_aprovados || 0);
    const animaisAdotados = Number(animaisRows[0]?.adotados || 0);
    const animaisDisponiveis = Number(animaisRows[0]?.disponiveis || 0);

    // Busca somatórios de doações e contagens adicionais
    let doacoesCount = 0, totalDinheiro = 0, totalRacao = 0, totalMedicamentos = 0;
    try {
      const [doacoesRows] = await pool.query(`
        SELECT
          COUNT(*) AS doacoesCount,
          SUM(CASE WHEN LOWER(tipo) = 'dinheiro' THEN quantidade ELSE 0 END) AS totalDinheiro,
          SUM(CASE WHEN LOWER(tipo) = 'racao' THEN quantidade ELSE 0 END) AS totalRacao,
          SUM(CASE WHEN LOWER(tipo) = 'medicamento' THEN quantidade ELSE 0 END) AS totalMedicamentos
        FROM doacoes
      `);

      doacoesCount = Number(doacoesRows[0]?.doacoesCount || 0);
      totalDinheiro = Number(doacoesRows[0]?.totalDinheiro || 0);
      totalRacao = Number(doacoesRows[0]?.totalRacao || 0);
      totalMedicamentos = Number(doacoesRows[0]?.totalMedicamentos || 0);
    } catch (dqErr) {
      // Fallback seguro para armazenamento local
      try {
        const localDoacoes = getAll('doacoes') || [];
        doacoesCount = localDoacoes.length;
        totalDinheiro = localDoacoes.filter(d => String(d.tipo || '').toLowerCase() === 'dinheiro').reduce((s, d) => s + Number(d.quantidade || 0), 0);
        totalRacao = localDoacoes.filter(d => String(d.tipo || '').toLowerCase() === 'racao').reduce((s, d) => s + Number(d.quantidade || 0), 0);
        totalMedicamentos = localDoacoes.filter(d => String(d.tipo || '').toLowerCase() === 'medicamento').reduce((s, d) => s + Number(d.quantidade || 0), 0);
      } catch (_) {
        doacoesCount = 0; totalDinheiro = 0; totalRacao = 0; totalMedicamentos = 0;
      }
    }

    let eventosCount = 0, animaisCount = 0, adocoesCount = 0;
    try {
      const [eventosRows] = await pool.query('SELECT COUNT(*) AS eventosCount FROM eventos');
      eventosCount = Number(eventosRows[0]?.eventosCount || 0);
    } catch (e) {
      try { eventosCount = (getAll('eventos') || []).length; } catch (_) { eventosCount = 0; }
    }

    try {
      const [animaisCountRows] = await pool.query('SELECT COUNT(*) AS animaisCount FROM animais');
      animaisCount = Number(animaisCountRows[0]?.animaisCount || 0);
    } catch (e) {
      try { animaisCount = (getAll('animais') || []).length; } catch (_) { animaisCount = 0; }
    }

    try {
      const [adocoesRows] = await pool.query('SELECT COUNT(*) AS adocoesCount FROM adocoes');
      adocoesCount = Number(adocoesRows[0]?.adocoesCount || 0);
    } catch (e) {
      try { adocoesCount = (getAll('adocoes') || []).length; } catch (_) { adocoesCount = 0; }
    }

    const taxaConversao = visitantesUnicos > 0
      ? (totalPedidos / visitantesUnicos) * 100
      : 0;
    const taxaAdocaoReal = animaisDisponiveis > 0
      ? (animaisAdotados / animaisDisponiveis) * 100
      : 0;
    const taxaInteracao = visitantesUnicos > 0
      ? (cliquesAnimais / visitantesUnicos) * 100
      : 0;
    const cliqueParaPedido = cliquesAnimais > 0
      ? (totalPedidos / cliquesAnimais) * 100
      : 0;
    const pedidoParaAdocao = totalPedidos > 0
      ? (pedidosAprovados / totalPedidos) * 100
      : 0;

    res.json({
      visitantesUnicos,
      cliquesAnimais,
      totalPedidos,
      pedidosAprovados,
      animaisAdotados,
      animaisCount,
      animaisDisponiveis,
      taxaConversao: Number(taxaConversao.toFixed(2)),
      taxaAdocaoReal: Number(taxaAdocaoReal.toFixed(2)),
      tempoMedioMinutos: Number((mediaSegundos / 60).toFixed(2)),
      taxaInteracao: Number(taxaInteracao.toFixed(2)),
      cliqueParaPedido: Number(cliqueParaPedido.toFixed(2)),
      pedidoParaAdocao: Number(pedidoParaAdocao.toFixed(2)),
      eventosCount,
      adocoesCount,
      doacoesCount,
      totalDinheiro,
      totalRacao,
      totalMedicamentos
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de métricas:', error);
    res.json({
      visitantesUnicos: 0,
      cliquesAnimais: 0,
      totalPedidos: 0,
      pedidosAprovados: 0,
      animaisAdotados: 0,
      animaisDisponiveis: 0,
      taxaConversao: 0.00,
      taxaAdocaoReal: 0.00,
      tempoMedioMinutos: 0.00,
      taxaInteracao: 0.00,
      cliqueParaPedido: 0.00,
      pedidoParaAdocao: 0.00,
      eventosCount: 0,
      adocoesCount: 0,
      doacoesCount: 0,
      totalDinheiro: 0,
      totalRacao: 0,
      totalMedicamentos: 0
    });
  }
});

module.exports = router;
