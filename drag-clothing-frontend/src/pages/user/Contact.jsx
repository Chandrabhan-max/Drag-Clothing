import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  Github,
  Linkedin,
  Instagram,
  ArrowUpRight,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// =========================================================
// TEAM CONTACT DATA
// =========================================================

const teamContacts = [
  {
    id: 2,
    name: 'Chandrabhan S. Chouhan',
    role: 'Full-Stack Chameleon',
    email: 'cschouhan299@gmail.com',
    phone: '+91 87398 13697',
    socials: {
      github:
        'https://github.com/Chandrabhan-max',
      linkedin:
        'https://www.linkedin.com/in/chandrabhan03/',
    },
  },
  {
    id: 1,
    name: 'Ronit Bhati',
    role: 'Frontend Sorcerer',
    email: 'bhatironit03@gmail.com',
    phone: '+91 74250 10784',
    socials: {
      github: 'https://github.com/ronit',
      linkedin:
        'https://www.linkedin.com/in/ronitbhati12',
      instagram:
        'https://www.instagram.com/ronitbhati12/',
    },
  },

  {
    id: 3,
    name: 'Chandrabhan S. Jhala',
    role: 'Backend Overlord',
    email:
      'chandrabhansinghjhala03@gmail.com',
    phone: '+91 82098 59078',
    socials: {
      github:
        'https://github.com/Jhalachandrabhan',
      linkedin:
        'https://www.linkedin.com/in/jhalachandrabhan03/',
      instagram:
        'https://www.instagram.com/jhalachandrabhansingh.03/',
    },
  },

  {
    id: 4,
    name: 'Sagar Singh Tomar',
    role: 'Cloud Guardian',
    email: 'sagarrsinghh11@gmail.com',
    phone: '+91 74269 77723',
    socials: {
      github:
        'https://github.com/sagarrsinghh',
      linkedin:
        'https://www.linkedin.com/in/sagarrsingh/',
      instagram:
        'https://www.instagram.com/sagarrsingh10/',
    },
  },
];


// =========================================================
// CONTACT
// =========================================================

