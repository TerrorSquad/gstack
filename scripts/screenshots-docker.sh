#!/usr/bin/env bash
# Generate / diff visual-regression baselines inside the Playwright Linux image.
#
# Baselines are Linux-only (CI diffs against Linux renders), so this always runs
# in Docker even on a macOS host. It builds and serves the PRODUCTION build, not
# `nuxt dev`: dev injects the Nuxt DevTools overlay into every page (baseline
# noise) and renders unminified, differing from what CI serves and what users
# get. CI=true (set by the caller) makes playwright.config.ts serve
# `.output/server/index.mjs` instead of `nuxt dev`.
#
# Args are forwarded to `pnpm screenshots` (e.g. --update-snapshots).
# Requires a seeded local Supabase reachable via --network host.
set -euo pipefail

corepack enable
# CI=true makes pnpm abort a non-TTY modules purge when the named node_modules
# volume is already populated from a previous run. --config.confirmModulesPurge
# disables that prompt (pnpm 11 moved the persistent key to pnpm-workspace.yaml,
# but the CLI/env override still works).
pnpm install --frozen-lockfile --config.confirmModulesPurge=false

# @nuxtjs/supabase reads SUPABASE_URL/SUPABASE_KEY from the environment at both
# build and runtime; `node .output/server` doesn't auto-load .env, so export it.
# The repo's .env points at the local stack (127.0.0.1:54321, well-known demo
# anon key), reachable from the container via --network host.
export NUXT_IGNORE_LOCK=1
# Drop Vercel telemetry modules for this build — Speed Insights paints a debug
# timing badge and 404s on /_vercel/*.js that would appear in every baseline
# (nuxt.config.ts reads this).
export SCREENSHOTS=1
set -a
# shellcheck disable=SC1091
[ -f .env ] && . ./.env
set +a
pnpm build

pnpm screenshots "$@"
