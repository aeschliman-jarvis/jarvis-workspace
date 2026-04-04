#!/bin/bash
# nudge-listener.sh — Watches for your Approve/Deny decision

LOG_FILE="$HOME/.openclaw/workspace/nudge-response.log"

# Clear previous response
echo "" > "$LOG_FILE"

# Wait for the file to change
while [ ! -s "$LOG_FILE" ]; do
  sleep 1
done

RESPONSE=$(cat "$LOG_FILE")
echo "$RESPONSE"