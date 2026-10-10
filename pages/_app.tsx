import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AppProps } from 'next/app';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      console.log('SESSION ON LOAD:', !!data.session)
    );
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AUTH EVENT:', event, 'session?', !!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return <Component {...pageProps} />;