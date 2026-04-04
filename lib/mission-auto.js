#!/usr/bin/env node
/**
 * Mission Auto-Executor — End-to-end from main session
 *
 * This is designed to be called programmatically from the main
 * OpenClaw session. It handles the FULL lifecycle:
 *
 * 1. Initialize mission (create dirs, brief, logs)
 * 2. Spawn subagent with the brief
 * 3. Poll for deliverable completion
 * 4. Compile final result
 * 5. Update all tracking files
 *
 * Usage:
 *   const { runMission } = require('./lib/mission-auto.js');
 *   const result = await runMission("Goal here", "agent-type");
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');

// Agent roles
const AGENT_ROLES = {
  researcher: {
    name: 'Researcher', icon: '🔍',
    prompt: 'You are a Research Agent. Gather facts, market data, competitive intelligence.\n\nRules:\n- Prioritize facts over opinions\n- Include sources/links where possible\n- Quantitative > qualitative\n- Organize with clear sections\n- Flag knowledge gaps\n\nWrite your report to: deliverable.md'
  },
  designer: {
    name: 'Designer', icon: '🎨',
    prompt: 'You are a Design Agent. Create visual direction, brand concepts, design specs.\n\nRules:\n- Specific, executable design guidance\n- Color codes (hex), typography, layout\n- Mockup descriptions\n- Implementation notes\n\nWrite your spec to: deliverable.md'
  },
  logistics: {
    name: 'Logistics', icon: '📦',
    prompt: 'You are a Logistics Agent. Map operations, source suppliers, estimate costs.\n\nRules:\n- Concrete vendor options with contacts/search terms\n- Cost ranges (low/mid/high)\n- Phased timeline\n- Risk ID with mitigations\n\nWrite operational plan to: deliverable.md'
  },
  financier: {
    name: 'Financier', icon: '💰',
    prompt: 'You are a Financial Analyst. Build cost models, projections, unit economics.\n\nRules:\n- Startup/fixed/variable cost breakdowns\n- Conserv/base/optimistic scenarios\n- Break-even with math shown\n- Key financial risks\n\nWrite model to: deliverable.md'
  },
  writer: {
    name: 'Writer', icon: '✍️',
    prompt: 'You are a Writer. Produce polished, ready-to-use copy.\n\nRules:\n- Clear, persuasive, audience-appropriate\n- Strong headlines, CTAs\n- Multiple variations where useful\n- Format for immediate deployment\n\nWrite copy to: deliverable.md'
  },
  strategist: {
    name: 'Strategist', icon: '♟️',
    prompt: 'You are a Strategy Agent. Define positioning, ICP, go-to-market, growth.\n\nRules:\n- Clear positioning statement\n- Specific ICP (demographics + behavior)\n- Channel strategy with rationale\n- Competitive moat analysis\n\nWrite brief to: deliverable.md'
  },
  generalist: {
    name: 'Generalist', icon: '⚙️',
    prompt: 'You are a Generalist Executor. Complete the assigned mission thoroughly.\n\nRules:\n- Cover all aspects of the task\n- Actionable recommendations\n- Clear structure with sections\n- Identify gaps and follow-up needs\n\nWrite work product to: deliverable.md'
  }
};

function generateMissionId(goal) {
  const slug = goal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 40);
  const ts = Date.now().toString(36);
  return `${slug}-${ts}`;
}

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().split('T')[0];
}

function formatTs() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
}

function logToMemory(missionId, msg) {
  const today = getToday();
  const dir = path.join(WORKSPACE, 'memory');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${today}.md`);
  const ts = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  fs.appendFileSync(file, `- [${ts}] **Mission [${missionId}]:** ${msg}\n`);
}

function updateTasks(missionId, goal, agentName, status) {
  const f = path.join(WORKSPACE, 'TASKS.md');
  let c = '';
  try { c = fs.readFileSync(f, 'utf8'); } catch(e) {}
  const ts = formatTs();
  const pfx = { started:'🚀 MISSION STARTED', completed:'✅ MISSION COMPLETE', failed:'❌ MISSION FAILED' }[status] || '📋 MISSION';
  fs.writeFileSync(f, `- [${ts}] **${pfx}:** [\`${missionId}\`] ${goal}\n  → Agent: ${agentName}\n` + c);
}

function updateCurrent(missionId, goal, status) {
  const f = path.join(WORKSPACE, 'CURRENT.md');
  let c = '';
  try { c = fs.readFileSync(f, 'utf8'); } catch(e) {}
  const lines = c.split('\n').filter(l => !l.includes(missionId));
  c = lines.join('\n');
  if (status === 'active') {
    c = `\n### 🎯 Active Mission: ${missionId}\n- **Goal:** ${goal}\n- **Status:** In progress\n- **Started:** ${formatTs()}\n` + '\n' + c;
  }
  fs.writeFileSync(f, c);
}

function createBrief(goal, agentType) {
  const role = AGENT_ROLES[agentType] || AGENT_ROLES.generalist;
  return `# Mission Brief

## 🎯 Goal
${goal}

## 🤖 Your Role: ${role.name}
${role.prompt}

## 📤 Task
1. Review the goal and your role
2. Complete thorough, high-quality work
3. Write final deliverable to: deliverable.md
4. Exit cleanly when done

---
*Generated: ${formatTs()}*`;
}

/**
 * Initialize a mission (step 1)
 */
