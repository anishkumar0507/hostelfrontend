
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldCheck, User, MapPin, Clock, X, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { useUI } from '../../App';
import { entryExitAPI } from '../../utils/api';

const WardenQRScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { showToast } = useUI();
  const [scanCode, setScanCode] = useState('');
  const [mode, setMode] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [error, setError] = useState<string>('');

  const handleScan = async () => {
    setError('');
    const code = scanCode.trim();
    if (!code) {
      setError('Please enter a QR code / roll number');
      return;
    }

    setScanning(true);
    try {
      const response =
        mode === 'EXIT'
          ? await entryExitAPI.markExit({ studentId: code, method: 'QR' })
          : await entryExitAPI.markEntry({ studentId: code, method: 'QR' });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Scan failed');
      }

      const log: any = response.data;
      const isEntry = log.status === 'IN';

      setResult({
        student: log.studentId?.userId?.name || 'Unknown',
        id: log.studentId?.rollNumber || code,
        room: log.studentId?.room || 'N/A',
        type: isEntry ? 'ENTRY' : 'EXIT',
        time: new Date(log.inTime || log.outTime || log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      showToast(`${isEntry ? 'Entry' : 'Exit'} recorded for student: ${log.studentId?.userId?.name || code}`, 'success');
    } catch (e: any) {
      const msg = e?.message || 'Scan failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Gate Security Panel</h2>
        <p className="text-slate-400 mt-2 font-medium">Scan student digital ID QR for Hostel Entry/Exit logging</p>
      </div>

      <div className="bg-slate-800/50 rounded-[32px] border border-slate-700 p-8 space-y-5">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-300 font-bold">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode('ENTRY')}
            className={`py-4 rounded-2xl font-extrabold uppercase tracking-widest text-xs border transition-all ${
              mode === 'ENTRY'
                ? 'bg-emerald-600 text-white border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            ENTRY
          </button>
          <button
            type="button"
            onClick={() => setMode('EXIT')}
            className={`py-4 rounded-2xl font-extrabold uppercase tracking-widest text-xs border transition-all ${
              mode === 'EXIT'
                ? 'bg-amber-600 text-white border-amber-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            EXIT
          </button>
        </div>
        <div>
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">QR Code / Roll Number</label>
          <input
            value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            className="w-full px-5 py-4 bg-slate-900/60 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all"
            placeholder="e.g. 10-A-023 / U21-CS-4092"
          />
        </div>
      </div>

      <div className="relative aspect-square max-w-sm mx-auto bg-slate-800 rounded-[40px] border-4 border-slate-700 overflow-hidden group shadow-2xl shadow-black/50">
        {!scanning && !result ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Camera size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Scanner Ready</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Align the student's digital ID QR code within the frame</p>
            <button 
              onClick={handleScan}
              className="px-8 py-4 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Start Gate Scan
            </button>
          </div>
        ) : scanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="relative w-full aspect-square border-2 border-indigo-500/50 rounded-2xl overflow-hidden">
               <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1]"
               />
               <div className="w-full h-full bg-slate-900/60" />
            </div>
            <p className="text-indigo-400 font-extrabold uppercase tracking-widest mt-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
              Scanning Student ID...
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-slate-900">
             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${result.type === 'ENTRY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}
             >
                {result.type === 'ENTRY' ? <LogIn size={56} /> : <LogOut size={56} />}
             </motion.div>
             <h3 className="text-3xl font-extrabold text-white tracking-tight">{result.type} LOGGED</h3>
             <div className="w-full mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                   <User className="text-slate-500" size={20} />
                   <div className="text-left">
                      <p className="text-white font-bold">{result.student}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {result.id}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <MapPin size={18} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">Room {result.room}</span>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <Clock size={18} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">{result.time}</span>
                   </div>
                </div>
             </div>
             <button 
               onClick={() => setResult(null)}
               className="w-full mt-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all"
             >
               Next Entry Scan
             </button>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-[32px] border border-slate-700 p-8 flex gap-6">
        <div className="p-4 bg-slate-900 rounded-2xl text-slate-500">
           <ShieldCheck size={32} />
        </div>
        <div>
           <h4 className="text-lg font-bold text-white mb-1">Gate Panel Online</h4>
           <p className="text-sm text-slate-400 font-medium leading-relaxed">
             Hostel entry logs are synced in real-time. Unverified movements will trigger alerts to the Chief Warden's office.
           </p>
        </div>
      </div>
    </div>
  );
};

export default WardenQRScanner;
