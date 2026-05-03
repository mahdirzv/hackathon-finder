#!/bin/bash
# Sets required GitHub Actions secrets for HackathonFinder.
# Run once from the repo root: bash scripts/setup-gh-secrets.sh

set -e
REPO="mahdirzv/hackathon-finder"

OLLAMA_KEY=$(python3 -c "import json; print(json.load(open('$HOME/.openclaw/openclaw.json'))['gateway']['auth']['token'])")

if [ -z "$OLLAMA_KEY" ]; then
  echo "ERROR: Could not read OpenClaw token" >&2
  exit 1
fi

echo "Setting OLLAMA_API_KEY on $REPO..."
echo -n "$OLLAMA_KEY" | gh secret set OLLAMA_API_KEY --repo "$REPO"
echo "Done. Verify with: gh secret list --repo $REPO"
