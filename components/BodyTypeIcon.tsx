type BodyGender = 'man' | 'woman';
export type BodyTypeKey = 'skinny' | 'average' | 'athletic' | 'muscular' | 'curvy' | 'plus';

interface Dims {
  upper: number;
  lower: number;
}

// Plain CSS shapes (divs + border-radius) — no drawn art. Widths are proportional per type.
const dims: Record<BodyTypeKey, Dims> = {
  skinny: { upper: 17, lower: 15 },
  average: { upper: 26, lower: 23 },
  athletic: { upper: 34, lower: 18 },
  muscular: { upper: 38, lower: 22 },
  curvy: { upper: 22, lower: 32 },
  plus: { upper: 42, lower: 41 },
};

// Women: slightly narrower shoulders, slightly fuller hips than the same type on men
const genderAdjust: Record<BodyGender, { upperMul: number; lowerMul: number }> = {
  man: { upperMul: 1, lowerMul: 1 },
  woman: { upperMul: 0.85, lowerMul: 1.1 },
};

interface BodyTypeIconProps {
  gender: BodyGender;
  type: BodyTypeKey;
  selected?: boolean;
}

export default function BodyTypeIcon({ gender, type, selected = false }: BodyTypeIconProps) {
  const d = dims[type];
  const adj = genderAdjust[gender];
  const upperW = Math.round(d.upper * adj.upperMul);
  const lowerW = Math.round(d.lower * adj.lowerMul);
  const color = selected ? 'bg-lemon' : 'bg-white/60';

  return (
    <div className="flex flex-col items-center justify-end h-16 w-full gap-[2px]">
      <div className={`w-4 h-4 rounded-full ${color}`} />
      <div className={`w-1.5 h-1 ${color}`} />
      <div className={`rounded-xl ${color}`} style={{ width: upperW, height: 16 }} />
      <div className={`rounded-xl ${color}`} style={{ width: lowerW, height: 13 }} />
      <div className="flex gap-1">
        <div className={`w-1.5 h-5 rounded-full ${color}`} />
        <div className={`w-1.5 h-5 rounded-full ${color}`} />
      </div>
    </div>
  );
}
