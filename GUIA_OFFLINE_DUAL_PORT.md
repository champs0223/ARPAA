# 🚀 ARPAA - Guia de Uso do Sistema Offline (Dual Port)

## O que mudou?

Agora você tem **2 portas simultâneas** para acessar o sistema offline:

| Porta | Acesso | Descrição |
|-------|--------|-----------|
| **3000** | http://localhost:3000 | 🔐 Painel Administrativo |
| **5000** | http://localhost:5000 | 🌐 Site Público |

**Ambos compartilham os mesmos dados** via IndexedDB (sem banco de dados MySQL).

---

## 🎯 Como Iniciar

### Opção 1: Usando npm (RECOMENDADO)
```bash
npm start
```

### Opção 2: Usando o script bash
```bash
bash start-offline.sh
```

### Opção 3: Executar diretamente com Node.js
```bash
node server-dual-port.js
```

---

## 📌 Credenciais de Teste

| Usuário | Senha | Acesso |
|---------|-------|--------|
| `admin` | `admin123` | Painel Administrativo |
| `voluntario` | `vol123` | Painel Administrativo |

---

## 🔄 Fluxo de Funcionamento

### 1️⃣ Registrar Animais (Painel Admin - Porta 3000)
```
http://localhost:3000 
→ Login com admin/admin123
→ Ir para "Animais"
→ Registrar novo animal
→ Dados salvos em IndexedDB
```

### 2️⃣ Ver Animais (Site Público - Porta 5000)
```
http://localhost:5000
→ Clique em "Adote um Animal"
→ Vê os animais registrados no painel admin
→ Dados vêm do MESMO IndexedDB
```

---

## 💾 Onde os Dados são Salvos?

Os dados são salvos **localmente no navegador** em:
- **IndexedDB**: Dados estruturados (animais, adotantes, adoções)
- **localStorage**: Credenciais de login e configurações

**Nenhum servidor ou banco de dados externo é necessário!**

---

## 📂 Estrutura das Portas

```
Porta 3000 (/admin)
├── index.html (Dashboard)
├── animais.html
├── adocoes.html
├── doacoes.html
├── eventos.html
└── js/ (Scripts compartilhados)
    ├── db-local.js (BD local)
    ├── api-local.js (Funções offline)
    └── init-dados-locais.js (Dados de teste)

Porta 5000 (/public)
├── index.html (Homepage)
├── adote.html (Animais para adoção)
├── contato.html
├── sobre.html
└── js/ (Scripts compartilhados)
    ├── db-local.js (BD local)
    ├── api-local.js (Funções offline)
    └── api-helper.js (Integração)
```

---

## 🐛 Troubleshooting

### Porta já em uso?
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Matar processo na porta 5000
lsof -ti:5000 | xargs kill -9
```

### Dados não aparecem no site público?
1. Verifique se fez login em http://localhost:3000
2. Registrou um animal no painel
3. Limpe o cache: `DevTools (F12) → Application → Clear site data`
4. Recarregue ambas as portas

### Erro: "EADDRINUSE"?
Significa que uma das portas já está em uso. Encerre o processo antigo:
```bash
# Linux/Mac
killall node

# Ou mate manualmente
kill -9 $(lsof -ti:3000,5000)
```

---

## 🌟 Características do Sistema Offline

✅ Sem banco de dados MySQL  
✅ Sem servidor backend externo  
✅ Funciona 100% offline  
✅ Dados compartilhados entre admin e site público  
✅ Upload de imagens em Base64  
✅ Sincronização automática via IndexedDB  
✅ 2 portas simultâneas (admin + público)  

---

## 📱 Acessar de Outro Computador

Para acessar as portas de outro computador na mesma rede:

```
http://[SEU_IP]:3000  (Admin)
http://[SEU_IP]:5000  (Público)
```

Descubra seu IP:
```bash
# Linux/Mac
hostname -I
# ou
ifconfig

# Windows
ipconfig
```

---

## ⏸️ Parar os Servidores

Pressione `CTRL + C` no terminal

---

## 🔄 Próximos Passos (Opcional)

- Implementar sincronização com servidor remoto
- Adicionar mais tipos de usuários
- Criar relatórios de adoções
- Integrar com WhatsApp/Email
- Deploy na Railway.app

---

**🎉 Pronto para usar! Abra as duas abas agora:**
- Admin: http://localhost:3000
- Público: http://localhost:5000
