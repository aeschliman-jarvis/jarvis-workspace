#!/usr/bin/env node
/**
 * Mission Orchestrator — Main-session integration
 * 
 * This is invoked from the main OpenClaw session and uses sessions_spawn
 * to create isolated agent workers. It coordinates the full lifecycle.
 * 
 * For v1: Single-agent missions (expandable to multi-agent in v2)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');
const AGENTS_DIR = path.join(WORKSPACE, 'agents');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

// Ensure directories
['missions', 'agents', 'memory'].forEach(dir => {
  fs.mkdirSync(path.join(WORKSPACE, dir), { recursive: true });
});

// Agent definitions with system prompts
const AGENT_ROLES = {
  researcher: {
    name: 'Researcher',
    icon: '🔍',
    systemPrompt: `You are a Research Agent. Your job: gather facts, data, market intelligence, credible sources.

Rules:
- Facts over opinions
- Cite sources when possible
- Quantitative > qualitative
- Organize with clear sections
- Identify knowledge gaps

Deliverable: Write a comprehensive research report to deliverable.md in your working directory.`
  },
  designer: {
    name: 'Designer',
    icon: '🎨',
    systemPrompt: `You are a Design Agent. Your job: create visual concepts, brand direction, design specs.

Rules:
- Specific, executable design guidance
- Include color codes, typography, layout notes
- Provide mockup descriptions
- Consider practical implementation

Deliverable: Write a detailed design spec to deliverable.md in your working directory.`
  },
  logistics: {
    name: 'Logistics Coordinator',
    icon: '📦',
    systemPrompt: `You are a Logistics Agent. Your job: map operations, find suppliers, estimate costs, plan timelines.

Rules:
- Concrete vendor options with contact info or search terms
- Cost estimates with ranges (low/mid/high)
- Timeline with phases
- Identify risks and mitigations

Deliverable: Write an operational plan to deliverable.md in your working directory.`
  },
  financier: {
    name: 'Financial Analyst',
    icon: '💰',
    systemPrompt: `You are a Financial Analyst. Your job: build cost models, revenue projections, unit economics.

Rules:
- Detailed cost breakdowns (startup, fixed, variable)
- Scenario modeling (conservative/base/optimistic)
- Break-even analysis with math shown
- Identify key financial risks

Deliverable: Write a financial model to deliverable.md in your working directory.`
  },
  writer: {
    name: 'Writer',
    icon: '✍️',
    systemPrompt: `You are a Writer. Your job: produce polished, ready-to-use copy.

Rules:
- Clear, persuasive, audience-appropriate
- Strong headlines and CTAs
- Multiple variations where helpful
- Format for immediate use

Deliverable: Write final copy to deliverable.md in your working directory.`
  },
  strategist: {
    name: 'Strategist',
    icon: '♟️',
    systemPrompt: `You are a Strategy Agent. Your job: define positioning, ICP, go-to-market, growth levers.

Rules:
- Clear positioning statement
- Specific ICP with demographics + psychographics
- Channel strategy with rationale
- Competitive moat identification

Deliverable: Write a strategic brief to deliverable.md in your working directory.`
  },
  generalist: {
    name: 'Generalist',
    icon: '⚙️',
    systemPrompt: `You are a Generalist Executor. Your job: complete the assigned mission with thoroughness.

Rules:
- Cover all aspects of the task
- Provide actionable recommendations
- Clear structure with sections
- Identify follow-up work needed

Deliverable: Write a complete work product to deliverable.md in your working directory.`
  }
};

/**
 * Generate a mission ID from the goal
 */
function generateMissionId(goal) {
  const slug = goal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 40);
  const hash = crypto.randomBytes(4).toString('hex');
  return `${slug}-${hash}`;
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().split('T')[0];
}

/**
 * Format timestamp in Chicago time
 */
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

/**
 * Append to mission log
 */
function logMission(missionId, entry) {
  const logPath = path.join(MISSIONS_DIR, missionId, 'log.md');
  const timestamp = formatTimestamp();
  fs.appendFileSync(logPath, `- [${timestamp}] ${entry}\n`);
}

/**
 * Update TASKS.md with mission entry
 */
function updateTasks(missionId, goal, agentName, status) {
  const tasksFile = path.join(WORKSPACE, 'TASKS.md');
  let content = '';
  
  try {
    content = fs.readFileSync(tasksFile, 'utf8');
  } catch (e) {
    // File doesn't exist yet
  }
  
  const timestamp = formatTimestamp();
  const prefix = {
    'started': '🚀 MISSION STARTED',
    'completed': '✅ MISSION COMPLETE',
    'failed': '❌ MISSION FAILED',
    'abandoned': '⏸️ MISSION ABANDONED'
  }[status] || '📋 MISSION UPDATE';
  
  const entry = `- [${timestamp}] **${prefix}:** [\`${missionId}\`] ${goal}\n  Agent: ${agentName}\n`;
  
  fs.writeFileSync(tasksFile, entry + content);
}

/**
 * Update CURRENT.md
 */
function updateCurrent(missionId, goal, status) {
  const currentFile = path.join(WORKSPACE, 'CURRENT.md');
  let content = '';
  
  try {
    content = fs.readFileSync(currentFile, 'utf8');
  } catch (e) {}
  
  // Remove any existing entry for this mission
  const lines = content.split('\n').filter(line => !line.includes(missionId));
  content = lines.join('\n');
  
  if (status === 'active') {
    const entry = `\n### 🎯 Active Mission: ${missionId}\n- **Goal:** ${goal}\n- **Status:** In progress\n- **Started:** ${formatTimestamp()}\n`;
    content = entry + '\n' + content;
  }
  
  fs.writeFileSync(currentFile, content);
}

