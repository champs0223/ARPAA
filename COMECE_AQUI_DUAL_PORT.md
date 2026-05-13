# ⚡ RESUMO RÁPIDO: 2 PORTAS SIMULTÂNEAS

## O Que Fazer AGORA

### 1️⃣ Abra um Terminal
```bash
cd /workspaces/ARPAA
npm start
```

### 2️⃣ Abra as Duas Portas no Navegador

| Porta | O que abre |
|-------|-----------|
| http://localhost:3000 | 🔐 Painel Administrativo |
| http://localhost:5000 | 🌐 Site Público |

### 3️⃣ Teste o Fluxo

**No Admin (3000):**
- Login: `admin` / `admin123`
- Registre um animal novo

**No Site Público (5000):**
- Recarregue a página
- Veja o animal que você registrou!

---

## Por Que Funciona?

- ✅ Dados salvos em **IndexedDB** (navegador do PC)
- ✅ Sem banco de dados MySQL
- ✅ Sem servidor backend
- ✅ Ambas as portas compartilham os mesmos dados
- ✅ Funciona **100% offline**

---

## Dúvidas?

📖 Leia: `GUIA_OFFLINE_DUAL_PORT.md`  
📖 Leia: `COMO_ABRIR_PORTAS_VSCODE.md`

---

## Status: ✅ PRONTO PARA USAR
