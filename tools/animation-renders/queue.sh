#!/usr/bin/env bash
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
for exercise in "$@"; do
  echo "START $exercise $(date +%H:%M:%S)"
  "$here/render.sh" "$exercise" render
done
echo "QUEUE_DONE $(date +%H:%M:%S)"
