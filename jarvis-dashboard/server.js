const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec: execCallback } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const exec = promisify(execCallback);

const WORKSPACE = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const CHAT_LOG = path.join(DATA_DIR, 'chat-log.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==================== Task Tracker ====================

function loadTasks() {
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function createTask(description, type = 'command') {
  const tasks = loadTasks();
  const task = {
    id: uuidv4(),
    description,
    type,
    status: 'running',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    result: null,
    error: null,
    agentSessionKey: null,
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

function updateTask(taskId, updates) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    Object.assign(task, updates, { updated: new Date().toISOString() });
    saveTasks(tasks);
  }
  return task;
}

function getTask(taskId) {
  return loadTasks().find((t) => t.id === taskId);
}

function getRunningTasks() {
  return loadTasks().filter((t) => t.status === 'running');
}

// ==================== File State Readers ====================

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function parseBullets(sectionText) {
  return sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.startsWith('- ') || line.match(/^\d+\.\s/))
    .map((line) => line.replace(/^(-|\d+\.)\s/, '').trim());
}

function parseTasks(md) {
  const lines = md.split('\n');
  const sections = {};
  let current = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      current = h2[1].trim();
      sections[current] = [];
      continue;
    }
    if (!current) continue;
    const task = line.match(/^- \[( |x)\]\s+(.*)$/);
    if (task) {
      sections[current].push({ done: task[1] === 'x', text: task[2].trim() });
    }
  }

  return sections;
}

function parseTitledSection(md, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = md.match(re);
  return match ? match[1].trim() : '';
}

function extractList(md, title) {
  return parseBullets(parseTitledSection(md, title));
}

function readDailyMemoryFiles() {
  const dir = path.join(WORKSPACE, 'memory');
  try {
    return fs.readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 7)
      .map((name) => ({ name, content: readText(path.join(dir, name)) }));
  } catch {
    return [];
  }
}

function summarizeRecentEvents(files) {
  const events = [];
  for (const file of files) {
    const lines = file.content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- '))
      .slice(0, 12)
      .map((line) => line.replace(/^-\s*/, '').trim());
    for (const line of lines) events.push({ date: file.name.replace('.md', ''), text: line });
  }
  return events.slice(0, 12);
}

function readChatLog() {
  try {
    return JSON.parse(fs.readFileSync(CHAT_LOG, 'utf8'));
  } catch {
    return [];
  }
}

function writeChatLog(messages) {
  fs.writeFileSync(CHAT_LOG, JSON.stringify(messages, null, 2));
}

// ==================== Command Router ====================

function detectCommandIntent(text) {
  const lower = text.toLowerCase();
  
  // Action commands
  if (lower.startsWith('run ') || lower.startsWith('execute ') || lower.startsWith('do ')) {
    return { type: 'exec', command: text.replace(/^(run|execute|do)\s+/i, '').trim() };
  }
  
  // Agent spawn commands
  if (lower.includes('research') || lower.includes('plan') || lower.includes('design') || 
      lower.includes('build') || lower.includes('create') || lower.includes('start') ||
      lower.includes('launch') || lower.includes('set up') || lower.includes('setup')) {
    return { type: 'agent', task: text };
  }
  
  // Task management
  if (lower.includes('add task') || lower.includes('create task')) {
    return { type: 'add_task', description: text.replace(/^(add|create)\s+(a\s+)?task/i, '').trim() };
  }
  
  // File operations
  if (lower.includes('write file') || lower.includes('create file') || lower.includes('save ')) {
    return { type: 'write_file', text: text };
  }
  
  // State queries (default)
  return { type: 'query', text };
}

