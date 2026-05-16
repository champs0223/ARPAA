# 📚 Guia de Integração Frontend - API ARPAA

## 🔧 Como Usar a API no Seu Frontend

### 1. Incluir o Arquivo de Funções

No seu arquivo HTML, inclua o arquivo de funções logo antes do fechamento da tag `</body>`:

```html
<!-- Incluir arquivo de funções fetch da API -->
<script src="../backend/api-examples.js"></script>
```

### 2. Exemplos Práticos

#### Exemplo 1: Listar Animais na Página

```html
<div id="lista-animais"></div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const animais = await listarAnimais();
    
    const html = animais.map(animal => `
      <div class="animal-card">
        <h3>${animal.nome}</h3>
        <p>Espécie: ${animal.especie}</p>
        <p>Raça: ${animal.raca}</p>
        <p>Status: ${animal.status}</p>
      </div>
    `).join('');
    
    document.getElementById('lista-animais').innerHTML = html;
  } catch (error) {
    console.error('Erro ao listar animais:', error);
  }
});
</script>
```

#### Exemplo 2: Formulário para Cadastrar Animal

```html
<form id="form-novo-animal">
  <input type="text" id="nome" placeholder="Nome" required>
  <input type="text" id="especie" placeholder="Espécie" required>
  <input type="text" id="raca" placeholder="Raça" required>
  <input type="date" id="data_nascimento" required>
  <select id="status" required>
    <option value="disponivel">Disponível</option>
    <option value="adotado">Adotado</option>
  </select>
  <input type="number" id="registrado_por" placeholder="ID do Usuário" required>
  <button type="submit">Cadastrar</button>
</form>

<script>
document.getElementById('form-novo-animal').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const animal = await criarAnimal(
      document.getElementById('nome').value,
      document.getElementById('especie').value,
      document.getElementById('raca').value,
      document.getElementById('data_nascimento').value,
      document.getElementById('status').value,
      parseInt(document.getElementById('registrado_por').value)
    );
    
    alert('Animal criado com sucesso!');
    document.getElementById('form-novo-animal').reset();
    
    // Atualizar lista se necessário
    // ...
  } catch (error) {
    alert('Erro ao criar animal: ' + error.message);
  }
});
</script>
```

#### Exemplo 3: Listar Animais com Usuário (JOIN)