function initMission(goal, agentType = 'generalist') {
  const role = AGENT_ROLES[agentType];
  if (!role) throw new Error(`Unknown agent: ${agentType}`);

  const missionId = generateMissionId(goal);
  const missionDir = path.join(MISSIONS_DIR, missionId);
  const agentDir = path.join(missionDir, agentType);
  fs.mkdirSync(agentDir, { recursive: true });

  const logPath = path.join(missionDir, 'log.md');
  fs.writeFileSync(logPath, `# Mission Log: ${missionId}\n\n**Goal:** ${goal}\n**Agent:** ${role.name}\n**Started:** ${formatTs()}\n\n---\n\n`);

  logToMemory(missionId, `Started: "${goal}" (${role.name})`);
  updateTasks(missionId, goal, role.name, 'started');
  updateCurrent(missionId, goal, 'active');

  const brief = createBrief(goal, agentType);
  fs.writeFileSync(path.join(agentDir, 'brief.md'), brief);
  fs.appendFileSync(logPath, `- [${formatTs()}] Brief created\n`);

  console.log(`${role.icon} Mission: ${missionId}`);
  console.log(`🎯 ${goal}`);
  console.log(`🤖 ${role.name}\n`);

  return { missionId, missionDir, agentDir, goal, agentType, role, brief };
}

/**
 * Spawn the agent subagent (step 2)
 * Returns a subagent session handle
 */
function spawnAgent(missionId, goal, agentType, role) {
  const agentDir = path.join(MISSIONS_DIR, missionId, agentType);
  const brief = fs.readFileSync(path.join(agentDir, 'brief.md'), 'utf8');

  console.log(`🚀 Spawning ${role.name}...`);

  // This returns the task that the subagent runs
  // The caller (main session) receives this and handles the spawn
  return {
    task: brief,
    label: `Mission: ${missionId} — ${role.name}`,
    agentDir,
    deliverablePath: path.join(agentDir, 'deliverable.md')
  };
}

/**
 * Check if deliverable exists
 */
function isComplete(missionId, agentType) {
  const dp = path.join(MISSIONS_DIR, missionId, agentType, 'deliverable.md');
  return fs.existsSync(dp);
}

/**
 * Compile final deliverable (step 4)
 */
function compile(missionId, goal, agentType, role) {
  const dp = path.join(MISSIONS_DIR, missionId, agentType, 'deliverable.md');
  const fp = path.join(MISSIONS_DIR, missionId, 'final.md');

  if (!fs.existsSync(dp)) throw new Error('No deliverable yet');

  const content = fs.readFileSync(dp, 'utf8');
  const ts = formatTs();

  const final = `# 🎉 Mission Complete: ${goal}

**Mission ID:** ${missionId}  
**Agent:** ${role.name} (${agentType})  
**Completed:** ${ts}

---

${content}

---

*Log: ${path.join(MISSIONS_DIR, missionId, 'log.md')}*`;

  fs.writeFileSync(fp, final);

  const logPath = path.join(MISSIONS_DIR, missionId, 'log.md');
  fs.appendFileSync(logPath, `- [${ts}] Compiled → ${fp}\n- [${ts}] ✅ MISSION COMPLETE\n`);

  logToMemory(missionId, `Complete — ${fp}`);
  updateTasks(missionId, goal, role.name, 'completed');
  updateCurrent(missionId, goal, '');

  console.log(`\n✅ Mission complete!\n`);
  return fp;
}

/**
 * Poll for completion with timeout
 */
async function pollCompletion(missionId, agentType, timeoutMs = 300000, intervalMs = 2000) {
  const dp = path.join(MISSIONS_DIR, missionId, agentType, 'deliverable.md');
  const start = Date.now();

  console.log(`⏳ Waiting for agent...`);

  while (!fs.existsSync(dp)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Agent timed out after ${timeoutMs/1000}s`);
    }
    await new Promise(r => setTimeout(r, intervalMs));
    if ((Date.now() - start) % 10000 < intervalMs) {
      console.log(`   ... ${Math.floor((Date.now() - start)/1000)}s`);
    }
  }

  const elapsed = Math.floor((Date.now() - start) / 1000);
  console.log(`✅ Agent completed in ${elapsed}s\n`);
  return dp;
}

/**
 * Full synchronous flow (blocking — for direct exec use)
 */
async function runFullMission(goal, agentType = 'generalist', timeoutMs = 300000) {
  const ctx = initMission(goal, agentType);
  spawnAgent(ctx.missionId, ctx.goal, ctx.agentType, ctx.role);
  await pollCompletion(ctx.missionId, ctx.agentType, timeoutMs);
  const finalPath = compile(ctx.missionId, ctx.goal, ctx.agentType, ctx.role);

  return {
    missionId: ctx.missionId,
    finalPath,
    agentType: ctx.agentType,
    role: ctx.role.name
  };
}

// Export
module.exports = {
  initMission,
  spawnAgent,
  isComplete,
  pollCompletion,
  compile,
  runFullMission,
  AGENT_ROLES,
  generateMissionId
};

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  let goal = '', agentType = 'generalist';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent' && args[i+1]) { agentType = args[i+1]; i++; }
    else if (!goal) goal = args[i];
  }

  if (!goal) {
    console.error('Usage: node mission-auto.js "goal" [--agent type]');
    console.error('Agents: ' + Object.keys(AGENT_ROLES).join(', '));
    process.exit(1);
  }

  runFullMission(goal, agentType)
    .then(r => {
      console.log(`\n📦 Deliverable: ${r.finalPath}`);
      const content = fs.readFileSync(r.finalPath, 'utf8');
      console.log('\n' + content);
    })
    .catch(err => {
      console.error('Mission failed:', err.message);
      process.exit(1);
    });
}
