"# ARPAA

Sistema de gerenciamento de adoção de animais com painel administrativo e site público.

## 📁 Estrutura do Projeto

```
ARPAA/
├── admin/                    # Painel Administrativo
│   ├── index.html           # Login do Admin
│   ├── html/               # Páginas do Admin
│   │   ├── dashboard.html  # Dashboard
│   │   ├── animais.html    # Gerenciamento de Animais
│   │   ├── adocoes.html    # Processos de Adoção
│   │   └── ...
│   ├── backend/            # API do Backend
│   │   ├── server.js       # Servidor Express
│   │   ├── routes/         # Rotas da API
│   │   └── db/            # Configuração do Banco
│   └── menu.js            # Menu lateral do Admin
├── public/                 # Site Público
│   ├── index.html         # Página Inicial
│   ├── sobre.html         # Sobre a ARPAA
│   ├── adote.html         # Página de Adoção
│   ├── doe.html           # Página de Doações
│   ├── contato.html       # Contato
│   ├── assets/            # CSS, JS, Imagens
│   └── css/               # Estilos
└── package.json           # Dependências do Projeto
```

## 🚀 Como Executar

### Backend (API)
```bash
cd admin/backend
npm install
npm start
```

### Site Público
Abra `public/index.html` no navegador.

### Painel Admin
Abra `admin/index.html` no navegador." 
