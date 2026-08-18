import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added MapPin icon
import { Plus, Search, Edit2, Trash2, X, Globe, Phone, MapPin, Archive, AlertTriangle, RefreshCcw, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'IND', maxLen: 10 },
  { code: '+1', flag: '🇺🇸', name: 'USA', maxLen: 15 },
  { code: '+44', flag: '🇬🇧', name: 'UK', maxLen: 15 },
  { code: '+971', flag: '🇦🇪', name: 'UAE', maxLen: 15 },
  { code: '+61', flag: '🇦🇺', name: 'AUS', maxLen: 15 },
];

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('active');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedClient, setSelectedClient] = useState(null);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data.data || []);
    } catch (error) {
      console.error('Fetch clients failed:', error);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', password: '', address: '' });
    setSelectedCountry(COUNTRIES[0]);
    setPhoneDigits('');
    setPhoneError('');
    setSubmitError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setFormData({ 
      name: client.name, 
      email: client.email, 
      password: '', 
      address: client.address || '' // Load existing address
    });

    const foundCountry = COUNTRIES.find(c => client.phone?.startsWith(c.code)) || COUNTRIES[0];
    setSelectedCountry(foundCountry);
    setPhoneDigits(client.phone?.replace(foundCountry.code, '').trim() || '');
    setPhoneError('');
    setSubmitError('');

    setIsFormModalOpen(true);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > selectedCountry.maxLen) return;
    setPhoneDigits(val);
    if (selectedCountry.code === '+91' && val.length > 0 && val.length < 10) setPhoneError('Indian phone numbers must be 10 digits.');
    else if (val.length > 0 && val.length < 5) setPhoneError('Number too short.');
    else setPhoneError('');
  };

  const handleCountryChange = (e) => {
    const newCountry = COUNTRIES.find(c => c.code === e.target.value);
    setSelectedCountry(newCountry);
    setPhoneDigits('');
    setPhoneError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const fullPhone = `${selectedCountry.code} ${phoneDigits}`;
    setIsLoading(true);

    try {
      const payload = { 
        ...formData, 
        phone: fullPhone, 
        address: formData.address || null 
      };

      if (modalMode === 'add') {
        await api.post('/admin/clients', payload);
      } else {
        if (!payload.password) delete payload.password;
        await api.put(`/admin/clients/${selectedClient.id}`, payload);
      }
      setIsFormModalOpen(false);
      await fetchClients();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'An error occurred while saving.';
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type) => {
    setIsLoading(true);
    try {
      if (type === 'soft') {
        await api.delete(`/admin/clients/${selectedClient.id}`);
      } else {
        await api.delete(`/admin/clients/${selectedClient.id}/permanent`);
      }
      setIsDeleteModalOpen(false);
      await fetchClients();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/admin/clients/${id}/restore`);
      await fetchClients();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const filteredClients = clients
    .filter(c => {
      const isClientActive = (c.isActive == 1 || c.isActive === true || c.is_active == 1 || c.is_active === true);
      return viewMode === 'active' ? isClientActive : !isClientActive;
    })
    .filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Manage Clients</h1>
          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-bold">Directory of onboarded clients</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">
            <button onClick={() => setViewMode('active')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-[#1A1A1A] text-white' : 'text-gray-400 hover:text-black'}`}>Active</button>
            <button onClick={() => setViewMode('archived')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'archived' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-red-500'}`}><Archive size={14} /> Bin</button>
          </div>
          <button onClick={openAddModal} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-xl md:w-auto flex-1">
            <Plus size={16} /> Add Brand
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="SEARCH BRANDS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all shadow-sm" />
      </div>

      {/* CLIENT GRID */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-16 text-center shadow-sm">
          <Archive size={40} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No Brands Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
             const isLive = (client.isActive == 1 || client.isActive === true || client.is_active == 1 || client.is_active === true);
             return (
              <motion.div layout key={client.id} className={`bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl transition-all relative overflow-hidden group ${!isLive ? 'border-red-100' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${isLive ? 'bg-[#EBE9E0] text-[#9B4819]' : 'bg-red-50 text-red-400'}`}>
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex gap-2">
                    {isLive ? (
                      <>
                        <button onClick={() => openEditModal(client)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-black transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => openDeleteModal(client)} className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(client.id)} className="p-2 hover:bg-green-50 rounded-xl text-green-600 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"><RefreshCcw size={12}/> Restore</button>
                        <button onClick={() => openDeleteModal(client)} className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#111] mb-4 truncate">{client.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate"><Globe size={12} className={isLive ? "text-[#9B4819]" : "text-gray-300"} /> {client.email}</div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate"><Phone size={12} className={isLive ? "text-[#9B4819]" : "text-gray-300"} /> {client.phone}</div>
                  {/* DISPLAY ADDRESS ON CARD */}
                  <div className="flex items-start gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                    <MapPin size={12} className={`mt-0.5 shrink-0 ${isLive ? "text-[#9B4819]" : "text-gray-300"}`} /> 
                    <span className="line-clamp-2">{client.address || 'NO ADDRESS PROVIDED'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setIsFormModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
              <div className="mb-8"><h2 className="text-3xl font-black uppercase tracking-tighter">{modalMode === 'add' ? 'Onboard Brand' : 'Update Brand'}</h2></div>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {submitError && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                    {submitError} 
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      Brand Name
                      {modalMode === 'add' && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      Official Email
                      {modalMode === 'add' && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                    {modalMode === 'add' ? 'Access Password' : 'New Password (Optional)'}
                  </label>
                  {modalMode === 'add' && <span className="text-red-500 mr-1">*</span>}
                  <input type="password" required={modalMode === 'add'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 flex justify-between">
                    <span>
                      Contact Phone
                      {modalMode === 'add' && <span className="text-red-500 mr-1">*</span>}
                    </span>
                  </label>
                  <div className="flex w-full bg-gray-50 rounded-2xl overflow-hidden focus-within:ring-2 transition-all focus-within:ring-[#1A1A1A]">
                    <div className="relative border-r border-gray-200">
                      <select value={selectedCountry.code} onChange={handleCountryChange} className="h-full pl-4 pr-8 bg-transparent text-sm font-bold outline-none appearance-none cursor-pointer">
                        {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <input type="tel" required value={phoneDigits} onChange={handlePhoneChange} className="w-full bg-transparent border-none p-4 text-sm font-bold outline-none" />
                  </div>
                  {phoneError && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-1 mt-1">{phoneError}</p>}
                </div>

                {/* ADDRESS FIELD (Optional) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                    Headquarters Address <span className="text-[8px] tracking-normal lowercase opacity-70">(optional)</span>
                  </label>
                  <textarea 
                    rows="3"
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    placeholder="Enter physical address..."
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A] resize-none"
                  />
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] flex justify-center items-center text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-black/10">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (modalMode === 'add' ? 'Complete Onboarding' : 'Save Changes')}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && selectedClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsDeleteModalOpen(false)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111] mb-2">
                {(selectedClient.isActive == 1 || selectedClient.isActive === true || selectedClient.is_active == 1 || selectedClient.is_active === true) 
                  ? 'Archive Brand?' 
                  : 'Permanently Delete?'}
              </h2>
              
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
                {(selectedClient.isActive == 1 || selectedClient.isActive === true || selectedClient.is_active == 1 || selectedClient.is_active === true) 
                  ? `You are about to move ${selectedClient.name} to the bin. You can restore them later.` 
                  : `This action cannot be undone. ${selectedClient.name} will be erased from the system forever.`}
              </p>
              
              <div className="flex gap-4">
                <button 
                  disabled={isLoading} 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1 bg-gray-50 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isLoading} 
                  onClick={() => handleDelete(
                    (selectedClient.isActive == 1 || selectedClient.isActive === true || selectedClient.is_active == 1 || selectedClient.is_active === true) 
                      ? 'soft' 
                      : 'permanent'
                  )} 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20 flex justify-center items-center"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageClients;