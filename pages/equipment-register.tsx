import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const CATEGORIES = [
  'Cars',
  'Computers',
  'Phones',
  'Office Equipment',
  'Home Equipment',
  'Hospital Equipment',
  'Buildings',
];

const OWNER_TYPES = ['Individual', 'Corporate', 'Organization', 'Government'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);

export default function EquipmentRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [category, setCategory] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [yearManufactured, setYearManufactured] = useState<number>(CURRENT_YEAR);
  const [stateCondition, setStateCondition] = useState('');
  const [ownerType, setOwnerType] = useState('Individual');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/signin');
      }
    });
  }, [router]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setMessage({ type: 'error', text: 'Maximum 8 images allowed' });
      return;
    }

    setUploadingImages(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('equipment-images')
        .upload(fileName, file);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to upload image' });
        setUploadingImages(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(fileName);

      newImages.push(urlData.publicUrl);
    }

    setImages([...images, ...newImages]);
    setUploadingImages(false);
    setMessage({ type: 'success', text: 'Images uploaded successfully' });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length < 2) {
      setMessage({ type: 'error', text: 'Minimum 2 images required' });
      return;
    }

    if (!category || !stateCondition || !ownerName) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: 'error', text: 'User not authenticated' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('equipment').insert([
      {
        user_id: user.id,
        category,
        serial_number: serialNumber,
        model_number: modelNumber,
        year_manufactured: yearManufactured,
        state_condition: stateCondition,
        owner_type: ownerType,
        owner_name: ownerName,
        address,
        country,
        state,
        images,
      },
    ]);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Equipment registered successfully!' });
      // Reset form
      setCategory('');
      setSerialNumber('');
      setModelNumber('');
      setStateCondition('');
      setOwnerName('');
      setAddress('');
      setState('');
      setImages([]);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>Register Equipment — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">Register Your Equipment</h1>
        <p className="text-slate-400 text-sm mt-1">Add your equipment to get maintenance benefits</p>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <p className="font-bold">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Equipment Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* SERIAL & MODEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Serial Number / IMEI
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g., SN123456789"
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Model Number
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g., Model X200"
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              />
            </div>
          </div>

          {/* YEAR & CONDITION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Year Manufactured
              </label>
              <select
                value={yearManufactured}
                onChange={(e) => setYearManufactured(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Current Condition <span className="text-red-400">*</span>
              </label>
              <select
                value={stateCondition}
                onChange={(e) => setStateCondition(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
                required
              >
                <option value="">Select Condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>
          </div>

          {/* OWNER TYPE */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Owner Type <span className="text-red-400">*</span>
            </label>
            <select
              value={ownerType}
              onChange={(e) => setOwnerType(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
            >
              {OWNER_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* OWNER NAME */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Full Name / Organization Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter full name or organization name"
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              required
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              rows={2}
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
            />
          </div>

          {/* COUNTRY & STATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., Lagos"
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              />
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Equipment Images <span className="text-red-400">*</span> (Min: 2, Max: 8)
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-[#ccff00]" size={32} />
                <p className="text-sm text-gray-400">
                  {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {images.length} of 8 uploaded
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={img} alt={`Equipment ${idx + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Equipment'}
          </button>

          <p className="text-center text-xs text-gray-500">
            After 90 days of registration and maintenance, you may qualify for insurance benefits
          </p>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}