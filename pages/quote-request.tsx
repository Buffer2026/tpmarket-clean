import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function QuoteRequest() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication on page load
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Not logged in, redirect to sign in
        router.push('/signin');
      } else {
        setUser(user);
      }
      setCheckingAuth(false);
    }
    checkUser();
  }, []);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

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
    
    // Double-check user is logged in
    if (!user) {
      alert('Please sign in first');
      return;
    }
    
    setLoading(true);

    let finalImages: string[] = [];
    
    // Upload images to Supabase Storage
    for (const file of images) {
      const { data } = await supabase.storage.from('quotes').upload(`${Date.now()}_${file.name}`, file);
      if (data) {
        const { data: urlData } = supabase.storage.from('quotes').getPublicUrl(data.path);
        finalImages.push(urlData.publicUrl);
      }
    }

    // Insert into database
    const { error } = await supabase.from('quote_requests').insert([{ 
      customer_id: user.id, 
      description: description.trim(),
      images: finalImages 
    }]);
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('✅ Quote Request Sent! The provider will contact you shortly.');
      // Reset form
      setDescription('');
      setImages([]);
      setImageUrls([]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 pb-24 text-white">
      <h1 className="text-2xl font-black mb-2">Request a Quote</h1>
      <p className="text-gray-400 text-sm mb-6">Describe your needs and attach photos so the provider can give you an accurate estimate.</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Description Field */}
        <div>
          <label className="text-xs font-bold text-gray-400 mb-1.5 block">What do you need done?</label>
          <textarea 
            required 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="e.g., I need my 2015 Toyota Camry brake pads replaced and AC regassed..." 
            className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 h-32 text-white placeholder:text-gray-500 focus:border-[#ccff00] focus:outline-none" 
          />
        </div>
        
        {/* Image Upload Field */}
        <div>
          <label className="text-xs font-bold text-gray-400 mb-1.5 block">Attach Sample Images (Optional, Max 8)</label>
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:border-[#ccff00]/50 hover:bg-white/5 transition-all"
          >
            <p className="font-bold text-white text-sm"> Tap to Upload Photos</p>
            <p className="text-xs text-gray-500 mt-1">{images.length > 0 ? `${images.length}/8 images selected` : 'JPG, PNG up to 5MB each'}</p>
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageSelect} 
              className="hidden" 
            />
          </div>
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

        {/* Submit Button */}
        <button 
          disabled={loading} 
          className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'Sending Request...' : 'Submit Quote Request'}
        </button>
      </form>
      <BottomNav />
    </div>
  );
}