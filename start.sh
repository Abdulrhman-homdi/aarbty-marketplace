#!/bin/bash
export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"
export DATABASE_URL="postgres://abdurhmanhomdi@localhost:5432/aarbty"
export NODE_ENV=development

echo "Starting API server on port 3001..."
export PORT=3001
pnpm --filter @workspace/api-server run dev &
API_PID=$!

echo "Starting Frontend on port 5173..."
export PORT=5173
export BASE_PATH="/"
pnpm --filter @workspace/food-truck-marketplace run dev &
FE_PID=$!

echo ""
echo "====================================="
echo "  API Server:  http://localhost:3001"
echo "  Frontend:   http://localhost:5173"
echo "====================================="
echo ""
echo "Press Ctrl+C to stop both servers"
trap "kill $API_PID $FE_PID 2>/dev/null" EXIT
wait
