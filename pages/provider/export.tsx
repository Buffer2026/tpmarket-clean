import Head from 'next/head';
import Link from 'next/link';

export default function ExportActivation() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center">
      <Head><title>Global Export — TP Market</title></Head>
      
      <div className="bg-[#1E293B] p-8 rounded-3xl max-w-md border border-white/10">
        <div className="text-6xl mb-4">✈️</div>
        <h1 className="text-2xl font-black mb-2">Global Export Hub</h1>
        <p className="text-slate-400 mb-6">
          Reach international buyers with NEPC-certified exports. 
          <br/><br/>
          <span className="text-[#ccff00] font-bold">Coming Soon!</span>
        </p>
        <Link href="/dashboard" className="text-[#ccff00] font-bold hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}