import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, LayoutGrid, Activity, Plus, ArrowUpRight, Layers } from 'lucide-react';
import api from '../../api/axios';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeUsers: 0,
    totalUsers: 0,
    totalCategories: null // Changed to null so we know when it's loading
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Fetch both dashboard stats and the categories count at the same time
      const [dashboardRes, categoriesRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/products/categories') // Using the public endpoint we built earlier
      ]);

      let categoriesCount = null;
      if (categoriesRes.status === 'fulfilled') {
        categoriesCount = categoriesRes.value.data.data?.length || null;
      }

      const mainData = dashboardRes.status === 'fulfilled' ? dashboardRes.value.data.data : {};

      setDashboardData({
        ...mainData,
        totalCategories: categoriesCount
      });

    } catch (error) {
      console.error('Dashboard fetch failed:', error);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const stats = [
    { 
      label: "Total Clients", 
      value: dashboardData.totalClients || "...", 
      icon: <LayoutGrid size={20} />, 
      color: "bg-[#EBE9E0]",
      path: "/superadmin/clients"
    },
    { 
      label: "Active Users", 
      value: dashboardData.activeUsers || "...", 
      icon: <Users size={20} />, 
      color: "bg-[#D4DFE6]",
      path: "/superadmin/users" 
    },
    { 
      label: "Manage Categories", 
      // If we have the count, show it. Otherwise show "View" instead of 0
      value: dashboardData.totalCategories ? dashboardData.totalCategories : "View", 
      icon: <Layers size={20} />, 
      color: "bg-[#D9E2D5]",
      path: "/superadmin/categories"
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 selection:bg-[#9B4819] selection:text-white">
      
      {/* 1. EDITORIAL HEADER */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="flex flex-col md:flex-row justify-between items-end border-b border-[#E5E5E5] pb-10 gap-6"
      >
        <div>
          <div className="inline-block bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 mb-6 rounded-full">
            Control Center
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#111] leading-none">
            System <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] to-[#999]">Overview.</span>
          </h1>
        </div>
      </motion.div>

      {/* 2. PREMIUM STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ delay: index * 0.1 }}
            onClick={() => stat.path && navigate(stat.path)} 
            className={`${stat.color} rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px] group relative overflow-hidden transition-all ${stat.path ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-default'}`}
          >
            <div className="absolute -right-4 -bottom-4 text-black/5 group-hover:text-black/10 transition-colors">
               {React.cloneElement(stat.icon, { size: 120 })}
            </div>

            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20">
                {stat.icon}
              </div>
              {stat.path && (
                <ArrowUpRight size={20} className="text-black/30 group-hover:text-black group-hover:scale-110 transition-all" />
              )}
            </div>

            <div className="relative z-10 mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 mb-1">
                {stat.label}
              </p>
              {/* Added a dynamic class to make text smaller if it says "View" instead of a number */}
              <h3 className={`font-black tracking-tighter ${typeof stat.value === 'string' && stat.value === 'View' ? 'text-4xl mt-2' : 'text-5xl'}`}>
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. ACTIVITY TABLE */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[2.5rem] border border-[#E5E5E5] overflow-hidden shadow-sm"
      >
        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-widest">Recent Network Activity</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Status</span>
          </div>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
             <LayoutGrid size={32} className="text-gray-300" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            [ No new activity detected in this cycle ]
          </p>
          <button className="mt-6 text-[10px] font-bold uppercase tracking-widest text-[#9B4819] border-b-2 border-[#9B4819]/20 hover:border-[#9B4819] transition-all pb-1">
            Force Sync Now
          </button>
        </div>
      </motion.div>

    </div>
  );
};

export default SuperAdminDashboard;