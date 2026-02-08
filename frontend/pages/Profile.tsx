
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Hash, Building2, Calendar, Shield, Key, ChevronRight, AlertCircle, Info, Navigation } from 'lucide-react';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { studentsAPI, locationAPI } from '../utils/api';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { PasswordChangeModal } from '../components/PasswordChangeModal';

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const lastPosRef = React.useRef<GeolocationPosition | null>(null);
  const watchIdRef = React.useRef<number | null>(null);
  const intervalRef = React.useRef<any>(null);
  const lastSentRef = React.useRef<number>(0);

  // whether warden has enabled tracking for this student (derived from profile)
  const wardenTrackingEnabled = profileData?.locationTrackingEnabled ?? false;

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    locationAPI.getMyStatus().then((r) => {
      if (r.success && r.data) setLocationSharing(r.data.isSharingEnabled ?? false);
    }).catch(() => {});
  }, []);

  // Automatic background tracking: watchPosition + 30s sender
  useEffect(() => {
    if (!wardenTrackingEnabled || !locationSharing || !('geolocation' in navigator)) return;

    setPermissionDenied(false);
    setTrackingActive(true);

    const sendLocation = async (pos: GeolocationPosition, force = false) => {
      const now = Date.now();
      if (!force && now - lastSentRef.current < 10000) return;
      lastSentRef.current = now;
      try {
        await locationAPI.update({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      } catch (e) {
        console.debug('Location send failed', e);
      }
    };

    const success = (pos: GeolocationPosition) => {
      lastPosRef.current = pos;
      void locationAPI.reportPermission(true).catch(() => {});
      void sendLocation(pos);
    };

    const error = (err: any) => {
      console.debug('Geolocation watch error', err);
      if (err && err.code === 1) { // PERMISSION_DENIED
        setPermissionDenied(true);
        setTrackingActive(false);
        void locationAPI.reportPermission(false).catch(() => {});
      }
    };

    try {
      const watchId = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
      watchIdRef.current = watchId as unknown as number;
    } catch (e) {
      console.debug('Failed to start geolocation watch', e);
    }

    intervalRef.current = setInterval(() => {
      const p = lastPosRef.current;
      if (p) {
        void sendLocation(p, true);
      }
    }, 30 * 1000);

    return () => {
      try { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); } catch (e) {}
      try { clearInterval(intervalRef.current); } catch (e) {}
      lastPosRef.current = null;
      setTrackingActive(false);
    };
  }, [wardenTrackingEnabled, locationSharing]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentsAPI.getProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto pb-20">
        <Skeleton />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-5xl mx-auto pb-20">
        <EmptyState
          icon={AlertCircle}
          title="Profile Not Found"
          message={error || "Unable to load your profile. Please try again later."}
        />
      </div>
    );
  }

  const studentName = profileData.userId?.name || 'Unknown';
  const studentEmail = profileData.userId?.email || 'N/A';
  const rollNumber = profileData.rollNumber || 'N/A';
  const studentClass = profileData.class || 'N/A';
  const section = profileData.section || '';
  const room = profileData.room || 'N/A';
  const phone = profileData.phone || 'N/A';
  const studentId = rollNumber;

  // Students cannot toggle location sharing; warden controls tracking.
  const handleLocationToggle = async () => {
    // Provide a quick hint to the student
    setLocationLoading(true);
    try {
      // No-op: Show current status remains read-only
    } finally {
      setLocationLoading(false);
    }
  };

  const info = [
    { label: 'Student Full Name', value: studentName, icon: User, adminOnly: true },
    { label: 'Institutional Roll No', value: rollNumber, icon: Hash, adminOnly: true },
    { label: 'Student Email', value: studentEmail, icon: Mail, adminOnly: true },
    { label: 'Emergency Contact', value: phone, icon: Phone, adminOnly: false },
    { label: 'Hostel Block', value: section || 'N/A', icon: Building2, adminOnly: true },
    { label: 'Room Number', value: room, icon: MapPin, adminOnly: true },
    { label: 'Class / Batch', value: studentClass, icon: Calendar, adminOnly: true },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12"
      >
        <div className="h-60 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-[40px] shadow-xl" />
        <div className="absolute -bottom-16 left-12 flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
          <div className="w-44 h-44 rounded-[40px] border-8 border-slate-50 bg-white shadow-2xl overflow-hidden relative group">
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white">
              <span className="text-5xl font-extrabold tracking-tight">
                {(studentName || 'S').trim().slice(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="pb-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{studentName}</h2>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-2">
              {studentClass} {section ? `• Section ${section}` : ''} {room !== 'N/A' ? `• Room ${room}` : ''}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-24">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                Hostel Records Info
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 uppercase tracking-widest">
                <Shield size={12} />
                Hostel Verified
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
              {info.map((item) => (
                <div key={item.label} className="group relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 text-indigo-500 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      <item.icon size={18} />
                    </div>
                    <p className={`font-bold tracking-tight ${item.adminOnly ? 'text-slate-800' : 'text-slate-600 italic'}`}>
                      {item.value}
                    </p>
                    {item.adminOnly && (
                      <Shield size={14} className="text-slate-200" title="Hostel record (admin only)" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-2 h-6 bg-indigo-600 rounded-full" />
              Digital Student ID Card
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
              <div>
                <QRCodeDisplay value={studentId} size={180} />
                <p className="text-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gate Entry/Exit QR</p>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 flex gap-4">
                  <Info className="text-indigo-600 shrink-0" size={20} />
                  <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                    Show this student QR code at the hostel gate scanner to log your entry and exit compliance automatically.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10"
          >
            <h3 className="font-bold text-slate-900 text-xl mb-6 tracking-tight">Location Sharing</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm">
                    <Navigation size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Share location with warden & parent</p>
                    <p className="text-xs text-slate-500">Enable to let warden and your parent see your last known location</p>
                  </div>
                </div>
                <button
                  disabled
                  title={wardenTrackingEnabled ? 'Location tracking enabled by warden' : 'Location tracking disabled by warden'}
                  className={`relative w-14 h-8 rounded-full transition-colors ${wardenTrackingEnabled ? 'bg-indigo-600' : 'bg-slate-300'} cursor-not-allowed`}
                >
                  <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${wardenTrackingEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {wardenTrackingEnabled && navigator.geolocation && (
                <div className="w-full py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl flex flex-col gap-2 items-start">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="text-sm font-bold text-slate-800">Location sharing enabled by hostel administration</div>
                      <div className="text-xs text-slate-500">Your device will send location updates every 30 seconds while this page is open.</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${trackingActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {trackingActive ? 'Live' : permissionDenied ? 'Permission Denied' : 'Waiting'}
                    </div>
                  </div>
                  {permissionDenied && (
                    <div className="w-full text-xs text-rose-600 font-bold">Location permission denied. Please enable location in your browser settings.</div>
                  )}
                </div>
              )}
              {!wardenTrackingEnabled && (
                <p className="text-xs text-slate-500">Location tracking is controlled by your warden and is currently disabled.</p>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-xl mb-6 tracking-tight">Account Security</h3>
            <div className="space-y-4">
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm">
                    <Key size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Change Password</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <PasswordChangeModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default Profile;
