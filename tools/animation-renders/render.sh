#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
: "${RENDER_WORK:?set RENDER_WORK to the folder holding base.blend}"
: "${BLENDER:?set BLENDER to the blender executable}"
exercise="$1"
shift
"$BLENDER" -b --python "$here/exercises/$exercise.py" -- "${@:-preview}" 2>&1 | grep -E "PREVIEW_DONE|RENDER_DONE|Error|Traceback|AssertionError|line [0-9]+" || true
