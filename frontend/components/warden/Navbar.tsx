
import React, { useState, useEffect } from 'react';
import { Menu, Bell, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { decodeToken, getAuthToken } from '../../utils/api';
import { useUI } from '../../App';

interface NavbarProps {
  onMenuClick: () => void;
}

const WardenNavbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const [wardenName, setWardenName] = useState<string>('Warden');
  const { showToast } = useUI();

  useEffect(() => {
    const loadWardenData = () => {
      const token = getAuthToken();
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.name) {
          setWardenName(decoded.name.toUpperCase());
        }
      }
    };

    loadWardenData();
  }, []);

  const getTitle = () => {
    switch (location.pathname) {
      case '/warden/dashboard': return 'Warden Dashboard';
      case '/warden/students': return 'Student Directory';
      case '/warden/payments': return 'Payment Management';
      case '/warden/rooms': return 'Hostel Asset Management';
      case '/warden/complaints': return 'Hostel Helpdesk';
      case '/warden/leaves': return 'Outing Pass Approvals';
      case '/warden/security': return 'Gate Security Logs';
      case '/warden/scan': return 'Gate Entry Scan';
      default: return 'Warden Portal';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 backdrop-blur-md bg-slate-900/80">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 text-slate-400 hover:bg-white/5 rounded-xl transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={() => showToast('No new notifications')}
          className="p-3 text-slate-400 hover:bg-white/5 rounded-2xl relative transition-all active:scale-95"
        >
          <Bell size={24} />
          <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
        </button>
        <div className="flex items-center gap-4 pl-6 border-l border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-1">{wardenName}</p>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tighter">Warden Office</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 shadow-xl border border-slate-700">
            <ShieldCheck size={26} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default WardenNavbar;
