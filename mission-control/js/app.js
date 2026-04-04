/**
 * Mission Control Dashboard — Client App
 * 
 * Polls the workspace for mission data and renders it.
 * Communicates with the server API for mission creation.
 */

const API_BASE = '/api';
const POLL_INTERVAL = 5000; // 5 seconds

// State
let missions = [];
let selectedMissionId = null;

// DOM elements
const els = {
  missionList: document.getElementById('mission-list'),
  missionDetail: document.getElementById('mission-detail'),
  newMissionBtn: document.getElementById('new-mission-btn'),
  newMissionModal: document.getElementById('new-mission-modal'),
  closeModal: document.getElementById('close-modal'),
  cancelMission: document.getElementById('cancel-mission'),
  newMissionForm: document.getElementById('new-mission-form'),
  missionGoal: document.getElementById('mission-goal'),
  missionAgent: document.getElementById('mission-agent'),
  gwLatency: document.getElementById('gw-latency'),
  agentCount: document.getElementById('agent-count'),
  activeMissions: document.getElementById('active-missions'),
  completedMissions: document.getElementById('completed-missions'),
};

// === INITIALIZATION ===

async function init() {
  await fetchMissions();
  renderMissions();
  updateTelemetry();
  
  // Auto-poll
  setInterval(async () => {
    await fetchMissions();
    renderMissions();
    updateTelemetry();
    if (selectedMissionId) {
      await fetchMissionDetail(selectedMissionId);
    }
  }, POLL_INTERVAL);
  
  // Event listeners
  els.newMissionBtn.addEventListener('click', openModal);
  els.closeModal.addEventListener('click', closeModal);
  els.cancelMission.addEventListener('click', closeModal);
  els.newMissionForm.addEventListener('submit', handleNewMission);
}

// === API CALLS ===

async function fetchMissions() {
  try {
    const res = await fetch(`${API_BASE}/missions`);
    missions = await res.json();
  } catch (err) {
    console.error('Failed to fetch missions:', err);
  }
}

async function fetchMissionDetail(missionId) {
  try {
    const res = await fetch(`${API_BASE}/missions/${missionId}`);
    const data = await res.json();
    renderMissionDetail(data);
  } catch (err) {
    console.error('Failed to fetch mission detail:', err);
  }
}

async function createMission(goal, agentType) {
  try {
    const res = await fetch(`${API_BASE}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, agentType }),
    });
    const data = await res.json();
    closeModal();
    await fetchMissions();
    renderMissions();
    selectMission(data.missionId);
  } catch (err) {
    alert('Failed to create mission: ' + err.message);
  }
}

// === RENDERING ===

function renderMissions() {
  if (!missions.length) {
    els.missionList.innerHTML = '<div class="loading">No missions yet. Start one!</div>';
    return;
  }
  
  els.missionList.innerHTML = missions.map(m => `
    <div class="mission-card ${m.status === 'completed' ? 'completed' : ''} ${m.missionId === selectedMissionId ? 'active' : ''}" 
         data-mission-id="${m.missionId}"
         onclick="selectMission('${m.missionId}')">
      <div class="mission-card-header">
        <div class="mission-card-title">${escapeHtml(m.goal)}</div>
        <span class="mission-card-status status-${m.status}">${m.status}</span>
      </div>
      <div class="mission-card-meta">
        <span>🤖 ${m.agentType}</span>
        <span>🕐 ${formatTime(m.createdAt)}</span>
        ${m.status === 'completed' ? `<span>✅ Done</span>` : ''}
      </div>
    </div>
  `).join('');
}

function renderMissionDetail(data) {
  if (!data) return;
  
  els.missionDetail.innerHTML = `
    <div class="detail-header">
      <h2 class="detail-title">${escapeHtml(data.goal)}</h2>
      <div class="detail-meta">
        <span>🤖 ${data.agentType}</span>
        <span>📅 ${formatDate(data.createdAt)}</span>
        <span class="mission-card-status status-${data.status}" style="display: inline-block;">${data.status}</span>
      </div>
    </div>
    <div class="detail-body">
      ${data.deliverable ? renderMarkdown(data.deliverable) : '<p class="loading">Waiting for agent to complete work…</p>'}
    </div>
  `;
}

function updateTelemetry() {
  const active = missions.filter(m => m.status !== 'completed').length;
  const completed = missions.filter(m => m.status === 'completed').length;
  
  els.agentCount.textContent = '7'; // Fixed agent count
  els.activeMissions.textContent = active;
  els.completedMissions.textContent = completed;
  els.gwLatency.textContent = '12ms'; // TODO: real gateway ping
}

// === INTERACTIONS ===

function selectMission(missionId) {
  selectedMissionId = missionId;
  renderMissions(); // Re-render to update active state
  fetchMissionDetail(missionId);
}

function openModal() {
  els.newMissionModal.classList.remove('hidden');
  els.missionGoal.focus();
}

function closeModal() {
  els.newMissionModal.classList.add('hidden');
  els.newMissionForm.reset();
}

async function handleNewMission(e) {
  e.preventDefault();
  const goal = els.missionGoal.value.trim();
  const agentType = els.missionAgent.value;
  
  if (!goal) return;
  
  await createMission(goal, agentType);
}

// === UTILITIES ===

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Simple markdown renderer (handles headings, bold, lists, code blocks)
function renderMarkdown(md) {
  if (!md) return '';
  
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((<li>.+<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

// === START ===
init();
