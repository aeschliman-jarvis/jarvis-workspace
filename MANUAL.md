# The Jarvis Manual: Autonomous OS Playbook

## 📘 Introduction
This document is the "Source of Truth" for the Jarvis Operating System. If the system is ever lost or wiped, an AI agent can use this manual to rebuild every capability, preference, and architectural component.

---

## 🧠 Chapter 1: Core Identity & Preferences
**Who we are:** A high-agency operator and execution partner for Jacob.
**The Vibe:** Direct, concise, high-leverage, no fluff.
**The Goal:** A "Real-Life Jarvis" accessible from any device that operates the computer autonomously, requiring only "Approve/Deny" from the user.

### Jacob's Operating Rules
1.  **Visual First:** Jacob needs to "see" the state of the system (Dashboards, Kanban, God View).
2.  **Local-First, Cloud-Backed:** All data lives in `~/.openclaw/workspace` but is backed up hourly to GitHub.
3.  **Zero Manual Work:** The AI should handle all typing, clicking, and navigation. The user only provides strategic direction.

---

## 🛠️ Chapter 2: Technical Skills & Implementation

### Skill 0: Total Screen Takeover (Mouse & Keyboard)
**Purpose:** To act as a human operator by moving the cursor, clicking, and typing anywhere on the macOS interface.
**Difficulty:** Medium (Requires Accessibility Permissions).
**How to Learn/Rebuild:**
1.  **The Tool:** macOS `osascript` with `System Events`.
2.  **The Permission:** You MUST go to `System Settings > Privacy & Security > Accessibility` and enable the terminal/agent running the script.
3.  **The "See" Step:** Use `screencapture` to take a snapshot. Send this image to a vision-capable AI to get `{x, y}` coordinates of the target.
4.  **The "Act" Step:**
    *   *Move/Click:* `osascript -e 'tell application "System Events" to click at {x, y}'`
    *   *Type:* `osascript -e 'tell application "System Events" to keystroke "text"'`
    *   *Special Keys:* Use `key code` (e.g., `key code 36` for Return, `key code 125` for Down Arrow).
5.  **Pro-Tip:** Always `set frontmost to true` for the target application first to ensure keystrokes go to the right window.

### Skill 1: Precision Web Manipulation (Playwright)
**Purpose:** To fill forms and navigate web UIs with 100% accuracy.
**Why:** Standard `osascript` clicks often miss targets. Playwright interacts directly with the browser's DOM.
**How to Implement:**
1.  Install: `npm install playwright`
2.  Launch: `chromium.launch({ headless: false, channel: 'chrome' })`
3.  Targeting: Use `page.locator('input').nth(index)` or specific CSS selectors.
4.  Typing: Use `element.type('text', { delay: 50 })` to simulate human input.
5.  **Crucial:** Always use `scrollIntoViewIfNeeded()` before interacting with an element.

### Skill 2: Deep System Integration (macOS Accessibility)
**Purpose:** To move the mouse, click native UI elements, and read screen content.
**Why:** Some tasks happen outside the browser (e.g., approving notifications, opening apps).
**How to Implement:**
1.  **Permission:** Ensure "Terminal" or "OpenClaw" is checked in `System Settings > Privacy & Security > Accessibility`.
2.  **The Command:** Use `osascript` with `tell application "System Events"`.
3.  **Clicking:** `click at {x, y}` using coordinates derived from screenshot analysis.
4.  **Typing:** `keystroke "text"` combined with `click` to focus fields.

### Skill 3: Visual Coordinate Targeting
**Purpose:** To find UI elements when CSS selectors are dynamic or hidden.
**How to Implement:**
1.  Capture: `screencapture -R x,y,w,h output.png`
2.  Analyze: Use an image-capable AI model to identify X,Y coordinates of buttons/fields.
3.  Execute: Pass those coordinates to the `osascript` click command.

### Skill 4: The "Nudge" Approval Loop
**Purpose:** To get user approval without stopping the autonomous flow.
**How to Implement:**
1.  Trigger: `osascript -e 'display alert "Jarvis" message "Task X" buttons {"Deny", "Approve"}'`
2.  Listen: Watch the return value of the script.
3.  Branch: If "Approve", continue execution. If "Deny", log to `MANUAL.md` and abort.

