import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Standard favicon for desktop */}
        <link rel="icon" href="/tpm-logo.png" />
        
        {/* Mobile-friendly favicon (Android & iOS respect this) */}
        <link rel="apple-touch-icon" href="/tpm-logo.png" />
        
        {/* Makes the top browser bar match your app's dark theme */}
        <meta name="theme-color" content="#0F172A" />
        
        <title>TP Market</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}