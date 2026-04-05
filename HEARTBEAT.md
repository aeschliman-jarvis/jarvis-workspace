# HEARTBEAT.md

On heartbeat:

1. Review `TASKS.md`.
2. Review `CURRENT.md` if needed for current-state drift.
3. Review today's daily memory file only if needed for context.
4. **Run Self-Healing Scan:** Execute `lib/self-healing-guardian.sh` to check for code rot.
5. **Run PCEC Evolution:** If it's been 24 hours, execute `lib/pcec-evolution-loop.sh` for self-improvement.
6. **Check dashboard inbox:** If `~/.openclaw/workspace/jarvis-dashboard/INBOX.md` has new messages, read and reply to them by writing to `OUTBOX.md`.
5. Check for any of the following:
   - a high-priority item in `Next` that appears stalled
   - any item in `Waiting` that likely needs follow-up
   - any item in `Scheduled` that is due or close to due
   - any obvious setup gap in the current operating core
   - any obvious continuity drift where `TASKS.md` or `CURRENT.md` no longer reflects current reality
6. If there is small, low-risk continuity drift, prefer correcting the relevant file quietly.
7. If something genuinely needs Jacob's attention, send a short, direct alert.
8. If nothing needs attention, reply exactly `HEARTBEAT_OK`.

## Dashboard Reply Instructions

When INBOX.md has new messages:
1. Read the latest message
2. Generate a response
3. Append to OUTBOX.md in this format:
   ```
   ### Reply to <message-id>
   <your reply here>
   ```
4. Continue with normal heartbeat checks
