#!/bin/bash
# Jarvis Mission Control — Double-click to open
# This ensures the server is running and opens the dashboard

WORKSPACE="$HOME/.openclaw/workspace"
SERVER_DIR="$WORKSPACE/jarvis-dashboard"

# Check if server is already running
if ! lsof -i :3000 > /dev/null 2>&1; then
  echo "Starting Jarvis Dashboard..."
  cd "$SERVER_DIR" && node server.js > /tmp/jarvis-dashboard.log 2>&1 &
  sleep 2
  echo "Server started"
else
  echo "Server already running"
fi

# Open in Chrome (app mode = no address bar, dedicated window)
open -na "Google Chrome" --args --app=http://localhost:3000 2>/dev/null || \
open -a "Safari" http://localhost:3000 2>/dev/null || \
open http://localhost:3000
