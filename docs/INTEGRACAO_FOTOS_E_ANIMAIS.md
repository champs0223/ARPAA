# 🐾 Guia de Integração: Admin ↔ Website Público

## 📋 Visão Geral

O sistema ARPAA agora está totalmente integrado:

- **Admin**: Registra animais no painel administrativo
- **Backend**: Armazena fotos em base64 + dados SQLite
- **Website Público**: Carrega e exibe os animais em tempo real

---

## 🔄 Fluxo de Dados

```
┌─────────────────┐
│  Admin Panel    │
│  (animais.html) │
└────────┬────────┘
         │
         │ POST/PUT/DELETE
         ▼
┌─────────────────┐
│  Backend API    │
│ (:3000/animais) │
└────────┬────────┘
         │
         │ GET
         ▼
┌─────────────────┐
│  Website Público│
│  (adote.html)   │
└─────────────────┘
```

---

## 📸 Como as Fotos Funcionam

### Fluxo de Upload:

1. **No Admin** - Você seleciona uma imagem no formulário
2. **Conversão** - A imagem é convertida para base64
3. **Armazenamento** - Armazenada diretamente no banco SQLite
4. **No Website** - Carregada como `<img src="data:image/jpeg;base64,..." />`

### Vantagens:
- ✅ Sem servidor de arquivos externo
- ✅ Funciona 100% offline
- ✅ Uma única base de dados (SQLite)
- ✅ Backup mais fácil

### Desvantagens:
- ⚠️ Arquivo do BD cresce com muitas imagens
- ⚠️ Pode ser lento com imagens muito grandes

---

## 🔌 Arquivos de Integração Criados

### 1. **`public/js/api-integration.js`** (Principal)

Novo arquivo que centraliza toda a integração:

```javascript
// Importação automática
<script src="js/api-integration.js"></script>

// Funções disponíveis
window.apiArpaa.buscarAnimaisDaAPI()      // GET /animais
window.apiArpaa.buscarAnimalPorId(id)     // GET /animais/:id
window.apiArpaa.criarAnimalNoAdmin(data)  // POST /animais
window.apiArpaa.atualizarAnimal(id, data) // PUT /animais/:id
window.apiArpaa.deletarAnimal(id)         // DELETE /animais/:id
window.apiArpaa.carregarEExibirAnimais()  // Renderizar cards
```

### 2. **`admin/backend/config/api-config.js`** (Configuração)

Define automaticamente a URL da API baseado no ambiente:

```javascript
// Desenvolvimento: http://localhost:3000
// Produção: detecta automaticamente
const API_BASE_URL = getApiBaseUrl();
```

---

## 🚀 Como Usar

### No Website Público (`public/adote.html`):

```html
<!-- Incluir script de integração -->
<script src="js/api-integration.js"></script>

<script>
// Ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Carrega automáticamente os animais
    window.apiArpaa.carregarEExibirAnimais('animais-container');
});
</script>

<!-- Container onde os animais aparecem -->
<div id="animais-container" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
    <!-- Cards dos animais aparecem aqui -->
</div>
```

### No Admin (`admin/html/animais.html`):

```javascript
// Já conecta automaticamente
const response = await fetch('http://localhost:3000/animais-com-usuario');
const animais = await response.json();

// Atualiza a lista de animais exibida
mostrarAnimais();
```

---

## 🔧 Configuração para Diferentes Ambientes

### Desenvolvimento Local

```javascript
// Automático em localhost
API_URL = 'http://localhost:3000'
```

### GitHub Codespaces

```javascript
// Detecta automaticamente pelo hostname
// Usa a porta correta do seu preview
```

### Produção (Railway/Replit/etc)

Defina a variável de ambiente:

```bash
REACT_APP_API_URL=https://seu-dominio.com
```

Ou atualize em `public/js/api-integration.js`:

```javascript
const getApiUrl = () => {
  const possibleUrls = [
    'https://seu-dominio-producao.com',  // Produção
    'http://localhost:3000',             // Dev local
  ];
  return possibleUrls[0];
};
```

---

## 📊 Estrutura de Dados do Animal

