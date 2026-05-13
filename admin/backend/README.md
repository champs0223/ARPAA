# 🐾 Backend ARPAA - Sistema de Gerenciamento de Animais

## 📋 Visão Geral

Backend Node.js + Express para o sistema ARPAA, usando armazenamento local em arquivo JSON (`admin/backend/db/data.json`).
Não requer servidor de banco de dados externo, MySQL ou SQLite.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
<<<<<<< HEAD
cd admin/backend
=======
cd /workspaces/ARPAA/admin/backend
>>>>>>> 4cc6fcc30f9952eb357fe306f7d99242ab0a5710
npm install
```

### 2. Configurar Variáveis de Ambiente

O backend usa apenas o Cloudinary para upload de fotos. Configure as variáveis abaixo:

```
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Configurar Cloudinary para Upload de Fotos

Para habilitar o upload de fotos dos animais:

1. **Crie uma conta gratuita no [Cloudinary](https://cloudinary.com)**
2. **Acesse o Dashboard** e copie as credenciais:
   - Cloud Name
   - API Key
   - API Secret
3. **Preencha as variáveis no arquivo `.env`**:
   ```
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   ```
4. **Reinicie o servidor** após configurar as credenciais

### 4. Iniciar o Servidor

```bash
npm start
```

Ou em modo desenvolvimento:

```bash
npm run dev
```

O servidor iniciará na porta **3000** e será acessível em:
- **http://0.0.0.0:3000** (servidor)
- **http://hopper.proxy.rlwy.net:3000** (nuvem)

## 📡 Endpoints da API

### Verificar Status do Servidor

```
GET /health
```

### Usuários

```
GET    /usuarios              # Listar todos
GET    /usuarios/:id          # Obter por ID
POST   /usuarios              # Criar novo
PUT    /usuarios/:id          # Atualizar
DELETE /usuarios/:id          # Deletar
```

**Exemplo de criação:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "11999999999",
  "tipo": "admin"
}
```

### Animais

```
GET    /animais               # Listar todos
GET    /animais/:id           # Obter por ID
POST   /animais               # Criar novo
PUT    /animais/:id           # Atualizar
DELETE /animais/:id           # Deletar
GET    /animais-com-usuario   # Listar com JOIN ao usuário
```

**Exemplo de criação:**
```json
{
  "nome": "Rex",
  "especie": "Cão",
  "raca": "Labrador",
  "data_nascimento": "2023-01-15",
  "status": "disponivel",
  "registrado_por": 1
}
```

### Adotantes

```
GET    /adotantes             # Listar todos
GET    /adotantes/:id         # Obter por ID
POST   /adotantes             # Criar novo
PUT    /adotantes/:id         # Atualizar
DELETE /adotantes/:id         # Deletar
```

### Adoções

```
GET    /adocoes               # Listar todos
GET    /adocoes/:id           # Obter por ID
POST   /adocoes               # Criar novo
PUT    /adocoes/:id           # Atualizar
DELETE /adocoes/:id           # Deletar
```

### Resgates

```
GET    /resgates              # Listar todos
GET    /resgates/:id          # Obter por ID
POST   /resgates              # Criar novo
PUT    /resgates/:id          # Atualizar
DELETE /resgates/:id          # Deletar
```

### Tratamentos

```
GET    /tratamentos           # Listar todos
GET    /tratamentos/:id       # Obter por ID
POST   /tratamentos           # Criar novo
PUT    /tratamentos/:id       # Atualizar
DELETE /tratamentos/:id       # Deletar
```

### Vacinas

```
GET    /vacinas               # Listar todos
GET    /vacinas/:id           # Obter por ID
POST   /vacinas               # Criar novo
PUT    /vacinas/:id           # Atualizar
DELETE /vacinas/:id           # Deletar
```

### Histórico de Animais

```
GET    /historico-animal           # Listar todo histórico
GET    /historico-animal/:id       # Obter por ID
GET    /historico-animal/animal/:animal_id  # Histórico de um animal
POST   /historico-animal           # Criar novo
PUT    /historico-animal/:id       # Atualizar
DELETE /historico-animal/:id       # Deletar
```

## 🔗 Integração Frontend

### Usar o arquivo de exemplos

Inclua o arquivo `api-examples.js` no seu HTML:

```html
<script src="../backend/api-examples.js"></script>
```

### Exemplos de Uso

#### Listar todos os animais:
```javascript
listarAnimais().then(animais => {
  console.log(animais);
  // Usar os dados no UI
}).catch(error => {
  console.error('Erro:', error);
});
```

#### Cadastrar novo animal:
```javascript
criarAnimal(
  'Rex',                    // nome
  'Cão',                    // especie
  'Labrador',              // raca
  '2023-01-15',            // data_nascimento
  'disponivel',            // status
  1                        // registrado_por (ID do usuário)
).then(animal => {
  console.log('Animal criado:', animal);
  // Atualizar UI
}).catch(error => {
  console.error('Erro ao criar animal:', error);
});
```

#### Listar animais com informações do usuário (JOIN):
```javascript
listarAnimaisComUsuario().then(animais => {
  console.log('Animais com usuário:');
  animais.forEach(animal => {
    console.log(`${animal.nome} - Registrado por: ${animal.nome_usuario}`);
  });
}).catch(error => {
  console.error('Erro:', error);
});
```

## ⚙️ Características Técnicas

### ✅ Implementado

- ✓ Conexão com MySQL usando `mysql2/promise`
- ✓ Async/await para todas as queries
- ✓ CORS habilitado para todas as origens
- ✓ Tratamento de erros com try/catch
- ✓ Respostas em JSON
- ✓ Suporte a UUIDs (12 caracteres) nas tabelas
- ✓ Suporte a ID INT em usuários
- ✓ Pool de conexões para melhor performance
- ✓ Rotas REST completas (CRUD)
- ✓ Rota especial com JOIN (animais-com-usuario)
- ✓ Sem hardcoding de localhost
- ✓ Servidor na porta 3000

### 🔒 Segurança

**Nota:** As credenciais estão no `.env` por conveniência. Em produção:
- Use variáveis de ambiente reais
- Nunca comita `.env` no repositório
- Adicione `.env` ao `.gitignore`
- Use diferentes credenciais por ambiente

## 📊 Estrutura de Banco de Dados

### Tabelas esperadas:

- `usuarios` (INT id)
- `animais` (CHAR 12 id)
- `adotantes` (CHAR 12 id)
- `adocoes` (CHAR 12 id)
- `resgates` (CHAR 12 id)
- `tratamentos` (CHAR 12 id)
- `vacinas` (CHAR 12 id)
- `historico_animal` (CHAR 12 id)

## 🧪 Testar com cURL

### Verificar saúde do servidor:
```bash
curl http://0.0.0.0:3000/health
```

### Listar animais:
```bash
curl http://0.0.0.0:3000/animais
```

### Criar animal:
```bash
curl -X POST http://0.0.0.0:3000/animais \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Rex",
    "especie": "Cão",
    "raca": "Labrador",
    "data_nascimento": "2023-01-15",
    "status": "disponivel",
    "registrado_por": 1
  }'
