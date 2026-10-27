import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Shield, Plus, MessageCircle, ChevronDown, ChevronUp, Lock, Briefcase, Wallet, Upload, X, Image as ImageIcon, Package, Clock, AlertTriangle, Wrench, Download, Check, Copy, Gift, FileText, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';

export default function UnifiedDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isWecanCertified, setIsWecanCertified] = useState(false);
  
  const [myRequests, setMyRequests] = useState<any[]>([]); 
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]); 
  const [myListings, setMyListings] = useState<any[]>([]);
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  
  // 90-Day Guarantee State
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [complaintFiled, setComplaintFiled] = useState(false);
  const GUARANTEE_DAYS = 90;
  const JOB_COMPLETION_DATE = '2026-09-03'; 

  // Accordion State
  const [openSection, setOpenSection] = useState('publish'); 

  // Publish Form States
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

  // NEW: Quotation Modal States (The Missing Form!)
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDuration, setQuoteDuration] = useState('');
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Equipment Form States
  const [eqType, setEqType] = useState('Gasoline Car Repair');
  const [eqStatus, setEqStatus] = useState('');
  const [eqModel, setEqModel] = useState('');
  const [eqSerial, setEqSerial] = useState('');
  const [eqYear, setEqYear] = useState('');

  // Wallet/Referral States
  const [copiedLink, setCopiedLink] = useState(false);
  const referralCode = user?.user_metadata?.full_name?.substring(0,3).toUpperCase() + '123' || 'USER123';

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from('profiles').select('wecan_certified, role').eq('id', user.id).single();
        const isCertified = profile?.wecan_certified === true || user.user_metadata?.role === 'provider';
        setIsWecanCertified(isCertified);

        const { data: custRequests } = await supabase.from('quote_requests').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
        if (custRequests) setMyRequests(custRequests);

        const { data: providerRequests } = await supabase.from('quote_requests').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
        if (providerRequests) setIncomingRequests(providerRequests);

        if (isCertified) {
          const { data: listings } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
          if (listings) setMyListings(listings);
        }
      }
    }
    loadData();

    const completed = new Date(JOB_COMPLETION_DATE).getTime();
    const elapsedDays = Math.floor((Date.now() - completed) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, GUARANTEE_DAYS - elapsedDays));
  }, []);

  const toggleSection = (section: string) => setOpenSection(openSection === section ? '' : section);

  // --- HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 8) { alert('Max 8 images.'); return; }
      setSelectedFiles([...selectedFiles, ...files]);
      setPreviewUrls([...previewUrls, ...files.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  // NEW: Submit Full Quotation with Amount, Duration, and Attachment
  async function submitQuotation() {
    if (!quoteAmount || !quoteDuration) return alert("Please enter both the Total Amount and Job Duration.");
    setQuoteLoading(true);

    let attachmentUrl = null;
    if (quoteFile) {
      const filePath = `quotations/${user.id}/${Date.now()}_${quoteFile.name}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, quoteFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        attachmentUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('quote_requests').update({ 
      status: 'quoted',
      quoted_amount: parseFloat(quoteAmount),
      job_duration_days: parseInt(quoteDuration),
      attachment_url: attachmentUrl,
      description: `${selectedReq.description}\n\n---\n[QUOTATION SENT: ₦${parseFloat(quoteAmount).toLocaleString()} | Duration: ${quoteDuration} Days]`
    }).eq('id', selectedReq.id);

    if (!error) {
      alert("✅ Quotation sent successfully!");
      setShowQuoteModal(false);
      setSelectedReq(null);
      setQuoteAmount(''); setQuoteDuration(''); setQuoteFile(null);
      const { data } = await supabase.from('quote_requests').select('*').eq('seller_id', user.id);
      if (data) setIncomingRequests(data);
    } else {
      alert("Error sending quotation: " + error.message);
    }
    setQuoteLoading(false);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setPublishLoading(true);
    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${user.id}/${Date.now()}_${i}_${file.name}`;
        await supabase.storage.from('product-images').upload(filePath, file);
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }
      await supabase.from('products').insert([{
        seller_id: user.id, name: pName, price: parseFloat(pPrice), category: pCategory, type: pType, description: pDesc,
        condition: pType === 'Buy' ? pCondition : null, model_no: pType === 'Buy' ? pModelNo : null,
        year_manufactured: pType === 'Buy' ? (pYear ? parseInt(pYear) : null) : null,
        images: imageUrls, seller_name: user.user_metadata?.full_name || user.email, location: 'Lagos, Nigeria'
      }]);
      setPublishMessage('✅ Published Successfully!');
      setPName(''); setPPrice(''); setPDesc(''); setSelectedFiles([]); setPreviewUrls([]); setShowPublishForm(false);
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id);
      if (data) setMyListings(data);
      setTimeout(() => setPublishMessage(''), 3000);
    } catch (error: any) { setPublishMessage('❌ Error: ' + error.message); } 
    finally { setPublishLoading(false); }
  }

  async function handleAcceptQuote(reqId: string) {
    await supabase.from('quote_requests').update({ status: 'accepted_by_customer' }).eq('id', reqId);
    alert('✅ Quote accepted! Proceeding to payment...');
    const { data } = await supabase.from('quote_requests').select('*').eq('customer_id', user.id);
    if (data) setMyRequests(data);
  }

  async function handleNegotiateQuote(reqId: string) {
    const counterOffer = prompt('Enter your counter-offer amount (₦):');
    if (!counterOffer) return;
    await supabase.from('quote_requests').update({ status: 'negotiating', description: `Counter-Offer: ₦${parseFloat(counterOffer).toLocaleString()}` }).eq('id', reqId);
    alert('✅ Counter-offer sent!');
    const { data } = await supabase.from('quote_requests').select('*').eq('customer_id', user.id);
    if (data) setMyRequests(data);
  }

  async function handleDeclineRequest(reqId: string) {
    if(!confirm("Decline this request?")) return;
    await supabase.from('quote_requests').update({ status: 'declined' }).eq('id', reqId);
    const { data } = await supabase.from('quote_requests').select('*').eq('seller_id', user.id);
    if (data) setIncomingRequests(data);
  }

  function handleSaveEquipment() {
    if (!eqStatus.trim()) return alert('Please enter status');
    const newEq = { id: Date.now().toString(), type: eqType, model: eqModel, serial: eqSerial, year: eqYear, status: eqStatus, savedAt: new Date().toISOString() };
    setEquipmentList([...equipmentList, newEq]);
    setEqModel(''); setEqSerial(''); setEqYear(''); setEqStatus('');
    alert('✅ Equipment Registered!');
  }

  function handleCopyReferral() {
    navigator.clipboard?.writeText(`https://tpmarket.ng/ref/${referralCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const SectionHeader = ({ id, title, icon: Icon, count }: any) => (
    <button onClick={() => toggleSection(id)} className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${openSection === id ? 'bg-[#1E293B] border-[#ccff00]' : 'bg-[#1E293B] border-white/10 hover:border-white/30'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${openSection === id ? 'bg-[#ccff00] text-[#0F172A]' : 'bg-[#0F172A] text-[#ccff00]'}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-white font-black text-base">{title}</h3>
        {count > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{count}</span>}
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
        
        {/* FEATURE #7: 90-DAY GUARANTEE CARD */}
        <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10">
          <h2 className="text-white font-black text-lg mb-4 flex items-center gap-2"><Wrench className="text-[#ccff00]" size={20} /> Active Jobs & 90-Day Guarantee</h2>
          <div className="bg-[#0F172A] rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center"><Wrench size={18} /></div>
              <div>
                <p className="text-white font-bold text-sm">Car Engine Repair</p>
                <p className="text-slate-400 text-xs">by Tunde Bakare</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-lg p-3 mb-4 ${daysLeft && daysLeft > 0 ? 'bg-[#ccff00]/10 border border-[#ccff00]/30' : 'bg-white/5 border border-white/10'}`}>
              {daysLeft && daysLeft > 0 ? <Clock className="text-[#ccff00]" size={20} /> : <AlertTriangle className="text-slate-400" size={20} />}
              <div>
                <p className={`font-black text-sm ${daysLeft && daysLeft > 0 ? 'text-[#ccff00]' : 'text-slate-400'}`}>{daysLeft === null ? '—' : daysLeft > 0 ? `${daysLeft} Days Left` : 'Guarantee Expired'}</p>
                <p className="text-slate-400 text-xs">90-Day Repair Guarantee</p>
              </div>
            </div>
            {complaintFiled ? (
              <p className="text-center text-sm text-[#ccff00] font-bold py-2">✅ Complaint filed! Team will reach out in 24h.</p>
            ) : daysLeft && daysLeft > 0 ? (
              <button onClick={() => setComplaintFiled(true)} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-lg hover:scale-[1.02] transition-all">File a Complaint</button>
            ) : (
              <button disabled className="w-full bg-white/10 text-slate-400 font-black py-3 rounded-lg cursor-not-allowed">Warranty Expired</button>
            )}
          </div>
        </div>

        {/* SECTION 1: PROVIDER HUB */}
        <SectionHeader id="publish" title="Provider Hub & Incoming Requests" icon={Briefcase} count={incomingRequests.filter(r => r.status === 'pending').length} />
        {openSection === 'publish' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4">
            {!isWecanCertified ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4"><Lock className="text-white" size={32} /></div>
                <h3 className="text-white font-black text-xl mb-2">TP WECAN Certification Required</h3>
                <p className="text-slate-400 text-sm mb-6">Only certified members can publish jobs.</p>
                <button className="bg-red-500 text-white font-black py-3 px-8 rounded-xl">Register with TP WECAN</button>
              </div>
            ) : (
              <div className="space-y-6">
                {incomingRequests.length > 0 && (
                  <div>
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><MessageCircle className="text-[#ccff00]" size={16} /> Incoming Requests ({incomingRequests.length})</h4>
                    <div className="space-y-3">
                      {incomingRequests.map((req: any) => (
                        <div key={req.id} className="bg-[#0F172A] p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start mb-2">
                            <div><p className="text-white font-bold text-sm">{req.customer_name || 'Customer'}</p><p className="text-slate-400 text-[10px]">📍 {req.customer_location}</p></div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${req.status === 'pending' ? 'bg-yellow-500 text-[#0F172A]' : req.status === 'quoted' ? 'bg-[#ccff00] text-[#0F172A]' : 'bg-slate-500 text-white'}`}>{req.status?.toUpperCase()}</span>
                          </div>
                          <p className="text-slate-300 text-xs mb-3 italic border-l-2 border-[#ccff00] pl-3">"{req.description}"</p>
                          
                          {req.sample_images && req.sample_images.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sample Images Provided:</p>
                              <div className="grid grid-cols-3 gap-2">
                                {req.sample_images.map((img: string, idx: number) => (
                                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden border border-[#ccff00]/30 hover:border-[#ccff00] transition-all">
                                    <img src={img} alt="Sample" className="w-full h-full object-cover" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              {/* FIXED: This now opens the Quotation Modal instead of instantly sending */}
                              <button onClick={() => { setSelectedReq(req); setShowQuoteModal(true); }} className="flex-1 bg-[#ccff00] text-[#0F172A] text-xs font-black py-2 rounded-lg">Send Quotation</button>
                              <button onClick={() => handleDeclineRequest(req.id)} className="flex-1 bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-lg">Decline</button>
                            </div>
                          )}
                          {req.status === 'quoted' && <p className="text-center text-xs text-[#ccff00] font-bold bg-[#ccff00]/10 py-2 rounded-lg">✅ Quote Sent. Waiting for customer.</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-6">
                  {publishMessage && <div className={`p-3 rounded-lg mb-4 text-center font-bold text-sm ${publishMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{publishMessage}</div>}
                  {!showPublishForm ? (
                    <button onClick={() => setShowPublishForm(true)} className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all"><Plus size={20} /> Publish New Service/Product</button>
                  ) : (
                    <form onSubmit={handlePublish} className="space-y-4">
                      <input required value={pName} onChange={e => setPName(e.target.value)} placeholder="Name" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                      <input required type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="Price (₦)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                      <textarea required value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Description" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none h-24" />
                      <div className="grid grid-cols-2 gap-4">
                        <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                          <option>Mechanics</option><option>Tailors & Fashion</option><option>Electricians</option><option>Home Services</option><option>Car Spare Parts</option><option>Electronics</option>
                        </select>
                        <select value={pType} onChange={(e) => setPType(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                          <option value="Book">Book a Service</option><option value="Buy">Sell a Product</option>
                        </select>
                      </div>
                      {pType === 'Buy' && (
                        <div className="bg-[#0F172A] p-4 rounded-xl border border-[#ccff00]/30 space-y-4">
                          <h3 className="text-sm font-bold text-[#ccff00] uppercase flex items-center gap-2"><Package size={16} /> Product Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <select value={pCondition} onChange={(e) => setPCondition(e.target.value)} className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                              <option value="New">Brand New</option><option value="Used">Used</option>
                            </select>
                            <input type="number" value={pYear} onChange={(e) => setPYear(e.target.value)} placeholder="Year" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                          </div>
                          <input type="text" value={pModelNo} onChange={(e) => setPModelNo(e.target.value)} placeholder="Model Number" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                        </div>
                      )}
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#ccff00]/50 transition-all bg-[#0F172A]">
                        <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-sm text-slate-400">Click to upload images (Max 8)</p>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                      </div>
                      {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                              <img src={url} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={publishLoading} className="flex-1 bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl disabled:opacity-50">{publishLoading ? 'Publishing...' : 'Publish'}</button>
                        <button type="button" onClick={() => setShowPublishForm(false)} className="flex-1 bg-[#0F172A] border border-white/10 text-white font-bold py-3 rounded-xl">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
                {myListings.length > 0 && (
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ccff00]"></div> My Active Listings ({myListings.length})</h4>
                    <div className="space-y-2">
                      {myListings.map((item: any) => (
                        <div key={item.id} className="bg-[#0F172A] p-3 rounded-lg flex justify-between items-center border border-white/10">
                          <div className="flex items-center gap-3">
                            {item.images?.[0] ? <img src={item.images[0]} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center"><ImageIcon className="text-slate-500" size={20} /></div>}
                            <div><p className="text-white font-bold text-sm">{item.name}</p><p className="text-slate-400 text-xs">{item.category} • {item.type}</p></div>
                          </div>
                          <div className="text-right"><p className="text-[#ccff00] font-black text-sm">₦{item.price?.toLocaleString()}</p><span className="text-[10px] bg-[#ccff00] text-[#0F172A] px-2 py-0.5 rounded-full font-black">Active</span></div>
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
        <SectionHeader id="requests" title="My Requests & Quotations" icon={MessageCircle} count={myRequests.filter(r => r.status === 'quoted').length} />
        {openSection === 'requests' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4 space-y-4">
            {myRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-4 text-sm">No active requests. <Link href="/marketplace" className="text-[#ccff00] font-bold underline">Browse Marketplace</Link></p>
            ) : (
              myRequests.map((req: any) => (
                <div key={req.id} className="bg-[#0F172A] p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-bold text-sm">{req.request_type === 'negotiate' ? '💰 Negotiation' : '📋 Quote Request'}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${req.status === 'quoted' ? 'bg-[#ccff00] text-[#0F172A]' : req.status === 'negotiating' ? 'bg-purple-500 text-white' : 'bg-yellow-500 text-[#0F172A]'}`}>{req.status?.toUpperCase()}</span>
                  </div>
                  <p className="text-slate-300 text-xs mb-3 italic border-l-2 border-[#ccff00] pl-3">"{req.description}"</p>
                  
                  {req.sample_images && req.sample_images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Your Sample Images:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {req.sample_images.map((img: string, idx: number) => (
                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#ccff00] transition-all">
                            <img src={img} alt="Sample" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.status === 'quoted' && (
                    <div className="bg-[#1E293B] p-3 rounded-lg border border-[#ccff00] space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[#ccff00] font-black text-lg">₦{req.quoted_amount?.toLocaleString()}</p>
                          <p className="text-slate-400 text-[10px] font-bold">{req.job_duration_days} Days Duration</p>
                        </div>
                        {req.attachment_url && <a href={req.attachment_url} target="_blank" className="text-[#ccff00] text-xs flex items-center gap-1 hover:underline"><Download size={12} /> View Doc</a>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptQuote(req.id)} className="flex-1 bg-[#ccff00] text-[#0F172A] text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1"><Check size={14} /> Accept Quote</button>
                        <button onClick={() => handleNegotiateQuote(req.id)} className="flex-1 bg-white/5 border border-white/10 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"><MessageCircle size={14} /> Negotiate</button>
                      </div>
                    </div>
                  )}
                  {req.status === 'negotiating' && <p className="text-center text-xs text-purple-400 font-bold bg-purple-500/10 py-2 rounded-lg">⏳ Counter-offer sent. Waiting for provider.</p>}
                  {req.status === 'accepted_by_customer' && <p className="text-center text-xs text-green-400 font-bold bg-green-500/10 py-2 rounded-lg">✅ Accepted! Proceeding to payment.</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* SECTION 3: EQUIPMENT */}
        <SectionHeader id="equipment" title="My Registered Equipment" icon={Shield} count={equipmentList.length} />
        {openSection === 'equipment' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs font-bold mb-1 block">Equipment Type</label>
                <select value={eqType} onChange={(e) => setEqType(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-[#ccff00] focus:outline-none">
                  <option>Gasoline Car Repair</option><option>Phone</option><option>AC (Air Conditioner)</option><option>Generator</option><option>Solar Equipment</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold mb-1 block">Year</label>
                <input type="number" value={eqYear} onChange={(e) => setEqYear(e.target.value)} placeholder="e.g. 2020" className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-[#ccff00] focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold mb-1 block">Model</label>
                <input type="text" value={eqModel} onChange={(e) => setEqModel(e.target.value)} placeholder="e.g. Camry" className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-[#ccff00] focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold mb-1 block">Serial/IMEI</label>
                <input type="text" value={eqSerial} onChange={(e) => setEqSerial(e.target.value)} placeholder="e.g. 123456" className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-[#ccff00] focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-xs font-bold mb-1 block">Current Status / Condition</label>
                <textarea value={eqStatus} onChange={(e) => setEqStatus(e.target.value)} placeholder="Describe current condition..." className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-[#ccff00] focus:outline-none h-20 resize-none" />
              </div>
            </div>
            <button onClick={handleSaveEquipment} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-lg hover:scale-[1.02] transition-all">Save Equipment</button>
            
            {equipmentList.length > 0 && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-white font-bold text-sm mb-3">Registered Items ({equipmentList.length})</h4>
                <div className="space-y-2">
                  {equipmentList.map((eq: any) => (
                    <div key={eq.id} className="bg-[#0F172A] p-3 rounded-lg flex justify-between items-center border border-white/10">
                      <div><p className="text-white font-bold text-sm">{eq.type}</p><p className="text-slate-400 text-xs">{eq.model} • {eq.year}</p></div>
                      <span className="text-[10px] bg-[#ccff00]/20 text-[#ccff00] px-2 py-1 rounded-full font-bold">Saved</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: WALLET & REFERRALS */}
        <SectionHeader id="wallet" title="Wallet, TP Coins & Referrals" icon={Wallet} />
        {openSection === 'wallet' && (
          <div className="bg-[#1E293B] rounded-lg p-5 border border-white/10 mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2 mb-3">
                <Gift className="text-[#ccff00]" size={20} />
                <h3 className="text-white font-black text-sm">Invite Friends & Earn</h3>
              </div>
              <div className="bg-[#1E293B] border border-[#ccff00]/30 rounded-lg py-4 text-center mb-4">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Your Referral Code</p>
                <p className="text-[#ccff00] font-black text-2xl tracking-wide">{referralCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleCopyReferral} className="flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-2.5 rounded-lg text-sm hover:scale-[1.02] transition-all">
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />} {copiedLink ? 'Copied!' : 'Copy Code'}
                </button>
                <a href={`https://wa.me/?text=Join me on TPMarket! Use code ${referralCode}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-2.5 rounded-lg text-sm hover:scale-[1.02] transition-all">
                  Share WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* NEW: PROFESSIONAL QUOTATION MODAL FOR PROVIDERS */}
      {showQuoteModal && selectedReq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] w-full max-w-md rounded-xl border border-[#ccff00]/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-lg font-black text-white">Send Quotation</h2>
              <button onClick={() => { setShowQuoteModal(false); setSelectedReq(null); }}><X className="text-slate-400 hover:text-white" /></button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-[#0F172A] p-3 rounded-lg border border-white/10">
                <p className="text-xs text-slate-400 mb-1">Customer</p>
                <p className="font-bold text-white">{selectedReq.customer_name || 'Unknown'}</p>
                <p className="text-xs text-[#ccff00]">📍 {selectedReq.customer_location || 'Nigeria'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block flex items-center gap-1"><DollarSign size={14} /> Total Project Amount (₦)</label>
                <input type="number" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="e.g. 50000" className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block flex items-center gap-1"><Calendar size={14} /> Job Duration (Days)</label>
                <input type="number" value={quoteDuration} onChange={(e) => setQuoteDuration(e.target.value)} placeholder="e.g. 3" className="w-full bg-[#0F172A] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block flex items-center gap-1"><FileText size={14} /> Attach Quotation (PDF/Word)</label>
                <label className="w-full bg-[#0F172A] border border-dashed border-white/20 rounded-lg py-4 px-4 text-center cursor-pointer hover:border-[#ccff00]/50 transition-all block">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setQuoteFile(e.target.files?.[0] || null)} className="hidden" />
                  {quoteFile ? <p className="text-[#ccff00] font-bold text-sm">{quoteFile.name}</p> : <p className="text-sm text-slate-400">Click to upload document</p>}
                </label>
              </div>

              <button onClick={submitQuotation} disabled={quoteLoading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3.5 rounded-lg hover:scale-[1.02] transition-all disabled:opacity-50">
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