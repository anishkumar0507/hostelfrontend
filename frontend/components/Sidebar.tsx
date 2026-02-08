
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquareWarning, 
  PlaneTakeoff, 
  Receipt, 
  UserCircle, 
  LogOut,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/student/fees', label: 'Hostel Fees', icon: Receipt },
  { path: '/student/complaints', label: 'Support & Helpdesk', icon: MessageSquareWarning },
  { path: '/student/leave', label: 'Outing Pass', icon: PlaneTakeoff },
  { path: '/student/profile', label: 'My Profile', icon: UserCircle },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-72">
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 text-indigo-600 font-extrabold text-2xl tracking-tighter">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Home size={24} />
          </div>
          <span>HostelEase</span>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
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
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
                <span className="tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 font-bold"
        >
          <LogOut size={20} />
          <span>Student Logout</span>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
