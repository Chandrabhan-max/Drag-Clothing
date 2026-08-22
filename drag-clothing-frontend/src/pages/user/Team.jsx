import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Server,
  Layers,
  Code2,
  ArrowUpRight,
  X,
  Github,
  Linkedin,
  Instagram,
  Mail
} from 'lucide-react';

// --- DATA CONFIGURATION ---
const teamMembers = [

  {
    id: 2,
    name: "Chandrabhan Singh Chouhan",
    role: "Full-Stack Chameleon",
    shortDesc: "The bridge between 'looks good' and 'actually works'.",
    bio: "The Swiss Army knife of the team. One minute he's debugging a complex middleware flow, the next he's tweaking a React hook. He speaks both 'Client' and 'Server' fluently, making sure the two sides don't start a war with each other.",
    tags: ["Full Stack", "API Ninja", "Node.js"],
    image: "WhatsApp Image 2026-02-18 at 5.25.30 PM.jpeg",
    icon: <Layers className="w-5 h-5" />,
    audio: "/MFgabru.mp3",
    socials: {
      github: "https://github.com/Chandrabhan-max",
      linkedin: "https://www.linkedin.com/in/chandrabhan03/",
      mail: "mailto:cschouhan299@gmail.com"
    }
  },

  {
    id: 1,
    name: "Ronit Bhati",
    role: "Frontend Sorcerer",
    shortDesc: "Turning caffeine into pixel-perfect reality.",
    bio: "The guy who refuses to accept that 'good enough' is a thing. Ronit lives in the land of 60fps animations and nested components. If a button is 1px off-center, he won't sleep. He’s basically the reason the site doesn't look like it's from 1995.",
    tags: ["React Wizard", "UI/UX", "Tailwind Junkie"],
    image: "Ronit.jpg",
    icon: <Layout className="w-5 h-5" />,
    audio: "/badtameez-dil_KNpiYt2m.mp3",
    socials: {
      github: "https://github.com/ronit",
      linkedin: "www.linkedin.com/in/ronitbhati12",
      instagram: "https://www.instagram.com/ronitbhati12/",
      mail: "mailto:bhatironit03@gmail.com"
    }
  },
  {
    id: 3,
    name: "Chandrabhan Singh Jhala",
    role: "Backend Overlord",
    shortDesc: "Architecting chaos into scalable systems.",
    bio: "While you're looking at pretty buttons, Chandrabhan is in the trenches fighting race conditions and optimizing schemas. He builds the kind of logic that stays standing when the traffic hits like a freight train. 'It works on my machine' isn't in his vocabulary.",
    tags: ["System Architect", "Query Optimizer", "Security"],
    image: "WhatsApp Image 2026-02-18 at 5.12.40 PM.jpeg",
    icon: <Server className="w-5 h-5" />,
    audio: "/Highway to Hell.mp3",
    socials: {
      github: "https://github.com/Jhalachandrabhan",
      linkedin: "https://www.linkedin.com/in/jhalachandrabhan03/",
      instagram: "https://www.instagram.com/jhalachandrabhansingh.03/",
      mail: "mailto:chandrabhansinghjhala03@gmail.com"
    }
  },
  {
    id: 4,
    name: "Sagar Singh Tomar",
    role: "Cloud Guardian",
    shortDesc: "Automating himself out of a job (not really).",
    bio: "Sagar deals with the stuff that keeps other devs awake at night: infrastructure and data integrity. He manages the pipes through which the data flows. If the server is up and the database is fast, you can thank him. If it's down... well, it won't be.",
    tags: ["DevOps", "Cloud Native", "Data Integrity"],
    image: "WhatsApp Image 2026-02-18 at 5.11.17 PM.jpeg",
    icon: <Code2 className="w-5 h-5" />,
    audio: " Maruti.mp3",
    socials: {
      github: "https://github.com/sagarrsinghh",
      linkedin: "https://www.linkedin.com/in/sagarrsingh/",
      instagram: "https://www.instagram.com/sagarrsingh10/",
      mail: "mailto:sagarrsinghh11@gmail.com"
    }
  }
];

