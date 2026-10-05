import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Save, PhoneCall } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

const items = [
  'New Job',
  'Delivery Date',
  'Maintenance',
  'Payment Due',
  'Birthday',
  'Quote Alert',
  'Job Ready',
  'Delivery In-Progress',
  'Pickup Ready',
];

const audiences = ['Customers', 'Providers', 'Everyone'];
const languages = ['English', 'Pidgin', 'Yoruba', 'Hausa', 'Igbo'];

interface RowState {
  enabled: boolean;
  audience: string;
  language: string;
}

const initialState: Record<string, RowState> = Object.fromEntries(
  items.map((label) => [label, { enabled: true, audience: 'Everyone', language: 'English' }])
);

export default function AdminAiCalls() {
  const [rows, setRows] = useState<Record<string, RowState>>(initialState);
  const [saved, setSaved] = useState(false);

  function toggle(label: string) {
    setRows((prev) => ({ ...prev, [label]: { ...prev[label], enabled: !prev[label].enabled } }));
  }

  function setAudience(label: string, audience: string) {
    setRows((prev) => ({ ...prev, [label]: { ...prev[label], audience } }));
  }

  function setLanguage(label: string, language: string) {
    setRows((prev) => ({ ...prev, [label]: { ...prev[label], language } }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <PageShell>
      <Head>
        <title>AI Voice Notifications — Admin — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        <Link href="/" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-darkcard text-lemon flex items-center justify-center shrink-0">
            <PhoneCall size={20} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A]">AI Voice Notifications 📞</h1>
        </div>
        <p className="text-[#64748B] font-medium mb-8">
          Platform-wide controls — turn each call type on or off, and set who receives it and in what language.
        </p>

        <div className="bg-darkcard rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] divide-y divide-white/10 overflow-hidden mb-6">
          {items.map((label) => {
            const row = rows[label];
            return (
              <div key={label} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-between sm:justify-start sm:w-48 shrink-0 gap-3">
                  <p className={`font-bold text-sm ${row.enabled ? 'text-white' : 'text-slate'}`}>{label}</p>
                  <button
                    type="button"
                    onClick={() => toggle(label)}
                    aria-label={`Toggle ${label}`}
                    className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${row.enabled ? 'bg-lemon' : 'bg-white/15'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-[#0F172A] transition-all ${row.enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 ${row.enabled ? '' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex-1">
                    <label className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1 block">Audience</label>
                    <select
                      value={row.audience}
                      onChange={(e) => setAudience(label, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-semibold focus:outline-none focus:border-lemon/50"
                    >
                      {audiences.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1 block">Language</label>
                    <select
                      value={row.language}
                      onChange={(e) => setLanguage(label, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white font-semibold focus:outline-none focus:border-lemon/50"
                    >
                      {languages.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
        >
          <Save size={18} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </PageShell>
  );
}
