# 💾 Banco de Dados Local - ARPAA

## ✅ Sistema Sem MySQL - Tudo Armazenado Localmente

O ARPAA agora usa **banco de dados 100% local**, sem depender de MySQL ou qualquer servidor externo!

### 📦 Tecnologias Utilizadas

| Componente | Tecnologia | Uso |
|-----------|-----------|-----|
| **Armazenamento de Dados** | IndexedDB | Animais, adotantes, adoções, etc. |
| **Autenticação** | localStorage | Usuários e sessões do admin |
| **Imagens** | Base64 em localStorage | Upload local de fotos |

---

## 🚀 Como Usar

### 1. Abrir Aplicação

Basta abrir os arquivos HTML no navegador:

```bash
# Frontend público
open public/index.html

# Painel administrativo
open admin/index.html
```

### 2. Credenciais Padrão de Teste

O sistema cria dados de teste automaticamente:

```
👤 Usuário: admin
🔐 Senha: admin123
```

---

## 📊 Dados Disponíveis

### Pré-carregados
- ✅ 4 animais de teste (2 cães, 2 gatos)
- ✅ 2 adotantes de teste
- ✅ 1 adoção de teste
- ✅ 2 usuários (admin e voluntário)

### Criados ao Logar
- ✅ Tabelas no IndexedDB
- ✅ Dados de teste genéricos
- ✅ Sessão de autenticação

---

## 🗄️ Estrutura do Banco de Dados Local

### IndexedDB (`ARPAA_DB`)

```javascript
// Tabelas criadas automaticamente
- animais
  {
    id,                // Auto-incremento
    nome,
    especie,
    raca,
    idade,
    genero,
    porte,
    descricao,
    status,            // 'disponivel', 'adotado', 'resgate'
    data_resgate,
    foto,              // Base64
    registrado_por,    // ID do usuário
    created_at,
    updated_at
  }

- adotantes
  {
    id,
    nome,
    email,
    telefone,
    cpf,
    endereco,
    cidade,
    estado,
    status,
    created_at
  }

- adocoes
  {
    id,
    animal_id,
    adotante_id,
    data_adocao,
    status,
    observacoes,
    created_at
  }

- usuarios
  {
    id,
    nome,
    email,
    is_admin,
    created_at
  }

- resgates
  {
    id,
    animal_id,
    data_resgate,
    local_resgate,
    observacoes,
    created_at
  }

- tratamentos
  {
    id,
    animal_id,
    tipo_tratamento,
    data_inicio,
    data_fim,
    observacoes,
    created_at
  }

- vacinas
  {
    id,
    animal_id,
    nome_vacina,
    data_aplicacao,
    proximo_reforco,
    created_at
  }
```

### localStorage (`usuarios_app`)

```javascript
// Usuários (JSON)
[
  {
    id: 1,
    usuario: "admin",
    senha: "admin123",
    nome: "Administrador ARPAA",
    email: "admin@arpaa.com.br",
    is_admin: true,
    created_at: "..."
  },
  // ...
]
```

---

## 🔐 Autenticação Local

### Login
1. Entrada do usuário e senha
2. Busca em `localStorage.usuarios_app`
3. Se encontrado, salva em localStorage:
   - `adminLogado: "true"`
   - `usuarioId: 1`
   - `usuarioNome: "Administrador ARPAA"`
   - `usuarioAdmin: "1"`

### Logout
Limpa `adminLogado` e redireciona para login

---

## 📝 Operações CRUD

### Adicionar Animal

```javascript
// Chamar função direto
await criarAnimal({
  nome: "Spike",
  especie: "Cachorro",
  raca: "Pitbull",
  idade: 2,
  genero: "M",
  porte: "Grande",
  descricao: "Bravo",
  status: "disponivel",
  data_resgate: "2024-04-01",
  foto: null,
  registrado_por: 1
});
```

### Listar Animais

```javascript
const animais = await listarAnimais();
console.table(animais);
```

### Atualizar Animal

```javascript
await atualizarAnimal(1, {
  nome: "Spike Atualizado",
  status: "adotado"
});
```

### Deletar Animal

```javascript
await deletarAnimal(1);
```

---

## 🖼️ Upload de Imagens

Imagens são convertidas para **Base64** e salvas:
- Em IndexedDB (associadas ao animal)
- Em localStorage (cache)

