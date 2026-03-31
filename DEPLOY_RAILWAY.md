# 🚀 Guia Completo: Deploy do Backend no Railway

## 📋 Pré-requisitos

1. ✅ Conta no Railway (https://railway.app)
2. ✅ Git instalado
3. ✅ Repositório GitHub do projeto

## 🔧 Passo 1: Preparar o Repositório Git

Se ainda não tem GitHub:

```bash
cd /workspaces/ARPAA
git init
git add .
git commit -m "Initial commit - ARPAA Backend"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ARPAA.git
git push -u origin main
```

Se já tem GitHub, apenas certifique-se de que tudo está commitado:

```bash
git status
git add .
git commit -m "Backend pronto para deploy"
git push
```

## 🚀 Passo 2: Deploy no Railway

### Opção A: Via GitHub (Recomendado)

1. Acesse https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Escolha **"Deploy from GitHub"**
5. Selecione o repositório **ARPAA**
6. Railway vai detectar Node.js automaticamente
7. Clique em **"Deploy"**

### Opção B: Via Railway CLI

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Fazer login
railway login

# 3. Ir para pasta do backend
cd /workspaces/ARPAA

# 4. Criar projeto no Railway
railway init

# 5. Fazer deploy
railway up
```

## 🔧 Passo 3: Configurar Variáveis de Ambiente no Railway

Após o deploy:

1. Acesse o projeto no Railway
2. Vá para **"Variables"**
3. Adicione as seguintes variáveis:

```
DB_HOST=hopper.proxy.rlwy.net
DB_PORT=55302
DB_USER=root
DB_PASSWORD=GRmZFEYJgGNFOVRyQkBCRlWCPLnJTxHo
DB_NAME=railway
NODE_ENV=production
PORT=3000
```

4. Clique em **"Deploy"** novamente

## 🌐 Passo 4: Obter URL do Backend

Após deploy bem-sucedido:

1. No painel do Railway, você verá a URL do seu backend
2. Será algo como: **`https://seu-app.railway.app`**
3. Copie essa URL

## 📝 Passo 5: Atualizar URLs no Frontend

Atualize todos os arquivos HTML para usar a URL do Railway:

**Em `admin/index.html`:**
```javascript
// Antigo:
const response = await fetch('http://localhost:3000/login', {

// Novo:
const response = await fetch('https://seu-app.railway.app/login', {
```

**Em `backend/api-examples.js`:**
```javascript
// Antigo:
const API_BASE_URL = 'http://localhost:3000';

// Novo:
const API_BASE_URL = 'https://seu-app.railway.app';
```

**Em `admin/exemplo-api.html`:**
```javascript
// Antigo:
const response = await fetch('http://localhost:3000/health');

// Novo:
const response = await fetch('https://seu-app.railway.app/health');
```

**Em `admin/debug-login.html`:**
```javascript
// Antigo:
const API_URL = 'http://localhost:3000';

// Novo:
const API_URL = 'https://seu-app.railway.app';
```

## ✅ Passo 6: Commit e Push das Alterações

```bash
cd /workspaces/ARPAA
git add .
git commit -m "Atualizar URLs para Railway production"
git push
```

Railway vai fazer redeploy automaticamente!

## 🧪 Passo 7: Testar o Deploy

```bash
# Testar health check
curl https://seu-app.railway.app/health

# Testar login
curl -X POST https://seu-app.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"1234"}'

# Testar listar animais
curl https://seu-app.railway.app/animais
```

## 🔍 Checklist Final

- ✅ Projeto criado no Railway
- ✅ GitHub conectado ao Railway
- ✅ Variáveis de ambiente configuradas
- ✅ Backend rodando em `https://seu-app.railway.app`
- ✅ URLs atualizadas nos HTMLs
- ✅ Testes passando
- ✅ Frontend conectando ao backend na nuvem

## 📊 Depois do Deploy

### Estrutura Final

```
Frontend (seu-site.com)
    ↓ (HTTPS)
Backend (seu-app.railway.app)
    ↓ (HTTPS)
MySQL (hopper.proxy.rlwy.net)
```

### Agora funciona em qualquer dispositivo! ✅

- ✅ Abra o site de qualquer dispositivo
- ✅ Baixe os arquivos em outro PC
- ✅ Tudo conecta ao Railway
- ✅ 100% funcional

## 🆘 Troubleshooting

### "Build error" no Railway

✅ Solução:
```bash
# Certifique-se que tem package.json e server.js
ls /workspaces/ARPAA/backend/package.json
ls /workspaces/ARPAA/backend/server.js
```

### "Cannot find module"

✅ Solução:
```bash
# Adicione dependencies que faltam
cd /workspaces/ARPAA/backend
npm install
```

### "Cannot connect to database"

✅ Solução:
- Verifique as variáveis no Railway
- Teste a conexão: `curl https://seu-app.railway.app/health`
- Confirme credenciais MySQL

### CORS error no frontend

✅ Já está configurado em `server.js`:
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📞 Suporte Railway

- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

---

**Depois de fazer o deploy, me avisa para eu atualizar automaticamente os URLs!** 🚀
