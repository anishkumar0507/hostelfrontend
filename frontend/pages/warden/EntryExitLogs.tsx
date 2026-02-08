
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Plus, 
  Download, 
  Clock, 
  LogIn, 
  LogOut, 
  Fingerprint, 
  Scan, 
  X,
  Filter,
  ChevronDown,
  Info,
  Camera,
  AlertCircle
} from 'lucide-react';
import { useUI } from '../../App';
import { EntryExitRecord, EntryStatus } from '../../types';
import { exportEntryExitLogs } from '../../components/PDFGenerator';
import { entryExitAPI, studentsAPI } from '../../utils/api';
import { EmptyState } from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const EntryExitLogs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isManualModalOpen, setManualModalOpen] = useState(false);
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<EntryExitRecord[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch entry-exit logs
        const logsResponse = await entryExitAPI.getLogs();
        if (logsResponse.success && logsResponse.data) {
          const formattedLogs = (Array.isArray(logsResponse.data) ? logsResponse.data : []).map((log: any) => ({
            id: log._id,
            studentName: log.studentId?.userId?.name || 'Unknown',
            studentId: log.studentId?.rollNumber || 'N/A',
            roomNumber: log.studentId?.room || 'N/A',
            time: new Date(log.inTime || log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: log.status === 'IN' ? EntryStatus.IN : EntryStatus.OUT,
            method: log.method || 'Manual'
          }));
          setLogs(formattedLogs);
        }

        // Fetch students list
        const studentsResponse = await studentsAPI.getAll();
        if (studentsResponse.success && studentsResponse.data) {
          const formattedStudents = (Array.isArray(studentsResponse.data) ? studentsResponse.data : []).map((student: any) => ({
            name: student.userId?.name || 'Unknown',
            id: student._id,
            rollNumber: student.rollNumber || 'N/A',
            room: student.room || 'N/A'
          }));
          setStudentsList(formattedStudents);
        }
      } catch (error) {
        showToast('Failed to load gate logs', 'error');
      }
    };
    fetchData();
  }, []);

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const selectedId = formData.get('student') as string;
    const type = formData.get('type') as EntryStatus;

    if (!selectedId) {
      showToast('Please select a student', 'error');
      return;
    }

    try {
      const response =
        type === EntryStatus.OUT
          ? await entryExitAPI.markExit({ studentId: selectedId, method: 'Manual' })
          : await entryExitAPI.markEntry({ studentId: selectedId, method: 'Manual' });

      if (response.success) {
        showToast(type === EntryStatus.OUT ? 'Exit marked successfully' : 'Entry marked successfully', 'success');
        setManualModalOpen(false);
        // Refresh logs
        const logsResponse = await entryExitAPI.getLogs();
        if (logsResponse.success && logsResponse.data) {
          const formattedLogs = (Array.isArray(logsResponse.data) ? logsResponse.data : []).map((log: any) => ({
            id: log._id,
            studentName: log.studentId?.userId?.name || 'Unknown',
            studentId: log.studentId?.rollNumber || 'N/A',
            roomNumber: log.studentId?.room || 'N/A',
            time: new Date(log.inTime || log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: log.status === 'IN' ? EntryStatus.IN : EntryStatus.OUT,
            method: log.method || 'Manual'
          }));
          setLogs(formattedLogs);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to record movement', 'error');
    }
  };

  const handleExport = () => {
    exportEntryExitLogs(logs);
    showToast('Gate control logs exported successfully.');
  };

  const filteredLogs = logs.filter(l => 
    l.studentName.toLowerCase().includes(search.toLowerCase()) || 
    l.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Students In-Campus', value: logs.filter(l => l.status === EntryStatus.IN).length, color: 'text-emerald-400' },
    { label: 'Students On Outing', value: logs.filter(l => l.status === EntryStatus.OUT).length, color: 'text-amber-400' },
    { label: 'Total Logs (Today)', value: logs.length, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Activity className="text-emerald-500" />
            Gate Control Center
          </h2>
          <p className="text-slate-400 font-medium mt-1">Movement tracking for hostel entry & outing</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl font-bold transition-all active:scale-95">
            <Download size={20} />
            Export Gate Logs
          </button>
          <button 
            onClick={() => setManualModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-extrabold shadow-xl shadow-indigo-500/10 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            Record Gate Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 p-8 rounded-[32px] shadow-sm flex flex-col items-center justify-center text-center"
          >
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <h4 className={`text-4xl font-extrabold ${stat.color} tracking-tighter`}>{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search by student name or roll no..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-slate-800/50 border border-slate-700 rounded-[28px] outline-none focus:ring-2 focus:ring-indigo-600 text-white shadow-sm text-lg transition-all"
            />
          </div>

          <div className="bg-slate-800/50 rounded-[40px] border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="p-8 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">Real-time Gate Activity</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl text-slate-400 text-xs font-bold border border-slate-800">
                <Filter size={14} />
                Order: Recent
                <ChevronDown size={14} />
              </div>
            </div>
            {filteredLogs.length === 0 ? (
              <div className="p-20">
                <EmptyState
                  title="No Entry-Exit Logs Yet"
                  description="Entry-exit records will appear here once students start using the gate system. Use 'Record Gate Entry' to manually add records."
                  icon={<Activity size={40} className="text-slate-400" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-900/30">
                      <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Student Info</th>
                      <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Room No</th>
                      <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Timestamp</th>
                      <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Movement</th>
                      <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredLogs.map((log, i) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-white font-bold text-xs">
                            {log.studentName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{log.studentName}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{log.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-300">{log.roomNumber}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={14} />
                          <span className="text-sm font-bold">{log.time}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 w-fit ${
                          log.status === EntryStatus.IN 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {log.status === EntryStatus.IN ? <LogIn size={12} /> : <LogOut size={12} />}
                          {log.status === EntryStatus.IN ? 'In-Time' : 'Out-Time'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2.5 py-1.5 rounded-lg uppercase">
                          {log.method}
                        </span>
                      </td>
                    </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 rounded-[40px] border border-slate-700 p-10 shadow-xl overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Scan className="text-indigo-400" />
                Gate Scanner
              </h3>
              <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                Scanning station for student digital ID verification. Automates in-time/out-time logging for campus gate.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/warden/scan')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Camera size={20} />
                  Initiate Scan
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-[40px] border border-slate-700 p-10 shadow-xl overflow-hidden relative group"
          >
            <div className="relative z-20">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Fingerprint className="text-emerald-400" />
                Biometric Login
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/warden/scan')}
                  className="relative p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center gap-4 text-center transition-all hover:bg-slate-800 hover:border-slate-700"
                >
                  <div>
                    <Fingerprint size={32} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thumb Scan</span>
                </button>

                <button 
                  onClick={() => navigate('/warden/scan')}
                  className="relative p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center gap-4 text-center transition-all hover:bg-slate-800 hover:border-slate-700"
                >
                  <div>
                    <Scan size={32} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Face Scan</span>
                </button>
              </div>

              <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-3 items-center">
                 <Info size={16} className="text-indigo-400 shrink-0" />
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Use for manual student verification at Gate 1.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManualModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-[40px] w-full max-w-md shadow-2xl relative z-10 overflow-hidden">
              <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white tracking-tight">Manual Log Entry</h3>
                <button onClick={() => setManualModalOpen(false)} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleManualEntry} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Student Roll No</label>
                  <select name="student" required className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold appearance-none">
                    <option value="">Search Student...</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Movement Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <input type="radio" name="type" value={EntryStatus.IN} defaultChecked className="hidden peer" />
                      <div className="py-4 rounded-2xl border-2 border-slate-700 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/5 text-center text-slate-500 peer-checked:text-emerald-400 font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                        <LogIn size={14} /> In-Time
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="type" value={EntryStatus.OUT} className="hidden peer" />
                      <div className="py-4 rounded-2xl border-2 border-slate-700 peer-checked:border-amber-500 peer-checked:bg-amber-500/5 text-center text-slate-500 peer-checked:text-amber-400 font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                        <LogOut size={14} /> Out-Time
                      </div>
                    </label>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-xs">
                    Confirm Movement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EntryExitLogs;
