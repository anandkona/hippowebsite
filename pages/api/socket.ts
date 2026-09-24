import { Server as ServerIO } from 'socket.io';
import { Pool } from 'pg';

// Setup database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
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
    socket.on('user-connect', async (data) => {
      const { phone, name, email } = data;

      try {
        let result = await query('SELECT * FROM chat_sessions WHERE user_phone = $1', [phone]);

        if (result.rows.length === 0) {
          const sessionId = `session-${phone}`;
          await query(
            'INSERT INTO chat_sessions (id, user_name, user_phone, user_email, status) VALUES ($1, $2, $3, $4, $5)',
            [sessionId, name, phone, email || null, 'WAITING']
          );
          result = await query('SELECT * FROM chat_sessions WHERE id = $1', [sessionId]);
        } else {
          await query('UPDATE chat_sessions SET user_name = $1, user_email = COALESCE($2, user_email) WHERE user_phone = $3', [name, email || null, phone]);
          result = await query('SELECT * FROM chat_sessions WHERE user_phone = $1', [phone]);
        }

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
            title: 'New reply from Support',
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
        onlineUsers.delete(sessionId);
        userSockets.delete(socket.id);
        io.to('admin-room').emit('user-offline', { sessionId });
      }

      onlineAdmins.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });

  res.end();
}
