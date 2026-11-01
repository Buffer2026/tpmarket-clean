import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { Loader2, Upload, X } from 'lucide-react';

const SERVICE_CATEGORIES = ['Mechanics', 'Electricians', 'Tailors & Fashion', 'Builders', 'Computer Engineers', 'Web Developers', 'Home Services', 'Other'];
const PRODUCT_CATEGORIES = ['Car Spare Parts', 'Solar Equipment', 'Electronics', 'Office Equipment', 'Hospital Equipment', 'Other'];

export default function PublishPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isChecking, setIsChecking] = useState(true);
  const [type, setType] = useState('Book');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [condition, setCondition] = useState('Brand New');
  const [year, setYear] = useState('');
  const [model, setModel] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Security check
  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('can_publish, tpwecan_verified, role')
        .eq('id', user.id)
        .single();
      
      const isAllowed = data?.can_publish === true || data?.tpwecan_verified === true || data?.role === 'provider';
      
      if (!isAllowed) {
        window.location.href = '/provider/verify';
        return;
      }
      
      setIsChecking(false);
    }
    checkAccess();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + previewUrls.length > 8) {
      alert('Max 8 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('❌ Please sign in');
      setLoading(false);
      return;
    }

    try {
      // Get seller info from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Upload images to Supabase Storage
      const uploadedImageUrls: string[] = [];
      for (const file of images) {
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedImageUrls.push(publicUrl);
      }

      const finalCategory = category === 'Other' ? customCategory : category;

      // Insert product into database
      const { error } = await supabase.from('products').insert([{
        seller_id: user.id,
        name,
        price: parseFloat(price),
        description,
        category: finalCategory,
        custom_category: category === 'Other' ? customCategory : null,
        type,
        condition_type: type === 'Buy' ? condition : null,
        year_manufactured: type === 'Buy' ? (year ? parseInt(year) : null) : null,
        model_number: type === 'Buy' ? model : null,
        images: uploadedImageUrls,
        seller_name: profile?.full_name || user.email,
        seller_logo: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ccff00&color=0F172A`,
        location: 'Lagos, Nigeria',
      }]);

      if (error) throw error;

      setMessage('✅ Service published successfully!');
      setTimeout(() => router.push('/provider/dashboard'), 2000);
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ccff00]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 pb-24 text-white">
      <h1 className="text-2xl font-black mb-6">Publish New</h1>
      
      {message && (
        <div className={`p-3 rounded-xl mb-4 text-center font-bold ${message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name (e.g. iPhone 15 or AC Repair)" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
        <input required type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price in Naira" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description..." className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none h-24" />

        <div className="grid grid-cols-2 gap-3">
          <select value={type} onChange={e=>setType(e.target.value)} className="bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white">
            <option value="Book">Book a Service</option>
            <option value="Buy">Sell a Product</option>
          </select>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white">
            <option value="">Select Category</option>
            {(type === 'Buy' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {category === 'Other' && (
          <input required value={customCategory} onChange={e=>setCustomCategory(e.target.value)} placeholder="Custom category..." className="w-full bg-[#1E293B] border border-[#ccff00] rounded-xl py-3 px-4 text-white" />
        )}

        {type === 'Buy' && (
          <div className="bg-[#1E293B] p-4 rounded-2xl space-y-3">
            <h3 className="text-[#ccff00] font-black text-sm">📦 PRODUCT DETAILS</h3>
            <div className="grid grid-cols-2 gap-3">
              <select value={condition} onChange={e=>setCondition(e.target.value)} className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white">
                <option>Brand New</option><option>Used - Excellent</option><option>Used - Good</option>
              </select>
              <input value={year} onChange={e=>setYear(e.target.value)} placeholder="Year (e.g. 2023)" className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white" />
            </div>
            <input value={model} onChange={e=>setModel(e.target.value)} placeholder="Model Number" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white" />
          </div>
        )}

        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/5">
          <Upload className="mx-auto mb-2 text-slate-400" size={24} />
          <p className="font-bold text-slate-300">Upload Images ({previewUrls.length}/8)</p>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`Preview ${i}`} className="w-full h-20 object-cover rounded-lg" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Publish to Marketplace'}
        </button>
      </form>
      <BottomNav />
    </div>
  );
}