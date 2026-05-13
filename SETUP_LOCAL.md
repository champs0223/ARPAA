# Setup Local - ARPAA

## 1. Backend (Node.js + MySQL)

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 5.7+ rodando localmente

### Configuração

1. **Entrar na pasta do backend:**
```bash
cd admin/backend
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Criar arquivo `.env`** (copie `.env.example` e configure):
```bash
cp .env.example .env
```

4. **Editar `.env` com seus dados locais:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=arpaa
NODE_ENV=development
PORT=3000
```

5. **Criar banco de dados:**
```bash
npm run init-db
# ou execute manualmente:
mysql -u root -p < db/create-schema.sql
```

6. **Iniciar servidor:**
```bash
npm start
```

> ✅ Backend rodando em: **http://localhost:3000**

---

## 2. Frontend (Cliente)

### Ambiente Local
O frontend **detecta automaticamente** se você está em ambiente local:

- **Localhost**: Conecta em `http://localhost:3000`
- **IP Local** (192.168.x.x, etc): Conecta em `http://[seu-ip]:3000`
- **Produção**: Conecta em `https://arpaa-production.up.railway.app`

### Não precisa fazer nada! 
A detecção é automática via `config-api.js`

### Testar Frontend
Abra os arquivos HTML em um navegador:
- **Site público**: `/public/index.html`
- **Painel admin**: `/admin/index.html`

---

## 3. Caminho de Requisições (Fluxo)

```
FRONTEND (browser)
    ↓ (detecta localhost/produção)
    ↓ 
API_BASE_URL (definida em config-api.js)
    ↓
BACKEND Express API
    ↓
MySQL Database
```

### Configuração Centralizada
- `admin/config-api.js` - Detecta ambiente do backend admin
- `public/config-api.js` - Detecta ambiente do frontend público
- Ambos usam a **mesma lógica** de detecção

---

## 4. Verificar Conexão

### Via Console do Navegador (F12):
```javascript
// Deve mostrar a URL da API
console.log(API_BASE_URL)

// Testar conexão
fetch(`${API_BASE_URL}/health`).then(r => r.json()).then(console.log)
```

### Via Terminal:
```bash
curl http://localhost:3000/health
```

---

## 5. Dados Persistentes

### localStorage (Autenticação Admin)
- `adminLogado`: "true" / "false"
- `usuarioId`: ID do admin
- `usuarioNome`: Nome do admin
- `usuarioAdmin`: 1/0 (boolean)

### Banco de Dados (Dados de Animais)
Todos os animais, adotantes, etc. são salvos em MySQL

---

## 6. Troubleshooting

### "Erro de conexão com o servidor"
- Verifique se Backend está rodando: `npm start` em `admin/backend`
- Verifique porta: Backend deve estar em **3000**
- Limpe cache: Ctrl+Shift+Delete no navegador

### "Erro ao buscar animais"
- Verifique se MySQL está rodando
- Verifique credenciais em `.env`
- Verifique se banco `arpaa` foi criado

### "API_BASE_URL is not defined"
- Reinicie o servidor
- Verifique se `config-api.js` está sendo carregado (F12 > Network tab)

---

## 7. Arquivos Importantes

```
ARPAA/
├── admin/
│   ├── config-api.js              ← Configuração centralizada (admin)
│   ├── backend/
│   │   ├── server.js              ← Servidor Express
│   │   ├── .env                   ← Variáveis de ambiente (criar)
│   │   ├── db/
│   │   │   ├── connection.js      ← Conexão MySQL
│   │   │   └── create-schema.sql  ← Script do banco
│   │   └── routes/                ← APIs
│   └── html/
│       ├── animais.html           ← Painel animais
│       ├── adocoes.html           ← Painel adoções
│       └── dashboard.html         ← Dashboard
│
├── public/
│   ├── config-api.js              ← Configuração centralizada (público)
│   ├── adote.html                 ← Página de adoção
│   └── index.html                 ← Homepage
│
└── admin/index.html               ← Login do admin
```

