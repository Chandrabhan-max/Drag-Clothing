import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, ShieldCheck, ChevronLeft, ChevronRight, Eye, Terminal, Clock, Fingerprint } from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';

const SuperAdminAudits = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Backend requires a startDate. Default to 7 days ago.
  const [filters, setFilters] = useState({
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/audit', {
        params: { ...filters, page, limit: 10 }
      });
      setLogs(response.data.data.data);
      setTotal(response.data.data.total);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters.startDate, filters.endDate]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'text-green-500 bg-green-500/10';
      case 'UPDATE': return 'text-blue-500 bg-blue-500/10';
      case 'DELETE': return 'text-red-500 bg-red-500/10';
      default: return 'text-orange-500 bg-orange-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-[#111]">Black Box</h1>
          <p className="text-[10px] font-bold text-[#9B4819] uppercase tracking-[0.4em] mt-2">System-Wide Audit Telemetry</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-4">
            <Calendar size={14} className="text-gray-400" />
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="text-[10px] font-black uppercase outline-none bg-transparent"
            />
          </div>
          <div className="h-4 w-[1px] bg-gray-200" />
          <div className="flex items-center gap-2 px-4">
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="text-[10px] font-black uppercase outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-[#9B4819] border-t-transparent rounded-full" />
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Timestamp / Actor</th>
              <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Transaction</th>
              <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Object ID</th>
              <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#111] group-hover:text-white transition-all">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-[#111]">{format(new Date(log.createdAt), 'HH:mm:ss')}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-1.5">
                    <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{log.entity}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={12} className="text-[#9B4819]" />
                    <code className="text-[10px] font-mono text-gray-400 truncate w-32">{log.entityId}</code>
                  </div>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => setSelectedLog(log)}
                    className="p-2 hover:bg-[#9B4819] hover:text-white rounded-xl transition-all text-gray-400"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Page {page} of {Math.ceil(total / 10)}</p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={page * 10 >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* JSON INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0A0A0A] w-full max-w-3xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal size={18} className="text-[#9B4819]" />
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Data Inspection</h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-white/40 hover:text-white font-black text-xs">CLOSE</button>
              </div>
              
              <div className="p-8 grid grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="text-[9px] font-black text-[#9B4819] uppercase mb-4 block">PRE-TRANSACTION</label>
                  <pre className="bg-black p-4 rounded-xl text-[10px] text-gray-400 font-mono overflow-x-auto border border-white/5">
                    {JSON.stringify(selectedLog.oldValue || {}, null, 2)}
                  </pre>
                </div>
                <div>
                  <label className="text-[9px] font-black text-green-500 uppercase mb-4 block">POST-TRANSACTION</label>
                  <pre className="bg-black p-4 rounded-xl text-[10px] text-green-400 font-mono overflow-x-auto border border-white/5 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
                    {JSON.stringify(selectedLog.newValue || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminAudits;