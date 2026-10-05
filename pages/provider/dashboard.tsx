import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import {
  Wrench,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Pencil,
  Check,
  Siren,
  Camera,
  ImagePlus,
  Landmark,
  BadgeCheck,
  UserCircle2,
  Youtube,
  PlayCircle,
  X,
  MapPin,
  Navigation,
  Search,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import MediaUploader, { MediaFile } from '../../components/MediaUploader';
import MediaLightbox from '../../components/MediaLightbox';

// Connect to the NEW tpmarket database
const tpmarketSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const mockAddressBook = [
  '12 Allen Avenue, Ikeja, Lagos',
  'Computer Village, Ikeja, Lagos',
  'Ojuelegba Market, Surulere, Lagos',
  'Balogun Market, Lagos Island',
  'Victoria Island, Lagos',
  'Yaba, Lagos',
  'Ikeja City Mall, Lagos',
  'Lekki Phase 1, Lagos',
  'Oshodi Market, Lagos',
  'Alaba International Market, Lagos',
];

const LAT_MAX = 6.6;
const LAT_MIN = 6.4;
const LNG_MIN = 3.25;
const LNG_MAX = 3.55;

const bankOptions = [
  'Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA',
  'Fidelity Bank', 'Union Bank', 'Wema Bank', 'Kuda', 'Opay', 'Moniepoint', 'Other',
];

const defaultArtisanName = 'Provider';

interface TaggedEquipment {
  type: string;
  model: string;
  customer: string;
}

const taggedEquipment: TaggedEquipment[] = [
  { type: 'Generator', model: 'Mikano 10KVA', customer: 'Amara Okafor' },
  { type: 'Gasoline Car Repair', model: 'Toyota Camry LE', customer: 'Tobi Adeyemi' },
  { type: 'AC (Air Conditioner)', model: 'LG Split 1.5HP', customer: 'Chidinma Eze' },
];

interface SparePart {
  id: string;
  name: string;
  model: string;
  partNumber: string;
  condition: string;
  guaranteePeriod: string;
  description: string;
  price: number;
  media: MediaFile[];
}

const conditionOptions = ['Fairly Used', 'New'];
const guaranteeOptions = ['90 days', '180 days', '365 days'];

export default function ProviderDashboard() {
  // --- REAL DATA STATES ---
  const [artisanName, setArtisanName] = useState(defaultArtisanName);
  const [currentProviderId, setCurrentProviderId] = useState<string | null>(null); // Added for DB saving
  const [tpCoins, setTpCoins] = useState(1240);
  const [walletBalance, setWalletBalance] = useState(312000);

  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [daytimeFee, setDaytimeFee] = useState('5000');
  const [lateNightFee, setLateNightFee] = useState('8000');
  const [midnightFee, setMidnightFee] = useState('12000');
  const [earlyMorningFee, setEarlyMorningFee] = useState('10000');

  const [parts, setParts] = useState<SparePart[]>([
    {
      id: 'p1',
      name: 'Toyota Brake Pads',
      model: 'Camry 2015-2019',
      partNumber: 'BP-4471',
      condition: 'New',
      guaranteePeriod: '90 days',
      description: 'Genuine front brake pad set.',
      price: 15000,
      media: [],
    },
  ]);
  
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartModel, setNewPartModel] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartCondition, setNewPartCondition] = useState(conditionOptions[0]);
  const [newPartGuarantee, setNewPartGuarantee] = useState(guaranteeOptions[0]);
  const [newPartDescription, setNewPartDescription] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [newPartMedia, setNewPartMedia] = useState<MediaFile[]>([]);
  const [partFormError, setPartFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [portfolioMedia, setPortfolioMedia] = useState<MediaFile[]>([]);
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null);
  
  interface VideoLink {
    id: string;
    url: string;
    videoId: string | null;
  }
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [videoInput, setVideoInput] = useState('');

  function extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  function handleAddVideo() {
    const trimmed = videoInput.trim();
    if (trimmed === '') return;
    setVideoLinks((prev) => [...prev, { id: `${Date.now()}`, url: trimmed, videoId: extractYoutubeId(trimmed) }]);
    setVideoInput('');
  }

  function handleRemoveVideo(id: string) {
    setVideoLinks((prev) => prev.filter((v) => v.id !== id));
  }

  const [bankName, setBankName] = useState(bankOptions[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);

  const [addressQuery, setAddressQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pinPos, setPinPos] = useState({ xPct: 50, yPct: 50 });
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const coordinates = {
    lat: (LAT_MAX - (pinPos.yPct / 100) * (LAT_MAX - LAT_MIN)).toFixed(5),
    lng: (LNG_MIN + (pinPos.xPct / 100) * (LNG_MAX - LNG_MIN)).toFixed(5),
  };

  const addressSuggestions = mockAddressBook.filter((a) => a.toLowerCase().includes(addressQuery.toLowerCase()));

  function handleSelectSuggestion(address: string) {
    setAddressQuery(address);
    setShowSuggestions(false);
    setPinPos({ xPct: 50, yPct: 50 });
  }

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setPinPos({ xPct: Math.max(0, Math.min(100, xPct)), yPct: Math.max(0, Math.min(100, yPct)) });
  }

  function handleUseGpsLocation() {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('GPS is not supported on this device/browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddressQuery(`Current GPS Location (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`);
        setPinPos({ xPct: 50, yPct: 50 });
        setGpsLoading(false);
      },
      () => {
        setGpsError('Could not access your location. Please allow location permission and try again.');
        setGpsLoading(false);
      }
    );
  }

  function handleSaveLocation() {
    if (addressQuery.trim() === '') return;
    setSavedAddress(addressQuery.trim());
    setEditingLocation(false);
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setProfilePhotoUrl(URL.createObjectURL(file));
  }

  function handleVerifyAccount() {
    if (accountNumber.trim().length < 10) return;
    setVerifying(true);
    setTimeout(() => {
      setAccountName(artisanName);
      setVerifying(false);
    }, 900);
  }

  // --- NEW: REAL DATABASE SAVE LOGIC ---
  async function handleSaveBank() {
    if (!bankName || accountNumber.trim() === '' || accountName.trim() === '') {
      alert('Please fill in all bank details.');
      return;
    }
    
    if (!currentProviderId) {
      alert('System is still loading your profile. Please wait a second and try again.');
      return;
    }

    setVerifying(true); // Use this as a loading indicator

    try {
      // 1. Check if bank details already exist for this provider
      const { data: existingBank } = await tpmarketSupabase
        .from('provider_bank_details')
        .select('id')
        .eq('provider_id', currentProviderId)
        .single();

      let error;

      // 2. If they exist, UPDATE them. If not, INSERT new ones.
      if (existingBank) {
        const res = await tpmarketSupabase
          .from('provider_bank_details')
          .update({ 
            bank_name: bankName, 
            account_number: accountNumber, 
            account_name: accountName 
          })
          .eq('id', existingBank.id);
        error = res.error;
      } else {
        const res = await tpmarketSupabase
          .from('provider_bank_details')
          .insert({ 
            provider_id: currentProviderId, 
            bank_name: bankName, 
            account_number: accountNumber, 
            account_name: accountName 
          });
        error = res.error;
      }

      if (error) throw error;

      // 3. Success!
      setBankSaved(true);
      setTimeout(() => setBankSaved(false), 3000); // Hide the "Saved!" text after 3 seconds
      alert('Bank details saved successfully! 💰');

    } catch (err: any) {
      console.error('Error saving bank details:', err);
      alert('Failed to save bank details: ' + err.message);
    } finally {
      setVerifying(false);
    }
  }

  const profileChecklist = [
    Boolean(profilePhotoUrl),
    specialization.trim() !== '',
    yearsExperience.trim() !== '',
    portfolioMedia.length > 0,
    videoLinks.length > 0,
    Boolean(bankName) && accountNumber.trim() !== '' && accountName.trim() !== '',
  ];
  const profileCompletionPct = Math.round((profileChecklist.filter(Boolean).length / profileChecklist.length) * 100);

  function handlePublishPart() {
    const allFilled =
      newPartMedia.length > 0 &&
      newPartName.trim() !== '' &&
      newPartModel.trim() !== '' &&
      newPartNumber.trim() !== '' &&
      newPartCondition !== '' &&
      newPartGuarantee !== '' &&
      newPartDescription.trim() !== '' &&
      newPartPrice.trim() !== '';
    if (!allFilled) {
      setPartFormError('Please fill in all mandatory fields.');
      return;
    }
    setParts((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        name: newPartName.trim(),
        model: newPartModel.trim(),
        partNumber: newPartNumber.trim(),
        condition: newPartCondition,
        guaranteePeriod: newPartGuarantee,
        description: newPartDescription.trim(),
        price: Number(newPartPrice) || 0,
        media: newPartMedia,
      },
    ]);
    setNewPartName('');
    setNewPartModel('');
    setNewPartNumber('');
    setNewPartCondition(conditionOptions[0]);
    setNewPartGuarantee(guaranteeOptions[0]);
    setNewPartDescription('');
    setNewPartPrice('');
    setNewPartMedia([]);
    setPartFormError('');
    setShowAddPart(false);
  }

  function startEdit(part: SparePart) {
    setEditingId(part.id);
    setEditName(part.name);
    setEditPrice(String(part.price));
  }

  function saveEdit(id: string) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, name: editName.trim() || p.name, price: Number(editPrice) || p.price } : p)));
    setEditingId(null);
  }

  // --- FETCH REAL DATA ON LOAD ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      const tpwecanId = localStorage.getItem('tpwecan_id');
      if (!tpwecanId) return; // If not registered, do nothing

      try {
        // 1. Fetch Provider Profile
        const { data: provider, error: providerError } = await tpmarketSupabase
          .from('providers')
          .select('*')
          .eq('tpwecan_id', tpwecanId)
          .single();

        if (provider && !providerError) {
          setArtisanName(provider.full_name || 'Provider');
          setCurrentProviderId(provider.id); // <--- Save the ID for bank saving later
          setSpecialization(provider.specialization || '');
          setYearsExperience(provider.years_of_experience ? String(provider.years_of_experience) : '');
          
          // 2. Fetch Bank Details using the provider's new database ID
          const { data: bank, error: bankError } = await tpmarketSupabase
            .from('provider_bank_details')
            .select('*')
            .eq('provider_id', provider.id)
            .single();

          if (bank && !bankError) {
            setBankName(bank.bank_name);
            setAccountNumber(bank.account_number);
            setAccountName(bank.account_name);
            setBankSaved(true); // Mark as saved so the UI shows it's complete
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <PageShell>
      <Head>
        <title>Provider Dashboard — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        {/* HEADER */}
        <div className="bg-darkcard rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-lg font-black text-white">Welcome back, {artisanName} 👋</h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-yellow/10 text-yellow text-xs font-black px-3 py-2 rounded-full whitespace-nowrap">
                🪙 {tpCoins.toLocaleString()} TP Coins
              </span>
              <span className="flex items-center gap-1.5 bg-lemon/10 text-lemon text-xs font-black px-3 py-2 rounded-full whitespace-nowrap">
                💰 ₦{walletBalance.toLocaleString()} Wallet
              </span>
            </div>
          </div>
        </div>

        {/* PUBLIC PROFILE & PAYOUT SETUP */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white font-black">Profile Completion: {profileCompletionPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-lemon rounded-full transition-all" style={{ width: `${profileCompletionPct}%` }} />
          </div>
          <p className="text-slate text-xs mb-6">Complete your profile to get 3x more job requests from customers!</p>

          {/* Build Your Public Profile */}
          <div className="bg-white/5 rounded-2xl p-5 mb-5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm mb-4">
              <UserCircle2 className="text-lemon" size={18} /> Build Your Public Profile
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full bg-[#0F172A] border-2 border-dashed border-white/20 flex items-center justify-center shrink-0 overflow-hidden hover:border-lemon/50 transition-colors"
              >
                {profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-slate" size={26} />
                )}
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </button>
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">Main Field of Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Mobile Vulcanizer, EV Car Mechanic"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Gallery */}
          <div className="bg-white/5 rounded-2xl p-5 mb-5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <ImagePlus className="text-purple" size={18} /> Showcase Your Work (Up to 8 Images)
            </h3>
            <p className="text-slate text-xs mb-4">Customers will be able to slide through these on your public profile.</p>
            <MediaUploader
              buttonLabel="Upload Work Photo"
              helperText="Show off your best completed jobs"
              onOpenLightbox={setLightboxFile}
              onChange={setPortfolioMedia}
              maxFiles={8}
            />
          </div>

          {/* Video Portfolio */}
          <div className="bg-white/5 rounded-2xl p-5 mb-5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <Youtube className="text-red-400" size={18} /> Showcase Your Skills (Video Portfolio)
            </h3>
            <p className="text-slate text-xs mb-4">
              Customers will be able to watch these videos directly on your public profile to verify your work quality.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="url"
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="Paste a YouTube video link…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
              />
              <button
                onClick={handleAddVideo}
                className="flex items-center justify-center gap-1.5 bg-lemon text-[#0F172A] font-black text-sm px-4 py-3 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all shrink-0"
              >
                <Plus size={16} /> Add Video Link
              </button>
            </div>

            {videoLinks.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {videoLinks.map((v) => (
                  <div key={v.id} className="relative">
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="block">
                      {v.videoId ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`}
                            alt="YouTube video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <PlayCircle className="text-white drop-shadow" size={26} />
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl bg-white/10 flex items-center justify-center p-2">
                          <p className="text-slate text-[10px] text-center truncate">{v.url}</p>
                        </div>
                      )}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(v.id)}
                      aria-label="Remove video"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#0F172A]/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout & Bank Details */}
          <div className="bg-white/5 rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <Landmark className="text-sky" size={18} /> Where should we send your money?
            </h3>
            <p className="text-slate text-xs mb-4">Payout & Bank Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50"
                >
                  {bankOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Account Number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setAccountName('');
                    }}
                    onBlur={handleVerifyAccount}
                    placeholder="0123456789"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-9 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                  {verifying && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate text-[10px]">...</span>}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-slate text-xs font-semibold mb-1.5 block">Account Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Auto-fills after verification, or type manually"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-9 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                />
                {accountName && <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-lemon" size={16} />}
              </div>
            </div>

            <button
              onClick={handleSaveBank}
              className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
            >
              {bankSaved ? 'Saved! ✅' : 'Save Bank Details'}
            </button>
          </div>

          {/* Business Location */}
          <div className="bg-white/5 rounded-2xl p-5 mt-5">
            <h3 className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <MapPin className="text-lemon" size={18} /> Where can customers find you?
            </h3>
            <p className="text-slate text-xs mb-4">Set Your Workshop Location</p>

            {!editingLocation && savedAddress ? (
              <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
                <p className="text-slate text-xs font-bold uppercase tracking-wide mb-1">Your Workshop Location</p>
                <p className="text-white text-sm font-semibold mb-3">Your workshop is located at: {savedAddress}</p>
                <button
                  onClick={() => setEditingLocation(true)}
                  className="text-xs font-bold text-lemon border border-lemon/30 rounded-full px-4 py-2 hover:bg-lemon/10 transition-colors"
                >
                  Edit Location
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={16} />
                  <input
                    type="text"
                    value={addressQuery}
                    onChange={(e) => {
                      setAddressQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search your address or landmark"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                  {showSuggestions && addressQuery && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden shadow-lg">
                      {addressSuggestions.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => handleSelectSuggestion(a)}
                          className="block w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 transition-colors"
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  onClick={handleMapClick}
                  className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-crosshair mb-2 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,0.08)_25%,rgba(255,255,255,0.08)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.08)_75%,rgba(255,255,255,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,0.08)_25%,rgba(255,255,255,0.08)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.08)_75%,rgba(255,255,255,0.08)_76%,transparent_77%,transparent)] bg-[length:25%_25%] bg-sky/20 border border-white/10"
                >
                  <div
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{ left: `${pinPos.xPct}%`, top: `${pinPos.yPct}%` }}
                  >
                    <MapPin className="text-lemon drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]" size={32} fill="#CCFF00" fillOpacity={0.25} />
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-[#0F172A]/80 text-slate px-2 py-1 rounded-full">
                    Tap the map to drop your pin
                  </span>
                </div>

                <p className="text-slate text-xs font-semibold mb-4">
                  Lat: {coordinates.lat} · Lng: {coordinates.lng}
                </p>

                <button
                  onClick={handleUseGpsLocation}
                  disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-3 rounded-full mb-2 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all disabled:opacity-60"
                >
                  <Navigation size={16} /> {gpsLoading ? 'Locating…' : ' Use My Current GPS Location'}
                </button>
                {gpsError && <p className="text-red-400 text-xs font-semibold mb-2">{gpsError}</p>}

                <button
                  onClick={handleSaveLocation}
                  disabled={addressQuery.trim() === ''}
                  className="w-full bg-white/10 text-white font-bold py-3 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Save Location
                </button>
              </>
            )}

            <p className="text-slate/70 text-[11px] mt-4">
              Customers will see your location on the map when searching for nearby specialists.
            </p>
          </div>
        </div>

        {/* SECTION 1: PIT CREW EQUIPMENT */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-1">
            <Wrench className="text-lemon" size={20} /> My Managed Equipment (Pit Crew)
          </h2>
          <p className="text-slate text-xs mb-5">Equipment Tagged to You</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {taggedEquipment.map((eq, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-4">
                <p className="text-white font-bold text-sm">{eq.type}</p>
                <p className="text-slate text-xs mb-1">Model: {eq.model}</p>
                <p className="text-slate text-xs mb-3">Customer: {eq.customer}</p>
                <button className="w-full flex items-center justify-center gap-1.5 bg-lemon/10 text-lemon text-xs font-bold px-3 py-2.5 rounded-full hover:bg-lemon/20 transition-colors">
                  <MessageCircle size={14} /> View Details & Chat
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: ACTIVE JOBS */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-1">
            <Briefcase className="text-purple" size={20} /> Active Jobs & Quotes
          </h2>
          <p className="text-slate text-xs mb-5">Current Jobs</p>

          <div className="bg-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-bold text-sm">Generator Repair</p>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-yellow/10 text-yellow">In Progress</span>
            </div>
            <p className="flex items-center gap-1.5 text-lemon text-xs font-bold">
              <ShieldCheck size={14} /> 90-Day Guarantee Active
            </p>
          </div>
        </div>

        {/* SECTION 3: SPARE PARTS STORE */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-1">
            <ShoppingBag className="text-sky" size={20} /> My Spare Parts Store
          </h2>
          <p className="text-slate text-xs mb-5">Sell Parts & Accessories</p>

          <button
            onClick={() => setShowAddPart((v) => !v)}
            className="flex items-center gap-1.5 bg-lemon text-[#0F172A] font-black text-sm px-4 py-2.5 rounded-full mb-4 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all"
          >
            <Plus size={16} /> List New Part for Sale
          </button>

          {showAddPart && (
            <div className="bg-white/5 rounded-2xl p-5 mb-4 space-y-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">
                  Upload Product Image <span className="text-red-400">*</span>
                </label>
                <MediaUploader
                  buttonLabel="Upload Product Image"
                  helperText="Show the part clearly"
                  onOpenLightbox={setLightboxFile}
                  onChange={setNewPartMedia}
                  maxFiles={1}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">
                    Name of Part <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={newPartName} onChange={(e) => setNewPartName(e.target.value)} placeholder="e.g. Toyota Brake Pads" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
                </div>
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">
                    Part Model <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={newPartModel} onChange={(e) => setNewPartModel(e.target.value)} placeholder="e.g. Camry 2015-2019" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
                </div>
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">
                    Product Number / Part Number <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={newPartNumber} onChange={(e) => setNewPartNumber(e.target.value)} placeholder="e.g. BP-4471" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
                </div>
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">
                    Condition <span className="text-red-400">*</span>
                  </label>
                  <select value={newPartCondition} onChange={(e) => setNewPartCondition(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                    {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">
                    Guarantee Period <span className="text-red-400">*</span>
                  </label>
                  <select value={newPartGuarantee} onChange={(e) => setNewPartGuarantee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                    {guaranteeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate text-xs font-semibold mb-1.5 block">
                    Price <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate font-bold"></span>
                    <input type="number" min={0} value={newPartPrice} onChange={(e) => setNewPartPrice(e.target.value)} placeholder="15000" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea value={newPartDescription} onChange={(e) => setNewPartDescription(e.target.value)} rows={3} placeholder="Describe the part's condition, fitment, and any details buyers should know" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50 resize-none" />
              </div>

              {partFormError && <p className="text-red-400 text-xs font-semibold">{partFormError}</p>}

              <button onClick={handlePublishPart} className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all">
                Publish
              </button>
            </div>
          )}

          <div className="space-y-2">
            {parts.map((part) => (
              <div key={part.id} className="flex items-center justify-between gap-3 bg-white/5 rounded-2xl px-4 py-3">
                {editingId === part.id ? (
                  <>
                    <div className="flex-1 flex gap-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-sm text-white focus:outline-none focus:border-lemon/50" />
                      <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-24 bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-sm text-white focus:outline-none focus:border-lemon/50" />
                    </div>
                    <button onClick={() => saveEdit(part.id)} aria-label="Save" className="w-8 h-8 rounded-full bg-lemon/20 text-lemon flex items-center justify-center hover:bg-lemon/30 transition-colors shrink-0">
                      <Check size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-white text-sm font-semibold">
                      {part.name} — ₦{part.price.toLocaleString()}
                    </p>
                    <button
                      onClick={() => startEdit(part)}
                      className="flex items-center gap-1 text-xs font-bold text-slate hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-colors shrink-0"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: EMERGENCY RESPONDER SETTINGS */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-1">
            <Siren className="text-red-400" size={20} /> Emergency Responder Settings
          </h2>
          <p className="text-slate text-xs mb-5">24/7 Emergency Availability</p>

          <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 mb-5">
            <div>
              <p className="text-white font-bold text-sm">Available for Emergencies</p>
              <p className="text-slate text-xs">Customers can call you for urgent jobs, any time.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmergencyAvailable((v) => !v)}
              aria-label="Toggle emergency availability"
              className={`relative w-14 h-8 rounded-full shrink-0 transition-colors ${emergencyAvailable ? 'bg-lemon' : 'bg-white/15'}`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-[#0F172A] transition-all ${emergencyAvailable ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${emergencyAvailable ? '' : 'opacity-40 pointer-events-none'}`}>
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Daytime Fee (₦)</label>
              <input type="number" min={0} value={daytimeFee} onChange={(e) => setDaytimeFee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50" />
            </div>
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Late Night Fee (₦)</label>
              <input type="number" min={0} value={lateNightFee} onChange={(e) => setLateNightFee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50" />
            </div>
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Midnight Fee (₦)</label>
              <input type="number" min={0} value={midnightFee} onChange={(e) => setMidnightFee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50" />
            </div>
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Very Early Morning Fee (₦)</label>
              <input type="number" min={0} value={earlyMorningFee} onChange={(e) => setEarlyMorningFee(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lemon/50" />
            </div>
          </div>
        </div>
      </div>

      <MediaLightbox file={lightboxFile} onClose={() => setLightboxFile(null)} />
    </PageShell>
  );
}