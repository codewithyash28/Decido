
import React, { useState, useRef, useEffect } from 'react';
import { chatWithDecido } from '../geminiService';
import { ChatMessage } from '../types';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await chatWithDecido([...messages, userMsg]);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error communicating with logic core.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-emerald-500 transition-all hover:scale-110"
        >
          <i className="fa-solid fa-comments text-xl"></i>
        </button>
      )}

      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl animate-fadeIn overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <span className="text-sm font-bold tracking-widest text-emerald-400">LOGIC CHAT</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-10 italic">
                Awaiting input. Ask about the reasoning engine or decision metrics.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-xl flex gap-1 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Query reasoning engine..."
              className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button onClick={handleSend} className="bg-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-emerald-500">
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
