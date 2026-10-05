import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Search, Coins, Wrench, Clock, AlertTriangle, Shield, Plus, Users, Copy, Check, MessageCircle, Gift } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import MediaUploader, { MediaFile } from '../../components/MediaUploader';
import MediaLightbox from '../../components/MediaLightbox';
import StatCard from '../../components/StatCard';
import Link from 'next/link';

const customerName = 'Amara';
const tpCoins = 0;
const walletBalance = 0;
const withdrawableBalance = 0;
const appCredit = 0;
const pitCrewCount = 4;
const referralCode = 'AMARA123';
const referralLink = `tpmarket.com/ref/${referralCode}`;
const REFERRAL_GOAL_1 = 500;
const REFERRAL_GOAL_1_REWARD = '₦150,000 Credit Purchase';
const REFERRAL_GOAL_2 = 10000;
const REFERRAL_GOAL_2_REWARD = '₦5,000,000 Annual Reward';

const equipmentTypes = [
  'Gasoline Car Repair',
  'EV Car Repair',
  'Car Painting',
  'Phone',
  'AC (Air Conditioner)',
  'Photocopier',
  'Computer',
  'Laptop',
  'Printer',
  'Generator',
  'Fan',
  'TV (Television)',
  'Fridge (Refrigerator)',
  'Hospital Equipment',
  'Solar Equipment',
  'Home Maintenance',
  'Building Structure Maintenance',
  'Delivery Bike Repair',
];

const CAR_TYPES = ['Gasoline Car Repair', 'EV Car Repair', 'Car Painting'];
const ELECTRONICS_TYPES = [
  'Phone',
  'AC (Air Conditioner)',
  'Computer',
  'Laptop',
  'TV (Television)',
  'Fridge (Refrigerator)',
  'Photocopier',
  'Printer',
  'Generator',
  'Fan',
];
const HOSPITAL_TYPE = 'Hospital Equipment';
const SOLAR_TYPE = 'Solar Equipment';
const HOME_MAINTENANCE_TYPE = 'Home Maintenance';
const BUILDING_TYPE = 'Building Structure Maintenance';
const BIKE_TYPE = 'Delivery Bike Repair';

interface Equipment {
  id: string;
  type: string;
  modelNumber: string;
  serialNumber: string;
  yearOfManufacture: string;
  chassisNumber: string;
  plateNumber: string;
  mileage: string;
  vehicleType: string;
  color: string;
  currentState: string;
  subEquipmentType: string;
  capacityRating: string;
  propertyDescription: string;
  locationAddress: string;
  maintenanceType: string;
  buildingType: string;
  numberOfFloors: string;
  totalSquareMeters: string;
  structuralIssues: string;
  frameNumber: string;
  engineNumber: string;
  bikeType: string;
  status: string;
  media: MediaFile[];
  mediaCount: number;
  savedAt: string;
  forSale: boolean;
  stolen: boolean;
  showHistory: boolean;
}

function yearRange(start: number, end: number): number[] {
  const years: number[] = [];
  for (let y = end; y >= start; y--) years.push(y);
  return years;
}
const carYears = yearRange(1990, 2026);
const electronicsYears = yearRange(2000, 2026);
const hospitalYears = yearRange(2000, 2026);
const solarYears = yearRange(2010, 2026);
const buildingYears = yearRange(1980, 2026);
const bikeYears = yearRange(2010, 2026);

