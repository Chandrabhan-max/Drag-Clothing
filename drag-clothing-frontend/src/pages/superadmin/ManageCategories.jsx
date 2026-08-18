import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Layers, X, Loader2, AlertTriangle, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

const ManageCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      // Calls your @Controller('categories')
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (error) { console.error('Fetch categories failed:', error); }
  };

  const openAddModal = () => {
    setModalMode('add'); setSelectedCategory(null); setSubmitError('');
    setFormData({ name: '', description: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit'); setSelectedCategory(category); setSubmitError('');
    setFormData({ name: category.name, description: category.description || '', imageUrl: category.imageUrl || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setIsLoading(true); 
    setSubmitError('');

    try {
      // 1. Create a copy of the form data
      const payload = { ...formData };

      // 2. THE FIX: If imageUrl is empty, completely remove it from the payload
      if (!payload.imageUrl || payload.imageUrl.trim() === '') {
        delete payload.imageUrl;
      }

      if (modalMode === 'add') {
        await api.post('/categories', payload); // Send the cleaned payload
      } else {
        await api.put(`/categories/${selectedCategory.id}`, payload); // Send the cleaned payload
      }
      
      setIsModalOpen(false); 
      fetchCategories();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Action failed.';
      setSubmitError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/categories/${selectedCategory.id}`);
      setIsDeleteModalOpen(false); fetchCategories();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally { setIsLoading(false); }
  };

  const filteredData = categories.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Categories</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Global Catalog Classification</p>
        </div>
        <button onClick={openAddModal} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-xl md:w-auto w-full">
          <Plus size={16} /> Create Category
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input type="text" placeholder="SEARCH CATEGORIES..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all shadow-sm" />
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-16 text-center shadow-sm">
          <Layers size={40} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No Categories Found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F5F5F5] bg-gray-50/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category Name</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F9F9F9]">
              {filteredData.map((category) => (
                <tr key={category.id} className="hover:bg-[#FAFAFA] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#EBE9E0] text-[#9B4819] flex items-center justify-center overflow-hidden">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-[#111]">{category.name}</h4>
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-bold text-gray-500 uppercase">{category.description || 'N/A'}</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEditModal(category)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white text-[#111] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"><Edit2 size={12} /> Edit</button>
                      <button onClick={() => { setSelectedCategory(category); setIsDeleteModalOpen(true); }} className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-xl transition-all"><Trash2 size={16} /></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{modalMode === 'add' ? 'New Category' : 'Edit Category'}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              {submitError && <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100">{submitError}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <input required placeholder="CATEGORY NAME (e.g. OUTERWEAR)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" />
                <textarea placeholder="DESCRIPTION" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A] resize-none" />
                <input type="url" placeholder="IMAGE URL (OPTIONAL)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]" />
                
                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] flex justify-center items-center text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all mt-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Save Category'}
                </button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto"><AlertTriangle size={32} /></div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Delete Category?</h2>
              <p className="text-gray-500 text-xs font-medium mb-8">Are you sure you want to permanently delete <strong>{selectedCategory?.name}</strong>? This may affect products currently using this category.</p>
              <button onClick={handleDelete} disabled={isLoading} className="w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-6">Yes, Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-transparent text-gray-400 hover:text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-2">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCategories;