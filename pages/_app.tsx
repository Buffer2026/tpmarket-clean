import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  // We removed the routing logic from here to prevent redirect loops 
  // and session race conditions. The callback.tsx file will handle it safely.
  return (
    <>
      <Head>
        {/* This forces the browser to use your logo as the favicon */}
        <link rel="icon" href="/tpm-logo.png" />
        <title>TP Market</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}