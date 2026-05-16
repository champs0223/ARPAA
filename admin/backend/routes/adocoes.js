const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../db/connection');
const { getById, insertItem, updateItem, deleteById } = require('../db/localdb');

// GET - Listar adoções por status: ativas por padrão, concluídas ou reprovadas dependendo do filtro
router.get('/adocoes', async (req, res) => {
  try {
    const statusQuery = (req.query.status || 'ativos').toLowerCase();

    let whereClause = "WHERE LOWER(a.status) NOT IN ('concluído', 'reprovado')";
    if (statusQuery === 'concluído' || statusQuery === 'concluido') {
      whereClause = "WHERE LOWER(a.status) = 'concluído'";
    } else if (statusQuery === 'reprovado') {
      whereClause = "WHERE LOWER(a.status) = 'reprovado'";
    }

    const query = `
      SELECT
        a.id,
        a.animal_id,
        a.adotante_id,
        COALESCE(an.nome, 'Não informado') AS animal_nome,
        COALESCE(ad.nome, 'Não informado') AS adotante_nome,
        COALESCE(ad.email, 'Não informado') AS email,
        COALESCE(ad.telefone, 'Não informado') AS telefone,
        COALESCE(ad.endereco, '') AS endereco,
        a.data_adocao,
        a.status
      FROM adocoes a
      LEFT JOIN animais an ON a.animal_id = an.id
      LEFT JOIN adotantes ad ON a.adotante_id = ad.id
      ${whereClause}
    `;

    const [rows] = await pool.execute(query);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('❌ ERRO NO BACKEND AO BUSCAR ADOÇÕES:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET - Obter adoção por ID
router.get('/adocoes/:id', async (req, res) => {
  try {
    const adocao = getById('adocoes', req.params.id);
    if (!adocao) {
      return res.status(404).json({ error: 'Adoção não encontrada' });
    }
    res.json(adocao);
  } catch (error) {
    console.error('Erro ao buscar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova adoção
router.post('/adocoes', async (req, res) => {
  try {
    const { animal_id, adotante_id, data_adocao, status } = req.body;
    const id = crypto.randomBytes(6).toString('hex');
    const adocao = insertItem('adocoes', { id, animal_id, adotante_id, data_adocao, status });
    res.status(201).json(adocao);
  } catch (error) {
    console.error('Erro ao criar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar status de adoção (usado para edição geral)
router.put('/adocoes/:id', async (req, res) => {
  try {
    const { animal_id, adotante_id, data_adocao, status } = req.body;
    const updated = updateItem('adocoes', req.params.id, { animal_id, adotante_id, data_adocao, status });
    if (!updated) {
      return res.status(404).json({ error: 'Adoção não encontrada' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar adoção:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Avançar etapa do processo de adoção
router.put('/admin/adocoes/:id/etapa', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Atualizar status na tabela adocoes
    const [updateResult] = await connection.execute(
      'UPDATE adocoes SET status = ? WHERE id = ?',
      [status, id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Processo de adoção não encontrado' });
    }

    // Se status for 'Concluído', fazer migração
    if (status === 'Concluído') {
      const [processo] = await connection.execute(`
        SELECT a.*, an.nome as animal_nome, ad.id AS adotante_id, ad.nome AS adotante_nome, ad.endereco, ad.email, ad.telefone
        FROM adocoes a
        LEFT JOIN animais an ON a.animal_id = an.id
        LEFT JOIN adotantes ad ON a.adotante_id = ad.id
        WHERE a.id = ?
      `, [id]);

      if (processo.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Dados do processo não encontrados' });
      }

      const dados = processo[0];
      const adotanteIdOriginal = dados.adotante_id;
      const adotanteIdBody = req.body.adotante_id || null;
      const nomeAdotante = req.body.nome || dados.adotante_nome;
      const endereco = req.body.endereco || dados.endereco;
      const email = req.body.email || dados.email;
      const telefone = req.body.telefone || dados.telefone;

      if (!adotanteIdOriginal && !adotanteIdBody) {
        if (!nomeAdotante || !telefone) {
          await connection.rollback();
          return res.status(400).json({ error: 'Dados do adotante são necessários para concluir a adoção' });
        }

        const [insertAdotante] = await connection.execute(
          'INSERT INTO adotantes (nome, endereco, email, telefone) VALUES (?, ?, ?, ?)',
          [nomeAdotante, endereco, email, telefone]
        );
        dados.adotante_id = insertAdotante.insertId;
      } else if (!adotanteIdOriginal && adotanteIdBody) {
        dados.adotante_id = adotanteIdBody;
      } else {
        dados.adotante_id = adotanteIdOriginal;
      }

      await connection.execute(
        'UPDATE animais SET status = ? WHERE id = ?',
        ['Adotado', dados.animal_id]
      );

      if (!adotanteIdOriginal && dados.adotante_id) {
        await connection.execute(
          'UPDATE adocoes SET adotante_id = ? WHERE id = ?',
          [dados.adotante_id, id]
        );
      }
    }

    await connection.commit();
    return res.status(200).json({ message: 'Etapa avançada com sucesso' });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erro ao avançar etapa:', error);
    return res.status(500).json({ error: 'Erro interno ao avançar etapa' });
  } finally {
    connection.release();
  }
});

// PUT - Retroceder etapa do processo de adoção
router.put('/admin/adocoes/:id/retroceder', async (req, res) => {
  const { id } = req.params;
  const etapas = ['Triagem', 'Entrevista', 'Visita', 'Termo', 'Concluído'];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT status FROM adocoes WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Processo de adoção não encontrado' });
    }

    const statusAtual = rows[0].status || 'Triagem';
    const indiceAtual = etapas.indexOf(statusAtual);

    if (indiceAtual <= 0 || indiceAtual === etapas.length - 1) {
      await connection.rollback();
      return res.status(400).json({ error: 'Não é possível retroceder a etapa deste processo' });
    }

    const novoStatus = etapas[indiceAtual - 1];

    const [updateResult] = await connection.execute(
      'UPDATE adocoes SET status = ? WHERE id = ?',
      [novoStatus, id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Processo de adoção não encontrado' });
    }

    await connection.commit();
    return res.status(200).json({ message: 'Etapa retrocedida com sucesso', status: novoStatus });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Erro ao retroceder etapa:', error);
    return res.status(500).json({ error: 'Erro interno ao retroceder etapa' });
  } finally {
    connection.release();
  }
});

// DELETE - Remover processo de adoção fisicamente do MySQL
router.delete('/adocoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM adocoes WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Processo de adoção não encontrado' });
    }
    
    return res.status(200).json({ message: 'Processo de adoção excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir processo de adoção:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir processo' });
  }
});

module.exports = router;