```

### Listar animais com usuário:
```bash
curl http://0.0.0.0:3000/animais-com-usuario
```

## 🐛 Troubleshooting

### "Erro ao conectar no banco de dados"
- Verifique credenciais em `.env`
- Verifique conectividade de rede
- Confirme que o banco Railway está ativo

### "Rota não encontrada"
- Verifique se a rota está documentada acima
- Confirme se os dados estão no formato JSON correto

### CORS erro no frontend
- CORS está habilitado para `*` (todas as origens)
- Se problema persistir, verifique headers na requisição

## 📝 Variáveis de Ambiente

```
DB_HOST=hopper.proxy.rlwy.net    # Host do banco
DB_PORT=55302                     # Porta do banco
DB_USER=root                      # Usuário do banco
DB_PASSWORD=GRmZFEYJgGNFOVRyQkBCRlWCPLnJTxHo  # Senha do banco
DB_NAME=railway                   # Nome do banco
NODE_ENV=development              # Ambiente (development/production)
```

## 🔄 Fluxo de Requisição

1. Frontend faz requisição fetch
2. Express recebe e valida
3. Conexão obtida do pool MySQL
4. Query executada com async/await
5. Resultado retornado em JSON
6. Conexão liberada para reutilização
7. Frontend recebe e processa

## 📦 Dependências

- `express` - Framework web
- `mysql2` - Driver MySQL com promises
- `cors` - Middleware CORS
- `dotenv` - Variáveis de ambiente

## 🚀 Deploy

Para deploy em produção:

1. Atualize credenciais em `.env`
2. Configure `NODE_ENV=production`
3. Use gerenciador de processos (PM2, Forever, etc)
4. Configure reverse proxy (Nginx, Apache, etc)
5. Habilite HTTPS

---

**Desenvolvido para ARPAA** 🐾
