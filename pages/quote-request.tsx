import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function QuoteRequest() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]); // <-- ADDED THIS MISSING LINE
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const filesArray = Array.from(files);
    if (filesArray.length > 8) {
      alert('Maximum 8 images allowed');
      return;
    }
    setImages(filesArray);
    setImageUrls(filesArray.map(file => URL.createObjectURL(file)));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in first');
      setLoading(false);
      return;
    }

    const finalCategory = category === 'Other' ? customCategory : category;
    let finalImages: string[] = [];
    
    // Upload images
    for (const file of images) {
      const { data } = await supabase.storage.from('quotes').upload(`${Date.now()}_${file.name}`, file);
      if (data) {
        const { data: urlData } = supabase.storage.from('quotes').getPublicUrl(data.path);
        finalImages.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from('quote_requests').insert([{ 
      customer_id: user.id, 
      description, 
      category: finalCategory, 
      custom_category: category === 'Other' ? customCategory : null, 
      images: finalImages 
    }]);
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✅ Quote Request Sent! Providers will contact you.');
      // Reset form
      setCategory('');
      setCustomCategory('');
      setDescription('');
      setImages([]);
      setImageUrls([]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 pb-24 text-white">
      <h1 className="text-2xl font-black mb-2">Request a Quote</h1>
      <p className="text-gray-400 text-sm mb-6">Tell us what you need.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white"
        >
          <option value="">Select Category</option>
          <option>Mechanics</option>
          <option>Tailors</option>
          <option>Builders</option>
          <option>Other</option>
        </select>
        
        {category === 'Other' && (
          <input 
            required 
            value={customCategory} 
            onChange={e => setCustomCategory(e.target.value)} 
            placeholder="Type your specific need..." 
            className="w-full bg-[#1E293B] border border-[#ccff00] rounded-xl py-3 px-4 text-white placeholder:text-gray-500" 
          />
        )}
        
        <textarea 
          required 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Describe exactly what you want..." 
          className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 h-32 text-white placeholder:text-gray-500" 
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()} 
          className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:border-[#ccff00]/50 transition-all"
        >
          <p className="font-bold text-white">📷 Upload Sample Images ({images.length}/8)</p>
          <input 
            ref={fileInputRef} 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageSelect} 
            className="hidden" 
          />
        </div>

        {/* Image Previews */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                <img src={url} alt={`Sample ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <button 
          disabled={loading} 
          className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Submit Request'}
        </button>
      </form>
      <BottomNav />
    </div>
  );
}