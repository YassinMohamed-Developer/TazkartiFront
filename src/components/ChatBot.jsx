import React, { useState, useRef, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { askChatBot } from '../services/chatBotService';
import { FormattedBotMessage } from './FormattedBotMessage';

const CHAT_STORAGE_KEY = 'tazkarti_chatbot_history_v1';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { tickets } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Helper to construct the default welcome message
  const createWelcomeMessage = (fullName) => {
    const firstName = fullName ? fullName.split(' ')[0] : 'there';
    return {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${firstName}! 👋 Welcome to Tazkarti.\n\n**How Can I Assist You?**\n\nYou can ask me about matches, ticket bookings, Fan ID registration, stadium entrance gates, or platform guidelines.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Load saved conversation from localStorage, or initialize with the welcome prompt
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to restore chat history:', e);
    }
    return [createWelcomeMessage(user?.fullName)];
  });

  // Persist messages whenever conversation changes
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Failed to save chat history to localStorage:', e);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Hide greeting popup after 12 seconds or when opened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    setShowGreeting(false);
  };

  // Graceful local fallback in case backend is offline
  const generateLocalFallback = (query) => {
    const lower = query.toLowerCase().trim();

    if (
      lower.includes('summar') ||
      lower.includes('ticket') ||
      lower.includes('pass') ||
      lower.includes('my book') ||
      lower.includes('تذكرت') ||
      lower.includes('تذاكر')
    ) {
      if (!tickets || tickets.length === 0) {
        return `You currently don't have any active booked tickets.\n\nYou can explore upcoming fixtures in the Sports tab or concerts in the Entertainment tab to book with your Fan ID.`;
      }

      let summary = `Here is a summary of your active tickets:\n\n`;
      tickets.forEach((t) => {
        summary += `* **${t.title}:** ${t.date} at ${t.time} • ${t.venue} • Gate: ${t.gate || 'Assigned on Pass'}\n`;
      });
      return summary;
    }

    if (lower.includes('gate') || lower.includes('entrance') || lower.includes('بواب')) {
      return `Here are the standard stadium gate guidelines:\n\n* **Gate 1:** VIP, Media, and Bahary Tribune.\n* **Gates 2 & 3:** Second Grade standard seating.\n* **Gate 4:** Curva Left (Home supporters).\n* **Gates 5 & 6:** Curva Right (Visiting supporters).\n\nCheck the Venues tab for specific stadium floor plans.`;
    }

    if (lower.includes('prohibit') || lower.includes('allowed') || lower.includes('ban') || lower.includes('ممنوع')) {
      return `Prohibited items at football stadiums:\n\n* Power banks and loose batteries\n* Glass bottles and metal thermos containers\n* Fireworks, flares, and smoke bombs\n* Laser pointers and whistles\n* Solid wooden or metal flagpoles`;
    }

    if (lower.includes('fan id') || lower.includes('profile') || lower.includes('فان اي دي')) {
      if (isAuthenticated && user) {
        return `Your Fan ID details:\n\n* **Name:** ${user?.fullName || 'Registered Fan'}\n* **Fan ID:** \`${user?.fanId || 'TZK-2026'}\`\n* **Tier:** ${user?.tier || 'Silver Tier Fan'}\n* **Attendance Points:** ${(user?.attendancePoints ?? 0).toLocaleString()} Pts\n* **Status:** Active & Verified`;
      }
      return `Tazkarti Fan ID is your official digital passport to attend football matches in Egypt.\n\nRegistration requires your 14-digit National ID and a personal photo. Click Register Fan ID in the top navigation to begin.`;
    }

    return `Tazkarti is the official digital platform for Egyptian football matches and entertainment events.\n\nKey features:\n\n* **Fan ID Integration:** Required biometric identity linked to your National ID for stadium access.\n* **Match Ticketing:** Official hub for Egyptian Premier League, cups, and national team tickets.\n* **Paperless Access:** Seamless electronic entry at stadium turnstiles.\n\nHow can I help you further with your tickets or match bookings?`;
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || isTyping) return;

    const trimmedText = text.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await askChatBot(trimmedText);

      let botReply = '';
      let isError = false;

      if (res && res.isSuccess && res.data) {
        botReply = res.data;
      } else if (res && res.data) {
        botReply = res.data;
      } else if (res && res.message && !res.isNetworkError) {
        // Human-friendly error from backend / validation
        botReply = res.message;
        isError = true;
      } else {
        // Server unreachable fallback
        botReply = generateLocalFallback(trimmedText);
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        isError: isError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('ChatBot communication error:', err);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Unable to reach the assistant right now. Please verify your connection and try again.',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat restarted! 🔄\n\n**How Can I Assist You?**\n\nAsk me any question about matches, tickets, Fan ID, or stadium gates.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { label: '🎟️ Book & Tickets', prompt: 'How do I book tickets for upcoming matches?' },
    { label: '🪪 Fan ID Details', prompt: 'What is a Fan ID and how do I register or check its status?' },
    { label: '🏟️ Stadium Gates', prompt: 'What are the stadium gate entrance rules and guidelines?' },
    { label: '🔄 Ticket Transfer', prompt: 'How do I transfer a ticket to another Fan ID?' },
    { label: '🚫 Prohibited Items', prompt: 'What items are prohibited from entering the stadium?' },
    { label: '💳 Payment Methods', prompt: 'What payment methods are supported on Tazkarti?' }
  ];

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Floating Greeting Tooltip Bubble */}
      {!isOpen && showGreeting && (
        <div className="pointer-events-auto mb-3 max-w-xs bg-surface-container-lowest text-on-surface p-3.5 rounded-2xl shadow-xl border border-outline-variant/40 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGreeting(false);
            }}
            className="absolute -top-2 -left-2 w-5 h-5 bg-surface-container-high text-secondary hover:text-on-surface rounded-full flex items-center justify-center text-xs shadow cursor-pointer"
          >
            ✕
          </button>
          <div
            onClick={handleToggle}
            className="cursor-pointer flex items-start gap-2.5"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/40 shrink-0 shadow-sm">
              <img src="/bot-avatar.jpg" alt="Tazkarti AI Agent" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Tazkarti AI Agent</p>
              <p className="text-[11px] text-secondary leading-snug mt-0.5 font-medium">
                How Can I Assist You? Click to start chatting!
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-surface-container-lowest border-r border-b border-outline-variant/40 rotate-45"></div>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          aria-label="Open Tazkarti AI Assistant"
          className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-primary via-primary-container to-rose-600 text-white shadow-[0_8px_28px_rgba(226,30,38,0.4)] hover:shadow-[0_12px_36px_rgba(226,30,38,0.6)] active:scale-95 transition-all duration-300 p-1 cursor-pointer"
        >
          {/* Ambient Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full animate-bot-glow bg-primary/40 pointer-events-none" />

          {/* Animated Float Avatar Photo */}
          <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/80 dark:border-slate-800 shadow-inner animate-bot-float">
            <img
              src="/bot-avatar.jpg"
              alt="Tazkarti AI Assistant"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto w-[94vw] sm:w-[420px] md:w-[460px] h-[580px] max-h-[85vh] bg-surface-container-lowest/98 backdrop-blur-xl border border-outline-variant/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary-container to-rose-700 text-white p-3.5 px-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/60 shadow-md relative shrink-0">
                <img src="/bot-avatar.jpg" alt="Tazkarti AI Agent" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-pitch-green border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">Tazkarti AI Assistant</h3>
                </div>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pitch-green"></span>
                  <span>Active • History saved</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Restart conversation"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[90%] ${isBot ? '' : 'flex-row-reverse'}`}>
                    {isBot ? (
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 shrink-0 shadow-2xs mt-0.5">
                        <img src="/bot-avatar.jpg" alt="AI Agent" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl ${
                        isBot
                          ? msg.isError
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-xs text-[13px] leading-relaxed'
                            : 'bg-surface-container-low text-on-surface border border-surface-variant/50 rounded-tl-xs shadow-2xs'
                          : 'bg-primary text-white rounded-tr-xs shadow-xs text-[13px] leading-relaxed font-normal'
                      }`}
                    >
                      {isBot ? (
                        <FormattedBotMessage text={msg.text} />
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] text-secondary ${isBot ? 'pl-9' : 'pr-9'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 max-w-[80%]">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 shrink-0 shadow-2xs">
                  <img src="/bot-avatar.jpg" alt="AI Agent" className="w-full h-full object-cover" />
                </div>
                <div className="bg-surface-container-low border border-surface-variant/60 px-3.5 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot-1"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot-2"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot-3"></span>
                  <span className="text-[11px] text-secondary ml-1 font-medium">Assistant is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 border-t border-surface-variant/60 bg-surface-container-low/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                disabled={isTyping}
                className="whitespace-nowrap text-[11px] font-medium bg-surface-container-lowest hover:bg-primary/10 text-on-surface hover:text-primary border border-outline-variant/50 hover:border-primary/40 px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-surface-variant/60 bg-surface-container-lowest flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
              placeholder="Ask Tazkarti AI a question..."
              className="flex-1 bg-surface border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isTyping}
              className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
