/**
 * INTEGRAÇÃO API ARPAA - Site Público
 * 
 * Este arquivo fornece funções para carregar e exibir animais
 * do banco de dados do sistema administrativo
 */

// Detectar URL da API automaticamente
const getApiUrl = () => {
  // Usar a mesma origem da página sempre que possível.
  // Isso permite que o site funcione quando servido pelo backend em qualquer host/proxy.
  if (window.location.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }

  // Fallback para desenvolvimento local.
  return 'http://localhost:3000';
};

const API_URL = getApiUrl();

console.log('📡 Conectando à API em:', API_URL);

function uiShowError(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 z-50 max-w-sm bg-red-600 text-white p-4 rounded-2xl shadow-xl ring-1 ring-black/20 transition-opacity duration-300 opacity-90';
  const title = document.createElement('div');
  title.className = 'font-semibold text-white';
  title.textContent = 'Erro';

  const content = document.createElement('div');
  content.className = 'mt-1 text-sm text-white';
  content.textContent = message;

  toast.appendChild(title);
  toast.appendChild(content);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4200);
}

/**
 * Buscar todos os animais da API (versão simplificada SEM fotos)
 */
async function buscarAnimaisDaAPI() {
  try {
    console.log('🔄 Buscando animais da API...');
    
    // Usar /animais-simples para reduzir tamanho da resposta (sem fotos em base64)
    const response = await fetch(`${API_URL}/animais-simples`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Não usar credentials em desenvolvimento local
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }

    const animais = await response.json();
    console.log(`✅ ${animais.length} animais carregados com sucesso!`);
    
    return animais;
  } catch (error) {
    console.error('❌ Erro ao buscar animais:', error);
    throw error;
  }
}

/**
 * Buscar animal por ID
 */
async function buscarAnimalPorId(id) {
  try {
    const response = await fetch(`${API_URL}/animais/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Animal ${id} não encontrado`);
    }

    const animal = await response.json();
    return animal;
  } catch (error) {
    console.error(`❌ Erro ao buscar animal ${id}:`, error);
    throw error;
  }
}

/**
 * Criar novo animal (apenas admin)
 */
