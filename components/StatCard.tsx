import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: 'lemon' | 'purple' | 'yellow' | 'sky';
}

const accentMap = {
  lemon: { text: 'text-lemon', bg: 'bg-lemon/10', glow: 'shadow-[0_0_40px_rgba(204,255,0,0.25)]' },
  purple: { text: 'text-purple', bg: 'bg-purple/10', glow: 'shadow-[0_0_40px_rgba(139,92,246,0.3)]' },
  yellow: { text: 'text-yellow', bg: 'bg-yellow/10', glow: 'shadow-[0_0_40px_rgba(250,204,21,0.3)]' },
  sky: { text: 'text-sky', bg: 'bg-sky/10', glow: 'shadow-[0_0_40px_rgba(135,206,235,0.3)]' },
};

export default function StatCard({ icon: Icon, label, value, accent = 'lemon' }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div className={`bg-darkcard rounded-3xl p-6 border border-white/10 hover:-translate-y-1 transition-all duration-300 ${a.glow}`}>
      <div className={`w-11 h-11 rounded-xl ${a.bg} ${a.text} flex items-center justify-center mb-4`}>
        <Icon size={22} />
      </div>
      <p className="text-slate text-sm mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}
