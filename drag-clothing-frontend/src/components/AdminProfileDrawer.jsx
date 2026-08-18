import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, ShieldCheck, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminProfileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToSettings = () => {
    onClose();
    navigate('/superadmin/settings');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="drawer-wrapper">
          {/* BACKGROUND OVERLAY */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998]"
          />

          {/* RIGHT-SIDE DRAWER */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[999] flex flex-col border-l border-gray-100 rounded-l-[2rem] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <h2 className="text-xl font-black uppercase tracking-tighter">My Profile</h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto space-y-8">
              
              {/* Avatar Profile Section */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-[#EBE9E0] text-[#9B4819] flex items-center justify-center text-3xl font-black mb-4 shadow-inner">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#111]">
                  {user?.name || 'Super Admin'}
                </h3>
                <span className="inline-flex items-center gap-1.5 py-1 px-3 mt-2 rounded-lg bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest">
                  <ShieldCheck size={10} /> {user?.role?.replace('_', ' ') || 'SYSTEM ADMIN'}
                </span>
              </div>

              {/* Detail Cards */}
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Mail size={16} className="text-gray-400" /></div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Account Email</p>
                    <p className="text-xs font-bold text-[#111] truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><User size={16} className="text-gray-400" /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Account ID</p>
                    <p className="text-[10px] font-bold text-[#111] uppercase">{user?.id?.split('-')[0] || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-2">
                <button onClick={goToSettings} className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-[#1A1A1A] rounded-2xl transition-all group">
                  <div className="flex items-center gap-3">
                    <Settings size={16} className="text-gray-400 group-hover:text-[#1A1A1A]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">System Settings</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1A1A1A]" />
                </button>
              </div>

            </div>

            {/* Footer / Logout */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 mt-auto">
              <button 
                onClick={handleLogout}
                className="w-full flex justify-center items-center gap-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LogOut size={16} /> Secure Logout
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

export default AdminProfileDrawer;