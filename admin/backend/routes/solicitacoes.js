const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db/connection');
const auth = require('./auth');

module.exports = (io) => {
  const router = express.Router();

  /**
   * POST /api/public/solicitacoes
   * Rota pública para criar nova solicitação de adoção
   */
  router.post('/public/solicitacoes', async (req, res) => {
  try {
    const { animal_id, nome, email, telefone, endereco, mensagem } = req.body;

    // Validações
    if (!animal_id || !nome || !email || !telefone || !endereco || !mensagem) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se animal existe
    const [animal] = await pool.query('SELECT id, nome FROM animais WHERE id = ?', [animal_id]);
    if (animal.length === 0) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    // Inserir solicitação
    const [result] = await pool.execute(
      'INSERT INTO solicitacoes_adocao (animal_id, nome, email, telefone, endereco, mensagem, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [animal_id, nome, email, telefone, endereco, mensagem, 'Pendente']
    );

    const novaSolicitacao = {
      id: result.insertId,
      animal_id,
      nome,
      email,
      telefone,
      endereco,
      mensagem,
      status: 'Pendente',
      nome_animal: animal[0].nome,
      created_at: new Date().toISOString()
    };

    io.emit('novaSolicitacao', novaSolicitacao);

    res.status(201).json(novaSolicitacao);

  } catch (error) {
    console.error('Erro ao criar solicitação de adoção:', error);
    res.status(500).json({ error: 'Erro ao criar solicitação de adoção' });
  }
});

/**
 * GET /api/public/solicitacoes
 * Listar solicitações do usuário autenticado
 */
router.get('/public/solicitacoes', auth.authenticateToken, async (req, res) => {
  try {
    const { status, email } = req.query;
    const userName = String(req.user.nome || '').trim();

    if (!userName) {
      return res.status(400).json({ error: 'Nome do usuário não disponível para consulta' });
    }

    const params = [userName];
    let whereClause = 'WHERE s.nome = ?';

    if (email) {
      whereClause += ' AND s.email = ?';
      params.push(email);
    }

    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }

    const [solicitacoes] = await pool.query(`
      SELECT 
        s.id,
        s.animal_id,
        s.nome as nome_adotante,
        s.email,
        s.telefone,
        s.endereco,
        s.mensagem,
        s.status,
        s.created_at,
        a.nome as nome_animal,
        a.especie,
        a.idade_aproximada
      FROM solicitacoes_adocao s
      LEFT JOIN animais a ON s.animal_id = a.id
      ${whereClause}
      ORDER BY s.created_at DESC
    `, params);

    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações do usuário:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

/**
 * GET /api/admin/solicitacoes
 * Listar todas as solicitações de adoção (admin)
 */
router.get('/admin/solicitacoes', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    } else {
      whereClause += " AND s.status = 'Pendente'";
    }

    const [solicitacoes] = await pool.query(`
      SELECT 
        s.id,
        s.animal_id,
        s.nome as nome_adotante,
        s.email,
        s.telefone,
        s.endereco,
        s.mensagem,
        s.status,
        s.created_at,
        a.nome as nome_animal,
        a.especie,
        a.idade_aproximada
      FROM solicitacoes_adocao s
      LEFT JOIN animais a ON s.animal_id = a.id
      ${whereClause}
      ORDER BY s.created_at DESC
    `, params);

    res.json(solicitacoes);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

/**
 * GET /api/public/solicitacoes/:id
 * Obter detalhes de uma solicitação para o usuário autenticado
 */
router.get('/public/solicitacoes/:id', auth.authenticateToken, async (req, res) => {
  try {
    const userName = String(req.user.nome || '').trim();
    const solicitacaoId = req.params.id;

    if (!userName) {
      return res.status(400).json({ error: 'Nome do usuário não disponível para consulta' });
    }

    const [solicitacoes] = await pool.query(`
      SELECT 
        s.id,
        s.animal_id,
        s.nome as nome_adotante,
        s.email,
        s.telefone,
        s.endereco,
        s.mensagem,
        s.status,
        s.created_at,
        a.nome as nome_animal,
        a.especie,
        a.idade_aproximada
      FROM solicitacoes_adocao s
      LEFT JOIN animais a ON s.animal_id = a.id
      WHERE s.id = ? AND s.nome = ?
      LIMIT 1
    `, [solicitacaoId, userName]);

    if (solicitacoes.length === 0) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    res.json(solicitacoes[0]);
  } catch (error) {
    console.error('Erro ao buscar solicitação do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitação' });
  }
});

/**
 * GET /api/admin/solicitacoes/:id
 * Obter detalhes de uma solicitação específica
 */
router.get('/admin/solicitacoes/:id', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  try {
    const [solicitacoes] = await pool.query(`
      SELECT 
        s.id,
        s.animal_id,
        s.nome as nome_adotante,
        s.email,
        s.telefone,
        s.endereco,
        s.mensagem,
        s.status,
        s.created_at,
        a.nome as nome_animal,
        a.especie,
        a.idade_aproximada
      FROM solicitacoes_adocao s
      LEFT JOIN animais a ON s.animal_id = a.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (solicitacoes.length === 0) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    res.json(solicitacoes[0]);
  } catch (error) {
    console.error('Erro ao buscar solicitação:', error);
    res.status(500).json({ error: 'Erro ao buscar solicitação' });
  }
});

/**
 * PUT /api/admin/solicitacoes/:id
 * Atualizar status da solicitação (Aprovado, Rejeitado, Pendente)
 */
router.put('/admin/solicitacoes/:id', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { status, observacoes } = req.body;
    const { id } = req.params;

    if (!status || !['Pendente', 'Aprovado', 'Rejeitado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    await connection.beginTransaction();

    const [solicitacoes] = await connection.query(
      'SELECT * FROM solicitacoes_adocao WHERE id = ?',
      [id]
    );

    if (solicitacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const solicitacao = solicitacoes[0];

    if (status === 'Aprovado') {
      const [adotantesExistentes] = await connection.query(
        'SELECT id FROM adotantes WHERE email = ?',
        [solicitacao.email]
      );

      let id_adotante;
      if (adotantesExistentes.length > 0) {
        id_adotante = adotantesExistentes[0].id;
      } else {
        const id_adotante_new = Math.random().toString(36).substring(2,14).toUpperCase();
        const [resultAdotante] = await connection.execute(
          'INSERT INTO adotantes (id, nome, endereco, email, telefone) VALUES (?, ?, ?, ?, ?)',
          [id_adotante_new, solicitacao.nome, solicitacao.endereco, solicitacao.email, solicitacao.telefone]
        );
        id_adotante = id_adotante_new;
      }

      const id_adocao = Math.random().toString(36).substring(2,14).toUpperCase();
      await connection.execute(
        'INSERT INTO adocoes (id, animal_id, adotante_id, status, data_adocao) VALUES (?, ?, ?, ?, NOW())',
        [id_adocao, solicitacao.animal_id, id_adotante, 'Pendente']
      );

      await connection.execute(
        'UPDATE animais SET status = ? WHERE id = ?',
        ['Adotado', solicitacao.animal_id]
      );
    }

    const [result] = await connection.execute(
      'UPDATE solicitacoes_adocao SET status = ?, observacoes = ?, updated_at = NOW() WHERE id = ?',
      [status, observacoes || null, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    await connection.commit();

    res.json({
      message: 'Solicitação atualizada com sucesso',
      id,
      status,
      observacoes
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ ERRO CRÍTICO NO BANCO AO APROVAR:", error.message);
    console.error("Detalhes do erro:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/admin/solicitacoes/:id
 * Deletar uma solicitação
 */
router.delete('/admin/solicitacoes/:id', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM solicitacoes_adocao WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    res.json({ message: 'Solicitação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar solicitação:', error);
    res.status(500).json({ error: 'Erro ao deletar solicitação' });
  }
});

/**
 * POST /api/admin/solicitacoes/:id/iniciar
 * Iniciar processo de adoção: transfere dados para adotantes e adocoes
 */
router.post('/admin/solicitacoes/:id/iniciar', auth.authenticateToken, auth.ensureAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Buscar solicitação
    const [solicitacoes] = await connection.query(
      'SELECT * FROM solicitacoes_adocao WHERE id = ?',
      [req.params.id]
    );

    if (solicitacoes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const solicita = solicitacoes[0];

    // 2. Criar adotante diretamente, sem dependência de email
    const id_adotante = crypto.randomBytes(6).toString('hex').toUpperCase();
    await connection.execute(
      'INSERT INTO adotantes (id, nome, endereco, email, telefone) VALUES (?, ?, ?, ?, ?)',
      [id_adotante, solicita.nome, solicita.endereco, solicita.email, solicita.telefone]
    );

    // 3. Criar processo de adoção iniciando em Triagem
    const id_adocao = crypto.randomBytes(6).toString('hex').toUpperCase();
    await connection.execute(
      'INSERT INTO adocoes (id, animal_id, adotante_id, status) VALUES (?, ?, ?, ?)',
      [id_adocao, solicita.animal_id, id_adotante, 'Triagem']
    );

    // 4. Marcar solicitação como processando e atualizar status do animal
    await connection.execute(
      'UPDATE solicitacoes_adocao SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Aprovado', req.params.id]
    );

    await connection.execute(
      'UPDATE animais SET status = ? WHERE id = ?',
      ['Reservado', solicita.animal_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Processo de adoção iniciado com sucesso',
      id_adocao,
      id_adotante,
      id_solicitacao: req.params.id,
      status: 'Aprovado'
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ ERRO CRÍTICO AO INICIAR PROCESSO:', error.message);
    console.error('Detalhes do erro:', error);
    res.status(500).json({ error: 'Erro ao iniciar processo de adoção' });
  } finally {
    connection.release();
  }
});

  return router;
};
