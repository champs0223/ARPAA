/**
 * Dashboard Loader - Carrega dados dinâmicos da API
 * Conecta contadores do dashboard aos dados reais do backend
 */

function safeParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function safeNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Estado para evitar recargas concorrentes do dashboard e debouncing
let _arpaaDashboardReloadTimer = null;
let _arpaaDashboardLoading = false;

function setElementText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = text;
  }
}

function setElementWidth(id, width) {
  const element = document.getElementById(id);
  if (element) {
    element.style.width = width;
  }
}

/**
 * Carrega todos os dados do dashboard da API
 */
async function carregarDashboard() {
  console.log('📊 Iniciando carregamento do dashboard...');
  _arpaaDashboardLoading = true;
  
  try {
    const authHeaders = getAdminHeaders();

    // Carregar dados em paralelo
    const [animais, adocoes, adocoesResumo, metricasResumo, eventos, doacoesResumo, doacoesList] = await Promise.all([
      fetch(`${API_BASE_URL}/api/animais`, { headers: authHeaders }).then(r => r.json()).catch(e => {
        console.warn('⚠️ Erro ao buscar animais:', e.message);
        return JSON.parse(localStorage.getItem('animais')) || [];
      }),
      fetch(`${API_BASE_URL}/api/adocoes`, { headers: authHeaders }).then(r => r.json()).catch(e => {
        console.warn('⚠️ Erro ao buscar adoções:', e.message);
        return JSON.parse(localStorage.getItem('adocoes')) || [];
      }),
      fetch(`${API_BASE_URL}/api/adocoes/summary`, { headers: authHeaders }).then(r => r.ok ? r.json() : Promise.reject(new Error('Resumo inválido'))).catch(e => {
        console.warn('⚠️ Erro ao buscar resumo de adoções:', e.message);
        return null;
      }),
      fetch(`${API_BASE_URL}/api/metricas/summary`, { headers: authHeaders }).then(r => r.ok ? r.json() : Promise.reject(new Error('Resumo de métricas inválido'))).catch(e => {
        console.warn('⚠️ Erro ao buscar resumo de métricas:', e.message);
        return null;
      }),
      fetch(`${API_BASE_URL}/api/admin/eventos`, { headers: authHeaders }).then(r => r.json()).catch(e => {
        console.warn('⚠️ Erro ao buscar eventos:', e.message);
        return JSON.parse(localStorage.getItem('eventos')) || [];
      }),
      fetch(`${API_BASE_URL}/api/doacoes/summary`, { headers: authHeaders }).then(r => r.ok ? r.json() : Promise.reject(new Error('Resumo inválido de doações'))).catch(e => {
        console.warn('⚠️ Erro ao buscar resumo de doações:', e.message);
        return null;
      }),
      // Doações - carrega do localStorage pois tabela ainda não está no DB
      Promise.resolve(safeParseJSON(localStorage.getItem('arpaa_doacoes_dados')) || [])
    ]);

    const doacoesArray = Array.isArray(doacoesList) ? doacoesList : [];
    const totalDoacoesCount = safeNumber(doacoesArray.length);

    console.log('✅ Dados carregados:', { 
      animaisCount: animais?.length || 0, 
      adocoesCount: adocoes?.length || 0,
      eventosCount: eventos?.length || 0,
      doacoesCount: totalDoacoesCount
    });

    // ===== CARDS PRINCIPAIS =====
    animarNumero(document.getElementById('totalAnimais'), safeNumber((animais || []).length));
    animarNumero(document.getElementById('totalAdocoes'), safeNumber((adocoes || []).length));
    animarNumero(document.getElementById('totalDoacoes'), totalDoacoesCount);
    animarNumero(document.getElementById('totalEventos'), safeNumber((eventos || []).length));

    // ===== DOAÇÕES DETALHADAS =====
    // Preferir dados do resumo vindo da API quando presentes; senão calcular a partir do local
    const resumoDoacoesData = (doacoesResumo && Object.keys(doacoesResumo).length > 0) ? doacoesResumo : null;
    const resumoDoacoes = { dinheiro: 0, racao: 0, medicamentos: 0, outros_insumos: 0 };

    if (resumoDoacoesData) {
      resumoDoacoes.dinheiro = parsePortugueseNumber(resumoDoacoesData.dinheiro);
      resumoDoacoes.racao = parsePortugueseNumber(resumoDoacoesData.racao);
      resumoDoacoes.medicamentos = parsePortugueseNumber(resumoDoacoesData.medicamentos);
      resumoDoacoes.outros_insumos = parsePortugueseNumber(resumoDoacoesData.outros_insumos);
    } else {
      resumoDoacoes.dinheiro = doacoesList
        .filter(d => d && String(d.tipo || '').toLowerCase() === 'dinheiro')
        .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);
      resumoDoacoes.racao = doacoesList
        .filter(d => d && String(d.tipo || '').toLowerCase() === 'racao')
        .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);
      resumoDoacoes.medicamentos = doacoesList
        .filter(d => d && String(d.tipo || '').toLowerCase() === 'medicamento')
        .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);
      resumoDoacoes.outros_insumos = doacoesList
        .filter(d => d && ['higiene', 'limpeza', 'conforto'].includes(String(d.tipo || '').toLowerCase()))
        .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);
    }

    animarNumero(
      document.getElementById('totalDinheiroDash'),
      Number(resumoDoacoes.dinheiro || 0),
      1200,
      true
    );
    setElementText('totalRacaoDash', `${Number(resumoDoacoes.racao || 0)} KG`);
    setElementText('totalMedicamentosDash', `${Number(resumoDoacoes.medicamentos || 0)} un`);
    setElementText('totalOutrosInsumosDash', `${Number(resumoDoacoes.outros_insumos || 0)} un`);

      // Also populate compact dashboard card if present
      const compactMoneyEl = document.getElementById('totalDinheiroDashCompact');
      if (compactMoneyEl) compactMoneyEl.innerText = Number(parsePortugueseNumber(resumoDoacoes.dinheiro || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const compactRacaoEl = document.getElementById('totalRacaoDashCompact');
      if (compactRacaoEl) compactRacaoEl.innerText = `${Number(resumoDoacoes.racao || 0)} KG`;
      const compactMedEl = document.getElementById('totalMedicamentosDashCompact');
      if (compactMedEl) compactMedEl.innerText = `${Number(resumoDoacoes.medicamentos || 0)} un`;

    // ===== STATUS DAS ADOÇÕES =====
    let pendentes = 0;
    let aprovadas = 0;
    let recusadas = 0;

    if (adocoesResumo) {
      pendentes = Number(adocoesResumo.pendentes || 0);
      aprovadas = Number(adocoesResumo.aprovadas || 0);
      recusadas = Number(adocoesResumo.recusadas || 0);
    } else {
      pendentes = (adocoes || []).filter(a => {
        const status = String(a.status || '').toLowerCase();
        return status.includes('pendente') || status.includes('ativo') || status.includes('processamento');
      }).length;
      aprovadas = (adocoes || []).filter(a => {
        const status = String(a.status || '').toLowerCase();
        return status.includes('aprovado') || status.includes('concluído') || status.includes('concluido') || status.includes('finalizado');
      }).length;
      recusadas = (adocoes || []).filter(a => {
        const status = String(a.status || '').toLowerCase();
        return status.includes('recusado') || status.includes('reprovado') || status.includes('rejeitado');
      }).length;
    }

    setElementText('pendentes', pendentes);
    setElementText('aprovadas', aprovadas);
    setElementText('recusadas', recusadas);

    // Total para calcular porcentagem
    let totalStatus = pendentes + aprovadas + recusadas || 1;

    // Preenche as barras de progresso
    setElementWidth('barraPendentes', `${(pendentes / totalStatus) * 100}%`);
    setElementWidth('barraAprovadas', `${(aprovadas / totalStatus) * 100}%`);
    setElementWidth('barraRecusadas', `${(recusadas / totalStatus) * 100}%`);

    preencherKPIsEngajamento(metricasResumo);

    // ===== GRÁFICO DE DISTRIBUIÇÃO DOS ANIMAIS =====
    let disponiveis = (animais || []).filter(a => {
      const status = String(a.status || '').toLowerCase();
      return status.includes('disponível') || status.includes('disponivel');
    }).length;
    
    let reservados = (animais || []).filter(a => {
      const status = String(a.status || '').toLowerCase();
      return status.includes('reservado');
    }).length;
    
    let tratamento = (animais || []).filter(a => {
      const status = String(a.status || '').toLowerCase();
      return status.includes('tratamento');
    }).length;

    renderizarGraficoAnimais(disponiveis, reservados, tratamento);

    // ===== TIMESTAMP =====
    atualizarTimestamp();

  } catch (erro) {
    console.error('❌ Erro ao carregar dashboard:', erro);
    // Fallback: carregar do localStorage
    carregarDashboardComFallback();
  } finally {
    _arpaaDashboardLoading = false;
  }
}

