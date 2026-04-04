
# CURRENT.md

## What this file is for
Use this as the cross-surface handoff file between Telegram, TUI, and other OpenClaw surfaces.

When switching surfaces, this file should answer:
- what is in motion right now
- what matters most next
- what Jacob may have missed in chat
- what decisions or approvals are needed

## Current focus
Shift from raw capability testing into learning how to use Jarvis as an operating system: continuity, workflows, delegation, reminders, and real operating patterns.

## Today’s priorities
1. Understand how to use Jarvis effectively, not just as a chatbot.
2. Keep continuity out of chat and in durable files/systems.
3. Support two real money-moving follow-ups at 11:00 AM:
   - Shawn & Tracy Jones: collect check
   - Giles & Laura Lovejoy: revised quote / ask whether they want to move forward
4. Keep building the operating core so Jacob can inspect and trust it.
5. Continue capability learning in practical, non-theoretical terms.

## Current status
- Telegram messaging is working both ways.
- Google OAuth client setup is materially advanced, but final token authorization is still incomplete.
- The sold customer follow-up was identified in One Click as Shawn & Tracy Jones.
- Lovejoy follow-up details were confirmed from calendar + CRM.
- The earlier always-on/reliability issue was diagnosed as primarily a Mac sleep/local-hosting constraint.
- Decision made: skip always-on hardening for now rather than optimize around keeping the laptop awake/open.
- A plain-English usage guide was created at `~/Desktop/how to use jarvis effectively.txt`.
- Desktop inspection mirror created at `~/Desktop/Jarvis-System-Files/` for key operating files.
- Cross-surface continuity issue remains structurally real, so files must stay the source of truth.

## Working rules
- Chat is for interaction.
- Files are for continuity.
- `TASKS.md` is the task source of truth.
- `CURRENT.md` is the cross-surface handoff/state file.
- Daily memory files capture what happened.
- `CONTINUITY.md` defines what should be written where by default.
- Desktop mirror copies in `~/Desktop/Jarvis-System-Files/` should stay aligned with the workspace versions for inspection.

## Next recommended actions
1. Continue capability-learning and workflow-design in plain English.
2. Refine how reminders, heartbeat, tasks, and handoffs should work together.
3. Start defining repeatable Jarvis workflows for business/life operations.
4. Update `TASKS.md` so it fully reflects the new learning/continuity direction.
5. Finish Google OAuth token capture later in a focused pass if Gmail/Drive API access becomes the next leverage priority.

## Open questions / approvals needed
- What repeatable Jarvis workflows Jacob wants first: follow-up prep, research briefs, task routing, file organization, or something else.
- Whether to eventually build a stronger sync mechanism for Desktop mirror files instead of relying only on process discipline.
- When to resume Google OAuth completion.
- How to build a more visual operating layer so Jacob can see ideas, tasks, workflows, and agent assignments at a glance.
- How to design a practical “second brain” Jacob can plug into rather than relying on chat alone.

## Handoff prompt
If resuming from another surface, ask:
"Give me a handoff from CURRENT.md + TASKS.md + anything important from today."
