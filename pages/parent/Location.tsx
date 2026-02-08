import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Map } from 'lucide-react';
import { parentAPI } from '../../utils/api';
import { useUI } from '../../App';

const Location: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useUI();

  useEffect(() => {
    parentAPI.getChildLocation()
      .then((r) => { if (r.success && r.data) setData(r.data); })
      .catch(() => showToast('Failed to load location', 'error'))
      .finally(() => setIsLoading(false));
  }, [showToast]);

  if (isLoading) {
    return <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />;
  }

  const hasLocation = data?.isSharingEnabled && data?.lat != null && data?.lng != null;
  const mapUrl = hasLocation ? `https://www.google.com/maps?q=${data.lat},${data.lng}` : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-extrabold text-white">Live Location</h2>
      <p className="text-emerald-300/80">Your child can enable/disable location sharing. You can view their location only when it is enabled.</p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-800/50 rounded-[40px] border border-emerald-700 p-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin size={32} />
          </div>
          <div>
            {data?.isSharingEnabled ? (
              <>
                <p className="text-emerald-200 font-bold">Location sharing enabled</p>
                {hasLocation ? (
                  <p className="text-emerald-300/80 text-sm mt-1">
                    Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
                  </p>
                ) : (
                  <p className="text-emerald-300/80 text-sm mt-1">Waiting for location data</p>
                )}
              </>
            ) : (
              <p className="text-emerald-300/80">Your child has not enabled location sharing.</p>
            )}
          </div>
        </div>
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl w-fit"
          >
            <Map size={20} /> View on Google Maps
          </a>
        )}
      </motion.div>
    </div>
  );
};

export default Location;
