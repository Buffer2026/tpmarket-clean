import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase'; // <-- USES THE SHARED CONNECTION

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleSmartLogin = async () => {
      // 1. This reads the URL and saves the session to your browser's memory
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error('Login failed:', error);
        router.push('/signin?error=login_failed');
        return;
      }

      // 2. Session is saved! Now let's route them.
      try {
        // Check if they are a Provider
        const { data: provider } = await supabase
          .from('providers')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle(); // maybeSingle prevents errors if no provider is found
        
        if (provider) {
          // They are a provider. Send them to marketplace first (as you requested), 
          // and they can click "Account" to go to the dashboard.
          router.push('/marketplace');
        } else {
          // Regular customer
          router.push('/marketplace');
        }
      } catch (err) {
        console.error("Routing error:", err);
        // Fallback to marketplace if anything goes wrong
        router.push('/marketplace');
        }
    };

    handleSmartLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="bg-darkcard p-8 rounded-xl shadow-lg text-center border border-white/10">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-white mb-2">TP Market Security</h1>
        <p className="text-slate">Securing your session and redirecting...</p>
      </div>
    </div>
  );
}