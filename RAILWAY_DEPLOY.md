# 🚀 Deploy no Railway com Upload de Fotos

## Pré-requisitos

### 1. Conta no Cloudinary (Gratuito)
1. Acesse [cloudinary.com](https://cloudinary.com/)
2. Crie conta gratuita
3. Vá no Dashboard e copie as credenciais:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Projeto no Railway
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente

## ⚙️ Configuração das Variáveis

No painel do Railway, adicione estas variáveis:

```bash
# Banco de dados (já existente)
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}

# Cloudinary (NOVO - para uploads)
CLOUDINARY_CLOUD_NAME=sua_cloud_name_aqui
CLOUDINARY_API_KEY=sua_api_key_aqui
CLOUDINARY_API_SECRET=sua_api_secret_aqui

# Ambiente
NODE_ENV=production
```

## 🔄 Deploy Automático

Após configurar as variáveis:
1. Faça commit das mudanças
2. Railway fará deploy automático
3. O sistema detectará produção e usará Cloudinary

## ✅ Verificação

Após deploy, teste:
- Acesse: `https://seu-projeto.railway.app/health`
- Deve retornar: `{"status":"OK",...}`

## 📸 Como as Fotos Funcionam

### Desenvolvimento (localhost):
- Fotos salvas em `/public/uploads/`
- URLs locais: `/uploads/foto.jpg`

### Produção (Railway):
- Fotos enviadas para Cloudinary
- URLs públicas: `https://res.cloudinary.com/.../foto.jpg`
- Persistem mesmo com restarts do container

## 💡 Dicas

- **Cloudinary Free Tier**: 25GB/mês gratuito
- **Otimização**: Fotos são automaticamente redimensionadas (800x600px)
- **Backup**: Todas as fotos ficam na nuvem, nunca se perdem

## 🔧 Troubleshooting

### Erro "Cloudinary config invalid":
- Verifique se as variáveis estão corretas
- Certifique-se que não há espaços extras

### Fotos não carregam:
- Verifique se o Cloudinary está configurado
- Teste upload via admin primeiro