const vehicleTypeOptions = ['SUV', 'Saloon', 'Pickup', 'Wagon', 'Hatchback', 'Truck', 'Bus', 'Motorcycle'];
const carStateOptions = ['On Road', 'Off Road', 'In Workshop'];
const electronicsStateOptions = ['Working', 'Faulty', 'Needs Maintenance'];
const hospitalSubTypeOptions = ['X-Ray Machine', 'Ultrasound', 'Hospital Bed', 'Ventilator', 'ICU Monitor', 'Surgical Equipment', 'Laboratory Equipment', 'Other'];
const hospitalStateOptions = ['Working', 'Faulty', 'Needs Calibration'];
const solarSubTypeOptions = ['Solar Panel', 'Inverter', 'Battery Bank', 'Charge Controller', 'Complete Solar System', 'Solar Water Heater', 'Other'];
const solarStateOptions = ['Working', 'Faulty', 'Needs Maintenance'];
const maintenanceTypeOptions = ['Plumbing', 'Electrical', 'Painting', 'Tiling', 'Roofing', 'General Maintenance'];
const homeMaintenanceStateOptions = ['Needs Repair', 'Needs Maintenance', 'Renovation'];
const buildingTypeOptions = ['Residential House', 'Commercial Building', 'Warehouse', 'Office Complex', 'Apartment Block', 'Factory'];
const structuralIssueOptions = ['Foundation Crack', 'Roof Damage', 'Wall Crack', 'Water Leakage', 'General Wear', 'Other'];
const buildingStateOptions = ['Stable', 'Needs Repair', 'Urgent Attention'];
const bikeTypeOptions = ['Petrol Bike', 'Electric Bike', 'Tricycle/Keke'];
const bikeStateOptions = ['On Road', 'Off Road', 'In Workshop'];

function defaultStateFor(type: string): string {
  if (CAR_TYPES.includes(type)) return carStateOptions[0];
  if (ELECTRONICS_TYPES.includes(type)) return electronicsStateOptions[0];
  if (type === HOSPITAL_TYPE) return hospitalStateOptions[0];
  if (type === SOLAR_TYPE) return solarStateOptions[0];
  if (type === HOME_MAINTENANCE_TYPE) return homeMaintenanceStateOptions[0];
  if (type === BUILDING_TYPE) return buildingStateOptions[0];
  if (type === BIKE_TYPE) return bikeStateOptions[0];
  return electronicsStateOptions[0];
}

const EQUIPMENT_STORAGE_KEY = 'tpmarket_equipment';
type StoredEquipment = Omit<Equipment, 'media'>;

function loadStoredEquipment(): Equipment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: StoredEquipment[] = JSON.parse(raw);
    return parsed.map((eq) => ({ ...eq, media: [] }));
  } catch {
    return [];
  }
}

function persistEquipment(list: Equipment[]) {
  if (typeof window === 'undefined') return;
  const serializable: StoredEquipment[] = list.map(({ media, ...rest }) => rest);
  window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(serializable));
}

const GUARANTEE_DAYS = 90;
const JOB_COMPLETION_DATE = '2026-09-03';

const recentJob = {
  title: 'Car Engine Repair',
  provider: 'Tunde Bakare',
};

