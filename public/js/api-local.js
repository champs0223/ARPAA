/**
 * API Local - Simula endpoints de um backend
 * Usa IndexedDB + localStorage para armazenamento
 */

// Aguardar que dbLocal esteja inicializado
async function esperarDB() {
  while (!window.dbLocal?.db) {
    await new Promise(r => setTimeout(r, 100));
  }
  return window.dbLocal;
}

// ===================== ANIMAIS =====================

async function listarAnimais() {
  try {
    const db = await esperarDB();
    const animais = await db.getAll('animais');
    return animais;
  } catch (error) {
    console.error('Erro ao listar animais:', error);
    throw error;
  }
}

async function obterAnimal(id) {
  try {
    const db = await esperarDB();
    const animal = await db.get('animais', parseInt(id));
    if (!animal) throw new Error('Animal não encontrado');
    return animal;
  } catch (error) {
    console.error('Erro ao obter animal:', error);
    throw error;
  }
}

async function criarAnimal(dados) {
  try {
    const db = await esperarDB();
    dados.created_at = new Date().toISOString();
    dados.updated_at = new Date().toISOString();
    const id = await db.put('animais', dados);
    return { ...dados, id };
  } catch (error) {
    console.error('Erro ao criar animal:', error);
    throw error;
  }
}

async function atualizarAnimal(id, dados) {
  try {
    const db = await esperarDB();
    const animal = await db.get('animais', parseInt(id));
    if (!animal) throw new Error('Animal não encontrado');
    
    const atualizado = { ...animal, ...dados, updated_at: new Date().toISOString() };
    await db.put('animais', atualizado);
    return atualizado;
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    throw error;
  }
}

async function deletarAnimal(id) {
  try {
    const db = await esperarDB();
    await db.delete('animais', parseInt(id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    throw error;
  }
}

// ===================== ADOTANTES =====================

async function listarAdotantes() {
  try {
    const db = await esperarDB();
    return await db.getAll('adotantes');
  } catch (error) {
    console.error('Erro ao listar adotantes:', error);
    throw error;
  }
}

async function criarAdotante(dados) {
  try {
    const db = await esperarDB();
    dados.created_at = new Date().toISOString();
    const id = await db.put('adotantes', dados);
    return { ...dados, id };
  } catch (error) {
    console.error('Erro ao criar adotante:', error);
    throw error;
  }
}

async function atualizarAdotante(id, dados) {
  try {
    const db = await esperarDB();
    const adotante = await db.get('adotantes', parseInt(id));
    if (!adotante) throw new Error('Adotante não encontrado');
    
    const atualizado = { ...adotante, ...dados, updated_at: new Date().toISOString() };
    await db.put('adotantes', atualizado);
    return atualizado;
  } catch (error) {
    console.error('Erro ao atualizar adotante:', error);
    throw error;
  }
}

// ===================== ADOÇÕES =====================

async function listarAdocoes() {
  try {
    const db = await esperarDB();
    return await db.getAll('adocoes');
  } catch (error) {
    console.error('Erro ao listar adoções:', error);
    throw error;
  }
}

async function criarAdocao(dados) {
  try {
    const db = await esperarDB();
    dados.created_at = new Date().toISOString();
    const id = await db.put('adocoes', dados);
    return { ...dados, id };
  } catch (error) {
    console.error('Erro ao criar adoção:', error);
    throw error;
  }
}

// ===================== AUTENTICAÇÃO =====================

async function fazerLogin(usuario, senha) {
  try {
    // Validação simples local (sem backend)
    const usuariosLocais = localStorage.getItem('usuarios_app');
    const usuarios = usuariosLocais ? JSON.parse(usuariosLocais) : [];
    
    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);
    
    if (!usuarioEncontrado) {
      throw new Error('Usuário ou senha incorretos');
    }

    // Salvar session
    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
    localStorage.setItem('adminLogado', 'true');
    localStorage.setItem('usuarioId', usuarioEncontrado.id);
    localStorage.setItem('usuarioNome', usuarioEncontrado.nome);
    localStorage.setItem('usuarioAdmin', usuarioEncontrado.is_admin ? '1' : '0');

    return usuarioEncontrado;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

async function criarUsuario(dados) {
  try {
    const usuariosLocais = localStorage.getItem('usuarios_app');
    const usuarios = usuariosLocais ? JSON.parse(usuariosLocais) : [];
    
    // Gerar ID simples
    const id = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
    const novoUsuario = { ...dados, id, created_at: new Date().toISOString() };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios_app', JSON.stringify(usuarios));
    
    return novoUsuario;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// ===================== RESGATES =====================

async function listarResgates() {
  try {
    const db = await esperarDB();
    return await db.getAll('resgates');
  } catch (error) {
    console.error('Erro ao listar resgates:', error);
    throw error;
  }
}

async function criarResgate(dados) {
  try {
    const db = await esperarDB();
    dados.created_at = new Date().toISOString();
    const id = await db.put('resgates', dados);
    return { ...dados, id };
  } catch (error) {
    console.error('Erro ao criar resgate:', error);
    throw error;
  }
}

// ===================== TRATAMENTOS =====================

async function listarTratamentos() {
  try {
    const db = await esperarDB();
    return await db.getAll('tratamentos');
  } catch (error) {
    console.error('Erro ao listar tratamentos:', error);
    throw error;
  }
}

async function criarTratamento(dados) {
  try {
    const db = await esperarDB();
    dados.created_at = new Date().toISOString();
    const id = await db.put('tratamentos', dados);
    return { ...dados, id };
  } catch (error) {
    console.error('Erro ao criar tratamento:', error);
    throw error;
  }
}

// ===================== VACINAS =====================

async function listarVacinas() {
  try {
    const db = await esperarDB();
    return await db.getAll('vacinas');
  } catch (error) {
    console.error('Erro ao listar vacinas:', error);
    throw error;
  }
}

async function criarVacina(dados) {
  try {
    const db = await esperarDB();
    dados.created_at = new Date().toISOString();
    const id = await db.put('vacinas', dados);
    return { ...dados, id };
  } catch (error) {
    console.error('Erro ao criar vacina:', error);
    throw error;
  }
}

// ===================== UPLOAD DE IMAGENS =====================

async function fazerUploadImagem(arquivo) {
  try {
    // Converter arquivo para base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        // Salvar referência em localStorage
        const uploads = JSON.parse(localStorage.getItem('uploads') || '{}');
        const id = 'img_' + Date.now();
        uploads[id] = {
          data: base64,
          nome: arquivo.name,
          tipo: arquivo.type,
          data_upload: new Date().toISOString()
        };
        localStorage.setItem('uploads', JSON.stringify(uploads));
        resolve({ id, url: base64, nome: arquivo.name });
      };
      reader.onerror = reject;
      reader.readAsDataURL(arquivo);
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
}

console.log('⚠️ Módulo API Local carregado (IndexedDB + localStorage disponível)');
