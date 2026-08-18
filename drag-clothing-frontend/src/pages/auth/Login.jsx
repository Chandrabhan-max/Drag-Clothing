import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      
      const rawRole = user?.role || 'UNDEFINED';
      const safeRole = String(rawRole).trim().toLowerCase();

      if (safeRole === 'super_admin' || safeRole === 'superadmin') {
        navigate('/superadmin');
      } else if (safeRole === 'client') {
        navigate('/client');
      } else if (safeRole === 'manager') {
        navigate('/manager');
      } else if (safeRole === 'customer') {
        navigate('/'); 
      } else {
        alert(`FALLBACK TRIGGERED: [${safeRole}] didn't match anything. Sending to customer page.`);
        navigate('/'); 
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Invalid credentials');
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

      <motion.div className="bg-white p-12 rounded-[2.5rem] border border-[#E5E5E5] w-full max-w-md shadow-sm">
        <h1 className="text-4xl font-black text-center mb-6 uppercase">
          DRAG<span className="text-[#9B4819]">.</span>
        </h1>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold"
            placeholder="Email"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 pr-12 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
          </button>

          <div className="flex justify-between items-start text-[10px] uppercase font-bold mt-4">
            <div className="flex flex-col gap-3">
              <Link to="/login-otp" className="text-[#9B4819] hover:underline">
                Login with OTP
              </Link>
              <Link to="/forgot-password" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
                Forgot Password
              </Link>
            </div>
            <Link to="/register" className="text-[#9B4819] hover:underline mt-0">
              Register
            </Link>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}