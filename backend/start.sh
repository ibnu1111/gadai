#!/bin/bash
set -e

echo "Running database migrations..."
npx prisma db push --skip-generate

echo "Starting application..."
exec npm start