async function executeCommand(command) {
  try {
    const { stdout, stderr } = await exec(command, { 
      cwd: WORKSPACE,
      timeout: 30000 
    });
    return { 
      success: true, 
      output: stdout, 
      error: stderr
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

async function spawnAgent(task) {
  try {
    const { stdout } = await exec(
      `openclaw sessions spawn --task "${task.replace(/"/g, '\\"')}" --mode run --timeout 1800`,
      { cwd: WORKSPACE, timeout: 10000 }
    );
    return { success: true, output: stdout };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function addTask(description) {
  const tasksPath = path.join(WORKSPACE, 'TASKS.md');
  let content = readText(tasksPath);
  
  // Add to Next section
  const nextSection = content.match(/## Next\n([\s\S]*?)(?=\n## |$)/);
  if (nextSection) {
    const insertPoint = nextSection.index + nextSection[0].indexOf('\n') + 1;
    const newContent = 
      content.slice(0, insertPoint) + 
      `- [ ] ${description}\n` + 
      content.slice(insertPoint);
    fs.writeFileSync(tasksPath, newContent);
    return { success: true };
  }
  return { success: false, error: 'Could not find Next section in TASKS.md' };
}

// ==================== Chat Handler ====================

async function processChatCommand(text) {
  const intent = detectCommandIntent(text);
  
  switch (intent.type) {
    case 'exec': {
      const task = createTask(`Execute: ${intent.command}`, 'exec');
      const result = await executeCommand(intent.command);
      updateTask(task.id, {
        status: result.success ? 'completed' : 'failed',
        result: result.output,
        error: result.error
      });
      return result.success 
        ? `Command executed successfully:\n${result.output}`
        : `Command failed: ${result.error}`;
    }
    
    case 'agent': {
      const task = createTask(`Agent: ${intent.task}`, 'agent');
      const result = await spawnAgent(intent.task);
      updateTask(task.id, {
        status: result.success ? 'running' : 'failed',
        error: result.error
      });
      return result.success
        ? `Agent spawned for: ${intent.task}\nTask ID: ${task.id}\nThis is a long-running task. Check status with "status task ${task.id}"`
        : `Failed to spawn agent: ${result.error}`;
    }
    
    case 'add_task': {
      const result = addTask(intent.description);
      return result.success
        ? `Task added: ${intent.description}`
        : `Failed to add task: ${result.error}`;
    }
    
    case 'query':
    default:
      return liveReplyFromState(text);
  }
}

function liveReplyFromState(text) {
  const state = buildState();
  const lower = text.toLowerCase();
  const flags = computeFreshnessFlags(state);

  if (/^(hi|hello|hey|yo)\b/.test(lower)) {
    return `I'm here. Current focus: ${state.currentFocus || 'not set'}. I can execute commands, spawn agents, manage tasks, and answer state queries.`;
  }

  if (lower.includes('current focus') || lower === 'focus' || lower.includes('what matters right now')) {
    return `Current focus: ${state.currentFocus || 'unknown'}.`;
  }

  if (lower.includes('top next') || lower.includes('next tasks') || lower.includes('what should i do next')) {
    const next = (state.tasks.next || []).slice(0, 5).map((t) => `• ${t.text}`).join('\n');
    return next ? `Top next items:\n${next}` : 'No next tasks listed.';
  }

  if (lower.includes('waiting on') || lower.includes('waiting items')) {
    const waiting = (state.tasks.waiting || []).slice(0, 5).map((t) => `• ${t.text}`).join('\n');
    return waiting ? `Waiting items:\n${waiting}` : 'No waiting items.';
  }

  if (lower.includes('what changed today') || lower.includes('changed today') || lower.includes('recent activity')) {
    const events = (state.recentEvents || []).slice(0, 6).map((e) => `• ${e.date}: ${e.text}`).join('\n');
    return events ? `Recent changes:\n${events}` : 'No recent events.';
  }

  if (lower.includes('status') || lower.includes('summarize my state')) {
    const summary = renderStatusSummary(state);
    if (flags.length) {
      return `${summary}\nTrust flags: ${flags.slice(0, 3).join(' | ')}`;
    }
    return summary;
  }

  if (lower.includes('task status') || lower.includes('running tasks')) {
    const running = getRunningTasks();
    if (running.length === 0) return 'No running tasks.';
    return running.map(t => `• ${t.description} (ID: ${t.id.slice(0,8)})`).join('\n');
  }

  if (lower.includes('help')) {
    return `Commands:\n• "run <shell command>" — Execute shell commands\n• "research/design/build <task>" — Spawn an agent\n• "add task <description>" — Add to TASKS.md\n• "status" — Current state\n• "next tasks" — Priority items`;
  }

  if (flags.length) {
    return `${liveReplyFromState('status')}`;
  }

  return `I can answer state queries or execute commands. Try:\n• "run ls -la"\n• "research <topic>"\n• "next tasks"\n• "status"`;
}

function renderStatusSummary(state) {
  const next = (state.tasks.next || []).slice(0, 3).map((t) => t.text).join(' | ') || 'none listed';
  const waiting = (state.tasks.waiting || []).slice(0, 2).map((t) => t.text).join(' | ') || 'none listed';
  const scheduled = (state.tasks.scheduled || []).slice(0, 2).map((t) => t.text).join(' | ') || 'none listed';
  return `Focus: ${state.currentFocus || 'unknown'}.\nNext: ${next}.\nWaiting: ${waiting}.\nScheduled: ${scheduled}.`;
}

function computeFreshnessFlags(state) {
  const flags = [];
  const waitingTexts = (state.tasks?.waiting || []).map((t) => t.text || '');
  const recentTexts = (state.recentEvents || []).map((e) => e.text || '');

  if (waitingTexts.some((t) => /google gmail\/drive api setup awaits final oauth token authorization/i.test(t)) &&
      recentTexts.some((t) => /gmail api and drive api calls succeeded|google oauth was completed successfully/i.test(t))) {
    flags.push('Google status conflict: tasks say OAuth pending, memory says Gmail/Drive live.');
  }

  if ((state.tasks?.scheduled || []).some((t) => t.text.match(/11:00 AM today/i))) {
    flags.push('Scheduled tasks reference "11:00 AM today" — likely stale/overdue.');
  }

  return flags;
}

function buildState() {
  const currentMd = readText(path.join(WORKSPACE, 'CURRENT.md'));
  const tasksMd = readText(path.join(WORKSPACE, 'TASKS.md'));
  const memoryMd = readText(path.join(WORKSPACE, 'MEMORY.md'));
  const continuityMd = readText(path.join(WORKSPACE, 'CONTINUITY.md'));
  const taskSections = parseTasks(tasksMd);
  const dailyFiles = readDailyMemoryFiles();

  const currentFocus = parseTitledSection(currentMd, 'Current focus').replace(/\n+/g, ' ').trim();
  const todaysPriorities = extractList(currentMd, "Today's priorities");
  const currentStatus = extractList(currentMd, 'Current status');
  const nextRecommended = extractList(currentMd, 'Next recommended actions');
  const openQuestions = extractList(currentMd, 'Open questions / approvals needed');
  const workingRules = extractList(currentMd, 'Working rules');

  const activeFocusAreas = extractList(memoryMd, 'Active Focus Areas');
  const preferences = extractList(memoryMd, 'Preferences and Working Style');
  const decisionRules = extractList(memoryMd, 'Decision Rules');
  const systemsStatus = extractList(memoryMd, 'Current Systems and Status');
  const strategicThreads = extractList(memoryMd, 'Open Strategic Threads');

  const tasks = {
    inbox: taskSections['Inbox'] || [],
    next: taskSections['Next'] || [],
    waiting: taskSections['Waiting'] || [],
    scheduled: taskSections['Scheduled'] || [],
    done: taskSections['Done'] || [],
    someday: taskSections['Someday'] || [],
  };

  const ideaTexts = [
    ...tasks.inbox.map((t) => t.text),
    ...openQuestions,
    ...strategicThreads,
  ];

  const dashboardStats = {
    nextCount: tasks.next.length,
    waitingCount: tasks.waiting.length,
    scheduledCount: tasks.scheduled.length,
    doneCount: tasks.done.length,
    ideasCount: ideaTexts.length,
    recentEventsCount: summarizeRecentEvents(dailyFiles).length,
    runningTasksCount: getRunningTasks().length,
  };

  const freshnessFlags = computeFreshnessFlags({
    tasks,
    recentEvents: summarizeRecentEvents(dailyFiles),
    currentFocus,
  });

  return {
    chatLog: readChatLog(),
    generatedAt: new Date().toISOString(),
    currentFocus,
    todaysPriorities,
    currentStatus,
    nextRecommended,
    openQuestions,
    workingRules,
    activeFocusAreas,
    preferences,
    decisionRules,
    systemsStatus,
    strategicThreads,
    tasks,
    ideas: ideaTexts,
    recentEvents: summarizeRecentEvents(dailyFiles),
    dashboardStats,
    continuitySummary: parseBullets(continuityMd).slice(0, 10),
    freshnessFlags,
    runningTasks: getRunningTasks().map(t => ({ id: t.id, description: t.description, created: t.created })),
  };
}

// ==================== HTTP Server ====================

function sendJson(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const typeMap = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };
    res.writeHead(200, { 'Content-Type': typeMap[ext] || 'text/plain; charset=utf-8' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // API: Get full state
  if (url.pathname === '/api/state') {
    return sendJson(res, buildState());
  }

  // API: Get tasks
  if (url.pathname === '/api/tasks') {
    return sendJson(res, { tasks: loadTasks() });
  }

  // API: Get task status
  if (url.pathname.match(/^\/api\/task\/[\w-]+$/)) {
    const taskId = url.pathname.split('/').pop();
    const task = getTask(taskId);
    return sendJson(res, { task: task || null });
  }



  // ==================== MISSION API ROUTES ====================
  
  const MISSIONS_DIR = path.join(WORKSPACE, 'missions');
  
  function getMissionsList() {
    if (!fs.existsSync(MISSIONS_DIR)) return [];
    const entries = fs.readdirSync(MISSIONS_DIR, { withFileTypes: true });
    const missions = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const missionId = entry.name;
      const logPath = path.join(MISSIONS_DIR, missionId, 'log.md');
      const finalPath = path.join(MISSIONS_DIR, missionId, 'final.md');
      let goal = missionId, agentType = 'unknown', status = 'unknown', createdAt = null, deliverable = null;
      if (fs.existsSync(logPath)) {
        const log = fs.readFileSync(logPath, 'utf8');
        const g = log.match(/\*\*Goal:\*\* (.+)/);
        const a = log.match(/\*\*Agent:\*\* (.+)/);
        const c = log.match(/\*\*Started:\*\* (.+)/);
        const done = log.match(/MISSION COMPLETE/);
        if (g) goal = g[1];
        if (a) agentType = a[1].toLowerCase().trim();
        if (c) createdAt = c[1];
        status = done ? 'completed' : 'running';
      }
      if (status === 'completed' && fs.existsSync(finalPath)) {
        deliverable = fs.readFileSync(finalPath, 'utf8');
      }
      missions.push({ missionId, goal, agentType, status, createdAt: createdAt || new Date().toISOString(), deliverable });
    }
    missions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return missions;
  }

  // API: List missions
  if (url.pathname === '/api/missions' && req.method === 'GET') {
    return sendJson(res, { missions: getMissionsList() });
  }

  // API: Get single mission
  if (url.pathname.match(/^\/api\/missions\/[\w-]+$/) && req.method === 'GET') {
    const missionId = url.pathname.split('/').pop();
    const missions = getMissionsList();
    const mission = missions.find(m => m.missionId === missionId);
    return sendJson(res, { mission: mission || null });
  }


  // API: Chat - Send message to Jarvis (queue-based)
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = String(payload.text || '').trim();
        if (!text) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Missing text' })); }
        const bridge = require('./session-bridge.js');
        const messageId = bridge.sendMessage(text);
        return sendJson(res, { ok: true, messageId, reply: 'Sent to Jarvis. Awaiting reply...' });
      } catch (err) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: err.message })); }
    });
    return;
  }

  // API: Chat Reply Poll
  if (url.pathname === '/api/chat/reply' && req.method === 'GET') {
    const bridge = require('./session-bridge.js');
    const messageId = url.search ? new URLSearchParams(url.search).get('messageId') : null;
    if (messageId) {
      const reply = bridge.getReplyForRequest(messageId);
      return sendJson(res, { reply: reply || null, pending: !reply });
    }
    return sendJson(res, { replies: bridge.getReplies() });
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(requested).replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Jarvis Dashboard running at http://127.0.0.1:${PORT}`);
});
