import { useState, ChangeEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { Wand2, Ruler, CheckCircle2, ShieldCheck, Briefcase, Award, Globe, MapPin, Send, Clock, Languages, Scissors, Phone, PhoneCall } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import MediaUploader, { MediaFile } from '../../components/MediaUploader';
import MediaLightbox from '../../components/MediaLightbox';
import AvatarPreview, { baseline } from '../../components/AvatarPreview';
import BodyTypeIcon, { BodyTypeKey } from '../../components/BodyTypeIcon';
import PastWorkGallery from '../../components/PastWorkGallery';

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

const tailor = {
  name: 'Kunle Adebayo',
  successfulJobs: '340+',
  ranking: '#3 in Lagos',
  country: 'Nigeria',
  state: 'Lagos',
  experience: '10 Years Experience',
  language: 'Speaks: Yoruba/Pidgin',
  specialization: 'Specializes in: Agbada, Senator, Men Traditional Wears Only',
};

const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#001F3F' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Burgundy', hex: '#7B1E3A' },
  { name: 'Mustard', hex: '#D4A017' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Brown', hex: '#5C3A21' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Olive', hex: '#708238' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Gold', hex: '#D4AF37' },
];

const materials = [
  'Ankara',
  'Lace (Cord/Dry/Net)',
  'Senator/Cashmere',
  'Aso Oke',
  'George',
  'Crepe',
  'Chiffon',
  'Duchess Satin',
  'Velvet',
  'Silk',
  'Brocade/Kampala',
  'Denim',
];

type StyleTab = 'men' | 'women' | 'unisex';

const styles: Record<StyleTab, string[]> = {
  men: ['Senator Suit', 'Classic Agbada', 'Kaftan', 'Jalabiya'],
  women: ['Six-Piece Gown', 'Corset Gown', 'Bubu/Rich Auntie', 'Iro and Buba', 'Ankara RTW'],
  unisex: ['Female Senator', 'Female Agbada', 'Ankara Co-ord Sets'],
};

const bodyTypes: { key: BodyTypeKey; label: string }[] = [
  { key: 'skinny', label: 'Skinny' },
  { key: 'average', label: 'Average' },
  { key: 'athletic', label: 'Athletic' },
  { key: 'muscular', label: 'Muscular' },
  { key: 'curvy', label: 'Curvy' },
  { key: 'plus', label: 'Plus Size' },
];

const fields: { key: keyof Measurements; label: string }[] = [
  { key: 'height', label: 'Height' },
  { key: 'neck', label: 'Neck' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'chest', label: 'Chest / Bust' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'inseam', label: 'Inseam' },
  { key: 'sleeve', label: 'Sleeve Length' },
];

function scrollToStudio() {
  document.getElementById('measurement-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function TailorProfile() {
  const [gender, setGender] = useState<Gender>('man');
  const [view, setView] = useState<View>('front');
  const [measurements, setMeasurements] = useState<Measurements>(baseline.man);
  const [selectedColors, setSelectedColors] = useState<string[]>([colors[2].hex]);
  const [customColor, setCustomColor] = useState('#CCFF00');

  function toggleColor(hex: string) {
    setSelectedColors((prev) =>
      prev.some((c) => c.toLowerCase() === hex.toLowerCase())
        ? prev.filter((c) => c.toLowerCase() !== hex.toLowerCase())
        : [...prev, hex]
    );
  }

  function removeColor(hex: string) {
    setSelectedColors((prev) => prev.filter((c) => c.toLowerCase() !== hex.toLowerCase()));
  }

  function addCustomColor() {
    setSelectedColors((prev) => (prev.some((c) => c.toLowerCase() === customColor.toLowerCase()) ? prev : [...prev, customColor]));
  }

  function colorName(hex: string) {
    const match = colors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.name : `Custom (${hex.toUpperCase()})`;
  }

  const [material, setMaterial] = useState(materials[0]);
  const [designMedia, setDesignMedia] = useState<MediaFile[]>([]);
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null);
  type CallStage = 'idle' | 'calling' | 'connected';
  const [callStage, setCallStage] = useState<CallStage>('idle');

  useEffect(() => {
    if (callStage !== 'calling') return;
    const timer = setTimeout(() => setCallStage('connected'), 3000);
    return () => clearTimeout(timer);
  }, [callStage]);
  const [selectedBodyType, setSelectedBodyType] = useState<{ gender: 'man' | 'woman'; type: BodyTypeKey } | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [styleTab, setStyleTab] = useState<StyleTab>('men');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  function handleGenderChange(g: Gender) {
    setGender(g);
    setMeasurements(baseline[g]);
  }

  function handleAutoFill() {
    setMeasurements(baseline[gender]);
  }

  function handleFieldChange(key: keyof Measurements, e: ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value);
    setMeasurements((prev) => ({ ...prev, [key]: Number.isNaN(value) ? 0 : value }));
  }

  return (
    <PageShell>
      <Head>
        <title>{tailor.name} — Tailor Profile — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-xl mx-auto px-6 py-10 relative">
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-lemon/40 flex items-center justify-center text-6xl mx-auto mb-4">
            🪡
          </div>
          <span className="inline-flex items-center gap-1.5 bg-lemon/10 border border-lemon/30 text-lemon text-xs font-black px-4 py-1.5 rounded-full mb-3">
            <ShieldCheck size={14} /> TP Certified
          </span>
          <h1 className="text-3xl font-black text-white">{tailor.name}</h1>
          <p className="text-slate text-sm">Master Tailor — Native Wear Specialist</p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-darkcard rounded-2xl p-4 border border-white/10 text-center">
            <Briefcase className="text-lemon mx-auto mb-1.5" size={18} />
            <p className="text-white font-black text-sm">{tailor.successfulJobs}</p>
            <p className="text-slate text-[10px] font-semibold">Successful Jobs</p>
          </div>
          <div className="bg-darkcard rounded-2xl p-4 border border-white/10 text-center">
            <Award className="text-purple mx-auto mb-1.5" size={18} />
            <p className="text-white font-black text-sm">{tailor.ranking}</p>
            <p className="text-slate text-[10px] font-semibold">Ranking</p>
          </div>
          <div className="bg-darkcard rounded-2xl p-4 border border-white/10 text-center">
            <Globe className="text-sky mx-auto mb-1.5" size={18} />
            <p className="text-white font-black text-sm">{tailor.country}</p>
            <p className="text-slate text-[10px] font-semibold">Country</p>
          </div>
          <div className="bg-darkcard rounded-2xl p-4 border border-white/10 text-center">
            <MapPin className="text-yellow mx-auto mb-1.5" size={18} />
            <p className="text-white font-black text-sm">{tailor.state}</p>
            <p className="text-slate text-[10px] font-semibold">State</p>
          </div>
        </div>

        {/* ABOUT (view-only, set by the tailor) */}
        <div className="bg-darkcard rounded-2xl p-5 border border-white/10 space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lemon/10 text-lemon flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <p className="text-white text-sm font-bold">{tailor.experience}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0">
              <Languages size={16} />
            </div>
            <p className="text-white text-sm font-bold">{tailor.language}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky/10 text-sky flex items-center justify-center shrink-0">
              <Scissors size={16} />
            </div>
            <p className="text-white text-sm font-bold">{tailor.specialization}</p>
          </div>
        </div>

        {/* GALLERY */}
        <div className="mb-8">
          <PastWorkGallery title="Watch recent masterpieces ✨" />
        </div>

        {/* CTA */}
        <button
          onClick={scrollToStudio}
          className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all mb-12"
        >
          <Ruler size={18} /> Request A Quote 📏
        </button>

        {/* MEASUREMENT STUDIO */}
        <div id="measurement-studio">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Customize Measurements Studio 📏</h2>
            <p className="text-[#64748B] font-medium">Watch your avatar update live as you type your measurements.</p>
          </div>

          {/* AVATAR PANEL */}
          <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <button
                onClick={() => handleGenderChange('man')}
                className={`px-4 py-2.5 rounded-full text-sm font-black transition-all ${
                  gender === 'man' ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                }`}
              >
                Man 👨
              </button>
              <button
                onClick={() => handleGenderChange('woman')}
                className={`px-4 py-2.5 rounded-full text-sm font-black transition-all ${
                  gender === 'woman' ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                }`}
              >
                Woman 👩
              </button>
              <button
                onClick={() => handleGenderChange('child')}
                className={`px-4 py-2.5 rounded-full text-sm font-black transition-all ${
                  gender === 'child' ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                }`}
              >
                Child 🧒
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setView('front')}
                className={`px-4 py-2.5 rounded-full text-sm font-black transition-all ${
                  view === 'front' ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => setView('side')}
                className={`px-4 py-2.5 rounded-full text-sm font-black transition-all ${
                  view === 'side' ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                }`}
              >
                Side View
              </button>
              <button
                onClick={() => setView('back')}
                className={`px-4 py-2.5 rounded-full text-sm font-black transition-all ${
                  view === 'back' ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                }`}
              >
                Back View
              </button>
            </div>

            <AvatarPreview gender={gender} view={view} measurements={measurements} />

            <div className="grid grid-cols-3 gap-2 mt-6 text-center">
              <div className="bg-white/5 rounded-xl p-2">
                <p className="text-slate text-[10px] font-semibold">CHEST</p>
                <p className="text-white font-black text-sm">{measurements.chest || 0}cm</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <p className="text-slate text-[10px] font-semibold">WAIST</p>
                <p className="text-white font-black text-sm">{measurements.waist || 0}cm</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <p className="text-slate text-[10px] font-semibold">HIPS</p>
                <p className="text-white font-black text-sm">{measurements.hips || 0}cm</p>
              </div>
            </div>
          </div>

          {/* STYLE SELECTOR */}
          <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
            <h2 className="text-white font-black text-lg mb-1">Select Style 🧵</h2>
            <p className="text-slate text-xs mb-5">Pick the outfit the tailor should cut for.</p>

            <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-full p-1 mb-5">
              {(['men', 'women', 'unisex'] as StyleTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStyleTab(tab)}
                  className={`py-2.5 rounded-full text-sm font-black capitalize transition-all ${
                    styleTab === tab ? 'bg-lemon text-[#0F172A]' : 'text-slate'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {styles[styleTab].map((s) => {
                const isSelected = selectedStyle === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStyle(s)}
                    className={`rounded-2xl border-2 px-3 py-4 text-xs sm:text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-lemon bg-lemon/10 text-lemon shadow-[0_0_16px_rgba(204,255,0,0.5)]'
                        : 'border-white/10 bg-white/5 text-white hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BODY TYPE SELECTOR */}
          <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
            <h2 className="text-white font-black text-lg mb-1">Body Type 🪩</h2>
            <p className="text-slate text-xs mb-5">Pick the build that's closest to yours — it helps the tailor before they even take measurements.</p>

            <p className="text-slate text-xs font-bold uppercase tracking-wide mb-2">Men</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
              {bodyTypes.map((bt) => {
                const isSelected = selectedBodyType?.gender === 'man' && selectedBodyType.type === bt.key;
                return (
                  <button
                    key={`man-${bt.key}`}
                    type="button"
                    onClick={() => setSelectedBodyType({ gender: 'man', type: bt.key })}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-3 transition-all ${
                      isSelected ? 'border-lemon bg-lemon/10 shadow-[0_0_16px_rgba(204,255,0,0.5)]' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <BodyTypeIcon gender="man" type={bt.key} selected={isSelected} />
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-lemon' : 'text-slate'}`}>{bt.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-slate text-xs font-bold uppercase tracking-wide mb-2">Women</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {bodyTypes.map((bt) => {
                const isSelected = selectedBodyType?.gender === 'woman' && selectedBodyType.type === bt.key;
                return (
                  <button
                    key={`woman-${bt.key}`}
                    type="button"
                    onClick={() => setSelectedBodyType({ gender: 'woman', type: bt.key })}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-3 transition-all ${
                      isSelected ? 'border-lemon bg-lemon/10 shadow-[0_0_16px_rgba(204,255,0,0.5)]' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <BodyTypeIcon gender="woman" type={bt.key} selected={isSelected} />
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-lemon' : 'text-slate'}`}>{bt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEASUREMENT FORM */}
          <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
            {callStage === 'calling' ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-black text-white mb-2">Quote Submitted! 📞</h2>
                <p className="text-slate text-sm max-w-sm mx-auto mb-8">
                  We are automatically calling Mr. Milton (+234 706 335 1745) right now to notify him.
                </p>
                <div className="w-20 h-20 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Phone size={34} />
                </div>
                <p className="text-lemon font-black text-sm tracking-wide">Calling…</p>
              </div>
            ) : callStage === 'connected' ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-5">
                  <PhoneCall size={30} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">✓ Call Connected!</h2>
                <p className="text-slate text-sm max-w-sm mx-auto mb-2">Mr. Milton has been notified.</p>
                <p className="text-slate text-sm max-w-sm mx-auto mb-8">
                  {tailor.name} will review your {measurements.height || 0}cm height, {measurements.chest || 0}cm chest,{' '}
                  {measurements.waist || 0}cm waist and {measurements.hips || 0}cm hip measurements in {material.toLowerCase()},
                  and get back to you with a custom quote.
                </p>
                <Link
                  href="/marketplace"
                  className="inline-block bg-lemon text-[#0F172A] font-black px-8 py-3.5 rounded-full hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
                >
                  Browse More Artisans →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-2 text-white font-black text-lg">
                    <Ruler className="text-lemon" size={20} /> Your Measurements
                  </h2>
                  <button
                    onClick={handleAutoFill}
                    className="flex items-center gap-1.5 text-xs font-bold text-purple bg-purple/10 px-3 py-2 rounded-full hover:bg-purple/20 transition-colors"
                  >
                    <Wand2 size={14} /> Auto-Fill
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="text-slate text-xs font-semibold mb-1.5 block">{field.label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={measurements[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-10 text-lg font-black text-white focus:outline-none focus:border-lemon/50"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate text-xs font-bold">cm</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <p className="text-slate text-xs font-semibold mb-2">
                    Colors 🎨 <span className="text-slate/60 font-normal">(pick as many as you like)</span>
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
                    {colors.map((c) => {
                      const isSelected = selectedColors.some((sc) => sc.toLowerCase() === c.hex.toLowerCase());
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => toggleColor(c.hex)}
                          aria-label={c.name}
                          title={c.name}
                          style={{ backgroundColor: c.hex }}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            isSelected ? 'border-lemon scale-110 shadow-[0_0_12px_rgba(204,255,0,0.6)]' : 'border-white/30'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 mb-4">
                    <label className="relative shrink-0">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded-full border-2 border-white/30 cursor-pointer bg-transparent p-0"
                      />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate text-[10px] font-bold uppercase tracking-wide">Custom Shade</p>
                      <p className="text-white text-sm font-black truncate">{customColor.toUpperCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="shrink-0 text-xs font-black bg-lemon text-[#0F172A] px-3 py-2 rounded-full hover:scale-105 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {selectedColors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedColors.map((hex) => (
                        <span
                          key={hex}
                          className="flex items-center gap-1.5 bg-white/10 border border-lemon/40 rounded-full pl-1 pr-2 py-1 text-xs font-bold text-white"
                        >
                          <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: hex }} />
                          {colorName(hex)}
                          <button
                            type="button"
                            onClick={() => removeColor(hex)}
                            aria-label={`Remove ${colorName(hex)}`}
                            className="text-slate hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-slate text-xs font-semibold mb-2">Select Fabric 🧶</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {materials.map((m) => {
                      const isSelected = material === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMaterial(m)}
                          className={`rounded-2xl border-2 px-3 py-3 text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-lemon bg-lemon/10 text-lemon shadow-[0_0_16px_rgba(204,255,0,0.5)]'
                              : 'border-white/10 bg-white/5 text-white hover:border-white/25 hover:bg-white/10'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-white font-black text-sm mb-3">Design Inspiration 📸</h3>
                  <MediaUploader
                    buttonLabel="Upload Sample Design Image"
                    helperText="Show the tailor your inspiration"
                    onOpenLightbox={setLightboxFile}
                    onChange={setDesignMedia}
                  />
                </div>

                <div className="mb-6">
                  <h3 className="text-white font-black text-sm mb-3">Job Description / Special Instructions 📝</h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={5}
                    placeholder="Describe your design, add special instructions, or mention specific details..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50 resize-none"
                  />
                </div>

                <button
                  onClick={() => setCallStage('calling')}
                  className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
                >
                  <Send size={18} /> Submit Quote Request
                </button>
              </>
            )}
          </div>
        </div>

        <Link
          href="/provider/settings"
          className="block text-center bg-lemon text-[#0F172A] font-black py-4 rounded-full mt-6 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
        >
          Test AI Call Notification 📞
        </Link>
      </div>

      <MediaLightbox file={lightboxFile} onClose={() => setLightboxFile(null)} />
    </PageShell>
  );
}
