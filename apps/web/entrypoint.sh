#!/bin/sh
# Generate runtime config.js from env (set by docker-compose)
API_URL="${VITE_API_URL:-http://localhost:4000/api/v1}"
GOOGLE_ID="${VITE_GOOGLE_CLIENT_ID:-}"
# Strip any trailing/leading junk (e.g. stray } from env parsing)
GOOGLE_ID=$(echo "$GOOGLE_ID" | tr -d '{}' | tr -d ' \t\n\r')
cat > /app/dist/config.js << EOF
window.__VITE_API_URL__ = "${API_URL}";
window.__VITE_GOOGLE_CLIENT_ID__ = "${GOOGLE_ID}";
EOF
exec serve -s /app/dist -l 80
