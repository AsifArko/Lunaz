// Dev default — overridden at runtime in Docker by entrypoint.sh
// In dev, use relative path so Vite proxy works
window.__VITE_API_URL__ = window.__VITE_API_URL__ || '/api/v1';
