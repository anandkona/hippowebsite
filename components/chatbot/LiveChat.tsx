'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, User, Phone as PhoneIcon, Mail, Check, CheckCheck, Bell, BellOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  session_id: string;
  sender: 'USER' | 'ADMIN';
  text: string;
  status: string;
  created_at: string;
}

interface LiveChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ isOpen, onToggle }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('hippo_chat_name');
    const savedPhone = localStorage.getItem('hippo_chat_phone');
    const savedEmail = localStorage.getItem('hippo_chat_email');
    const savedNotif = localStorage.getItem('hippo_chat_notifications');
    if (savedName) setUserName(savedName);
    if (savedPhone) setUserPhone(savedPhone);
    if (savedEmail) setUserEmail(savedEmail);
    if (savedNotif === 'true') setNotificationEnabled(true);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, adminTyping]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setNotificationEnabled(true);
      localStorage.setItem('hippo_chat_notifications', 'true');
    }
  };

  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if (!notificationEnabled || Notification.permission !== 'granted') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Notification(title, {
      body,
      icon: '/Hippo_Logo.png',
      badge: '/Hippo_Logo.png',
      tag: 'hippo-chat',
      renotify: true,
    } as any);
  };

  // Connect to Socket.IO
  useEffect(() => {
    if (!isOpen) return;

    const newSocket = io('', {
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      // Auto-join if user info exists in localStorage
      if (userName && userPhone) {
        newSocket.emit('user-connect', { phone: userPhone, name: userName, email: userEmail });
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setAdminOnline(false);
    });

    newSocket.on('session-data', (data: { sessionId: string; status: string; messages: Message[] }) => {
      setSessionId(data.sessionId);
      setMessages(data.messages);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Show notification for admin messages
      if (message.sender === 'ADMIN') {
        showNotification('New message from Support', message.text);
      }
    });

    newSocket.on('admin-typing', (data: { sessionId: string; isTyping: boolean }) => {
      setAdminTyping(data.isTyping);
    });

    newSocket.on('admin-reply-notification', (data: { title: string; body: string }) => {
      showNotification(data.title, data.body);
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen]);

  // Auto-connect if user info exists (only after socket is connected)
  useEffect(() => {
    if (isOpen && socket && socket.connected && userName && userPhone && !sessionId) {
      socket.emit('user-connect', { phone: userPhone, name: userName, email: userEmail });
    }
  }, [isOpen, socket, isConnected, userName, userPhone, userEmail, sessionId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const validatePhone = (value: string) => {
    if (!value) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!/^[0-9]*$/.test(value)) {
      setPhoneError('Only numbers are allowed');
      return false;
    } else if (value.length !== 10) {
      setPhoneError('Must be exactly 10 digits');
      return false;
    } else {
      setPhoneError(null);
      return true;
    }
  };

  const handleStartChat = () => {
    if (!userName.trim() || !validatePhone(userPhone)) return;

    localStorage.setItem('hippo_chat_name', userName.trim());
    localStorage.setItem('hippo_chat_phone', userPhone);
    if (userEmail) localStorage.setItem('hippo_chat_email', userEmail);

    // Auto-request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }

    if (socket && socket.connected) {
      socket.emit('user-connect', { phone: userPhone, name: userName.trim(), email: userEmail });
    }
    // If socket not connected yet, the connect handler will auto-join
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !sessionId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    socket.emit('send-message', {
      sessionId,
      text: messageText,
      sender: 'USER',
    });

    // Stop typing indicator
    socket.emit('user-typing', { sessionId, isTyping: false });
  };

  const handleTyping = useCallback(() => {
    if (!socket || !sessionId) return;

    socket.emit('user-typing', { sessionId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user-typing', { sessionId, isTyping: false });
    }, 2000);
  }, [socket, sessionId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-24 right-6 z-[99999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-32px)] sm:w-[350px] h-[550px] max-h-[calc(100vh-120px)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-2 text-sm sm:text-base">
                  <MessageCircle size={20} /> {sessionId ? 'Chat with Support' : 'Live Support'}
                </span>
                <div className="flex items-center gap-2">
                  {sessionId && (
                    <button
                      onClick={notificationEnabled ? () => { setNotificationEnabled(false); localStorage.setItem('hippo_chat_notifications', 'false'); } : requestNotificationPermission}
                      className="hover:bg-white/10 p-1 rounded-full transition-colors"
                      title={notificationEnabled ? 'Disable notifications' : 'Enable notifications'}
                    >
                      {notificationEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                  )}
                  <button onClick={onToggle} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/80">
                {sessionId
                  ? (adminTyping ? 'Support is typing...' : (isConnected ? (adminOnline ? 'Support is online' : 'Support will reply shortly') : 'Reconnecting...'))
                  : isConnected ? "We're here to help you!" : "Connecting to server..."}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-accent/20">
              {!sessionId ? (
                <div className="flex flex-col items-center justify-center min-h-full text-center space-y-5 py-4">
                  <div>
                    <h3 className="font-bold text-lg">Start Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Chat with our support team</p>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <PhoneIcon size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${phoneError ? 'text-destructive' : 'text-muted-foreground'}`} />
                      <input
                        type="tel"
                        placeholder="Phone Number (10 digits) *"
                        value={userPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setUserPhone(val);
                          validatePhone(val);
                        }}
                        className={`w-full bg-background border ${phoneError ? 'border-destructive' : 'border-border'} rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
                      />
                      {phoneError && (
                        <p className="text-[10px] text-destructive mt-1 ml-1 text-left font-medium">{phoneError}</p>
                      )}
                    </div>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleStartChat}
                      disabled={isLoading || !userName.trim() || !userPhone.trim() || !!phoneError || userPhone.length !== 10}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 size={16} className="animate-spin" />}
                      {isLoading ? 'Connecting...' : 'Start Chat'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-10 italic">
                      Type your message to start chatting...
                    </p>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                          msg.sender === 'USER'
                            ? 'bg-blue-100 text-blue-950 rounded-tr-none'
                            : 'bg-white border border-border/50 text-foreground rounded-tl-none'
                        }`}
                      >
                        <div className="text-[9px] uppercase font-bold opacity-50 mb-0.5">
                          {msg.sender === 'USER' ? 'You' : 'Support'}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'USER' ? 'justify-end' : ''}`}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(msg.created_at)}
                          </span>
                          {msg.sender === 'USER' && (
                            msg.status === 'READ' ? (
                              <CheckCheck size={12} className="text-blue-500" />
                            ) : msg.status === 'DELIVERED' ? (
                              <CheckCheck size={12} className="text-muted-foreground" />
                            ) : (
                              <Check size={12} className="text-muted-foreground/60" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Admin typing indicator */}
                  {adminTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-border/50 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold opacity-50 text-muted-foreground">Support</span>
                          <div className="flex gap-1 ml-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            {sessionId && (
              <div className="p-3 bg-background border-t border-border">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-accent/50 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveChat;
