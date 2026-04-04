#!/usr/bin/env node
/**
 * Mission Control Server
 * 
 * Serves the Mission Control dashboard and provides API endpoints
 * for mission management.
 * 
 * Usage: node server.js [--port 3001]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WORKSPACE = path.resolve(__dirname, '..');
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');
const PORT = Number(process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 3001);
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure missions dir exists
fs.mkdirSync(MISSIONS_DIR, { recursive: true });

// === MIME TYPES ===
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// === MISSION HELPERS ===

function getMissions() {
  if (!fs.existsSync(MISSIONS_DIR)) return [];
  
  const entries = fs.readdirSync(MISSIONS_DIR, { withFileTypes: true });
  const missions = [];
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const missionId = entry.name;
    const missionDir = path.join(MISSIONS_DIR, missionId);
    const logPath = path.join(missionDir, 'log.md');
    const finalPath = path.join(missionDir, 'final.md');
    
    let goal = missionId;
    let agentType = 'unknown';
    let status = 'unknown';
    let createdAt = null;
    let deliverable = null;
    
    // Parse log for metadata
    if (fs.existsSync(logPath)) {
      const log = fs.readFileSync(logPath, 'utf8');
      const goalMatch = log.match(/\*\*Goal:\*\* (.+)/);
      const agentMatch = log.match(/\*\*Agent:\*\* (.+)/);
      const createdMatch = log.match(/\*\*Started:\*\* (.+)/);
      const completeMatch = log.match(/MISSION COMPLETE/);
      
      if (goalMatch) goal = goalMatch[1];
      if (agentMatch) agentType = agentMatch[1].toLowerCase();
      if (createdMatch) createdAt = createdMatch[1];
      status = completeMatch ? 'completed' : 'running';
    }
    
    // Load deliverable if complete
    if (status === 'completed' && fs.existsSync(finalPath)) {
      deliverable = fs.readFileSync(finalPath, 'utf8');
    }
    
    missions.push({
      missionId,
      goal,
      agentType,
      status,
      createdAt: createdAt || new Date().toISOString(),
      deliverable,
    });
  }
  
  // Sort by creation date (newest first)
  missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return missions;
}

function getMission(missionId) {
  const missions = getMissions();
  return missions.find(m => m.missionId === missionId) || null;
}

function createMission(goal, agentType) {
  return new Promise((resolve, reject) => {
    const runner = path.join(WORKSPACE, 'lib', 'mission-runner.js');
    
    if (!fs.existsSync(runner)) {
      return reject(new Error('Mission runner not found'));
    }
    
    const proc = spawn('node', [runner, goal, '--agent', agentType], {
      cwd: WORKSPACE,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    let output = '';
    let missionId = null;
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
      const match = data.toString().match(/Mission: (mission-\S+)/);
      if (match) missionId = match[1];
    });
    
    proc.stderr.on('data', (data) => {
      console.error('[mission spawn error]', data.toString());
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Mission init failed with code ${code}`));
      }
      
      // Re-parse output to find mission ID
      const idMatch = output.match(/Mission: (.*)\n/);
      if (idMatch) {
        missionId = idMatch[1].trim();
      }
      
      if (!missionId) {
        return reject(new Error('Could not determine mission ID'));
      }
      
      // Now spawn the subagent
      spawnSubagent(missionId, goal, agentType)
        .then(() => resolve({ missionId, goal, agentType }))
        .catch(reject);
    });
  });
}

function spawnSubagent(missionId, goal, agentType) {
  return new Promise((resolve, reject) => {
    const agentDir = path.join(MISSIONS_DIR, missionId, agentType);
    const briefPath = path.join(agentDir, 'brief.md');
    
    if (!fs.existsSync(briefPath)) {
      return reject(new Error('Brief not found — mission may not have initialized'));
    }
    
    const brief = fs.readFileSync(briefPath, 'utf8');
    
    // Spawn via openclaw sessions_spawn
    // We'll write a temp script that does this
    const spawnScript = path.join(WORKSPACE, 'mission-control', 'data', `spawn-${missionId}.js`);
    const spawnCode = `
const { sessions_spawn } = require('openclaw');
const fs = require('fs');

(async () => {
  try {
    const brief = fs.readFileSync('${briefPath}', 'utf8');
    console.log('Spawning subagent for mission: ${missionId}');
    // Note: sessions_spawn is only available in OpenClaw session context
    // For now, we log that the user needs to manually spawn
    console.log('SUBAGENT_SPAWN_REQUIRED');
    console.log('Mission ID: ${missionId}');
    console.log('Brief: ' + brief.substring(0, 200));
    process.exit(0);
  } catch (err) {
    console.error('Spawn failed:', err.message);
    process.exit(1);
  }
})();
`;
    
    fs.writeFileSync(spawnScript, spawnCode);
    
    // For now, auto-spawn isn't fully working from outside OpenClaw context
    // The dashboard will show the mission as "running" and the user can
    // manually trigger agent work via the CLI
    
    // Alternative: write a todo to TASKS.md reminding the user to spawn
    const tasksFile = path.join(WORKSPACE, 'TASKS.md');
    let tasks = '';
    try { tasks = fs.readFileSync(tasksFile, 'utf8'); } catch(e) {}
    const reminder = `- [ ] **Spawn agent for mission ${missionId}:** \`${agentType}\` agent — goal: "${goal}"\n`;
    fs.writeFileSync(tasksFile, reminder + tasks);
    
    resolve();
  });
}

// === HTTP SERVER ===

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // API routes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // GET /api/missions
      if (pathname === '/api/missions' && req.method === 'GET') {
        const missions = getMissions();
        res.writeHead(200);
        res.end(JSON.stringify(missions));
        return;
      }
      
      // GET /api/missions/:id
      const missionMatch = pathname.match(/^\/api\/missions\/([^\/]+)$/);
      if (missionMatch && req.method === 'GET') {
        const mission = getMission(missionMatch[1]);
        if (!mission) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Mission not found' }));
          return;
        }
        res.writeHead(200);
        res.end(JSON.stringify(mission));
        return;
      }
      
      // POST /api/missions
      if (pathname === '/api/missions' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        
        const { goal, agentType } = JSON.parse(body);
        
        if (!goal) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Goal is required' }));
          return;
        }
        
        try {
          const result = await createMission(goal, agentType || 'generalist');
          res.writeHead(201);
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }
  
  // Static file serving
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  
  // Handle path traversal
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🎯 Mission Control Dashboard`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → Missions: ${MISSIONS_DIR}`);
  console.log(`   → API: http://localhost:${PORT}/api/missions\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Mission Control...');
  server.close(() => process.exit(0));
});

// Export for Electron
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { server, PORT };
}
