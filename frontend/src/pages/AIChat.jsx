import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, RefreshCw, Sparkles } from 'lucide-react';
import { aiAPI } from '../api';
import { Card, Badge } from '../components/ui';
import { useAuthStore } from '../store';
import { v4 as uuid } from 'uuid';

const QUICK_PROMPTS = [
  'Can I afford a new iPhone 15?',
  'Where should I invest my first ₹10,000?',
  'How much should I save for retirement?',
  'Is my expense ratio healthy?',
  'Explain index funds in simple terms',
  'What is a good emergency fund size for me?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-glow-blue">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-surface-700 text-white/85 border border-white/8 rounded-tl-sm'
      }`}>
        {msg.content.split('\n').map((line, i) => (
          <p key={i} className={line.startsWith('•') || line.startsWith('-') ? 'ml-2 my-0.5' : ''}>
            {line || <br />}
          </p>
        ))}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-surface-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white/60" />
        </div>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-surface-700 border border-white/8 rounded-tl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-brand-400"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIChat() {
  const [sessionId] = useState(() => uuid());
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your StockSense AI financial advisor 👋\n\nI can help you with:\n• Budget planning & optimization\n• Investment suggestions for beginners\n• Understanding stocks & mutual funds\n• Goal planning & savings strategies\n\nAsk me anything — I'll explain in simple terms!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = useMutation({
    mutationFn: ({ message }) => aiAPI.chat(message, sessionId),
    onMutate: ({ message }) => {
      setMessages((prev) => [...prev, { role: 'user', content: message }]);
      setTyping(true);
      setInput('');
    },
    onSuccess: (res) => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    },
    onError: () => {
      setTyping(false);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again in a moment.',
      }]);
    },
  });

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMessage.isPending) return;
    sendMessage.mutate({ message: msg });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <Card className="p-4 mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-blue">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">StockSense AI Advisor</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse-slow" />
              <span className="text-success-400 text-xs">Online · Powered by Gemini</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="blue"><Sparkles className="w-3 h-3" /> AI Powered</Badge>
        </div>
      </Card>

      {/* Messages */}
      <Card className="flex-1 p-5 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </Card>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-3">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => setInput(p)}
            className="text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/50 hover:text-white hover:border-brand-500/40 hover:bg-brand-500/10 transition-all">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <Card className="p-3 flex gap-3 items-end flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask anything about your finances..."
          className="flex-1 bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm py-2 max-h-32 overflow-y-auto"
          style={{ lineHeight: '1.5' }}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            input.trim() && !sendMessage.isPending
              ? 'bg-brand-600 hover:bg-brand-500 shadow-glow-blue text-white'
              : 'bg-surface-600 text-white/30'
          }`}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </Card>

      <p className="text-center text-white/20 text-xs mt-2">
        For educational purposes only. Not SEBI-registered financial advice.
      </p>
    </div>
  );
}
