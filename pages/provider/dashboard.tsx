import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { Plus, Package, TrendingUp, CheckCircle, Upload, X, Image as ImageIcon, User, MessageSquare } from 'lucide-react';

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mechanics');
  const [type, setType] = useState('Book'); 
  const [description, setDescription] = useState('');
  
  const [condition, setCondition] = useState('New');
  const [modelNo, setModelNo] = useState('');
  const [yearManufactured, setYearManufactured] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    fetchMyListings();
    fetchRequests(); 
    fetchProfile();
  }, []);

  async function fetchMyListings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
    if (data) setMyListings(data);
  }

  // SECURE: Fetch ONLY the requests meant for this specific provider
  async function fetchRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
      
    if (data) setRequests(data);
  }

  // Function to handle Declining a request
  async function handleDecline(reqId: string) {
    if (!confirm("Are you sure you want to decline this request?")) return;
    
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: 'declined' })
      .eq('id', reqId);

    if (!error) {
      alert("Request declined.");
      fetchRequests(); // Refresh the list
    } else {
      alert("Error declining request.");
    }
  }

  // Function to handle Accepting and Replying
  async function handleAccept(reqId: string, originalMessage: string) {
    const reply = prompt("Type your reply/acceptance message to the customer:");
    if (!reply) return; // User cancelled the prompt

    const { error } = await supabase
      .from('quote_requests')
      .update({ 
        status: 'accepted',
        description: `MY REPLY: ${reply}\n\n---\nORIGINAL REQUEST: ${originalMessage}`
      })
      .eq('id', reqId);

    if (!error) {
      alert("Reply sent and request accepted!");
      fetchRequests(); // Refresh the list
    } else {
      alert("Error sending reply.");
    }
  }

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single();
    if (data?.avatar_url) setProfilePreview(data.avatar_url);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 8) {
        alert('You can only upload a maximum of 8 images.');
        return;
      }
      setSelectedFiles([...selectedFiles, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Please sign in first.'); setLoading(false); return; }

    try {
      const { data: profileData } = await supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single();
      const sellerLogo = profileData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ccff00&color=0F172A`;
      const sellerName = profileData?.full_name || user.email;

      const imageUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${user.id}/${Date.now()}_${i}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase.from('products').insert([
        {
          seller_id: user.id,
          name: name,
          price: parseFloat(price),
          category: category,
          type: type,
          description: description,
          condition: type === 'Buy' ? condition : null,
          model_no: type === 'Buy' ? modelNo : null,
          year_manufactured: type === 'Buy' ? (yearManufactured ? parseInt(yearManufactured) : null) : null,
          images: imageUrls,
          seller_name: sellerName,
          seller_logo: sellerLogo,
          location: 'Lagos, Nigeria',
        },
      ]);

      if (error) throw error;

      setMessage('✅ Service published successfully!');
      setName(''); setPrice(''); setDescription('');
      setModelNo(''); setYearManufactured('');
      setSelectedFiles([]); setPreviewUrls([]);
      setShowForm(false);
      fetchMyListings();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setProfileMessage('Uploading...');
      const filePath = `profiles/${user.id}/avatar_${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
      if (uploadError) { setProfileMessage('Upload failed'); return; }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setProfilePreview(publicUrl);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      setProfileMessage('✅ Profile photo updated!');
      setTimeout(() => setProfileMessage(''), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>Provider Dashboard — TPMarket</title></Head>

      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">Provider Dashboard</h1>
        <p className="text-slate-400 text-sm">Manage your services, requests, and track your growth.</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* PROFILE PHOTO */}
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <label className="relative cursor-pointer group">
            <div className="w-24 h-24 rounded-full bg-[#0F172A] border-2 border-dashed border-[#ccff00] flex items-center justify-center overflow-hidden">
              {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" /> : <User className="text-[#ccff00]" size={32} />}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} />
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">Change</span>
            </div>
          </label>
          <h3 className="text-white font-bold mt-3">Provider Profile Photo</h3>
          <p className="text-xs text-slate-400 mb-2">This will be your logo on all your listings</p>
          {profileMessage && <p className="text-xs text-[#ccff00] font-bold">{profileMessage}</p>}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
            <Package className="text-[#ccff00] mb-2" size={24} />
            <p className="text-2xl font-black">{myListings.length}</p>
            <p className="text-xs text-slate-400">Active Services</p>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
            <MessageSquare className="text-[#ccff00] mb-2" size={24} />
            <p className="text-2xl font-black">{requests.filter(r => r.status === 'pending').length}</p>
            <p className="text-xs text-slate-400">Pending Requests</p>
          </div>
        </div>

        {/* PUBLISH FORM TOGGLE */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20">
            <Plus size={20} /> Publish New Service
          </button>
        ) : (
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#ccff00]/30 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Service/Product</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">Cancel</button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl mb-4 text-center font-bold text-sm ${message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. iPhone 15 Pro or AC Repair)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price in Naira" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none h-24" />
              
              <div className="grid grid-cols-2 gap-4">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                  <option>Mechanics</option><option>Tailors & Fashion</option><option>Electricians</option><option>Home Services</option><option>Car Spare Parts</option><option>Electronics</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                  <option value="Book">Book a Service</option>
                  <option value="Buy">Sell a Product</option>
                </select>
              </div>

              {type === 'Buy' && (
                <div className="bg-[#0F172A] p-4 rounded-xl border border-[#ccff00]/20 space-y-4">
                  <h3 className="text-sm font-bold text-[#ccff00] uppercase flex items-center gap-2"><Package size={16} /> Product Specific Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1 block">Condition</label>
                      <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                        <option value="New">Brand New</option><option value="Used">Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1 block">Year Manufactured</label>
                      <input type="number" value={yearManufactured} onChange={(e) => setYearManufactured(e.target.value)} placeholder="e.g. 2023" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Model Number / Name</label>
                    <input type="text" value={modelNo} onChange={(e) => setModelNo(e.target.value)} placeholder="e.g. A2848, Galaxy S24" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Upload Images (Max 8)</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#ccff00]/50 transition-all bg-[#0F172A]">
                  <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-sm text-slate-400">Click to select images</p>
                  <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Uploading...' : 'Publish to Marketplace'}
              </button>
            </form>
          </div>
        )}

        {/* INCOMING REQUESTS SECTION */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#ccff00]" /> Incoming Requests & Negotiations
          </h2>
          
          {requests.length === 0 ? (
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 text-center">
              <p className="text-slate-400">No new requests yet. When a customer negotiates or asks for a quote, it will show up here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req: any) => (
                <div key={req.id} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.request_type === 'negotiate' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {req.request_type === 'negotiate' ? '💰 Negotiation' : '📝 Quote Request'}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {req.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-white text-sm mb-3 bg-[#0F172A] p-3 rounded-lg border border-white/5 italic">
                    "{req.description}"
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccept(req.id, req.description)}
                      className="flex-1 bg-[#ccff00] text-[#0F172A] text-xs font-bold py-2.5 rounded-xl hover:scale-[1.02] transition-all"
                    >
                      Accept / Reply
                    </button>
                    <button 
                      onClick={() => handleDecline(req.id)}
                      className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-2.5 rounded-xl hover:bg-red-500/30 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY ACTIVE SERVICES */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-[#ccff00]" /> My Active Services</h2>
          {myListings.length === 0 ? (
            <p className="text-slate-400 text-center py-8 bg-[#1E293B] rounded-2xl border border-white/5">You haven't published any services yet.</p>
          ) : (
            <div className="space-y-3">
              {myListings.map((item: any) => (
                <div key={item.id} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 flex gap-4 items-center">
                  {item.images && item.images.length > 0 ? <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center"><ImageIcon className="text-slate-500" size={24} /></div>}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.category} • {item.type} {item.condition && `• ${item.condition}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#ccff00]">₦{item.price?.toLocaleString()}</p>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}