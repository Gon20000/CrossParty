#!/usr/bin/env bash

set -e

echo "=== CrossParty Termux Setup ==="

# Step 1: Update Termux packages
echo "[1/4] Updating Termux packages..."
pkg update -y
pkg upgrade -y

# Step 2: Install Node.js, npm, and git
echo "[2/4] Installing Node.js, npm, and git..."
pkg install -y nodejs git

# Step 3: Clone the repo if not already present
if [ ! -d "CrossParty" ]; then
  echo "[3/4] Cloning CrossParty repository..."

  # --depth 1 avoids full history (faster)
  # -q makes it quiet
  git clone --depth 1 -q https://github.com/Gon20000/CrossParty.git
fi

cd CrossParty

# Step 4: Install npm dependencies
echo "[4/4] Installing npm dependencies..."
npm install

echo "✅ Setup complete! Launching CrossParty client..."
npm start

