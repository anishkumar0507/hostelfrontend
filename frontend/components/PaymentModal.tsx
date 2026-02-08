
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { paymentsAPI } from '../utils/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [error, setError] = useState<string>('');
  const [method, setMethod] = useState<'UPI' | 'Card' | 'Netbanking' | 'Cash'>('UPI');
  const [transactionId, setTransactionId] = useState<string>('');

  const handlePay = async () => {
    setError('');
    setStep('processing');
    try {
      const response = await paymentsAPI.pay({ amount, method, transactionId: transactionId || undefined });
      if (!response.success) {
        throw new Error(response.message || 'Payment failed');
      }
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep('details');
      }, 1200);
    } catch (e: any) {
      setError(e?.message || 'Payment failed');
      setStep('details');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden relative z-10"
          >
            <div className="bg-indigo-600 p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold">HostelEase Secure</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div>
                <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Amount to Pay</p>
                <h4 className="text-4xl font-extrabold mt-1 tracking-tight">₹{amount.toLocaleString('en-IN')}</h4>
              </div>
            </div>

            <div className="p-8">
              {step === 'details' && (
                <div className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                      <AlertCircle className="text-red-600 shrink-0" size={20} />
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preferred Method</label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-indigo-600 rounded-2xl">
                      <CreditCard className="text-indigo-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 tracking-tight">Online Payment (Temporary)</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Recorded against your pending fees</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handlePay}
                      className="w-full py-4.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      Pay Now ₹{amount.toLocaleString('en-IN')}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <ShieldCheck size={12} />
                      PAYMENT WILL UPDATE YOUR FEE STATUS
                    </p>
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="text-indigo-600 animate-spin mb-6" size={64} />
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Processing Payment</h3>
                  <p className="text-slate-500 mt-2 font-medium">Please do not refresh or close this window.</p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Successful</h3>
                  <p className="text-slate-500 mt-2 font-medium">Your fee status has been updated.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
