import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import axios from '../../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('/auth/register', formData);
      navigate('/login'); 
    } catch (err) {
      console.error("Registration Error Caught:", err);
      
      let safeErrorMessage = 'Registration failed. Please check the console.';
      
      if (err?.response?.data?.message) {
        const rawMsg = err.response.data.message;
        if (typeof rawMsg === 'string') {
          safeErrorMessage = rawMsg;
        } else if (Array.isArray(rawMsg) && rawMsg.length > 0) {
          safeErrorMessage = String(rawMsg[0]); 
        } else {
          safeErrorMessage = JSON.stringify(rawMsg);
        }
      }
      
      setError(safeErrorMessage);
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
        to="/login" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#777] hover:text-[#111] transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Return to Login
      </Link>

      <motion.div className="bg-white p-12 rounded-[2.5rem] border border-[#E5E5E5] w-full max-w-md shadow-sm">
        <h1 className="text-4xl font-black text-center mb-6 uppercase">
          DRAG<span className="text-[#9B4819]">.</span>
        </h1>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold"
            placeholder="Full Name"
          />

          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold"
            placeholder="Email"
          />

          <input
            type="password"
            required
            minLength="6"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold"
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] disabled:bg-[#1A1A1A]/50 transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center"
          >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
          </button>

          <div className="flex justify-center mt-4">
            <Link to="/login" className="text-[#9B4819] text-[10px] uppercase font-bold hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}