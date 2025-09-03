#!/bin/bash

# This script simulates the GitHub Actions CI checks for local development.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Install Dependencies ---
echo "Installing dependencies..."
npm ci

# --- Lint Code ---
echo "
Linting code..."
npm run lint

# --- Build Project ---
echo "
Building project..."
npm run build

# --- Run Tests ---
echo "
Running tests..."
npm test

echo "
CI check completed successfully!"
