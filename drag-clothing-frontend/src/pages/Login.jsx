import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ArrowLeft,
  KeyRound
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

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      const me = await api.get('/auth/me');
      const user = me.data;

      if (user.role === 'SUPER_ADMIN') navigate('/superadmin');
      else if (user.role === 'CLIENT') navigate('/client');
      else if (user.role === 'MANAGER') navigate('/manager');
      else navigate('/');

    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= REGISTER (CUSTOMER) =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/register', {
        name,
        email,
        password
      });

      setMode("login");
      setError("Registration successful. Please login.");
    } catch {
      setError("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= SEND OTP =================
  const handleSendOtp = async () => {
    try {
      await api.post('/auth/send-otp', { email });
      setMode("otp");
    } catch {
      setError("Failed to send OTP");
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp
      });

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      navigate('/');
    } catch {
      setError("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] px-4 font-sans selection:bg-[#9B4819] selection:text-white relative overflow-hidden"
    >

      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#777]"
      >
        <ArrowLeft className="w-3 h-3" />
        Return to Store
      </Link>

      <motion.div 
        className="bg-white p-12 rounded-[2.5rem] border border-[#E5E5E5] w-full max-w-md"
      >

        <h1 className="text-4xl font-black text-center mb-6 uppercase">
          DRAG<span className="text-[#9B4819]">.</span>
        </h1>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= LOGIN ================= */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5"
              placeholder="Email"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 pr-12"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-5 rounded-2xl uppercase text-[10px] font-bold"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Login"}
            </button>

            <div className="flex justify-between text-[10px] uppercase font-bold mt-4">
              <button type="button" onClick={() => setMode("forgot")} className="text-[#9B4819]">
                Forgot Password
              </button>
              <button type="button" onClick={() => setMode("register")} className="text-[#9B4819]">
                Register
              </button>
            </div>
          </form>
        )}

        {/* ================= REGISTER ================= */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-6">

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5"
              placeholder="Full Name"
            />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5"
              placeholder="Email"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5"
              placeholder="Password"
            />

            <button
              type="submit"
              className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl uppercase text-[10px] font-bold"
            >
              Register
            </button>

            <button type="button" onClick={() => setMode("login")} className="text-[#9B4819] text-[10px] uppercase font-bold">
              Back to Login
            </button>
          </form>
        )}

        {/* ================= FORGOT ================= */}
        {mode === "forgot" && (
          <div className="space-y-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5"
              placeholder="Enter Email"
            />
            <button
              onClick={handleSendOtp}
              className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl uppercase text-[10px] font-bold"
            >
              Send OTP
            </button>
            <button type="button" onClick={() => setMode("login")} className="text-[#9B4819] text-[10px] uppercase font-bold">
              Back
            </button>
          </div>
        )}

        {/* ================= OTP ================= */}
        {mode === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 text-center tracking-[0.5em]"
              placeholder="XXXXXX"
            />
            <button
              type="submit"
              className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl uppercase text-[10px] font-bold"
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