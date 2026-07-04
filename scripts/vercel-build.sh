#!/usr/bin/env bash
# Vercel build entrypoint.
# Production: push Convex schema + functions, then build Next with prod URL.
# Preview/dev: Next build only (no prod Convex deploy).
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  if [ -z "${CONVEX_DEPLOY_KEY:-}" ]; then
    echo "CONVEX_DEPLOY_KEY is required for production builds."
    echo "Convex Dashboard → Project Settings → Deploy Keys → Production"
    exit 1
  fi
  npx convex deploy --cmd 'npm run build'
else
  npm run build
fi
