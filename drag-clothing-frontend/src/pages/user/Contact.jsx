import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Github, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';

// --- TEAM CONTACT DATA ---
const teamContacts = [
  {
    id: 1,
    name: "Ronit Bhati",
    role: "Frontend Sorcerer",
    email: "bhatironit03@gmail.com",
    phone: "+91 98765 43210", 
    socials: {
      github: "https://github.com/ronit",
      linkedin: "https://www.linkedin.com/in/ronitbhati12",
      instagram: "https://www.instagram.com/ronitbhati12/"
    }
  },
  {
    id: 3, 
    name: "Chandrabhan S. Jhala",
    role: "Backend Overlord",
    email: "chandrabhansinghjhala03@gmail.com",
    phone: "+91 98765 43211", 
    socials: {
      github: "https://github.com/Jhalachandrabhan",
      linkedin: "https://www.linkedin.com/in/jhalachandrabhan03/",
      instagram: "https://www.instagram.com/jhalachandrabhansingh.03/"
    }
  },
  {
    id: 2, 
    name: "Chandrabhan S. Chouhan",
    role: "Full-Stack Chameleon",
    email: "cschouhan299@gmail.com",
    phone: "+91 98765 43212", 
    socials: {
      github: "https://github.com/Chandrabhan-max",
      linkedin: "https://www.linkedin.com/in/chandrabhan03/"
    }
  },
  {
    id: 4,
    name: "Sagar Singh Tomar",
    role: "Cloud Guardian",
    email: "sagarrsinghh11@gmail.com",
    phone: "+91 98765 43213", 
    socials: {
      github: "https://github.com/sagarrsinghh",
      linkedin: "https://www.linkedin.com/in/sagarrsingh/",
      instagram: "https://www.instagram.com/sagarrsingh10/"
    }
  }
];

const Contact = () => {
  // Animations
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#FF4D00] selection:text-white pt-[100px] pb-16 px-6 md:px-12 lg:px-24">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial="hidden" animate="visible" variants={stagger}
        className="max-w-7xl mx-auto mb-12 md:mb-16"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
          <div className="w-8 h-[2px] bg-[#FF4D00]"></div>
          <span className="text-[#FF4D00] text-[10px] font-black uppercase tracking-[0.2em]">Communicate</span>
        </motion.div>
        
        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-[#1A1A1A]">
          Let's <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D00] to-[#FF8A00]">Talk.</span>
        </motion.h1>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        
        {/* LEFT: FORM IN A CLEAN WHITE BOX */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white border border-[#1A1A1A]/10 p-8 rounded-2xl shadow-sm h-fit"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-1 text-[#1A1A1A]">Drop a line</h3>
            <p className="text-[#1A1A1A]/60 text-sm font-medium">For business inquiries, collaborations, or just to say hi.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 ml-1">Your Name</label>
              <input type="text" id="name" required className="w-full bg-[#F5F5F0] border border-[#1A1A1A]/5 rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF4D00]/50 transition-colors" placeholder="John Doe" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 ml-1">Your Email</label>
              <input type="email" id="email" required className="w-full bg-[#F5F5F0] border border-[#1A1A1A]/5 rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF4D00]/50 transition-colors" placeholder="john@example.com" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 ml-1">Your Message</label>
              <textarea id="message" required rows="3" className="w-full bg-[#F5F5F0] border border-[#1A1A1A]/5 rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#FF4D00]/50 transition-colors resize-none custom-scrollbar" placeholder="What's on your mind?"></textarea>
            </div>

            <button type="submit" className="w-full mt-4 bg-[#1A1A1A] text-white hover:bg-[#FF4D00] transition-colors py-3.5 rounded-xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] group">
              <span>Send Message</span>
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </button>
          </form>
        </motion.div>

        {/* RIGHT: DIRECT LINES (TEAM DIRECTORY IN WHITE CARDS) */}
        <motion.div 
          initial="hidden" animate="visible" variants={stagger}
          className="flex flex-col"
        >
          <motion.div variants={fadeUp} className="mb-6 px-2">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-1 text-[#1A1A1A]">Direct Lines</h3>
            <p className="text-[#1A1A1A]/60 text-sm font-medium">Bypass the frontend. Talk directly to the engine.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            {teamContacts.map((member) => (
              <motion.div 
                variants={fadeUp} 
                key={member.id}
                className="group p-5 bg-white border border-[#1A1A1A]/10 hover:border-[#FF4D00]/30 hover:shadow-md rounded-2xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Name & Role */}
                <div className="sm:w-1/3">
                  <h4 className="text-base font-bold uppercase tracking-tight text-[#1A1A1A] group-hover:text-[#FF4D00] transition-colors">{member.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50 mt-1">{member.role}</p>
                </div>

                {/* Contact Info (Grey Badges inside White Box) */}
                <div className="flex flex-col gap-2 sm:w-1/3">
                  <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/70 hover:text-[#FF4D00] transition-colors bg-[#F5F5F0] px-3 py-2 rounded-lg border border-[#1A1A1A]/5">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="font-mono truncate">{member.email}</span>
                  </a>
                  <a href={`tel:${member.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 text-xs text-[#1A1A1A]/70 hover:text-[#FF4D00] transition-colors bg-[#F5F5F0] px-3 py-2 rounded-lg border border-[#1A1A1A]/5">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-mono">{member.phone}</span>
                  </a>
                </div>
                
                {/* Social Icons */}
                <div className="flex items-center gap-2 sm:justify-end sm:w-1/4">
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-[#F5F5F0] border border-[#1A1A1A]/5 text-[#1A1A1A]/60 hover:bg-[#1A1A1A] hover:text-white transition-all">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-[#F5F5F0] border border-[#1A1A1A]/5 text-[#1A1A1A]/60 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.socials.instagram && (
                    <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-[#F5F5F0] border border-[#1A1A1A]/5 text-[#1A1A1A]/60 hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all">
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Contact;