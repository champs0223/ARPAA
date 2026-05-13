/**
 * Helper para adaptador API Local vs Remota
 * Funciona como um middleware entre o código frontend e o DB
 */

/**
 * Fazer requisição adaptada (local ou remota)
 */
async function fazerRequisicao(endpoint, opcoes = {}) {
  if (USE_LOCAL_DB) {
    return await fazerRequisicaoLocal(endpoint, opcoes);
  } else {
    return await fetch(`${API_BASE_URL}${endpoint}`, opcoes);
  }
}

/**
 * Processar resposta baseado no tipo
 */
async function processarRespostaLocal(endpoint, data) {
  const metodo = opcoes.method || 'GET';
  
  // Extrair tipo de endpoint
  if (endpoint.includes('/animais') && metodo === 'POST') {
    return await criarAnimal(data);
  }
  
  if (endpoint.includes('/animais/') && metodo === 'PUT') {
    const id = parseInt(endpoint.split('/').pop());
    return await atualizarAnimal(id, data);
  }
  
  if (endpoint.includes('/animais') && metodo === 'GET') {
    return await listarAnimais();
  }
  
  if (endpoint.includes('/animais/') && metodo === 'GET') {
    const id = parseInt(endpoint.split('/').pop());
    return await obterAnimal(id);
  }
  
  if (endpoint.includes('/animais/') && metodo === 'DELETE') {
    const id = parseInt(endpoint.split('/').pop());
    await deletarAnimal(id);
    return { success: true };
  }
  
  // Outros endpoints...
  return { success: true };
}

/**
 * Simular resposta estilo API para compatibilidade
 */
class RespostaLocal extends Response {
  constructor(dados) {
    const json = JSON.stringify(dados);
    super(json);
  }
  
  async json() {
    return JSON.parse(this.text);
  }
}

/**
 * Fazer requisição local (sem rede)
 */
async function fazerRequisicaoLocal(endpoint, opcoes = {}) {
  try {
    const metodo = opcoes.method || 'GET';
    const body = opcoes.body ? JSON.parse(opcoes.body) : null;
    
    // Parse endpoint
    const partes = endpoint.split('?')[0].split('/').filter(p => p);
    const recurso = partes[0];
    const id = partes[1];
    
    let resultado = null;
    let statusCode = 200;
    
    // ==================== ANIMAIS ====================
    if (recurso === 'animais') {
      if (metodo === 'GET' && !id) {
        resultado = await listarAnimais();
      } 
      else if (metodo === 'GET' && id) {
        resultado = await obterAnimal(parseInt(id));
      }
      else if (metodo === 'POST') {
        resultado = await criarAnimal(body);
      }
      else if (metodo === 'PUT' && id) {
        resultado = await atualizarAnimal(parseInt(id), body);
      }
      else if (metodo === 'DELETE' && id) {
        await deletarAnimal(parseInt(id));
        resultado = { success: true, message: 'Animal deletado' };
      }
    }
    
    // ==================== ADOTANTES ====================
    else if (recurso === 'adotantes') {
      if (metodo === 'GET' && !id) {
        resultado = await listarAdotantes();
      }
      else if (metodo === 'POST') {
        resultado = await criarAdotante(body);
      }
      else if (metodo === 'PUT' && id) {
        resultado = await atualizarAdotante(parseInt(id), body);
      }
    }
    
    // ==================== ADOÇÕES ====================
    else if (recurso === 'adocoes') {
      if (metodo === 'GET') {
        resultado = await listarAdocoes();
      }
      else if (metodo === 'POST') {
        resultado = await criarAdocao(body);
      }
    }
    
    // ==================== UPLOAD ====================
    else if (recurso === 'upload') {
      // Nota: Para upload usar formData, não JSON
      // Este é um caso especial que precisa de tratamento diferente
      resultado = { 
        success: false, 
        error: 'Use uploadArquivoLocal() para uploads'
      };
      statusCode = 400;
    }
    
    // ==================== LOGIN ====================
    else if (recurso === 'login') {
      try {
        resultado = await fazerLogin(body.usuario, body.senha);
        resultado = { 
          ...resultado,
          success: true,
          message: 'Login bem-sucedido'
        };
      } catch (erro) {
        resultado = { 
          success: false, 
          error: erro.message
        };
        statusCode = 401;
      }
    }
    
    // ==================== HEALTH ====================
    else if (recurso === 'health') {
      resultado = {
        status: 'OK',
        server: 'ARPAA Local Database',
        timestamp: new Date().toISOString()
      };
    }
    
    else {
      resultado = { error: 'Endpoint não encontrado' };
      statusCode = 404;
    }
    
    // Retornar objeto com mesma interface que fetch Response
    return {
      ok: statusCode < 400,
      status: statusCode,
      json: async () => resultado,
      text: async () => JSON.stringify(resultado),
      headers: new Map([['content-type', 'application/json']])
    };
    
  } catch (erro) {
    console.error('Erro em fazerRequisicaoLocal:', erro);
    return {
      ok: false,
      status: 500,
      json: async () => ({ error: erro.message }),
      text: async () => JSON.stringify({ error: erro.message })
    };
  }
}

/**
 * Upload de arquivo local (converte para Base64)
 */
async function uploadArquivoLocal(arquivo) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        
        // Salvar em localStorage
        const uploads = JSON.parse(localStorage.getItem('uploads') || '{}');
        const id = 'img_' + Date.now();
        
        uploads[id] = {
          data: base64,
          nome: arquivo.name,
          tipo: arquivo.type,
          tamanho: arquivo.size,
          data_upload: new Date().toISOString()
        };
        
        localStorage.setItem('uploads', JSON.stringify(uploads));
        
        resolve({
          success: true,
          foto_url: base64,
          upload_id: id,
          message: 'Arquivo salvo localmente'
        });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(arquivo);
    });
  } catch (erro) {
    console.error('Erro ao fazer upload local:', erro);
    throw erro;
  }
}

console.log('⚠️ Módulo API Helper carregado (local/remoto)');
