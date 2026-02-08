
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Home, Users } from 'lucide-react';

const SelectRole: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'I am a Student',
      desc: 'Access your room, fees, and submit requests.',
      icon: GraduationCap,
      color: 'bg-indigo-600',
      path: '/student/login'
    },
    {
      id: 'parent',
      title: 'I am a Parent/Guardian',
      desc: 'View your child\'s room, fees, outing requests, and chat with warden.',
      icon: Users,
      color: 'bg-emerald-600',
      path: '/parent/login'
    },
    {
      id: 'warden',
      title: 'I am a Warden',
      desc: 'Manage students, rooms, and approvals.',
      icon: ShieldCheck,
      color: 'bg-slate-900',
      path: '/warden/login'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 text-indigo-600 font-bold text-3xl mb-12"
      >
        <Home size={40} />
        <span>HostelEase</span>
      </motion.div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Select your portal</h1>
        <p className="text-slate-500 mt-3 text-lg">Choose your role to continue to the login page</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {roles.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, shadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
            onClick={() => navigate(role.path)}
            className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm cursor-pointer transition-all group relative overflow-hidden"
          >
            <div className={`w-20 h-20 ${role.color} text-white rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
              <role.icon size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{role.title}</h3>
            <p className="text-slate-500 leading-relaxed">{role.desc}</p>
            
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-4 transition-all">
              <span>Continue to Login</span>
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ShieldCheck size={12} />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <footer className="mt-20 text-slate-400 text-sm font-medium">
        &copy; 2023 HostelEase Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default SelectRole;
