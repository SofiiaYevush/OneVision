#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting MongoDB + Mailpit..."
docker compose -f "$ROOT/BE/docker-compose.yml" up -d mongo mailpit

echo "Waiting for MongoDB to be ready..."
until docker exec festivo-mongo mongosh --quiet --eval "db.runCommand({ ping: 1 })" &>/dev/null; do
  sleep 1
done
echo "MongoDB ready."

echo "Starting Backend..."
cd "$ROOT/BE"
npm run dev &
BE_PID=$!

echo "Starting Frontend..."
cd "$ROOT/FE"
npm run dev &
FE_PID=$!

echo ""
echo "All services running:"
echo "  Frontend  → http://localhost:5173"
echo "  Backend   → http://localhost:4000"
echo "  Mailpit   → http://localhost:8025"
echo ""
echo "Press Ctrl+C to stop all."

trap "echo 'Stopping...'; kill $BE_PID $FE_PID 2>/dev/null; docker compose -f '$ROOT/BE/docker-compose.yml' stop mongo mailpit; exit 0" INT TERM

wait $BE_PID $FE_PID