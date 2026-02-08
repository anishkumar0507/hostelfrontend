import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Users } from 'lucide-react';
import { chatAPI } from '../../utils/api';
import { useUI } from '../../App';

const WardenChat: React.FC = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useUI();

  const fetchChats = async () => {
    try {
      const res = await chatAPI.getWardenChats();
      if (res.success && res.data) setChats(res.data);
    } catch {
      showToast('Failed to load chats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChat = async (chatId: string) => {
    setLoadingChat(true);
    try {
      const res = await chatAPI.getWardenChatById(chatId);
      if (res.success && res.data) setSelectedChat(res.data);
    } catch {
      showToast('Failed to load chat', 'error');
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchChat(selectedChatId);
    } else {
      setSelectedChat(null);
    }
  }, [selectedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || isSending) return;
    setIsSending(true);
    try {
      await chatAPI.wardenSendMessage(selectedChat.id, message.trim());
      setMessage('');
      fetchChat(selectedChat.id);
    } catch (e: any) {
      showToast(e.message || 'Failed to send', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />;
  }

  const renderChatPane = () => {
    if (!selectedChatId) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a conversation</p>
          </div>
        </div>
      );
    }

    if (loadingChat || !selectedChat) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p>Loading chat...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="font-bold text-white">{selectedChat.parent?.name}</p>
            <p className="text-xs text-slate-500">Re: {selectedChat.student?.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(selectedChat.messages || []).map((m: any) => (
            <div key={m.id} className={`flex ${m.senderRole === 'warden' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                m.senderRole === 'warden' ? 'bg-emerald-500 text-white' : 'bg-slate-700/60 text-slate-200'
              }`}>
                <p className="text-xs opacity-80 mb-1">{m.senderName}</p>
                <p>{m.text}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-700 flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" disabled={!message.trim() || isSending} className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl">
            <Send size={20} />
          </button>
        </form>
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-extrabold text-white">Parent Chats</h2>
      <p className="text-slate-400">One-to-one chat with parents. Linked to student.</p>

      <div className="flex flex-col md:flex-row gap-6 h-[500px]">
        <div className="w-full md:w-80 bg-slate-800/50 rounded-[28px] border border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-bold text-white">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm">No chats yet</p>
            ) : (
              chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChatId(c.id)}
                  className={`w-full p-4 text-left border-b border-slate-700/50 hover:bg-white/5 transition-colors ${
                    selectedChatId === c.id ? 'bg-emerald-500/20' : ''
                  }`}
                >
                  <p className="font-bold text-white">{c.parent?.name || 'Parent'}</p>
                  <p className="text-xs text-slate-500">{c.student?.name} • Room {c.student?.room || 'N/A'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-800/50 rounded-[28px] border border-slate-700 overflow-hidden flex flex-col">
          {renderChatPane()}
        </div>
      </div>
    </div>
  );
};

export default WardenChat;
