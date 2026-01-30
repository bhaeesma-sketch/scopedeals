#!/usr/bin/env bash
# deploy-vercel.sh
# Helper to deploy this static site to Vercel non-interactively using
# an environment variable `VERCEL_TOKEN`. If the token is not present,
# this script will fall back to interactive `npx vercel`.

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if command -v npx >/dev/null 2>&1; then
  if [ -n "${VERCEL_TOKEN-}" ]; then
    echo "Deploying to Vercel (non-interactive) using VERCEL_TOKEN..."
    npx vercel --prod --token "$VERCEL_TOKEN"
    exit 0
  else
    echo "No VERCEL_TOKEN found — running interactive deploy (you will be prompted to login)"
    npx vercel
    exit 0
  fi
else
  echo "npx is not available. Install Node.js (npm) or run the interactive deploy on another machine."
  exit 2
fi