```javascript
// O upload é feito automaticamente no painel admin
// Arquivo → Base64 → IndexedDB
```

---

## 💡 Console Browser (F12)

### Ver Todos os Dados

```javascript
// Abrir Console (F12) e rodar:

// Listar todos os animais
listarAnimais().then(console.table);

// Listar todos os adotantes
listarAdotantes().then(console.table);

// Ver status de conexão
console.log(API_BASE_URL);
console.log(USE_LOCAL_DB);
```

### Exportar Dados (JSON)

```javascript
// Copiar formato JSON de todos dados
const animais = await listarAnimais();
const adotantes = await listarAdotantes();
const backup = { animais, adotantes };
console.log(JSON.stringify(backup, null, 2));
copy(JSON.stringify(backup));  // Copia para clipboard
```

---

## 🧹 Limpar Dados Locais

### Via Console

```javascript
// Deletar todos os animais
dbLocal.clear('animais');

// Deletar todos os adotantes
dbLocal.clear('adotantes');

// Deletar todos os usuários
localStorage.removeItem('usuarios_app');
```

### Via DevTools

1. F12 → Application
2. IndexedDB → ARPAA_DB → Clique direito → Delete Database
3. localStorage → Clique em URLs → Delete All

---

## 📱 Persistência

- **Dados persistem** mesmo após fechar navegador
- **Dados persistem** mesmo após limpar cache
- **Dados são isolados por domínio** (localhost ≠ otra.com)

---

## ⚠️ Limitações

| Limite | Valor |
|--------|-------|
| **Espaço total** | ~50MB (varia por navegador) |
| **Tamanho Base64** | Máx 5MB por imagem (aprox.) |
| **Sincronização** | Não sincroniza entre abas/janelas |
| **Backup automático** | Nenhum (salvar JSON manualmente) |

---

## 🔄 Migrar para Backend Real

Quando quiser usar um backend real com MySQL:

1. **No `config-api.js`:**
   ```javascript
   const USE_LOCAL_DB = false;  // Mudar para false
   ```

2. **Backend deve estar rodando:**
   ```bash
   cd admin/backend
   npm install
   npm start  # Porta 3000
   ```

3. **As funções de fetch funcionam igual:**
   - Frontend usa `USE_LOCAL_DB` para decidir
   - Se `false`, envia requisições HTTP normais
   - Se `true`, usa IndexedDB/localStorage

---

## 🛠️ Desenvolvedor - Scripts Úteis

### Arquivos Importantes

```
public/
├── config-api.js           ← Configuração (USE_LOCAL_DB = true)
├── adote.html              ← Página de adoção
└── js/
    ├── db-local.js         ← Classe DBLocal (IndexedDB)
    ├── api-local.js        ← Funções CRUD (animals, users, etc)
    └── init-dados-locais.js ← Popula dados de teste

admin/
├── config-api.js           ← Mesma configuração
├── index.html              ← Login (usa fazerLogin local)
└── html/
    ├── animais.html        ← Painel animais (usa criarAnimal, etc)
    ├── adocoes.html        ← Painel adoções
    └── dashboard.html      ← Dashboard
```

### Adicionar Mais Dados

Edite `public/js/init-dados-locais.js` e adicione na função `inicializarDadosLocais()`:

```javascript
const animaisPadrao = [
  // Adicionar aqui
];
```

---

## 📞 Suporte

### Problema: "Dados desapareceram"
- ✅ Limpar cache do navegador (Ctrl+Shift+Delete)
- ✅ Usar navegação privada
- ✅ Checar Console (F12) para erros

### Problema: "Não consigo fazer login"
- ✅ Verifique credenciais: `admin` / `admin123`
- ✅ Abra Console e rode: `JSON.parse(localStorage.getItem('usuarios_app'))`
- ✅ Reinicie página (F5)

### Problema: "Imagens não aparecem"
- ✅ Base64 é suportado mas grande em tamanho
- ✅ Redimensione imagens antes de upload
- ✅ Limite máximo: ~5MB por imagem

---

## ✨ Benefícios

✅ Sem dependência de servidor backend  
✅ Funciona offline  
✅ Sem banco de dados para configurar  
✅ Mais rápido (sem latência de rede)  
✅ Sem custos de hospedagem DB  
✅ Dados isolados por navegador  

