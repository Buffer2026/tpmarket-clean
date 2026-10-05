import { useRef, useState } from 'react';
import { Shirt } from 'lucide-react';

const gradients = [
  'from-purple/40 to-sky/30',
  'from-sky/40 to-lemon/20',
  'from-lemon/20 to-purple/40',
  'from-darkcard to-purple/50',
  'from-sky/30 to-darkcard',
];

const designs = Array.from({ length: 10 }, (_, i) => i + 1);

interface PastWorkGalleryProps {
  title?: string;
}

export default function PastWorkGallery({ title = 'Recent Masterpieces ✨' }: PastWorkGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = el.scrollLeft / maxScroll;
    const index = Math.round(ratio * (designs.length - 1));
    setActiveIndex(Math.min(designs.length - 1, Math.max(0, index)));
  }

  function goTo(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (index / (designs.length - 1)) * maxScroll, behavior: 'smooth' });
  }

  return (
    <div className="bg-darkcard rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
      <p className="text-lemon font-black text-sm mb-4">{title}</p>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {designs.map((n, i) => (
          <div
            key={n}
            className={`shrink-0 w-[62%] sm:w-[38%] md:w-[26%] aspect-[3/4] snap-center rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} border border-white/10 flex flex-col items-center justify-center gap-3`}
          >
            <Shirt className="text-white/70" size={36} />
            <span className="text-white font-black text-sm">Design {n}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        {designs.map((n, i) => (
          <button
            key={n}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to design ${n}`}
            className={`rounded-full transition-all ${activeIndex === i ? 'w-5 h-1.5 bg-lemon' : 'w-1.5 h-1.5 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
