import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

const topAfricanCountries = [
  "Nigeria (English)",
  "South Africa (English)",
  "Egypt (Arabic)",
  "Algeria (Arabic/French)",
  "Morocco (Arabic/French)",
  "Ethiopia (Amharic/English)",
  "Kenya (English)",
  "Ivory Coast / Côte d'Ivoire (French)",
  "Tanzania (English/Swahili)",
  "Ghana (English)",
  "Angola (Portuguese)",
  "DR Congo (French)",
  "Uganda (English)",
  "Sudan (Arabic/English)",
  "Tunisia (Arabic/French)",
  "Cameroon (English/French)",
  "Senegal (French)",
  "Libya (Arabic)",
  "Zambia (English)",
  "Rwanda (English/French)"
];

export default function ProviderRegister() {
  const router = useRouter();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '', 
    region: '', 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. GOOGLE SIGN UP
  const handleGoogleSignUp = async () => {
    setSubmitLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 2. EMAIL & PHONE SIGN UP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const strongRandomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: strongRandomPassword, 
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            country: formData.country,
            state: formData.region,
            user_type: 'provider',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Please Sign In instead.');
          return;
        }
        throw authError;
      }

      const userId = authData?.user?.id;

      // Save basic profile with is_verified: false (THE GATEKEEPER)
      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          id: userId,
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phone,
          country: formData.country,
          state: formData.region,
          is_verified: false, // CRITICAL: This blocks dashboard access until verified
        });

      if (providerError) throw providerError;

      setSuccess('✅ Account created! Please check your email for the secure login link.');
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);

    } catch (error: any) {
      console.error('Registration Error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 py-10 px-4">
      <Head><title>Join TPMarket as a Provider</title></Head>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a192f]">Become a TP Market Provider</h1>
          <p className="text-gray-600 mt-2">Join Africa's most trusted artisan network.</p>
        </div>

        <div className="bg-[#0a192f] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}
          {success && <div className="bg-[#ccff00]/10 border border-[#ccff00]/50 text-[#ccff00] text-sm p-3 rounded-lg mb-4 text-center">{success}</div>}

          {/* GOOGLE SIGN UP BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={submitLoading}
            className="w-full flex items-center justify-center gap-2 bg-white text-[#0a192f] font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-gray-600 flex-1"></div>
            <span className="text-gray-400 text-xs font-bold">OR CONTINUE WITH EMAIL</span>
            <div className="h-px bg-gray-600 flex-1"></div>
          </div>

          {/* SIMPLE 5-FIELD FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" 
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Country of Residence</label>
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]"
                >
                  <option value="">Select Country</option>
                  {topAfricanCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">State / Region</label>
                <input 
                  type="text" 
                  name="region" 
                  value={formData.region} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]"
                  placeholder="e.g. Lagos, Nairobi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}  
                  required
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" 
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" 
                  placeholder="+234..."
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitLoading} 
              className="w-full bg-[#ccff00] text-[#0a192f] font-bold text-lg py-4 rounded-xl hover:bg-[#b3e600] disabled:opacity-50 transition shadow-lg mt-4"
            >
              {submitLoading ? 'Creating Account...' : 'Create Account & Send Link 🚀'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <a href="/signin" className="text-[#ccff00] font-bold hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}