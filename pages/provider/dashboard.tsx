import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { Plus, Package, MessageSquare, User, X, Image as ImageIcon } from 'lucide-react';

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); 
  const [isVerified, setIsVerified] = useState(false); 
  
  // ... (Keep your existing form states here: name, price, category, etc.) ...
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mechanics');
  const [type, setType] = useState('Book'); 
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // 🔒 PROOF CHECK: This will pop up and tell you EXACTLY what the database says
  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/signin'); return; }

      const { data, error } = await supabase
        .from('profiles')
        .select('can_publish, avatar_url')
        .eq('id', user.id)
        .single();
      
      // PROOF ALERT: This will show you the exact database value
      alert(`🔒 SECURITY CHECK:\ncan_publish = ${data?.can_publish}\nError = ${error ? error.message : 'None'}`);

      if (!data?.can_publish) {
        alert("🚫 ACCESS DENIED: Redirecting to verification...");
        router.replace('/provider/verify'); 
      } else {
        alert("✅ ACCESS GRANTED: You are verified.");
        if (data.avatar_url) setProfilePreview(data.avatar_url);
        setIsVerified(true);
        fetchMyListings();
        fetchRequests(); 
      }
    }
    checkAccess();
  }, []);

  async function fetchMyListings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    if (data) setMyListings(data);
  }

  async function fetchRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('quote_requests').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    if (data) setRequests(data);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const imageUrls: string[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const filePath = `${user.id}/${Date.now()}_${i}_${file.name}`;
      await supabase.storage.from('product-images').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      imageUrls.push(publicUrl);
    }

    await supabase.from('products').insert([{
      seller_id: user.id, name, price: parseFloat(price), category, type, description,
      images: imageUrls, location: 'Lagos, Nigeria',
    }]);

    setMessage('✅ Published!');
    setShowForm(false);
    fetchMyListings();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>Provider Dashboard</title></Head>
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">Provider Dashboard</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* ONLY SHOW PUBLISH BUTTON IF isVerified IS TRUE */}
        {isVerified ? (
          !showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-2xl">
              + Publish New Service
            </button>
          ) : (
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#ccff00]/30">
              <button onClick={() => setShowForm(false)} className="text-slate-400 mb-4">Cancel</button>
              <form onSubmit={handlePublish} className="space-y-4">
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white" />
                <input required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white" />
                <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl">
                  {loading ? 'Publishing...' : 'Publish'}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="text-center text-red-400 py-10">🔒 Verification required. You should have been redirected.</div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}git add .