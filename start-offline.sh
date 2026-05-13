#!/bin/bash

# ARPAA - Servidor Dual Port (Offline-First)
# Inicializa simultaneamente:
#   - Porta 3000: Painel Administrativo
#   - Porta 5000: Site Público
# 
# Ambos compartilham dados via IndexedDB (offline)

set -e

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║       ARPAA - Sistema de Adoção (Offline)         ║"
echo "║         Inicializando Dual Port Server             ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Instale Node.js primeiro."
    exit 1
fi

echo "📌 Node version: $(node -v)"
echo ""

# Iniciar servidor de dupla porta
echo "🚀 Iniciando servidores..."
echo ""
node server-dual-port.js
