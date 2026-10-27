import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Shield, Plus, MessageCircle, ChevronDown, ChevronUp, Lock, Briefcase, Wallet, Upload, X, Image as ImageIcon, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';

export default function UnifiedDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isWecanCertified, setIsWecanCertified] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  
  // Accordion State
  const [openSection, setOpenSection] = useState('publish'); 

  // Full Publish Form States
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('Mechanics');
  const [pType, setPType] = useState('Book'); 
  const [pDesc, setPDesc] = useState('');
  const [pCondition, setPCondition] = useState('New');
  const [pModelNo, setPModelNo] = useState('');
  const [pYear, setPYear] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        const { data: profile } = await supabase.from('profiles').select('wecan_certified, role').eq('id', user.id).single();
        const isCertified = profile?.wecan_certified === true || user.user_metadata?.role === 'provider';
        setIsWecanCertified(isCertified);

        const { data: custRequests } = await supabase.from('quote_requests').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
        if (custRequests) setRequests(custRequests);

        if (isCertified) {
          const { data: listings } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
          if (listings) setMyListings(listings);
        }
      }
    }
    loadData();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

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
    if (!isWecanCertified) return alert("You must be TP WECAN certified to publish.");
    
    setPublishLoading(true);
    setPublishMessage('');

    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${user.id}/${Date.now()}_${i}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase.from('products').insert([{
        seller_id: user.id, 
        name: pName, 
        price: parseFloat(pPrice), 
        category: pCategory, 
        type: pType,
        description: pDesc,
        condition: pType === 'Buy' ? pCondition : null,
        model_no: pType === 'Buy' ? pModelNo : null,
        year_manufactured: pType === 'Buy' ? (pYear ? parseInt(pYear) : null) : null,
        images: imageUrls,
        seller_name: user.user_metadata?.full_name || user.email, 
        location: 'Lagos, Nigeria'
      }]);

      if (error) throw error;

      setPublishMessage('✅ Service Published Successfully!');
      setPName(''); setPPrice(''); setPDesc(''); setPModelNo(''); setPYear('');
      setSelectedFiles([]); setPreviewUrls([]);
      setShowPublishForm(false);
      
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id);
      if (data) setMyListings(data);
      setTimeout(() => setPublishMessage(''), 3000);
    } catch (error: any) {
      setPublishMessage('❌ Error: ' + error.message);
    } finally {
      setPublishLoading(false);
    }
  }

  const SectionHeader = ({ id, title, icon: Icon }: any) => (
    <button 
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
        openSection === id 
          ? 'bg-[#1E293B] border-[#ccff00]' 
          : 'bg-[#1E293B] border-white/10 hover:border-white/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          openSection === id ? 'bg-[#ccff00] text-[#0F172A]' : 'bg-[#0F172A] text-[#ccff00]'
        }`}>
          <Icon size={20} />
        </div>
        <h3 className="text-white font-black text-base">{title}</h3>
      </div>
      {openSection === id ? <ChevronUp className="text-[#ccff00]" /> : <ChevronDown className="text-slate-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>My Dashboard — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-[#1E293B] border-b border-[#ccff00]/30 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-black text-white">Welcome, {user?.user_metadata?.full_name || user?.email || 'User'}</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your requests, equipment, and business.</p>
          {isWecanCertified && (
            <div className="mt-3 inline-flex items-center gap-2 bg-[#ccff00] text-[#0F172A] text-xs font-black px-4 py-1.5 rounded-full">
              <Shield size={14} /> Certified TP WECAN Provider
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        
        {/* SECTION 1: PUBLISH A SERVICE (Moved to top for Providers) */}
        <SectionHeader id="publish" title="Publish a Service / Provider Hub" icon={Briefcase} />
        {openSection === 'publish' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4">
            {!isWecanCertified ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-white" size={32} />
                </div>
                <h3 className="text-white font-black text-xl mb-2">TP WECAN Certification Required</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                  To maintain trust and quality on TP Market, only certified TP WECAN cooperative members can publish jobs and sell services.
                </p>
                <button className="bg-red-500 text-white font-black py-3 px-8 rounded-xl hover:bg-red-600 transition-all">
                  Register with TP WECAN Cooperative
                </button>
              </div>
            ) : (
              <div>
                {publishMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-center font-bold text-sm ${publishMessage.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {publishMessage}
                  </div>
                )}

                {!showPublishForm ? (
                  <button onClick={() => setShowPublishForm(true)} className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all">
                    <Plus size={20} /> Publish New Service/Product
                  </button>
                ) : (
                  <form onSubmit={handlePublish} className="space-y-4">
                    <input required value={pName} onChange={e => setPName(e.target.value)} placeholder="Name (e.g. iPhone 15 Pro or AC Repair)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#ccff00] focus:outline-none" />
                    <input required type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="Price in Naira" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#ccff00] focus:outline-none" />
                    <textarea required value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Description..." className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-slate-500 focus:border-[#ccff00] focus:outline-none h-24" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                        <option>Mechanics</option><option>Tailors & Fashion</option><option>Electricians</option><option>Home Services</option><option>Car Spare Parts</option><option>Electronics</option>
                      </select>
                      <select value={pType} onChange={(e) => setPType(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                        <option value="Book">Book a Service</option>
                        <option value="Buy">Sell a Product</option>
                      </select>
                    </div>

                    {pType === 'Buy' && (
                      <div className="bg-[#0F172A] p-4 rounded-xl border border-[#ccff00]/30 space-y-4">
                        <h3 className="text-sm font-bold text-[#ccff00] uppercase flex items-center gap-2"><Package size={16} /> Product Specific Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Condition</label>
                            <select value={pCondition} onChange={(e) => setPCondition(e.target.value)} className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                              <option value="New">Brand New</option><option value="Used">Used</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Year Manufactured</label>
                            <input type="number" value={pYear} onChange={(e) => setPYear(e.target.value)} placeholder="e.g. 2023" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">Model Number / Name</label>
                          <input type="text" value={pModelNo} onChange={(e) => setPModelNo(e.target.value)} placeholder="e.g. A2848, Galaxy S24" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
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

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={publishLoading} className="flex-1 bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                        {publishLoading ? 'Publishing...' : 'Publish to Marketplace'}
                      </button>
                      <button type="button" onClick={() => setShowPublishForm(false)} className="flex-1 bg-[#0F172A] border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-all">Cancel</button>
                    </div>
                  </form>
                )}
                
                {myListings.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ccff00]"></div> My Active Listings ({myListings.length})
                    </h4>
                    <div className="space-y-2">
                      {myListings.map((item: any) => (
                        <div key={item.id} className="bg-[#0F172A] p-3 rounded-lg flex justify-between items-center border border-white/10 hover:border-[#ccff00]/30 transition-all">
                          <div className="flex items-center gap-3">
                            {item.images && item.images.length > 0 ? (
                              <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center"><ImageIcon className="text-slate-500" size={20} /></div>
                            )}
                            <div>
                              <p className="text-white font-bold text-sm">{item.name}</p>
                              <p className="text-slate-400 text-xs">{item.category} • {item.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#ccff00] font-black text-sm">₦{item.price?.toLocaleString()}</p>
                            <span className="text-[10px] bg-[#ccff00] text-[#0F172A] px-2 py-0.5 rounded-full font-black">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: MY REQUESTS */}
        <SectionHeader id="requests" title="My Requests & Quotations" icon={MessageCircle} />
        {openSection === 'requests' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4 space-y-4">
            {requests.length === 0 ? (
              <p className="text-slate-400 text-center py-4 text-sm">No active requests. <Link href="/marketplace" className="text-[#ccff00] font-bold underline">Browse Marketplace</Link></p>
            ) : (
              requests.map((req: any) => (
                <div key={req.id} className="bg-[#0F172A] p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-bold text-sm">{req.request_type === 'negotiate' ? '💰 Negotiation' : ' Quote Request'}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      req.status === 'quoted' ? 'bg-[#ccff00] text-[#0F172A]' : 'bg-yellow-500 text-[#0F172A]'
                    }`}>
                      {req.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mb-3 italic border-l-2 border-[#ccff00] pl-3">"{req.description}"</p>
                  {req.status === 'quoted' && (
                    <div className="bg-[#1E293B] p-3 rounded-lg border border-[#ccff00] flex justify-between items-center">
                      <div>
                        <p className="text-[#ccff00] font-black text-lg">₦{req.quoted_amount?.toLocaleString()}</p>
                        <p className="text-slate-400 text-[10px] font-bold">{req.job_duration_days} Days Duration</p>
                      </div>
                      <button className="bg-[#ccff00] text-[#0F172A] text-xs font-black px-4 py-2 rounded-lg hover:scale-105 transition-all">Accept</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* SECTION 3: MY EQUIPMENT */}
        <SectionHeader id="equipment" title="My Registered Equipment" icon={Shield} />
        {openSection === 'equipment' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4 text-center py-10">
            <Shield className="mx-auto text-[#ccff00] mb-4" size={48} />
            <p className="text-slate-400 mb-4 text-sm">Your equipment registration form goes here.</p>
            <button className="bg-[#ccff00] text-[#0F172A] font-bold px-6 py-2 rounded-full hover:scale-105 transition-all">Add Equipment</button>
          </div>
        )}

        {/* SECTION 4: WALLET & REFERRALS */}
        <SectionHeader id="wallet" title="Wallet, TP Coins & Referrals" icon={Wallet} />
        {openSection === 'wallet' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#0F172A] p-4 rounded-lg border border-white/10">
                <p className="text-slate-400 text-xs mb-1 font-bold">TP Coins</p>
                <p className="text-[#ccff00] font-black text-2xl">0</p>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-lg border border-white/10">
                <p className="text-slate-400 text-xs mb-1 font-bold">Wallet Balance</p>
                <p className="text-white font-black text-2xl">₦0.00</p>
              </div>
            </div>
            <div className="bg-[#0F172A] p-4 rounded-lg border border-[#ccff00]">
              <p className="text-[#ccff00] font-bold text-sm mb-2"> Referral Program</p>
              <p className="text-slate-400 text-xs">Invite friends and earn rewards!</p>
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}