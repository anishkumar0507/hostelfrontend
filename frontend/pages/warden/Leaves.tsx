
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Check, X, Calendar, User, MapPin, RefreshCw } from 'lucide-react';
import { leavesAPI } from '../../utils/api';
import { useUI } from '../../App';
import { LeaveRequest } from '../../types';

const WardenLeaves: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previousCount, setPreviousCount] = useState(0);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useUI();

  useEffect(() => {
    loadLeaveRequests();

    // Poll for new leave requests every 10 seconds
    const interval = setInterval(() => {
      loadLeaveRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadLeaveRequests = async () => {
    try {
      const response = await leavesAPI.getAll({ status: 'ApprovedByParent' });
      if (response.success) {
        const newRequests = response.data;
        const newCount = newRequests.length;

        // Show notification if new requests were added
        if (!isLoading && newCount > previousCount) {
          const newItems = newCount - previousCount;
          showToast(`${newItems} new outing request${newItems > 1 ? 's' : ''} received!`, 'success');
        }

        setRequests(newRequests);
        setPreviousCount(newCount);
      }
    } catch (error) {
      if (!isLoading) {
        showToast('Failed to refresh outing requests', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setProcessing = (requestId: string, isProcessing: boolean) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (isProcessing) {
        next.add(requestId);
      } else {
        next.delete(requestId);
      }
      return next;
    });
  };

  const handleStatusUpdate = async (requestId: string, status: string, rejectionReason?: string) => {
    if (processingIds.has(requestId)) {
      return;
    }
    setProcessing(requestId, true);
    try {
      const response = await leavesAPI.updateStatus(requestId, { status, rejectionReason });
      if (response.success) {
        showToast(`Outing request ${status.toLowerCase()} successfully`);
        loadLeaveRequests(); // Reload requests
      } else {
        showToast(response.message || `Failed to ${status.toLowerCase()} request`);
      }
    } catch (error: any) {
      showToast(error?.message || `Failed to ${status.toLowerCase()} request`, 'error');
    } finally {
      setProcessing(requestId, false);
    }
  };

  const handleDownloadReport = async () => {
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    try {
      const { blob, fileName } = await leavesAPI.exportOutingReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Outing report downloaded', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Failed to download outing report', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Outing Pass Approvals</h2>
          <p className="text-slate-400 font-medium">Review parent-approved outing requests (3-step: Student → Parent → Warden)</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-3.5 bg-emerald-600/20 text-emerald-200 hover:text-white border border-emerald-500/30 rounded-2xl font-bold transition-all hover:bg-emerald-600/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Preparing...' : 'Download Outing Report'}
          </button>
          <button
            onClick={loadLeaveRequests}
            className="flex items-center gap-2 px-4 py-3.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl font-bold transition-all hover:bg-slate-700"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <div className="px-6 py-3 bg-indigo-500/10 text-indigo-400 rounded-[20px] font-bold text-sm border border-indigo-500/20">Pending: {requests.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-[40px] border border-slate-700 p-8 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? requests.map((req, i) => (
          <motion.div key={req.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-slate-800/50 rounded-[40px] border border-slate-700 overflow-hidden shadow-sm transition-all group">
            <div className="p-8 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center text-indigo-400"><PlaneTakeoff size={24} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{req.id}</p>
                  <p className="text-sm font-extrabold text-white">{req.type}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Parent Approved</span>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-900 rounded-xl text-slate-500 border border-slate-700"><User size={20} /></div>
                <div><p className="text-[10px] font-bold text-slate-600 uppercase mb-0.5 tracking-tighter">Student</p><p className="font-bold text-white">{req.student?.name || 'Unknown'} (Room {req.student?.room || 'N/A'})</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-900 rounded-xl text-slate-500 border border-slate-700"><Calendar size={20} /></div>
                <div><p className="text-[10px] font-bold text-slate-600 uppercase mb-0.5 tracking-tighter">Outing Period</p><p className="font-bold text-white">{new Date(req.outDate).toLocaleDateString()} to {new Date(req.inDate).toLocaleDateString()}</p></div>
              </div>
              <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-700 shadow-inner">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Reason for Outing</p>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">"{req.reason}"</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleStatusUpdate(req.id, 'Approved')}
                  disabled={processingIds.has(req.id)}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-[20px] shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Check size={20} /> Approve Pass
                </button>
                <button
                  onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                  disabled={processingIds.has(req.id)}
                  className="flex-1 py-4 bg-slate-900 text-slate-400 font-bold rounded-[20px] hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <X size={20} /> Reject
                </button>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-800/40 rounded-[40px] border border-slate-700 border-dashed">
            <PlaneTakeoff className="mx-auto text-slate-700 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-slate-400">No pending outing requests</h3>
            <p className="text-slate-600 mt-2 font-medium">All requests have been processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenLeaves;
