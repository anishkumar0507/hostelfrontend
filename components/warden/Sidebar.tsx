
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  PlaneTakeoff, 
  LogOut,
  X,
  ShieldCheck,
  Camera,
  Activity,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/warden/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
  { path: '/warden/students', label: 'Student List', icon: Users },
  { path: '/warden/payments', label: 'Payment Management', icon: CreditCard },
  { path: '/warden/complaints', label: 'Hostel Helpdesk', icon: ClipboardList },
  { path: '/warden/leaves', label: 'Outing Approvals', icon: PlaneTakeoff },
  { path: '/warden/security', label: 'Gate Security Log', icon: Activity },
  { path: '/warden/scan', label: 'Gate Entry Scan', icon: Camera },
];

const WardenSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-72 text-slate-300 shadow-2xl">
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white font-extrabold text-2xl tracking-tighter">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={24} />
          </div>
          <span>EaseAdmin</span>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 font-bold' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'} transition-colors`} />
                <span className="tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 w-full text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-300 font-bold"
        >
          <LogOut size={20} />
          <span>Warden Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed inset-y-0 left-0 z-50 md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default WardenSidebar;
