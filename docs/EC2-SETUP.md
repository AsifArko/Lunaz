# Lunaz — AWS EC2 Setup Guide

Step-by-step guide to provision an EC2 instance for Lunaz deployment. See [15-AWS-EC2-DEPLOYMENT-PIPELINE.md](./15-AWS-EC2-DEPLOYMENT-PIPELINE.md) for the full pipeline documentation.

---

## 1. Launch EC2 Instance

1. **AMI:** Ubuntu 22.04 LTS
2. **Instance type:** t3.small or larger (t3.medium recommended for production)
3. **Storage:** 20 GB+ SSD (gp3)
4. **Security group:** Create or use existing; allow:
   - SSH (22) from your IP
   - HTTP (80) from 0.0.0.0/0 (or ALB)
   - HTTPS (443) from 0.0.0.0/0 (or ALB)
   - Ports 3000, 3001, 4000 if accessing apps directly (or use reverse proxy)

5. **Key pair:** Create or select an existing key pair for SSH access

---

## 2. Install Docker & Docker Compose

SSH into the instance:

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

Install Docker:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Log out and back in for the group change to take effect:

```bash
exit
ssh -i your-key.pem ubuntu@<ec2-public-ip>
docker --version
docker compose version
```

---

## 3. Create App Directory

```bash
sudo mkdir -p /opt/lunaz
sudo chown ubuntu:ubuntu /opt/lunaz
cd /opt/lunaz
```

---

## 4. Add Required Files

### 4.1 docker-compose.ec2.yml

Copy from the repo (or clone the repo and copy):

```bash
# Option A: Clone repo
git clone https://github.com/your-org/lunaz.git /tmp/lunaz
cp /tmp/lunaz/docker-compose.ec2.yml /opt/lunaz/
rm -rf /tmp/lunaz

# Option B: Create manually (copy content from repo)
```

### 4.2 .env File

Create `/opt/lunaz/.env` with production values:

```bash
nano /opt/lunaz/.env
```

**Required variables:**

```env
NODE_ENV=production

# MongoDB (use Atlas or DocumentDB in production)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lunaz

# JWT
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRES_IN=7d

# S3
S3_BUCKET=your-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# CORS (production URLs)
FRONTEND_WEB_URL=https://your-domain.com
FRONTEND_MANAGE_URL=https://manage.your-domain.com
API_URL=https://api.your-domain.com

# OAuth (if used)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# SSLCommerz (if used)
SSLCOMMERZ_SANDBOX=false
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
```

**Note:** `TAG` and `REGISTRY_IMAGE` are set by the deploy script; do not add them to `.env`.

---

## 5. GitHub Actions Secrets

In your GitHub repo: **Settings → Secrets and variables → Actions**:

| Secret            | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `EC2_HOST`        | EC2 public IP or hostname (e.g. `ec2-xx-xx-xx-xx.compute.amazonaws.com`)          |
| `EC2_USER`        | SSH user (e.g. `ubuntu`)                                                          |
| `EC2_SSH_KEY`     | Full contents of your `.pem` private key                                          |
| `GHCR_TOKEN`      | GitHub PAT with `read:packages` (if images are private)                           |
| `PROD_API_URL`    | Production API URL (e.g. `https://api.your-domain.com`)                           |
| `PROD_URL`        | Production Web URL (e.g. `https://your-domain.com`)                               |
| `PROD_MANAGE_URL` | Production Manage URL (e.g. `https://manage.your-domain.com`)                     |
| `VITE_API_URL`    | Production API URL for frontend build (e.g. `https://api.your-domain.com/api/v1`) |

For GitHub Container Registry (GHCR): if your images are **public**, you may not need `GHCR_TOKEN`. If **private**, create a PAT with `read:packages` and add it as `GHCR_TOKEN`.

---

## 6. GitHub Environment (Optional)

Create an environment named `production` in **Settings → Environments**. Add the same secrets to the environment for deployment isolation.

---

## 7. Reverse Proxy (Nginx / Caddy)

For HTTPS and single-domain access, run Nginx or Caddy on the EC2 host.

**Example Nginx config** (`/etc/nginx/sites-available/lunaz`):

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name manage.your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/lunaz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Use SSL (e.g. Let's Encrypt with Certbot) for HTTPS.

---

## 8. First Deployment

1. Merge a PR to `master` (CI must pass).
2. CI builds Docker images and pushes to GHCR.
3. The `deploy-ec2` workflow runs automatically after CI succeeds.
4. Or trigger manually: **Actions → Deploy to EC2 → Run workflow**.

---

## 9. Manual Deploy / Rollback

**Deploy manually:**

```bash
# On EC2: (after deploy workflow has run at least once)
cd /opt/lunaz
export TAG=abc1234
export REGISTRY_IMAGE=ghcr.io/your-org/lunaz
docker compose -f docker-compose.ec2.yml pull
docker compose -f docker-compose.ec2.yml up -d --remove-orphans
```

**Rollback via GitHub Actions:**

1. Go to **Actions → Deploy to EC2**
2. **Run workflow**
3. Enter the short SHA to rollback to (e.g. `abc1234`)
4. Run

---

## 10. Port Summary

| Service | Port | URL (example)                  |
| ------- | ---- | ------------------------------ |
| Web     | 3000 | https://your-domain.com        |
| Backend | 4000 | https://api.your-domain.com    |
| Manage  | 3001 | https://manage.your-domain.com |

---

## 11. Troubleshooting

| Issue                         | Solution                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Permission denied` on Docker | Ensure user is in `docker` group. Log out and back in.                                                                                 |
| `Cannot pull image`           | Check GHCR_TOKEN if images are private. Ensure `REGISTRY_IMAGE` and `TAG` are correct.                                                 |
| Health check fails            | Verify `PROD_API_URL` in secrets matches your backend URL. Check backend logs: `docker compose -f docker-compose.ec2.yml logs backend` |
| CORS errors                   | Ensure `FRONTEND_WEB_URL` and `FRONTEND_MANAGE_URL` in `.env` match your production URLs.                                              |
