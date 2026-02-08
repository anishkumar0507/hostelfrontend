import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import { parentAPI, paymentsAPI } from '../../utils/api';
import { useUI } from '../../App';
import { PaymentModal } from '../../components/PaymentModal';

const Fees: React.FC = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [child, setChild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const { showToast } = useUI();

  const fetchData = async () => {
    try {
      const [feesRes, childRes] = await Promise.all([parentAPI.getChildFees(), parentAPI.getChild()]);
      if (feesRes.success && feesRes.data) setFees(Array.isArray(feesRes.data) ? feesRes.data : []);
      if (childRes.success && childRes.data) setChild(childRes.data);
    } catch {
      showToast('Failed to load fees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const currentDues = fees.filter((f) => f.status === 'Pending' || f.status === 'pending').reduce((sum, f) => sum + (f.amount || 0), 0);

  const handlePaySuccess = () => {
    fetchData();
    setPayModalOpen(false);
    showToast('Payment recorded successfully', 'success');
  };

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Fee & Payment History</h2>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-800/50 rounded-[40px] border border-emerald-700 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-emerald-300/80 text-sm">Outstanding</p>
          <p className="text-4xl font-bold text-white">₹{currentDues.toLocaleString('en-IN')}</p>
        </div>
        {currentDues > 0 ? (
          <button
            onClick={() => setPayModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all"
          >
            Pay Fees <ArrowRight size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-500/20 p-4 rounded-2xl">
            <ShieldCheck className="text-emerald-400" size={28} />
            <span className="text-emerald-200 font-bold">All fees cleared</span>
          </div>
        )}
      </motion.div>

      <div className="bg-emerald-800/40 rounded-[40px] border border-emerald-700 overflow-hidden">
        <div className="p-6 border-b border-emerald-700">
          <h3 className="text-lg font-bold text-white">Payment History</h3>
        </div>
        <div className="divide-y divide-emerald-700/50">
          {fees.length === 0 ? (
            <p className="p-8 text-emerald-300/80">No fee records</p>
          ) : (
            fees.map((f) => (
              <div key={f._id} className="p-6 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-white font-bold">{f.term}</p>
                  <p className="text-emerald-300/80 text-sm">₹{f.amount?.toLocaleString('en-IN')} • {f.status}</p>
                  {f.paidBy && <p className="text-xs text-emerald-400">Paid by: {f.paidBy}</p>}
                </div>
                <div className="text-right">
                  <p className="text-emerald-300/80 text-sm">{f.receiptNumber || '-'}</p>
                  <p className="text-sm text-emerald-400">{f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PaymentModal
        isOpen={isPayModalOpen}
        amount={currentDues}
        onSuccess={handlePaySuccess}
        onClose={() => setPayModalOpen(false)}
      />
    </div>
  );
};

export default Fees;
