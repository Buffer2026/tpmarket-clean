import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import type { AppProps } from 'next/app';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // This listener runs in the background and keeps your login session alive 
    // every time you click a button or change pages.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // If we just signed in via the callback, push to marketplace
        if (router.pathname === '/auth/callback') {
          router.push('/marketplace');
        }
      }
    });

    // Clean up the listener when the app closes
    return () => subscription.unsubscribe();
  }, [router]);

  return <Component {...pageProps} />;
}