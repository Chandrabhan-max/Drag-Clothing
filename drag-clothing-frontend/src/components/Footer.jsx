import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Twitter,
  Mail,
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    setIsSubscribed(true);
    setEmail('');

    setTimeout(() => {
      setIsSubscribed(false);
    }, 2000);
  };

  return (
    <footer className="
      relative
      overflow-hidden
      bg-[#050505]
      pt-20
      pb-6
      text-[#EBE9E0]
    ">

      {/* =====================================================
          1. NEWSLETTER / CTA
         ===================================================== */}

      <div className="
        mx-auto
        mb-20
        max-w-[1400px]
        px-6
        md:px-10
      ">

        <div className="
          flex
          flex-col
          items-start
          gap-10
          md:flex-row
          md:items-end
          md:justify-between
        ">

          {/* JOIN THE CULT */}

          <div className="
            w-full
            max-w-md
            text-left
          ">

            <h3 className="
              mb-4
              text-left
              text-3xl
              font-black
              uppercase
              leading-[0.9]
              tracking-tighter
              md:text-5xl
            ">
              Join the <br />
              <span className="text-[#9B4819]">
                Cult.
              </span>
            </h3>

            <p className="
              text-left
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              opacity-50
            ">
              Exclusive drops, early access, and no spam.
            </p>

          </div>


          {/* EMAIL / SUBSCRIBE */}

          <form
            onSubmit={handleSubscribe}
            className="
              w-full
              max-w-lg
              flex-1
            "
          >

            <div className="
              group
              flex
              items-end
              gap-4
              border-b
              border-white/20
              pb-4
              transition-colors
              duration-500
              focus-within:border-[#9B4819]
            ">

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="ENTER YOUR EMAIL"
                className="
                  w-full
                  bg-transparent
                  text-sm
                  font-bold
                  uppercase
                  tracking-widest
                  text-white
                  outline-none
                  placeholder:text-white/20
                "
              />

              <button
                type="submit"
                className={`
                  shrink-0
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  transition-colors
                  duration-300
                  ${isSubscribed
                    ? 'text-[#9B4819]'
                    : 'text-white hover:text-[#9B4819]'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>Subscribe</span>

                  {isSubscribed && (
                    <span className="
      text-[#9B4819]
      text-[9px]
      font-black
      uppercase
      tracking-widest
    ">
                      Done
                    </span>
                  )}
                </span>
              </button>

            </div>

          </form>

        </div>

      </div>


      {/* =====================================================
          2. GRID LINKS
         ===================================================== */}

      <div className="
        mx-auto
        mb-20
        grid
        max-w-[1400px]
        grid-cols-2
        gap-10
        border-t
        border-white/10
        px-6
        pb-0
        pt-16
        md:grid-cols-4
        md:px-10
      ">

        {/* BRAND */}

        <div className="
          flex
          flex-col
          gap-6
        ">

          <div className="
            text-2xl
            font-black
            italic
            tracking-tighter
          ">
            DRAG.
          </div>

          <p className="
            text-[10px]
            uppercase
            leading-relaxed
            tracking-widest
            opacity-40
          ">
            Engineered in Jaipur.
            <br />
            Worn in the Void.
            <br />
            Est. 2026
          </p>

        </div>


        {/* EMPTY / SPACING COLUMN */}

        <div />


        {/* COMPANY */}

        <div>

          <h4 className="
            mb-6
            text-[10px]
            font-bold
            uppercase
            tracking-[0.3em]
            text-[#9B4819]
          ">
            Company
          </h4>

          <ul className="
            flex
            flex-col
            gap-3
            text-xs
            font-medium
            uppercase
            tracking-widest
            opacity-70
          ">

            <li>

              <Link
                to="/about"
                className="
                  transition-all
                  duration-300
                  hover:pl-2
                  hover:text-white
                "
              >
                About
              </Link>

            </li>

            <li>

              <Link
                to="/team"
                className="
                  flex
                  items-center
                  gap-2
                  transition-all
                  duration-300
                  hover:pl-2
                  hover:text-white
                "
              >
                The Team
              </Link>

            </li>

            <li>

              <Link
                to="/contact"
                className="
                  transition-all
                  duration-300
                  hover:pl-2
                  hover:text-white
                "
              >
                Contact
              </Link>

            </li>

          </ul>

        </div>


        {/* SOCIALS */}

        <div>

          <h4 className="
            mb-6
            text-[10px]
            font-bold
            uppercase
            tracking-[0.3em]
            text-[#9B4819]
          ">
            Connect
          </h4>

          <div className="flex gap-4">

            <a
              href="https://www.instagram.com/?hl=en"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                transition-all
                duration-500
                hover:bg-white
                hover:text-black
              "
            >
              <Instagram size={16} />
            </a>

            <a
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                transition-all
                duration-500
                hover:bg-white
                hover:text-black
              "
            >
              <Twitter size={16} />
            </a>

            <a
              href="mailto:bhatironit03@gmail.com"
              aria-label="Email"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                transition-all
                duration-500
                hover:bg-white
                hover:text-black
              "
            >
              <Mail size={16} />
            </a>

          </div>

        </div>

      </div>


      {/* =====================================================
          3. COPYRIGHT
         ===================================================== */}

      <div className="
        relative
        flex
        flex-col
        items-center
        justify-between
        border-t
        border-white/10
        px-6
        pt-8
        text-[9px]
        uppercase
        tracking-widest
        opacity-30
        md:flex-row
        md:px-10
      ">

        <p>
          © 2026 Drag Clothing System.
        </p>

        <div className="
          mt-4
          flex
          gap-6
          md:mt-0
        ">

          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/terms">
            Terms of Use
          </Link>

        </div>

      </div>


      {/* =====================================================
          GIANT WATERMARK
         ===================================================== */}

      <div className="
        pointer-events-none
        absolute
        bottom-[-5%]
        left-1/2
        w-full
        -translate-x-1/2
        overflow-hidden
        text-center
      ">

        <h1 className="
          select-none
          text-[25vw]
          font-black
          uppercase
          leading-none
          tracking-tighter
          text-white/[0.02]
        ">
          DRAG.
        </h1>

      </div>

    </footer>
  );
};

export default Footer;