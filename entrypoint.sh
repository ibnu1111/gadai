#!/bin/sh
# Railway mounts the volume as root-owned regardless of what the image sets up
# at build time, so we start as root, fix ownership of the upload directory,
# then drop privileges to the unprivileged `nextjs` user before starting Next.js.
set -e

UPLOAD_DIR="${UPLOAD_DIR:-/app/uploads}"

mkdir -p "$UPLOAD_DIR"
chown -R nextjs:nodejs "$UPLOAD_DIR" || true

exec gosu nextjs "$@"
