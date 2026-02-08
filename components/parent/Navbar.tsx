import React from 'react';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const ParentNavbar: React.FC<NavbarProps> = ({ onMenuClick }) => (
  <header className="sticky top-0 z-30 bg-emerald-900/95 backdrop-blur border-b border-emerald-800 px-4 md:px-8 py-4 flex items-center justify-between">
    <button onClick={onMenuClick} className="md:hidden p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
      <Menu size={24} />
    </button>
    <div className="flex-1 flex justify-center md:justify-start">
      <h1 className="text-lg font-bold text-white">HostelEase Parent Portal</h1>
    </div>
    <div className="w-10" />
  </header>
);

export default ParentNavbar;
