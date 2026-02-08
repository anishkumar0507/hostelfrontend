import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { chatAPI } from '../../utils/api';
import { useUI } from '../../App';

const Chat: React.FC = () => {
  const [chat, setChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useUI();

  const fetch = async () => {
    try {
      const res = await chatAPI.getMyChat();
      if (res.success && res.data) setChat(res.data);
    } catch {
      showToast('Failed to load chat', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      await chatAPI.sendMessage(message.trim());
      setMessage('');
      fetch();
    } catch (e: any) {
      showToast(e.message || 'Failed to send', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />;
  }

  const messages = chat?.messages || [];
  const wardenName = chat?.warden?.name || 'Warden';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-extrabold text-white">Chat with Warden</h2>
      <p className="text-emerald-300/80">One-to-one chat regarding your child. Linked to student: {chat?.studentId ? 'Yes' : 'N/A'}</p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-800/40 rounded-[40px] border border-emerald-700 overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
        <div className="p-4 border-b border-emerald-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="text-white font-bold">{wardenName}</p>
            <p className="text-emerald-300/80 text-xs">Hostel Warden</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-80">
          {messages.length === 0 ? (
            <p className="text-emerald-300/80 text-center py-8">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex ${m.senderRole === 'parent' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  m.senderRole === 'parent' ? 'bg-emerald-500 text-white' : 'bg-emerald-800/60 text-emerald-100'
                }`}>
                  <p className="text-xs opacity-80 mb-1">{m.senderName}</p>
                  <p>{m.text}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-emerald-700 flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-emerald-900/50 border border-emerald-700 rounded-xl px-4 py-3 text-white placeholder-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl"
          >
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Chat;
