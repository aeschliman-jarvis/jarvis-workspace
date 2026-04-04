/**
 * Server Wrapper — starts the API server and exports it
 * Used by both standalone mode and Electron
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const WORKSPACE = path.resolve(__dirname, '..');
const MISSIONS_DIR = path.join(WORKSPACE, 'missions');
const PORT = Number(process.env.PORT || 3001);

fs.mkdirSync(MISSIONS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
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
    
    let goal = missionId, agentType = 'unknown', status = 'unknown', createdAt = null, deliverable = null;
    
    if (fs.existsSync(logPath)) {
      const log = fs.readFileSync(logPath, 'utf8');
      const goalMatch = log.match(/\*\*Goal:\*\* (.+)/);
      const agentMatch = log.match(/\*\*Agent:\*\* (.+)/);
      const createdMatch = log.match(/\*\*Started:\*\* (.+)/);
      const completeMatch = log.match(/MISSION COMPLETE/);
      if (goalMatch) goal = goalMatch[1];
      if (agentMatch) agentType = agentMatch[1].toLowerCase().trim();
      if (createdMatch) createdAt = createdMatch[1];
      status = completeMatch ? 'completed' : 'running';
    }
    
    if (status === 'completed' && fs.existsSync(finalPath)) {
      deliverable = fs.readFileSync(finalPath, 'utf8');
    }
    
    missions.push({ missionId, goal, agentType, status, createdAt: createdAt || new Date().toISOString(), deliverable });
  }
  
  missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return missions;
}

function getMission(missionId) {
  return getMissions().find(m => m.missionId === missionId) || null;
}

async function createMission(goal, agentType) {
  const missionId = `${goal.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}-${Date.now().toString(36)}`;
  const missionDir = path.join(MISSIONS_DIR, missionId);
  const agentDir = path.join(missionDir, agentType || 'generalist');
  fs.mkdirSync(agentDir, { recursive: true });
  
  const logPath = path.join(missionDir, 'log.md');
  const ts = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  fs.writeFileSync(logPath, `# Mission Log: ${missionId}\n\n**Goal:** ${goal}\n**Agent:** ${agentType}\n**Started:** ${ts}\n\n---\n\n`);
  
  // Write brief
  const brief = `# Mission\n\n## Goal\n${goal}\n\n## Agent: ${agentType}\n\nWrite deliverable to: deliverable.md`;
  fs.writeFileSync(path.join(agentDir, 'brief.md'), brief);
  
  // Update TASKS.md
  const tasksFile = path.join(WORKSPACE, 'TASKS.md');
  let tasks = '';
  try { tasks = fs.readFileSync(tasksFile, 'utf8'); } catch(e) {}
  fs.writeFileSync(tasksFile, `- [${ts}] **🚀 MISSION STARTED:** [\`${missionId}\`] ${goal}\n  → Agent: ${agentType}\n` + tasks);
  
  return { missionId, goal, agentType, status: 'running', createdAt: new Date().toISOString() };
}

// === HTTP SERVER ===

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    if (pathname === '/api/missions' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(getMissions()));
      return;
    }
    
    const missionMatch = pathname.match(/^\/api\/missions\/([^\/]+)$/);
    if (missionMatch && req.method === 'GET') {
      const mission = getMission(missionMatch[1]);
      if (!mission) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
      res.writeHead(200);
      res.end(JSON.stringify(mission));
      return;
    }
    
    if (pathname === '/api/missions' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const { goal, agentType } = JSON.parse(body);
      if (!goal) { res.writeHead(400); res.end(JSON.stringify({ error: 'Goal required' })); return; }
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
    return;
  }
  
  // Static files
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Auto-start only if run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n🎯 Mission Control Dashboard\n   → http://localhost:${PORT}\n   → API: http://localhost:${PORT}/api/missions\n`);
  });
  process.on('SIGINT', () => { console.log('\n👋 Shutting down...'); server.close(() => process.exit(0)); });
}

module.exports = { server, PORT, createMission, getMissions, getMission };
