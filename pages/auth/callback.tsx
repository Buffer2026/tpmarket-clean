import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const tpmarketSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying your identity...');

  useEffect(() => {
    const handleSmartLogin = async () => {
      // 1. Get the session from the URL (Supabase does this automatically)
      const { data: { session }, error } = await tpmarketSupabase.auth.getSession();

      if (error || !session) {
        setStatus('Login failed. Link may be expired.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      const email = session.user.email;
      setStatus(`Welcome back! Finding your account...`);

      // 2. THE SMART ROUTER: Check where this email exists
      try {
        // Check if they are a Provider
        const { data: provider } = await tpmarketSupabase
          .from('providers')
          .select('id')
          .eq('email', email)
          .single();
        
        if (provider) {
          setStatus('Provider account found! Redirecting...');
          router.push('/provider/dashboard');
          return;
        }

        // If email is in Supabase Auth but not in any specific table yet
        setStatus('Account verified, but profile is incomplete.');
        setTimeout(() => router.push('/provider/register'), 3000);

      } catch (err) {
        console.error("Routing error:", err);
        setStatus('Error finding your dashboard.');
      }
    };

    handleSmartLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-[#0a192f] mb-2">TP Market Security</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}