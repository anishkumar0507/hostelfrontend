
import React, { useState, useEffect } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { decodeToken, getAuthToken } from '../utils/api';
import { studentsAPI } from '../utils/api';
import { useUI } from '../App';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('Student');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const { showToast } = useUI();

  useEffect(() => {
    const loadUserData = async () => {
      const token = getAuthToken();
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.name) {
          setUserName(decoded.name);
        }

        // Fetch student profile to get room number
        try {
          const response = await studentsAPI.getProfile();
          if (response.success && response.data) {
            if (response.data.room) {
              setRoomNumber(`Room ${response.data.room}`);
            }
            // Update name from profile if available (more accurate)
            if (response.data.userId?.name) {
              setUserName(response.data.userId.name);
            }
          }
        } catch (error) {
          // Silently fail - use name from token
        }
      }
    };

    loadUserData();
  }, []);
  
  const getTitle = () => {
    if (location.pathname.includes('/dashboard')) return 'Student Dashboard';
    if (location.pathname.includes('/complaints')) return 'Hostel Helpdesk';
    if (location.pathname.includes('/leave')) return 'Outing Pass Records';
    if (location.pathname.includes('/fees')) return 'Fee Payment History';
    if (location.pathname.includes('/profile')) return 'My Profile';
    return 'Student Portal';
  };

  return (
    <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => showToast('No new notifications')}
          className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl relative transition-all active:scale-90"
        >
          <Bell size={24} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{userName}</p>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {roomNumber || 'Student'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 overflow-hidden shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
