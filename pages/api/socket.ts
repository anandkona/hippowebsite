import { Server as ServerIO } from 'socket.io';
import { Pool } from 'pg';

// Setup database pool
const ssl =
  process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : process.env.DATABASE_SSL === 'false' || process.env.NODE_ENV !== 'production'
      ? false
      : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

function getBotResponse(text: string): string | null {
  const normalizedText = text.toLowerCase().trim();

  if (
    normalizedText.includes('product') ||
    normalizedText.includes('hippocx') ||
    normalizedText.includes('hippoaqua') ||
    normalizedText.includes('hippobuildx')
  ) {
    return `Hippocloud Enterprise Products

HIPPOCX — AI-powered CRM and digital integration with predictive analytics, workflow automation and enterprise APIs.

HIPPOAQUA — Intelligent water management with IoT monitoring, quality analytics, leak detection and compliance automation.

HIPPO BUILDX — Smart construction management covering BIM, resources, progress, costs, collaboration and safety.`;
  }

  if (
    normalizedText.includes('skill') ||
    normalizedText.includes('academy') ||
    normalizedText.includes('training') ||
    normalizedText.includes('course')
  ) {
    return `Hippocloud Skill Academy

Our enterprise academy provides industry-aligned training for:
• Enterprise technology
• Cloud and DevOps
• AI, data and digital transformation

Programs are designed to help organizations build practical skills for modern technology environments.`;
  }

  if (
    normalizedText.includes('service') ||
    normalizedText.includes('cloud') ||
    normalizedText.includes('devops') ||
    normalizedText.includes('managed it') ||
    normalizedText.includes('cybersecurity')
  ) {
    return `Hippocloud Technology Services

• Cloud Solutions — Resilient AWS, Azure and GCP infrastructure
• Software Development — Bespoke applications built around business needs
• DevOps and Automation — Modern CI/CD and operational automation
• Enterprise IT Services — Managed IT support and cybersecurity`;
  }

  return null;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// Track online users and admins globally 
const onlineUsers = new Map<string, string>();   // sessionId -> socket.id
const onlineAdmins = new Set<string>();  // socket.id
const userSockets = new Map<string, string>();   // socket.id -> sessionId

export default function SocketHandler(req: any, res: any) {
  // If the socket server is already initialized, just return
  if (res.socket.server.io) {
    res.end();
    return;
  }

  console.log('Initializing Socket.IO Server on Vercel Next.js...');
  
  const io = new ServerIO(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'], // Polling fallback is useful for serverless
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // USER connects
    socket.on('user-connect', async (data: { phone?: unknown; name?: unknown; email?: unknown }) => {
      const phone = typeof data?.phone === 'string' ? data.phone.trim() : '';
      const name = typeof data?.name === 'string' ? data.name.trim() : '';
      const email = typeof data?.email === 'string' ? data.email.trim() : '';

      if (!phone || !name) {
        socket.emit('error', { message: 'Name and phone are required' });
        return;
      }

      try {
        const sessionId = `session-${phone}`;
        await query(
          `INSERT INTO chat_sessions (id, user_name, user_phone, user_email, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [sessionId, name, phone, email || null, 'WAITING']
        );
        await query(
          `UPDATE chat_sessions
           SET user_name = $1,
               user_email = COALESCE($2, user_email)
           WHERE user_phone = $3`,
          [name, email || null, phone]
        );

        const result = await query('SELECT * FROM chat_sessions WHERE user_phone = $1', [phone]);

        const session = result.rows[0];
        socket.join(session.id);
        onlineUsers.set(session.id, socket.id);
        userSockets.set(socket.id, session.id);

        const messages = await query(
          'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
          [session.id]
        );

        socket.emit('session-data', {
          sessionId: session.id,
          status: session.status,
          messages: messages.rows,
        });
        socket.emit('admin-status', { online: onlineAdmins.size > 0 });

        // Notify admins user is online
        io.to('admin-room').emit('user-online', { sessionId: session.id });
        io.to('admin-room').emit('session-updated', {
          sessionId: session.id,
          user_name: session.user_name,
          user_phone: session.user_phone,
          user_email: session.user_email,
          status: session.status,
          last_message_at: session.last_message_at,
        });
      } catch (error) {
        console.error('Error connecting user:', error);
        socket.emit('error', { message: 'Failed to connect' });
      }
    });

    // ADMIN joins
    socket.on('admin-join', () => {
      onlineAdmins.add(socket.id);
      socket.join('admin-room');
      console.log('Admin joined:', socket.id);
      io.emit('admin-status', { online: true });

      // Send currently online users to admin
      const onlineSessionIds = Array.from(onlineUsers.keys());
      socket.emit('online-users', { sessionIds: onlineSessionIds });
    });

    // Send message (user or admin)
    socket.on('send-message', async (data) => {
      const { sessionId, text, sender } = data;

      try {
        const result = await query(
          'INSERT INTO chat_messages (session_id, sender, text) VALUES ($1, $2, $3) RETURNING *',
          [sessionId, sender, text]
        );

        const message = result.rows[0];
        await query('UPDATE chat_sessions SET last_message_at = NOW() WHERE id = $1', [sessionId]);

        io.to(sessionId).emit('new-message', message);

        if (sender === 'USER') {
          io.to('admin-room').emit('new-user-message', { sessionId, message });
          // Stop user typing indicator
          io.to('admin-room').emit('user-typing', { sessionId, isTyping: false });

          const botReply = getBotResponse(text);
          if (botReply) {
            try {
              const botResult = await query(
                'INSERT INTO chat_messages (session_id, sender, text) VALUES ($1, $2, $3) RETURNING *',
                [sessionId, 'ADMIN', botReply]
              );
              const botMessage = botResult.rows[0];

              io.to(sessionId).emit('new-message', botMessage);
              io.to('admin-room').emit('new-admin-message', { sessionId, message: botMessage });
            } catch (error) {
              console.error('Error sending website information:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Admin reply
    socket.on('admin-reply', async (data) => {
      const { sessionId, text } = data;

      try {
        const result = await query(
          'INSERT INTO chat_messages (session_id, sender, text) VALUES ($1, $2, $3) RETURNING *',
          [sessionId, 'ADMIN', text]
        );

        const message = result.rows[0];

        await query(
          "UPDATE chat_sessions SET last_message_at = NOW(), status = 'ACTIVE' WHERE id = $1",
          [sessionId]
        );

        io.to(sessionId).emit('new-message', message);

        // Notify user via push notification (if they allowed it)
        const userSocketId = onlineUsers.get(sessionId);
        if (userSocketId) {
          io.to(userSocketId).emit('admin-reply-notification', {
            title: 'Hippocloud',
            body: text,
            sessionId,
          });
        }

        io.to('admin-room').emit('new-admin-message', { sessionId, message });
      } catch (error) {
        console.error('Error sending admin reply:', error);
      }
    });

    // Typing indicators
    socket.on('user-typing', (data) => {
      io.to('admin-room').emit('user-typing', {
        sessionId: data.sessionId,
        isTyping: data.isTyping,
      });
    });

    socket.on('admin-typing', (data) => {
      const userSocketId = onlineUsers.get(data.sessionId);
      if (userSocketId) {
        io.to(userSocketId).emit('admin-typing', {
          sessionId: data.sessionId,
          isTyping: data.isTyping,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const sessionId = userSockets.get(socket.id);
      if (sessionId) {
        if (onlineUsers.get(sessionId) === socket.id) {
          onlineUsers.delete(sessionId);
          io.to('admin-room').emit('user-offline', { sessionId });
        }
        userSockets.delete(socket.id);
      }

      const wasOnlineAdmin = onlineAdmins.delete(socket.id);
      if (wasOnlineAdmin && onlineAdmins.size === 0) {
        io.emit('admin-status', { online: false });
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  res.end();
}
