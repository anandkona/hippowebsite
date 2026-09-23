import { io } from 'socket.io-client';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const env = dotenv.parse(fs.readFileSync(path.resolve('.env.local')));
const pool = new pg.Client({ connectionString: env.DATABASE_URL });
await pool.connect();

await pool.query(`CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY, user_name TEXT, user_phone TEXT, user_email TEXT,
  status TEXT, last_message_at TIMESTAMPTZ DEFAULT NOW())`);
await pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY, session_id TEXT, sender TEXT, text TEXT,
  status TEXT DEFAULT 'SENT', created_at TIMESTAMPTZ DEFAULT NOW())`);
await pool.query(`DELETE FROM chat_messages WHERE session_id = $1`, [SID]);
await pool.query(`DELETE FROM chat_sessions WHERE id = $1`, [SID]);

const PHONE = 'TESTPHONE';
const SID = 'session-TESTPHONE';
const WS_URL = 'http://localhost:3001';

const results = [];
let finishing = false;
let finishedCode = null;
let admin = null;

function log(name, ok, extra = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
}

function checkDone() {
  if (finishing) return;
  log('user-connect -> session-data', true);
  connectAdmin();
}