async function criarAnimalNoAdmin(animalData) {
  try {
    const formData = new FormData();
    
    // Adicionar campos simples
    Object.keys(animalData).forEach(key => {
      if (key !== 'foto') {
        formData.append(key, animalData[key]);
      }
    });

    // Adicionar foto se existir
    if (animalData.foto) {
      formData.append('foto', animalData.foto);
    }

    const response = await fetch(`${API_URL}/animais`, {
      method: 'POST',
      body: formData,
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar animal: ${response.statusText}`);
    }

    const novoAnimal = await response.json();
    console.log('✅ Animal criado com sucesso!', novoAnimal);
    
    return novoAnimal;
  } catch (error) {
    console.error('❌ Erro ao criar animal:', error);
    throw error;
  }
}

/**
 * Atualizar animal existente
 */
async function atualizarAnimal(id, animalData) {
  try {
    const formData = new FormData();
    
    Object.keys(animalData).forEach(key => {
      if (key !== 'foto') {
        formData.append(key, animalData[key]);
      }
    });

    if (animalData.foto) {
      formData.append('foto', animalData.foto);
    }

    const response = await fetch(`${API_URL}/animais/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar animal: ${response.statusText}`);
    }

    const animalAtualizado = await response.json();
    console.log('✅ Animal atualizado com sucesso!', animalAtualizado);
    
    return animalAtualizado;
  } catch (error) {
    console.error('❌ Erro ao atualizar animal:', error);
    throw error;
  }
}

/**
 * Deletar animal
 */
async function deletarAnimal(id) {
  try {
    const response = await fetch(`${API_URL}/animais/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar animal: ${response.statusText}`);
    }

    console.log(`✅ Animal ${id} deletado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao deletar animal ${id}:`, error);
    throw error;
  }
}

/**
 * Formatar foto base64 para exibição
 * Redimensiona se necessário para melhor performance
 */
function formatarFoto(fotoBase64, maxWidth = 400, maxHeight = 300) {
  if (!fotoBase64) {
    return 'https://via.placeholder.com/400x300?text=Sem+Foto';
  }

  // Se já é uma string data:image, retornar como está
  if (typeof fotoBase64 === 'string' && fotoBase64.startsWith('data:image')) {
    return fotoBase64;
  }

  // Adicionar data URI scheme se necessário
  if (typeof fotoBase64 === 'string' && !fotoBase64.startsWith('data:')) {
    return `data:image/jpeg;base64,${fotoBase64}`;
  }

  return fotoBase64;
}

/**
 * Criar card HTML para um animal
 */
function criarCardAnimal(animal) {
  const fotoUrl = formatarFoto(animal.foto_base64);
  const especie = animal.especie || 'Não informado';
  const raca = animal.raca || '';
  const idade = animal.idade_aproximada ? `${animal.idade_aproximada} anos` : 'Idade desconhecida';
  const sexo = animal.sexo || 'Não informado';
  const porte = animal.porte || 'Não informado';
  const status = animal.status || 'Disponível';

  return `
    <div class="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="relative pb-2/3 bg-gray-200 h-64 overflow-hidden">
        <img 
          src="${fotoUrl}" 
          alt="${animal.nome}" 
          class="w-full h-full object-cover"
          onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(animal.nome)}'"
        >
        <span class="absolute top-2 right-2 bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${status}
        </span>
      </div>
      
      <div class="p-4">
        <h3 class="text-xl font-bold text-teal-700 mb-2">${animal.nome}</h3>
        
        <div class="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-700">
          <div><strong>Espécie:</strong> ${especie}</div>
          <div><strong>Raça:</strong> ${raca || 'N/A'}</div>
          <div><strong>Idade:</strong> ${idade}</div>
          <div><strong>Sexo:</strong> ${sexo}</div>
          <div><strong>Porte:</strong> ${porte}</div>
        </div>

        <p class="text-gray-600 text-sm mb-4 line-clamp-3">
          ${animal.descricao || 'Sem descrição disponível'}
        </p>

        <button 
          onclick="verDetalhesAnimal(${animal.id})"
          class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Ver Detalhes <i class="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * Exibir modal com detalhes do animal
 */
async function verDetalhesAnimal(id) {
  try {
    const animal = await buscarAnimalPorId(id);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const fotoUrl = formatarFoto(animal.foto_base64);

    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div class="sticky top-0 bg-teal-600 text-white p-4 flex justify-between items-center">
          <h2 class="text-2xl font-bold">${animal.nome}</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-2xl">&times;</button>
        </div>

        <div class="p-6 space-y-4">
          <img src="${fotoUrl}" alt="${animal.nome}" class="w-full h-96 object-cover rounded-lg">

          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><strong>Espécie:</strong> ${animal.especie}</div>
            <div><strong>Raça:</strong> ${animal.raca || 'N/A'}</div>
            <div><strong>Idade:</strong> ${animal.idade_aproximada || 'N/A'} anos</div>
            <div><strong>Sexo:</strong> ${animal.sexo}</div>
            <div><strong>Porte:</strong> ${animal.porte}</div>
            <div><strong>Status:</strong> ${animal.status}</div>
          </div>

          <div>
            <strong>Descrição:</strong>
            <p class="text-gray-700 mt-2">${animal.descricao || 'Sem descrição disponível'}</p>
          </div>

          <button 
            onclick="this.closest('.fixed').remove()"
            class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    uiShowError('Erro ao carregar detalhes do animal: ' + error.message);
  }
}

/**
 * Carregar e renderizar animais na página
 */
async function carregarEExibirAnimais(containerId = 'animais-container') {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container com ID "${containerId}" não encontrado`);
    return;
  }

  // Mostrar loading
  container.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Carregando animais...</p>
    </div>
  `;

  try {
    const animais = await buscarAnimaisDaAPI();

    if (animais.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-paw text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Nenhum animal disponível</h3>
          <p class="text-gray-500">Volte em breve!</p>
        </div>
      `;
      return;
    }

    // Renderizar animais
    const html = animais
      .map(animal => criarCardAnimal(animal))
      .join('');
    
    container.innerHTML = html;
    console.log(`✅ ${animais.length} animais exibidos!`);

  } catch (error) {
    console.error('❌ Erro ao carregar animais:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-exclamation-circle text-6xl text-red-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Erro ao carregar animais</h3>
        <p class="text-gray-500 mb-4">${error.message}</p>
        <button 
          onclick="location.reload()"
          class="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded"
        >
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
  window.apiArpaa = {
    buscarAnimaisDaAPI,
    buscarAnimalPorId,
    criarAnimalNoAdmin,
    atualizarAnimal,
    deletarAnimal,
    formatarFoto,
    criarCardAnimal,
    verDetalhesAnimal,
    carregarEExibirAnimais,
    API_URL
  };
}