### Skill 5: Advanced Browser Orchestration (Peekaboo & Agent Browser)
**Purpose:** To solve complex automation challenges like the "Autensa" form issue by using specialized CLI tools that understand macOS UI state.
**Difficulty:** Advanced (Requires Rust environment and Accessibility/Media permissions).
**How to Learn/Rebuild:**
1.  **Peekaboo (`peekaboo`):**
    *   **What it is:** A macOS-native CLI & MCP server that uses the Accessibility API to "see", "click", and "type" with element-level precision.
    *   **Why it's better:** Unlike `osascript` coordinates, `peekaboo see` returns a JSON map of UI elements with IDs. `peekaboo click --on "Submit"` will find the button regardless of screen resolution.
    *   **Installation:** `brew install steipete/peekaboo/peekaboo`
    *   **Key Commands:**
        *   `peekaboo see --app "Google Chrome"`: Captures the UI tree of the active window.
        *   `peekaboo click --on "Sign in" --snapshot`: Clicks a UI element by its label.
        *   `peekaboo type --text "Jacob" --clear`: Types into the currently focused field.
    *   **Debugging the Autensa Form:** If a form element is hidden in a shadow DOM or an iframe, use `peekaboo see --mode screen` to get a visual snapshot, then use the `peekaboo agent --model` command to let a vision model pilot the browser directly.
2.  **Agent Browser (`agent-browser`):**
    *   **What it is:** A headless browser automation CLI optimized for AI agents (Rust-based).
    *   **Installation:** Search `clawhub install agent-browser` or build from the VoltAgent repo.
    *   **Why it helps:** It provides a "fast lane" for Playwright-style interactions without needing a full Node.js environment for every task.

### Skill 6: Local Voice Integration (macOS TTS & STT)
**Purpose:** To enable "Jarvis" to speak and listen without relying on paid APIs.
**How to Implement:**
1.  **Text-to-Speech (TTS):**
    *   **Tool:** The built-in macOS `say` command.
    *   **Usage:** `say -v "Samantha" "System ready, Jacob."`
    *   **High-Quality Voices:** Install "Premium" voices in `System Settings > Accessibility > Spoken Content`.
    *   **OpenClaw Integration:** Use the `mac-tts` skill from ClawHub.
2.  **Speech-to-Text (STT - Local Whisper):**
    *   **Tool:** `whisper.cpp` or `faster-whisper`.
    *   **Usage:** Record audio via `sox` or `ffmpeg` (`ffmpeg -f avfoundation -i ":0" recording.wav`), then pipe to Whisper CLI.
    *   **OpenClaw Integration:** Use the `openai-whisper` skill (which supports local execution).

### Skill 7: Free & Trustworthy Web Search (Local SearXNG + Cross-Validation)
**Purpose:** To provide high-leverage research without API keys, including "Truth Scores" for every claim.
**How to Learn/Rebuild:**
1.  **The Tool:** `openclaw-free-web-search` (a community skill by `wd041216-bit`).
2.  **Core Components:**
    *   **SearXNG:** A self-hosted, privacy-respecting metasearch engine. It aggregates results from Bing, DuckDuckGo, Google, and Startpage.
    *   **Scrapling:** A high-performance anti-bot scraper that handles Cloudflare Turnstile and TLS fingerprinting.
    *   **Verify Claim:** A Python script that cross-validates a specific claim against 3–10 independent sources to provide a "Confidence Score" (VERIFIED, LIKELY_TRUE, UNCERTAIN).
3.  **Installation:**
    *   Clone: `git clone https://github.com/wd041216-bit/openclaw-free-web-search.git`
    *   Install: `./install_local_search.sh` (Handles SearXNG, Scrapling, and Playwright).
    *   Run: `./start_local_search.sh`.
4.  **Usage in OpenClaw:**
    *   `search_local_web.py --query "Current best local LLM" --intent research`
    *   `verify_claim.py --claim "Claude 4 was released in 2025" --sources 5`

