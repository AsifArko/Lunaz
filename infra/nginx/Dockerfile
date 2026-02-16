# ============================================================================
# Lunaz — Nginx reverse proxy with HTTPS
# ============================================================================
# Self-signed cert generated at runtime. Use for EC2 deployment.
# ============================================================================

FROM nginx:alpine

# openssl needed for entrypoint to generate self-signed cert
RUN apk add --no-cache openssl

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint (generates cert at startup)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443 3001

ENTRYPOINT ["/entrypoint.sh"]
