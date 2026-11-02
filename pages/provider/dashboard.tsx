import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { Plus, Package, TrendingUp, CheckCircle, Upload, X, Image as ImageIcon, User, MessageSquare, Shield, AlertTriangle, Loader2 } from 'lucide-react';

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); 
  
  // Verification state
  const [isVerified, setIsVerified] = useState(false); 
  const [isChecking, setIsChecking] = useState(true); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Publish Form States
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

  // Quotation Modal States
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDuration, setQuoteDuration] = useState('');
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // 🔒 ULTIMATE SECURITY CHECK: Bulletproof verification
  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) router.replace('/signin');
        return;
      }

      console.log("🔒 Checking access for user:", user.email);

      // 1. Check Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tpwecan_id, tpwecan_verified')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log("⛔ BLOCKED: No profile found or error:", profileError);
        if (isMounted) router.replace('/provider/verify');
        return;
      }

      console.log("📝 Profile TPwecan ID:", profile.tpwecan_id);

      if (!profile.tpwecan_id) {
        console.log("⛔ BLOCKED: Profile has no TPwecan ID.");
        if (isMounted) router.replace('/provider/verify');
        return;
      }

      // 2. Check Master List
      const { data: member, error: memberError } = await supabase
        .from('tpwecan_members')
        .select('id, tpwecan_id')
        .eq('tpwecan_id', profile.tpwecan_id)
        .single();

      console.log("🔍 Master List Check Result:", member, memberError);

      if (memberError || !member) {
        console.log("⛔ BLOCKED: TPwecan ID NOT found in tpwecan_members table.");
        if (isMounted) router.replace('/provider/verify');
        return;
      }

      // 3. Grant Access
      console.log("✅ ACCESS GRANTED: User is a verified TPwecan member.");
      if (isMounted) {
        setIsVerified(true);
        setIsChecking(false);
        fetchMyListings();
        fetchRequests();
      }
    }

    checkAccess();
    return () => { isMounted = false; };
  }, []);

  // ✅ Robust fetch with error logging
  async function fetchMyListings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("❌ Error fetching listings:", error);
      return;
    }
    
    if (data) {
      console.log("✅ Successfully fetched listings:", data);
      setMyListings(data);
    }
  }

  async function fetchRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
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

  async function submitQuotation() {
    if (!quoteAmount || !quoteDuration) return alert("Please enter both the Total Amount and Job Duration.");
    setQuoteLoading(true);

    let attachmentUrl = null;
    if (quoteFile) {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `quotations/${user.id}/${Date.now()}_${quoteFile.name}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, quoteFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        attachmentUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from('quote_requests')
      .update({ 
        status: 'quoted',
        quoted_amount: parseFloat(quoteAmount),
        job_duration_days: parseInt(quoteDuration),
        attachment_url: attachmentUrl,
        description: `${selectedRequest.description}\n\n---\n[QUOTATION SENT: ₦${parseFloat(quoteAmount).toLocaleString()} | Duration: ${quoteDuration} Days]`
      })
      .eq('id', selectedRequest.id);

    if (!error) {
      alert("✅ Quotation sent successfully!");
      setShowQuoteModal(false);
      setSelectedRequest(null);
      setQuoteAmount(''); setQuoteDuration(''); setQuoteFile(null);
      fetchRequests();
    } else {
      alert("Error sending quotation.");
    }
    setQuoteLoading(false);
  }

  async function handleDecline(reqId: string) {
    if (!confirm("Are you sure you want to decline this request?")) return;
    const { error } = await supabase.from('quote_requests').update({ status: 'declined' }).eq('id', reqId);
    if (!error) {
      alert("Request declined.");
      fetchRequests();
    }
  }

  async function handleAcceptCounterOffer(reqId: string) {
    if (!confirm("Accept this counter-offer? The customer will be notified to proceed with payment.")) return;
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: 'accepted_by_provider' })
      .eq('id', reqId);
    if (!error) {
      alert("✅ Counter-offer accepted! Customer can now proceed to payment.");
      fetchRequests();
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Please sign in first.'); setLoading(false); return; }

    try {
      console.log("📦 Starting publish process...");
      const { data: profileData } = await supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).single();
      const sellerLogo = profileData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ccff00&color=0F172A`;
      const sellerName = profileData?.full_name || user.email;

      const imageUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${user.id}/${Date.now()}_${i}_${file.name}`;
        console.log("⬆️ Uploading image:", filePath);
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) {
            console.error("Upload Error:", uploadError);
            throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const payload = {
        seller_id: user.id, 
        name, 
        price: parseFloat(price), 
        category, 
        type, 
        description,
        condition_type: type === 'Buy' ? condition : null,
        model_number: type === 'Buy' ? modelNo : null,
        year_manufactured: type === 'Buy' ? (yearManufactured ? parseInt(yearManufactured) : null) : null,
        images: imageUrls, 
        seller_name: sellerName, 
        seller_logo: sellerLogo, 
        location: 'Lagos, Nigeria',
      };

      console.log("💾 Inserting into database with payload:", payload);

      const { data: insertData, error } = await supabase.from('products').insert([payload]).select();

      if (error) {
          console.error("❌ Database Insert Error:", error);
          throw error;
      }
      
      console.log("✅ Successfully inserted:", insertData);
      setMessage('✅ Service published successfully!');
      setName(''); setPrice(''); setDescription(''); setModelNo(''); setYearManufactured('');
      setSelectedFiles([]); setPreviewUrls([]); setShowForm(false);
      
      await fetchMyListings(); 
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error("Publish Error:", error);
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

  // 🔒 HARD UI BLOCK: If checking OR not verified, show NOTHING but the loader.
  if (isChecking || !isVerified) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#ccff00] mx-auto mb-4" size={48} />
          <p className="font-bold text-lg">Verifying TPwecan Membership...</p>
          <p className="text-sm text-slate-400 mt-2">Only verified members can access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>Provider Dashboard — TPMarket</title></Head>

      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">Provider Dashboard</h1>
        <p className="text-slate-400 text-sm">Manage your services, quotations, and track your growth.</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* PROFILE PHOTO & STATS */}
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
          {profileMessage && <p className="text-xs text-[#ccff00] font-bold">{profileMessage}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
            <Package className="text-[#ccff00] mb-2" size={24} />
            <p className="text-2xl font-black">{myListings.length}</p>
            <p className="text-xs text-slate-400">Active Services</p>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
            <MessageSquare className="text-[#ccff00] mb-2" size={24} />
            <p className="text-2xl font-black">{requests.filter((r: any) => r.status === 'pending' || r.status === 'negotiating').length}</p>
            <p className="text-xs text-slate-400">Pending Actions</p>
          </div>
        </div>

        {/* PUBLISH FORM */}
        {isVerified && (
          !showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20">
              <Plus size={20} /> Publish New Service
            </button>
          ) : (
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#ccff00]/30 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Add New Service/Product</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">Cancel</button>
              </div>
              {message && <div className={`p-3 rounded-xl mb-4 text-center font-bold text-sm ${message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message}</div>}
              <form onSubmit={handlePublish} className="space-y-4">
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. iPhone 15 Pro or AC Repair)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price in Naira" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none h-24" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                    <option>Mechanics</option><option>Tailors & Fashion</option><option>Electricians</option><option>Home Services</option><option>Car Spare Parts</option><option>Electronics</option>
                  </select>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                    <option value="Book">Book a Service</option><option value="Buy">Sell a Product</option>
                  </select>
                </div>
                
                {/* Image Upload Preview */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-white/10" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition-colors">
                  <p className="text-sm text-slate-300 font-bold">📸 Click to Upload Images ({previewUrls.length}/8)</p>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Publishing...</> : 'Publish to Marketplace'}
                </button>
              </form>
            </div>
          )
        )}

        {/* INCOMING REQUESTS SECTION */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#ccff00]" /> Incoming Requests & Quotations
          </h2>
          
          {requests.length === 0 ? (
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 text-center">
              <p className="text-slate-400">No new requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req: any) => (
                <div key={req.id} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">{req.customer_name || 'Customer'}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">📍 {req.customer_location || 'Location not specified'}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                      req.status === 'quoted' ? 'bg-blue-500/20 text-blue-400' : 
                      req.status === 'negotiating' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {req.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  
                  <div className="bg-[#0F172A] p-3 rounded-lg border border-white/5 mb-4">
                    <p className="text-white text-sm italic">"{req.description}"</p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedRequest(req); setShowQuoteModal(true); }} className="flex-1 bg-[#ccff00] text-[#0F172A] text-xs font-bold py-2.5 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-1">
                        Send Quotation
                      </button>
                      <button onClick={() => handleDecline(req.id)} className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-2.5 rounded-xl hover:bg-red-500/30 transition-all">
                        Decline
                      </button>
                    </div>
                  )}

                  {req.status === 'quoted' && (
                    <div className="text-center text-sm text-slate-400 bg-[#0F172A] p-3 rounded-lg border border-blue-500/20">
                      ✅ Quotation sent. Waiting for customer to accept or negotiate.
                    </div>
                  )}

                  {req.status === 'negotiating' && (
                    <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                      <p className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
                        🔄 Customer Counter-Offer Received
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptCounterOffer(req.id)} className="flex-1 bg-[#ccff00] text-[#0F172A] text-xs font-bold py-2.5 rounded-xl hover:scale-[1.02] transition-all">
                          Accept Counter-Offer
                        </button>
                        <button onClick={() => handleDecline(req.id)} className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-2.5 rounded-xl hover:bg-red-500/30 transition-all">
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY ACTIVE SERVICES */}
        {isVerified && myListings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-[#ccff00]" /> My Active Services</h2>
            <div className="space-y-3">
              {myListings.map((item: any) => (
                <div key={item.id} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 flex gap-4 items-center">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center"><ImageIcon className="text-slate-500" size={24} /></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.category} • {item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#ccff00]">₦{item.price?.toLocaleString()}</p>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUOTATION MODAL */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] w-full max-w-md rounded-3xl p-6 border border-[#ccff00]/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white">Send Quotation</h2>
              <button onClick={() => { setShowQuoteModal(false); setSelectedRequest(null); }}><X className="text-slate-400 hover:text-white" /></button>
            </div>
            <div className="bg-[#0F172A] p-3 rounded-xl mb-4 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Customer</p>
              <p className="font-bold text-white">{selectedRequest.customer_name || 'Unknown'}</p>
              <p className="text-xs text-[#ccff00]">📍 {selectedRequest.customer_location || 'Nigeria'}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Total Project Amount (₦)</label>
                <input type="number" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="e.g. 50000" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Job Duration (Days)</label>
                <input type="number" value={quoteDuration} onChange={(e) => setQuoteDuration(e.target.value)} placeholder="e.g. 3" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              </div>
              <button onClick={submitQuotation} disabled={quoteLoading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                {quoteLoading ? 'Sending...' : 'Submit Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}