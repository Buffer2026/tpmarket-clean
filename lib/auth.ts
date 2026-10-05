export const SESSION_KEY = 'tpmarket_session';
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface Session {
  identifier: string;
  issuedAt: number;
  role?: 'customer' | 'provider';
}

// Passwordless session: created once a 6-digit OTP is verified on /signin.
// role isn't collected at login yet, so it defaults to 'customer' wherever it's read.
export function createSession(identifier: string, role?: 'customer' | 'provider'): void {
  if (typeof window === 'undefined') return;
  const session: Session = { identifier, issuedAt: Date.now(), role };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Returns the active session, or null if there isn't one or it's past the 24-hour timeout
// (in which case the stale session is cleared automatically).
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() - session.issuedAt > SESSION_DURATION_MS) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// Clears the session. Callers are responsible for redirecting to /signin afterward.
export function logout(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}
