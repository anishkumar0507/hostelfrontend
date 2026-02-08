import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Map, Navigation, Users, Search, Filter, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { studentsAPI, locationAPI } from '../../utils/api';
import { useUI } from '../../App';
import { EmptyState } from '../../components/EmptyState';

interface StudentLocation {
  _id: string;
  userId: { name: string; email: string };
  rollNumber: string;
  room: string;
  section: string;
  class: string;
  locationTrackingEnabled: boolean;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    lastUpdated: string;
    isSharingEnabled: boolean;
    permissionGranted: boolean;
  };
}

const WardenLocationTracking: React.FC = () => {
  const [students, setStudents] = useState<StudentLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentLocation | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const { showToast } = useUI();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await studentsAPI.getAllWithLocations();
      if (response.success && Array.isArray(response.data)) {
        setStudents(response.data);
        const uniqueBlocks = Array.from(
          new Set(response.data.map((s: any) => s.section || '').filter((s: string) => s.length > 0))
        ).sort();
        setBlocks(uniqueBlocks);
      }
    } catch (error) {
      showToast('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStudents();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchStudents, 30000);
    return () => clearInterval(interval);
  }, [fetchStudents]);

  const fetchHistory = async (studentId: string) => {
    try {
      const res = await locationAPI.getStudentHistory(studentId);
      if (res.success && res.data?.points) {
        setHistory(res.data.points);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setHistory([]);
    }
  };

  const handleSelectStudent = (student: StudentLocation) => {
    setSelectedStudent(student);
    if (student._id) {
      fetchHistory(student._id);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterBlock || student.section === filterBlock;
    return matchesSearch && matchesFilter;
  });

  const onlineStudents = filteredStudents.filter(
    s => s.location?.isSharingEnabled && s.location?.lat && s.location?.lng
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Live Location Tracking</h2>
          <p className="text-slate-400 font-medium mt-1">Monitor all students' live locations and 24-hour movement trails</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 px-5 py-3 rounded-2xl border border-slate-700 text-sm font-bold text-slate-300 flex items-center gap-2">
            <Navigation className="text-emerald-500" size={20} />
            {onlineStudents} Online
          </div>
          <button
            onClick={fetchStudents}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-600"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-600 min-w-[180px]"
          >
            <option value="">All Blocks</option>
            {blocks.map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Students"
              message="No students match your filters."
            />
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {filteredStudents.map((student, idx) => {
                const isOnline =
                  student.location?.isSharingEnabled &&
                  student.location?.lat &&
                  student.location?.lng;
                const isSelected = selectedStudent?._id === student._id;

                return (
                  <motion.button
                    key={student._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-600'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{student.userId?.name || 'Unknown'}</h4>
                        <p className="text-xs text-slate-400">Roll: {student.rollNumber}</p>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2 ${
                          isOnline
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {isOnline ? 'Live' : 'Offline'}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Room {student.room} • Block {student.section}
                    </p>
                    {isOnline && student.location?.lastUpdated && (
                      <p className="text-xs text-emerald-400/70 mt-1">
                        Updated: {new Date(student.location.lastUpdated).toLocaleTimeString('en-IN')}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Student Info */}
              <div className="bg-slate-800 border border-slate-700 rounded-[24px] p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {(selectedStudent.userId?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{selectedStudent.userId?.name || 'Unknown'}</h3>
                    <p className="text-slate-400">Roll: {selectedStudent.rollNumber}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedStudent.userId?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Room</p>
                    <p className="text-white font-semibold">{selectedStudent.room}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Block</p>
                    <p className="text-white font-semibold">{selectedStudent.section}</p>
                  </div>
                </div>

                {/* Location Status */}
                {selectedStudent.location?.isSharingEnabled &&
                selectedStudent.location?.lat ? (
                  <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-lg p-4 space-y-2">
                    <p className="text-xs text-emerald-400 uppercase font-bold">Live Location</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Latitude</p>
                        <p className="text-white font-mono font-semibold">
                          {selectedStudent.location.lat.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Longitude</p>
                        <p className="text-white font-mono font-semibold">
                          {selectedStudent.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    {selectedStudent.location.accuracy && (
                      <p className="text-xs text-emerald-400">
                        Accuracy: ±{selectedStudent.location.accuracy.toFixed(0)}m
                      </p>
                    )}
                    <p className="text-xs text-emerald-300/80">
                      Last updated: {new Date(selectedStudent.location.lastUpdated).toLocaleString('en-IN')}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${selectedStudent.location.lat},${selectedStudent.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all"
                    >
                      <Map size={16} />
                      View on Maps
                    </a>
                  </div>
                ) : (
                  <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-400 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-amber-200 font-bold text-sm">No Location Data</p>
                      <p className="text-amber-300/80 text-xs mt-1">
                        {selectedStudent.locationTrackingEnabled
                          ? 'Waiting for location data from device...'
                          : 'Location tracking is disabled for this student.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location History */}
              {history.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-[24px] p-6">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-400" />
                    24-Hour Movement Trail
                  </h4>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {history
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 20)
                      .map((point, idx) => (
                        <div key={idx} className="flex gap-4 pb-3 border-b border-slate-700 last:border-b-0">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                            {idx < Math.min(history.length - 1, 19) && (
                              <div className="w-0.5 h-10 bg-slate-600 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock size={12} className="text-slate-500 flex-shrink-0" />
                              <p className="text-xs font-semibold text-slate-300">
                                {new Date(point.timestamp).toLocaleTimeString('en-IN')}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">
                              {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                              {point.accuracy && <span className="ml-2">±{point.accuracy.toFixed(0)}m</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {history.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No history available</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-800/40 rounded-[24px] border border-slate-700 border-dashed">
              <div className="text-center">
                <Navigation className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">Select a student to view location details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenLocationTracking;
