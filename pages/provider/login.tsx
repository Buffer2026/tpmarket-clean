import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // MAGIC LINK LOGIC
      // This sends the email and tells Supabase to take them to the Marketplace
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://tpmarket.ng', // Takes them to the marketplace
        },
      });

      if (error) throw error;
      
      setMessage('✅ Check your email! We sent you a secure login link.');
      
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0a192f]">TP MARKET</h1>
          <p className="text-gray-500 mt-2">
            Enter your email to receive a secure login link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 bg-white focus:border-[#ccff00] focus:outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-bold ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ccff00] text-[#0a192f] font-black text-lg py-3 rounded-xl hover:bg-[#b3e600] transition disabled:bg-gray-300"
          >
            {loading ? 'Sending Link...' : 'Send Magic Link'}
          </button>
        </form>

      </div>
    </div>
  );
}