```html
<table id="tabela-animais">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Espécie</th>
      <th>Registrado por</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<script>
async function carregarTabela() {
  try {
    const animais = await listarAnimaisComUsuario();
    
    const tbody = document.querySelector('#tabela-animais tbody');
    tbody.innerHTML = animais.map(animal => `
      <tr>
        <td>${animal.nome}</td>
        <td>${animal.especie}</td>
        <td>${animal.nome_usuario || 'N/A'}</td>
        <td>${animal.email_usuario || 'N/A'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Carregar ao iniciar página
document.addEventListener('DOMContentLoaded', carregarTabela);
</script>
```

#### Exemplo 4: Deletar Animal

```html
<button onclick="deletarAnimalPorId('abc123')">Deletar</button>

<script>
async function deletarAnimalPorId(id) {
  if (confirm('Tem certeza que deseja deletar este animal?')) {
    try {
      const resultado = await deletarAnimal(id);
      alert('Animal deletado com sucesso!');
      // Atualizar página ou listar novamente
      location.reload();
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  }
}
</script>
```

#### Exemplo 5: Atualizar Animal

```html
<form id="form-editar-animal">
  <input type="hidden" id="animal_id" value="abc123">
  <input type="text" id="nome" placeholder="Nome" value="Rex">
  <input type="text" id="especie" placeholder="Espécie" value="Cão">
  <input type="text" id="raca" placeholder="Raça" value="Labrador">
  <input type="date" id="data_nascimento" value="2023-01-15">
  <select id="status">
    <option value="disponivel" selected>Disponível</option>
    <option value="adotado">Adotado</option>
  </select>
  <input type="number" id="registrado_por" value="1">
  <button type="submit">Salvar Alterações</button>
</form>

<script>
document.getElementById('form-editar-animal').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('animal_id').value;
  
  try {
    const animal = await atualizarAnimal(
      id,
      document.getElementById('nome').value,
      document.getElementById('especie').value,
      document.getElementById('raca').value,
      document.getElementById('data_nascimento').value,
      document.getElementById('status').value,
      parseInt(document.getElementById('registrado_por').value)
    );
    
    alert('Animal atualizado com sucesso!');
  } catch (error) {
    alert('Erro ao atualizar: ' + error.message);
  }
});
</script>
```

### 3. Tratamento de Erros

Todas as funções usam try/catch internamente. Trate os erros assim:

```javascript
try {
  const animais = await listarAnimais();
  // Usar dados
} catch (error) {
  console.error('Erro:', error.message);
  // Mostrar mensagem ao usuário
  alert('Erro ao carregar dados. Tente novamente.');
}
```

### 4. Endpoints Disponíveis

#### Usuários
```javascript
await listarUsuarios()
await obterUsuario(id)
await criarUsuario(nome, email, telefone, tipo)
await atualizarUsuario(id, nome, email, telefone, tipo)
await deletarUsuario(id)
```

#### Animais
```javascript
await listarAnimais()
await obterAnimal(id)
await criarAnimal(nome, especie, raca, data_nascimento, status, registrado_por)
await atualizarAnimal(id, nome, especie, raca, data_nascimento, status, registrado_por)
await deletarAnimal(id)
await listarAnimaisComUsuario()  // ⭐ Rota especial com JOIN
```

#### Adotantes
```javascript
await listarAdotantes()
await obterAdotante(id)
await criarAdotante(nome, email, telefone, endereco, cidade, estado, cpf)
await atualizarAdotante(id, nome, email, telefone, endereco, cidade, estado, cpf)
await deletarAdotante(id)
```

#### Adoções
```javascript
await listarAdocoes()
await obterAdocao(id)
await criarAdocao(animal_id, adotante_id, data_adocao, status)
await atualizarAdocao(id, animal_id, adotante_id, data_adocao, status)
await deletarAdocao(id)
```

#### Resgates
```javascript
await listarResgates()
await obterResgate(id)
await criarResgate(animal_id, local_resgate, data_resgate, responsavel_id)
await atualizarResgate(id, animal_id, local_resgate, data_resgate, responsavel_id)
await deletarResgate(id)
```

#### Tratamentos
```javascript
await listarTratamentos()
await obterTratamento(id)
await criarTratamento(animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id)
await atualizarTratamento(id, animal_id, tipo_tratamento, data_inicio, data_termino, veterinario_id)
await deletarTratamento(id)
```

#### Vacinas
```javascript
await listarVacinas()
await obterVacina(id)
await criarVacina(animal_id, nome_vacina, data_aplicacao, validade, veterinario_id)
await atualizarVacina(id, animal_id, nome_vacina, data_aplicacao, validade, veterinario_id)
await deletarVacina(id)
```

#### Histórico
```javascript
await listarHistorico()
await obterHistorico(id)
await obterHistoricoAnimal(animal_id)
await criarHistorico(animal_id, tipo_evento, descricao, usuario_id)
await atualizarHistorico(id, animal_id, tipo_evento, descricao, usuario_id)
await deletarHistorico(id)
```

### 5. Dicas Importantes

✅ **Sempre use async/await**:
```javascript
// Certo
const animais = await listarAnimais();

// Evite callbacks antigos
// listarAnimais().then(...) funciona, mas async/await é melhor
```

✅ **Sempre trate erros**:
```javascript
try {
  // código
} catch (error) {
  console.error(error);
}
```

✅ **Mostre feedback ao usuário**:
```javascript
// Mostrar loader enquanto busca dados
elemento.innerHTML = '<p>Carregando...</p>';

try {
  const dados = await listarAnimais();
  elemento.innerHTML = renderizar(dados);
} catch (error) {
  elemento.innerHTML = '<p>Erro ao carregar</p>';
}
```

✅ **Use IDs corretos**:
- Usuários: INT (ex: 1, 2, 3)
- Animais: CHAR 12 (ex: "a1b2c3d4e5f6")
- Adotantes: CHAR 12
- Etc...

### 6. Teste de Conexão

Abra o Console (F12) e teste:

```javascript
// Verificar se está tudo certo
listarAnimais().then(console.table).catch(console.error);

// Ou
listarAnimaisComUsuario().then(animais => {
  console.log('Animais encontrados:', animais.length);
  console.table(animais);
});
```

### 7. Mudança da URL da API

Se precisar mudar o host da API (por exemplo, para produção), edite esta linha em `api-examples.js`:

```javascript
// Desenvolvimento
const API_BASE_URL = 'http://0.0.0.0:3000';

// Produção
const API_BASE_URL = 'http://hopper.proxy.rlwy.net:3000';

// Ou com variável de ambiente
const API_BASE_URL = process.env.API_URL || 'http://0.0.0.0:3000';
```

---

**Veja também:**
- [README do Backend](../backend/README.md)
- [Arquivo de Exemplo](./exemplo-api.html)
- [Funções da API](../backend/api-examples.js)
