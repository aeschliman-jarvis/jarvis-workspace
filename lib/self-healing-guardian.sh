#!/bin/bash
# lib/self-healing-guardian.sh
# Automatically detects and fixes errors in the Jarvis Workspace.

WORKSPACE="$HOME/.openclaw/workspace"
LOG="$HOME/.openclaw/logs/self-healing.log"
BRANCH="fix/self-healing-$(date +%s)"

echo "🛡️  Self-Healing Guardian: Starting scan..." >> $LOG

cd $WORKSPACE

# 1. Check for syntax errors in all .js and .sh files
ERRORS=$(find . -name "*.js" -o -name "*.sh" | while read file; do
  if [[ "$file" == *.js ]]; then
    node -c "$file" 2>&1 || echo "ERROR in $file"
  elif [[ "$file" == *.sh ]]; then
    bash -n "$file" 2>&1 || echo "ERROR in $file"
  fi
done)

if [ -z "$ERRORS" ]; then
  echo "✅ No syntax errors found." >> $LOG
  exit 0
fi

echo "❌ Errors detected:\n$ERRORS" >> $LOG

# 2. Create a fix branch
git checkout -b $BRANCH

# 3. Ask Jarvis (via OpenClaw) to fix the errors
# We send the error log to the agent to generate a patch
FIX_INSTRUCTIONS="I found these syntax errors in the workspace: $ERRORS. Please read the affected files, fix the code, and save the changes."
openclaw agent --message "$FIX_INSTRUCTIONS" >> $LOG 2>&1

# 4. Commit and Push (if changes were made)
if [[ -n $(git status -s) ]]; then
  git add -A
  git commit -m "🤖 Self-Healing: Auto-fixed syntax errors"
  git push -u origin $BRANCH
  echo "🚀 Fix pushed to branch: $BRANCH" >> $LOG
  
  # Nudge the user
  osascript -e 'display notification "Self-Healing Guardian fixed broken code." with title "Jarvis"'
else
  echo "⚠️  Agent did not generate a fix. Manual intervention required." >> $LOG
fi
