#!/usr/bin/env bash
# ==========================================================================
# Mboa Connect — Script de démarrage automatique
# Usage : ./scripts/start.sh            (backend + mobile)
#         ./scripts/start.sh --backend  (backend seul)
#         ./scripts/start.sh --mobile   (mobile seul, backend déjà lancé)
# ==========================================================================
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-all}"

start_backend() {
  echo "🐘 Démarrage de PostgreSQL..."
  cd "$ROOT_DIR"
  docker compose up -d postgres

  echo "🚀 Démarrage du backend NestJS (http://localhost:3000/api/v1)..."
  echo "📚 Swagger disponible sur http://localhost:3000/api/docs"
  cd "$ROOT_DIR/backend"
  npm run start:dev
}

start_mobile() {
  echo "📱 Démarrage de l'application mobile (Expo)..."
  cd "$ROOT_DIR/mobile"
  npx expo start
}

case "$MODE" in
  --backend)
    start_backend
    ;;
  --mobile)
    start_mobile
    ;;
  all|*)
    echo "ℹ️  Lancement du backend dans ce terminal."
    echo "ℹ️  Ouvrez un second terminal et lancez : ./scripts/start.sh --mobile"
    echo ""
    start_backend
    ;;
esac
