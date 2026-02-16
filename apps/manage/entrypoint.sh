#!/bin/sh
# Generate runtime config.js with API URL from env (set by docker-compose)
# Default: http://localhost:4000/api/v1. Override with VITE_API_URL.
API_URL="${VITE_API_URL:-http://localhost:4000/api/v1}"
cat > /app/dist/config.js << EOF
window.__VITE_API_URL__ = "${API_URL}";
EOF
exec serve -s /app/dist -l 80
