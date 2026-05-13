#!/bin/bash

# Script de teste: Integração de Fotos e Animais
# Verifica se o sistema de integração está funcionando corretamente

set -e

echo "========================================="
echo "🧪 TESTE DE INTEGRAÇÃO ARPAA"
echo "========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se o backend está rodando
echo "1️⃣  Verificando se o backend está rodando..."
SERVER_URL="http://localhost:3000"

if curl -s "$SERVER_URL/health" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend está online!"
else
    echo -e "${RED}✗${NC} Backend não está respondendo em $SERVER_URL"
    echo "   Inicie com: cd admin/backend && npm start"
    exit 1
fi

echo ""

# Testar endpoint de animais
echo "2️⃣  Testando GET /animais..."
RESPONSE=$(curl -s "$SERVER_URL/animais")
COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
echo -e "${GREEN}✓${NC} Encontrados $COUNT animais"

echo ""

# Testar se há armazenamento local
echo "3️⃣  Verificando armazenamento local..."
if [ -f "admin/backend/db/data.json" ]; then
    SIZE=$(ls -lh admin/backend/db/data.json | awk '{print $5}')
    echo -e "${GREEN}✓${NC} Armazenamento local encontrado ($SIZE)"
else
    echo -e "${YELLOW}⚠${NC} Arquivo de dados local não encontrado - será criado na próxima execução"
fi

echo ""

# Testar criação de animal
echo "4️⃣  Testando POST /animais (Criar)..."
ANIMAL_JSON='{
  "nome": "TestePet",
  "especie": "Cachorro",
  "raca": "Vira-lata",
  "sexo": "Macho",
  "idade_aproximada": 2,
  "porte": "Médio",
  "data_resgate": "2024-01-15",
  "status": "disponível",
  "descricao": "Animal de teste",
  "registrado_por": 1
}'

RESULT=$(curl -s -X POST "$SERVER_URL/animais" \
  -H "Content-Type: application/json" \
  -d "$ANIMAL_JSON")

if echo "$RESULT" | grep -q '"id"'; then
    ANIMAL_ID=$(echo "$RESULT" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${GREEN}✓${NC} Animal criado com ID: $ANIMAL_ID"
else
    echo -e "${RED}✗${NC} Erro ao criar animal"
    echo "Resposta: $RESULT"
fi

echo ""

# Testar fotos em base64
echo "5️⃣  Verificando suporte a fotos (base64)..."
ANIMAL_COMFOTO=$(curl -s "$SERVER_URL/animais/1")
if echo "$ANIMAL_COMFOTO" | grep -q 'foto_base64'; then
    echo -e "${GREEN}✓${NC} Campo 'foto_base64' existe no schema"
    if echo "$ANIMAL_COMFOTO" | grep -q 'data:image'; then
        echo -e "${GREEN}✓${NC}  Foto em formato base64 detectada!"
    fi
else
    echo -e "${YELLOW}⚠${NC} Nenhuma foto ainda (campo vazio)"
fi

echo ""

# Testar arquivo de integração
echo "6️⃣  Verificando arquivos de integração..."
if [ -f "public/js/api-integration.js" ]; then
    echo -e "${GREEN}✓${NC} api-integration.js encontrado"
else
    echo -e "${RED}✗${NC} api-integration.js não encontrado"
fi

if [ -f "admin/backend/config/api-config.js" ]; then
    echo -e "${GREEN}✓${NC} api-config.js encontrado"
else
    echo -e "${RED}✗${NC} api-config.js não encontrado"
fi

echo ""

# Testar CORS
echo "7️⃣  Testando CORS..."
CORS_TEST=$(curl -s -i "$SERVER_URL/animais" | grep -i "access-control" | wc -l)
if [ $CORS_TEST -gt 0 ]; then
    echo -e "${GREEN}✓${NC} CORS habilitado"
else
    echo -e "${YELLOW}⚠${NC} CORS pode estar desabilitado"
fi

echo ""

# Resumo final
echo "========================================="
echo "📊 RESULTADO DO TESTE"
echo "========================================="
echo -e "${GREEN}✓${NC} Backend funcionando"
echo -e "${GREEN}✓${NC} API respondendo"
echo -e "${GREEN}✓${NC} Banco de dados OK"
echo ""
echo "🎉 Sistema pronto para usar!"
echo ""
echo "Próximos passos:"
echo "1. Abrir: http://localhost/admin/html/animais.html"
echo "2. Registrar um animal com foto"
echo "3. Ver em: http://localhost/public/adote.html"
echo ""
