import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { fetchChatConfig, logChatMessage } from '../services/db';
import { ChatConfig } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    welcomeMessage: 'Greetings! I am the automated Academic Assistant for Professor Ebere Okorie. How can I assist you with your scholarly inquiries today?',
    suggestions: [
      "Can you tell me about Prof. Okorie's research studies?",
      "What articles or books has Prof. Ebere Okorie published?",
      "How do I email or visit the Department at UNIUYO?",
      "How can I donate or support his youth guidance programs?"
    ],
    assistantName: 'Academic Portal Assistant',
    chatbotEnabled: true
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [sessionId, setSessionId] = useState('');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Generate or read Session ID on mount and load chat config
  useEffect(() => {
    let sess = sessionStorage.getItem('okorie_chat_session_id');
    if (!sess) {
      sess = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      sessionStorage.setItem('okorie_chat_session_id', sess);
    }
    setSessionId(sess);

    const loadConfig = async () => {
      try {
        const liveConfig = await fetchChatConfig();
        if (liveConfig) {
          setConfig(liveConfig);
          // Set welcome message dynamically
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: liveConfig.welcomeMessage || 'Greetings! I am the automated Academic Assistant for Professor Ebere Okorie. How can I assist you with your scholarly inquiries today?',
              timestamp: new Date()
            }
          ]);
        }
      } catch (e) {
        console.warn("Could not retrieve dynamic chat config:", e);
        // Fallback default greeting
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Greetings! I am the automated Academic Assistant for Professor Ebere Okorie. How can I assist you with your scholarly inquiries today?',
            timestamp: new Date()
          }
        ]);
      }
    };

    loadConfig();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Hide notifications indicator after 8 seconds
    const timer = setTimeout(() => setShowNotification(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessageTime = new Date();
    // Create user message locally
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: userMessageTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // 1. Log User message to Firestore in the background
    try {
      await logChatMessage({
        sessionId: sessionId || 'unknown_session',
        role: 'user',
        content: text,
        timestamp: userMessageTime.toISOString()
      });
    } catch (err) {
      console.warn("Failed background user message logging:", err);
    }

    try {
      // Build conversation history for the server context
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory })
      });

      if (!res.ok) {
        throw new Error("Failed to secure connection channel to assistant gateway");
      }

      const data = await res.json();
      const aiResponseText = data.reply || "I am currently processing academic records. Let me know if you would like me to describe Prof. Okorie's research directions, publications, or contacts.";
      const assistantTime = new Date();
      
      const assistantMsg: ChatMessage = {
        id: 'assistant_' + Date.now(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: assistantTime
      };

      setMessages(prev => [...prev, assistantMsg]);

      // 2. Log Assistant reply to Firestore
      try {
        await logChatMessage({
          sessionId: sessionId || 'unknown_session',
          role: 'assistant',
          content: aiResponseText,
          timestamp: assistantTime.toISOString()
        });
      } catch (err) {
        console.warn("Failed background reply logging:", err);
      }

    } catch (err) {
      console.error("LiveChat Sync Error:", err);
      
      const errorTime = new Date();
      const errMsg: ChatMessage = {
        id: 'error_' + Date.now(),
        role: 'assistant',
        content: "Connectivity alert. I will resolve the channel momentarily, but in the meantime, please feel free to navigate directly to the Publications page to view our academic output.",
        timestamp: errorTime
      };
      setMessages(prev => [...prev, errMsg]);

      // Log the error message or default reply
      try {
        await logChatMessage({
          sessionId: sessionId || 'unknown_session',
          role: 'assistant',
          content: errMsg.content,
          timestamp: errorTime.toISOString()
        });
      } catch (logErr) {
        console.warn("Failed background error logging:", logErr);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // If chat is disabled globally by the Administrator, do not show the widget at all!
  if (!config.chatbotEnabled) {
    return null;
  }

  return (
    <div id="live_chat_root" className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Mini notification banner above floating bubble */}
      {!isOpen && showNotification && (
        <div 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-16 right-0 bg-navy text-[#fdfcf9] border border-gold/40 text-xs px-4 py-2.5 shadow-xl flex items-center space-x-2 rounded-none cursor-pointer w-64 animate-bounce mb-2"
        >
          <Sparkles className="h-4 w-4 text-gold shrink-0 animate-pulse" />
          <div className="text-[10px] text-left leading-tight">
            <span className="font-bold text-gold">Chat with the Office</span>: Ask any research, pub, or contact question!
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowNotification(false);
            }}
            className="text-white/60 hover:text-white p-0.5 ml-auto"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Floating CTA Toggle Button */}
      {!isOpen && (
        <button
          id="toggle_livechat_btn"
          onClick={() => {
            setIsOpen(true);
            setShowNotification(false);
          }}
          className="bg-navy hover:bg-[#001736] text-gold border border-gold/40 p-4 shadow-2xl flex items-center justify-center rounded-none transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer relative group"
          title="Scholarly Assistant Live Chat"
        >
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-650 rounded-full border border-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white"></span>
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Expanding Live Chat Card panel */}
      {isOpen && (
        <div 
          id="chat_panel_container"
          className="bg-white border-2 border-navy w-[340px] sm:w-[380px] h-[520px] shadow-2xl flex flex-col justify-between animate-scale-up relative rounded-none animate-fade-in"
        >
          
          {/* Panel Header */}
          <div className="bg-navy border-b-2 border-gold text-[#fdfcf9] px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-left">
              <div className="relative">
                <div className="w-8 h-8 bg-gold border border-navy/20 flex items-center justify-center text-navy font-bold rounded-none">
                  EO
                </div>
                {/* Active green status light */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-55 border border-white rounded-full bg-emerald-500"></div>
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-white">
                  {config.assistantName || 'Academic Portal Assistant'}
                </h3>
                <span className="text-[9px] text-gold font-mono tracking-widest uppercase flex items-center">
                  Online &bull; Interactive AI
                </span>
              </div>
            </div>
            <button 
              id="close_livechat_btn"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 text-white hover:text-gold transition rounded-lg cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Scrollable Conversation screen */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfcf9] text-xs">
            
            {/* System Info alert banner */}
            <div className="p-2.5 bg-gold/10 border border-gold/20 text-navy/80 text-[10px] text-left flex items-start space-x-1.5 rounded-none">
              <Sparkles className="h-4 w-4 text-gold shrink-0" />
              <span>Ask about Prof. Okorie's textbooks, research papers and appointments. All correspondence is securely buffered.</span>
            </div>

            {/* Conversation History */}
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div 
                  className={`p-3 rounded-none leading-relaxed text-left transition-all ${
                    msg.role === 'user' 
                      ? 'bg-navy text-white text-xs' 
                      : 'bg-white border border-navy/15 text-navy text-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                <span className="text-[8px] text-[rgba(15,23,42,0.4)] mt-1 font-mono uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Typing status indicator */}
            {isTyping && (
              <div className="mr-auto max-w-[80%] flex items-center space-x-1.5 bg-white border border-navy/10 px-3 py-2 text-navy shadow-2xs rounded-none">
                <span className="h-1.5 w-1.5 bg-navy rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-navy rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-navy rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-[9px] text-[#002147]/50 font-medium">Formulating scholarly reply...</span>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Quick Chip Actions */}
          {config.suggestions && config.suggestions.length > 0 && (
            <div className="px-3 py-2 bg-slate-50 border-t border-navy/10 flex flex-wrap gap-1.5 text-[10px]">
              {config.suggestions.map((suggestionText, idx) => {
                if (!suggestionText.trim()) return null;
                // Generate label safely
                let label = suggestionText;
                if (label.length > 22) {
                  label = label.substr(0, 20) + "...";
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(suggestionText)}
                    className="bg-white border border-navy/15 text-navy hover:text-gold hover:border-gold px-2 py-1 text-[9px] tracking-tight transition cursor-pointer"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Message form entry footer */}
          <form 
            onSubmit={handleSubmit}
            className="border-t-2 border-navy bg-white p-3 flex items-center space-x-2"
          >
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your consult inquiry..."
              className="flex-1 bg-[#fdfcf9] border border-navy/15 text-xs text-navy px-3 py-2 focus:outline-none focus:border-gold placeholder:text-navy/40"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-navy hover:bg-[#001736] disabled:opacity-40 text-gold transition cursor-pointer"
              title="Send Inquiry"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
