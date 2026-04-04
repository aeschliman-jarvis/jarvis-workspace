# Mission System — v1

**Status:** IMPLEMENTED  
**Version:** Single-agent (v1) — expandable to multi-agent (v2)

---

## What This Does

The mission system lets you declare a goal, and an agent is spawned to complete it end-to-end. Results are compiled, logged, and visible across all tracking files.

## Usage

### From the command line:

```bash
# Start a mission
openclaw mission start "Research profitable home services in the Twin Cities"
openclaw mission start "Design brand identity for pressure washing company" --agent designer

# List all missions
openclaw mission list

# Show a specific mission
openclaw mission show <mission-id>

# See available agents
openclaw mission agents
```

### From within OpenClaw (main session):

The main session can invoke missions programmatically using the `mission-auto.js` library:

```javascript
const { runFullMission } = require('./lib/mission-auto.js');

// This is blocking — spawns agent, waits, compiles
const result = await runFullMission("Research profitable home improvement services in Minneapolis", "researcher");

console.log('Done:', result.finalPath);
```

### Direct subagent spawn pattern (non-blocking):

```javascript
const { initMission, spawnAgent, pollCompletion, compile } = require('./lib/mission-auto.js');

// Step 1: Initialize
const ctx = initMission("Goal here", "agent-type");

// Step 2: Get spawn task
const spawnTask = spawnAgent(ctx.missionId, ctx.goal, ctx.agentType, ctx.role);

// The calling context handles sessions_spawn(spawnTask)

// Step 3: Poll for deliverable
await pollCompletion(ctx.missionId, ctx.agentType);

// Step 4: Compile
const finalPath = compile(ctx.missionId, ctx.goal, ctx.agentType, ctx.role);
```

## Agent Types

| Agent | Role | Best For |
|-------|------|----------|
| `researcher` 🔍 | Market research, data gathering | Competitive analysis, ICP research |
| `designer` 🎨 | Visual design, brand concepts | Logos, color palettes, design specs |
| `logistics` 📦 | Operations, vendor sourcing | Supplier research, cost estimation |
| `financier` 💰 | Financial modeling | Unit economics, projections, breakeven |
| `writer` ✍️ | Copy, content | Landing pages, emails, product descriptions |
| `strategist` ♟️ | Strategy, positioning | GTM, ICP definition, growth thesis |
| `generalist` ⚙️ | General execution | Anything else |

## File Structure

```
missions/
  <mission-id>/
    log.md          — Full mission timeline
    brief.md        — Agent brief (copied to agent dir)
    final.md        — Compiled deliverable (after completion)
    <agent-type>/
      brief.md      — Agent-specific brief
      deliverable.md — Agent's work product (after completion)
```

## Integration Points

- **TASKS.md** — Mission start/completion logged with timestamps
- **CURRENT.md** — Active missions shown at top of file
- **memory/YYYY-MM-DD.md** — Mission activity logged to daily journal
- **MISSIONS.md** — This documentation file

## How It Works

1. Mission is initialized with a goal and agent type
2. A brief is generated from the agent's system prompt + goal
3. A subagent session is spawned with the brief
4. The subagent works in isolation, writing to `deliverable.md`
5. Main session polls for `deliverable.md` existence
6. Results are compiled into `final.md`
7. All tracking files are updated

## Planned v2 Features

- Multi-agent decomposition (planner → parallel agents → compiler)
- Dependency graph for agent outputs
- Cost tracking and escalation thresholds
- Mission templates (e.g., "business launch pack" = researcher + financier + strategist)
- Retry logic with backoff
- Dashboard integration with mission status cards

## Debugging

If a mission is stuck:

```bash
# Check mission log
cat missions/<mission-id>/log.md

# Check if deliverable exists
ls missions/<mission-id>/<agent-type>/deliverable.md

# Check if subagent is still alive
openclaw subagents list
```

---

*Built: April 4, 2026*
