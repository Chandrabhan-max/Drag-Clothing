import React, { useState } from 'react';
import {
  useNavigate,
  Link,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ArrowLeft,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  // login | register | forgot | otp

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // TEST ACCOUNTS PANEL
  const [showTestAccounts, setShowTestAccounts] =
    useState(false);

  const [copiedEmail, setCopiedEmail] =
    useState('');

  // =========================================================
  // TEST ACCOUNTS
  // =========================================================

  const testAccounts = [
    {
      role: 'Super Admin',
      email: 'admin@dragclothing.com',
    },
    {
      role: 'Client',
      email: 'client@dragclothing.com',
    },
    {
      role: 'Customer',
      email: 'cschouhan299@gmail.com',
    },
  ];

  // =========================================================
  // COPY EMAIL
  // =========================================================

  const copyEmail = async (accountEmail) => {
    try {
      await navigator.clipboard.writeText(
        accountEmail
      );

      setCopiedEmail(accountEmail);

      setTimeout(() => {
        setCopiedEmail('');
      }, 1500);
    } catch {
      // Fallback: just fill the login fields
      setEmail(accountEmail);
      setPassword('123456');
    }
  };

  // =========================================================
  // USE TEST ACCOUNT
  // =========================================================

  const useTestAccount = (accountEmail) => {
    setEmail(accountEmail);
    setPassword('123456');
    setMode('login');
    setError('');
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post(
        '/auth/login',
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        'accessToken',
        res.data.accessToken
      );

      localStorage.setItem(
        'refreshToken',
        res.data.refreshToken
      );

      const me = await api.get(
        '/auth/me'
      );

      const user = me.data;

      if (user.role === 'SUPER_ADMIN') {
        navigate('/superadmin');
      } else if (user.role === 'CLIENT') {
        navigate('/client');
      } else if (user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/');
      }

    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post(
        '/auth/register',
        {
          name,
          email,
          password,
        }
      );

      setMode("login");
      setError(
        "Registration successful. Please login."
      );

    } catch {
      setError(
        "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // SEND OTP
  // =========================================================

  const handleSendOtp = async () => {
    try {
      await api.post(
        '/auth/send-otp',
        {
          email,
        }
      );

      setMode("otp");

    } catch {
      setError(
        "Failed to send OTP"
      );
    }
  };

  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post(
        '/auth/verify-otp',
        {
          email,
          otp,
        }
      );

      localStorage.setItem(
        'accessToken',
        res.data.accessToken
      );

      localStorage.setItem(
        'refreshToken',
        res.data.refreshToken
      );

      navigate('/');

    } catch {
      setError(
        "Invalid OTP"
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

      {/* =====================================================
          RETURN TO STORE
         ===================================================== */}

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


      {/* =====================================================
          LOGIN CARD
         ===================================================== */}

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
              "
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>


        {/* =================================================
            LOGIN
           ================================================= */}

        {mode === "login" && (
          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
                outline-none
                focus:border-[#9B4819]
                transition-colors
              "
              placeholder="Email"
            />


            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
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
                  outline-none
                  focus:border-[#9B4819]
                  transition-colors
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
                "
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full
                bg-[#1A1A1A]
                hover:bg-[#9B4819]
                text-white
                py-5
                rounded-2xl
                uppercase
                text-[10px]
                font-bold
                transition-colors
                disabled:opacity-50
              "
            >

              {isLoading ? (
                <Loader2
                  className="
                    w-4
                    h-4
                    animate-spin
                    mx-auto
                  "
                />
              ) : (
                "Login"
              )}

            </button>


            {/* =================================================
                TEST ACCOUNTS TRIGGER
               ================================================= */}

            <div className="
              flex
              justify-center
              mt-1
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
                  uppercase
                  font-bold
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
                TEST ACCOUNTS PANEL
               ================================================= */}

            <AnimatePresence>

              {showTestAccounts && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    mt-3
                    rounded-2xl
                    border
                    border-[#E5E5E5]
                    bg-[#FAFAFA]
                    p-4
                  "
                >

                  <div className="
                    flex
                    items-center
                    justify-between
                    mb-3
                  ">

                    <div>

                      <p className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.2em]
                        text-[#9B4819]
                      ">
                        Demo Access
                      </p>

                      <p className="
                        text-[9px]
                        text-gray-400
                        mt-1
                      ">
                        Use these accounts to explore the demo.
                      </p>

                    </div>

                  </div>


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

                          <div className="
                            flex
                            items-center
                            justify-between
                            gap-3
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
                                text-[8px]
                                font-black
                                uppercase
                                tracking-widest
                                text-[#9B4819]
                                hover:text-black
                                transition-colors
                              "
                            >
                              Use
                            </button>

                          </div>


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
                                text-gray-400
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

                </motion.div>
              )}

            </AnimatePresence>


            {/* =================================================
                LOGIN LINKS
               ================================================= */}

            <div className="
              flex
              justify-between
              text-[10px]
              uppercase
              font-bold
              mt-4
            ">

              <button
                type="button"
                onClick={() =>
                  setMode("forgot")
                }
                className="
                  text-[#9B4819]
                  hover:text-black
                  transition-colors
                "
              >
                Forgot Password
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode("register")
                }
                className="
                  text-[#9B4819]
                  hover:text-black
                  transition-colors
                "
              >
                Register
              </button>

            </div>

          </form>
        )}


        {/* =================================================
            REGISTER
           ================================================= */}

        {mode === "register" && (
          <form
            onSubmit={handleRegister}
            className="space-y-6"
          >

            <input
              type="text"
              required
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
              "
              placeholder="Full Name"
            />

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
              "
              placeholder="Email"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
              "
              placeholder="Password"
            />

            <button
              type="submit"
              className="
                w-full
                bg-[#1A1A1A]
                text-white
                py-5
                rounded-2xl
                uppercase
                text-[10px]
                font-bold
              "
            >
              Register
            </button>

            <button
              type="button"
              onClick={() =>
                setMode("login")
              }
              className="
                text-[#9B4819]
                text-[10px]
                uppercase
                font-bold
              "
            >
              Back to Login
            </button>

          </form>
        )}


        {/* =================================================
            FORGOT
           ================================================= */}

        {mode === "forgot" && (
          <div className="space-y-6">

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
              "
              placeholder="Enter Email"
            />

            <button
              onClick={handleSendOtp}
              className="
                w-full
                bg-[#1A1A1A]
                text-white
                py-5
                rounded-2xl
                uppercase
                text-[10px]
                font-bold
              "
            >
              Send OTP
            </button>

            <button
              type="button"
              onClick={() =>
                setMode("login")
              }
              className="
                text-[#9B4819]
                text-[10px]
                uppercase
                font-bold
              "
            >
              Back
            </button>

          </div>
        )}


        {/* =================================================
            OTP
           ================================================= */}

        {mode === "otp" && (
          <form
            onSubmit={handleVerifyOtp}
            className="space-y-6"
          >

            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                )
              }
              className="
                w-full
                bg-[#FAFAFA]
                border
                border-[#E5E5E5]
                rounded-2xl
                py-4
                px-5
                text-center
                tracking-[0.5em]
              "
              placeholder="XXXXXX"
            />

            <button
              type="submit"
              className="
                w-full
                bg-[#1A1A1A]
                text-white
                py-5
                rounded-2xl
                uppercase
                text-[10px]
                font-bold
              "
            >
              Verify OTP
            </button>

          </form>
        )}

      </motion.div>

    </motion.div>
  );
};

export default Login;