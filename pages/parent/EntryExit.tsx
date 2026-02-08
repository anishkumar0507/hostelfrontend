import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Filter } from 'lucide-react';
import { parentAPI } from '../../utils/api';
import { useUI } from '../../App';

const EntryExit: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useUI();

  const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const now = new Date();
  const currentYear = now.getFullYear();

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const params = month && year ? { month, year } : undefined;
        const res = await parentAPI.getChildEntryExit(params);
        if (res.success && res.data) setLogs(Array.isArray(res.data) ? res.data : []);
      } catch {
        showToast('Failed to load logs', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [month, year, showToast]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-3xl font-extrabold text-white">Entry/Exit Logs</h2>
        <div className="flex items-center gap-3">
          <Filter className="text-emerald-400" size={20} />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white"
          >
            <option value="">All (Last 30 days)</option>
            {months.map((m) => (
              <option key={m} value={m}>{new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-emerald-800/50 border border-emerald-700 rounded-xl px-4 py-2 text-white"
          >
            <option value="">Year</option>
            {[currentYear, currentYear - 1].map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-800/40 rounded-[40px] border border-emerald-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>
        ) : logs.length === 0 ? (
          <p className="p-12 text-emerald-300/80">No entry/exit logs</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-emerald-700">
                  <th className="p-6 text-emerald-300/80 font-bold text-xs uppercase">Date/Time</th>
                  <th className="p-6 text-emerald-300/80 font-bold text-xs uppercase">Status</th>
                  <th className="p-6 text-emerald-300/80 font-bold text-xs uppercase">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-700/50">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="p-6 text-white font-medium">
                      {new Date(log.inTime || log.outTime || log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${log.status === 'IN' ? 'bg-emerald-500/30 text-emerald-200' : 'bg-amber-500/20 text-amber-200'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-6 text-emerald-300/80">{log.method || 'Manual'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EntryExit;
