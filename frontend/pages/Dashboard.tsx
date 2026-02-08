
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DoorClosed, 
  CalendarCheck, 
  CreditCard, 
  AlertCircle,
  User,
  Info
} from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { studentsAPI } from '../utils/api';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await studentsAPI.getProfile();
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setProfile(null);
        }
      } catch (error: any) {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const hasProfile = profile && profile.userId;

  if (!hasProfile) {
    return (
      <div className="space-y-8 pb-10">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Welcome! 👋
          </motion.h2>
          <p className="text-slate-500 font-medium mt-1">Your student profile</p>
        </div>
        <EmptyState
          title="Profile Not Found"
          description="Your student profile has not been set up yet. Please contact your warden to create your account."
          icon={<User size={40} className="text-slate-300" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-extrabold text-slate-900 tracking-tight"
          >
            Namaste, {profile.userId?.name || 'Student'}! 👋
          </motion.h2>
          <p className="text-slate-500 font-medium mt-1">Your hostel dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
          className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 opacity-[0.03] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
            <DoorClosed size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">Class</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{profile.class || 'N/A'}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -6, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
          className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-700 opacity-[0.03] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
            <CalendarCheck size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">Roll Number</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{profile.rollNumber || 'N/A'}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -6, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
          className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 opacity-[0.03] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
            <CreditCard size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">Section</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{profile.section || 'N/A'}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -6, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
          className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 opacity-[0.03] rounded-bl-[100px]" />
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
            <AlertCircle size={28} />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">Phone</p>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tighter">{profile.phone || 'Not provided'}</h3>
        </motion.div>
      </div>

      <motion.div 
        whileHover={{ shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}
        className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-10"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Student Information</h3>
        </div>
        <div className="p-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Email</p>
              <p className="font-bold text-slate-800 text-sm tracking-tight">{profile.userId?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Class</p>
              <p className="font-bold text-slate-800 text-sm tracking-tight">{profile.class || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Section</p>
              <p className="font-bold text-slate-800 text-sm tracking-tight">{profile.section || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Roll Number</p>
              <p className="font-bold text-slate-800 text-sm tracking-tight">{profile.rollNumber || 'N/A'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-slate-900 rounded-[40px] shadow-2xl shadow-indigo-100 p-10 text-white relative overflow-hidden group"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <Info size={32} />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-xl mb-2 tracking-tight">Welcome to HostelEase</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Your profile has been set up. You can now view your fees, submit complaints, and request leave passes from the sidebar.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
