import React from 'react';
import { Link } from 'react-router-dom'; // Ensure react-router-dom is installed
import { ArrowUpRight, Instagram, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-[#050505] text-[#EBE9E0] pt-20 pb-6 overflow-hidden">
      
      {/* 1. TOP SECTION: NEWSLETTER & CTA */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          
          <div className="max-w-md">
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
              Join the <br/> <span className="text-[#9B4819]">Cult.</span>
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
              Exclusive drops, early access, and no spam.
            </p>
          </div>

          <div className="w-full md:w-auto flex-1 max-w-lg">
            <div className="flex items-end gap-4 border-b border-white/20 pb-4 group focus-within:border-[#9B4819] transition-colors duration-500">
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL" 
                className="bg-transparent w-full outline-none text-sm font-bold uppercase tracking-widest placeholder:text-white/20"
              />
              <button className="text-[10px] font-black uppercase tracking-widest hover:text-[#9B4819] transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. GRID LINKS */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-10 mb-20 border-t border-white/10 pt-16">
        
        {/* Column 1: Brand */}
        <div className="flex flex-col gap-6">
          <div className="text-2xl font-black italic tracking-tighter">DRAG.</div>
          <p className="text-[10px] uppercase tracking-widest opacity-40 leading-relaxed">
            Engineered in Jaipur.<br/>
            Worn in the Void.<br/>
            Est. 2026
          </p>
        </div>

     
        {/* Column 3: Company (TEAM SECTION HERE) */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9B4819] mb-6">Company</h4>
          <ul className="flex flex-col gap-3 text-xs font-medium uppercase tracking-widest opacity-70">
            <li><Link to="/about" className="hover:text-white hover:pl-2 transition-all duration-300">About</Link></li>
            
            {/* --- TEAM LINK --- */}
            <li className="flex items-center gap-2">
               <Link to="/team" className="hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2">
                 The Team 
               </Link>
            </li>
            {/* ----------------- */}

          
            <li><Link to="/contact" className="hover:text-white hover:pl-2 transition-all duration-300">Contact</Link></li>
          </ul>
        </div>

        {/* Column 4: Socials */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9B4819] mb-6">Connect</h4>
          <div className="flex gap-4">
             <a href="https://www.instagram.com/?hl=en" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
               <Instagram size={16} />
             </a>
             <a href="https://x.com/" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
               <Twitter size={16} />
             </a>
             <a href="mailto:bhatironit03@gmail.com" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
               <Mail size={16} />
             </a>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM WATERMARK & COPYRIGHT */}
      <div className="relative border-t border-white/10 pt-8 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-widest opacity-30">
        <p>© 2026 Drag Clothing System.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
        </div>
      </div>

      {/* GIANT WATERMARK */}
      <div className="pointer-events-none absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-full text-center overflow-hidden">
        <h1 className="text-[25vw] font-black uppercase tracking-tighter text-white/[0.02] leading-none select-none">
          DRAG.
        </h1>
      </div>

    </footer>
  );
};

export default Footer;