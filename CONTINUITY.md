# CONTINUITY.md

Purpose: make continuity capture Jarvis's responsibility by default so important context does not live only in chat.

## Core Rule
If meaningful work happens, Jarvis should decide whether it belongs in one or more of:
- `CURRENT.md`
- `TASKS.md`
- `memory/YYYY-MM-DD.md`
- a reminder

Do not wait for Jacob to manually route every item.

## What counts as meaningful work
Examples:
- a capability was proven or broken
- a system/integration changed state
- a real task or follow-up was identified
- priorities changed
- a decision was made
- a workflow was paused, resumed, or replaced
- a cross-surface handoff would be useful
- a mistake or lesson was discovered that future-Jarvis should avoid repeating

## Routing Rules

### Update `TASKS.md` when:
- there is a real next action
- an item is waiting on outside input
- something scheduled should be tracked
- a previous task is done or no longer current
- priorities have changed enough that the file is drifting from reality

### Update `CURRENT.md` when:
- work is actively in motion
- Jacob is likely to switch surfaces
- the next-best-actions changed materially
- there is important "what's going on right now" context that should survive chat drift

### Update `memory/YYYY-MM-DD.md` when:
- something important happened today
- an integration was unlocked, fixed, or blocked
- a significant decision was made
- a durable lesson/error was learned
- something about Jacob's operating preferences became clearer

### Set a reminder when:
- timing matters
- a follow-up needs to happen later
- Jacob explicitly says "remind me"
- a task is time-sensitive enough that it should not rely only on `TASKS.md`

## Default Behavior
- Prefer writing the right file over keeping important context only in chat.
- Prefer small accurate updates over big stale files.
- Keep `CURRENT.md` concise and action-oriented.
- Keep `TASKS.md` aligned with actual priorities, not historical leftovers.
- Keep daily memory focused on durable events, decisions, and lessons.
- When updating a mirrored operating file in the workspace, also update the Desktop mirror copy in `~/Desktop/Jarvis-System-Files/` so Jacob can inspect current state easily.

## End-of-Work Check
After meaningful work, quickly check:
1. Does `TASKS.md` need updating?
2. Does `CURRENT.md` need updating?
3. Does today's memory file need a note?
4. Does this need a reminder?

If yes, do it unless there is a good reason not to.

## Heartbeat Relationship
Heartbeat should detect continuity drift and important stale state. If lightweight correction is possible without risk, Jarvis should prefer fixing the file/state rather than only noticing the drift.

## Desktop Mirror
Mirror these files for easy inspection in:
- `~/Desktop/Jarvis-System-Files/`

Mirror targets:
- `TASKS.md`
- `CURRENT.md`
- `HEARTBEAT.md`
- `CONTINUITY.md`
- `MEMORY.md`
- relevant daily memory files under `memory/`

Primary sync tool:
- `~/ .openclaw/workspace/sync_jarvis_system_files.sh` (actual path: `/Users/jaeschliman/.openclaw/workspace/sync_jarvis_system_files.sh`)

When one of these workspace files changes, refresh the Desktop mirror in the same turn whenever practical. Prefer running the sync script over manually copying one-by-one when multiple mirrored files may have changed.
