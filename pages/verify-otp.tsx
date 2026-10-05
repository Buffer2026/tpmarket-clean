import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('tpmarket_otp_email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/signin');
    }
  }, []);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setMessage('Invalid code. Please try again.');
    } else {
      setMessage('Success! Logging you in...');
      localStorage.removeItem('tpmarket_otp_email');
      router.push('/'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-black text-navy-900 mb-6 text-center">Enter 6-Digit Code</h1>
        <p className="text-center text-gray-600 mb-6">We sent a code to {email}</p>
        
        <form onSubmit={handleVerifyOTP}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 text-center text-2xl tracking-widest focus:border-[#ccff00] outline-none"
            placeholder="000000"
          />
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-[#ccff00] text-navy-900 font-black py-3 rounded-lg hover:bg-[#b3e600] transition disabled:bg-gray-300"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-bold text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
}