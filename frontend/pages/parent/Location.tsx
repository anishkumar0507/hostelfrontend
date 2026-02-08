import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Map, Navigation, Calendar, Clock, AlertCircle } from 'lucide-react';
import { parentAPI, locationAPI } from '../../utils/api';
import { useUI } from '../../App';

const Location: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [childId, setChildId] = useState<string | null>(null);
  const { showToast } = useUI();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get child information first
        const childRes = await parentAPI.getChild();
        if (childRes.success && childRes.data) {
          setChildId(childRes.data._id);

          // Get live location
          const locRes = await parentAPI.getChildLocation();
          if (locRes.success && locRes.data) {
            setData(locRes.data);
          }

          // Get 24h history
          if (childRes.data._id) {
            try {
              const histRes = await locationAPI.getStudentHistory(childRes.data._id);
              if (histRes.success && histRes.data?.points) {
                setHistory(histRes.data.points);
              }
            } catch (err) {
              console.debug('Failed to load history:', err);
            }
          }
        }
      } catch (err) {
        showToast('Failed to load location', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hasLocation = data?.isSharingEnabled && data?.lat != null && data?.lng != null;
  const mapUrl = hasLocation ? `https://www.google.com/maps?q=${data.lat},${data.lng}` : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Live Location Tracking</h2>
        <p className="text-emerald-300/80 mt-2">View your child's real-time location and movement history</p>
      </div>

      {/* Live Location Status */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[28px] border p-8 ${
          data?.isSharingEnabled
            ? 'bg-emerald-800/40 border-emerald-700'
            : 'bg-amber-800/30 border-amber-700'
        }`}
      >
        <div className="flex items-start gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            data?.isSharingEnabled
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Navigation size={32} />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${
              data?.isSharingEnabled ? 'text-emerald-200' : 'text-amber-200'
            }`}>
              {data?.isSharingEnabled ? 'Location Sharing Active' : 'Location Sharing Disabled'}
            </h3>
            <p className={`text-sm mb-4 ${
              data?.isSharingEnabled ? 'text-emerald-300/80' : 'text-amber-300/80'
            }`}>
              {data?.isSharingEnabled
                ? hasLocation
                  ? `Last updated: ${new Date(data.lastUpdated).toLocaleString('en-IN')}`
                  : 'Waiting for location data from your child\'s device...'
                : 'Your child has not enabled location sharing. Ask them to enable it in their profile settings.'}
            </p>

            {hasLocation && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mb-1">Latitude</p>
                  <p className="text-lg font-bold text-white">{data.lat.toFixed(6)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mb-1">Longitude</p>
                  <p className="text-lg font-bold text-white">{data.lng.toFixed(6)}</p>
                </div>
                {data.accuracy && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mb-1">Accuracy</p>
                    <p className="text-lg font-bold text-white">±{data.accuracy.toFixed(0)}m</p>
                  </div>
                )}
              </div>
            )}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                <Map size={20} />
                View on Google Maps
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Location History */}
      {history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[28px] border border-slate-700 bg-slate-800/40 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-indigo-400" size={24} />
            <h3 className="text-xl font-bold text-white">24-Hour Movement Trail</h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((point, idx) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-700 last:border-b-0">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    {idx < history.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-600 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-slate-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-slate-300">
                        {new Date(point.timestamp).toLocaleTimeString('en-IN')}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      <span className="font-mono">{point.lat.toFixed(6)}</span>, <span className="font-mono">{point.lng.toFixed(6)}</span>
                      {point.accuracy && <span className="ml-2 text-slate-500">(±{point.accuracy.toFixed(0)}m)</span>}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {history.length === 0 && (
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle size={18} />
              <p className="text-sm">No movement history available yet</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Info Box */}
      {data?.isSharingEnabled && (
        <div className="rounded-[20px] border border-indigo-500/20 bg-indigo-500/5 p-6 flex gap-4">
          <AlertCircle className="text-indigo-400 flex-shrink-0" size={20} />
          <p className="text-sm text-indigo-300">
            Location updates are sent every 30 seconds when your child is using the hostel app. Historical data is retained for 30 days.
          </p>
        </div>
      )}
    </div>
  );
};

export default Location;
