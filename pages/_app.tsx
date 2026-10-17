import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import type { AppProps } from 'next/app';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // 1. Check session on mount to prevent redirect loops
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && router.pathname === '/signin') {
        router.push('/marketplace');
      }
    });

    // 2. Listen for auth changes (like coming from the email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && router.pathname === '/auth/callback') {
        router.push('/marketplace');
      }
    });

    // 3. Clean up the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, [router]);

  return <Component {...pageProps} />;
}