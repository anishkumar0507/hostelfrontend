
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, CheckCircle, XCircle, AlertCircle, Download, Search, User, Hash, Building2 } from 'lucide-react';
import { paymentsAPI } from '../../utils/api';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { useUI } from '../../App';

const WardenPayments: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useUI();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await paymentsAPI.getSummary();
      if (response.success && response.data) {
        setPayments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load payment data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.studentName.toLowerCase().includes(searchLower) ||
      payment.rollNumber.toLowerCase().includes(searchLower) ||
      payment.email.toLowerCase().includes(searchLower)
    );
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalDue = payments.reduce((sum, p) => sum + p.dueAmount, 0);
  const paidCount = payments.filter((p) => p.paymentStatus === 'Paid').length;
  const pendingCount = payments.filter((p) => p.paymentStatus === 'Pending').length;

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Payment Management</h2>
          <p className="text-slate-400 font-medium mt-1">View and manage all student payments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/40 p-6 rounded-[32px] border border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Total Revenue</p>
          <h3 className="text-2xl font-extrabold text-white">₹{totalRevenue.toLocaleString()}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/40 p-6 rounded-[32px] border border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Total Due</p>
          <h3 className="text-2xl font-extrabold text-white">₹{totalDue.toLocaleString()}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/40 p-6 rounded-[32px] border border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Paid Students</p>
          <h3 className="text-2xl font-extrabold text-white">{paidCount}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/40 p-6 rounded-[32px] border border-slate-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center">
              <XCircle size={24} />
            </div>
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Pending Students</p>
          <h3 className="text-2xl font-extrabold text-white">{pendingCount}</h3>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800/40 rounded-[32px] border border-slate-700 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Payment Records"
          message={searchTerm ? "No students found matching your search." : "No payment records available yet."}
        />
      ) : (
        <div className="bg-slate-800/40 rounded-[32px] border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Total Fees</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Paid</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Due</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment.studentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white">{payment.studentName}</p>
                          <p className="text-xs text-slate-400">{payment.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-slate-500" />
                        <span className="font-bold text-slate-300">{payment.rollNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-500" />
                        <span className="font-bold text-slate-300">{payment.class} {payment.section !== 'N/A' ? `- ${payment.section}` : ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-300">₹{payment.totalFees.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-400">₹{payment.paidAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-400">₹{payment.dueAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          payment.paymentStatus === 'Paid'
                            ? 'bg-green-500/20 text-green-400'
                            : payment.paymentStatus === 'Partial'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenPayments;
