'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Loader2, User, Phone as PhoneIcon, Mail,
  Check, CheckCheck, Bell, BellOff, List, ChevronDown, ChevronRight,
  Layers, GraduationCap, Briefcase,
} from 'lucide-react';
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

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

const getSocketErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message || fallback);
  }
  return error == null ? fallback : String(error);
};

const webInformationItems = [
  {
    label: 'Products',
    description: 'Explore enterprise products',
    prompt: 'Show me your Products',
    icon: Layers,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Skill Hub',
    description: 'View training programs',
    prompt: 'Tell me about Skill Hub',
    icon: GraduationCap,
    iconClass: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Services',
    description: 'View technology services',
    prompt: 'Tell me about Cloud Services',
    icon: Briefcase,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
] as const;

const LiveChat: React.FC<LiveChatProps> = ({ isOpen, onToggle }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationEnabledRef = useRef(false);
  const userInfoRef = useRef<UserInfo>({ name: '', phone: '', email: '' });
  const sessionIdRef = useRef<string | null>(null);
  const chatStartedRef = useRef(false);
  const userConnectPendingRef = useRef(false);

  // Load user data from localStorage after hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedName = localStorage.getItem('hippo_chat_name');
    const savedPhone = localStorage.getItem('hippo_chat_phone');
    const savedEmail = localStorage.getItem('hippo_chat_email');
    const savedNotif = localStorage.getItem('hippo_chat_notifications');
    const savedUser = {
      name: savedName || '',
      phone: savedPhone || '',
      email: savedEmail || '',
    };

    userInfoRef.current = savedUser;
    setUserName(savedUser.name);
    setUserPhone(savedUser.phone);
    setUserEmail(savedUser.email);
    notificationEnabledRef.current = savedNotif === 'true';
    setNotificationEnabled(notificationEnabledRef.current);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, adminTyping, menuOpen, scrollToBottom]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    notificationEnabledRef.current = permission === 'granted';
    setNotificationEnabled(notificationEnabledRef.current);
    localStorage.setItem('hippo_chat_notifications', String(notificationEnabledRef.current));
  };

  // Show browser notification
  const showNotification = useCallback((title: string, body: string) => {
    if (
      !notificationEnabledRef.current ||
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    new Notification(title, {
      body,
      icon: '/Hippo_Logo_Black.png',
      badge: '/Hippo_Logo_Black.png',
      tag: 'hippo-chat',
    });
  }, []);

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

    const connectUser = () => {
      const { name, phone, email } = userInfoRef.current;
      if (!chatStartedRef.current || !name || !phone || userConnectPendingRef.current) return;

      userConnectPendingRef.current = true;
      setIsLoading(true);
      newSocket.emit('user-connect', { phone, name, email });
    };

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      connectUser();
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', getSocketErrorMessage(err, 'Unable to connect to chat'));
      setIsConnected(false);
      userConnectPendingRef.current = false;
      if (chatStartedRef.current) {
        setIsLoading(false);
        setConnectionError('Unable to connect to chat. Retrying...');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setAdminOnline(false);
      userConnectPendingRef.current = false;
      if (!sessionIdRef.current) {
        setIsLoading(false);
      }
    });

    newSocket.on('session-data', (data: { sessionId: string; status: string; messages: Message[] }) => {
      sessionIdRef.current = data.sessionId;
      userConnectPendingRef.current = false;
      setSessionId(data.sessionId);
      setMessages(data.messages);
      setIsLoading(false);
      setConnectionError(null);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Show notification for admin messages
      if (message.sender === 'ADMIN') {
        showNotification('Hippocloud', message.text);
      }
    });

    newSocket.on('admin-typing', (data: { sessionId: string; isTyping: boolean }) => {
      if (data.sessionId === sessionIdRef.current) {
        setAdminTyping(data.isTyping);
      }
    });

    newSocket.on('admin-status', (data: { online: boolean }) => {
      setAdminOnline(data.online);
    });

    newSocket.on('admin-reply-notification', (data: { title: string; body: string }) => {
      showNotification(data.title, data.body);
    });

    newSocket.on('error', (data: unknown) => {
      const message = getSocketErrorMessage(data, 'Unknown socket error');
      console.error('Socket error:', message);

      if (message === 'Failed to connect' || message === 'Failed to send message' || message === 'Name and phone are required') {
        userConnectPendingRef.current = false;
        setIsLoading(false);
        setConnectionError(
          message === 'Failed to connect'
            ? 'Unable to start chat. Please try again.'
            : message === 'Name and phone are required'
              ? 'Please enter your name and a 10-digit phone number.'
              : 'Unable to send your message. Please try again.'
        );
      }
    });

    setSocket(newSocket);

    return () => {
      userConnectPendingRef.current = false;
      newSocket.disconnect();
    };
  }, [isOpen, showNotification]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

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
    const name = userName.trim();
    if (!name || !validatePhone(userPhone)) return;

    const userInfo = { name, phone: userPhone, email: userEmail.trim() };
    userInfoRef.current = userInfo;
    chatStartedRef.current = true;
    userConnectPendingRef.current = false;
    setConnectionError(null);
    setIsLoading(true);

    localStorage.setItem('hippo_chat_name', name);
    localStorage.setItem('hippo_chat_phone', userPhone);
    if (userInfo.email) localStorage.setItem('hippo_chat_email', userInfo.email);

    // Auto-request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }

    if (socket?.connected) {
      userConnectPendingRef.current = true;
      socket.emit('user-connect', userInfo);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !sessionId) return;
    if (!socket.connected) {
      setConnectionError('Chat is reconnecting. Please try again in a moment.');
      return;
    }

    setMenuOpen(false);
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

  const handleMenuClick = (prompt: string) => {
    if (!socket || !sessionId) return;
    if (!socket.connected) {
      setConnectionError('Chat is reconnecting. Please try again in a moment.');
      return;
    }

    socket.emit('send-message', {
      sessionId,
      text: prompt,
      sender: 'USER',
    });
    setMenuOpen(false);
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

  const toggleNotifications = () => {
    if (notificationEnabled) {
      notificationEnabledRef.current = false;
      setNotificationEnabled(false);
      localStorage.setItem('hippo_chat_notifications', 'false');
    } else {
      void requestNotificationPermission();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[99999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-32px)] sm:w-[350px] h-[550px] max-h-[calc(100vh-120px)] bg-background border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-2 text-sm sm:text-base">
                  <MessageCircle size={20} /> {sessionId ? 'Hippocloud' : 'Hippocloud Live Chat'}
                </span>
                <div className="flex items-center gap-2">
                  {sessionId && (
                    <button
                      onClick={toggleNotifications}
                      className="hover:bg-white/10 p-1 rounded-full transition-colors"
                      title={notificationEnabled ? 'Disable notifications' : 'Enable notifications'}
                    >
                      {notificationEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggle();
                    }}
                    className="hover:bg-white/10 p-1 rounded-full transition-colors"
                    aria-label="Close chat"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              {sessionId ? (
                adminTyping ? (
                  <p className="text-[10px] sm:text-xs text-white/80 mt-1">Hippocloud is typing...</p>
                ) : !isConnected ? (
                  <p className="text-[10px] sm:text-xs text-white/80 mt-1">Reconnecting...</p>
                ) : null
              ) : (
                <p className="text-[10px] sm:text-xs text-white/80 mt-1">
                  {isConnected ? "We're here to help you!" : "Connecting to server..."}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-accent/20">
              {sessionId && connectionError && (
                <p role="alert" className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {connectionError}
                </p>
              )}
              {!sessionId ? (
                <div className="flex flex-col items-center justify-center min-h-full text-center space-y-5 py-4">
                  <div>
                    <h3 className="font-bold text-lg">Chat with Hippocloud</h3>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                        className={`w-full bg-background border ${phoneError ? 'border-destructive' : 'border-border'} rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none`}
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
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleStartChat}
                      disabled={isLoading || !userName.trim() || !userPhone.trim() || !!phoneError || userPhone.length !== 10}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 size={16} className="animate-spin" />}
                      {isLoading ? 'Connecting...' : 'Start Chat'}
                    </button>
                    {connectionError && (
                      <p role="alert" className="text-xs text-destructive text-center">
                        {connectionError}
                      </p>
                    )}
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
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-sm shadow-sm ${
                          msg.sender === 'USER'
                            ? 'bg-blue-100 text-blue-950 rounded-tr-none'
                            : 'bg-white border border-border/50 text-foreground rounded-tl-none'
                        }`}
                      >
                        <div className="text-[9px] uppercase font-bold opacity-50 mb-0.5">
                          {msg.sender === 'USER' ? 'You' : 'Hippocloud'}
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
                      <div className="bg-white border border-border/50 px-4 py-2.5 rounded-lg rounded-tl-none shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold opacity-50 text-muted-foreground">Hippocloud</span>
                          <div className="flex gap-1 ml-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        id="web-information-menu"
                        role="menu"
                        aria-label="Web Information"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="w-full overflow-hidden rounded-lg border border-border bg-background shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-border bg-accent/30 px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-foreground">Web Information</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">Select an option to view details</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label="Close Web Information options"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div>
                          {webInformationItems.map((item) => {
                            const Icon = item.icon;

                            return (
                              <button
                                key={item.label}
                                type="button"
                                role="menuitem"
                                onClick={() => handleMenuClick(item.prompt)}
                                className="flex w-full items-center gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/40 focus:bg-accent/40 focus:outline-none active:bg-accent/60"
                              >
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}>
                                  <Icon size={17} aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-xs font-semibold text-foreground sm:text-sm">{item.label}</span>
                                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{item.description}</span>
                                </span>
                                <ChevronRight size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Web Information Trigger */}
            {sessionId && (
              <div className="shrink-0 px-3 py-2 bg-accent/20 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls="web-information-menu"
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <List size={15} aria-hidden="true" />
                    </span>
                    Web Information
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            )}

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
                    className="flex-1 bg-accent/50 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
