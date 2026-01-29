
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaneTakeoff, Plus, Calendar, MapPin, X, Info, ChevronRight } from 'lucide-react';
import { LeaveRequest } from '../types';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useUI } from '../App';
import { leavesAPI } from '../utils/api';

const LeaveRequestPage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDetails, setActiveDetails] = useState<LeaveRequest | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showToast } = useUI();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [formData, setFormData] = useState({
    reason: '',
    type: 'Home Visit',
    outDate: '',
    inDate: '',
    outTime: '',
    inTime: ''
  });

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await leavesAPI.getMy();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load outing requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await leavesAPI.create(formData);
      if (response.success) {
        showToast('Outing pass application submitted successfully!');
        setModalOpen(false);
        setFormData({
          reason: '',
          type: 'Home Visit',
          outDate: '',
          inDate: '',
          outTime: '',
          inTime: ''
        });
        loadLeaveRequests(); // Reload requests
      } else {
        showToast(response.message || 'Failed to submit outing request', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to submit outing request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (req: LeaveRequest) => {
    try {
      setCancellingId(req.id);
      const response = await leavesAPI.cancel(req.id);
      if (response.success) {
        showToast('Outing request cancelled successfully!', 'success');
        await loadLeaveRequests();
      } else {
        showToast(response.message || 'Failed to cancel outing request', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to cancel outing request', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-100';
      case 'Cancelled': return 'text-slate-600 bg-slate-50 border-slate-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Outing Pass Records</h2>
          <p className="text-slate-500 font-medium mt-1">Apply for and track your campus exit permissions</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Apply for Outing</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 rounded-3xl p-6 mb-10 flex gap-5"
      >
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
          <Info size={24} />
        </div>
        <div>
          <p className="text-sm text-indigo-900 leading-relaxed font-semibold mb-1">Hostel Outing Policy</p>
          <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
            Local outing applications must be submitted 4 hours in advance. For Home Visits exceeding 3 days, Parent Approval is mandatory via the registered phone number.
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)}
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ x: 4 }}
              className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{req.id}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl mb-6 group-hover:text-indigo-600 transition-colors">{req.reason}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Validity</p>
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(req.outDate).toLocaleDateString()} - {new Date(req.inDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outing Category</p>
                        <p className="text-sm font-bold text-slate-700">{req.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-6 sm:pt-0 sm:border-l border-slate-100 sm:pl-8">
                  <button
                    onClick={() => setActiveDetails(req)}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl text-sm transition-all border border-transparent hover:border-slate-200"
                  >
                    Details
                  </button>
                  {req.status === 'Pending' && (
                    <button
                      onClick={() => handleCancel(req)}
                      disabled={cancellingId === req.id}
                      className="flex-1 sm:flex-none px-5 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl text-sm transition-all border border-transparent hover:border-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {cancellingId === req.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No Past Outing Passes" 
          description="You haven't applied for an outing pass yet. Use the 'Apply for Outing' button to start your first application."
          icon={<PlaneTakeoff size={40} />}
        />
      )}

      <AnimatePresence>
        {activeDetails && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetails(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Outing Request Details</h3>
                  <p className="text-slate-500 font-medium mt-1 text-sm">{activeDetails.id}</p>
                </div>
                <button onClick={() => setActiveDetails(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-slate-800">{activeDetails.status}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-slate-800">{activeDetails.type}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Out Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(activeDetails.outDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(activeDetails.inDate).toLocaleDateString()}</p>
                </div>
                {activeDetails.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Rejection Reason</p>
                    <p className="text-sm text-red-800 font-medium">{activeDetails.rejectionReason}</p>
                  </div>
                )}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reason</p>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{activeDetails.reason}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
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
              className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-10 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for Outing Pass</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Out-Time Date</label>
                    <input
                      required
                      name="outDate"
                      type="date"
                      value={formData.outDate}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">In-Time Date</label>
                    <input
                      required
                      name="inDate"
                      type="date"
                      value={formData.inDate}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Out Time (Optional)</label>
                    <input
                      name="outTime"
                      type="time"
                      value={formData.outTime}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">In Time (Optional)</label>
                    <input
                      name="inTime"
                      type="time"
                      value={formData.inTime}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Purpose of Outing</label>
                  <select
                    required
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none"
                  >
                    <option value="">Select Purpose...</option>
                    <option value="Home Visit">Home Visit</option>
                    <option value="Local Coaching/Classes">Local Coaching/Classes</option>
                    <option value="Medical Checkup">Medical Checkup</option>
                    <option value="Local Market/Personal">Local Market/Personal</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reason (In Detail)</label>
                  <textarea
                    required
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Provide specific details for the warden's review..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                  ></textarea>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Outing Request'}
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

export default LeaveRequestPage;
