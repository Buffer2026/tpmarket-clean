type Gender = 'man' | 'woman' | 'child';
type View = 'front' | 'side' | 'back';

interface Measurements {
  height: number;
  neck: number;
  shoulder: number;
  chest: number;
  waist: number;
  hips: number;
  inseam: number;
  sleeve: number;
}

interface AvatarPreviewProps {
  gender: Gender;
  view: View;
  measurements: Measurements;
}

// Mock default measurements, pre-filled into the form on load
export const baseline: Record<Gender, Measurements> = {
  man: { height: 175, neck: 40, shoulder: 48, chest: 102, waist: 81, hips: 98, inseam: 80, sleeve: 62 },
  woman: { height: 162, neck: 34, shoulder: 39, chest: 92, waist: 70, hips: 98, inseam: 74, sleeve: 56 },
  child: { height: 110, neck: 28, shoulder: 30, chest: 55, waist: 52, hips: 58, inseam: 45, sleeve: 35 },
};

// Natural body-shape baselines — men broader shoulders, women curvier hip-to-waist, child slimmer overall
const shapeBase = {
  man: { shoulderHalfW: 54, bustHalfW: 48, waistHalfW: 38, hipHalfW: 42, thighHalfW: 26 },
  woman: { shoulderHalfW: 42, bustHalfW: 46, waistHalfW: 32, hipHalfW: 50, thighHalfW: 28 },
  child: { shoulderHalfW: 30, bustHalfW: 30, waistHalfW: 28, hipHalfW: 30, thighHalfW: 18 },
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n) || Number.isNaN(n)) return 1;
  return Math.min(max, Math.max(min, n));
}

// Smooths a polyline into a flowing curve by quadratic-curving through each vertex
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const mx = (cx + nx) / 2;
    const my = (cy + ny) / 2;
    d += ` Q ${cx},${cy} ${mx},${my}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0]},${last[1]} Z`;
  return d;
}

