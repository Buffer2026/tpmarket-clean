import type { AppProps } from 'next/app';
import '../styles/global.css';

export default function App({ Component, pageProps }: AppProps) {
  // We removed the routing logic from here to prevent redirect loops 
  // and session race conditions. The callback.tsx file will handle it safely.
  return <Component {...pageProps} />;
}