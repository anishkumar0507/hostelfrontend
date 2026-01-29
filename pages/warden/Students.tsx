
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Mail, Phone, MoreVertical, GraduationCap, Plus, X, User, Hash, DoorClosed, CreditCard, ShieldCheck, Download, Edit2, Trash2 } from 'lucide-react';
import { useUI } from '../../App';
import { exportStudentList } from '../../components/PDFGenerator';
import { studentsAPI } from '../../utils/api';
import { EmptyState } from '../../components/EmptyState';

const WardenStudents: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useUI();
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await studentsAPI.getAll();
      if (response.success && response.data) {
        // Map API response to UI format
        const formattedStudents = (Array.isArray(response.data) ? response.data : []).map((student: any) => ({
          id: student._id,
          name: student.userId?.name || 'Unknown',
          roll: student.rollNumber || 'N/A',
          room: student.room || 'N/A',
          hostel: student.class || 'N/A',
          email: student.userId?.email || 'N/A',
          studentData: student // Keep full data for editing
        }));
        setStudents(formattedStudents);
      }
    } catch (error) {
      showToast('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    exportStudentList(students);
    showToast('Student directory exported to PDF.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const rollNumber = formData.get('roll') as string;
    const studentClass = formData.get('hostel') as string;
    const room = formData.get('room') as string;
    const section = formData.get('section') as string || '';
    const phone = formData.get('phone') as string || '';

    try {
      if (editingStudent) {
        // Update student
        const response = await studentsAPI.update(editingStudent.id, {
          name,
          email,
          rollNumber,
          class: studentClass,
          room,
          section,
          phone
        });
        if (response.success) {
          showToast('Student profile updated successfully', 'success');
          fetchStudents(); // Refresh list
        }
      } else {
        // Create new student - password is auto-generated
        const response = await studentsAPI.create({
          name,
          email,
          class: studentClass,
          section,
          rollNumber,
          phone,
          room
        });
        if (response.success) {
          showToast('New student registered successfully. Temporary password has been sent to student email.', 'success');
          fetchStudents(); // Refresh list
        }
      }
      setModalOpen(false);
      setEditingStudent(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to save student', 'error');
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll.toLowerCase().includes(search.toLowerCase()) || 
    s.room.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Student Directory</h2>
          <p className="text-slate-400 font-medium mt-1">
            {isLoading ? 'Loading students...' : students.length === 0 ? 'No students registered yet' : `Manage ${students.length} active hostel student${students.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-2xl font-bold transition-all shadow-sm">
            <Download size={20} />
            Export Directory
          </button>
          <button 
            onClick={() => { setEditingStudent(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-[20px] font-extrabold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            Register Student
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search students by name, roll no, or room..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-16 pr-6 py-5 bg-slate-800/50 border border-slate-700 rounded-[28px] outline-none focus:ring-2 focus:ring-indigo-600 text-white shadow-sm text-lg transition-all placeholder:text-slate-600"
        />
      </div>

      {isLoading ? (
        <div className="bg-slate-800/50 rounded-[40px] border border-slate-700 shadow-2xl p-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Students Registered Yet"
          description="Start by registering students using the 'Register Student' button. Student records will appear here once added."
          icon={<GraduationCap size={40} className="text-slate-400" />}
        />
      ) : (
        <div className="bg-slate-800/50 rounded-[40px] border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700 bg-slate-900/30">
                  <th className="p-8 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Student Profile</th>
                  <th className="p-8 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Hostel Allocation</th>
                  <th className="p-8 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Live Status</th>
                  <th className="p-8 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Entry Compliance</th>
                  <th className="p-8 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((student, i) => (
                <motion.tr 
                  key={student.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: i * 0.05 }} 
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-lg shadow-inner border border-indigo-500/10">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-lg tracking-tight group-hover:text-indigo-400 transition-colors">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Roll: {student.roll}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-900 rounded-xl text-slate-500 group-hover:text-indigo-50 transition-colors border border-slate-800"><DoorClosed size={18} /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-300 tracking-tight">{student.hostel}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Room {student.room}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border bg-slate-700/50 text-slate-400 border-slate-600/50">
                      N/A
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2.5 bg-slate-700 rounded-full min-w-[100px] overflow-hidden border border-slate-600/50">
                        <div className="h-full w-0 rounded-full bg-slate-600" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-500">-</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingStudent(student); setModalOpen(true); }}
                        className="p-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
                            try {
                              const response = await studentsAPI.delete(student.id);
                              if (response.success) {
                                showToast('Student deleted successfully', 'success');
                                fetchStudents();
                              }
                            } catch (error: any) {
                              showToast(error.message || 'Failed to delete student', 'error');
                            }
                          }
                        }}
                        className="p-3 bg-slate-900 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-slate-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-[40px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden">
              <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">{editingStudent ? 'Update Student Profile' : 'Register New Student'}</h3>
                  <p className="text-slate-500 font-medium mt-1">HostelEase Secure Student Information System</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white p-3 hover:bg-white/5 rounded-2xl transition-all"><X size={28} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Student Full Name</label>
                      <input required name="name" defaultValue={editingStudent?.name} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Roll Number</label>
                      <input required name="roll" defaultValue={editingStudent?.roll || editingStudent?.studentData?.rollNumber} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Institutional Email</label>
                      <input required name="email" type="email" defaultValue={editingStudent?.email || editingStudent?.studentData?.userId?.email} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Class</label>
                      <input required name="hostel" defaultValue={editingStudent?.hostel || editingStudent?.studentData?.class} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" placeholder="e.g., 10, 11, 12" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Section</label>
                      <input name="section" defaultValue={editingStudent?.studentData?.section} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" placeholder="e.g., A, B, C" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Room Number</label>
                      <input name="room" defaultValue={editingStudent?.room || editingStudent?.studentData?.room} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Phone Number</label>
                      <input name="phone" type="tel" defaultValue={editingStudent?.studentData?.phone} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 text-white font-bold transition-all" placeholder="Optional" />
                    </div>
                    <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex gap-4">
                      <ShieldCheck className="text-indigo-400 shrink-0" size={24} />
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        A temporary password will be automatically generated and sent to the student's email address. The student must change this password on first login.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-5 mt-12">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-400 font-extrabold rounded-2xl hover:bg-white/10 transition-all uppercase text-xs tracking-widest">Cancel</button>
                  <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">Save Student Profile</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardenStudents;