function preencherKPIsEngajamento(metrica) {
  const kpisContainer = document.getElementById('kpisIndicadores');
  if (kpisContainer) {
    kpisContainer.style.display = 'grid';
    kpisContainer.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-3', 'gap-6');
  }

  const resumo = metrica || {};
  const taxaConversao = safeNumber(resumo.taxaConversao).toFixed(2);
  const taxaAdocaoReal = safeNumber(resumo.taxaAdocaoReal).toFixed(2);
  const tempoMedioMinutos = safeNumber(resumo.tempoMedioMinutos).toFixed(2);
  const taxaInteracao = safeNumber(resumo.taxaInteracao).toFixed(2);
  const clickParaPedido = safeNumber(resumo.cliqueParaPedido).toFixed(2);
  const pedidoParaAdocao = safeNumber(resumo.pedidoParaAdocao).toFixed(2);

  setElementText('taxaConversao', `${taxaConversao}%`);
  setElementText('taxaAdocaoReal', `${taxaAdocaoReal}%`);
  setElementText('tempoMedioMinutos', `${tempoMedioMinutos}`);
  setElementText('taxaInteracao', `${taxaInteracao}%`);
  setElementText('clickParaPedido', `${clickParaPedido}%`);
  setElementText('pedidoParaAdocao', `${pedidoParaAdocao}%`);

  setElementText('taxaConversaoDetalhe', `${resumo.totalPedidos || 0} pedidos / ${resumo.visitantesUnicos || 0} visitantes únicos`);
  setElementText('taxaAdocaoRealDetalhe', `${resumo.animaisAdotados || 0} adotados / ${resumo.animaisDisponiveis || 0} disponíveis`);
  setElementText('taxaInteracaoDetalhe', `${resumo.cliquesAnimais || 0} cliques / ${resumo.visitantesUnicos || 0} visitantes únicos`);
  setElementText('clickParaPedidoDetalhe', `${resumo.totalPedidos || 0} pedidos / ${resumo.cliquesAnimais || 0} cliques`);
  setElementText('pedidoParaAdocaoDetalhe', `${resumo.pedidosAprovados || 0} aprovações / ${resumo.totalPedidos || 0} pedidos`);
}

