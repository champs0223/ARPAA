// ==========================================
// CONFIGURAÇÃO
// ==========================================

// URL base da API
// Desenvolvimento local:
// const API_BASE_URL = 'http://localhost:3000';
// Produção no Railway:
const API_BASE_URL = 'https://arpaa-production.up.railway.app';

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

/**
 * Função auxiliar para fazer requisições fetch
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição ${method} ${endpoint}:`, error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA USUÁRIOS
// ==========================================

/**
 * Listar todos os usuários
 */
async function listarUsuarios() {
  try {
    const usuarios = await apiRequest('/usuarios');
    console.log('Usuários:', usuarios);
    return usuarios;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}

/**
 * Obter usuário por ID
 */
async function obterUsuario(id) {
  try {
    const usuario = await apiRequest(`/usuarios/${id}`);
    console.log('Usuário:', usuario);
    return usuario;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    throw error;
  }
}

/**
 * Criar novo usuário
 */
async function criarUsuario(nome, cpf, senha) {
  try {
    const novoUsuario = await apiRequest('/usuarios', 'POST', {
      nome,
      cpf,
      senha
    });
    console.log('Usuário criado:', novoUsuario);
    return novoUsuario;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

/**
 * Atualizar usuário
 */
async function atualizarUsuario(id, nome, cpf, senha) {
  try {
    const usuarioAtualizado = await apiRequest(`/usuarios/${id}`, 'PUT', {
      nome,
      cpf,
      senha
    });
    console.log('Usuário atualizado:', usuarioAtualizado);
    return usuarioAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

/**
 * Deletar usuário
 */
async function deletarUsuario(id) {
  try {
    const resultado = await apiRequest(`/usuarios/${id}`, 'DELETE');
    console.log('Usuário deletado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA ANIMAIS
// ==========================================

/**
 * Listar todos os animais
 */
async function listarAnimais() {
  try {
    const animais = await apiRequest('/animais');
    console.log('Animais:', animais);
    return animais;
  } catch (error) {
    console.error('Erro ao listar animais:', error);
    throw error;
  }
}

/**
 * Obter animal por ID
 */
async function obterAnimal(id) {
  try {
    const animal = await apiRequest(`/animais/${id}`);
    console.log('Animal:', animal);
    return animal;
  } catch (error) {
    console.error('Erro ao obter animal:', error);
    throw error;
  }
}

/**
 * Listar animais com informações do usuário (JOIN)
 */
async function listarAnimaisComUsuario() {
  try {
    const animais = await apiRequest('/animais-com-usuario');
    console.log('Animais com usuário:', animais);
    return animais;
  } catch (error) {
    console.error('Erro ao listar animais com usuário:', error);
    throw error;
  }
}

/**
 * Criar novo animal
 */
async function criarAnimal(nome, especie, raca, data_nascimento, status, registrado_por) {
  try {
    const novoAnimal = await apiRequest('/animais', 'POST', {
      nome,
      especie,
      raca,
      data_nascimento,
      status,
      registrado_por
    });
    console.log('Animal criado:', novoAnimal);
    return novoAnimal;
  } catch (error) {
    console.error('Erro ao criar animal:', error);
    throw error;
  }
}

/**
 * Atualizar animal
 */
async function atualizarAnimal(id, nome, especie, raca, data_nascimento, status, registrado_por) {
  try {
    const animalAtualizado = await apiRequest(`/animais/${id}`, 'PUT', {
      nome,
      especie,
      raca,
      data_nascimento,
      status,
      registrado_por
    });
    console.log('Animal atualizado:', animalAtualizado);
    return animalAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    throw error;
  }
}

/**
 * Deletar animal
 */
async function deletarAnimal(id) {
  try {
    const resultado = await apiRequest(`/animais/${id}`, 'DELETE');
    console.log('Animal deletado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA ADOTANTES
// ==========================================

/**
 * Listar todos os adotantes
 */
async function listarAdotantes() {
  try {
    const adotantes = await apiRequest('/adotantes');
    console.log('Adotantes:', adotantes);
    return adotantes;
  } catch (error) {
    console.error('Erro ao listar adotantes:', error);
    throw error;
  }
}

/**
 * Obter adotante por ID
 */
async function obterAdotante(id) {
  try {
    const adotante = await apiRequest(`/adotantes/${id}`);
    console.log('Adotante:', adotante);
    return adotante;
  } catch (error) {
    console.error('Erro ao obter adotante:', error);
    throw error;
  }
}

/**
 * Criar novo adotante
 */
async function criarAdotante(nome, email, telefone, endereco, cidade, estado, cpf) {
  try {
    const novoAdotante = await apiRequest('/adotantes', 'POST', {
      nome,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cpf
    });
    console.log('Adotante criado:', novoAdotante);
    return novoAdotante;
  } catch (error) {
    console.error('Erro ao criar adotante:', error);
    throw error;
  }
}

/**
 * Atualizar adotante
 */
async function atualizarAdotante(id, nome, email, telefone, endereco, cidade, estado, cpf) {
  try {
    const adotanteAtualizado = await apiRequest(`/adotantes/${id}`, 'PUT', {
      nome,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cpf
    });
    console.log('Adotante atualizado:', adotanteAtualizado);
    return adotanteAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar adotante:', error);
    throw error;
  }
}

/**
 * Deletar adotante
 */
async function deletarAdotante(id) {
  try {
    const resultado = await apiRequest(`/adotantes/${id}`, 'DELETE');
    console.log('Adotante deletado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar adotante:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA ADOÇÕES
// ==========================================

/**
 * Listar todas as adoções
 */
async function listarAdocoes() {
  try {
    const adocoes = await apiRequest('/adocoes');
    console.log('Adoções:', adocoes);
    return adocoes;
  } catch (error) {
    console.error('Erro ao listar adoções:', error);
    throw error;
  }
}

/**
 * Obter adoção por ID
 */
async function obterAdocao(id) {
  try {
    const adocao = await apiRequest(`/adocoes/${id}`);
    console.log('Adoção:', adocao);
    return adocao;
  } catch (error) {
    console.error('Erro ao obter adoção:', error);
    throw error;
  }
}

/**
 * Criar nova adoção
 */
async function criarAdocao(animal_id, adotante_id, data_adocao, status) {
  try {
    const novaAdocao = await apiRequest('/adocoes', 'POST', {
      animal_id,
      adotante_id,
      data_adocao,
      status
    });
    console.log('Adoção criada:', novaAdocao);
    return novaAdocao;
  } catch (error) {
    console.error('Erro ao criar adoção:', error);
    throw error;
  }
}

/**
 * Atualizar adoção
 */
async function atualizarAdocao(id, animal_id, adotante_id, data_adocao, status) {
  try {
    const adocaoAtualizada = await apiRequest(`/adocoes/${id}`, 'PUT', {
      animal_id,
      adotante_id,
      data_adocao,
      status
    });
    console.log('Adoção atualizada:', adocaoAtualizada);
    return adocaoAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar adoção:', error);
    throw error;
  }
}

/**
 * Deletar adoção
 */
async function deletarAdocao(id) {
  try {
    const resultado = await apiRequest(`/adocoes/${id}`, 'DELETE');
    console.log('Adoção deletada:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar adoção:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA RESGATES
// ==========================================

/**
 * Listar todos os resgates
 */
async function listarResgates() {
  try {
    const resgates = await apiRequest('/resgates');
    console.log('Resgates:', resgates);
    return resgates;
  } catch (error) {
    console.error('Erro ao listar resgates:', error);
    throw error;
  }
}

/**
 * Obter resgate por ID
 */
async function obterResgate(id) {
  try {
    const resgate = await apiRequest(`/resgates/${id}`);
    console.log('Resgate:', resgate);
    return resgate;
  } catch (error) {
    console.error('Erro ao obter resgate:', error);
    throw error;
  }
}

/**
 * Criar novo resgate
 */
async function criarResgate(animal_id, local_resgate, data_resgate, responsavel_id) {
  try {
    const novoResgate = await apiRequest('/resgates', 'POST', {
      animal_id,
      local_resgate,
      data_resgate,
      responsavel_id
    });
    console.log('Resgate criado:', novoResgate);
    return novoResgate;
  } catch (error) {
    console.error('Erro ao criar resgate:', error);
    throw error;
  }
}

/**
 * Atualizar resgate
 */
async function atualizarResgate(id, animal_id, local_resgate, data_resgate, responsavel_id) {
  try {
    const resgateAtualizado = await apiRequest(`/resgates/${id}`, 'PUT', {
      animal_id,
      local_resgate,
      data_resgate,
      responsavel_id
    });
    console.log('Resgate atualizado:', resgateAtualizado);
    return resgateAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar resgate:', error);
    throw error;
  }
}

/**
 * Deletar resgate
 */
async function deletarResgate(id) {
  try {
    const resultado = await apiRequest(`/resgates/${id}`, 'DELETE');
    console.log('Resgate deletado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar resgate:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA TRATAMENTOS
// ==========================================

/**
 * Listar todos os tratamentos
 */
async function listarTratamentos() {
  try {
    const tratamentos = await apiRequest('/tratamentos');
    console.log('Tratamentos:', tratamentos);
    return tratamentos;
  } catch (error) {
    console.error('Erro ao listar tratamentos:', error);
    throw error;
  }
}

/**
 * Obter tratamento por ID
 */
async function obterTratamento(id) {
  try {
    const tratamento = await apiRequest(`/tratamentos/${id}`);
    console.log('Tratamento:', tratamento);
    return tratamento;
  } catch (error) {
    console.error('Erro ao obter tratamento:', error);
    throw error;
  }
}

/**
 * Criar novo tratamento
 */
async function criarTratamento(animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id) {
  try {
    const novoTratamento = await apiRequest('/tratamentos', 'POST', {
      animal_id,
      tipo_tratamento,
      data_inicio,
      data_termino,
      veterinario_id
    });
    console.log('Tratamento criado:', novoTratamento);
    return novoTratamento;
  } catch (error) {
    console.error('Erro ao criar tratamento:', error);
    throw error;
  }
}

/**
 * Atualizar tratamento
 */
async function atualizarTratamento(id, animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id) {
  try {
    const tratamentoAtualizado = await apiRequest(`/tratamentos/${id}`, 'PUT', {
      animal_id,
      tipo_tratamento,
      data_inicio,
      data_termino,
      veterinario_id
    });
    console.log('Tratamento atualizado:', tratamentoAtualizado);
    return tratamentoAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar tratamento:', error);
    throw error;
  }
}

/**
 * Deletar tratamento
 */
async function deletarTratamento(id) {
  try {
    const resultado = await apiRequest(`/tratamentos/${id}`, 'DELETE');
    console.log('Tratamento deletado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar tratamento:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA VACINAS
// ==========================================

/**
 * Listar todas as vacinas
 */
async function listarVacinas() {
  try {
    const vacinas = await apiRequest('/vacinas');
    console.log('Vacinas:', vacinas);
    return vacinas;
  } catch (error) {
    console.error('Erro ao listar vacinas:', error);
    throw error;
  }
}

/**
 * Obter vacina por ID
 */
async function obterVacina(id) {
  try {
    const vacina = await apiRequest(`/vacinas/${id}`);
    console.log('Vacina:', vacina);
    return vacina;
  } catch (error) {
    console.error('Erro ao obter vacina:', error);
    throw error;
  }
}

/**
 * Criar nova vacina
 */
async function criarVacina(animal_id, nome_vacina, data_aplicacao, validade, veterinario_id) {
  try {
    const novaVacina = await apiRequest('/vacinas', 'POST', {
      animal_id,
      nome_vacina,
      data_aplicacao,
      validade,
      veterinario_id
    });
    console.log('Vacina criada:', novaVacina);
    return novaVacina;
  } catch (error) {
    console.error('Erro ao criar vacina:', error);
    throw error;
  }
}

/**
 * Atualizar vacina
 */
async function atualizarVacina(id, animal_id, nome_vacina, data_aplicacao, validade, veterinario_id) {
  try {
    const vacinaAtualizada = await apiRequest(`/vacinas/${id}`, 'PUT', {
      animal_id,
      nome_vacina,
      data_aplicacao,
      validade,
      veterinario_id
    });
    console.log('Vacina atualizada:', vacinaAtualizada);
    return vacinaAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar vacina:', error);
    throw error;
  }
}

/**
 * Deletar vacina
 */
async function deletarVacina(id) {
  try {
    const resultado = await apiRequest(`/vacinas/${id}`, 'DELETE');
    console.log('Vacina deletada:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar vacina:', error);
    throw error;
  }
}

// ==========================================
// FUNÇÕES PARA HISTÓRICO
// ==========================================

/**
 * Listar todo o histórico de animais
 */
async function listarHistorico() {
  try {
    const historico = await apiRequest('/historico-animal');
    console.log('Histórico:', historico);
    return historico;
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    throw error;
  }
}

/**
 * Obter histórico por ID
 */
async function obterHistorico(id) {
  try {
    const registro = await apiRequest(`/historico-animal/${id}`);
    console.log('Histórico:', registro);
    return registro;
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    throw error;
  }
}

/**
 * Obter histórico de um animal específico
 */
async function obterHistoricoAnimal(animal_id) {
  try {
    const historico = await apiRequest(`/historico-animal/animal/${animal_id}`);
    console.log('Histórico do animal:', historico);
    return historico;
  } catch (error) {
    console.error('Erro ao obter histórico do animal:', error);
    throw error;
  }
}

/**
 * Criar novo registro no histórico
 */
async function criarHistorico(animal_id, tipo_evento, descricao, usuario_id) {
  try {
    const novoRegistro = await apiRequest('/historico-animal', 'POST', {
      animal_id,
      tipo_evento,
      descricao,
      usuario_id
    });
    console.log('Histórico criado:', novoRegistro);
    return novoRegistro;
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    throw error;
  }
}

/**
 * Atualizar histórico
 */
async function atualizarHistorico(id, animal_id, tipo_evento, descricao, usuario_id) {
  try {
    const registroAtualizado = await apiRequest(`/historico-animal/${id}`, 'PUT', {
      animal_id,
      tipo_evento,
      descricao,
      usuario_id
    });
    console.log('Histórico atualizado:', registroAtualizado);
    return registroAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error);
    throw error;
  }
}

/**
 * Deletar histórico
 */
async function deletarHistorico(id) {
  try {
    const resultado = await apiRequest(`/historico-animal/${id}`, 'DELETE');
    console.log('Histórico deletado:', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar histórico:', error);
    throw error;
  }
}

// ==========================================
// EXEMPLO DE USO (para testes no console)
// ==========================================

/*
// Teste: Listar animais
listarAnimais().then(animais => {
  console.table(animais);
}).catch(error => {
  console.error('Erro:', error);
});

// Teste: Criar animal
criarAnimal('Rex', 'Cão', 'Labrador', '2023-01-15', 'disponivel', 1)
  .then(animal => console.log('Animal criado:', animal))
  .catch(error => console.error('Erro:', error));

// Teste: Listar animais com usuário (JOIN)
listarAnimaisComUsuario().then(animais => {
  console.table(animais);
}).catch(error => {
  console.error('Erro:', error);
});
*/
