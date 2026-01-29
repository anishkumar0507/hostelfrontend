
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Bed, ClipboardList, PlaneTakeoff, Info, Calendar } from 'lucide-react';
import { DashboardSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { studentsAPI, complaintsAPI, leavesAPI } from '../../utils/api';

const WardenDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [pendingOutings, setPendingOutings] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await studentsAPI.getAll();
        if (response.success && response.data) {
          const list = Array.isArray(response.data) ? response.data : [];
          setStudents(list);
          const uniqueRooms = new Set(
            list
              .map((s: any) => (s.room ? String(s.room).trim() : ''))
              .filter((r: string) => r.length > 0)
          );
          setActiveRooms(uniqueRooms.size);
        }

        const complaintsRes = await complaintsAPI.getAll();
        if (complaintsRes.success && Array.isArray(complaintsRes.data)) {
          setPendingComplaints(complaintsRes.data.filter((c: any) => c.status === 'Pending').length);
        }

        const leavesRes = await leavesAPI.getAll({ status: 'Pending' });
        if (leavesRes.success && Array.isArray(leavesRes.data)) {
          setPendingOutings(leavesRes.data.length);
        }
      } catch (error) {
        // handled by downstream pages; keep dashboard resilient
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const totalStudents = students.length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Hostel Operations Dashboard</h2>
          <p className="text-slate-400 font-medium mt-1">Manage your hostel operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 bg-slate-800 px-5 py-3 rounded-2xl border border-slate-700 shadow-sm text-sm font-bold text-slate-300">
             <Calendar size={18} className="text-indigo-400" />
             {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6 }}
          className="bg-slate-800/40 p-8 rounded-[32px] border border-slate-700 shadow-sm transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 opacity-[0.05] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-2">Total Students</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tighter">{totalStudents}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -6 }}
          className="bg-slate-800/40 p-8 rounded-[32px] border border-slate-700 shadow-sm transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 opacity-[0.05] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
            <ClipboardList size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-2">Pending Complaints</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tighter">{pendingComplaints}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -6 }}
          className="bg-slate-800/40 p-8 rounded-[32px] border border-slate-700 shadow-sm transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 opacity-[0.05] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
            <PlaneTakeoff size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-2">Pending Outings</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tighter">{pendingOutings}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -6 }}
          className="bg-slate-800/40 p-8 rounded-[32px] border border-slate-700 shadow-sm transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-600 to-violet-800 opacity-[0.05] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
            <Bed size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-2">Rooms</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tighter">{activeRooms}</h3>
        </motion.div>
      </div>

      {totalStudents === 0 ? (
        <EmptyState
          title="No Students Yet"
          description="Start by adding students to your hostel management system. Records will appear here once you create student accounts."
          icon={<Users size={40} className="text-slate-400" />}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-[40px] p-10 text-white overflow-hidden relative shadow-2xl border border-slate-700"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <Info size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold mb-2 tracking-tight">Welcome to HostelEase</h3>
                <p className="text-slate-400 font-medium">
                  You have {totalStudents} student{totalStudents !== 1 ? 's' : ''} registered. Manage students, fees, and entry-exit logs from the sidebar.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WardenDashboard;
