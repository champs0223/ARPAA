# 📊 Documentação - Contadores Dinâmicos do Dashboard ARPAA

## 📋 Resumo da Implementação

Os contadores do painel administrativo foram atualizados para carregar **dados dinâmicos da API** em vez de valores estáticos. O sistema mantém **compatibilidade total** com o código existente e funciona como fallback para localStorage se a API não responder.

---

## 🔗 Mapeamento de Contadores

| Contador | Rota da API | Status | Notas |
|----------|------------|--------|-------|
| `totalAnimais` | `GET /api/animais` | ✅ Ativo | Conta todos os animais |
| `totalAdocoes` | `GET /api/adocoes` | ✅ Ativo | Conta todas as adoções |
| `totalEventos` | `GET /api/admin/eventos` | ✅ Ativo | Conta todos os eventos |
| `totalDoacoes` | localStorage | ⚠️ Local | Sem tabela no DB ainda |
| `totalDinheiroDash` | localStorage | ⚠️ Local | Filtro por tipo=dinheiro |
| `totalItensDash` | localStorage | ⚠️ Local | Filtro por tipo≠dinheiro |
| `pendentes` | `GET /api/adocoes` | ✅ Ativo | Status contém 'pendente' |
| `aprovadas` | `GET /api/adocoes` | ✅ Ativo | Status contém 'aprovado' |
| `recusadas` | `GET /api/adocoes` | ✅ Ativo | Status contém 'recusado' |

---

## 📁 Arquivos Modificados

### 1. **admin/js/dashboard-loader.js** (NOVO)
Arquivo principal que carrega dados da API:
```javascript
// Função principal que carrega o dashboard
async function carregarDashboard()

// Fallback se API falhar
function carregarDashboardComFallback()

// Renderiza o gráfico de distribuição
function renderizarGraficoAnimais(disponiveis, reservados, tratamento)

// Atualiza timestamp
function atualizarTimestamp()

// Anima números
function animarNumero(elemento, valorFinal, duracao, isMoney)

// Logout
function logout()
```

### 2. **admin/html/dashboard.html** (MODIFICADO)
- ✅ Adicionado `<script src="../js/dashboard-loader.js"></script>`
- ✅ Removido script inline antigo (mantém funcionalidade)
- ✅ Carrega Chart.js antes do script de inicialização

### 3. **admin/html/teste-contadores.html** (NOVO)
Página de teste para validar endpoints da API:
- Testa todos os endpoints em paralelo
- Mostra contadores retornados
- Compara com dados do localStorage
- **URL:** `http://localhost:3000/admin/html/teste-contadores.html`

---

## 🔄 Fluxo de Funcionamento

```
┌─────────────────────────────────────┐
│ Dashboard HTML carrega              │
└──────────────────┬──────────────────┘
                   │
         ┌─────────▼─────────┐
         │ DOMContentLoaded  │
         └─────────┬─────────┘
                   │
         ┌─────────▼──────────────────┐
         │ carregarDashboard()        │
         │ (dashboard-loader.js)      │
         └─────────┬──────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
   ┌──▼──┐    ┌────▼────┐  ┌───▼───┐
   │API  │    │localStorage│Fallback
   └──┬──┘    └────┬────┘  └───┬───┘
      │            │            │
      │ Êxito      │Doações     │Erro
      │            │            │
      └────────────┼────────────┘
                   │
         ┌─────────▼─────────────┐
         │ Renderizar Contadores │
         │ Animar Números        │
         │ Gráfico Doughnut      │
         └───────────────────────┘
```

---

## ⚡ Como Expandir para Novas Rotas

### 1. Se a rota já existe no backend:

Adicione no arquivo `dashboard-loader.js`:

```javascript
// Na função carregarDashboard(), adicione no Promise.all():
fetch(`${API_BASE_URL}/api/sua-rota`)
  .then(r => r.json())
  .catch(e => {
    console.warn('⚠️ Erro ao buscar sua-rota:', e.message);
    return [];
  })

// Depois processe os dados:
let contador = (dados || []).length;
animarNumero(
  document.getElementById('seu-elemento-id'),
  contador
);
```

### 2. Se a rota NÃO existe:

a. Crie o arquivo em `admin/backend/routes/nome.js`:
```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

router.get('/seu-endpoint', async (req, res) => {
  try {
    const [dados] = await pool.query('SELECT * FROM sua_tabela');
    res.json(dados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

b. Importe em `admin/backend/server.js`:
```javascript
const seuRoutes = require('./routes/nome');
// ... depois:
app.use('/api', seuRoutes);
```

c. Adicione no `dashboard-loader.js` conforme exemplo acima.

---

## 🧪 Testes

### Verificar se a API está respondendo:
```bash
curl http://localhost:3001/api/animais
curl http://localhost:3001/api/adocoes
curl http://localhost:3001/api/admin/eventos
```

### Usar página de teste:
1. Abra em navegador: `admin/html/teste-contadores.html`
2. Veja os resultados em tempo real
3. Compare com localStorage

---

## ⚠️ Situações Especiais

### Status de Adoções (Compatibilidade)

O dashboard busca por padrões nos status, não valores exatos:

```javascript
// Reconhece como PENDENTE:
'pendente', 'ativo', 'processamento'

// Reconhece como APROVADO:
'aprovado', 'concluído', 'finalizado'

// Reconhece como RECUSADO:
'recusado', 'reprovado', 'rejeitado'
```

### Distribuição de Animais

Os status são case-insensitive:

```javascript
// Reconhece como DISPONÍVEL:
'disponível', 'disponivel', 'Disponível'

// Reconhece como RESERVADO:
'reservado', 'Reservado'

// Reconhece como EM TRATAMENTO:
'tratamento', 'em tratamento'
```

---

## 🔒 Segurança e Boas Práticas

✅ **Implementado:**
- ✅ Fallback automático para localStorage se API falhar
- ✅ Tratamento de erros com console.warn
- ✅ Compatibilidade com case-insensitive
- ✅ Array null-checks com `|| []`
- ✅ Sem quebra de funcionalidade existente

⚠️ **Considerações:**
- A API não requer autenticação para os endpoints listados
- Use HTTPS em produção
- Valide dados no backend antes de armazenar
- Monitore logs para erros de API

---

## 📌 Próximos Passos (Opcional)

### 1. Criar tabela de Doações no DB
```sql
CREATE TABLE doacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('dinheiro', 'item') NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL,
  descricao TEXT,
  data_doacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Depois criar rota GET e atualizar `dashboard-loader.js`.

### 2. Adicionar Auto-Refresh
```javascript
// Recarregar a cada 30 segundos
setInterval(carregarDashboard, 30000);
```

### 3. Adicionar Socket.IO para Real-Time
```javascript
// No servidor:
io.on('connection', (socket) => {
  // Emitir atualizações
  socket.emit('dados-dashboard', dados);
});

// No cliente:
socket.on('dados-dashboard', (dados) => {
  atualizarDashboard(dados);
});
```

---

## 📞 Suporte

Arquivo de teste: **admin/html/teste-contadores.html**
Log de debug: Abra DevTools (F12) e veja console

Para adicionar mais contadores, sempre:
1. ✅ Verifique se a rota existe em `admin/backend/server.js`
2. ✅ Teste a rota com curl ou postman
3. ✅ Adicione tratamento de erro em `dashboard-loader.js`
4. ✅ Torne as comparações case-insensitive
5. ✅ Mantenha fallback para localStorage
