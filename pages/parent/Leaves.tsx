import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaneTakeoff, Check, X } from 'lucide-react';
import { parentAPI } from '../../utils/api';
import { leavesAPI } from '../../utils/api';
import { useUI } from '../../App';

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { showToast } = useUI();

  const fetch = async () => {
    try {
      const res = await parentAPI.getChildLeaves();
      if (res.success && res.leaves) setLeaves(Array.isArray(res.leaves) ? res.leaves : []);
    } catch {
      showToast('Failed to load outing requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id: string) => {
    if (processingIds.has(id)) return;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const res = await leavesAPI.parentApproval(id, { status: 'Approved' });
      if (res.success) {
        showToast('Outing request approved', 'success');
        fetch();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to approve', 'error');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    if (processingIds.has(id)) return;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const res = await leavesAPI.parentApproval(id, { status: 'Rejected', rejectionReason: reason || 'Rejected by parent' });
      if (res.success) {
        showToast('Outing request rejected', 'success');
        fetch();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to reject', 'error');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PendingParent: 'bg-amber-500/30 text-amber-200',
      ApprovedByParent: 'bg-emerald-500/30 text-emerald-200',
      RejectedByParent: 'bg-red-500/20 text-red-200',
      Approved: 'bg-emerald-500/30 text-emerald-200',
      Rejected: 'bg-red-500/20 text-red-200',
      Cancelled: 'bg-slate-500/20 text-slate-300',
    };
    return map[status] || 'bg-slate-500/20 text-slate-300';
  };

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Outing Requests</h2>
      <p className="text-emerald-300/80">Approve or reject your child's outing requests. Warden will only see parent-approved requests.</p>

      <div className="space-y-6">
        {leaves.length === 0 ? (
          <p className="text-emerald-300/80 p-8 bg-emerald-800/40 rounded-[28px] border border-emerald-700">No outing requests</p>
        ) : (
          leaves.map((leave) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-emerald-800/40 rounded-[28px] border border-emerald-700 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold">{leave.reason}</p>
                  <p className="text-emerald-300/80 text-sm">
                    {leave.type} • {new Date(leave.outDate).toLocaleDateString()} - {new Date(leave.inDate).toLocaleDateString()}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                {leave.status === 'PendingParent' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      disabled={processingIds.has(leave.id)}
                      className={`flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl ${processingIds.has(leave.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <Check size={18} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      disabled={processingIds.has(leave.id)}
                      className={`flex items-center gap-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 text-red-200 font-bold rounded-xl ${processingIds.has(leave.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaves;
