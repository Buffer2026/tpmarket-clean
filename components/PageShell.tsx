import { ReactNode } from 'react';
import GradientOrbs from './GradientOrbs';

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky via-cyanlight to-white text-[#0F172A] relative overflow-hidden">
      <GradientOrbs />
      {children}
    </div>
  );
}
