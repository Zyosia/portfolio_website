#!/usr/bin/env bash
# Deploys (or rolls back to) a given image tag on the VPS.
#
# Usage: ./deploy.sh <git-sha>
# Run from the deployment directory, which holds compose.yaml and .env.
# Called by .github/workflows/deploy.yml; run it by hand for a manual rollback.
set -euo pipefail

readonly HISTORY_FILE=".deploy-history"
readonly HEALTH_TIMEOUT_SECONDS=120
readonly KEEP_IMAGES=5

log() { printf '[deploy] %s\n' "$*"; }
fail() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

usage() {
  echo "Usage: $0 <git-sha>"
  echo "Recent deployments (newest last):"
  tail -n 10 "$HISTORY_FILE" 2>/dev/null || echo "  (none recorded)"
}

previous_tag() {
  tail -n 1 "$HISTORY_FILE" 2>/dev/null | cut -d' ' -f2 || true
}

# Keeps the most recent images of each repository so a rollback does not need a pull.
prune_old_images() {
  local repository
  docker compose config --images | sed 's/:[^:/]*$//' | sort -u | while read -r repository; do
    docker image ls "$repository" --format '{{.CreatedAt}}\t{{.ID}}' \
      | sort -r | tail -n +"$((KEEP_IMAGES + 1))" | cut -f2 \
      | xargs --no-run-if-empty docker image rm >/dev/null 2>&1 || true
  done
}

main() {
  if [[ $# -ne 1 ]]; then
    usage
    exit 1
  fi
  local tag="$1"
  [[ "$tag" =~ ^[0-9a-f]{40}$ ]] || fail "expected a full 40-character git SHA, got '$tag'"
  [[ -f compose.yaml && -f .env ]] || fail "run from the directory holding compose.yaml and .env"

  # Overrides IMAGE_TAG from .env; image names (WEB_IMAGE, API_IMAGE) come from .env.
  export IMAGE_TAG="$tag"

  log "pulling images for $tag"
  docker compose pull --quiet

  log "starting containers and waiting for their healthchecks"
  if ! docker compose up --detach --no-build --remove-orphans \
      --wait --wait-timeout "$HEALTH_TIMEOUT_SECONDS"; then
    fail "containers are not healthy. Roll back with: $0 $(previous_tag)"
  fi

  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$tag" >> "$HISTORY_FILE"
  prune_old_images
  log "deployed $tag"
}

main "$@"
