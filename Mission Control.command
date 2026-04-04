#!/bin/bash
# Jarvis Mission Control — Desktop Launcher
# Opens the dashboard in a dedicated Chrome window

open -na "Google Chrome" --args --app=http://localhost:3000 --window-size=1400,900 2>/dev/null || \
open -na "Chrome" --args --app=http://localhost:3000 --window-size=1400,900 2>/dev/null || \
open http://localhost:3000

