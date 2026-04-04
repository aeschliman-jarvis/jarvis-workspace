#!/usr/bin/env node
/**
 * Mission Spawner — Invokes a mission via OpenClaw's sessions_spawn
 * 
 * This is called from the main session to create an isolated agent
 * that executes the mission work.
 * 
 * Usage: node lib/mission-spawner.js <mission-id> <agent-type>
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE = process.env.HOME + '/.openclaw/workspace';
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');

function main() {
  const missionId = process.argv[2];
  const agentType = process.argv[3];
  
  if (!missionId || !agentType) {
    console.error('Usage: node lib/mission-spawner.js <mission-id> <agent-type>');
    process.exit(1);
  }
  
  const missionDir = path.join(MISSIONS_DIR, missionId);
  const briefPath = path.join(missionDir, agentType, 'brief.md');
  
  if (!fs.existsSync(briefPath)) {
    console.error(`Brief not found: ${briefPath}`);
    process.exit(1);
  }
  
  const brief = fs.readFileSync(briefPath, 'utf8');
  const agentDir = path.join(missionDir, agentType);
  
  console.log('Mission spawner: ready to delegate to sessions_spawn');
  console.log(`Mission: ${missionId}, Agent: ${agentType}`);
  console.log(`Brief: ${briefPath}`);
  console.log(`Agent dir: ${agentDir}`);
  
  // The actual spawn is handled by the calling context (main session)
  // This script validates and prepares, then exits
  process.exit(0);
}

main();
