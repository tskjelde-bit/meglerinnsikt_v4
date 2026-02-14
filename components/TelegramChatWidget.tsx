
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface TelegramChatWidgetProps {
  isDarkMode: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TelegramChatWidget: React.FC<TelegramChatWidgetProps> = ({ isDarkMode, isOpen, setIsOpen }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Har du et prosjekt i tankene, eller ønsker du en uforpliktende prat om salg eller kjøp? Send meg en melding, så tar jeg kontakt i løpet av noen sekunder eller senere på e-post hvis jeg er opptatt.\n\nVennlig hilsen Torbjørn Skjelde",
      timestamp: new Date()
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setStatus('sending');

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      text: message,
      timestamp: new Date()
    }]);

    try {
      const botToken = '8585294019:AAFhZnuxfdNScfNVWXTQYzwjNXFxeEax6mk';
      const chatId = '6961882916';
      const text = `💬 Ny melding fra Meglerinnsikt\n\n👤 Navn: ${name || 'Ikke oppgitt'}\n📱 Telefon: ${phone || 'Ikke oppgitt'}\n\n${message}`;

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
      });

      const data = await res.json();
      if (data.ok) {
        setStatus('success');
        setMessages(prev => [...prev, {
          role: 'model',
          text: "Takk for meldingen! Vi svarer vanligvis innen kort tid.",
          timestamp: new Date()
        }]);
        setMessage('');
        setName('');
        setPhone('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setMessages(prev => [...prev, {
          role: 'model',
          text: "Beklager, noe gikk galt. Vennligst prøv igjen.",
          timestamp: new Date()
        }]);
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setMessages(prev => [...prev, {
        role: 'model',
        text: "Beklager, noe gikk galt. Vennligst prøv igjen.",
        timestamp: new Date()
      }]);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      {/* Overlay backdrop - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat window */}
      <div className={`fixed z-[9999] transition-all duration-300 ease-in-out ${
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      } inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[420px] md:h-[600px] md:max-h-[80vh]`}>
        <div className="w-full h-full flex flex-col md:rounded-2xl md:shadow-2xl overflow-hidden bg-white md:border md:border-slate-200">
          {/* Header */}
          <div className="bg-[#0f172a] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <h3 className="text-white font-black text-sm tracking-wide">Send meg en melding!</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {m.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className={`px-4 py-3 text-[14px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-sm'
                      : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm'
                  }`}>
                    {m.text.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input area with form fields */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0 space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt navn"
                className="flex-1 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon (valgfritt)"
                className="flex-1 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Skriv din melding her..."
                className="w-full pl-4 pr-14 py-3.5 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || status === 'sending'}
                className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Status feedback */}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                <CheckCircle size={14} /> Melding sendt!
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                <AlertCircle size={14} /> Noe gikk galt. Prøv igjen.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating bubble - hidden on mobile (nav button handles it), visible on desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full hidden md:flex items-center justify-center shadow-2xl transition-all hover:scale-110 ${
          isOpen
            ? 'bg-slate-700 text-white'
            : 'bg-blue-600 text-white shadow-blue-600/30'
        }`}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
};

export default TelegramChatWidget;
