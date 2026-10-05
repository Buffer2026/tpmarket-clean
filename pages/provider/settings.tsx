import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Phone,
  ArrowLeft,
  Save,
  Briefcase,
  CalendarClock,
  Wrench,
  Wallet,
  Gift,
  FileText,
  CheckCircle2,
  Truck,
  PackageCheck,
  LucideIcon,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

const languages = ['English', 'Pidgin', 'Yoruba', 'Hausa', 'Igbo'];

interface Scenario {
  key: string;
  title: string;
  icon: LucideIcon;
  script: string;
}

const scenarios: Scenario[] = [
  { key: 'newJob', title: 'New job notifications', icon: Briefcase, script: 'You have a new [Style] job from [Customer]. Login to view details.' },
  { key: 'deliveryReminder', title: 'Job delivery date reminders (3 days before)', icon: CalendarClock, script: "Reminder: [Customer]'s [Style] job is due for delivery in 3 days." },
  { key: 'equipmentMaintenance', title: 'Equipment maintenance reminders', icon: Wrench, script: 'Time to service your [Equipment]. Regular maintenance keeps your work top quality.' },
  { key: 'installmentDue', title: 'Installment payment due dates', icon: Wallet, script: "[Customer]'s installment payment of ₦[Amount] is due today." },
  { key: 'birthday', title: 'Birthday wishes (auto-call on their birthday)', icon: Gift, script: 'Happy Birthday, [Name]! TPMarket wishes you a wonderful year ahead.' },
  { key: 'quoteRequest', title: 'Quote request alerts', icon: FileText, script: '[Customer] just requested a quote for a [Style]. Reply soon to win the job.' },
  { key: 'jobComplete', title: "Job completion alerts (customer's job is ready)", icon: CheckCircle2, script: "Good news! [Customer]'s [Style] job is marked complete and ready for review." },
  { key: 'deliveryInProgress', title: 'Delivery in-progress notifications', icon: Truck, script: "[Customer]'s [Style] order is now out for delivery." },
  { key: 'pickupReady', title: 'Pickup ready notifications', icon: PackageCheck, script: "[Customer]'s [Style] order is ready for pickup at your shop." },
];

interface ScenarioState {
  enabled: boolean;
  language: string;
}

const initialState: Record<string, ScenarioState> = Object.fromEntries(
  scenarios.map((s) => [s.key, { enabled: true, language: 'English' }])
);

export default function ProviderSettings() {
  const [phone, setPhone] = useState('+234 706 335 1745');
  const [saved, setSaved] = useState(false);
  const [scenarioState, setScenarioState] = useState<Record<string, ScenarioState>>(initialState);

  function toggleScenario(key: string) {
    setScenarioState((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  }

  function setScenarioLanguage(key: string, language: string) {
    setScenarioState((prev) => ({ ...prev, [key]: { ...prev[key], language } }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <PageShell>
      <Head>
        <title>AI Call Notification Manager — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10 relative">
        <Link href="/dashboard/provider" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">AI Call Notification Manager 📞</h1>
        <p className="text-[#64748B] font-medium mb-8">Choose which events trigger an automated AI phone call — and in which language.</p>

        <div className="bg-darkcard rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <label className="text-slate text-xs font-semibold mb-1.5 block">Phone Number for All Calls</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {scenarios.map((s) => {
            const state = scenarioState[s.key];
            const Icon = s.icon;
            return (
              <div key={s.key} className="bg-darkcard rounded-3xl p-5 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${state.enabled ? 'bg-lemon/10 text-lemon' : 'bg-white/10 text-slate'}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-white font-bold text-sm leading-snug">{s.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleScenario(s.key)}
                    aria-label={`Toggle ${s.title}`}
                    className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${state.enabled ? 'bg-lemon' : 'bg-white/15'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-[#0F172A] transition-all ${state.enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className={state.enabled ? '' : 'opacity-40 pointer-events-none'}>
                  <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1.5">Language</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {languages.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setScenarioLanguage(s.key, l)}
                        className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                          state.language === l ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate hover:bg-white/20'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1.5">Script Preview</p>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-slate text-xs italic">“{s.script}”</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all mb-3"
        >
          <Save size={18} /> {saved ? 'Saved!' : 'Save All Settings'}
        </button>

        <Link
          href="/provider/incoming-call"
          className="block text-center bg-white/10 text-white font-black py-3.5 rounded-full hover:bg-white/20 transition-all"
        >
          Preview Incoming Call 📞
        </Link>
      </div>
    </PageShell>
  );
}
