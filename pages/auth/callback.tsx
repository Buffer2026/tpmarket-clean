import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Wait for Supabase to process the token from the email link URL
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth error:', error);
        router.push('/signin');
        return;
      }

      // 2. If we have a session, give it a tiny moment to ensure LocalStorage is fully updated
      if (session) {
        await new Promise(resolve => setTimeout(resolve, 800)); // 800ms wait guarantees the session is saved
        router.push('/marketplace');
      } else {
        // 3. No session? Go back to sign in
        router.push('/signin');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0F172A]">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ccff00] border-t-transparent"></div>
        <p className="mt-4 text-white font-bold">Securing your session...</p>
      </div>
    </div>
  );
}