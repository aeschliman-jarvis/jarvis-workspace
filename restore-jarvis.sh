#!/bin/bash
# restore-jarvis.sh — The "Magic Button" for Jarvis
# Usage: curl -sL [raw-github-url]/restore-jarvis.sh | bash

set -e
echo "🦞 Starting Jarvis Restoration..."

# 1. Install OpenClaw (if missing)
if ! command -v openclaw &> /dev/null; then
  echo "📦 Installing OpenClaw..."
  npm install -g openclaw@latest
else
  echo "✅ OpenClaw already installed."
fi

# 2. Clone Workspace
if [ ! -d "$HOME/.openclaw/workspace" ]; then
  echo "📂 Cloning Workspace..."
  mkdir -p "$HOME/.openclaw"
  git clone git@github.com:jaeschliman/jarvis-workspace.git "$HOME/.openclaw/workspace"
else
  echo "✅ Workspace exists. Pulling latest..."
  cd "$HOME/.openclaw/workspace" && git pull
fi

# 3. Install Dashboard Dependencies
echo "🔧 Setting up Mission Control Dashboard..."
cd "$HOME/.openclaw/workspace/mission-control-dashboard"
npm install

# 4. Restore Services
echo "⚙️ Configuring Services..."
launchctl load ~/Library/LaunchAgents/com.jarvis.dashboard.plist 2>/dev/null || true

echo "🎉 Jarvis Restored! Run 'openclaw gateway' to start."
