import { io } from 'socket.io-client';
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const env = dotenv.parse(fs.readFileSync(path.resolve('.env.local')));
const WS_URL = 'http://localhost:3001';
const SID = 'session-TESTPHONE';
const PHONE = 'TESTPHONE';

const pool = new Client({ connectionString: env.DATABASE_URL });
await pool.connect();
await pool.query(`CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY, user_name TEXT, user_phone TEXT, user_email TEXT,
  status TEXT, last_message_at TIMESTAMPTZ DEFAULT NOW())`);
await pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY, session_id TEXT, sender TEXT, text TEXT,
  status TEXT DEFAULT 'SENT', created_at TIMESTAMPTZ DEFAULT NOW())`);
await pool.query(`DELETE FROM chat_messages WHERE session_id = $1`, [SID]);
await pool.query(`DELETE FROM chat_sessions WHERE id = $1`, [SID]);

let user = null;
let admin = null;
let sessionId = null;
let finishing = false;
let timeoutId = null;
const checks = [];
const log = (name, ok, extra = '') => {
  checks.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
};

const fUser = { connect: false, echo: false, gotReply: false };
const fAdmin = { gotMsg: false, echo: false };

function finish(code) {
  if (finishing) return;
  finishing = true;
  clearTimeout(timeoutId);
  if (user) user.disconnect();
  if (admin) admin.disconnect();
  pool.query(`DELETE FROM chat_messages WHERE session_id = $1`, [SID])
    .then(() => pool.query(`DELETE FROM chat_sessions WHERE id = $1`, [SID]))
    .then(() => pool.end())
    .then(() => {
      const ok = checks.filter(Boolean).length;
      console.log(`\n=== ${ok}/${checks.length} checks passed ===`);
      process.exit(code);
    })
    .catch((e) => { console.error('finish error', e); process.exit(1); });
}

function tickCheck() {
  if (finishing) return;
  const done = fUser.echo && fAdmin.gotMsg && fAdmin.echo && fUser.gotReply;
  if (done) finish(0);
}

timeoutId = setTimeout(() => {
  log('TIMEOUT', false, 'flow did not complete in 15s');
  fUser.echo = true;
  fAdmin.gotMsg = true;
  fAdmin.echo = true;
  fUser.gotReply = true;
  finish(1);
}, 15000);

user = io(WS_URL, { transports: ['polling', 'websocket'] });

user.on('connect', () => {
  user.emit('user-connect', { phone: PHONE, name: 'Tester', email: 'tester@test.com' });
});
user.on('connect_error', (e) => log('user connect_error', false, e.message));

user.on('session-data', (d) => {
  fUser.connect = true;
  sessionId = d.sessionId;
  log('user-connect -> session-data', d.sessionId === SID && Array.isArray(d.messages), `session=${d.sessionId}`);
  connectAdmin();
  setTimeout(() => {
    user.emit('send-message', { sessionId: d.sessionId, text: 'hello from user', sender: 'USER' });
  }, 700);
});

user.on('new-message', (m) => {
  if (m.sender === 'USER') {
    fUser.echo = true;
    log('user message echoed back (USER)', m.text === 'hello from user', `sender=${m.sender}`);
    tickCheck();
  } else if (m.sender === 'ADMIN') {
    fUser.gotReply = true;
    log('user received admin reply broadcast (ADMIN)', m.text === 'hello from admin', `sender=${m.sender}`);
    tickCheck();
  }
});

function connectAdmin() {
  admin = io(WS_URL, { transports: ['polling', 'websocket'] });
  admin.on('connect', () => admin.emit('admin-join'));
  admin.on('connect_error', (e) => log('admin connect_error', false, e.message));
  admin.on('new-user-message', (d) => {
    fAdmin.gotMsg = true;
    log('admin received user message (new-user-message)', d.sessionId === SID && d.message.text === 'hello from user', `sender=${d.message.sender}`);
    admin.emit('admin-reply', { sessionId: d.sessionId, text: 'hello from admin' });
    tickCheck();
  });
  admin.on('new-admin-message', (d) => {
    fAdmin.echo = true;
    log('admin room echo of reply (new-admin-message)', d.message.text === 'hello from admin', `sender=${d.message.sender}`);
    tickCheck();
  });
}