/**
 * Fallback para localStorage se API falhar
 */
function carregarDashboardComFallback() {
  console.log('📦 Usando fallback de localStorage...');
  
  let animais = safeParseJSON(localStorage.getItem('animais')) || [];
  let adocoes = safeParseJSON(localStorage.getItem('adocoes')) || [];
  let doacoesRaw = safeParseJSON(localStorage.getItem('arpaa_doacoes_dados'));
  let eventos = safeParseJSON(localStorage.getItem('eventos')) || [];
  const doacoes = Array.isArray(doacoesRaw) ? doacoesRaw : [];

  // Repetir lógica principal
  animarNumero(document.getElementById('totalAnimais'), animais.length);
  animarNumero(document.getElementById('totalAdocoes'), adocoes.length);
  animarNumero(document.getElementById('totalDoacoes'), doacoes.length);
  animarNumero(document.getElementById('totalEventos'), eventos.length);

  const dinheiro = doacoes
    .filter(d => d && String(d.tipo || '').toLowerCase() === 'dinheiro')
    .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);

  const racao = doacoes
    .filter(d => d && String(d.tipo || '').toLowerCase() === 'racao')
    .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);

  const medicamentos = doacoes
    .filter(d => d && String(d.tipo || '').toLowerCase() === 'medicamento')
    .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);

  const outrosInsumos = doacoes
    .filter(d => d && ['higiene', 'limpeza', 'conforto'].includes(String(d.tipo || '').toLowerCase()))
    .reduce((s, d) => s + parsePortugueseNumber(d.quantidade), 0);

  animarNumero(
    document.getElementById('totalDinheiroDash'),
    dinheiro,
    1200,
    true
  );
  setElementText('totalRacaoDash', `${racao} KG`);
  setElementText('totalMedicamentosDash', `${medicamentos} un`);
  setElementText('totalOutrosInsumosDash', `${outrosInsumos} un`);

  let pendentes = (adocoes || []).filter(a => {
    const status = String(a.status || '').toLowerCase();
    return status.includes('pendente') || status.includes('ativo') || status.includes('processamento');
  }).length;
  
  let aprovadas = (adocoes || []).filter(a => {
    const status = String(a.status || '').toLowerCase();
    return status.includes('aprovado') || status.includes('concluído') || status.includes('concluido') || status.includes('finalizado');
  }).length;
  
  let recusadas = (adocoes || []).filter(a => {
    const status = String(a.status || '').toLowerCase();
    return status.includes('recusado') || status.includes('reprovado') || status.includes('rejeitado');
  }).length;

  setElementText('pendentes', pendentes);
  setElementText('aprovadas', aprovadas);
  setElementText('recusadas', recusadas);

  let totalStatus = pendentes + aprovadas + recusadas || 1;

  setElementWidth('barraPendentes', `${(pendentes / totalStatus) * 100}%`);
  setElementWidth('barraAprovadas', `${(aprovadas / totalStatus) * 100}%`);
  setElementWidth('barraRecusadas', `${(recusadas / totalStatus) * 100}%`);

  let disponiveis = animais.filter(a => {
    const status = String(a.status || '').toLowerCase();
    return status.includes('disponível') || status.includes('disponivel');
  }).length;

  let reservados = animais.filter(a => {
    const status = String(a.status || '').toLowerCase();
    return status.includes('reservado');
  }).length;

  let tratamento = animais.filter(a => {
    const status = String(a.status || '').toLowerCase();
    return status.includes('tratamento');
  }).length;

  renderizarGraficoAnimais(disponiveis, reservados, tratamento);
  preencherKPIsEngajamento(null);
  atualizarTimestamp();
}

