#!/bin/bash
# One-command deploy to EC2 — loads config and runs deploy-ec2-local.sh
#
# Setup (once):
#   cp scripts/deploy-ec2.config.example scripts/deploy-ec2.config
#   Edit deploy-ec2.config with your EC2_HOST, EC2_USER, EC2_SSH_KEY
#
# Usage:
#   ./scripts/deploy-ec2.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/deploy-ec2.config"

if [[ ! -f "$CONFIG" ]]; then
  echo "Missing config: $CONFIG"
  echo "Copy from deploy-ec2.config.example and fill in your values:"
  echo "  cp scripts/deploy-ec2.config.example scripts/deploy-ec2.config"
  exit 1
fi

# shellcheck source=/dev/null
source "$CONFIG"

exec "$SCRIPT_DIR/deploy-ec2-local.sh"