export default function AvatarPreview({ gender, view, measurements }: AvatarPreviewProps) {
  const base = baseline[gender];
  const shape = shapeBase[gender];

  const shoulderScale = clamp(measurements.shoulder / base.shoulder, 0.75, 1.3);
  const chestScale = clamp(measurements.chest / base.chest, 0.75, 1.35);
  const waistScale = clamp(measurements.waist / base.waist, 0.7, 1.35);
  const hipsScale = clamp(measurements.hips / base.hips, 0.75, 1.35);
  const heightScale = clamp(measurements.height / base.height, 0.7, 1.15);
  const inseamScale = clamp(measurements.inseam / base.inseam, 0.8, 1.25);
  const armScale = clamp(measurements.sleeve / base.sleeve, 0.8, 1.25);

  const cx = 190;
  const headCy = 62;
  const headRx = 24;
  const headRy = 30;

  const neckTopY = headCy + headRy - 4;
  const neckBottomY = neckTopY + 14 * heightScale;
  const shoulderY = neckBottomY + 6 * heightScale;
  const bustY = shoulderY + 42 * heightScale;
  const waistY = bustY + 55 * heightScale;
  const hipY = waistY + 45 * heightScale;
  const crotchY = hipY + 26 * heightScale;
  const kneeY = crotchY + 96 * heightScale * inseamScale;
  const ankleY = kneeY + 96 * heightScale * inseamScale;
  const footY = ankleY + 12 * heightScale;

  const shoulderHalfW = shape.shoulderHalfW * shoulderScale;
  const bustHalfW = shape.bustHalfW * chestScale;
  const waistHalfW = shape.waistHalfW * waistScale;
  const hipHalfW = shape.hipHalfW * (view === 'back' ? hipsScale * 1.04 : hipsScale);
  const thighHalfW = shape.thighHalfW * clamp((hipsScale + 1) / 2, 0.8, 1.2);
  const kneeHalfW = 15;
  const ankleHalfW = 10;
  const footHalfW = ankleHalfW + 5;
  const innerGap = 9;
  const armLen = 172 * armScale;
  const armW = 15;

  // rightX / leftX per body level — symmetric for front & back, asymmetric (front/back depth) for side
  let shoulderRight = shoulderHalfW, shoulderLeft = shoulderHalfW;
  let bustRight = bustHalfW, bustLeft = bustHalfW;
  let waistRight = waistHalfW, waistLeft = waistHalfW;
  let hipRight = hipHalfW, hipLeft = hipHalfW;
  let thighRight = thighHalfW, thighLeft = thighHalfW;

  let outline: [number, number][];
  let armAnchorX = cx - shoulderHalfW - armW - 3;

  if (view === 'side') {
    shoulderRight = 20; shoulderLeft = 24;
    bustRight = bustHalfW * 0.85; bustLeft = 16;
    waistRight = waistHalfW * 0.5; waistLeft = 22;
    hipRight = hipHalfW * 0.42; hipLeft = hipHalfW * 0.92;
    thighRight = thighHalfW * 0.55; thighLeft = thighHalfW * 0.72;
    const kneeR = kneeHalfW * 0.65, kneeL = kneeHalfW * 0.65;
    const ankleR = ankleHalfW * 0.65, ankleL = ankleHalfW * 0.65;
    const toe = footHalfW * 1.5, heel = footHalfW * 0.55;

    outline = [
      [cx + shoulderRight, shoulderY],
      [cx + bustRight, bustY],
      [cx + waistRight, waistY],
      [cx + hipRight, hipY],
      [cx + thighRight, crotchY + 10],
      [cx + kneeR, kneeY],
      [cx + ankleR, ankleY],
      [cx + toe, footY],
      [cx - heel, footY],
      [cx - ankleL, ankleY],
      [cx - kneeL, kneeY],
      [cx - thighLeft, crotchY + 10],
      [cx - hipLeft, hipY],
      [cx - waistLeft, waistY],
      [cx - bustLeft, bustY],
      [cx - shoulderLeft, shoulderY],
      [cx - 10, neckBottomY],
      [cx + 10, neckBottomY],
    ];
    armAnchorX = cx - 24 - armW - 2;
  } else {
    outline = [
      [cx + shoulderHalfW, shoulderY],
      [cx + bustHalfW, bustY],
      [cx + waistHalfW, waistY],
      [cx + hipHalfW, hipY],
      [cx + thighHalfW, crotchY + 10],
      [cx + kneeHalfW, kneeY],
      [cx + ankleHalfW, ankleY],
      [cx + footHalfW, footY],
      [cx + innerGap, footY],
      [cx + innerGap, ankleY],
      [cx + innerGap * 0.5, crotchY],
      [cx - innerGap * 0.5, crotchY],
      [cx - innerGap, ankleY],
      [cx - innerGap, footY],
      [cx - footHalfW, footY],
      [cx - ankleHalfW, ankleY],
      [cx - kneeHalfW, kneeY],
      [cx - thighHalfW, crotchY + 10],
      [cx - hipHalfW, hipY],
      [cx - waistHalfW, waistY],
      [cx - bustHalfW, bustY],
      [cx - shoulderHalfW, shoulderY],
      [cx - 11, neckBottomY],
      [cx + 11, neckBottomY],
    ];
  }

  const bodyPath = smoothPath(outline);
  const gradId = `bodyGrad-${gender}-${view}`;

  // Exactly one dashed callout per form field — no extra/derived labels
  const inseamLabelY = (crotchY + ankleY) / 2;
  const inseamLabelX = view === 'side' ? cx - 15 : cx - innerGap;

  const labels: { name: string; value: number; y: number; x: number; side: 'left' | 'right' }[] = [
    { name: 'Neck', value: Math.round(measurements.neck) || 0, y: neckBottomY + 6, x: cx + 11, side: 'right' },
    { name: 'Shoulder', value: Math.round(measurements.shoulder) || 0, y: shoulderY, x: cx - shoulderLeft, side: 'left' },
    { name: 'Chest', value: Math.round(measurements.chest) || 0, y: bustY, x: cx + bustRight, side: 'right' },
    { name: 'Waist', value: Math.round(measurements.waist) || 0, y: waistY, x: cx - waistLeft, side: 'left' },
    { name: 'Hips', value: Math.round(measurements.hips) || 0, y: hipY, x: cx + hipRight, side: 'right' },
    { name: 'Sleeve', value: Math.round(measurements.sleeve) || 0, y: shoulderY + armLen * 0.28, x: armAnchorX, side: 'left' },
    { name: 'Inseam', value: Math.round(measurements.inseam) || 0, y: inseamLabelY, x: inseamLabelX, side: 'left' },
  ];

  const plateWidth = 130;

  return (
    <svg
      viewBox="0 0 460 600"
      className="w-full max-w-[380px] mx-auto"
      style={{ filter: 'drop-shadow(0 0 16px rgba(204,255,0,0.5))' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9C6A3F" />
          <stop offset="100%" stopColor="#5A3A22" />
        </linearGradient>
      </defs>

      {/* measurement callout lines + labels */}
      <g style={{ transition: 'all 0.3s ease' }}>
        {labels.map((l) => (
          <g key={l.name}>
            <line
              x1={l.x}
              y1={l.y}
              x2={l.side === 'right' ? 320 : 124}
              y2={l.y}
              stroke="#CCFF00"
              strokeWidth={1.1}
              strokeDasharray="4 4"
            />
            <text
              x={l.side === 'right' ? 326 : 118}
              y={l.y + 4}
              fill="#CCFF00"
              fontSize={12}
              fontWeight={800}
              textAnchor={l.side === 'right' ? 'start' : 'end'}
            >
              {l.name}: {l.value}cm
            </text>
          </g>
        ))}

        {/* height bracket */}
        <line x1={400} y1={headCy - headRy} x2={400} y2={footY} stroke="#F8FAFC" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={393} y1={headCy - headRy} x2={407} y2={headCy - headRy} stroke="#F8FAFC" strokeWidth={1} />
        <line x1={393} y1={footY} x2={407} y2={footY} stroke="#F8FAFC" strokeWidth={1} />
        <text
          x={414}
          y={(headCy - headRy + footY) / 2}
          fill="#F8FAFC"
          fontSize={12}
          fontWeight={800}
          transform={`rotate(90 414 ${(headCy - headRy + footY) / 2})`}
          textAnchor="middle"
        >
          Height: {Math.round(measurements.height) || 0}cm
        </text>
      </g>

      {/* arms (side view renders a single arm; front/back render both) */}
      {view !== 'side' && (
        <rect
          x={cx + shoulderHalfW + 3}
          y={shoulderY + 6}
          width={armW}
          height={armLen}
          rx={armW / 2}
          fill={`url(#${gradId})`}
          stroke="#CCFF00"
          strokeWidth={1}
          style={{ transition: 'all 0.3s ease' }}
        />
      )}
      <rect
        x={armAnchorX}
        y={shoulderY + 6}
        width={armW}
        height={armLen}
        rx={armW / 2}
        fill={`url(#${gradId})`}
        stroke="#CCFF00"
        strokeWidth={1}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* body silhouette */}
      <path d={bodyPath} fill={`url(#${gradId})`} stroke="#CCFF00" strokeWidth={2} style={{ transition: 'all 0.3s ease' }} />

      {/* bust contour — women, front view only */}
      {gender === 'woman' && view === 'front' && (
        <>
          <ellipse cx={cx - bustHalfW * 0.4} cy={bustY + 18} rx={bustHalfW * 0.32} ry={15} fill="none" stroke="#CCFF00" strokeWidth={0.75} opacity={0.5} />
          <ellipse cx={cx + bustHalfW * 0.4} cy={bustY + 18} rx={bustHalfW * 0.32} ry={15} fill="none" stroke="#CCFF00" strokeWidth={0.75} opacity={0.5} />
        </>
      )}

      {/* back-view surface details */}
      {view === 'back' && (
        <g opacity={0.5} style={{ transition: 'all 0.3s ease' }}>
          <path d={`M ${cx - bustHalfW * 0.45} ${bustY - 8} Q ${cx - bustHalfW * 0.6} ${bustY + 14} ${cx - bustHalfW * 0.3} ${bustY + 32}`} fill="none" stroke="#CCFF00" strokeWidth={1} />
          <path d={`M ${cx + bustHalfW * 0.45} ${bustY - 8} Q ${cx + bustHalfW * 0.6} ${bustY + 14} ${cx + bustHalfW * 0.3} ${bustY + 32}`} fill="none" stroke="#CCFF00" strokeWidth={1} />
          <line x1={cx} y1={shoulderY + 4} x2={cx} y2={hipY - 6} stroke="#CCFF00" strokeWidth={0.75} strokeDasharray="2 4" />
          <path d={`M ${cx - hipHalfW * 0.6} ${hipY + hipHalfW * 0.15} Q ${cx} ${hipY + hipHalfW * 0.55} ${cx + hipHalfW * 0.6} ${hipY + hipHalfW * 0.15}`} fill="none" stroke="#CCFF00" strokeWidth={1} />
        </g>
      )}

      {/* neck */}
      <rect x={cx - 10} y={neckTopY} width={20} height={neckBottomY - neckTopY} fill={`url(#${gradId})`} />

      {/* head — smooth featureless mannequin egg-head */}
      <ellipse cx={cx} cy={headCy} rx={headRx} ry={headRy} fill={`url(#${gradId})`} stroke="#CCFF00" strokeWidth={1.5} />

      {/* display base plate */}
      <rect x={cx - plateWidth / 2} y={footY + 3} width={plateWidth} height={8} rx={2} fill="#94A3B8" stroke="#64748B" strokeWidth={0.75} />
    </svg>
  );
}
