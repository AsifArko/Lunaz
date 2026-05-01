#!/bin/sh
# Generate self-signed SSL cert if not present, then start nginx.
# Cert is valid for 365 days. Browsers will show a warning (expected for self-signed).

set -e
SSL_DIR="/etc/nginx/ssl"
CERT="${SSL_DIR}/cert.pem"
KEY="${SSL_DIR}/key.pem"

mkdir -p "${SSL_DIR}"
if [ ! -f "${CERT}" ] || [ ! -f "${KEY}" ]; then
    echo "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${KEY}" \
        -out "${CERT}" \
        -subj "/CN=lunaz-server/O=Lunaz" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    echo "Self-signed certificate created."
fi

exec nginx -g "daemon off;"
