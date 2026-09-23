'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, Loader2, User, Phone, Mail, Clock, Check, CheckCheck, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Session {
  id: string;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  status: string;
  last_message_at: string;
  message_count: string;
  last_message: string;
}

interface Message {
  id: number;
  session_id: string;
  sender: 'USER' | 'ADMIN';
  text: string;
  status: string;
  created_at: string;
}

// Notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgip2OlY+BdmBtcH2Tn5aLfnZ3hZaenI+EfX2JmZ2bkYB8fYuYnZuRgHx9i5idm5GAfH2LmJ2bkYB8fYuYnZuRgHx9i5idm5GAfH2LmJ2bkYA=');
    audio.volume = 0.3;
    audio.play().catch(() => { });
  } catch { }
};

export default function ChatAdmin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchSessions();

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `http://${window.location.hostname}:3001`;
    const newSocket = io(wsUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('Admin socket connected:', newSocket.id);
      newSocket.emit('admin-join');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Admin socket connection error:', err.message);
    });

    newSocket.on('online-users', (data: { sessionIds: string[] }) => {
      setOnlineUsers(new Set(data.sessionIds));
    });

    newSocket.on('user-online', (data: { sessionId: string }) => {
      setOnlineUsers(prev => new Set([...prev, data.sessionId]));
    });

    newSocket.on('user-offline', (data: { sessionId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.sessionId);
        return next;
      });
    });

    newSocket.on('new-user-message', (data: { sessionId: string; message: Message }) => {
      if (selectedSession?.id === data.sessionId) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      } else {
        // Increment unread count
        setUnreadCounts(prev => ({
          ...prev,
          [data.sessionId]: (prev[data.sessionId] || 0) + 1,
        }));
      }

      // Play notification sound
      if (soundEnabled) playNotificationSound();

      fetchSessions();
    });

    newSocket.on('user-typing', (data: { sessionId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.sessionId);
        } else {
          next.delete(data.sessionId);
        }
        return next;
      });
    });

    newSocket.on('session-updated', () => {
      fetchSessions();
    });

    newSocket.on('new-admin-message', (data: { sessionId: string; message: Message }) => {
      if (selectedSession?.id === data.sessionId) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
      fetchSessions();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [selectedSession?.id, soundEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/chat/sessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/messages?sessionId=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    fetchMessages(session.id);
    // Clear unread count
    setUnreadCounts(prev => {
      const next = { ...prev };
      delete next[session.id];
      return next;
    });
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedSession || !socket) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    socket.emit('admin-reply', {
      sessionId: selectedSession.id,
      text: messageText,
    });

    // Stop typing
    socket.emit('admin-typing', { sessionId: selectedSession.id, isTyping: false });

    setSending(false);
  };

  const handleTyping = useCallback(() => {
    if (!socket || !selectedSession) return;

    socket.emit('admin-typing', { sessionId: selectedSession.id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('admin-typing', { sessionId: selectedSession.id, isTyping: false });
    }, 2000);
  }, [socket, selectedSession]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Sessions List */}
      <div className="w-full md:w-80 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Live Chat
            </h2>
            <p className="text-sm text-muted-foreground">{sessions.length} conversations</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isOnline = onlineUsers.has(session.id);
              const isTyping = typingUsers.has(session.id);
              const unread = unreadCounts[session.id] || 0;

              return (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/30 ${selectedSession?.id === session.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        {/* Online indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.user_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {session.user_phone}
                        </p>
                        {session.user_email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {session.user_email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        {unread > 0 && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unread}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${session.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                          session.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.last_message_at)}
                      </p>
                    </div>
                  </div>
                  {isTyping ? (
                    <p className="text-xs text-emerald-600 mt-2 pl-13 italic">typing...</p>
                  ) : session.last_message ? (
                    <p className="text-xs text-muted-foreground mt-2 truncate pl-13">
                      {session.last_message}
                    </p>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col overflow-hidden hidden md:flex">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${onlineUsers.has(selectedSession.id) ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                </div>
                <div>
                  <p className="font-bold">{selectedSession.user_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {selectedSession.user_phone}
                    </span>
                    {selectedSession.user_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {selectedSession.user_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onlineUsers.has(selectedSession.id) ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <WifiOff className="h-3 w-3" /> Offline
                  </span>
                )}
                <span className={`text-xs px-3 py-1 rounded-full ${selectedSession.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                  selectedSession.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                  {selectedSession.status}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.sender === 'ADMIN'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'ADMIN' ? 'justify-end' : ''}`}>
                      <span className="text-[10px] opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender === 'ADMIN' && (
                        msg.status === 'READ' ? (
                          <CheckCheck className="h-3 w-3 opacity-70" />
                        ) : (
                          <Check className="h-3 w-3 opacity-70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* User typing indicator */}
              {typingUsers.has(selectedSession.id) && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-1">typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
