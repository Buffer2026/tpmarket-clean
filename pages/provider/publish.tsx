import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';

// SEPARATE LISTS
const PRODUCT_CATEGORIES = ['Car Spare Parts', 'Solar Equipment', 'Electronics', 'Office Equipment', 'Hospital Equipment', 'Other'];
const SERVICE_CATEGORIES = ['Mechanics', 'Electricians', 'Tailors & Fashion', 'Builders', 'Computer Engineers', 'Web Developers', 'Home Services', 'Other'];

export default function PublishPage() {
  const router = useRouter();
  const { id } = router.query; // Checks if we are editing an existing item
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  //  SECURITY GATE: Block access if not verified
  useEffect(() => {
    async function checkPublishAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        window.location.href = '/signin'; 
        return; 
      }

      const { data } = await supabase
        .from('profiles')
        .select('can_publish')
        .eq('id', user.id)
        .single();
      
      // If can_publish is NOT true, kick them out immediately
      if (!data?.can_publish) {
        window.location.href = '/provider/verify'; 
      }
    }
    checkPublishAccess();
  }, []);

  // If editing, fetch the old data
  useEffect(() => {
    if (id) {
      supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setType(data.type || 'Book');
          setName(data.name); setPrice(data.price.toString());
          setDescription(data.description || '');
          setCategory(data.custom_category ? 'Other' : data.category);
          setCustomCategory(data.custom_category || '');
          setCondition(data.condition_type || 'Brand New');
          setYear(data.year_manufactured || '');
          setModel(data.model_number || '');
          setExistingImages(data.images || []);
        }
      });
    }
  }, [id]);

  const handleImageSelect = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + existingImages.length > 8) return alert('Max 8 images allowed');
    setImages(files);
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Please sign in');

    const finalCategory = category === 'Other' ? customCategory : category;
    let finalImages = [...existingImages];

    // Upload new images
    for (const file of images) {
      const { data } = await supabase.storage.from('products').upload(`${Date.now()}_${file.name}`, file);
      if (data) {
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
        finalImages.push(urlData.publicUrl);
      }
    }

    const payload = {
      seller_id: user.id, name, price: parseFloat(price), category: finalCategory,
      custom_category: category === 'Other' ? customCategory : null,
      type, description, condition_type: type === 'Buy' ? condition : null,
      year_manufactured: type === 'Buy' ? year : null, model_number: type === 'Buy' ? model : null,
      images: finalImages
    };

    let error;
    if (id) {
      // UPDATE existing listing
      const res = await supabase.from('products').update(payload).eq('id', id);
      error = res.error;
    } else {
      // INSERT new listing
      const res = await supabase.from('products').insert([payload]);
      error = res.error;
    }

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage('✅ Success! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 pb-24 text-white">
      <h1 className="text-2xl font-black mb-6">{id ? 'Edit Listing' : 'Publish New'}</h1>
      {message && <div className="bg-green-500/20 text-green-400 p-3 rounded-xl mb-4 text-center font-bold">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name (e.g. iPhone 15 or AC Repair)" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4" />
        <input required type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price in Naira" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description..." className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 h-24" />

        <div className="grid grid-cols-2 gap-3">
          <select value={type} onChange={e=>setType(e.target.value)} className="bg-[#1E293B] border border-[#ccff00]/50 rounded-xl py-3 px-4">
            <option value="Book">Book a Service</option><option value="Buy">Sell a Product</option>
          </select>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4">
            <option value="">Select Category</option>
            {(type === 'Buy' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* CUSTOM CATEGORY BOX */}
        {category === 'Other' && (
          <input required value={customCategory} onChange={e=>setCustomCategory(e.target.value)} placeholder="Type your custom category (e.g. Drone Photography)..." className="w-full bg-[#1E293B] border border-[#ccff00] rounded-xl py-3 px-4" />
        )}

        {/* PRODUCT DETAILS */}
        {type === 'Buy' && (
          <div className="bg-[#1E293B] p-4 rounded-2xl space-y-3">
            <h3 className="text-[#ccff00] font-black text-sm">📦 PRODUCT DETAILS</h3>
            <div className="grid grid-cols-2 gap-3">
              <select value={condition} onChange={e=>setCondition(e.target.value)} className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4">
                <option>Brand New</option><option>Used - Excellent</option><option>Used - Good</option>
              </select>
              <input value={year} onChange={e=>setYear(e.target.value)} placeholder="Year (e.g. 2023)" className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4" />
            </div>
            <input value={model} onChange={e=>setModel(e.target.value)} placeholder="Model Number / Name" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4" />
          </div>
        )}

        {/* IMAGE UPLOAD */}
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer">
          <p className="font-bold"> Upload Images ({images.length + existingImages.length}/8)</p>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>

        <button disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl">
          {loading ? 'Saving...' : (id ? 'Update Listing' : 'Publish to Marketplace')}
        </button>
      </form>
      <BottomNav />
    </div>
  );
}