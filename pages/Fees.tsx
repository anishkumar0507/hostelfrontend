
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, ExternalLink, ShieldCheck, Check, Info, ArrowRight } from 'lucide-react';
import { PaymentStatus } from '../types';
import { Skeleton } from '../components/Skeleton';
import { PaymentModal } from '../components/PaymentModal';
import { useUI } from '../App';
import { generateFeeReceipt } from '../components/PDFGenerator';
import { feesAPI } from '../utils/api';
import { EmptyState } from '../components/EmptyState';
import { studentsAPI } from '../utils/api';

const Fees: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const { showToast } = useUI();

  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await feesAPI.getAll();
        if (response.success && response.data) {
          setFeeRecords(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        showToast((error as any)?.message || 'Failed to fetch fees', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFees();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await studentsAPI.getProfile();
        if (response.success && response.data) setProfile(response.data);
      } catch {
        // Profile is optional for fee screen; ignore
      }
    };
    fetchProfile();
  }, []);

  const currentDues = feeRecords
    .filter((f) => f.status === PaymentStatus.PENDING || f.status === 'Pending')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const handlePaySuccess = async () => {
    // Refresh fees after payment
    try {
      const response = await feesAPI.getAll();
      if (response.success && response.data) {
        setFeeRecords(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      showToast((error as any)?.message || 'Failed to refresh fees', 'error');
    }
    showToast('Payment recorded successfully.', 'success');
  };

  const handleDownloadReceipt = (record: any) => {
    generateFeeReceipt({
      id: record._id || record.receiptNumber || 'N/A',
      name: profile?.userId?.name || 'N/A',
      room: profile?.room ? `Room ${profile.room}` : 'N/A',
      month: record.term || 'N/A',
      amount: record.amount || 0
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-96 rounded-[32px]" />
          <Skeleton className="h-96 rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-10 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Outstanding Arrears</p>
              <h2 className="text-5xl font-extrabold tracking-tight">₹{currentDues.toLocaleString('en-IN')}</h2>
            </div>
            <div className="relative z-10">
              {currentDues > 0 ? (
                <button 
                  onClick={() => setPayModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[24px] font-extrabold shadow-xl shadow-indigo-900/40 flex items-center gap-3 transition-all active:scale-95"
                >
                  Pay Fees Online
                  <ArrowRight size={20} />
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                  <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-sm font-extrabold uppercase tracking-tight">Fee Account Clear</p>
                    <p className="text-slate-400 text-xs font-medium">All fees cleared</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-10 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Hostel & Mess Fee History</h3>
              <button
                type="button"
                onClick={() => showToast('Statement generation will be available soon.', 'error')}
                className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                <Download size={14} />
                Generate Statement
              </button>
            </div>
            {feeRecords.length === 0 ? (
              <EmptyState
                title="No Fee Records"
                description="Your fee records will appear here once they are added by the warden."
                icon={<CreditCard size={40} className="text-slate-300" />}
              />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="px-2 pb-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Transaction No</th>
                      <th className="px-2 pb-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Term</th>
                      <th className="px-2 pb-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Amount</th>
                      <th className="px-2 pb-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status</th>
                      <th className="px-2 pb-5 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {feeRecords.map((record, i) => (
                    <motion.tr 
                      key={record._id || record.receiptNumber || i} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-2 py-6">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200">
                          {record._id?.slice(-8) || record.receiptNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 py-6">
                        <p className="text-sm font-bold text-slate-800">{record.term || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {record.paidAt ? `Paid on: ${new Date(record.paidAt).toLocaleDateString('en-IN')}` : 'Pending'}
                        </p>
                      </td>
                      <td className="px-2 py-6 font-extrabold text-slate-900">₹{(record.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-2 py-6">
                        {record.status === 'Paid' || record.status === PaymentStatus.PAID ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                            <Check size={12} strokeWidth={3} />
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-wider">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-6 text-right">
                        {(record.status === 'Paid' || record.status === PaymentStatus.PAID) && (
                          <button 
                            onClick={() => handleDownloadReceipt(record)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm hover:shadow active:scale-90" 
                          >
                            <Download size={18} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8"
          >
            <h3 className="font-bold text-slate-800 text-lg mb-4">Quick Payment</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              Clear your hostel and mess dues instantly via UPI, NetBanking, or Debit/Credit Cards.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-5 border-2 border-indigo-600 bg-indigo-50 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white overflow-hidden shadow-sm">
                    <span className="text-[10px] font-extrabold italic">PAY</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">Use “Clear Current Arrears”</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                </div>
              </div>
            </div>
            {currentDues === 0 ? (
               <button className="w-full py-4.5 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed uppercase text-xs tracking-widest">
                Account in Credit
              </button>
            ) : (
              <button 
                onClick={() => setPayModalOpen(true)}
                className="w-full py-4.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest"
              >
                Clear Current Arrears
              </button>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white shadow-2xl shadow-indigo-100 group relative overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mb-20 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <CreditCard className="mb-6 text-indigo-200 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-xl mb-3">Fee Reminders</h3>
            <p className="text-indigo-100 text-sm mb-8 leading-relaxed font-medium">
              Maintain an active payment profile to avoid late-fine penalties and ensure seamless mess access.
            </p>
            <button
              type="button"
              onClick={() => showToast('Fee structure view is not configured yet.', 'error')}
              className="flex items-center justify-center gap-3 w-full py-4 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl font-bold transition-all text-sm backdrop-blur-sm"
            >
              View Fee Structure
              <ExternalLink size={16} />
            </button>
          </motion.div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPayModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={handlePaySuccess}
        amount={currentDues}
      />
    </div>
  );
};

export default Fees;
