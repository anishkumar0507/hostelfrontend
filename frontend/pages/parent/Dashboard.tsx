import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, DoorClosed, CreditCard, Activity, MapPin, PlaneTakeoff } from 'lucide-react';
import { parentAPI } from '../../utils/api';
import { useUI } from '../../App';
import { EmptyState } from '../../components/EmptyState';

const ParentDashboard: React.FC = () => {
  const [child, setChild] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useUI();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [childRes, statusRes, leavesRes] = await Promise.all([
          parentAPI.getChild(),
          parentAPI.getChildStatus(),
          parentAPI.getChildLeaves(),
        ]);
        if (childRes.success && childRes.data) setChild(childRes.data);
        if (statusRes.success && statusRes.data) setStatus(statusRes.data.status);
        if (leavesRes.success && leavesRes.leaves) {
          const pending = (leavesRes.leaves as any[]).filter((l) => l.status === 'PendingParent').length;
          setPendingLeaves(pending);
        }
      } catch {
        showToast('Failed to load dashboard', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mt-20" />
      </div>
    );
  }

  if (!child) {
    return (
      <EmptyState
        title="No Child Linked"
        description="Your parent account is not linked to a student. Contact the warden."
        icon={<Users size={40} className="text-emerald-400" />}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h2>
        <p className="text-emerald-300/80 mt-1">Overview of your child's hostel information</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-800/50 rounded-[40px] border border-emerald-700 p-8 md:p-10"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{child.name}</h3>
            <p className="text-emerald-300/80">{child.email}</p>
            <p className="text-sm text-emerald-400 mt-2">
              Class {child.class} {child.section ? `• Section ${child.section}` : ''} • Roll {child.rollNumber}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  status === 'IN' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                }`}
              >
                {status === 'IN' ? 'Inside Campus' : 'Outside Campus'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: DoorClosed, label: "Child's Room", value: child.room || 'N/A', path: '/parent/room', color: 'emerald' },
          { icon: CreditCard, label: 'Fee & Payments', value: 'View history', path: '/parent/fees', color: 'emerald' },
          { icon: Activity, label: 'Entry/Exit Logs', value: 'Last 30 days', path: '/parent/entry-exit', color: 'emerald' },
          { icon: PlaneTakeoff, label: 'Outing Requests', value: pendingLeaves > 0 ? `${pendingLeaves} pending` : 'View', path: '/parent/leaves', color: 'emerald' },
          { icon: MapPin, label: 'Live Location', value: 'Permission based', path: '/parent/location', color: 'emerald' },
        ].map((item, i) => (
          <Link key={item.path} to={item.path}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="block bg-emerald-800/40 rounded-[28px] border border-emerald-700 p-6 hover:bg-emerald-800/60 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-emerald-300/80 text-sm font-medium">{item.label}</p>
                <p className="text-white font-bold">{item.value}</p>
              </div>
            </div>
          </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ParentDashboard;
