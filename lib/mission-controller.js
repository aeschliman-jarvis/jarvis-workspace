#!/usr/bin/env node
/**
 * Mission Controller — OpenClaw Main Session Integration
 *
 * This is the entry point called from the main OpenClaw session.
 * It orchestrates:
 * 1. Mission initialization
 * 2. Agent brief creation
 * 3. Subagent spawn via sessions_spawn
 * 4. Poll for completion
 * 5. Result compilation
 *
 * Usage: Called programmatically or via `openclaw mission start "..."`
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');

// Agent definitions
const AGENT_ROLES = {
  researcher: {
    name: 'Researcher',
    icon: '🔍',
    systemPrompt: `You are a Research Agent. Gather facts, market data, competitive intelligence.

Rules:
- Prioritize facts over opinions
- Include sources/links where possible
- Quantitative data > qualitative
- Organize with clear sections
- Flag knowledge gaps

Write your report to: deliverable.md`
  },
  designer: {
    name: 'Designer',
    icon: '🎨',
    systemPrompt: `You are a Design Agent. Create visual direction, brand concepts, design specs.

Rules:
- Specific, executable design guidance
- Color codes (hex), typography, layout
- Mockup descriptions
- Implementation notes

Write your design spec to: deliverable.md`
  },
  logistics: {
    name: 'Logistics Coordinator',
    icon: '📦',
    systemPrompt: `You are a Logistics Agent. Map operations, source suppliers, estimate costs.

Rules:
- Concrete vendor options with contacts or search terms
- Cost ranges (low/mid/high)
- Phased timeline
- Risk identification with mitigations

Write operational plan to: deliverable.md`
  },
  financier: {
    name: 'Financial Analyst',
    icon: '💰',
    systemPrompt: `You are a Financial Analyst. Build cost models, projections, unit economics.

Rules:
- Detailed breakdowns: startup, fixed, variable costs
- Conserv/base/optimistic scenarios
- Break-even with math shown
- Key financial risks

Write financial model to: deliverable.md`
  },
  writer: {
    name: 'Writer',
    icon: '✍️',
    systemPrompt: `You are a Writer. Produce polished, ready-to-use copy.

Rules:
- Clear, persuasive, audience-appropriate tone
- Strong headlines, CTAs
- Multiple variations where useful
- Format for immediate deployment

Write final copy to: deliverable.md`
  },
  strategist: {
    name: 'Strategist',
    icon: '♟️',
    systemPrompt: `You are a Strategy Agent. Define positioning, ICP, go-to-market, growth.

Rules:
- Clear positioning statement
- Specific ICP (demographics + behavior)
- Channel strategy with rationale
- Competitive moat analysis

Write strategic brief to: deliverable.md`
  },
  generalist: {
    name: 'Generalist',
    icon: '⚙️',
    systemPrompt: `You are a Generalist Executor. Complete the assigned mission thoroughly.

Rules:
- Cover all aspects of the task
- Actionable recommendations
- Clear structure with sections
- Identify gaps and follow-up needs

Write work product to: deliverable.md`
  }
};

function generateMissionId(goal) {
  const slug = goal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 40);
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().split('T')[0];
}

function formatTimestamp() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function logToMemory(missionId, message) {
  const today = getToday();
  const memoryDir = path.join(WORKSPACE, 'memory');
  fs.mkdirSync(memoryDir, { recursive: true });
  const memoryFile = path.join(memoryDir, `${today}.md`);
  const timestamp = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const entry = `- [${timestamp}] **Mission [${missionId}]:** ${message}\n`;
  fs.appendFileSync(memoryFile, entry);
}

function updateTasks(missionId, goal, agentName, status) {
  const tasksFile = path.join(WORKSPACE, 'TASKS.md');
  let content = '';

  try {
    content = fs.readFileSync(tasksFile, 'utf8');
  } catch (e) {}

  const timestamp = formatTimestamp();
  const prefix = {
    started: '🚀 MISSION STARTED',
    completed: '✅ MISSION COMPLETE',
    failed: '❌ MISSION FAILED',
  }[status] || '📋 MISSION UPDATE';

  const entry = `- [${timestamp}] **${prefix}:** [\`${missionId}\`] ${goal}\n  → Agent: ${agentName}\n`;
  fs.writeFileSync(tasksFile, entry + content);
}

function updateCurrent(missionId, goal, status) {
  const currentFile = path.join(WORKSPACE, 'CURRENT.md');
  let content = '';

  try {
    content = fs.readFileSync(currentFile, 'utf8');
  } catch (e) {}

  // Remove old entry for this mission
  const lines = content.split('\n').filter(l => !l.includes(missionId));
  content = lines.join('\n');

  if (status === 'active') {
    const entry = `\n### 🎯 Active Mission: ${missionId}\n- **Goal:** ${goal}\n- **Status:** In progress\n- **Started:** ${formatTimestamp()}\n`;
    content = entry + '\n' + content;
  }

  fs.writeFileSync(currentFile, content);
}

function createBrief(goal, agentType) {
  const role = AGENT_ROLES[agentType] || AGENT_ROLES.generalist;

  return `
# Mission Brief

## 🎯 Mission Goal
${goal}

## 🤖 Your Role: ${role.name}
${role.systemPrompt}

## 📋 Context
You are working on mission: ${goal}

There are no prior agents on this mission (v1: single-agent mode).
You are responsible for the complete deliverable.

## 📤 Your Task
1. Review the mission goal above
2. Complete thorough, high-quality work
3. Write your final deliverable to: deliverable.md
4. Exit cleanly when complete

---

*Generated: ${formatTimestamp()}*
`.trim();
}

/**
 * Main mission execution flow
 */
