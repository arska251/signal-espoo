#!/usr/bin/env bash
# Publishes a snapshot of this app to the public demo repo, where GitHub Pages builds and deploys it.
# The team repo stays private; only this folder and SUBMISSION.md go public, as a plain commit (no history).
# Usage: scripts/publish-public.sh "commit message"
set -euo pipefail
APP="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${PUBLIC_REPO:-arska251/signal-espoo}"
MSG="${1:-Update demo}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

gh repo clone "$REPO" "$WORK" -- --quiet
rsync -a --delete \
  --exclude .git --exclude .github --exclude node_modules --exclude dist \
  --exclude '.env' --exclude '.env.*' --exclude '*-mobile.png' --exclude README.md \
  "$APP/" "$WORK/"
cp "$APP/scripts/public-README.md" "$WORK/README.md"
cp "$APP/../SUBMISSION.md" "$WORK/SUBMISSION.md"
mkdir -p "$WORK/.github/workflows"
cp "$APP/scripts/pages.yml" "$WORK/.github/workflows/pages.yml"

cd "$WORK"
git add -A
if git diff --cached --quiet; then
  echo "Nothing to publish."
  exit 0
fi
# A GitHub noreply address, so no personal email ends up in the public history.
LOGIN="$(gh api user --jq .login)"
ID="$(gh api user --jq .id)"
git -c user.name="$LOGIN" -c user.email="$ID+$LOGIN@users.noreply.github.com" commit -q -m "$MSG"
git branch -M main
git push -q origin main
echo "Pushed to https://github.com/$REPO"
