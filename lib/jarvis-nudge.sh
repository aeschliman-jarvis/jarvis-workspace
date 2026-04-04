#!/bin/bash
# jarvis-nudge.sh — Sends a notification and waits for a response

TITLE="Jarvis Approval Required"
MESSAGE="$1"
LOG_FILE="$HOME/.openclaw/workspace/nudge-response.log"

# Send the notification with two buttons
osascript <<EOF
display notification "$MESSAGE" with title "$TITLE" buttons ["Deny", "Approve"] default button "Approve"
set buttonPressed to button returned of result
if buttonPressed is "Approve" then
    do shell script "echo APPROVED > $LOG_FILE"
else
    do shell script "echo DENIED > $LOG_FILE"
end if
EOF

echo "Waiting for your response..."