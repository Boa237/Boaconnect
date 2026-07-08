#!/usr/bin/env bash
# ==========================================================================
# Mboa Connect — Script de tests automatiques
# Usage : ./scripts/test.sh          (tests unitaires + e2e)
#         ./scripts/test.sh --unit   (tests unitaires uniquement, pas de DB requise)
#         ./scripts/test.sh --e2e    (tests e2e uniquement, contre une DB de test jetable)
# ==========================================================================
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-all}"
TEST_CONTAINER="mboa-postgres-test"
TEST_PORT=5433
TEST_DB="mboa_connect_test"
TEST_USER="mboa_test"
TEST_PASSWORD="mboa_test"

run_unit_tests() {
  echo "🧪 Tests unitaires (services, logique métier — pas de base de données requise)..."
  cd "$ROOT_DIR/backend"
  npm run test
}

run_e2e_tests() {
  echo "🐘 Démarrage d'une base PostgreSQL de test jetable (port $TEST_PORT)..."
  docker rm -f "$TEST_CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$TEST_CONTAINER" \
    -e POSTGRES_DB="$TEST_DB" -e POSTGRES_USER="$TEST_USER" -e POSTGRES_PASSWORD="$TEST_PASSWORD" \
    -p "$TEST_PORT:5432" postgis/postgis:15-3.3 >/dev/null

  echo "⏳ Attente que la base de test soit prête..."
  for i in $(seq 1 30); do
    if docker exec "$TEST_CONTAINER" pg_isready -U "$TEST_USER" >/dev/null 2>&1; then
      echo "✅ Base de test prête."
      break
    fi
    sleep 1
  done

  echo "🗄️  Exécution des migrations sur la base de test..."
  cd "$ROOT_DIR/backend"
  export DB_HOST=localhost DB_PORT=$TEST_PORT DB_NAME=$TEST_DB DB_USER=$TEST_USER DB_PASSWORD=$TEST_PASSWORD
  export JWT_ACCESS_SECRET=test_access_secret_at_least_16_chars
  export JWT_REFRESH_SECRET=test_refresh_secret_at_least_16_chars
  export SMS_PROVIDER=console
  npm run migration:run
  npm run seed

  echo "🧪 Tests end-to-end (contre une vraie base PostgreSQL)..."
  npm run test:e2e || { echo "❌ Échec des tests e2e."; docker rm -f "$TEST_CONTAINER" >/dev/null 2>&1; exit 1; }

  echo "🧹 Nettoyage de la base de test..."
  docker rm -f "$TEST_CONTAINER" >/dev/null 2>&1
}

case "$MODE" in
  --unit)
    run_unit_tests
    ;;
  --e2e)
    run_e2e_tests
    ;;
  all|*)
    run_unit_tests
    echo ""
    run_e2e_tests
    ;;
esac

echo ""
echo "✅ Tests terminés."
