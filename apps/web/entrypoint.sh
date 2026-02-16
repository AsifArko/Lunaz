#!/bin/sh
# Generate runtime config.js from env (set by docker-compose)
API_URL="${VITE_API_URL:-http://localhost:4000/api/v1}"
GOOGLE_ID="${VITE_GOOGLE_CLIENT_ID:-}"
cat > /app/dist/config.js << EOF
window.__VITE_API_URL__ = "${API_URL}";
window.__VITE_GOOGLE_CLIENT_ID__ = "${GOOGLE_ID}";
EOF
exec serve -s /app/dist -l 80
