import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Save, Phone, MessageSquare, Zap, LucideIcon, Briefcase, CalendarClock, Wrench, Wallet, Gift, FileText, CheckCircle2, Truck, PackageCheck } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

const languages = ['English', 'Pidgin', 'Yoruba', 'Hausa', 'Igbo'];
const priorities = [
  { key: 'call-sms', label: 'Call First, then SMS', hint: 'Recommended for Nigeria' },
  { key: 'sms-only', label: 'SMS Only', hint: 'Cheaper' },
  { key: 'call-only', label: 'Call Only', hint: 'Urgent' },
];

interface NotifType {
  key: string;
  title: string;
  icon: LucideIcon;
  script: string;
}

const types: NotifType[] = [
  { key: 'newJob', title: 'New Job', icon: Briefcase, script: 'You have a new [Style] job from [Customer]. Login to view details.' },
  { key: 'deliveryDate', title: 'Delivery Date', icon: CalendarClock, script: "Reminder: [Customer]'s [Style] job is due for delivery in 3 days." },
  { key: 'maintenance', title: 'Maintenance', icon: Wrench, script: 'Time to service your [Equipment]. Regular maintenance keeps your work top quality.' },
  { key: 'paymentDue', title: 'Payment Due', icon: Wallet, script: "[Customer]'s installment payment of ₦[Amount] is due today." },
  { key: 'birthday', title: 'Birthday', icon: Gift, script: 'Happy Birthday, [Name]! TPMarket wishes you a wonderful year ahead.' },
  { key: 'quoteAlert', title: 'Quote Alert', icon: FileText, script: '[Customer] just requested a quote for a [Style]. Reply soon to win the job.' },
  { key: 'jobReady', title: 'Job Ready', icon: CheckCircle2, script: "Good news! [Customer]'s [Style] job is marked complete and ready for review." },
  { key: 'deliveryInProgress', title: 'Delivery In-Progress', icon: Truck, script: "[Customer]'s [Style] order is now out for delivery." },
  { key: 'pickupReady', title: 'Pickup Ready', icon: PackageCheck, script: "[Customer]'s [Style] order is ready for pickup at your shop." },
];

interface RowState {
  voiceEnabled: boolean;
  voiceLanguage: string;
  smsEnabled: boolean;
  priority: string;
}

const initialState: Record<string, RowState> = Object.fromEntries(
  types.map((t) => [t.key, { voiceEnabled: true, voiceLanguage: 'English', smsEnabled: true, priority: 'call-sms' }])
);

function toSms(script: string) {
  return `TPMarket: ${script}`;
}

export default function AdminNotifications() {
  const [rows, setRows] = useState<Record<string, RowState>>(initialState);
  const [saved, setSaved] = useState(false);

  function update(key: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <PageShell>
      <Head>
        <title>Admin Notification Manager — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        <Link href="/" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Notification Manager 🔔</h1>
        <p className="text-[#64748B] font-medium mb-8">
          Control the primary (AI voice) and backup (SMS) channel for each notification type, and set delivery priority.
        </p>

        <div className="space-y-5 mb-6">
          {types.map((t) => {
            const row = rows[t.key];
            const Icon = t.icon;
            const smsText = toSms(t.script);
            const smsLen = smsText.length;
            return (
              <div key={t.key} className="bg-darkcard rounded-3xl p-5 sm:p-6 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-lemon/10 text-lemon flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <p className="text-white font-black text-base">{t.title}</p>
                </div>

                {/* PRIMARY: AI VOICE CALL */}
                <div className="bg-white/5 rounded-2xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
                      <Phone size={14} className="text-lemon" /> Primary: AI Voice Call
                    </p>
                    <button
                      type="button"
                      onClick={() => update(t.key, { voiceEnabled: !row.voiceEnabled })}
                      aria-label={`Toggle voice call for ${t.title}`}
                      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${row.voiceEnabled ? 'bg-lemon' : 'bg-white/15'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-[#0F172A] transition-all ${row.voiceEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className={row.voiceEnabled ? '' : 'opacity-40 pointer-events-none'}>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {languages.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => update(t.key, { voiceLanguage: l })}
                          className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                            row.voiceLanguage === l ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate hover:bg-white/20'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-xl p-3">
                      <p className="text-slate text-xs italic">“{t.script}”</p>
                    </div>
                  </div>
                </div>

                {/* BACKUP: SMS */}
                <div className="bg-white/5 rounded-2xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
                      <MessageSquare size={14} className="text-purple" /> Backup: SMS
                    </p>
                    <button
                      type="button"
                      onClick={() => update(t.key, { smsEnabled: !row.smsEnabled })}
                      aria-label={`Toggle SMS for ${t.title}`}
                      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${row.smsEnabled ? 'bg-lemon' : 'bg-white/15'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-[#0F172A] transition-all ${row.smsEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className={row.smsEnabled ? '' : 'opacity-40 pointer-events-none'}>
                    <div className="bg-[#0F172A] border border-white/10 rounded-xl p-3 mb-2">
                      <p className="text-slate text-xs">{smsText}</p>
                    </div>
                    <p className={`text-[11px] font-bold ${smsLen > 160 ? 'text-yellow' : 'text-slate'}`}>
                      {smsLen}/160 characters{smsLen > 160 ? ' — exceeds 1 SMS segment' : ''}
                    </p>
                  </div>
                </div>

                {/* DELIVERY PRIORITY */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide mb-3">
                    <Zap size={14} className="text-sky" /> Delivery Priority
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => update(t.key, { priority: p.key })}
                        className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                          row.priority === p.key
                            ? 'border-lemon bg-lemon/10'
                            : 'border-white/10 bg-transparent hover:border-white/25'
                        }`}
                      >
                        <p className={`text-xs font-black ${row.priority === p.key ? 'text-lemon' : 'text-white'}`}>{p.label}</p>
                        <p className="text-slate text-[10px]">{p.hint}</p>
                      </button>
                    ))}
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