async function executeMission(goal, agentType = 'generalist') {
  const role = AGENT_ROLES[agentType];

  if (!role) {
    throw new Error(`Unknown agent: ${agentType}. Available: ${Object.keys(AGENT_ROLES).join(', ')}`);
  }

  const missionId = generateMissionId(goal);
  const missionDir = path.join(MISSIONS_DIR, missionId);
  const agentDir = path.join(missionDir, agentType);

  // Create dirs
  fs.mkdirSync(agentDir, { recursive: true });

  // Log
  const logPath = path.join(missionDir, 'log.md');
  fs.writeFileSync(
    logPath,
    `# Mission Log: ${missionId}\n\n**Goal:** ${goal}\n**Agent:** ${role.name}\n**Status:** initiated\n**Created:** ${formatTimestamp()}\n\n---\n\n`
  );

  console.log(`\n${role.icon} Mission: ${missionId}`);
  console.log(`🎯 Goal: ${goal}`);
  console.log(`🤖 Agent: ${role.name}\n`);

  logToMemory(missionId, `Mission started: "${goal}" (${role.name})`);
  updateTasks(missionId, goal, role.name, 'started');
  updateCurrent(missionId, goal, 'active');

  // Create brief
  const brief = createBrief(goal, agentType);
  const briefPath = path.join(agentDir, 'brief.md');
  fs.writeFileSync(briefPath, brief);
  fs.appendFileSync(logPath, `- [${formatTimestamp()}] Brief created\n`);

  // For v1: output the brief and instructions for manual subagent spawn
  // (The caller / main session handles sessions_spawn)

  console.log(`📁 Mission directory: ${missionDir}`);
  console.log(`📝 Brief: ${briefPath}\n`);

  // Return context for the caller
  return {
    missionId,
    missionDir,
    agentDir,
    briefPath,
    goal,
    agentType,
    role,
    brief,
  };
}

/**
 * Check if agent has completed work
 */
function checkCompletion(missionId, agentType) {
  const deliverablePath = path.join(
    MISSIONS_DIR,
    missionId,
    agentType,
    'deliverable.md'
  );
  return fs.existsSync(deliverablePath);
}

/**
 * Compile the final deliverable
 */
function compileDeliverable(missionId, goal, agentType, role) {
  const deliverablePath = path.join(
    MISSIONS_DIR,
    missionId,
    agentType,
    'deliverable.md'
  );
  const finalPath = path.join(MISSIONS_DIR, missionId, 'final.md');

  if (!fs.existsSync(deliverablePath)) {
    throw new Error(
      'No deliverable found — agent may not have completed yet'
    );
  }

  const deliverable = fs.readFileSync(deliverablePath, 'utf8');
  const completed = formatTimestamp();

  const final = `
# 🎉 Mission Complete: ${goal}

**Mission ID:** ${missionId}  
**Agent:** ${role.name} (${agentType})  
**Completed:** ${completed}

---

${deliverable}

---

*Mission log: ${path.join(MISSIONS_DIR, missionId, 'log.md')}*
`.trim();

  fs.writeFileSync(finalPath, final);

  const logPath = path.join(MISSIONS_DIR, missionId, 'log.md');
  fs.appendFileSync(
    logPath,
    `- [${completed}] Mission compiled — ${finalPath}\n- [${completed}] MISSION COMPLETE\n`
  );

  logToMemory(missionId, `Mission completed — deliverable: ${finalPath}`);
  updateTasks(missionId, goal, role.name, 'completed');
  updateCurrent(missionId, goal, '');

  return finalPath;
}

// Export for programmatic use
module.exports = {
  executeMission,
  compileDeliverable,
  checkCompletion,
  AGENT_ROLES,
  generateMissionId,
  MISSIONS_DIR,
  WORKSPACE,
};

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  let goal = '';
  let agentType = 'generalist';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent' && args[i + 1]) {
      agentType = args[i + 1];
      i++;
    } else if (!goal) {
      goal = args[i];
    }
  }

  if (!goal) {
    console.error('Usage: node mission-controller.js "<goal>" [--agent <type>]');
    console.error('\nAgents: ' + Object.keys(AGENT_ROLES).join(', '));
    process.exit(1);
  }

  executeMission(goal, agentType)
    .then((ctx) => {
      console.log('\n═══ NEXT STEPS ═══');
      console.log(
        '\nThe mission is initialized. The calling context should:'
      );
      console.log(
        '  1. Spawn a subagent with the brief at: ' + ctx.briefPath
      );
      console.log('  2. Poll for deliverable.md in: ' + ctx.agentDir);
      console.log('  3. Call compileDeliverable() when complete\n');
      console.log('═══ BRIEF PREVIEW ═══\n');
      console.log(ctx.brief.substring(0, 1000) + '...\n');
    })
    .catch((err) => {
      console.error('Mission failed:', err.message);
      process.exit(1);
    });
}
