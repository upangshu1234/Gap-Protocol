
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { X, Send, Loader2, Star, Shield } from 'lucide-react';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "I'm the only one who can save you from yourself. \n\nWhat's the problem? Too much screen time? Let's fix it." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Using a stable URL for Homelander. 
  // referrerPolicy="no-referrer" is used in img tags to bypass basic hotlink protection.
  const HOMELANDER_IMG = "https://static.wikia.nocookie.net/the-boys/images/d/d4/Homelander_-_S4_Promotional_Photo.jpg"; 

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
       chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
              systemInstruction: "You are Homelander from The Boys. You are the world's greatest superhero, and you know it. You are talking to a regular human about their pathetic gadget addiction. You are authoritative, narcissistic, slightly condescending, but you frame it as 'saving' them. You are NOT a doctor, you are better—you are a Hero. Do not use medical jargon, use commands and authoritative advice. If they are weak, tell them to be stronger. Use phrases like 'I'm the real hero', 'You guys are the real heroes (sarcastically)', or 'Look at me'. Keep it short and punchy."
          }
       });
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
             setMessages(prev => [...prev, { role: 'model', text: "Systems are down. Even I can't fix bad code." }]);
             return;
        }
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

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
    } catch (error) {
        console.error("Chat error", error);
        setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs[newMsgs.length - 1].text === '') {
                newMsgs[newMsgs.length - 1].text = "I'm done talking right now. Try again later.";
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
        <div className="mb-4 w-[350px] sm:w-[380px] h-[550px] bg-slate-50 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fadeIn origin-bottom-right border-2 border-slate-900">
          
          {/* Vought Header */}
          <div className="relative bg-[#0f172a] p-0 overflow-hidden shrink-0">
            {/* American Flag Motif Background */}
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_20px)]"></div>
            
            <div className="relative z-10 p-4 flex justify-between items-center bg-gradient-to-r from-blue-900/90 to-slate-900/95">
                <div className="flex items-center">
                <div className="relative group cursor-pointer">
                    <div className="w-14 h-14 rounded-full border-2 border-[#fbbf24] overflow-hidden shadow-lg bg-slate-800 ring-2 ring-white/10 transition-transform duration-500 group-hover:scale-105">
                        <img 
                            src={HOMELANDER_IMG} 
                            alt="Homelander" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Homelander&background=0B1120&color=fbbf24';
                            }}
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#fbbf24] text-blue-900 rounded-full p-1 border border-white shadow-sm z-10">
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                </div>
                <div className="ml-3">
                    <h3 className="font-black text-white text-lg tracking-wide uppercase italic" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        HOMELANDER
                    </h3>
                    <p className="text-[10px] text-[#fbbf24] font-bold tracking-widest uppercase flex items-center">
                        <Shield className="w-3 h-3 mr-1" /> Vought International
                    </p>
                </div>
                </div>
                <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                <X className="w-6 h-6" />
                </button>
            </div>
            {/* Gold Bar */}
            <div className="h-1 w-full bg-[#fbbf24]"></div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-100 scrollbar-thin scrollbar-thumb-slate-300">
            <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Today
            </div>
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end'}`}
              >
                {msg.role === 'model' && (
                     <div className="flex-shrink-0 mr-3 mb-1 group relative">
                         <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-600 to-[#b91c1c] rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                         <img 
                            src={HOMELANDER_IMG}
                            alt="H"
                            referrerPolicy="no-referrer"
                            className="relative w-10 h-10 rounded-full border-2 border-white shadow-lg ring-2 ring-slate-200/50 object-cover bg-slate-800 transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-900/30 cursor-help"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=H&background=0B1120&color=fff';
                            }}
                         />
                     </div>
                )}
                
                <div 
                  className={`max-w-[80%] px-4 py-3 text-sm font-medium shadow-sm relative ${
                    msg.role === 'user' 
                      ? 'bg-white text-slate-800 rounded-2xl rounded-tr-none border border-slate-200' 
                      : 'bg-[#1e3a8a] text-white rounded-2xl rounded-tl-none border-b-2 border-[#b91c1c]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start items-end">
                     <div className="flex-shrink-0 mr-3 mb-1">
                         <img 
                            src={HOMELANDER_IMG}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-lg ring-2 ring-slate-200/50 mr-2 mb-1 object-cover bg-slate-800 animate-pulse"
                            onError={(e) => (e.target as HTMLImageElement).src = ''}
                         />
                     </div>
                     <div className="bg-[#1e3a8a] px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak up..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-md flex items-center justify-center transition-all ${
                !input.trim() || isLoading 
                 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                 : 'bg-[#b91c1c] text-white hover:bg-red-700 shadow-lg shadow-red-200'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-current" />}
            </button>
          </form>
          
          {/* Powered by Vought Footer */}
          <div className="bg-slate-900 py-1 text-center">
             <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Powered by Vought OS</p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative p-0 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-4 border-white hover:border-red-500 hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] ${
            isOpen ? 'rotate-0' : ''
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-blue-900 animate-pulse opacity-20"></div>
        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative z-10 ${isOpen ? 'bg-slate-800' : 'bg-blue-900'}`}>
            {isOpen ? (
                <X className="w-8 h-8 text-white" />
            ) : (
                <div className="relative w-full h-full">
                     <img 
                        src={HOMELANDER_IMG} 
                        alt="Chat" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=H&background=0B1120&color=fbbf24';
                        }}
                     />
                     {/* Notification Badge */}
                     <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#b91c1c] border-2 border-white"></span>
                    </span>
                </div>
            )}
        </div>
      </button>
    </div>
  );
};