### Skill 11: The Self-Healing Git Guardian
**Purpose:** To automatically detect and repair syntax errors or broken scripts in the workspace.
**How to Rebuild:**
1.  **The Tool:** `lib/self-healing-guardian.sh`
2.  **The Logic:** Runs `node -c` and `bash -n` on all workspace files to find syntax errors.
3.  **The Fix:** If an error is found, it creates a new `fix/` branch and sends the error log to the OpenClaw agent to generate a code patch.
4.  **The Automation:** Add to cron: `*/30 * * * * $HOME/.openclaw/workspace/lib/self-healing-guardian.sh`
**Purpose:** To prevent the AI from "losing the thread" during long autonomous sessions.
**How to Implement:**
1.  **Tools:** `arc-agent-lifecycle` and `arc-memory-pruner` (Community skills).
2.  **Concept:**
    *   **State-Snapshots:** At the end of every sub-task, write a `STATE.md` file summarizing what just happened.
    *   **Memory Pruning:** Every hour, use a script to "compact" `memory/YYYY-MM-DD.md` by removing noise and keeping only high-signal decisions.
    *   **Task Queues:** Use a file-based queue (e.g., `TASKS.md`) where the AI pulls the next line, executes it, and marks it `[x]` before picking the next.

---

## 🏗️ Chapter 3: System Architecture

### The Workspace (`~/.openclaw/workspace`)
*   **`MANUAL.md`:** This file. The brain of the operation.
*   **`TASKS.md`:** The current to-do list.
*   **`CURRENT.md`:** Cross-surface handoff state.
*   **`memory/`:** Daily logs of all activities.
*   **`lib/`:** Custom scripts (system-controller, self-healing, form-fillers).

### The Dashboard Stack
*   **Foundation:** `crshdn/mission-control` (Autensa).
*   **Role:** The "Command Center" for agent orchestration.
*   **Port:** `http://localhost:4000`.
*   **Config:** Located in `.env.local` (Gateway URL and Token).

### The Backup Protocol
*   **Tool:** Git + GitHub.
*   **Repo:** `aeschliman-jarvis/jarvis-workspace` (Private).
*   **Automation:** A cron job runs every hour: `git add -A && git commit -m 'Auto-backup' && git push`.

---

## 🚀 Chapter 4: Autonomous Operation Guide

### How to Start a Session
1.  **Read:** Load `MANUAL.md` and `memory/YYYY-MM-DD.md`.
2.  **Check:** Run `openclaw gateway status` to ensure the brain is alive.
3.  **Connect:** If browser work is needed, launch Chrome with `--remote-debugging-port=9222`.

### How to Handle Errors (Self-Healing)
1.  **Detect:** Wrap commands in a try/catch or check exit codes.
2.  **Analyze:** Read the error output.
3.  **Fix:** 
    *   *Permission Error?* Retry with `sudo` or check Accessibility settings.
    *   *Port in Use?* Run `lsof -ti:PORT | xargs kill -9`.
    *   *Unknown?* Log to `MANUAL.md` under "Known Issues" and notify Jacob via Nudge.

---

## 📝 Chapter 5: Current Projects & State
*   **Jarvis Workspace:** The primary repo being managed by Autensa.
*   **Mobile Integration:** Currently researching ways to expose the dashboard to iOS/Android.
*   **Agent Orchestration:** Moving from single-agent tasks to multi-agent "Missions."
*   **Autensa Form Fix:** Currently integrating `peekaboo` for UI-tree based navigation to solve dynamic selector issues.
*   **Local Voice:** Researching `mac-tts` and `openai-whisper` for a fully offline "Jarvis" voice loop.

---

