import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  DoorClosed,
  CreditCard,
  Activity,
  PlaneTakeoff,
  MapPin,
  MessageCircle,
  LogOut,
  X,
  Users,
} from 'lucide-react';
import { useAuth } from '../../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/parent/room', label: "Child's Room", icon: DoorClosed },
  { path: '/parent/fees', label: 'Fee & Payments', icon: CreditCard },
  { path: '/parent/entry-exit', label: 'Entry/Exit Logs', icon: Activity },
  { path: '/parent/leaves', label: 'Outing Requests', icon: PlaneTakeoff },
  { path: '/parent/location', label: 'Live Location', icon: MapPin },
  { path: '/parent/chat', label: 'Chat with Warden', icon: MessageCircle },
];

const ParentSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-emerald-900 border-r border-emerald-800 w-72 text-emerald-100 shadow-2xl">
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white font-extrabold text-2xl tracking-tighter">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Users size={24} />
          </div>
          <span>Parent Portal</span>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-emerald-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 font-bold' : 'text-emerald-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-white' : 'text-emerald-400 group-hover:text-white transition-colors'} />
                <span className="tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-emerald-800">
        <button
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 w-full text-emerald-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-300 font-bold"
        >
          <LogOut size={20} />
          <span>Logout</span>
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

export default ParentSidebar;