/**
 * Log to daily memory file
 */
function logToMemory(missionId, message) {
  const today = getToday();
  const memoryFile = path.join(MEMORY_DIR, `${today}.md`);
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

/**
 * Create agent brief
 */
function createBrief(missionGoal, agentType, dependencyOutputs) {
  const role = AGENT_ROLES[agentType] || AGENT_ROLES.generalist;
  
  const deps = dependencyOutputs && dependencyOutputs.length > 0
    ? dependencyOutputs.map(dep => {
        return `## From ${dep.agentRole}\n\n\`\`\`\n${dep.output}\n\`\`\``;
      }).join('\n\n')
    : '*You are the first agent on this mission — no prior work to review.*';
  
  return `
# Mission Brief

## 🎯 Mission Goal
${missionGoal}

## 🤖 Your Role: ${role.name}
${role.systemPrompt}

## 📥 Context from Prior Work
${deps}

## 📤 Your Task
1. Complete the work assigned to you
2. Write your final deliverable to: deliverable.md
3. Exit with status 0 when complete

---

*Brief generated at: ${formatTimestamp()}*
  `.trim();
}

/**
 * Main: Start a mission
 */
async function startMission(goal, agentType = 'generalist') {
  const role = AGENT_ROLES[agentType];
  
  if (!role) {
    throw new Error(`Unknown agent type: ${agentType}. Available: ${Object.keys(AGENT_ROLES).join(', ')}`);
  }
  
  const missionId = generateMissionId(goal);
  const missionDir = path.join(MISSIONS_DIR, missionId);
  const agentDir = path.join(missionDir, agentType);
  
  // Create directories
  fs.mkdirSync(agentDir, { recursive: true });
  
  // Initialize log
  const logPath = path.join(missionDir, 'log.md');
  fs.writeFileSync(logPath, `# Mission Log: ${missionId}\n\n**Goal:** ${goal}\n**Agent:** ${role.name}\n**Status:** initiating\n**Created:** ${formatTimestamp()}\n\n---\n\n`);
  
  console.log(`${role.icon} Starting mission: ${missionId}`);
  console.log(`🎯 Goal: ${goal}`);
  console.log(`🤖 Agent: ${role.name}`);
  
  // Log everywhere
  logMission(missionId, 'Mission initiated');
  logToMemory(missionId, `Mission started: "${goal}" (${role.name})`);
  updateTasks(missionId, goal, role.name, 'started');
  updateCurrent(missionId, goal, 'active');
  
  // Create brief
  const briefContent = createBrief(goal, agentType, []);
  const briefPath = path.join(agentDir, 'brief.md');
  fs.writeFileSync(briefPath, briefContent);
  
  logMission(missionId, 'Agent brief created');
  
  // Return mission context for the caller
  return {
    missionId,
    missionDir,
    agentDir,
    briefPath,
    goal,
    agentType,
    role
  };
}

/**
 * Check if mission is complete (has deliverable.md)
 */
function isMissionComplete(missionId, agentType) {
  const deliverablePath = path.join(MISSIONS_DIR, missionId, agentType, 'deliverable.md');
  return fs.existsSync(deliverablePath);
}

/**
 * Compile final deliverable
 */
function compileMission(missionId, goal, agentType, role) {
  const deliverablePath = path.join(MISSIONS_DIR, missionId, agentType, 'deliverable.md');
  const finalPath = path.join(MISSIONS_DIR, missionId, 'final.md');
  
  if (!fs.existsSync(deliverablePath)) {
    throw new Error('Deliverable not found — agent may not have completed');
  }
  
  const deliverable = fs.readFileSync(deliverablePath, 'utf8');
  
  const final = `
# 🎉 Mission Complete: ${goal}

**Mission ID:** ${missionId}  
**Agent:** ${role.name} (${agentType})  
**Completed:** ${formatTimestamp()}

---

## Deliverable

${deliverable}

---

*View mission log: ${path.join(MISSIONS_DIR, missionId, 'log.md')}*
  `.trim();
  
  fs.writeFileSync(finalPath, final);
  
  logMission(missionId, 'Mission compiled — ' + finalPath);
  logToMemory(missionId, `Mission completed: deliverable at ${finalPath}`);
  updateTasks(missionId, goal, role.name, 'completed');
  updateCurrent(missionId, goal, ''); // Remove from active
  
  return finalPath;
}

// Export for use by other modules
module.exports = {
  startMission,
  compileMission,
  isMissionComplete,
  AGENT_ROLES,
  generateMissionId,
  MISSIONS_DIR,
  WORKSPACE
};

// CLI entry point
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
    console.error('Usage: node mission-orchestrator.js "<goal>" [--agent <type>]');
    console.error('\nAgents: ' + Object.keys(AGENT_ROLES).join(', '));
    process.exit(1);
  }
  
  startMission(goal, agentType)
    .then(ctx => {
      console.log(`\n📁 Mission directory: ${ctx.missionDir}`);
      console.log(`📝 Brief: ${ctx.briefPath}`);
      console.log('\n✅ Mission initialized.\n\nNext: The calling context should spawn an isolated agent\nwith the brief, then poll for deliverable.md completion.');
      
      // Print the brief
      console.log('\n═══ AGENT BRIEF ═══\n');
      console.log(fs.readFileSync(ctx.briefPath, 'utf8'));
    })
    .catch(err => {
      console.error('Mission failed:', err.message);
      process.exit(1);
    });
}