const TeamImmersive = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const audioRef = useRef(null);

  // --- AUDIO LOGIC (PLAY ON CARD OPEN) ---
  useEffect(() => {
    // Reset previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Check if member is selected AND has audio path
    if (selectedMember && selectedMember.audio) {
      // Public folder access: Simply use the string path
      audioRef.current = new Audio(selectedMember.audio);
      audioRef.current.volume = 0.4;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio playback prevented by browser:", error);
        });
      }
    }

    // Cleanup: Stop audio when popup closes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [selectedMember]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#E0E0E0] relative">

      <div className="w-full max-w-7xl mx-auto px-6 pt-24 pb-12 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="
  border-b
  border-[#1A1A1A]/10
  pb-8
  mb-12
  flex
  flex-col
  md:flex-row
  justify-between
  items-start
  md:items-end
  gap-6
"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-2">
              The <span className="font-semibold">Team</span>.
            </h1>
            <p className="text-lg text-[#1A1A1A]/60 max-w-xl">
              Meet the minds behind the machine.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/40">Role Distribution</div>
            <div className="text-sm font-medium mt-1">1 Frontend · 1 Hybrid · 2 Backend</div>
          </div>
        </motion.div>

        <div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-4
  gap-4
  h-auto
  md:h-[500px]
">
          {teamMembers.map((member, index) => (
            <ImageCard
              key={member.id}
              member={member}
              index={index}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMember(null)}
            className="
        fixed
        inset-0
        z-50
        bg-[#1A1A1A]/30
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
        overflow-y-auto
      "
          >
            <motion.div
              layoutId={`card-${selectedMember.id}`}
              className="
  bg-white
  w-full
  max-w-4xl
  max-h-[92vh]
  overflow-y-auto
  shadow-2xl
  flex
  flex-col
  md:flex-row
  items-stretch
"
              onClick={(e) => e.stopPropagation()}
            >

              {/* ================= IMAGE ================= */}

              <div
                className="
    w-full
    md:w-5/12
    relative
    bg-[#F1F1EC]
    shrink-0
    md:self-stretch
  "
              >
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="
    block
    w-full
    h-auto
    md:h-full
    object-cover
    object-top
  "
                />
                <div className="
            absolute
            inset-0
            pointer-events-none
            bg-black/10
          " />

                {/* AUDIO INDICATOR */}

                {selectedMember.audio && (
                  <div className="
              absolute
              bottom-6
              right-6
              flex
              gap-1
              items-end
              h-6
            ">

                    <motion.div
                      animate={{
                        height: [6, 24, 6],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: 'linear',
                      }}
                      className="
                  w-1.5
                  bg-white/90
                  rounded-full
                "
                    />

                    <motion.div
                      animate={{
                        height: [6, 36, 6],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.1,
                        ease: 'linear',
                        delay: 0.2,
                      }}
                      className="
                  w-1.5
                  bg-white/90
                  rounded-full
                "
                    />

                    <motion.div
                      animate={{
                        height: [6, 18, 6],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        ease: 'linear',
                        delay: 0.4,
                      }}
                      className="
                  w-1.5
                  bg-white/90
                  rounded-full
                "
                    />

                  </div>
                )}

              </div>


              {/* ================= CONTENT ================= */}

              <div className="
          w-full
          md:w-7/12
          shrink-0
          p-8
          md:p-12
          relative
        ">

                {/* CLOSE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedMember(null)
                  }
                  className="
              absolute
              top-6
              right-6
              p-2
              rounded-full
              bg-gray-100
              hover:bg-gray-200
              transition-colors
            "
                  aria-label="Close profile"
                >
                  <X className="
              w-5
              h-5
              text-gray-600
            " />
                </button>


                {/* ROLE */}

                <div className="
            flex
            items-center
            gap-2
            mb-4
            text-[#FF4D00]
            text-xs
            font-bold
            uppercase
            tracking-widest
          ">
                  {selectedMember.icon}

                  <span>
                    {selectedMember.role}
                  </span>
                </div>


                {/* NAME */}

                <h2 className="
            text-4xl
            font-medium
            tracking-tight
            mb-6
            text-gray-900
            pr-10
          ">
                  {selectedMember.name}
                </h2>


                {/* BIO */}

                <p className="
            text-gray-600
            text-lg
            leading-relaxed
            mb-8
          ">
                  {selectedMember.bio}
                </p>


                {/* TECH STACK */}

                <div className="mb-8">

                  <span className="
              block
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-gray-400
              mb-3
            ">
                    Tech Stack
                  </span>

                  <div className="
              flex
              flex-wrap
              gap-2
            ">

                    {selectedMember.tags.map(
                      (tag) => (
                        <span
                          key={tag}
                          className="
                      px-3
                      py-1
                      bg-gray-100
                      text-gray-600
                      text-xs
                      font-medium
                      uppercase
                      tracking-wider
                      rounded-sm
                    "
                        >
                          {tag}
                        </span>
                      )
                    )}

                  </div>

                </div>


                {/* SOCIALS */}

                <div className="
            flex
            flex-wrap
            gap-6
            pt-6
            border-t
            border-gray-100
          ">

                  {selectedMember.socials.github && (
                    <a
                      href={
                        selectedMember.socials.github
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                  group
                  flex
                  items-center
                  gap-2
                  text-gray-400
                  hover:text-black
                  transition-colors
                "
                    >
                      <Github className="w-5 h-5" />

                      <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                ">
                        Github
                      </span>
                    </a>
                  )}

                  {selectedMember.socials.linkedin && (
                    <a
                      href={
                        selectedMember.socials.linkedin
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                  group
                  flex
                  items-center
                  gap-2
                  text-gray-400
                  hover:text-[#0077b5]
                  transition-colors
                "
                    >
                      <Linkedin className="w-5 h-5" />

                      <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                ">
                        LinkedIn
                      </span>
                    </a>
                  )}

                  {selectedMember.socials.instagram && (
                    <a
                      href={
                        selectedMember.socials.instagram
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                  group
                  flex
                  items-center
                  gap-2
                  text-gray-400
                  hover:text-[#E1306C]
                  transition-colors
                "
                    >
                      <Instagram className="w-5 h-5" />

                      <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                ">
                        Instagram
                      </span>
                    </a>
                  )}

                  {selectedMember.socials.mail && (
                    <a
                      href={
                        selectedMember.socials.mail
                      }
                      className="
                  group
                  flex
                  items-center
                  gap-2
                  text-gray-400
                  hover:text-[#EA4335]
                  transition-colors
                "
                    >
                      <Mail className="w-5 h-5" />

                      <span className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                ">
                        Email
                      </span>
                    </a>
                  )}

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

const ImageCard = ({ member, index, onClick }) => {
  return (
    <motion.div
      layoutId={`card-container-${member.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="
  group
  relative
  w-full
  h-[420px]
  sm:h-[500px]
  md:h-full
  overflow-hidden
  cursor-pointer
  rounded-sm
"
    >
      <img
        src={member.image}
        alt={member.name}
        className="
    absolute
    inset-0
    w-full
    h-full
    object-cover
    md:object-cover
    object-[center_20%]
    md:object-center
    transition-all
    duration-700
    ease-in-out
    grayscale
    group-hover:grayscale-0
    group-hover:scale-105
  "
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full text-white">
          {member.icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-6 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="text-2xl font-medium text-white mb-1">
          {member.name}
        </h3>
        <div className="overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            {member.role}
          </p>
          <p className="text-sm text-white/60 line-clamp-2 opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-500 delay-100">
            {member.shortDesc}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
          <span>View Profile</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
};

export default TeamImmersive;