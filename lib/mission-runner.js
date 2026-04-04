#!/usr/bin/env node
/**
 * Mission Runner — Main Session Helper
 *
 * This is called FROM the main OpenClaw session to start a mission.
 * The main session handles the sessions_spawn and polling.
 *
 * Usage (from main session):
 *   const { startMission } = require('./lib/mission-runner.js');
 *   const { missionId, brief, agentDir, ... } = startMission("goal", "agent-type");
 *
 *   // Then main session spawns subagent:
 *   sessions_spawn({ task: brief, label: `Mission: ${missionId}`, ... })
 *
 *   // Then polls agentDir + '/deliverable.md'
 *   // Then calls compileDeliverable(missionId, agentType)
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');

// Ensure dirs
fs.mkdirSync(MISSIONS_DIR, { recursive: true });
fs.mkdirSync(path.join(WORKSPACE, 'memory'), { recursive: true });

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
  const pfx = {
    started: '🚀 MISSION STARTED',
    completed: '✅ MISSION COMPLETE',
    failed: '❌ MISSION FAILED'
  }[status] || '📋 MISSION';
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
 * Initialize a mission and return context for the caller
 * 
 * The caller (main session) should:
 * 1. Call sessions_spawn with the returned brief
 * 2. Poll ctx.agentDir + '/deliverable.md' for completion
 * 3. Call compileDeliverable(ctx.missionId, ctx.agentType)
 */
function initMission(goal, agentType = 'generalist') {
  const role = AGENT_ROLES[agentType];
  if (!role) throw new Error(`Unknown agent: ${agentType}`);

  const missionId = generateMissionId(goal);
  const missionDir = path.join(MISSIONS_DIR, missionId);
  const agentDir = path.join(missionDir, agentType);
  fs.mkdirSync(agentDir, { recursive: true });

  // Initialize log
  const logPath = path.join(missionDir, 'log.md');
  fs.writeFileSync(logPath, `# Mission Log: ${missionId}\n\n**Goal:** ${goal}\n**Agent:** ${role.name}\n**Started:** ${formatTs()}\n\n---\n\n`);

  // Tracking updates
  logToMemory(missionId, `Started: "${goal}" (${role.name})`);
  updateTasks(missionId, goal, role.name, 'started');
  updateCurrent(missionId, goal, 'active');

  // Create brief
  const brief = createBrief(goal, agentType);
  fs.writeFileSync(path.join(agentDir, 'brief.md'), brief);
  fs.appendFileSync(logPath, `- [${formatTs()}] Brief created\n`);

  console.log(`${role.icon} Mission: ${missionId}`);
  console.log(`🎯 ${goal}`);
  console.log(`🤖 ${role.name}\n`);

  return {
    missionId,
    missionDir,
    agentDir,
    goal,
    agentType,
    role,
    brief,
    deliverablePath: path.join(agentDir, 'deliverable.md')
  };
}

/**
 * Compile the final deliverable
 */
function compileDeliverable(missionId, goal, agentType, role) {
  const dp = path.join(MISSIONS_DIR, missionId, agentType, 'deliverable.md');
  const fp = path.join(MISSIONS_DIR, missionId, 'final.md');

  if (!fs.existsSync(dp)) throw new Error('No deliverable yet — agent may not have finished');

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

  console.log(`\n✅ Mission complete!`);
  return { finalPath: fp, content };
}

// Export
module.exports = {
  initMission,
  compileDeliverable,
  AGENT_ROLES,
  generateMissionId,
  MISSIONS_DIR,
  WORKSPACE
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  let goal = '', agentType = 'generalist';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent' && args[i+1]) { agentType = args[i+1]; i++; }
    else if (!goal) goal = args[i];
  }

  if (!goal) {
    console.error('Usage: node mission-runner.js "goal" [--agent type]');
    console.error('Agents: ' + Object.keys(AGENT_ROLES).join(', '));
    process.exit(1);
  }

  const ctx = initMission(goal, agentType);

  console.log('═══════════════════════════════════════════');
  console.log('MISSION INITIALIZED\n');
  console.log('Next steps (in main session):');
  console.log('');
  console.log('1. Spawn subagent:');
  console.log(`   sessions_spawn({ task: brief, label: "Mission: ${ctx.missionId}", runtime: "subagent", mode: "run" })`);
  console.log('');
  console.log('2. Poll for completion:');
  console.log(`   Check: ${ctx.deliverablePath}`);
  console.log('');
  console.log('3. Compile:');
  console.log(`   compileDeliverable("${ctx.missionId}", "${ctx.goal}", "${ctx.agentType}", role)`);
  console.log('');
  console.log('═══════════════════════════════════════════\n');
}
