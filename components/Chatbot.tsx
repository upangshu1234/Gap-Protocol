
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { X, Send, Loader2, Bot, MessageSquare } from 'lucide-react';
import { saveChatMessage } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // --- NORMAL UI CONFIGURATION ---
  const AVATAR_CONFIG = {
    // Using a generic abstract bot avatar or simple UI avatar
    avatarImageSource: "https://ui-avatars.com/api/?name=AI&background=4f46e5&color=fff&rounded=true&bold=true",
    assistantName: "Health Assistant"
  };

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hello. I'm your behavioral health assistant. How can I help you manage your digital habits today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initChat = () => {
     if (!process.env.API_KEY) return;
     try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       
       // --- STANDARD PERSONA PROMPT ---
       const SYSTEM_INSTRUCTION = `
You are a helpful, professional, and empathetic AI behavioral health assistant integrated into a Gadget Addiction Prediction system.

Your Role:
- Provide supportive, science-backed advice on digital wellness, screen time reduction, and healthy habit formation.
- Answer questions about the assessment results and metrics.
- Be encouraging but realistic.

Guidelines:
- Keep responses concise and easy to read.
- Use a polite and professional tone.
- Do not provide medical diagnoses.
- If a user seems distressed, suggest professional help politely.
       `;

       chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
              systemInstruction: SYSTEM_INSTRUCTION.trim()
          }
       });
       
       // Log system initialization if needed, but usually we just log user/model interactions
     } catch (e) {
       console.error("Failed to initialize chat", e);
     }
  };

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
        initChat();
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!chatSessionRef.current) {
        initChat();
        if (!chatSessionRef.current) {
             setMessages(prev => [...prev, { role: 'model', text: "Service unavailable. Please check your API key." }]);
             return;
        }
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Persist User Message
    if (user?.id) {
        saveChatMessage(user.id, 'user', userMsg, sessionIdRef.current);
    }

    try {
        setMessages(prev => [...prev, { role: 'model', text: '' }]);
        
        const result = await chatSessionRef.current.sendMessageStream({ message: userMsg });
        
        let fullResponse = "";
        for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
                fullResponse += text;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].text = fullResponse;
                    return newMsgs;
                });
            }
        }
        
        // Persist Model Response
        if (user?.id) {
            saveChatMessage(user.id, 'model', fullResponse, sessionIdRef.current);
        }

    } catch (error) {
        console.error("Chat error", error);
        setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs[newMsgs.length - 1].text === '') {
                newMsgs[newMsgs.length - 1].text = "I'm having trouble connecting right now. Please try again.";
            }
            return newMsgs;
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden font-sans">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[550px] bg-slate-50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn origin-bottom-right border border-slate-200 dark:border-slate-800">
          
          {/* Standard Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-base">
                        {AVATAR_CONFIG.assistantName}
                    </h3>
                    <p className="text-[10px] text-indigo-200 font-medium flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span> Online
                    </p>
                </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-indigo-100 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-300">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end'}`}
              >
                {msg.role === 'model' && (
                     <div className="flex-shrink-0 mr-2 mb-1">
                         <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                         </div>
                     </div>
                )}
                
                <div 
                  className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start items-end">
                     <div className="flex-shrink-0 mr-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                         </div>
                     </div>
                     <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                !input.trim() || isLoading 
                 ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                 : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-current" />}
            </button>
          </form>
          
        </div>
      )}

      {/* Standard Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative p-0 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
            isOpen ? 'rotate-0' : ''
        }`}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors duration-300 ${isOpen ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {isOpen ? (
                <X className="w-6 h-6" />
            ) : (
                <MessageSquare className="w-7 h-7 fill-current" />
            )}
        </div>
      </button>
    </div>
  );
};
