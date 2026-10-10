import React, { useState } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import { supabase } from '../../lib/supabase';
// Connect to the NEW tpmarket database


// Top 20 Richest African Countries by GDP, with primary languages
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

  // --- 1. States ---
  const [tpwecanId, setTpwecanId] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // --- 2. Form Data ---
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '', // Changed to empty to force selection
    region: '', // Changed from 'state' to 'region' for pan-African flexibility
    specialization: '',
    experience: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // --- 3. Verification Logic ---
  const handleVerifyTpwecan = async () => {
    setVerifyLoading(true);
    setVerifyError('');
    setVerifiedUser(null);

    try {
      const res = await fetch('/api/verify-tpwecan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tpwecan_id: tpwecanId }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setVerifyError(data.error || 'Verification failed.');
      } else {
        setVerifiedUser(data.user);
        setFormData(prev => ({
          ...prev,
          fullName: data.user.full_name,
          email: data.user.email || '',  
          phone: data.user.phone_number || '',
        }));
      }
    } catch (err) {
      setVerifyError('Network error. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 4. Submit Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedUser) { alert('Please verify your TPwecan ID first!'); return; }
    if (!formData.email) { alert('Email is required!'); return; }
    if (!formData.country) { alert('Please select your country!'); return; }
    
    setSubmitLoading(true);

    try {
      // STEP 1: Create Supabase Auth Account
      const strongRandomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: strongRandomPassword, 
        options: {
          data: {
            tpwecan_id: tpwecanId,
            full_name: formData.fullName,
            user_type: 'provider',
            country: formData.country,
            region: formData.region,
          }
        }
      });

      if (authError) throw authError;

      // STEP 2: Save to 'providers' table
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .insert({
          tpwecan_id: tpwecanId,
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phone,
          country: formData.country,
          state: formData.region, // Mapping 'region' to 'state' column for backward compatibility
          specialization: formData.specialization,
          years_of_experience: parseInt(formData.experience) || 0,
          is_verified: true,
          user_id: authData.user?.id, 
        })
        .select()
        .single();

      if (providerError) throw providerError;

      // STEP 3: Save Bank Details
      if (formData.bankName && formData.accountNumber) {
        const { error: bankError } = await supabase
          .from('provider_bank_details')
          .insert({
            provider_id: providerData.id,
            bank_name: formData.bankName,
            account_number: formData.accountNumber,
            account_name: formData.accountName || formData.fullName,
          });
        if (bankError) throw bankError;
      }

      localStorage.setItem('tpwecan_id', tpwecanId);
      alert('✅ Registration Successful! Please check your email for your secure login link.');
      router.push('/provider/login'); 

    } catch (error: any) {
      console.error('Registration Error:', error);
      alert('Error: ' + error.message);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- VERIFICATION GATE --- */}
          <div className="bg-[#0a192f] p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-white font-bold text-lg mb-4">🔐 Step 1: Verify your TPwecan ID</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Enter your TPwecan ID (e.g., WCN-EB185FDB)" value={tpwecanId} onChange={(e) => setTpwecanId(e.target.value)} className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" />
              <button type="button" onClick={handleVerifyTpwecan} disabled={verifyLoading || !tpwecanId} className="bg-[#ccff00] text-[#0a192f] font-bold px-6 py-3 rounded-lg hover:bg-[#b3e600] disabled:opacity-50 transition">
                {verifyLoading ? 'Checking...' : 'Verify ID'}
              </button>
            </div>
            {verifyError && <p className="text-red-400 text-sm mt-3">⚠️ {verifyError}</p>}
            {verifiedUser && <p className="text-[#ccff00] text-sm mt-3">✅ Verified! Welcome, {verifiedUser.full_name}.</p>}
          </div>

          {/* --- PERSONAL & LOCATION INFO --- */}
          <div className="bg-[#0a192f] p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-white font-bold text-lg mb-4">👤 Personal & Location Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} readOnly={!!verifiedUser} className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 disabled:opacity-70" />
              </div>
              
              {/* PAN-AFRICAN COUNTRY & REGION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Country of Residence</label>
                  <select name="country" value={formData.country} onChange={handleChange} required className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]">
                    <option value="">Select Country</option>
                    {topAfricanCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">State / Region of Residence</label>
                  <input 
                    type="text" 
                    name="region" 
                    value={formData.region} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]"
                    placeholder="e.g. Lagos, Nairobi, Cairo"
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
                  <input type="tel" name="phone" value={formData.phone} readOnly={!!verifiedUser} className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 disabled:opacity-70" />
                </div>
              </div>
            </div>
          </div>

          {/* --- PROFESSIONAL INFO --- */}
          <div className="bg-[#0a192f] p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-white font-bold text-lg mb-4">🛠️ Professional Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Main Specialization</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" placeholder="e.g. Mobile Vulcanizer" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Years of Experience</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleChange} required className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" placeholder="e.g. 5" />
              </div>
            </div>
          </div>

          {/* --- BANK DETAILS --- */}
          <div className="bg-[#0a192f] p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-white font-bold text-lg mb-4">🏦 Payout & Bank Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Bank Name</label>
                <select name="bankName" value={formData.bankName} onChange={handleChange} required className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]">
                  <option value="">Select Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank">GTBank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="UBA">UBA</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Ecobank">Ecobank</option>
                  <option value="Standard Bank">Standard Bank</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Account Number</label>
                  <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Account Name</label>
                  <input type="text" name="accountName" value={formData.accountName} onChange={handleChange} className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-[#ccff00]" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitLoading || !verifiedUser} className="w-full bg-[#ccff00] text-[#0a192f] font-bold text-lg py-4 rounded-xl hover:bg-[#b3e600] disabled:opacity-50 transition shadow-lg">
            {submitLoading ? 'Creating Account...' : 'Complete Registration & Launch Store 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}