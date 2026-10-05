import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession, logout as clearSession, Session } from '../lib/auth';

// Guards a page: redirects to /signin if there's no valid session, and again the moment
// the 24-hour session expires while the tab stays open. Also exposes a logout() action.
export function useRequireAuth() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace('/signin');
      return;
    }
    setSession(current);
    setChecked(true);

    const interval = setInterval(() => {
      if (!getSession()) {
        router.replace('/signin');
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [router]);

  function logout() {
    clearSession();
    router.replace('/signin');
  }

  return { session, checked, logout };
}