const Contact = () => {
  const navigate = useNavigate();

  // =======================================================
  // ANIMATIONS
  // =======================================================

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const stagger = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };


  // =======================================================
  // FORM STATE
  // =======================================================

  const [isMessageSent, setIsMessageSent] =
    useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });


  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleChange = (e) => {
    const {
      id,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };


  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    setIsMessageSent(true);

    setFormData({
      name: '',
      email: '',
      message: '',
    });

    setTimeout(() => {
      setIsMessageSent(false);
    }, 2000);
  };


  return (
    <div
      className="
        min-h-screen
        bg-[#F5F5F0]
        text-[#1A1A1A]
        font-sans
        selection:bg-[#FF4D00]
        selection:text-white
        pt-[100px]
        pb-16
        px-5
        sm:px-6
        md:px-10
        lg:px-16
        xl:px-24
      "
    >

      {/* ===================================================
          MESSAGE SENT TOAST
         =================================================== */}

      <AnimatePresence>
        {isMessageSent && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              fixed
              top-5
              left-1/2
              -translate-x-1/2
              z-[500]
              w-[calc(100%-24px)]
              sm:w-auto
              sm:min-w-[320px]
              bg-white
              border
              border-black/10
              shadow-2xl
              rounded-2xl
              px-4
              sm:px-5
              py-4
            "
          >

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-green-50
              ">
                <Check
                  size={18}
                  className="text-green-600"
                />
              </div>


              <div className="flex-1">

                <p className="
                  text-sm
                  font-black
                  uppercase
                  tracking-tight
                ">
                  Message Sent
                </p>

                <p className="
                  mt-0.5
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-wider
                  text-gray-400
                ">
                  We'll get back to you soon.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setIsMessageSent(false)
                }
                className="
                  text-gray-400
                  hover:text-black
                  transition-colors
                "
                aria-label="Close notification"
              >
                <X size={16} />
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* ===================================================
          BACK BUTTON
         =================================================== */}

      <div className="
        max-w-7xl
        mx-auto
        mb-8
      ">

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="
            flex
            items-center
            gap-2
            text-[10px]
            sm:text-xs
            font-bold
            uppercase
            tracking-widest
            text-gray-400
            hover:text-[#1A1A1A]
            transition-colors
            group
          "
        >

          <ArrowLeft
            size={14}
            className="
              group-hover:-translate-x-1
              transition-transform
            "
          />

          Back

        </button>

      </div>


      {/* ===================================================
          HEADER
         =================================================== */}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="
          max-w-7xl
          mx-auto
          mb-12
          md:mb-16
        "
      >

        <motion.div
          variants={fadeUp}
          className="
            flex
            items-center
            gap-3
            mb-4
          "
        >

          <div className="
            w-8
            h-[2px]
            bg-[#FF4D00]
          " />

          <span className="
            text-[#FF4D00]
            text-[9px]
            sm:text-[10px]
            font-black
            uppercase
            tracking-[0.2em]
          ">
            Communicate
          </span>

        </motion.div>


        <motion.h1
          variants={fadeUp}
          className="
            text-5xl
            sm:text-6xl
            md:text-7xl
            font-black
            uppercase
            tracking-tighter
            leading-[0.9]
            text-[#1A1A1A]
          "
        >

          Let's
          <br />

          <span className="
            text-transparent
            bg-clip-text
            bg-gradient-to-r
            from-[#FF4D00]
            to-[#FF8A00]
          ">
            Talk.
          </span>

        </motion.h1>

      </motion.div>


      {/* ===================================================
          MAIN GRID
         =================================================== */}

      <div className="
        max-w-7xl
        mx-auto
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-8
        md:gap-12
        items-start
      ">


        {/* =================================================
            LEFT — MESSAGE FORM
           ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.1,
          }}
          className="
            bg-white
            border
            border-[#1A1A1A]/10
            p-5
            sm:p-7
            md:p-8
            rounded-2xl
            shadow-sm
          "
        >

          <div className="mb-8">

            <h3 className="
              text-xl
              sm:text-2xl
              font-bold
              uppercase
              tracking-tight
              mb-1
              text-[#1A1A1A]
            ">
              Drop a line
            </h3>

            <p className="
              text-[#1A1A1A]/60
              text-sm
              font-medium
              leading-relaxed
            ">
              For business inquiries,
              collaborations, or just to say hi.
            </p>

          </div>


          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="
              flex
              flex-col
              gap-1.5
            ">

              <label
                htmlFor="name"
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#1A1A1A]/50
                  ml-1
                "
              >
                Your Name
              </label>

              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="
                  w-full
                  bg-[#F5F5F0]
                  border
                  border-[#1A1A1A]/5
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  text-[#1A1A1A]
                  outline-none
                  focus:border-[#FF4D00]/50
                  transition-colors
                "
                placeholder="John Doe"
              />

            </div>


            {/* EMAIL */}

            <div className="
              flex
              flex-col
              gap-1.5
            ">

              <label
                htmlFor="email"
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#1A1A1A]/50
                  ml-1
                "
              >
                Your Email
              </label>

              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="
                  w-full
                  bg-[#F5F5F0]
                  border
                  border-[#1A1A1A]/5
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  text-[#1A1A1A]
                  outline-none
                  focus:border-[#FF4D00]/50
                  transition-colors
                "
                placeholder="john@example.com"
              />

            </div>


            {/* MESSAGE */}

            <div className="
              flex
              flex-col
              gap-1.5
            ">

              <label
                htmlFor="message"
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#1A1A1A]/50
                  ml-1
                "
              >
                Your Message
              </label>

              <textarea
                id="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="
                  w-full
                  bg-[#F5F5F0]
                  border
                  border-[#1A1A1A]/5
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  text-[#1A1A1A]
                  outline-none
                  focus:border-[#FF4D00]/50
                  transition-colors
                  resize-none
                  custom-scrollbar
                "
                placeholder="What's on your mind?"
              />

            </div>


            {/* SEND */}

            <button
              type="submit"
              className="
                w-full
                mt-4
                bg-[#1A1A1A]
                text-white
                hover:bg-[#FF4D00]
                transition-colors
                py-3.5
                rounded-xl
                flex
                items-center
                justify-center
                gap-3
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                group
                active:scale-[0.99]
              "
            >

              <span>
                Send Message
              </span>

              <ArrowUpRight
                className="
                  w-4
                  h-4
                  group-hover:rotate-45
                  transition-transform
                "
              />

            </button>

          </form>

        </motion.div>


        {/* =================================================
            RIGHT — DIRECT LINES
           ================================================= */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col"
        >

          {/* RIGHT HEADER */}

          <motion.div
            variants={fadeUp}
            className="
              mb-6
              px-1
            "
          >

            <h3 className="
              text-xl
              sm:text-2xl
              font-bold
              uppercase
              tracking-tight
              mb-1
              text-[#1A1A1A]
            ">
              Direct Lines
            </h3>

            <p className="
              text-[#1A1A1A]/60
              text-sm
              font-medium
              leading-relaxed
            ">
              Bypass the frontend.
              Talk directly to the engine.
            </p>

          </motion.div>


          {/* TEAM CARDS */}

          <div className="
            grid
            grid-cols-1
            gap-4
          ">

            {teamContacts.map(
              (member) => (

                <motion.div
                  variants={fadeUp}
                  key={member.id}
                  className="
                    group
                    p-5
                    bg-white
                    border
                    border-[#1A1A1A]/10
                    hover:border-[#FF4D00]/30
                    hover:shadow-md
                    rounded-2xl
                    transition-all
                    duration-300
                    flex
                    flex-col
                    gap-5
                  "
                >

                  {/* =======================================
                      NAME + ROLE
                     ======================================= */}

                  <div>

                    <h4 className="
                      text-base
                      sm:text-lg
                      font-bold
                      uppercase
                      tracking-tight
                      text-[#1A1A1A]
                      group-hover:text-[#FF4D00]
                      transition-colors
                      break-words
                    ">
                      {member.name}
                    </h4>

                    <p className="
                      text-[9px]
                      sm:text-[10px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-[#1A1A1A]/50
                      mt-1
                    ">
                      {member.role}
                    </p>

                  </div>


                  {/* =======================================
                      CONTACT INFO
                     ======================================= */}

                  <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-2
                  ">

                    {/* EMAIL */}

                    <a
                      href={`mailto:${member.email}`}
                      className="
                        min-w-0
                        flex
                        items-center
                        gap-2.5
                        text-xs
                        text-[#1A1A1A]/70
                        hover:text-[#FF4D00]
                        transition-colors
                        bg-[#F5F5F0]
                        px-3
                        py-2.5
                        rounded-lg
                        border
                        border-[#1A1A1A]/5
                      "
                    >

                      <Mail
                        className="
                          w-3.5
                          h-3.5
                          shrink-0
                        "
                      />

                      <span className="
                        font-mono
                        truncate
                      ">
                        {member.email}
                      </span>

                    </a>


                    {/* PHONE */}

                    <a
                      href={`tel:${member.phone.replace(
                        /\s+/g,
                        ''
                      )}`}
                      className="
                        flex
                        items-center
                        gap-2.5
                        text-xs
                        text-[#1A1A1A]/70
                        hover:text-[#FF4D00]
                        transition-colors
                        bg-[#F5F5F0]
                        px-3
                        py-2.5
                        rounded-lg
                        border
                        border-[#1A1A1A]/5
                      "
                    >

                      <Phone
                        className="
                          w-3.5
                          h-3.5
                          shrink-0
                        "
                      />

                      <span className="
                        font-mono
                        whitespace-nowrap
                      ">
                        {member.phone}
                      </span>

                    </a>

                  </div>


                  {/* =======================================
                      SOCIALS
                     ======================================= */}

                  <div className="
                    flex
                    items-center
                    gap-2
                    pt-1
                    border-t
                    border-[#1A1A1A]/5
                  ">

                    {/* GITHUB */}

                    {member.socials.github && (
                      <a
                        href={
                          member.socials.github
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} GitHub`}
                        className="
                          p-2.5
                          rounded-lg
                          bg-[#F5F5F0]
                          border
                          border-[#1A1A1A]/5
                          text-[#1A1A1A]/60
                          hover:bg-[#1A1A1A]
                          hover:text-white
                          transition-all
                        "
                      >
                        <Github
                          className="
                            w-4
                            h-4
                          "
                        />
                      </a>
                    )}


                    {/* LINKEDIN */}

                    {member.socials.linkedin && (
                      <a
                        href={
                          member.socials.linkedin
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} LinkedIn`}
                        className="
                          p-2.5
                          rounded-lg
                          bg-[#F5F5F0]
                          border
                          border-[#1A1A1A]/5
                          text-[#1A1A1A]/60
                          hover:bg-[#0077b5]
                          hover:text-white
                          hover:border-[#0077b5]
                          transition-all
                        "
                      >
                        <Linkedin
                          className="
                            w-4
                            h-4
                          "
                        />
                      </a>
                    )}


                    {/* INSTAGRAM */}

                    {member.socials.instagram && (
                      <a
                        href={
                          member.socials.instagram
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} Instagram`}
                        className="
                          p-2.5
                          rounded-lg
                          bg-[#F5F5F0]
                          border
                          border-[#1A1A1A]/5
                          text-[#1A1A1A]/60
                          hover:bg-[#E1306C]
                          hover:text-white
                          hover:border-[#E1306C]
                          transition-all
                        "
                      >
                        <Instagram
                          className="
                            w-4
                            h-4
                          "
                        />
                      </a>
                    )}

                  </div>

                </motion.div>

              )
            )}

          </div>

        </motion.div>

      </div>

    </div>
  );
};

export default Contact;