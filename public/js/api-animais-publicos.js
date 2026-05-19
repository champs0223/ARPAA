/**
 * API Pública de Animais - ARPAA
 * Integração com backend MySQL para listar animais disponíveis para adoção
 * Endpoint: GET /animais (do backend em localhost:3001)
 */

const API_ANIMAIS_URL = typeof API_BASE_URL !== 'undefined' && API_BASE_URL !== 'LOCAL_DB'
  ? `${API_BASE_URL}/api/animais`
  : (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:3001/api/animais`
    : null);

console.log('🔗 API de animais configurada em:', API_ANIMAIS_URL);

/**
 * Normaliza URLs de imagem retornadas pelo banco de dados.
 * Substitui localhost ou 127.0.0.1 pelo API_BASE_URL fixo.
 */
function normalizeAnimalImageUrl(url) {
  if (!url) return url;

  const localHostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/i;
  if (localHostPattern.test(url)) {
    return url.replace(localHostPattern, `${API_BASE_URL}$3`);
  }

  let normalizedUrl = url.replace(/\\/g, '/');

  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = normalizedUrl.replace(/^\/+/, '');
    if (!normalizedUrl.startsWith('uploads/')) {
      normalizedUrl = `uploads/${normalizedUrl}`;
    }
    return `${API_BASE_URL}/${normalizedUrl}`;
  }

  return normalizedUrl;
}

/**
 * Busca animais disponíveis para adoção do backend MySQL
 * @returns {Promise<Array>} Array de animais com status 'disponivel'
 */
async function buscarAnimaisDisponiveisDoBackend() {
  try {
    if (!API_ANIMAIS_URL) {
      throw new Error('API_ANIMAIS_URL não está configurada');
    }

    console.log('📡 Buscando animais do backend:', API_ANIMAIS_URL);
    
    const response = await fetch(API_ANIMAIS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const animais = await response.json();
    console.log('✅ Animais recebidos do backend:', animais.length);

    // Filtrar apenas animais disponíveis
    const animaisDisponiveis = animais.filter(animal => 
      animal.status && animal.status.toLowerCase() === 'disponível'
    );

    console.log(`✅ Animais disponíveis para adoção: ${animaisDisponiveis.length}`);
    return animaisDisponiveis;

  } catch (error) {
    console.error('❌ Erro ao buscar animais do backend:', error.message);
    
    // Se falhar, tentar usar banco de dados local como fallback
    if (typeof listarAnimais === 'function') {
      console.log('⚠️ Usando banco de dados local como fallback...');
      try {
        const animaisLocais = await listarAnimais();
        return animaisLocais.filter(animal => 
          animal.status && animal.status.toLowerCase() === 'disponível'
        );
      } catch (localError) {
        console.error('❌ Erro também ao acessar banco local:', localError.message);
        return [];
      }
    }
    
    return [];
  }
}

/**
 * Busca um animal específico pelo ID
 * @param {number} animalId - ID do animal
 * @returns {Promise<Object>} Dados do animal
 */
async function buscarAnimalPorId(animalId) {
  try {
    if (!API_ANIMAIS_URL) {
      throw new Error('API_ANIMAIS_URL não está configurada');
    }

    const url = `${API_ANIMAIS_URL}/${animalId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const animal = await response.json();
    console.log('✅ Animal carregado:', animal.nome);
    return animal;

  } catch (error) {
    console.error('❌ Erro ao buscar animal por ID:', error.message);
    return null;
  }
}

/**
 * Salva uma solicitação de adoção (se existir endpoint)
 * @param {Object} solicitacao - Dados da solicitação
 * @returns {Promise<Object>} Resposta do servidor
 */
async function salvarSolicitacaoAdocao(solicitacao) {
  try {
    const baseUrl = API_ANIMAIS_URL.split('/animais')[0];
    const response = await fetch(`${baseUrl}/adocoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(solicitacao)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const resultado = await response.json();
    console.log('✅ Solicitação de adoção enviada com sucesso');
    return resultado;

  } catch (error) {
    console.error('❌ Erro ao enviar solicitação de adoção:', error.message);
    return { error: error.message };
  }
}
