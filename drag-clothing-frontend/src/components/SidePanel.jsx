import React from 'react';

const SidePanel = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {/* Aesthetic Blur Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Minimal Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#FAFAFA] z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl flex flex-col border-l border-[#E5E5E5] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#E5E5E5] bg-white">
          <h2 className="text-sm font-black tracking-[0.2em] text-[#1A1A1A] uppercase">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E5E5E5] hover:border-[#1A1A1A] text-[#1A1A1A] transition-colors">
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default SidePanel;