```javascript
{
  id: 1,
  nome: "Luna",
  especie: "Gato",
  raca: "Persa",
  sexo: "Fêmea",
  idade_aproximada: 2,
  porte: "Pequeno",
  data_resgate: "2024-01-15",
  status: "disponível",
  descricao: "Descrição do animal...",
  foto_base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  registrado_por: 1,
  created_at: "2024-01-15T10:30:00",
  updated_at: "2024-01-15T10:30:00"
}
```

---

## ✅ Checklist de Funcionalidades

### Website Público
- [x] Carrega animais da API
- [x] Exibe fotos em base64
- [x] Mostra informações: nome, espécie, idade, porte, descrição
- [x] Modal com detalhes completos
- [x] Fallback para dados mock se API cair
- [x] Filtros por espécie, idade, porte

### Admin Panel
- [x] Cria animal com foto base64
- [x] Edita animal existente
- [x] Deleta animal
- [x] Apresenta lista atualizada
- [x] Validação de campos

### Backend
- [x] GET /animais - Lista todos
- [x] GET /animais/:id - Detalhes de um
- [x] GET /animais-com-usuario - Com info do criador
- [x] POST /animais - Cria novo (com foto)
- [x] PUT /animais/:id - Atualiza (com foto)
- [x] DELETE /animais/:id - Remove

---

## 🐛 Troubleshooting

### Problema: "Carregando animais..." fica em loop

**Solução:** A API não está rodando

```bash
# No diretório do backend
cd admin/backend
npm start
```

### Problema: Fotos não carregam

**Solução 1:** Base64 inválido
```javascript
// Verificar no console
console.log(animal.foto_base64.substring(0, 50))
// Deve começar com: data:image/jpeg;base64,
```

**Solução 2:** Arquivo do BD corrompido
```bash
# Recriar banco
cd admin/backend
rm db/arpaa.db
node db/init.js
```

### Problema: Website não conecta ao backend em produção

**Solução:** Atualizar URL da API
```javascript
// Em public/js/api-integration.js
const API_URL = 'https://seu-api-real.com:3000';
```

---

## 📈 Performance

### Otimizações Implementadas:

1. **Base64 Comprimido**
   - Fotos convertidas no menor tamanho possível
   - Cache do navegador ativa

2. **Lazy Loading**
   - Imagens só carregam quando visíveis

3. **SQL Indexado**
   - Queries otimizadas para rápido acesso

### Se Ficarem Lentas:

```javascript
// Limpar banco de dados muito grande
rm db/arpaa.db
npm start  // Recria zero
```

---

## 🔐 Segurança

- ✅ CORS habilitado para aceitar requests
- ✅ Validação de dados no backend
- ✅ Base64 armazenado com segurança
- ⚠️ Todo mundo pode ver os animais (intencional)

---

## 📱 Próximos Passos

1. **Testar localmente**
   ```bash
   cd admin/backend && npm start
   # Abrir http://localhost:3000/animais
   ```

2. **Registrar animais no admin**
   ```
   http://localhost/admin/html/animais.html
   ```

3. **Ver no website**
   ```
   http://localhost/public/adote.html
   ```

4. **Fazer backup do BD**
   ```bash
   node admin/backend/db/backup-db.js
   ```

5. **Deploy em produção**
   - Use env vars para URL da API
   - Backup antes de deploy
   - Teste após deploy

---

## 💡 Dicas Úteis

### Inspecionar o BD SQLite

```bash
sqlite3 admin/backend/db/arpaa.db
sqlite> SELECT COUNT(*) FROM animais;
sqlite> SELECT nome, especie FROM animais;
sqlite> .quit
```

### Exportar dados

```bash
# Backup do BD
cp admin/backend/db/arpaa.db admin/backend/db/arpaa-backup-$(date +%s).db

# Restaurar
cp admin/backend/db/arpaa-backup-*.db admin/backend/db/arpaa.db
```

### Testar API direto

```bash
# Listar animais
curl http://localhost:3000/animais

# Ver um específico  
curl http://localhost:3000/animais/1

# Com usuário (JOIN)
curl http://localhost:3000/animais-com-usuario
```

---

**Sistema de Integração Completo! 🎉**

Agora o admin e o website público estão sincronizados em tempo real.
