import { LucideIcon } from 'lucide-react';

interface BentoCardProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  accent?: 'lemon' | 'purple' | 'sky';
  className?: string;
}

const accentMap = {
  lemon: 'text-lemon bg-lemon/10',
  purple: 'text-purple bg-purple/10',
  sky: 'text-sky bg-sky/10',
};

export default function BentoCard({ icon: Icon, emoji, title, description, accent = 'lemon', className = '' }: BentoCardProps) {
  return (
    <div
      className={`bg-darkcard rounded-3xl p-6 border border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300 ${className}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl ${accentMap[accent]}`}>
        {emoji ? <span>{emoji}</span> : Icon ? <Icon size={22} /> : null}
      </div>
      <h3 className="text-lg font-black text-white mb-2">{title}</h3>
      <p className="text-slate text-sm leading-relaxed">{description}</p>
    </div>
  );
}
