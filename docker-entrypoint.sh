#!/bin/sh
set -e
# Run backend in background (from /app, port 4000)
cd /app
node dist/index.js &
# Give backend a moment to bind
sleep 2
# Nginx in foreground (so container stays up and receives signals)
exec nginx -g "daemon off;"
