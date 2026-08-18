import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success!

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const extractError = (err) => {
    let msg = err?.response?.data?.message || 'An error occurred. Backend unreachable.';
    if (Array.isArray(msg)) msg = msg[0];
    if (typeof msg === 'object' && msg !== null) msg = JSON.stringify(msg);
    return String(msg);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true); setError(''); setMessage('');

    try {
      const response = await api.post('/auth/send-otp', { email });
      setMessage(response.data.message || 'Recovery OTP sent successfully');
      setStep(2);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setMessage('');

    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setMessage('OTP Verified. Please set your new password.');
      setStep(3);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      await api.post('/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStep(4);
    } catch (err) {
      setError(extractError(err));
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
        {step !== 4 && (
          <h1 className="text-4xl font-black text-center mb-6 uppercase">
            DRAG<span className="text-[#9B4819]">.</span>
          </h1>
        )}

        <AnimatePresence>
          {error && step !== 4 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center border border-red-100">
              {error}
            </motion.div>
          )}
          {message && !error && step !== 4 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 text-green-600 text-[10px] font-bold uppercase p-3 rounded-xl mb-6 text-center border border-green-100">
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <p className="text-xs font-bold text-gray-400 uppercase text-center mb-4">Account Recovery</p>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold" placeholder="Enter Email" />
            <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <p className="text-xs font-bold text-gray-400 uppercase text-center mb-4">Verify Identity</p>
            <input type="text" maxLength="6" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 text-center tracking-[0.5em] font-black focus:outline-none focus:border-[#9B4819] transition-colors" placeholder="XXXXXX" />
            <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center mb-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Account"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="bg-orange-50 text-orange-600 text-[9px] font-bold uppercase p-3 rounded-xl mb-2 text-center">
              Requires old password for verification
            </div>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold" placeholder="Old Password" />
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl py-4 px-5 focus:outline-none focus:border-[#9B4819] transition-colors text-[12px] font-bold" placeholder="New Password" />

            <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Password"}
            </button>
          </form>
        )}

        {/* NEW MODERN SUCCESS SCREEN */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center space-y-6 py-4"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
              <CheckCircle size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-[#111]">Securely Updated</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3">
                Your password has been reset.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] transition-colors text-white py-5 rounded-2xl uppercase text-[10px] font-bold flex justify-center items-center mt-4"
            >
              Return to Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}