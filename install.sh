#!/usr/bin/env bash
# ==========================================================================
# Mboa Connect — Script d'installation automatique
# Usage : ./scripts/install.sh
# ==========================================================================
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🌍 Installation de Mboa Connect"
echo "================================"

# --- Vérification des prérequis ---
command -v node >/dev/null 2>&1 || { echo "❌ Node.js n'est pas installé (requis : v20+)."; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "❌ npm n'est pas installé."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker n'est pas installé (requis pour PostgreSQL)."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose n'est pas disponible."; exit 1; }

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "⚠️  Node.js $NODE_MAJOR détecté — Node.js 20+ est recommandé."
fi
echo "✅ Prérequis présents (Node $(node -v), Docker $(docker --version | cut -d' ' -f3 | tr -d ','))"

# --- Fichiers d'environnement ---
[ -f .env ] || { cp .env.example .env; echo "✅ .env (racine) créé depuis .env.example"; }
[ -f backend/.env ] || { cp backend/.env.example backend/.env; echo "✅ backend/.env créé depuis backend/.env.example"; }

echo ""
echo "📦 Installation des dépendances backend (NestJS)..."
cd "$ROOT_DIR/backend"
npm install

echo ""
echo "🐘 Démarrage de PostgreSQL (Docker)..."
cd "$ROOT_DIR"
docker compose up -d postgres
echo "⏳ Attente que PostgreSQL soit prêt..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U "${DB_USER:-mboa_user}" >/dev/null 2>&1; then
    echo "✅ PostgreSQL est prêt."
    break
  fi
  sleep 1
done

echo ""
echo "🗄️  Exécution des migrations..."
cd "$ROOT_DIR/backend"
npm run migration:run

echo ""
echo "🌱 Insertion des catégories de base..."
npm run seed

echo ""
echo "📱 Installation des dépendances mobile (Expo)..."
cd "$ROOT_DIR/mobile"
npm install

echo ""
echo "=========================================================="
echo "✅ Installation terminée !"
echo ""
echo "Prochaines étapes :"
echo "  1. Lancer le projet :        ./scripts/start.sh"
echo "  2. Lancer les tests :        ./scripts/test.sh"
echo "  3. Documentation Swagger :   http://localhost:3000/api/docs"
echo "  4. Créer un admin :          voir README.md section 3"
echo "=========================================================="
