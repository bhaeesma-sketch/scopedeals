#!/usr/bin/env bash
# Start the local dev server in repo root. Tries node/npx first, then python3.

set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if command -v npm >/dev/null 2>&1; then
  if [ -f package.json ]; then
    echo "Using npm start..."
    npm install --silent
    npm start
    exit 0
  fi
fi

if command -v npx >/dev/null 2>&1; then
  echo "Using npx http-server..."
  npx http-server ./ -p 3000 -c-1
  exit 0
fi

if command -v python3 >/dev/null 2>&1; then
  echo "Using Python 3 built-in http.server..."
  python3 -m http.server 3000
  exit 0
fi

if command -v python >/dev/null 2>&1; then
  echo "Using Python built-in http.server..."
  python -m http.server 3000
  exit 0
fi

echo "No suitable server found. Install Node (npm) or Python 3 and retry." 
exit 2