export default function CustomerDashboardTop() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [complaintFiled, setComplaintFiled] = useState(false);

  const [equipmentType, setEquipmentType] = useState(equipmentTypes[0]);
  const isCar = CAR_TYPES.includes(equipmentType);
  const isElectronics = ELECTRONICS_TYPES.includes(equipmentType);
  const isHospital = equipmentType === HOSPITAL_TYPE;
  const isSolar = equipmentType === SOLAR_TYPE;
  const isHomeMaintenance = equipmentType === HOME_MAINTENANCE_TYPE;
  const isBuilding = equipmentType === BUILDING_TYPE;
  const isBike = equipmentType === BIKE_TYPE;

  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [yearOfManufacture, setYearOfManufacture] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [vehicleType, setVehicleType] = useState(vehicleTypeOptions[0]);
  const [color, setColor] = useState('');
  const [currentState, setCurrentState] = useState(carStateOptions[0]);
  const [subEquipmentType, setSubEquipmentType] = useState(hospitalSubTypeOptions[0]);
  const [capacityRating, setCapacityRating] = useState('');
  const [propertyDescription, setPropertyDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [maintenanceType, setMaintenanceType] = useState(maintenanceTypeOptions[0]);
  const [buildingType, setBuildingType] = useState(buildingTypeOptions[0]);
  const [numberOfFloors, setNumberOfFloors] = useState('');
  const [totalSquareMeters, setTotalSquareMeters] = useState('');
  const [structuralIssues, setStructuralIssues] = useState(structuralIssueOptions[0]);
  const [frameNumber, setFrameNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [bikeType, setBikeType] = useState(bikeTypeOptions[0]);
  const [statusText, setStatusText] = useState('');
  const [formMedia, setFormMedia] = useState<MediaFile[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [equipmentLoaded, setEquipmentLoaded] = useState(false);
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  function handleCopyReferralLink() {
    navigator.clipboard?.writeText(`https://${referralLink}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const whatsappText = encodeURIComponent(`Join me on TPMarket! Use my referral code ${referralCode} to sign up: https://${referralLink}`);
  const progressPct1 = Math.min(100, Math.round((tpCoins / REFERRAL_GOAL_1) * 100));
  const progressPct2 = Math.min(100, Math.round((tpCoins / REFERRAL_GOAL_2) * 100));

  useEffect(() => {
    setEquipmentList(loadStoredEquipment());
    setEquipmentLoaded(true);
  }, []);

  useEffect(() => {
    if (!equipmentLoaded) return;
    persistEquipment(equipmentList);
  }, [equipmentList, equipmentLoaded]);

  function resetFormFields() {
    setModelNumber('');
    setSerialNumber('');
    setYearOfManufacture('');
    setChassisNumber('');
    setPlateNumber('');
    setMileage('');
    setVehicleType(vehicleTypeOptions[0]);
    setColor('');
    setSubEquipmentType(hospitalSubTypeOptions[0]);
    setCapacityRating('');
    setPropertyDescription('');
    setLocationAddress('');
    setMaintenanceType(maintenanceTypeOptions[0]);
    setBuildingType(buildingTypeOptions[0]);
    setNumberOfFloors('');
    setTotalSquareMeters('');
    setStructuralIssues(structuralIssueOptions[0]);
    setFrameNumber('');
    setEngineNumber('');
    setBikeType(bikeTypeOptions[0]);
    setStatusText('');
    setFormMedia([]);
  }

  function handleTypeChange(type: string) {
    setEquipmentType(type);
    setCurrentState(defaultStateFor(type));
    if (type === SOLAR_TYPE) setSubEquipmentType(solarSubTypeOptions[0]);
    else if (type === HOSPITAL_TYPE) setSubEquipmentType(hospitalSubTypeOptions[0]);
  }

  function handleSaveEquipment() {
    if (isHomeMaintenance ? propertyDescription.trim() === '' : statusText.trim() === '') return;
    const isFirstEquipment = equipmentList.length === 0;
    setEquipmentList((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        type: equipmentType,
        modelNumber: modelNumber.trim(),
        serialNumber: serialNumber.trim(),
        yearOfManufacture,
        chassisNumber: chassisNumber.trim(),
        plateNumber: plateNumber.trim(),
        mileage: mileage.trim(),
        vehicleType: isCar ? vehicleType : '',
        color: color.trim(),
        currentState,
        subEquipmentType: isHospital || isSolar ? subEquipmentType : '',
        capacityRating: isSolar ? capacityRating.trim() : '',
        propertyDescription: isHomeMaintenance ? propertyDescription.trim() : '',
        locationAddress: isHomeMaintenance ? locationAddress.trim() : '',
        maintenanceType: isHomeMaintenance ? maintenanceType : '',
        buildingType: isBuilding ? buildingType : '',
        numberOfFloors: isBuilding ? numberOfFloors.trim() : '',
        totalSquareMeters: isBuilding ? totalSquareMeters.trim() : '',
        structuralIssues: isBuilding ? structuralIssues : '',
        frameNumber: isBike ? frameNumber.trim() : '',
        engineNumber: isBike ? engineNumber.trim() : '',
        bikeType: isBike ? bikeType : '',
        status: statusText.trim(),
        media: formMedia,
        mediaCount: formMedia.length,
        savedAt: new Date().toISOString(),
        forSale: false,
        stolen: false,
        showHistory: false,
      },
    ]);
    resetFormFields();
    if (isFirstEquipment) setShowUpsellModal(true);
  }

  function handleAddAnother(type: string) {
    handleTypeChange(type);
    resetFormFields();
    document.getElementById('equipment-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateEquipment(id: string, patch: Partial<Equipment>) {
    setEquipmentList((prev) => prev.map((eq) => (eq.id === id ? { ...eq, ...patch } : eq)));
  }

  function handleDeleteEquipment(id: string) {
    setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
  }

  useEffect(() => {
    const completed = new Date(JOB_COMPLETION_DATE).getTime();
    const elapsedDays = Math.floor((Date.now() - completed) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, GUARANTEE_DAYS - elapsedDays));
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    router.push('/marketplace');
  }

  const guaranteeActive = daysLeft !== null && daysLeft > 0;

  return (
    <PageShell>
      <Head>
        <title>Customer Dashboard — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        {/* TOP HEADER BAR */}
        <div className="bg-darkcard rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <h1 className="text-lg font-black text-white shrink-0">Welcome back, {customerName} 👋</h1>

            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search equipment, artisans, services..."
                  className="w-full bg-white rounded-full py-3 pl-11 pr-5 text-sm text-[#0F172A] placeholder:text-[#64748B]/70 focus:outline-none focus:ring-2 focus:ring-lemon"
                />
              </div>
            </form>

            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 bg-yellow/10 text-yellow text-xs font-black px-3 py-2 rounded-full whitespace-nowrap">
                🪙 {tpCoins.toLocaleString()} TP Coins
              </span>
              <span className="flex items-center gap-1.5 bg-lemon/10 text-lemon text-xs font-black px-3 py-2 rounded-full whitespace-nowrap">
                💰 ₦{walletBalance.toLocaleString()} Wallet
              </span>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Shield} label="Registered Equipment" value={String(equipmentList.length)} accent="lemon" />
          <StatCard icon={Wrench} label="Active Jobs" value={guaranteeActive ? `1 · ${daysLeft}d left` : '1'} accent="purple" />
          <StatCard icon={Users} label="My Pit Crew" value={String(pitCrewCount)} accent="sky" />
        </div>

        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="text-white font-black text-lg mb-5">🛠️ Active Jobs & 90-Day Guarantee</h2>

          <div className="bg-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center shrink-0">
                <Wrench size={18} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{recentJob.title}</p>
                <p className="text-slate text-xs">by {recentJob.provider}</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 rounded-2xl p-4 mb-4 ${
                guaranteeActive ? 'bg-lemon/10 border border-lemon/30' : 'bg-white/5 border border-white/10'
              }`}
            >
              {guaranteeActive ? (
                <Clock className="text-lemon shrink-0" size={20} />
              ) : (
                <AlertTriangle className="text-slate shrink-0" size={20} />
              )}
              <div>
                <p className={`font-black text-sm ${guaranteeActive ? 'text-lemon' : 'text-slate'}`}>
                  {daysLeft === null ? '—' : guaranteeActive ? `${daysLeft} Days Left` : 'Guarantee Expired'}
                </p>
                <p className="text-slate text-xs">90-Day Repair Guarantee</p>
              </div>
            </div>

            {complaintFiled ? (
              <p className="text-center text-sm text-lemon font-bold py-2">
                ✅ Complaint filed! Our team will reach out within 24 hours.
              </p>
            ) : guaranteeActive ? (
              <button
                onClick={() => setComplaintFiled(true)}
                className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
              >
                File a Complaint
              </button>
            ) : (
              <button disabled className="w-full bg-white/10 text-slate font-black py-3.5 rounded-full cursor-not-allowed">
                Warranty Expired
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: REGISTER EQUIPMENT */}
        <div id="equipment-form" className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-1">
            <Shield className="text-lemon" size={20} /> Register & Secure Your Equipment
          </h2>
          <p className="text-slate text-xs mb-5">Register 15 items, get 90-day guarantee for ₦10,000</p>

          <div className="mb-4">
            <label className="text-slate text-xs font-semibold mb-1.5 block">Equipment Type</label>
            <select
              value={equipmentType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white font-semibold focus:outline-none focus:border-lemon/50"
            >
              {equipmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-slate text-xs font-semibold mb-1.5 block">Upload Image</label>
            <MediaUploader
              buttonLabel="Upload Equipment Image"
              helperText="Show the current condition of your equipment"
              onOpenLightbox={setLightboxFile}
              onChange={setFormMedia}
            />
          </div>

          {isCar && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Year of Manufacture</label>
                <select value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  <option value="">Select year</option>
                  {carYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Model</label>
                <input type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="e.g. Camry LE" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Chassis Number (VIN)</label>
                <input type="text" value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value)} placeholder="e.g. 1HGCM82633A004352" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Plate Number</label>
                <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="e.g. LND-234-KJA" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current Mileage (km)</label>
                <input type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 82000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Vehicle Type</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {vehicleTypeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Color</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Silver" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {carStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isElectronics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Year of Manufacture</label>
                <select value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  <option value="">Select year</option>
                  {electronicsYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Serial/IMEI Number</label>
                <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. 356789104561234" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Model</label>
                <input type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="e.g. iPhone 13 Pro" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Color</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Black" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {electronicsStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isHospital && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Year of Manufacture</label>
                <select value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  <option value="">Select year</option>
                  {hospitalYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Serial Number</label>
                <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. HX-2021-4471" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Model</label>
                <input type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="e.g. GE Voluson E10" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Equipment Type</label>
                <select value={subEquipmentType} onChange={(e) => setSubEquipmentType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {hospitalSubTypeOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Color (if applicable)</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {hospitalStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isSolar && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Year of Manufacture</label>
                <select value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  <option value="">Select year</option>
                  {solarYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Serial Number</label>
                <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. SLR-2023-8891" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Model</label>
                <input type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="e.g. Growatt SPF 5000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Equipment Type</label>
                <select value={subEquipmentType} onChange={(e) => setSubEquipmentType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {solarSubTypeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Capacity/Power Rating</label>
                <input type="text" value={capacityRating} onChange={(e) => setCapacityRating(e.target.value)} placeholder="e.g. 5KVA, 500W" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Color (if applicable)</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Blue" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {solarStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isHomeMaintenance && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="text-slate text-xs font-semibold mb-1.5 block">Description of Property/Area</label>
                <textarea value={propertyDescription} onChange={(e) => setPropertyDescription(e.target.value)} rows={2} placeholder="e.g. 3-bedroom bungalow, kitchen and bathroom area" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate text-xs font-semibold mb-1.5 block">Location/Address</label>
                <input type="text" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Type</label>
                <select value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {maintenanceTypeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {homeMaintenanceStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isBuilding && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Year Built</label>
                <select value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  <option value="">Select year</option>
                  {buildingYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Building Type</label>
                <select value={buildingType} onChange={(e) => setBuildingType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {buildingTypeOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Number of Floors</label>
                <input type="number" min={0} value={numberOfFloors} onChange={(e) => setNumberOfFloors(e.target.value)} placeholder="e.g. 3" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Total Square Meters</label>
                <input type="number" min={0} value={totalSquareMeters} onChange={(e) => setTotalSquareMeters(e.target.value)} placeholder="e.g. 250" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Structural Issues</label>
                <select value={structuralIssues} onChange={(e) => setStructuralIssues(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {structuralIssueOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {buildingStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {isBike && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Year of Manufacture</label>
                <select value={yearOfManufacture} onChange={(e) => setYearOfManufacture(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  <option value="">Select year</option>
                  {bikeYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Brand/Model</label>
                <input type="text" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} placeholder="e.g. Bajaj Boxer 150" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Frame Number</label>
                <input type="text" value={frameNumber} onChange={(e) => setFrameNumber(e.target.value)} placeholder="e.g. MD2A11CY1JCB12345" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Engine Number</label>
                <input type="text" value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} placeholder="e.g. JCBE12345" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Bike Type</label>
                <select value={bikeType} onChange={(e) => setBikeType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {bikeTypeOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Color</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Red" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current Mileage (km)</label>
                <input type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 12000" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50" />
              </div>
              <div>
                <label className="text-slate text-xs font-semibold mb-1.5 block">Current State</label>
                <select value={currentState} onChange={(e) => setCurrentState(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-lemon/50">
                  {bikeStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="mb-5">
            <label className="text-slate text-xs font-semibold mb-1.5 block">Current Status</label>
            <textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              rows={3}
              placeholder="e.g. Toyota Camry 2019, working fine, due for oil change next month"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50 resize-none"
            />
          </div>

          <button
            onClick={handleSaveEquipment}
            className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
          >
            Save Equipment
          </button>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-5 space-y-1.5">
            <p className="text-slate text-xs">✅ Any year/model equipment can be registered on tpmarket.</p>
            <p className="text-slate text-xs">⚠️ Insurance integration is subject to tpmarket approval based on age, condition, and eligibility criteria.</p>
          </div>
        </div>

        {/* SECTION 2: MY REGISTERED EQUIPMENT */}
        {equipmentList.length > 0 && (
          <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
            <h2 className="text-white font-black text-lg mb-5">📦 My Registered Equipment</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {equipmentList.map((eq) => (
                <div key={eq.id} className="bg-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-bold text-sm">{eq.type}</p>
                    <button
                      onClick={() => handleAddAnother(eq.type)}
                      aria-label={`Add another ${eq.type}`}
                      className="w-8 h-8 rounded-full bg-lemon/10 text-lemon flex items-center justify-center hover:bg-lemon/20 transition-colors shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {eq.modelNumber && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">Model: {eq.modelNumber}</span>}
                    {eq.color && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">Color: {eq.color}</span>}
                    {eq.yearOfManufacture && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">Year: {eq.yearOfManufacture}</span>}
                    {(eq.chassisNumber || eq.serialNumber) && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                        {eq.chassisNumber ? `VIN: ${eq.chassisNumber}` : `S/N: ${eq.serialNumber}`}
                      </span>
                    )}
                    {eq.plateNumber && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">Plate: {eq.plateNumber}</span>}
                    {eq.mileage && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.mileage} km</span>}
                    {eq.vehicleType && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.vehicleType}</span>}
                    {eq.subEquipmentType && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple/10 text-purple">{eq.subEquipmentType}</span>}
                    {eq.capacityRating && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.capacityRating}</span>}
                    {eq.locationAddress && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">📍 {eq.locationAddress}</span>}
                    {eq.maintenanceType && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.maintenanceType}</span>}
                    {eq.buildingType && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.buildingType}</span>}
                    {eq.numberOfFloors && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.numberOfFloors} floors</span>}
                    {eq.totalSquareMeters && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.totalSquareMeters} sqm</span>}
                    {eq.structuralIssues && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple/10 text-purple">{eq.structuralIssues}</span>}
                    {(eq.frameNumber || eq.engineNumber) && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                        {eq.frameNumber && `Frame: ${eq.frameNumber}`}{eq.frameNumber && eq.engineNumber ? ' · ' : ''}{eq.engineNumber && `Engine: ${eq.engineNumber}`}
                      </span>
                    )}
                    {eq.bikeType && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">{eq.bikeType}</span>}
                    {eq.currentState && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-lemon/10 text-lemon">{eq.currentState}</span>}
                  </div>

                  {eq.propertyDescription && <p className="text-slate text-xs mb-1">{eq.propertyDescription}</p>}
                  <p className="text-slate text-xs mb-1">{eq.status}</p>
                  <p className="text-slate/60 text-[10px] mb-4">
                    Saved {new Date(eq.savedAt).toLocaleDateString()}
                    {eq.mediaCount > 0 && ` · 📷 ${eq.mediaCount} photo${eq.mediaCount === 1 ? '' : 's'}`}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    <button
                      onClick={() => updateEquipment(eq.id, { forSale: !eq.forSale })}
                      className="flex items-center justify-center gap-1.5 bg-[#2563EB] text-white text-xs font-bold px-3 py-2.5 rounded-full hover:brightness-110 transition-all"
                    >
                      🛒 {eq.forSale ? 'Listed ✓' : 'Publish for Sale'}
                    </button>
                    <button
                      onClick={() => updateEquipment(eq.id, { stolen: !eq.stolen })}
                      className="flex items-center justify-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-2.5 rounded-full hover:brightness-110 transition-all"
                    >
                      🚨 {eq.stolen ? 'Reported ✓' : 'Report Stolen'}
                    </button>
                    <Link
                      href="/customer/maintenance-insurance"
                      className="text-center flex items-center justify-center gap-1.5 bg-lemon text-[#0F172A] text-xs font-bold px-3 py-2.5 rounded-full hover:brightness-110 transition-all"
                    >
                      🛡️ 3-Year Maintenance Insurance
                    </Link>
                    <Link
                      href="/marketplace"
                      className="text-center flex items-center justify-center gap-1.5 bg-purple text-white text-xs font-bold px-3 py-2.5 rounded-full hover:brightness-110 transition-all"
                    >
                      🔍 View Nearby Specialists
                    </Link>
                    <button
                      onClick={() => updateEquipment(eq.id, { showHistory: !eq.showHistory })}
                      className="flex items-center justify-center gap-1.5 border-2 border-white/30 text-white text-xs font-bold px-3 py-2.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      📋 Maintenance History
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(eq.id)}
                      className="flex items-center justify-center gap-1.5 border-2 border-slate text-slate text-xs font-bold px-3 py-2.5 rounded-full hover:bg-white/5 hover:text-white hover:border-white/40 transition-colors"
                    >
                      🗑️ Delete Equipment
                    </button>
                  </div>

                  {eq.forSale && <p className="text-lemon text-xs font-semibold">✅ Listed on the Marketplace (demo)</p>}
                  {eq.stolen && <p className="text-red-400 text-xs font-semibold">🚨 Reported stolen — network notified (demo)</p>}
                  {eq.showHistory && (
                    <div className="bg-[#0F172A] border border-white/10 rounded-xl p-3 mt-2">
                      <p className="text-slate text-xs">No maintenance history yet for this item.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: REFERRALS & TP COINS */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-5">
            <Gift className="text-purple" size={20} /> Referrals & TP Coins
          </h2>

          {/* REFERRAL CODE BOX */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
            <h3 className="text-white font-black text-sm mb-3">Invite Friends & Earn</h3>
            <div className="bg-[#0F172A] border border-lemon/30 rounded-2xl py-5 text-center mb-4">
              <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1">Your Referral Code</p>
              <p className="text-lemon font-black text-3xl sm:text-4xl tracking-wide">{referralCode}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleCopyReferralLink}
                className="flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-3 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />} {copiedLink ? 'Copied!' : 'Copy Code'}
              </button>
              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-3 rounded-full hover:scale-[1.02] transition-all"
              >
                <MessageCircle size={16} /> Share via WhatsApp
              </a>
            </div>
            <p className="text-slate text-xs leading-relaxed">
              When a friend registers with your code and makes a purchase, you both earn rewards!
            </p>
          </div>

          {/* TP COINS & WALLET */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1">Total TP Coins</p>
              <p className="text-lemon font-black text-3xl">{tpCoins.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1">Wallet Balance</p>
              <p className="text-white font-black text-3xl mb-1">₦{walletBalance.toLocaleString()}.00</p>
              <p className="text-slate text-[10px]">
                Withdrawable balance: ₦{withdrawableBalance.toLocaleString()}.00 | App Credit: ₦{appCredit.toLocaleString()}.00
              </p>
            </div>
          </div>

          {/* PROGRESS BARS */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate font-semibold">Unlock {REFERRAL_GOAL_1_REWARD}</span>
                <span className="text-white font-bold">{tpCoins.toLocaleString()} / {REFERRAL_GOAL_1.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-lemon rounded-full" style={{ width: `${progressPct1}%` }} />
              </div>
              {tpCoins >= REFERRAL_GOAL_1 && <p className="text-lemon text-xs font-bold mt-2">🎉 Goal reached!</p>}
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate font-semibold">Qualify for {REFERRAL_GOAL_2_REWARD}</span>
                <span className="text-white font-bold">{tpCoins.toLocaleString()} / {REFERRAL_GOAL_2.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple rounded-full" style={{ width: `${progressPct2}%` }} />
              </div>
              {tpCoins >= REFERRAL_GOAL_2 && <p className="text-purple text-xs font-bold mt-2">🎉 Goal reached!</p>}
            </div>
          </div>
        </div>
      </div>

      <MediaLightbox file={lightboxFile} onClose={() => setLightboxFile(null)} />

      {showUpsellModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm bg-darkcard rounded-3xl p-7 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center">
            <div className="w-14 h-14 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-4">
              <Shield size={26} />
            </div>
            <p className="text-white font-bold text-base leading-relaxed mb-6">
              To activate Secured Maintenance for 15 equipment click here to pay ₦10,000.00.
            </p>
            <Link
              href="/customer/payment/secure-maintenance"
              className="block w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-full mb-3 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
            >
              Pay ₦10,000.00 & Activate
            </Link>
            <button
              onClick={() => setShowUpsellModal(false)}
              className="w-full text-slate text-xs font-semibold py-2 hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
