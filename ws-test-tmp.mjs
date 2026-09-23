import { io } from 'socket.io-client';
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const env = dotenv.parse(fs.readFileSync(path.resolve('.env.local')));
const pool = new Client({ connectionString: env.DATABASE_URL });
await pool.connect();

const WS_URL = 'http://localhost:3001';
const PHONE = 'TESTPHONE';
const SID = 'session-TESTPHONE';

await pool.query(`CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY, user_name TEXT, user_phone TEXT, user_email TEXT,
  status TEXT, last_message_at TIMESTAMPTZ DEFAULT NOW())`);
await pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY, session_id TEXT, sender TEXT, text TEXT,
  status TEXT DEFAULT 'SENT', created_at TIMESTAMPTZ DEFAULT NOW())`);
await pool.query(`DELETE FROM chat_messages WHERE session_id = $1`, [SID]);
await pool.query(`DELETE FROM chat_sessions WHERE id = $1`, [SID]);

const results = [];
function log(name, ok, extra = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
}

const flags = { userSession: false, userEcho: false, adminGotMsg: false, adminEcho: false, userGotReply: false };
let admin = null;
let finishing = false;
let adminConnected = false;

const user = io(WS_URL, { transports: ['polling', 'websocket'] });

function checkDone() {
  if (flags.userEcho && flags.adminGotMsg && flags.adminEcho && flags.userGotReply) finish(0);
}

function finish(code) {
  if (finishing) return;
  finishing = true;
  clearTimeout(timeoutId);
  user.disconnect();
  if (admin) admin.disconnect();
  pool
    .query(`DELETE FROM chat_messages WHERE session_id = $1`, [SID])
    .then(() => pool.query(`DELETE FROM chat_sessions WHERE id = $1`, [SID]))
    .then(() => pool.end())
    .then(() => {
      const fails = results.filter((r) => !r.ok).length;
      console.log(`\n=== ${results.length - fails}/${results.length} checks passed ===`);
      process.exit(code);
    })
    .catch((e) => { console.error('cleanup error:', e); process.exit(1); });
}

const timeoutId = setTimeout(() => {
  log('TIMEOUT', false, 'flow did not complete in 15s');
  flags.userEcho = true; flags.adminGotMsg = true; flags.adminEcho = true; flags.userGotReply = true;
  finish(1);
}, 15000);

user.on('connect', () => {
  user.emit('user-connect', { phone: PHONE, name: 'Tester', email: 'tester@test.com' });
});
user.on('connect_error', (e) => log('user connect_error', false, e.message));

user.on('session-data', (d) => {
  flags.userSession = true;
  log('user-connect -> session-data (session returned)', d.sessionId === SID && Array.isArray(d.messages), `session=${d.sessionId}`);
  connectAdmin();
  setTimeout(() => {
    user.emit('send-message', { sessionId: d.sessionId, text: 'hello from user', sender: 'USER', name: 'Tester', phone: PHONE, email: 'tester@test.com' });
  }, 800);
});

user.on('new-message', (m) => {
  if (m.sender === 'USER') {
    flags.userEcho = true;
    log('user message persisted + echoed to sender', m.text === 'hello from user', `sender=${m.sender}`);
  } else if (m.sender === 'ADMIN') {
    flags.userGotReply = true;
    log('user received admin reply broadcast', m.text === 'hello from admin', `sender=${m.sender}`);
  }
  checkDone();
});

function connectAdmin() {
  admin = io(WS_URL, { transports: ['polling', 'websocket'] });
  admin.on('connect', () => { adminConnected = true; admin.emit('admin-join'); });
  admin.on('connect_error', (e) => log('admin connect_error', false, e.message));
  admin.on('new-user-message', (d) => {
    flags.adminGotMsg = true;
    log('admin received user message', d.sessionId === SID && d.message.text === 'hello from user', `sender=${d.message.sender}`);
    admin.emit('admin-reply', { sessionId: d.sessionId, text: 'hello from admin' });
    checkDone();
  });
  admin.on('new-admin-message', (d) => {
    // could be echo of own reply OR the legacy new-admin-message path
    flags.adminEcho = true;
    log('admin room received reply broadcast', d.message.text === 'hello from admin', `sender=${d.message.sender}`);
    checkDone();
  });
}
