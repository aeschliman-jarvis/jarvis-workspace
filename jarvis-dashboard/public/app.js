const els = {
  refresh: document.getElementById('refresh-btn'),
  lastSync: document.getElementById('last-sync'),
  currentFocus: document.getElementById('current-focus'),
  subtitle: document.getElementById('view-subtitle'),
  executionStrip: document.getElementById('execution-strip'),
  chatModePill: document.getElementById('chat-mode-pill'),
  chatLog: document.getElementById('chat-log'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  overlay: document.getElementById('orb-overlay'),
  overlayTitle: document.getElementById('overlay-title'),
  overlaySubtitle: document.getElementById('overlay-subtitle'),
  overlayContent: document.getElementById('overlay-content'),
  closeOverlay: document.getElementById('close-overlay'),
};

let latestState = null;

function setExecution(text) {
  if (els.executionStrip) els.executionStrip.textContent = text;
}

function escapeHtml(text = '') {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderEmpty(container, text) {
  container.innerHTML = `<div class="empty">${escapeHtml(text)}</div>`;
}

function renderChat(messages = []) {
  if (!messages.length) {
    return renderEmpty(els.chatLog, 'No chat yet. Start talking to Jarvis here.');
  }
  els.chatLog.innerHTML = messages.map((msg) => `
    <div class="chat-message ${escapeHtml(msg.role || 'assistant')}">
      <div class="chat-role">${escapeHtml(msg.role || 'assistant')}</div>
      <div>${escapeHtml(msg.text || '')}</div>
    </div>
  `).join('');
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function renderOverlayItems(items, type = 'stack') {
  if (!items || !items.length) {
    return '<div class="empty">Nothing here yet.</div>';
  }

  if (type === 'activity') {
    return items.map((item) => `
      <div class="activity-item">
        <div class="activity-date">${escapeHtml(item.date || '')}</div>
        <div>${escapeHtml(item.text || '')}</div>
      </div>
    `).join('');
  }

  if (type === 'cards') {
    return items.map((item) => {
      if (typeof item === 'string') {
        return `<div class="card-item">${escapeHtml(item)}</div>`;
      }
      return `
        <div class="card-item">
          ${item.status ? `<div class="card-kicker">${escapeHtml(item.status)}</div>` : ''}
          <div>${escapeHtml(item.text || item.title || JSON.stringify(item))}</div>
        </div>
      `;
    }).join('');
  }

  return items.map((item) => `<div class="stack-item">${escapeHtml(item.text || item)}</div>`).join('');
}


async function fetchMissions() {
  try {
    const res = await fetch('/api/missions');
    const data = await res.json();
    return data.missions || [];
  } catch (err) {
    console.error('Failed to fetch missions:', err);
    return [];
  }
}

function renderMissionCard(m) {
  const statusClass = m.status === 'completed' ? 'status-completed' : m.status === 'running' ? 'status-running' : 'status-failed';
  return `
    <div class="card-item mission-card" data-mission="${m.missionId}">
      <div class="mission-card-header">
        <span class="mission-status-badge ${statusClass}">${m.status}</span>
      </div>
      <div class="mission-title">${escapeHtml(m.goal)}</div>
      <div class="mission-meta">🤖 ${escapeHtml(m.agentType)} • 📅 ${new Date(m.createdAt).toLocaleDateString()}</div>
    </div>
  `;
}

function showMissionDetail(missionId) {
  fetch(`/api/missions/${missionId}`)
    .then(r => r.json())
    .then(data => {
      const m = data.mission;
      if (!m) return;
      els.overlayTitle.textContent = 'Mission Detail';
      els.overlaySubtitle.textContent = m.agentType + ' • ' + new Date(m.createdAt).toLocaleString();
      els.overlayContent.innerHTML = `
        <div class="mission-detail-view">
          <div class="mission-status-badge ${m.status === 'completed' ? 'status-completed' : 'status-running'}">${m.status}</div>
          <h3>${escapeHtml(m.goal)}</h3>
          ${m.deliverable ? `<div class="mission-deliverable">${formatMarkdown(m.deliverable)}</div>` : '<div class="empty">Agent still working…</div>'}
        </div>
      `;
    });
}

function formatMarkdown(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/((<li>.+<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function openOverlay(mode) {
  if (!latestState) return;

  const map = {
    projects: {
      title: 'Projects',
      subtitle: 'Strategic threads and active project surfaces',
      html: renderOverlayItems(latestState.strategicThreads, 'cards'),
    },
    workflows: {
      title: 'Workflows',
      subtitle: 'Repeatable systems and operating patterns',
      html: renderOverlayItems([
        ...(latestState.workflows || []).map((w) => ({ title: w, status: 'ready' })),
        { title: 'Use chat to trigger state summaries and operating queries', status: 'available now' },
      ], 'cards'),
    },
    brain: {
      title: 'Second Brain',
      subtitle: 'Ideas, preferences, and decision rules',
      html: [
        '<div class="card-item"><div class="card-kicker">Ideas</div></div>' + renderOverlayItems(latestState.ideas, 'stack'),
        '<div class="card-item"><div class="card-kicker">Preferences + Rules</div></div>' + renderOverlayItems([...(latestState.preferences || []), ...(latestState.decisionRules || [])], 'stack'),
      ].join(''),
    },
    state: {
      title: 'System State',
      subtitle: 'Current status, trust flags, and continuity summary',
      html: [
        renderOverlayItems(latestState.currentStatus, 'stack'),
        renderOverlayItems((latestState.freshnessFlags || []).map((x) => `Trust flag: ${x}`), 'stack'),
        renderOverlayItems(latestState.activeFocusAreas, 'stack'),
        renderOverlayItems(latestState.continuitySummary, 'stack'),
      ].join(''),
    },
    activity: {
      title: 'Activity Feed',
      subtitle: 'Recent memory-backed events',
      html: renderOverlayItems(latestState.recentEvents, 'activity'),
    },
    missions: {
      title: 'Missions',
      subtitle: 'Agent-powered work — research, design, strategy, ops',
      html: '<div id="missions-list"><div class="empty">Loading missions…</div></div>',
    },
    chat: {
      title: 'Chat',
      subtitle: 'Main command center interface',
      html: '<div class="empty">You are already in chat mode.</div>',
    },
  };

  const cfg = map[mode];
  if (!cfg) return;
  els.overlayTitle.textContent = cfg.title;
  els.overlaySubtitle.textContent = cfg.subtitle;
  els.overlayContent.innerHTML = cfg.html;
  els.overlay.classList.add('open');

  document.querySelectorAll('.orb').forEach((orb) => orb.classList.toggle('active', orb.dataset.mode === mode));
}

function closeOverlay() {
  els.overlay.classList.remove('open');
  document.querySelectorAll('.orb').forEach((orb) => orb.classList.toggle('active', orb.dataset.mode === 'chat'));
}

async function loadState() {
  els.lastSync.textContent = 'Refreshing…';
  setExecution('SYNCING STATE…');
  const res = await fetch('/api/state');
  const data = await res.json();
  latestState = data;

  els.currentFocus.textContent = data.currentFocus || 'No current focus found.';
  els.subtitle.textContent = (data.currentStatus && data.currentStatus[0]) || 'Local command center • simple on the surface, deep underneath';
  renderChat(data.chatLog || []);
  if (els.chatModePill) {
    els.chatModePill.textContent = data.freshnessFlags?.length ? 'LIVE STATE • FLAGS' : 'LIVE STATE';
  }

  const ts = new Date(data.generatedAt || Date.now());
  els.lastSync.textContent = `Last sync ${ts.toLocaleString()}`;
  setExecution(data.freshnessFlags?.length ? 'TRUST FLAGS DETECTED' : 'SYNCED');
}



async function sendChat(text) {
  const existing = Array.from(els.chatLog.querySelectorAll('.chat-message')).map((node) => ({
    role: node.classList.contains('user') ? 'user' : 'assistant',
    text: node.textContent.replace(/^user|assistant/i, '').trim(),
  }));

  renderChat([...existing, { role: 'user', text }]);
  setExecution('SENT TO JARVIS…');

  // Send to queue
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  
  if (!data.ok) {
    renderChat([...existing, { role: 'user', text }, { role: 'assistant', text: `Error: ${data.error}` }]);
    setExecution('ERROR');
    return;
  }

  const messageId = data.messageId;
  
  // Poll for reply
  setExecution('WAITING FOR JARVIS…');
  let reply = null;
  let attempts = 0;
  const maxAttempts = 30; // 60 seconds at 2s intervals
  
  while (!reply && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;
    
    const replyRes = await fetch(`/api/chat/reply?messageId=${messageId}`);
    const replyData = await replyRes.json();
    
    if (replyData.reply) {
      reply = replyData.reply.reply || replyData.reply;
    }
    
    setExecution(`WAITING... ${attempts * 2}s`);
  }
  
  if (reply) {
    renderChat([...existing, { role: 'user', text }, { role: 'assistant', text: typeof reply === 'string' ? reply : JSON.stringify(reply) }]);
    setExecution('RECEIVED');
  } else {
    renderChat([...existing, { role: 'user', text }, { role: 'assistant', text: 'Jarvis is processing your message. Check back shortly.' }]);
    setExecution('PENDING');
  }
}

els.refresh.addEventListener('click', () => {
  loadState().catch((err) => {
    console.error(err);
    els.lastSync.textContent = 'Refresh failed';
  });
});

els.chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = els.chatInput.value.trim();
  if (!text) return;
  els.chatInput.value = '';
  els.lastSync.textContent = 'Sending…';
  sendChat(text)
    .then(() => {
      els.lastSync.textContent = `Last sync ${new Date().toLocaleString()}`;
    })
    .catch((err) => {
      console.error(err);
      els.lastSync.textContent = 'Chat send failed';
    });
});

document.querySelectorAll('.orb').forEach((orb) => {
  orb.addEventListener('click', () => openOverlay(orb.dataset.mode));
});

document.querySelectorAll('.prompt-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const prompt = chip.dataset.prompt || '';
    els.chatInput.value = prompt;
    els.chatInput.focus();
  });
});

els.closeOverlay.addEventListener('click', closeOverlay);
els.overlay.addEventListener('click', (event) => {
  if (event.target === els.overlay) closeOverlay();
});

loadState().catch((err) => {
  console.error(err);
  els.lastSync.textContent = 'Initial load failed';
});

// Mission orb special handling — load missions when opened
const origOpenOverlay = openOverlay;
openOverlay = async function(mode) {
  if (mode === 'missions') {
    origOpenOverlay(mode);
    const missions = await fetchMissions();
    const listEl = document.getElementById('missions-list');
    if (listEl && missions.length) {
      listEl.innerHTML = missions.map(m => renderMissionCard(m)).join('');
      // Add click handlers
      listEl.querySelectorAll('.mission-card').forEach(card => {
        card.addEventListener('click', () => showMissionDetail(card.dataset.mission));
      });
    } else if (listEl) {
      listEl.innerHTML = '<div class="empty">No missions yet. Start one via CLI or chat.</div>';
    }
  } else {
    origOpenOverlay(mode);
  }
};
