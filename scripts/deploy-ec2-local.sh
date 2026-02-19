#!/bin/bash
# Deploy to EC2 without GitHub Actions — builds on EC2 from synced code
#
# Prerequisites:
#   - EC2 has Docker and Docker Compose installed
#   - You can SSH to EC2 (key-based auth)
#   - .env exists on EC2 at /opt/lunaz/.env
#
# Usage:
#   EC2_HOST=18.191.194.81 EC2_USER=ubuntu EC2_SSH_KEY=~/.ssh/lunaz-key.pem ./scripts/deploy-ec2-local.sh
#
# Or add to .env.local (gitignored):
#   EC2_HOST=your-ec2-ip
#   EC2_USER=ubuntu
#   EC2_SSH_KEY=~/.ssh/your-key.pem

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

EC2_HOST="${EC2_HOST:?Set EC2_HOST (e.g. 18.191.194.81)}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_PATH="${EC2_PATH:-/opt/lunaz}"
SSH_KEY="${EC2_SSH_KEY:-}"

SSH_OPTS=(-o StrictHostKeyChecking=no -o ConnectTimeout=10)
[ -n "$SSH_KEY" ] && SSH_OPTS+=(-i "$SSH_KEY")

echo "==> Syncing code to EC2..."
rsync -avz --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude 'node_modules' \
  --exclude 'apps/*/dist' \
  --exclude 'apps/*/node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '*.log' \
  "$REPO_ROOT/" "${EC2_USER}@${EC2_HOST}:${EC2_PATH}/"

echo "==> Building and starting on EC2..."
ssh "${SSH_OPTS[@]}" "${EC2_USER}@${EC2_HOST}" "cd ${EC2_PATH} && docker compose -f docker-compose.ec2.build.yml up -d --build"

echo "==> Done. App should be live shortly."