/**
 * Renderiza gráfico de distribuição dos animais
 */
function renderizarGraficoAnimais(disponiveis, reservados, tratamento) {
  const canvasAnimais = document.getElementById('graficoAnimais');
  if (!canvasAnimais) return;

  const ctx = canvasAnimais.getContext('2d');

  if (window.graficoAnimais instanceof Chart) {
    window.graficoAnimais.destroy();
  }

  window.graficoAnimais = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Disponíveis', 'Reservados', 'Em tratamento'],
      datasets: [{
        data: [disponiveis, reservados, tratamento],
        backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { boxWidth: 20, padding: 15 }
        }
      },
      cutout: '60%'
    }
  });

  const totalAnimaisDist = disponiveis + reservados + tratamento || 1;
  const disponiveisPercent = ((disponiveis / totalAnimaisDist) * 100).toFixed(0);
  const reservadosPercent = ((reservados / totalAnimaisDist) * 100).toFixed(0);
  const tratamentoPercent = ((tratamento / totalAnimaisDist) * 100).toFixed(0);

  setElementText('legendDisponiveis', `${disponiveis} (${disponiveisPercent}%)`);
  setElementText('legendReservados', `${reservados} (${reservadosPercent}%)`);
  setElementText('legendTratamento', `${tratamento} (${tratamentoPercent}%)`);
}

/**
 * Atualiza timestamp de quando o dashboard foi carregado
 */
function atualizarTimestamp() {
  const agora = new Date();

  setElementText('dataAtual',
    agora.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  );

  setElementText('ultimaAtualizacao',
    agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  );
}

/**
 * Anima um número de 0 até o valor final
 */
function animarNumero(elemento, valorFinal, duracao = 1000, isMoney = false) {
  if (!elemento) return;

  valorFinal = Number(valorFinal);
  if (!Number.isFinite(valorFinal)) {
    valorFinal = 0;
  }

  let inicio = 0;

  function atualizar() {
    let incremento = (valorFinal - inicio) * 0.1;
    inicio += incremento;

    if (Math.abs(valorFinal - inicio) < 0.5) {
      inicio = valorFinal;
    }

    if (isMoney) {
      elemento.innerText = Number(inicio).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    } else {
      elemento.innerText = Math.floor(inicio);
    }

    if (inicio < valorFinal) {
      requestAnimationFrame(atualizar);
    }
  }

  atualizar();
}

/**
 * Faz logout do admin
 */
function logout() {
  localStorage.removeItem('adminLogado');
  window.location.href = 'index.html';
}

console.log('✅ dashboard-loader.js carregado');

// Listener para atualização inter-abas das doações (debounced)
window.addEventListener('arpaa:doacoes:updated', (e) => {
  // Agrega eventos rápidos e evita múltiplas chamadas concorrentes
  if (_arpaaDashboardReloadTimer) clearTimeout(_arpaaDashboardReloadTimer);
  _arpaaDashboardReloadTimer = setTimeout(() => {
    if (!_arpaaDashboardLoading) {
      try {
        carregarDashboard();
      } catch (err) {
        console.warn('Erro ao recarregar dashboard a partir do evento de doações:', err && err.message);
      }
    } else {
      // Agendar tentativa leve para depois
      setTimeout(() => { if (!_arpaaDashboardLoading) carregarDashboard(); }, 500);
    }
  }, 250);
}, { passive: true });