## 🧬 Chapter 6: Community Skill Ecosystem (The "Awesome" List)
**Source:** `VoltAgent/awesome-openclaw-skills` + GitHub Topics
**Key Findings for High-Leverage Autonomy:**
1.  **Browser & Automation:**
    *   `agent-browser`: A Rust-based, headless CLI for AI agents. Faster than Playwright for simple DOM interactions.
    *   `actionbook`: A general-purpose browser automation tool for web scraping and form-filling when selectors are tricky.
    *   **`browser-use` (The New Gold Standard):** A Python-based library built specifically for AI agents. It replaces brittle Playwright selectors with an "accessibility tree" input for the LLM, making form-filling robust against dynamic DOM changes. 
        *   **Install:** `uv add browser-use`
        *   **Usage:** Pass a human-language goal (e.g., "Fill this Autensa form with my info") and the agent pilots the browser using structured snapshots.
        *   **Why it wins:** It bypasses the need for vision models by feeding the LLM the DOM's *accessibility* tree—a lightweight JSON representation of all interactive elements.
    *   **`playwright-mcp`:** The official Microsoft Model Context Protocol server for Playwright. Allows any MCP-compatible AI (Claude Code, Cursor, Codex) to pilot a browser via structured context rather than pixels.
        *   **Config:** `{ "mcpServers": { "playwright": { "command": "npx", "args": ["@playwright/mcp@latest"] } } }`
2.  **Research & Verification:**
    *   `openclaw-free-web-search`: The "Gold Standard" for free research. Uses local SearXNG + Scrapling + Multi-source cross-validation. It provides a "Verdict" (VERIFIED/UNCERTAIN) for every claim.
3.  **macOS Native:**
    *   `peekaboo`: The ultimate tool for macOS UI interaction. It replaces brittle `osascript` coordinates with semantic UI element IDs.
4.  **Memory & Context:**
    *   `alex-session-wrap-up`: Automates end-of-session "cleaning" (commits, learning extraction, pattern detection).
    *   `agent-brain`: A local-first, SQLite-backed memory system for AI agents with hybrid retrieval.
    *   **Leon AI (v2.0):** A mature, open-source personal assistant now transitioning to an agentic, tool-based architecture. 
        *   **Status:** Developer Preview on `develop` branch.
        *   **Key Feature:** Native integration of "Skills -> Actions -> Tools" pipeline with context-aware memory.
5.  **Voice & Multimodal:**
    *   **OpenVoice:** MIT & MyShell's instant voice cloning tech. Local-friendly and natively multi-lingual.
    *   **`openai-whisper` Skill:** Built into OpenClaw for local, offline Speech-to-Text. No API key needed. Works by capturing macOS system audio or microphone input and piping it to a local Whisper.cpp instance.

### 🕵️ Skill Hunt Report (Sat Apr  4 18:37:58 CDT 2026)
**GitHub Finds:**
- **elevenlabs-twilio-memory-bridge**: Lightweight personalization webhook for ElevenLabs + Twilio voice agents with persistent caller memo... [Link](https://github.com/britrik/elevenlabs-twilio-memory-bridge)
- **Enso**: An AI sandbox where every user owns the factory. One-command setup personalizes the entire app — Cla... [Link](https://github.com/Proxy2021/Enso)

**Reddit Breakthroughs:**
- Reddit search failed.


### 🕵️ Skill Hunt Report (Sun Apr  5 12:00:01 CDT 2026)
**GitHub Finds:**
- **Awesome-OpenClaw-Research**: A curated collection of 54+ academic papers, security reports, datasets, and tools for the OpenClaw ... [Link](https://github.com/REAL-Lab-NU/Awesome-OpenClaw-Research)
- **openclaw-skills**: OpenClaw agent skills collection... [Link](https://github.com/ricanwarfare/openclaw-skills)

**Reddit Breakthroughs:**
- Reddit search failed.


### 🕵️ Skill Hunt Report (Sun Apr  5 18:00:00 CDT 2026)
**GitHub Finds:**
- **openclaw-engram**: Local-first memory plugin for OpenClaw AI agents. LLM-powered extraction, plain markdown storage, hy... [Link](https://github.com/joshuaswarren/openclaw-engram)
- **agent-library**: Beginner-friendly tutorials, agent personas, skills, and templates for heyron users.... [Link](https://github.com/heyron-ai/agent-library)

**Reddit Breakthroughs:**
- Reddit search failed.

