
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, Clock, Search, MessageSquare, Download, RefreshCw } from 'lucide-react';
import { exportComplaintReport } from '../../components/PDFGenerator';
import { useUI } from '../../App';
import { complaintsAPI } from '../../utils/api';
import { Complaint } from '../../types';

const WardenComplaints: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousCount, setPreviousCount] = useState(0);
  const { showToast } = useUI();

  useEffect(() => {
    loadComplaints();

    // Poll for new complaints every 10 seconds
    const interval = setInterval(() => {
      loadComplaints();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      if (response.success) {
        const newComplaints = response.data;
        const newCount = newComplaints.length;

        // Show notification if new complaints were added
        if (!isLoading && newCount > previousCount) {
          const newItems = newCount - previousCount;
          showToast(`${newItems} new complaint${newItems > 1 ? 's' : ''} received!`, 'success');
        }

        setComplaints(newComplaints);
        setPreviousCount(newCount);
      }
    } catch (error) {
      if (!isLoading) {
        showToast('Failed to refresh complaints', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: string, status: string) => {
    try {
      const response = await complaintsAPI.updateStatus(complaintId, { status });
      if (response.success) {
        showToast(`Complaint ${status.toLowerCase()} successfully`);
        loadComplaints(); // Reload complaints
      } else {
        showToast(response.message || `Failed to ${status.toLowerCase()} complaint`);
      }
    } catch (error) {
      showToast('Failed to update complaint status', 'error');
    }
  };

  const filtered = complaints.filter(c => c.status === activeTab);

  const handleExport = () => {
    exportComplaintReport(complaints);
    showToast('Support report downloaded successfully.');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Student Complaints</h2>
          <p className="text-slate-400 font-medium">Review and assign maintenance tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={loadComplaints}
            className="flex items-center gap-2 px-4 py-3.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl font-bold transition-all hover:bg-slate-700"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl font-bold transition-all"
          >
            <Download size={20} />
            Download Report
          </button>
          <div className="flex p-1.5 bg-slate-800 border border-slate-700 rounded-[20px] shadow-sm">
            {['Pending', 'Resolved', 'Rejected'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-[14px] font-bold text-sm transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-[32px] border border-slate-700 p-8 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-slate-800/50 rounded-[32px] border border-slate-700 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 group transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">{c.id}</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-tighter"><Clock size={14} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                <span className="px-3 py-1 bg-slate-900 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-700">{c.category}</span>
                {c.priority && (
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                    c.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    c.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>{c.priority}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{c.title}</h3>
              <p className="text-slate-400 text-sm font-medium">
                Reported by <span className="text-white font-bold">{c.student?.name || 'Unknown'}</span> in Room <span className="text-white font-bold">{c.student?.room || 'N/A'}</span>
              </p>
              <p className="text-slate-500 text-sm mt-2">{c.description}</p>
            </div>

            <div className="flex items-center gap-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-700 md:pl-8 shrink-0">
              {c.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => handleStatusUpdate(c.id, 'Resolved')}
                    className="flex-1 md:flex-none p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-500/20"
                    title="Resolve"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(c.id, 'Rejected')}
                    className="flex-1 md:flex-none p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-500/20"
                    title="Reject"
                  >
                    <XCircle size={24} />
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(c.id, 'In Progress')}
                    className="flex-1 md:flex-none p-4 bg-slate-900 text-slate-500 rounded-2xl hover:bg-slate-700 hover:text-white transition-all shadow-sm border border-slate-700"
                    title="Mark In Progress"
                  >
                    <MessageSquare size={24} />
                  </button>
                </>
              ) : (
                <span className={`flex items-center gap-2 font-bold px-5 py-3 rounded-2xl border ${
                  c.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  c.status === 'Rejected' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                  'text-blue-400 bg-blue-500/10 border-blue-500/20'
                }`}>
                  <CheckCircle size={20} /> {c.status}
                </span>
              )}
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center bg-slate-800/40 rounded-[40px] border border-slate-700 border-dashed">
            <ClipboardList className="mx-auto text-slate-700 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-slate-400">No complaints in {activeTab.toLowerCase()}</h3>
            <p className="text-slate-600 mt-2 font-medium">Everything is running smoothly right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenComplaints;
