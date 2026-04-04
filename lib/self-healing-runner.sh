#!/bin/bash
# self-healing-runner.sh — Runs a command and fixes it if it breaks

COMMAND="$1"
echo "🚀 Executing: $COMMAND"

# Run the command and capture output
OUTPUT=$(eval "$COMMAND" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Success."
else
  echo "❌ Failed with code $EXIT_CODE"
  echo "🧠 Analyzing error..."
  
  # Simple heuristic fixes for now (Will be replaced by AI agent)
  if echo "$OUTPUT" | grep -q "permission denied"; then
    echo "🔧 Fix: Retrying with sudo..."
    sudo eval "$COMMAND"
  elif echo "$OUTPUT" | grep -q "not found"; then
    echo "🔧 Fix: Attempting to install missing dependency..."
    brew install $(echo "$COMMAND" | awk '{print $1}')
  elif echo "$OUTPUT" | grep -q "EADDRINUSE"; then
    echo "🔧 Fix: Killing process on port..."
    lsof -ti:$(echo "$COMMAND" | grep -o '[0-9]\+$') | xargs kill -9
  else
    echo "⚠️ Error logged to MANUAL.md for learning."
    echo "- [$(date)] Error in '$COMMAND': $OUTPUT" >> ~/MANUAL.md
  fi
fi
