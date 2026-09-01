import React, { useState, useRef, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { tickets } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Initial Conversation
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.fullName ? user.fullName.split(' ')[0] : 'there'}! 👋 I am your **Tazkarti AI Agent**.\n\nI can help summarize your booked tickets, check kickoff times, locate your stadium entrance gates, or assist with Fan ID procedures.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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

  // Generate intelligent contextual response
  const generateBotResponse = (query) => {
    const lower = query.toLowerCase().trim();

    // 1. Ticket Summary
    if (
      lower.includes('summar') ||
      lower.includes('ticket') ||
      lower.includes('pass') ||
      lower.includes('my book') ||
      lower.includes('what do i have') ||
      lower.includes('تذكرت') ||
      lower.includes('تذاكر')
    ) {
      if (!tickets || tickets.length === 0) {
        return `🎟️ **Ticket Summary**:\nYou currently don't have any active booked tickets.\n\n💡 *Tip: You can explore upcoming matches in the **Sports** tab or live concerts in the **Entertainment** tab to book with your Fan ID.*`;
      }

      let summary = `🎟️ **Your Active Tickets Summary (${tickets.length} ${tickets.length === 1 ? 'Pass' : 'Passes'}):**\n\n`;
      tickets.forEach((t, i) => {
        summary += `**${i + 1}. ${t.title}**\n`;
        summary += `• 📅 **Date & Time:** ${t.date} at ${t.time}\n`;
        summary += `• 🏟️ **Venue:** ${t.venue}\n`;
        summary += `• 🚪 **Entrance Gate:** ${t.gate || 'Gate Assigned on Pass'}\n`;
        summary += `• 💺 **Seating:** ${t.block} (${t.seats.join(', ')})\n`;
        summary += `• 🏷️ **Ref ID:** \`${t.id}\` | Status: **${t.status}**\n\n`;
      });
      summary += `⚡ *You can present your dynamic 15-second QR code from the **My Fan ID** dashboard at the stadium turnstiles.*`;
      return summary;
    }

    // 2. Next Match / Upcoming fixture
    if (lower.includes('next match') || lower.includes('upcoming') || lower.includes('kickoff') || lower.includes('fixture') || lower.includes('ماتش')) {
      if (tickets && tickets.length > 0) {
        const next = tickets[0];
        return `⚽ **Your Next Fixture:**\n\n**${next.title}**\n• **Date:** ${next.date} (${next.time})\n• **Stadium:** ${next.venue}\n• **Gate:** ${next.gate}\n• **Seats:** ${next.seats.join(', ')}\n\nTurnstiles open 4 hours prior to kickoff. Ensure you bring your original National ID!`;
      }
      return `⚽ **Upcoming Featured Match:**\n\n**Al Ahly SC vs Zamalek SC (Cairo Derby)**\n• Egyptian Premier League - Round 14\n• Cairo International Stadium\n• Starting from 150 EGP\n\nWould you like me to take you to the match booking page?`;
    }

    // 3. Gate information
    if (lower.includes('gate') || lower.includes('entrance') || lower.includes('بواب')) {
      if (tickets && tickets.length > 0) {
        const next = tickets[0];
        return `🏟️ **Gate Assignment for ${next.title}:**\n\nYour assigned entrance is **${next.gate}** at **${next.venue}**.\n\n⚠️ *Please enter strictly through your designated gate printed on your pass to ensure your Fan ID biometric scanner unlocks.*`;
      }
      return `🏟️ **Stadium Gate Guides:**\n• **Cairo Stadium:** Gate 1 (VIP/Bahary), Gate 2-3 (Second Grade), Gate 4 (Curva Left), Gate 5-6 (Curva Right).\n• **Egypt Stadium (NAC):** Gates A-E according to lower/upper tiers.\n\nCheck the **Venues** tab for interactive gate maps!`;
    }

    // 4. Ticket Transfer
    if (lower.includes('transfer') || lower.includes('give ticket') || lower.includes('send') || lower.includes('تحويل')) {
      return `🔄 **Ticket Transfer Instructions:**\n1. Go to **My Tickets** in the top navigation.\n2. Click the **Transfer Ticket** button on your pass.\n3. Enter the recipient's **Fan ID** (e.g. \`TZK-2026-XXXX\`).\n4. Confirm the transfer with SMS OTP.\n\n*Note: Ticket transfers are permanent and will re-issue the turnstile cryptographic QR pass to the recipient.*`;
    }

    // 5. Fan ID & Profile
    if (lower.includes('fan id') || lower.includes('profile') || lower.includes('tier') || lower.includes('points') || lower.includes('فان اي دي')) {
      if (isAuthenticated && user) {
        return `🪪 **Your Fan ID Status:**\n• **Holder:** ${user?.fullName || 'Citizen Fan'}\n• **Fan ID:** \`${user?.fanId || 'TZK-2026'}\`\n• **Loyalty Tier:** ${user?.tier || 'Silver Tier Fan'}\n• **Attendance Points:** ${(user?.attendancePoints ?? 0).toLocaleString()} Pts\n• **Status:** Active & Verified ✓\n\nYour Fan ID pass is ready for all 2026 Egyptian sports and cultural events.`;
      }
      return `🪪 **Tazkarti Fan ID:**\nYour official biometric passport for stadium entry in Egypt. Registration requires your 14-digit National ID and a clear portrait photo. Click **Register Fan ID** in the navbar to get started!`;
    }

    // 6. Prohibited items
    if (lower.includes('prohibit') || lower.includes('allowed') || lower.includes('ban') || lower.includes('bottle') || lower.includes('ممنوع')) {
      return `🚫 **Prohibited Items at Stadiums:**\n• Power banks and external batteries\n• Glass bottles, metal cans, and thermos flasks\n• Fireworks, flares, and smoke bombs\n• Laser pointers and whistles\n• Solid flagpoles (wooden or metallic)\n\n*Please ensure compliance to avoid delays at police security checkpoints.*`;
    }

    // 7. Payment methods
    if (lower.includes('pay') || lower.includes('instapay') || lower.includes('fawry') || lower.includes('meeza') || lower.includes('wallet') || lower.includes('دفع')) {
      return `💳 **Accepted Payment Methods:**\n• **InstaPay (IPN):** Instant debit via Central Bank network\n• **Bank Cards:** Visa & MasterCard\n• **Meeza (ميزة):** All Egyptian national payment cards\n• **Fawry Pay:** 24-hour reference code at retail kiosks\n• **Mobile Wallets:** Vodafone Cash, Orange, Etisalat, WE Pay`;
    }

    // Fallback response
    return `🤖 I am here to help! You can ask me:\n• *"Summarize my tickets"*\n• *"When is my next match & what is my gate?"*\n• *"How do I transfer a ticket to a friend?"*\n• *"What items are prohibited in the stadium?"*\n\nOr click one of the quick suggestion buttons below!`;
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking and typing delay
    setTimeout(() => {
      const reply = generateBotResponse(text);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Chat refreshed! How can I assist you with your Tazkarti tickets, matches, or Fan ID today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { label: '🎟️ Summarize my tickets', prompt: 'Summarize my booked tickets' },
    { label: '⚽ Next match & Gate info', prompt: 'When is my next match and what is my gate?' },
    { label: '🔄 How to transfer a ticket?', prompt: 'How do I transfer a ticket to another Fan ID?' },
    { label: '🚫 Prohibited stadium items', prompt: 'What items are prohibited at stadiums?' }
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
              <p className="text-[11px] text-secondary leading-snug mt-0.5">
                Need a quick summary of your tickets, kickoff gates, or Fan ID pass? Ask me!
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
        <div className="pointer-events-auto w-[92vw] sm:w-[400px] h-[560px] max-h-[85vh] bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary-container to-rose-700 text-white p-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/60 shadow-md relative shrink-0">
                <img src="/bot-avatar.jpg" alt="Tazkarti AI Agent" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-pitch-green border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">Tazkarti AI Agent</h3>
                  <span className="bg-white/20 text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase">Live</span>
                </div>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pitch-green"></span>
                  <span>Connected to Fan ID & Booking DB</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
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
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {isBot && (
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 shrink-0 mb-1 shadow-2xs">
                        <img src="/bot-avatar.jpg" alt="AI Agent" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-surface-container-low text-on-surface border border-surface-variant rounded-bl-xs'
                          : 'bg-primary text-white rounded-br-xs shadow-sm font-medium'
                      }`}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[10px] text-secondary px-2">{msg.timestamp}</span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 max-w-[80%]">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 shrink-0 mb-1 shadow-2xs">
                  <img src="/bot-avatar.jpg" alt="AI Agent" className="w-full h-full object-cover" />
                </div>
                <div className="bg-surface-container-low border border-surface-variant p-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary typing-dot-1"></span>
                  <span className="w-2 h-2 rounded-full bg-primary typing-dot-2"></span>
                  <span className="w-2 h-2 rounded-full bg-primary typing-dot-3"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 border-t border-surface-variant bg-surface-container-low/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="whitespace-nowrap text-[11px] font-semibold bg-surface-container-lowest hover:bg-primary/10 text-on-surface hover:text-primary border border-outline-variant/60 hover:border-primary/40 px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-surface-variant bg-surface-container-lowest flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about tickets, gates, Fan ID..."
              className="flex-1 bg-surface border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim()}
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
