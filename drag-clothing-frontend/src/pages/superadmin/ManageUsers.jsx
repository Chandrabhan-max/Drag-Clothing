import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ShieldCheck, X, Loader2, Archive, AlertTriangle, RefreshCcw, Users, UserCircle, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';

const ManageUsers = () => {

  const [activeTab, setActiveTab] = useState('system'); // 'system' | 'customers'
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived'
  const [searchTerm, setSearchTerm] = useState('');

  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'manager', // Default to lowercase to match backend DTO
    clientId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchClients();
    fetchCustomers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      const hierarchy = res.data.data;
      let formatted = [];

      hierarchy.clients?.forEach(item => {
        formatted.push({
          id: item.client.id,
          name: item.client.name,
          email: item.client.email,
          role: 'client',
          clientId: item.client.clientId,
          isActive: item.client.isActive ?? true 
        });
        
        item.managers?.forEach(manager => {
          formatted.push({
            id: manager.id,
            name: manager.name,
            email: manager.email,
            role: 'manager',
            clientId: manager.clientId,
            isActive: manager.isActive ?? true
          });
        });
      });

      if (hierarchy.superAdmin) {
        formatted.unshift({
          id: hierarchy.superAdmin.id,
          name: hierarchy.superAdmin.name,
          email: hierarchy.superAdmin.email,
          role: 'super_admin',
          clientId: null,
          isActive: true
        });
      }
      setUsers(formatted);
    } catch (error) {
      console.error('Fetch users failed:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data.data);
    } catch (error) {}
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers'); 
      const rawCustomers = res.data.data || [];
      
      const mappedCustomers = rawCustomers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        role: 'customer',
        clientId: null, 
        isActive: c.status === 'ACTIVE' && !c.deleted_at && !c.deleted_at
      }));
      
      setCustomers(mappedCustomers);
    } catch (error) {
      console.log("Customer fetch failed.");
    }
  };

  // ===============================
  // MODAL HANDLERS
  // ===============================

  const openAddModal = () => {
    setModalMode('add');
    setSelectedUser(null);
    setSubmitError('');
    const defaultRole = activeTab === 'customers' ? 'customer' : 'manager';
    setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: defaultRole, clientId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setSubmitError('');
    const nameParts = (user.name || '').split(' ');
    setFormData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: (user.role || '').toLowerCase(), // Force lowercase for DTO
      clientId: user.clientId || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirmation = () => {
    setIsModalOpen(false); 
    setIsDeleteModalOpen(true); 
  };

  // ===============================
  // ACTIONS
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');

    const isCustomer = formData.role === 'customer';
    const endpointPrefix = isCustomer ? '/admin/customers' : '/admin/users';

    try {
      if (modalMode === 'add') {
        // Create new user (includes clientId)
        await api.post('/admin/users', { ...formData, role: formData.role, clientId: formData.clientId || undefined });
      } else {
        // Update user (Excludes clientId intentionally)
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();
        await api.put(`${endpointPrefix}/${selectedUser.id}`, { 
          name: fullName, 
          email: formData.email, 
          role: formData.role 
        });
      }
      setIsModalOpen(false);
      fetchUsers();
      fetchCustomers();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Action failed.';
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type) => {
    setIsLoading(true);
    const isCustomer = selectedUser?.role?.toLowerCase() === 'customer';
    const endpointPrefix = isCustomer ? '/admin/customers' : '/admin/users';

    try {
      if (type === 'soft') {
        await api.delete(`${endpointPrefix}/${selectedUser.id}`);
      } else {
        await api.delete(`${endpointPrefix}/${selectedUser.id}/permanent`);
      }
      setIsDeleteModalOpen(false);
      fetchUsers();
      fetchCustomers();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id, role) => {
    const isCustomer = role?.toLowerCase() === 'customer';
    const endpointPrefix = isCustomer ? '/admin/customers' : '/admin/users';
    
    try {
      await api.put(`${endpointPrefix}/${id}/restore`);
      fetchUsers();
      fetchCustomers();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const sourceData = activeTab === 'system' ? users : customers;
  const filteredData = sourceData
    .filter(u => viewMode === 'active' ? u.isActive !== false : u.isActive === false) 
    .filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">User Directory</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Hierarchical Access Management</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">
            <button onClick={() => setViewMode('active')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'active' ? 'bg-[#1A1A1A] text-white' : 'text-gray-400 hover:text-black'}`}>Active</button>
            <button onClick={() => setViewMode('archived')} className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'archived' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-red-500'}`}><Archive size={14} /> Bin</button>
          </div>
          
          <button onClick={openAddModal} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-xl md:w-auto flex-1">
            <Plus size={16} />{activeTab === 'customers' ? 'Create Customer' : 'Assign Manager'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex gap-6 w-full md:w-auto overflow-x-auto">
          <button onClick={() => setActiveTab('system')} className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'system' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-gray-400 hover:text-gray-800'}`}>
            <ShieldCheck size={18} /> System Staff
          </button>
          <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${activeTab === 'customers' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-gray-400 hover:text-gray-800'}`}>
            <Users size={18} /> End Customers
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input type="text" placeholder="SEARCH..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-[#EEE] rounded-2xl py-3 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all" />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-16 text-center shadow-sm">
          <UserCircle size={40} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No {activeTab === 'system' ? 'Staff' : 'Customers'} Found in {viewMode}</h3>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F5F5F5] bg-gray-50/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">User Details</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Security Role</th>
                {activeTab === 'system' && (
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Assigned To</th>
                )}
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9F9F9]">
              {filteredData.map((user) => (
                <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] ${user.isActive === false ? 'bg-red-50 text-red-500' : 'bg-[#F5F5F5] text-[#111]'}`}>
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`text-xs font-black uppercase tracking-tight ${user.isActive === false ? 'text-gray-400 line-through' : 'text-[#111]'}`}>{user.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 lowercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeTab === 'customers' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      <ShieldCheck size={12} /> {user.role || 'CUSTOMER'}
                    </span>
                  </td>
                  {activeTab === 'system' && (
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                        {user.clientId ? (
                          <><span className="w-2 h-2 rounded-full bg-[#9B4819]"></span> {clients.find(c => c.id === user.clientId)?.name || 'Unknown Brand'}</>
                        ) : (
                          <span className="text-gray-300">System Level</span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      {user.isActive !== false ? (
                         <button onClick={() => openEditModal(user)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white text-[#111] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"><Edit2 size={12} /> Edit Profile</button>
                      ) : (
                        <button onClick={() => handleRestore(user.id, user.role)} className="px-4 py-2 bg-green-50 text-[10px] flex items-center gap-2 font-black uppercase tracking-widest text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all"><RefreshCcw size={12}/> Restore</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    {modalMode === 'add' 
                    ? (formData.role === 'customer' ? 'Customer Registration' : 'Assign Brand Manager') 
                    : 'Edit User Profile'}
                  </h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Set permissions and profile details</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <AnimatePresence>
                {submitError && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100">{submitError}</motion.div>}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      First Name
                      {modalMode === 'add' && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    <input 
                      required 
                      value={formData.firstName} 
                      onChange={e => setFormData({...formData, firstName: e.target.value})} 
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      Last Name <span className="text-[8px] tracking-normal lowercase opacity-70">(optional)</span>
                    </label>
                    <input 
                      value={formData.lastName} 
                      onChange={e => setFormData({...formData, lastName: e.target.value})} 
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      Email Address
                      {modalMode === 'add' && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      Phone <span className="text-[8px] tracking-normal lowercase opacity-70">(optional)</span>
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" 
                    />
                  </div>
                </div>
                
                {modalMode === 'add' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1"> 
                      Access Password
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <input 
                      required 
                      type="password" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" 
                    />
                  </div>
                )}

                {/* ONLY show Assigned Client dropdown if ADDING a System User (Manager). */}
                {modalMode === 'add' && formData.role !== 'customer' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                      Assigned Brand
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        required 
                        value={formData.clientId} 
                        onChange={e => setFormData({...formData, clientId: e.target.value})} 
                        className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A] appearance-none cursor-pointer"
                      >
                        <option value="">SELECT ASSIGNED CLIENT</option>
                        {clients.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isLoading} className="flex-1 bg-[#1A1A1A] hover:bg-[#9B4819] flex justify-center items-center text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl shadow-black/20">
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                      modalMode === 'add' 
                      ? (formData.role === 'customer' ? 'Register Customer' : 'Assign Manager') 
                      : 'Save Changes')}
                  </button>
                  
                  {modalMode === 'edit' && selectedUser?.role?.toLowerCase() !== 'super_admin' && (
                    <button type="button" onClick={openDeleteConfirmation} className="px-8 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE WARNING MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6"><AlertTriangle size={24} /></div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Delete {selectedUser?.role === 'customer' ? 'Customer' : 'User'}?</h2>
              <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">You are about to delete <strong>{selectedUser?.name}</strong>. Archive them temporarily or erase permanently.</p>
              <div className="space-y-3">
                {selectedUser?.isActive !== false && (
                  <button onClick={() => handleDelete('soft')} disabled={isLoading} className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:border-black hover:text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Deactivate (Move to Bin)</button>
                )}
                <button onClick={() => handleDelete('hard')} disabled={isLoading} className="w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  {isLoading ? 'Processing...' : 'Delete Permanently'}
                </button>
                <button onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading} className="w-full bg-transparent text-gray-400 hover:text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;