/**
 * Session Bridge — File-based message queue between dashboard and main session
 * 
 * Dashboard writes messages to chat-queue.json inbox
 * Main session (Jarvis) reads inbox, processes, writes to outbox
 * Dashboard polls outbox for replies
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'chat-queue.json');

function ensureQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify({ inbox: [], outbox: [], lastPoll: null }, null, 2));
  }
}

function readQueue() {
  ensureQueue();
  try {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  } catch (e) {
    return { inbox: [], outbox: [], lastPoll: null };
  }
}

function writeQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Send a message from dashboard to main session (write to inbox)
 */
function sendMessage(text) {
  const queue = readQueue();
  const messageId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  
  queue.inbox.push({
    id: messageId,
    text,
    timestamp: new Date().toISOString(),
    status: 'pending',
  });
  
  writeQueue(queue);
  return messageId;
}

/**
 * Get pending messages from inbox (for main session to read)
 */
function getPendingMessages() {
  const queue = readQueue();
  return queue.inbox.filter(m => m.status === 'pending');
}

/**
 * Mark a message as processed
 */
function markProcessed(messageId, reply) {
  const queue = readQueue();
  
  // Mark inbox message as processed
  const msg = queue.inbox.find(m => m.id === messageId);
  if (msg) msg.status = 'processed';
  
  // Add reply to outbox
  queue.outbox.push({
    requestId: messageId,
    reply,
    timestamp: new Date().toISOString(),
  });
  
  // Keep outbox manageable
  if (queue.outbox.length > 50) queue.outbox = queue.outbox.slice(-50);
  
  // Keep inbox manageable
  if (queue.inbox.length > 100) queue.inbox = queue.inbox.slice(-100);
  
  writeQueue(queue);
}

/**
 * Get replies from outbox (for dashboard to read)
 */
function getReplies(sinceTimestamp) {
  const queue = readQueue();
  if (!sinceTimestamp) return queue.outbox;
  return queue.outbox.filter(m => m.timestamp > sinceTimestamp);
}

/**
 * Get latest reply for a specific request
 */
function getReplyForRequest(messageId) {
  const queue = readQueue();
  return queue.outbox.find(m => m.requestId === messageId);
}

module.exports = {
  sendMessage,
  getPendingMessages,
  markProcessed,
  getReplies,
  getReplyForRequest,
  readQueue,
  writeQueue,
};
