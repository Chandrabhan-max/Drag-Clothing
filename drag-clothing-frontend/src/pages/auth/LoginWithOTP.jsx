import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '../../api/axios'; // Adjust path if needed

export default function LoginWithOTP() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/send-otp', { email });
      setMessage(response.data.message || 'OTP sent successfully');
      setStep(2);
    } catch (err) {
      let msg = err.response?.data?.message || 'Failed to send OTP';
      if (Array.isArray(msg)) msg = msg[0];
      setError(String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Verify OTP
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { accessToken, refreshToken } = response.data;
      
      // 2. Save Tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // 3. Decode Token to get the exact role
      const payloadBase64 = accessToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      const safeRole = String(decodedPayload.role).trim().toLowerCase();

      // 4. Role-based routing
      if (safeRole === 'super_admin' || safeRole === 'superadmin') {
        navigate('/superadmin');
      } else if (safeRole === 'client') {
        navigate('/client');
      } else if (safeRole === 'manager') {
        navigate('/manager');
      } else {
        navigate('/'); // Default to customer
      }

    } catch (err) {
      let msg = err.response?.data?.message || 'Invalid or expired OTP';
      if (Array.isArray(msg)) msg = msg[0];
      setError(String(msg));
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
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}
          {message && !error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-green-50 text-green-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center border border-green-100"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold"
              placeholder="Enter Email for OTP"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Login Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 text-center tracking-[0.5em] font-black focus:outline-none focus:border-[#9B4819] transition-colors"
              placeholder="XXXXXX"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center mb-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Login"}
            </button>
            <div className="flex justify-between text-[10px] uppercase font-bold mt-4">
              <button 
                type="button" 
                onClick={(e) => handleSendOtp(e)} 
                disabled={isLoading} 
                className="text-[#9B4819] hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}