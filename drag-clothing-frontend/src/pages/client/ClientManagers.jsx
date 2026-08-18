import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, X, Loader2, Archive, AlertTriangle, RefreshCcw, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';

const ClientManagers = () => {
  const [viewMode, setViewMode] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [managers, setManagers] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false); // NEW STATE
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedManager, setSelectedManager] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => { fetchManagers(); }, []);

  const fetchManagers = async () => {
    try { const res = await api.get('/client/managers'); setManagers(res.data.data || []); } 
    catch (error) { console.error('Fetch managers failed:', error); }
  };

  const openAddModal = () => { setModalMode('add'); setSelectedManager(null); setSubmitError(''); setFormData({ name: '', email: '', password: '' }); setIsModalOpen(true); };
  const openEditModal = (manager) => { setModalMode('edit'); setSelectedManager(manager); setSubmitError(''); setFormData({ name: manager.name, email: manager.email, password: '' }); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setSubmitError('');
    try {
      if (modalMode === 'add') await api.post('/client/managers', { name: formData.name, email: formData.email, password: formData.password });
      else await api.put(`/client/managers/${selectedManager.managerId}`, { name: formData.name, email: formData.email });
      setIsModalOpen(false); fetchManagers();
    } catch (error) {
      let msg = error.response?.data?.message || 'Action failed.';
      if (Array.isArray(msg)) msg = msg[0]; setSubmitError(String(msg));
    } finally { setIsLoading(false); }
  };

  const handleSoftDelete = async () => {
    setIsLoading(true);
    try { await api.delete(`/client/managers/${selectedManager.managerId}`); setIsDeleteModalOpen(false); fetchManagers(); } 
    catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleHardDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/client/managers/${selectedManager.managerId}/permanent`);
      
      setIsHardDeleteModalOpen(false);
      fetchManagers();
    } catch (error) {
      alert("Permanent delete failed. The backend must support the /permanent endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (managerId) => {
    try { await api.patch(`/client/managers/${managerId}/restore`); fetchManagers(); } catch (error) { console.error(error); }
  };

  const filteredData = managers.filter(m => {
    const isActive = m.isActive == 1 || m.isActive === true;
    return viewMode === 'active' ? isActive : !isActive;
  }).filter(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
        <div><h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Store Managers</h1><p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Staff Access</p></div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">
            <button onClick={() => setViewMode('active')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-[#1A1A1A] text-white' : 'text-gray-400 hover:text-black'}`}>Active</button>
            <button onClick={() => setViewMode('archived')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'archived' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-red-500'}`}><Archive size={14} /> Bin</button>
          </div>
          <button onClick={openAddModal} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] transition-all flex items-center gap-2 font-bold uppercase text-[10px] shadow-xl"><Plus size={16} /> Add Manager</button>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input type="text" placeholder="SEARCH STAFF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all shadow-sm" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Staff Info</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Email Address</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9F9F9]">
            {filteredData.map((manager) => {
              const isActive = manager.isActive == 1 || manager.isActive === true;
              return (
              <tr key={manager.managerId} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[12px] ${!isActive ? 'bg-red-50 text-red-500' : 'bg-[#EBE9E0] text-[#9B4819]'}`}>{manager.name?.charAt(0).toUpperCase()}</div>
                    <div><h4 className={`text-sm font-black uppercase ${!isActive ? 'text-gray-400 line-through' : 'text-[#111]'}`}>{manager.name}</h4></div>
                  </div>
                </td>
                <td className="p-6"><span className="text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{manager.email}</span></td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    {isActive ? (
                      <>
                        <button onClick={() => openEditModal(manager)} className="p-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => { setSelectedManager(manager); setIsDeleteModalOpen(true); }} className="p-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-xl transition-all"><Trash2 size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(manager.managerId)} className="px-4 py-2 bg-green-50 text-[10px] flex items-center gap-2 font-black uppercase text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all"><RefreshCcw size={12}/> Restore</button>
                        <button onClick={() => { setSelectedManager(manager); setIsHardDeleteModalOpen(true); }} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"><ShieldAlert size={14} /></button>
                      </>
                    )}
                  </div>                            
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Basic Create/Edit Modal removed for brevity in display, keeps existing logic perfectly */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl">
                <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-black uppercase tracking-tighter">{modalMode === 'add' ? 'Add Manager' : 'Edit Manager'}</h2><button onClick={() => setIsModalOpen(false)}><X size={24} /></button></div>
                {submitError && <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center">{submitError}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                   <input required placeholder="FULL NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none" />
                   <input required type="email" placeholder="EMAIL ADDRESS" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none" />
                   {modalMode === 'add' && <input required type="password" placeholder="PASSWORD" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none" />}
                   <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-5 rounded-2xl text-[10px] font-black uppercase mt-4">{isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Staff Member'}</button>
                </form>
             </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto"><AlertTriangle size={32} /></div>
                <h2 className="text-2xl font-black uppercase mb-2">Move to Bin?</h2>
                <button onClick={handleSoftDelete} disabled={isLoading} className="w-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase mt-6">Confirm</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase mt-2">Cancel</button>
             </motion.div>
          </div>
        )}

        {isHardDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto"><ShieldAlert size={32} /></div>
                <h2 className="text-2xl font-black uppercase mb-2">Permanent Delete?</h2>
                <p className="text-xs text-gray-500">This action destroys this manager's data completely.</p>
                <button onClick={handleHardDelete} disabled={isLoading} className="w-full bg-red-600 text-white hover:bg-red-700 py-4 rounded-xl text-[10px] font-black uppercase mt-6">Permanently Destroy</button>
                <button onClick={() => setIsHardDeleteModalOpen(false)} className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase mt-2">Cancel</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientManagers;