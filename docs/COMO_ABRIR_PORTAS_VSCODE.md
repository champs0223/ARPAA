# 🖥️ Como Acessar as 2 Portas no VS Code

## Passo 1: Iniciar o Servidor

No terminal do VS Code, execute:

```bash
npm start
```

Você verá:
```
✅ Painel Administrativo rodando em: http://localhost:3000
✅ Site Público rodando em: http://localhost:5000
```

## Passo 2: Abrir as Portas em Navegadores Separados

### Método 1: Pela Aba Portas (RECOMENDADO)

1. No VS Code, clique na aba **"PORTAS"** no painel inferior
   
2. Você verá duas portas:
   - ✅ **Porta 3000** → Painel Admin
   - ✅ **Porta 5000** → Site Público

3. Clique no ícone 🌐 (globo) ao lado de cada porta para abrir em aba separada

4. Ou clique com botão direito → "Abrir em Nova Aba do Navegador"

### Método 2: Abrir Manualmente

Abra duas abas no navegador:
- **Aba 1**: http://localhost:3000 (Painel Admin)
- **Aba 2**: http://localhost:5000 (Site Público)

---

## Passo 3: Testar o Fluxo Completo

### 3️⃣.1️⃣ Na Porta 3000 (Admin)
```
1. Clique em "Acessar Painel"
2. Login: admin / admin123
3. Vá para "Animais"
4. Clique em "Novo Animal"
5. Preencha os dados (Nome, Tipo, Descrição, etc.)
6. Clique em "Salvar"
```

### 3️⃣.2️⃣ Na Porta 5000 (Site Público)
```
1. Recarregue a página (F5)
2. Clique em "Adote um Animal"
3. ✨ Veja o animal que você registrou no admin!
```

---

## 📋 Checklist Final

- [ ] Servidor rodando em 2 portas (npm start)
- [ ] Porta 3000 abre o painel admin
- [ ] Porta 5000 abre o site público
- [ ] Consigo fazer login com admin/admin123
- [ ] Consigo registrar animal no admin
- [ ] Animal aparece no site público
- [ ] Dados persistem mesmo fechando abas (IndexedDB)

---

## 💡 Dicas

**Para visualizar dados salvos no navegador:**
1. Abra DevTools (F12)
2. Vá para "Application"
3. Clique em "IndexedDB" → "ARPAA"
4. Expanda "animais" para ver os dados

**Para limpar dados (reset):**
1. DevTools (F12)
2. Clique em "Storage" ou "Application"
3. Clique em "Clear site data"
4. Recarregue a página

---

## 🚨 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Porta 3000 não abre | Verifique se o servidor está rodando (npm start) |
| Porta 5000 não abre | Mata todos os processos Node: `killall node` |
| Animais não aparecem | Limpe o cache (F12 → Storage → Clear site data) |
| Erro "Port already in use" | Use: `lsof -ti:3000,5000 \| xargs kill -9` |

---

**🎉 É isso! Agora você tem 2 portas simultâneas!**

Qualquer dúvida, volte aqui! 😊
