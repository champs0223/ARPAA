# 🧪 Teste Rápido - Banco de Dados Local

## ✅ Verificação de Funcionamento

Copie e cola no **Console do Navegador** (F12) para testar:

### 1. Verificar Configuração

```javascript
console.log('API_BASE_URL:', API_BASE_URL);
console.log('USE_LOCAL_DB:', USE_LOCAL_DB);
console.log('DB Status:', dbLocal.db ? '✅ OK' : '❌ Não inicializado');
```

**Esperado:**
```
API_BASE_URL: LOCAL_DB
USE_LOCAL_DB: true
DB Status: ✅ OK
```

---

### 2. Listar Animais

```javascript
listarAnimais().then(animais => {
  console.log('✅ Animais carregados:', animais.length);
  console.table(animais);
});
```

**Esperado:** 4 animais (Rex, Mia, Bolinha, Simba)

---

### 3. Listar Adotantes

```javascript
listarAdotantes().then(adotantes => {
  console.log('✅ Adotantes carregados:', adotantes.length);
  console.table(adotantes);
});
```

**Esperado:** 2 adotantes (João Silva, Maria Santos)

---

### 4. Listar Usuários

```javascript
const usuarios = JSON.parse(localStorage.getItem('usuarios_app'));
console.log('✅ Usuários carregados:', usuarios.length);
console.table(usuarios);
```

**Esperado:** 2 usuários (admin, voluntario)

---

### 5. Criar Novo Animal

```javascript
criarAnimal({
  nome: "Spike",
  especie: "Cachorro",
  raca: "Pitbull",
  idade: 2,
  genero: "M",
  porte: "Grande",
  descricao: "Bravo mas dócil",
  status: "disponivel",
  data_resgate: "2024-04-15",
  foto: null,
  registrado_por: 1
}).then(animal => {
  console.log('✅ Animal criado:', animal);
  console.log('ID:', animal.id);
});
```

**Esperado:**
```json
{
  id: 5,
  nome: "Spike",
  ...
}
```

---

### 6. Testar Login

```javascript
fazerLogin("admin", "admin123").then(usuario => {
  console.log('✅ Login bem-sucedido:', usuario.nome);
  console.log('Admin Logado:', localStorage.getItem('adminLogado'));
}).catch(erro => {
  console.error('❌ Erro no login:', erro.message);
});
```

**Esperado:**
```
✅ Login bem-sucedido: Administrador ARPAA
Admin Logado: true
```

---

### 7. Atualizar Animal

```javascript
atualizarAnimal(1, {
  nome: "Rex Atualizado",
  status: "adotado"
}).then(animal => {
  console.log('✅ Animal atualizado:', animal);
});
```

**Esperado:**
```json
{
  id: 1,
  nome: "Rex Atualizado",
  status: "adotado",
  ...
}
```

---

### 8. Deletar Animal

```javascript
deletarAnimal(5).then(() => {
  console.log('✅ Animal deletado com sucesso');
  return listarAnimais();
}).then(animais => {
  console.log('Total de animais agora:', animais.length);
  console.table(animais);
});
```

**Esperado:** Total volta para 4 animais

---

### 9. Upload de Imagem

```javascript
// Criar arquivo de teste (imagem pequena)
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#FF6B6B';
ctx.fillRect(0, 0, 100, 100);

canvas.toBlob(blob => {
  const file = new File([blob], 'teste.png', { type: 'image/png' });
  fazerUploadImagem(file).then(resultado => {
    console.log('✅ Imagem salva:', resultado);
    console.log('ID:', resultado.id);
    console.log('URL (Base64):', resultado.url.substring(0, 50) + '...');
  });
});
```

**Esperado:**
```json
{
  id: "img_1234567890",
  url: "data:image/png;base64,...",
  nome: "teste.png"
}
```

---

### 10. Exportar Todos os Dados (Backup)

```javascript
Promise.all([
  listarAnimais(),
  listarAdotantes(),
  listarAdocoes(),
  listarResgates(),
  listarTratamentos(),
  listarVacinas()
]).then(([animais, adotantes, adocoes, resgates, tratamentos, vacinas]) => {
  const backup = {
    timestamp: new Date().toISOString(),
    animais,
    adotantes,
    adocoes,
    resgates,
    tratamentos,
    vacinas,
    usuarios: JSON.parse(localStorage.getItem('usuarios_app'))
  };
  
  console.log('✅ Backup gerado:', backup);
  console.log('Copie este JSON:');
  console.log(JSON.stringify(backup, null, 2));
  
  // Copiar para clipboard automaticamente
  copy(JSON.stringify(backup, null, 2));
  console.log('✅ Copiado para clipboard!');
});
```

**Esperado:** JSON completo com todos os dados

---

### 11. Limpar Tudo (Reset)

```javascript
// ⚠️ Isso vai deletar TODOS os dados!
dbLocal.clear('animais')
  .then(() => dbLocal.clear('adotantes'))
  .then(() => dbLocal.clear('adocoes'))
  .then(() => dbLocal.clear('resgates'))
  .then(() => dbLocal.clear('tratamentos'))
  .then(() => dbLocal.clear('vacinas'))
  .then(() => localStorage.removeItem('usuarios_app'))
  .then(() => {
    console.log('✅ Todos os dados foram deletados');
    console.log('Recarregue a página para reinicializar');
    location.reload();
  });
```

---

## 🎯 Checklist de Teste Completo

```
☐ Console mostra: USE_LOCAL_DB = true
☐ Consegue listar 4 animais
☐ Consegue listar 2 adotantes
☐ Consegue listar 2 usuários
☐ Consegue logar com admin/admin123
☐ Consegue criar novo animal
☐ Consegue atualizar animal
☐ Consegue deletar animal
☐ Consegue fazer upload de imagem
☐ Consegue fazer backup de dados
```

Se tudo passa ✅ = DB Local funcionando perfeitamente!

---

## 🧪 Testes no Painel Admin

1. **Abrir:** `/admin/index.html`
2. **Logar:** admin / admin123
3. **Ir para:** Painel Administrativo → Animais
4. **Testar:**
   - ✅ Listar animais
   - ✅ Criar novo animal
   - ✅ Editar animal
   - ✅ Deletar animal
   - ✅ Upload de foto

---

## 🌐 Testes no Frontend Público

1. **Abrir:** `/public/adote.html` (ou `index.html`)
2. **Testar:**
   - ✅ Página carrega os 4 animais de teste
   - ✅ Filtros funcionam
   - ✅ Cards de animais aparecem

