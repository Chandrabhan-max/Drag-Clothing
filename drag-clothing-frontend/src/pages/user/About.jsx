import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar'; 

const About = () => {
  // Ultra-smooth easing animations
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="bg-[#FAFAFA] text-zinc-900 min-h-screen font-sans selection:bg-orange-500 selection:text-white pt-[72px]">
      
      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- BOLD TICKER (MARQUEE) --- */}
      <div className="w-full bg-blue-400 py-4 overflow-hidden flex whitespace-nowrap border-b border-blue-700 relative z-10">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 12 }}
          className="flex space-x-12 text-white text-sm font-black uppercase tracking-[0.3em]"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center">
              NO OVER-PRICED HYPE <span className="mx-6 opacity-40">/</span> 
              JUST PURE DRAG <span className="mx-6 opacity-40">/</span> 
              RAW AESTHETICS <span className="mx-6 opacity-40">/</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-32 md:pb-40">
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="flex flex-col items-center text-center mb-20 md:mb-32"
        >
          <motion.div variants={fadeUp} className="mb-6 inline-block px-5 py-2 rounded-full bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
            Origin: 2026 / Jaipur
          </motion.div>
          
          <motion.h1 
            variants={fadeUp}
            className="text-7xl md:text-[10rem] font-black leading-[0.85] tracking-tighter uppercase text-zinc-900"
          >
            NOT JUST <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-rose-600">CLOTHES.</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeUp}
            className="mt-10 text-xl text-zinc-500 max-w-3xl font-medium leading-relaxed"
          >
            DRAG isn't for everyone. It's for the ones who find comfort in the chaos. 
            We don't follow trends; we kill them and start our own.
          </motion.p>
        </motion.div>

        {/* EDITORIAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger}
            className="md:col-span-5 space-y-10"
          >
            <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
              The <br/> Anti-Generic <br/> Movement.
            </motion.h2>
            
            <motion.div variants={fadeUp} className="space-y-6 text-zinc-600 text-lg md:text-xl leading-relaxed">
              <p>
                Market mein sab "Premium" bolte hain, hum **Real** bolte hain. 
                DRAG ka har ek piece ek statement hai—unke liye jo bheed se alag dikhna nahi, bheed ko lead karna jaante hain.
              </p>
              <p className="font-bold text-zinc-900 italic">
                "We don't sell fabric. We sell the guts to stand out."
              </p>
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="md:col-span-7 relative"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10 w-full h-[600px] rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white/20">
              <img 
                src="12345.png" 
                alt="Drag Energy" 
                className="object-cover w-full h-full hover:scale-110 transition-transform duration-[1.5s] ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-xs font-black tracking-widest uppercase opacity-70">Series 01</p>
                <h4 className="text-2xl font-bold italic underline decoration-orange-500 underline-offset-8">STREET MANIFESTO</h4>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CORE VALUES (THE TRINITY) --- */}
      <div className="bg-zinc-900 py-32 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {/* Value 1 */}
            <motion.div variants={fadeUp} className="group relative">
              <span className="text-9xl font-black text-white opacity-5 absolute -top-16 -left-4">01</span>
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter group-hover:text-orange-500 transition-colors">Obsessive Quality</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Fabric aisa jo skin par feel ho, aur durability aisi jo har ek grind jhel sake. We don't do 'fast fashion'.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div variants={fadeUp} className="group relative">
              <span className="text-9xl font-black text-white opacity-5 absolute -top-16 -left-4">02</span>
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter group-hover:text-rose-500 transition-colors">Raw Edge</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Design jo loud hai bina chillaye. Clean silhouettes with unexpected details. This is modern armor.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div variants={fadeUp} className="group relative">
              <span className="text-9xl font-black text-white opacity-5 absolute -top-16 -left-4">03</span>
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter group-hover:text-blue-500 transition-colors">Scarce Drops</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Exclusivity is our drug. Hum quantity nahi, impact banate hain. Ek baar gaya toh gaya. No restocks.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* --- FOOTER BANNER --- */}
      <footer className="w-full py-8 bg-black text-center border-t border-white/10">
        <div className="flex flex-col items-center gap-2">
           <p className="text-blue-400 text-xs font-black tracking-[0.5em] uppercase animate-pulse">
            High Voltage Lifestyle
          </p>
          <p className="text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
            ⚠️ Attention: This is a demo. Real products coming soon to disrupt your reality.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default About;