
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareWarning,
  Plus,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search
} from 'lucide-react';
import { Complaint } from '../types';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useUI } from '../App';
import { complaintsAPI } from '../utils/api';

const Complaints: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useUI();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Maintenance',
    priority: 'Medium'
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await complaintsAPI.getMy();
      if (response.success) {
        setComplaints(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load complaints', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await complaintsAPI.create(formData);
      if (response.success) {
        showToast('Complaint submitted successfully!');
        setModalOpen(false);
        setFormData({
          title: '',
          description: '',
          category: 'Maintenance',
          priority: 'Medium'
        });
        loadComplaints(); // Reload complaints
      } else {
        showToast(response.message || 'Failed to submit complaint');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to submit complaint', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredComplaints = complaints.filter(c =>
    (c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (c.id?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Complaints & Requests</h2>
          <p className="text-slate-500 font-medium mt-1">Track and report maintenance issues</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus size={20} />
          <span>New Complaint</span>
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder="Search by ID or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredComplaints.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase tracking-wider text-xs font-bold">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 mb-4 leading-relaxed line-clamp-2 font-medium">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.priority && (
                        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg uppercase tracking-wider">
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl transition-colors ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-500' : item.status === 'Rejected' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300'}`}>
                    {item.status === 'Resolved' ? <CheckCircle2 size={24} /> : item.status === 'Rejected' ? <X size={24} /> : <AlertCircle size={24} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState 
          title="No Complaints Yet" 
          description="You haven't submitted any complaints. Use the 'New Complaint' button above to report any issues."
          icon={<MessageSquareWarning size={40} />}
        />
      )}

      {/* New Complaint Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Raise New Complaint</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subject / Title</label>
                  <input
                    required
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g. Electrical Issue in Common Hall"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Food / Mess">Food / Mess</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
                  <textarea
                    required
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your issue in detail so we can fix it faster..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium"
                  ></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-4 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Complaints;
