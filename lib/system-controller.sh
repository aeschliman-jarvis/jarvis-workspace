#!/bin/bash
# system-controller.sh — Jarvis Deep Integration Toolkit

case "$1" in
  "click")
    # Usage: ./system-controller.sh click "Button Name"
    # Uses AppleScript to find and click a UI element
    osascript <<EOF
    tell application "System Events"
      tell process "Google Chrome"
        click (first button whose name contains "$2")
      end tell
    end tell
EOF
    ;;
  "type")
    # Usage: ./system-controller.sh type "Some text"
    osascript -e 'tell application "System Events" to keystroke "'"$2"'"'
    ;;
  "read-front")
    # Reads the content of the frontmost window (Accessibility)
    osascript <<EOF
    tell application "System Events"
      set frontApp to name of first application process whose frontmost is true
      tell process frontApp
        return value of static text of first window
      end tell
    end tell
EOF
    ;;
  "screenshot")
    # Takes a screenshot and saves it to the workspace for analysis
    screencapture -x ~/.openclaw/workspace/system-snap.png
    echo "Screenshot saved to system-snap.png"
    ;;
esac
