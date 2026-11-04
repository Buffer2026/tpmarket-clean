import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This page has been eliminated. All publishing now goes through the secure dashboard.
export default function PublishRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Instantly redirect to the secure provider dashboard
    router.replace('/provider/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
      <p className="font-bold">Redirecting to secure dashboard...</p>
    </div>
  );
}