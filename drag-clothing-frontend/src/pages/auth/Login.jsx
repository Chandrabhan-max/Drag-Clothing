import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  KeyRound,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  // =====================================================
  // TEST ACCOUNTS PANEL
  // =====================================================

  const [showTestAccounts, setShowTestAccounts] =
    useState(false);

  const [copiedEmail, setCopiedEmail] =
    useState('');

  const testAccounts = [
  {
    role: 'Client',
    email: 'client@dragclothing.com',
  },
  {
    role: 'Customer',
    email: 'demo@gmail.com',
  },
];

  // =====================================================
  // USE TEST ACCOUNT
  // =====================================================

  const useTestAccount = (email) => {
    setFormData({
      email,
      password: '123456',
    });

    setError('');
    setShowTestAccounts(false);
  };

  // =====================================================
  // COPY EMAIL
  // =====================================================

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);

      setCopiedEmail(email);

      setTimeout(() => {
        setCopiedEmail('');
      }, 1500);
    } catch {
      // Clipboard unavailable.
      // Nothing else needed.
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(
        formData.email,
        formData.password
      );

      const rawRole =
        user?.role || 'UNDEFINED';

      const safeRole = String(rawRole)
        .trim()
        .toLowerCase();

      if (
        safeRole === 'super_admin' ||
        safeRole === 'superadmin'
      ) {
        navigate('/superadmin');
      } else if (
        safeRole === 'client'
      ) {
        navigate('/client');
      } else if (
        safeRole === 'manager'
      ) {
        navigate('/manager');
      } else if (
        safeRole === 'customer'
      ) {
        navigate('/');
      } else {
        alert(
          `FALLBACK TRIGGERED: [${safeRole}] didn't match anything. Sending to customer page.`
        );

        navigate('/');
      }
    } catch (err) {
      console.error(
        'Login Error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Invalid credentials'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="
        flex
        flex-col
        items-center
        justify-center
        min-h-screen
        bg-[#FAFAFA]
        px-4
        font-sans
        selection:bg-[#9B4819]
        selection:text-white
        relative
        overflow-hidden
      "
    >

      {/* =================================================
          RETURN TO STORE
         ================================================= */}

      <Link
        to="/"
        className="
          absolute
          top-8
          left-8
          flex
          items-center
          gap-2
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-[#777]
          hover:text-[#1A1A1A]
          transition-colors
        "
      >
        <ArrowLeft className="w-3 h-3" />
        Return to Store
      </Link>


      {/* =================================================
          LOGIN CARD
         ================================================= */}

      <motion.div
        className="
          bg-white
          p-8
          sm:p-10
          md:p-12
          rounded-[2.5rem]
          border
          border-[#E5E5E5]
          w-full
          max-w-md
          shadow-sm
          relative
        "
      >

        <h1 className="
          text-4xl
          font-black
          text-center
          mb-6
          uppercase
        ">
          DRAG
          <span className="text-[#9B4819]">
            .
          </span>
        </h1>


        {/* =================================================
            ERROR
           ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                bg-red-50
                text-red-600
                text-[10px]
                font-bold
                uppercase
                p-3
                rounded-xl
                mb-6
                text-center
                border
                border-red-100
              "
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>


        {/* =================================================
            LOGIN FORM
           ================================================= */}

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* EMAIL */}

          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            className="
              w-full
              bg-[#FAFAFA]
              border
              border-[#E5E5E5]
              rounded-2xl
              py-4
              px-5
              focus:outline-none
              focus:border-[#9B4819]
              transition-colors
              text-[12px]
              font-bold
            "
            placeholder="Email"
          />


          {/* PASSWORD */}

          <div className="relative">

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
                pr-12
                focus:outline-none
                focus:border-[#9B4819]
                transition-colors
                text-[12px]
                font-bold
              "
              placeholder="Password"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-500
                hover:text-black
                transition-colors
              "
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full
              bg-[#1A1A1A]
              hover:bg-[#9B4819]
              transition-colors
              text-white
              py-5
              rounded-2xl
              uppercase
              text-[10px]
              font-bold
              flex
              justify-center
              items-center
              disabled:opacity-50
            "
          >
            {isLoading ? (
              <Loader2
                className="
                  w-4
                  h-4
                  animate-spin
                "
              />
            ) : (
              'Login'
            )}
          </button>


          {/* =================================================
              TEST ACCOUNT TRIGGER
             ================================================= */}

          <div className="
            flex
            justify-center
            -mt-1
          ">

            <button
              type="button"
              onClick={() =>
                setShowTestAccounts(
                  !showTestAccounts
                )
              }
              className="
                inline-flex
                items-center
                gap-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-widest
                text-gray-400
                hover:text-[#9B4819]
                transition-colors
              "
            >
              <KeyRound size={11} />

              Want test mail IDs?

            </button>

          </div>


          {/* =================================================
              TEST ACCOUNT PANEL
             ================================================= */}

          <AnimatePresence>

            {showTestAccounts && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.25,
                  ease: 'easeOut',
                }}
                className="
                  overflow-hidden
                "
              >

                <div className="
                  mt-1
                  rounded-2xl
                  border
                  border-[#E5E5E5]
                  bg-[#FAFAFA]
                  p-4
                ">

                  {/* PANEL HEADER */}

                  <div className="
                    mb-3
                  ">

                    <p className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.22em]
                      text-[#9B4819]
                    ">
                      Demo Access
                    </p>

                    <p className="
                      mt-1
                      text-[9px]
                      leading-relaxed
                      text-gray-400
                    ">
                      Select an account to
                      auto-fill the login form.
                    </p>

                  </div>


                  {/* ACCOUNTS */}

                  <div className="
                    space-y-2
                  ">

                    {testAccounts.map(
                      (account) => (
                        <div
                          key={
                            account.role
                          }
                          className="
                            rounded-xl
                            border
                            border-[#E5E5E5]
                            bg-white
                            p-3
                          "
                        >

                          {/* ROLE */}

                          <div className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          ">

                            <span className="
                              text-[9px]
                              font-black
                              uppercase
                              tracking-widest
                              text-[#1A1A1A]
                            ">
                              Login as{' '}
                              {account.role}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                useTestAccount(
                                  account.email
                                )
                              }
                              className="
                                shrink-0
                                rounded-full
                                bg-[#1A1A1A]
                                px-2.5
                                py-1
                                text-[8px]
                                font-black
                                uppercase
                                tracking-widest
                                text-white
                                hover:bg-[#9B4819]
                                transition-colors
                              "
                            >
                              Use
                            </button>

                          </div>


                          {/* EMAIL */}

                          <div className="
                            mt-2
                            flex
                            items-center
                            justify-between
                            gap-2
                          ">

                            <button
                              type="button"
                              onClick={() =>
                                useTestAccount(
                                  account.email
                                )
                              }
                              className="
                                min-w-0
                                flex
                                items-center
                                gap-2
                                text-left
                                text-[9px]
                                text-gray-500
                                hover:text-[#9B4819]
                                transition-colors
                              "
                            >

                              <Mail
                                size={12}
                                className="
                                  shrink-0
                                "
                              />

                              <span className="
                                truncate
                                font-mono
                              ">
                                {account.email}
                              </span>

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                copyEmail(
                                  account.email
                                )
                              }
                              className="
                                shrink-0
                                rounded-md
                                p-1
                                text-gray-400
                                hover:bg-gray-100
                                hover:text-[#9B4819]
                                transition-colors
                              "
                              aria-label="Copy email"
                            >

                              {copiedEmail ===
                              account.email ? (
                                <Check
                                  size={13}
                                  className="
                                    text-green-600
                                  "
                                />
                              ) : (
                                <Copy
                                  size={13}
                                />
                              )}

                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>


                  {/* PASSWORD */}

                  <div className="
                    mt-3
                    rounded-xl
                    bg-[#1A1A1A]
                    px-3
                    py-2.5
                    text-center
                  ">

                    <span className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-white/50
                    ">
                      Password for all:
                    </span>

                    <span className="
                      ml-2
                      text-[10px]
                      font-black
                      tracking-widest
                      text-[#FFB27D]
                    ">
                      123456
                    </span>

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>


          {/* =================================================
              BOTTOM LINKS
             ================================================= */}

          <div className="
            flex
            justify-between
            items-start
            text-[10px]
            uppercase
            font-bold
            mt-4
          ">

            <div className="
              flex
              flex-col
              gap-3
            ">

              <Link
                to="/login-otp"
                className="
                  text-[#9B4819]
                  hover:underline
                "
              >
                Login with OTP
              </Link>

              <Link
                to="/forgot-password"
                className="
                  text-gray-400
                  hover:text-[#1A1A1A]
                  transition-colors
                "
              >
                Forgot Password
              </Link>

            </div>

            <Link
              to="/register"
              className="
                text-[#9B4819]
                hover:underline
                mt-0
              "
            >
              Register
            </Link>

          </div>

        </form>

      </motion.div>

    </motion.div>
  );
}