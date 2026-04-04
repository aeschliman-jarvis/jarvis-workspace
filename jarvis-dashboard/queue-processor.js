#!/usr/bin/env node
/**
 * Queue Processor — Dashboard ↔ Jarvis file-based bridge
 * 
 * 1. Reads pending messages from chat-queue.json inbox
 * 2. Appends them to INBOX.md (which Jarvis monitors)
 * 3. Reads OUTBOX.md for Jarvis's replies
 * 4. Writes replies to chat-queue.json outbox
 * 5. Clears processed entries
 */

const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = __dirname;
const QUEUE_FILE = path.join(DASHBOARD_DIR, 'data', 'chat-queue.json');
const INBOX_FILE = path.join(DASHBOARD_DIR, 'INBOX.md');
const OUTBOX_FILE = path.join(DASHBOARD_DIR, 'OUTBOX.md');
const POLL_INTERVAL = 3000;

function readQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')); }
  catch (e) { return { inbox: [], outbox: [], lastPoll: null }; }
}

function writeQueue(q) { fs.writeFileSync(QUEUE_FILE, JSON.stringify(q, null, 2)); }

function appendToInbox(msg) {
  const entry = `\n### [${new Date().toISOString()}] Message ${msg.id}\n${msg.text}\n`;
  fs.appendFileSync(INBOX_FILE, entry);
}

function readOutbox() {
  try { return fs.readFileSync(OUTBOX_FILE, 'utf8'); }
  catch (e) { return ''; }
}

function clearOutbox() {
  fs.writeFileSync(OUTBOX_FILE, '# Dashboard Outbox\n\nReplies from Jarvis.\n\n---\n\n');
}

let lastOutboxSize = 0;

function checkForReplies(queue) {
  const content = readOutbox();
  if (content.length > lastOutboxSize && content.includes('### Reply')) {
    // New reply detected
    const replyMatch = content.match(/### Reply to ([^\n]+)\n([\s\S]*?)(?=\n###|$)/);
    if (replyMatch) {
      const [, msgId, reply] = replyMatch;
      queue.outbox.push({
        requestId: msgId,
        reply: reply.trim(),
        timestamp: new Date().toISOString(),
      });
      console.log(`[${new Date().toLocaleTimeString()}] Reply captured for ${msgId}`);
    }
    lastOutboxSize = content.length;
  }
}

function processInbox() {
  const queue = readQueue();
  const pending = queue.inbox.filter(m => m.status === 'pending');
  
  if (!pending.length) return;
  
  console.log(`[${new Date().toLocaleTimeString()}] Processing ${pending.length} message(s)...`);
  
  for (const msg of pending) {
    appendToInbox(msg);
    msg.status = 'sent';
    msg.sentAt = new Date().toISOString();
    console.log(`  → Inbox: "${msg.text.substring(0, 50)}..."`);
  }
  
  writeQueue(queue);
}

// Main loop
console.log('Queue processor started');
console.log(`Watching: ${INBOX_FILE} → ${OUTBOX_FILE}`);
console.log(`Polling every ${POLL_INTERVAL}ms\n`);

setInterval(() => {
  processInbox();
  checkForReplies(readQueue());
  writeQueue(readQueue());
}, POLL_INTERVAL);

processInbox();
