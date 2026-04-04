#!/bin/bash
# setup-github.sh — One-time setup for Jarvis Backup
# Usage: ./setup-github.sh

echo "🦞 Setting up Jarvis GitHub Backup..."

# 1. Prompt for Repo URL
echo "Enter your new private GitHub repo URL (e.g., git@github.com:yourname/jarvis-workspace.git):"
read REPO_URL

# 2. Add Remote
git remote add origin "$REPO_URL"

# 3. Initial Push
echo "🚀 Pushing initial workspace state..."
git push -u origin main

# 4. Verify Hourly Cron
if crontab -l | grep -q "jarvis-workspace"; then
  echo "✅ Hourly backup cron is active."
else
  echo "⚠️ Cron job not found. Re-installing..."
  (crontab -l 2>/dev/null; echo "0 * * * * cd /Users/jaeschliman/.openclaw/workspace && git add -A && git commit -m 'Auto-backup: \$(date +\%H:\%M)' && git push origin main 2>&1 | logger -t jarvis-backup") | crontab -
fi

echo "🎉 Setup complete! Your workspace is now backing up to GitHub every hour."
