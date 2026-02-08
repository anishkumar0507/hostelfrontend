import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DoorClosed } from 'lucide-react';
import { parentAPI } from '../../utils/api';
import { useUI } from '../../App';

const Room: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useUI();

  useEffect(() => {
    parentAPI.getChildRoom()
      .then((r) => { if (r.success && r.data) setData(r.data); })
      .catch(() => showToast('Failed to load room details', 'error'))
      .finally(() => setIsLoading(false));
  }, [showToast]);

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Child's Room Details</h2>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-800/50 rounded-[40px] border border-emerald-700 p-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DoorClosed size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-emerald-300/80">Room</p>
            <p className="text-3xl font-bold text-white">{data?.room || 'N/A'}</p>
            <p className="text-emerald-300/80">Class {data?.class} • Section {data?.section || 'N/A'}</p>
            <p className="text-emerald-300/80">Roll {data?.rollNumber}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Room;
