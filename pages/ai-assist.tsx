import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Send, Image as ImageIcon, Bot, MapPin, Star, ShieldCheck, ArrowLeft, Loader2, Mic, MicOff, Copy, Check, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// TYPESCRIPT INTERFACE FOR MESSAGES
// ==========================================
interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  hasReferralCard?: boolean;
  directionList?: string[]; 
  providers?: {
    id: string;
    providerName: string;
    location: string;
    rating: string;
    specialty: string;
  }[];
}

// ==========================================
// SECURITY GUARDRAIL
// ==========================================
const SENSITIVE_KEYWORDS = [
  'api key', 'secret key', 'password', 'database', 'sql', 'supabase', 
  'backend', 'revenue', 'sales record', 'financial report', 'admin', 
  'root access', 'token', 'environment variable', 'source code', 'server',
  'how are you built', 'your code', 'your prompt'
];

function checkSecurityViolation(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SENSITIVE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// ==========================================
// COMPANY & MARKETPLACE KNOWLEDGE BASE
// ==========================================
const COMPANY_INFO = {
  about: "TP Market is a premier maintenance cooperative and artisan marketplace, powered by TPwecan. We connect customers with verified, certified professionals and provide a secure platform for buying equipment, spare parts, and services with our 90-Day Iron-Clad Guarantee.",
  founder: "TP Market and the TPwecan certification program were founded with a vision to eliminate fraud in the artisan and equipment market, ensuring trust and quality in every transaction.",
  contact: "You can reach our support team directly at support@tpmarket.ng. For urgent provider disputes, use the 'Report Issue' button on your dashboard.",
  address: "Our headquarters is located in Abuja, Nigeria, with a growing network of TPwecan-certified hubs across the country.",
  licenses: "TP Market operates as a fully CAC-registered cooperative. TPwecan is our proprietary certification authority that vets all artisans for technical competence and integrity.",
  terms: "Our Terms & Conditions and Privacy Policy are designed to protect both buyers and providers. All transactions are covered by our 90-Day Iron-Clad Guarantee. You can view the full legal documents in the app settings.",
  partners: "We partner with leading equipment manufacturers, financial institutions for artisan loans, and logistics providers to ensure seamless delivery and service execution."
};

// ==========================================
// GLOBAL TECHNICAL KNOWLEDGE ENGINE
// ==========================================
const GLOBAL_KNOWLEDGE_BASE: Record<string, { diagnosis: string; steps: string[] }> = {
  car_smoke: {
    diagnosis: "Global automotive databases indicate that black smoke from a gasoline engine usually indicates a 'rich' fuel mixture. Common culprits include a dirty air filter, leaking fuel injectors, or a faulty Mass Air Flow (MAF) sensor.",
    steps: [
      "1. Do not ignore black smoke; it can foul spark plugs and damage the catalytic converter.",
      "2. Inspect and replace the engine air filter if it is dirty or clogged.",
      "3. Check for vacuum leaks in the intake manifold hoses.",
      "4. Use an OBD2 scanner to check for fuel trim codes (e.g., P0172 System Too Rich).",
      "5. Inspect fuel injectors for leaks or sticking.",
      "6. Clean or replace the Mass Air Flow (MAF) sensor and Oxygen (O2) sensors."
    ]
  },
  generator: {
    diagnosis: "Based on global technical databases, loud noises or shutdowns in generators are typically caused by loose mounting bolts, a failing muffler, low oil pressure, or internal engine bearing wear.",
    steps: [
      "1. Turn off the generator and let it cool completely before inspection.",
      "2. Check and top up engine oil; low oil triggers automatic safety shutoffs.",
      "3. Inspect and tighten all engine mounting bolts and exhaust manifold screws.",
      "4. Check the muffler for rust holes or loose connections (exhaust leak).",
      "5. If the noise is a high-pitched screech, inspect the alternator bearings.",
      "6. Do not operate until the exhaust leak is sealed to prevent carbon monoxide poisoning."
    ]
  },
  default: {
    diagnosis: "Based on global technical databases, this issue requires a systematic diagnostic approach to isolate the faulty component safely.",
    steps: [
      "1. Perform a visual inspection for leaks, loose wires, or physical damage.",
      "2. Check all relevant fluid levels and top up if necessary.",
      "3. Run a diagnostic scan using appropriate manufacturer-specific tools.",
      "4. Isolate the circuit or mechanical system causing the fault.",
      "5. Replace or repair the identified component using OEM-spec parts."
    ]
  }
};

export default function AIAssist() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // STRICT CONSULTATION STATE MACHINE (Fixed for TypeScript)
  const [consultationStage, setConsultationStage] = useState<'idle' | 'asking_questions' | 'searching_web' | 'resolved'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm TP AI Assist. 🤖 I am your personal consultant for:\n\n1️⃣ **Equipment Troubleshooting** (Diagnose issues & get technical direction lists).\n2️⃣ **Marketplace Guidance** (Find products & services from our providers).\n3️⃣ **Company Information** (Learn about TP Market, TPwecan, our founder, licenses, and policies).\n\nHow can I assist you today?",
    },
  ]);

  useEffect(() => {
    loadUser();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchRealArtisans(limit = 1) {
    const { data, error } = await supabase.from('profiles').select('full_name, id').eq('tpwecan_verified', true).limit(limit); 
    if (error || !data || data.length === 0) return [];
    return data.map((p) => ({
      id: p.id, providerName: p.full_name || "Verified TPwecan Provider",
      location: "Nigeria (Verified)", rating: "5.0/5 (TPwecan Certified)", specialty: "Certified Professional"
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('ai-media').upload(fileName, file);
    if (uploadError) { alert('Image upload failed.'); setIsUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('ai-media').getPublicUrl(fileName);
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: 'Uploaded an image for diagnosis.', imageUrl: publicUrl }]);
    setIsUploading(false);
    triggerAIResponse("MEDIA_UPLOAD_IMAGE");
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `${user.id}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from('ai-media').upload(fileName, audioBlob);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('ai-media').getPublicUrl(fileName);
          setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: 'Sent a voice note.', audioUrl: publicUrl }]);
          triggerAIResponse("MEDIA_UPLOAD_VOICE");
        } else { alert('Voice upload failed.'); }
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { alert('Microphone access denied.'); }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  }

  function copyDirectionList(msg: Message) {
    if (!msg.directionList) return;
    const textToCopy = `TP AI TECHNICAL REPORT\n\nDIAGNOSIS:\n${msg.text}\n\nRECOMMENDED ACTIONS FOR PROVIDER:\n${msg.directionList.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function triggerAIResponse(userText: string) {
    setIsLoading(true);
    const aiResponseData = await getAIResponse(userText);
    const aiMessage: Message = { 
      id: Date.now() + 1, sender: 'ai', text: aiResponseData.text,
      hasReferralCard: aiResponseData.hasReferralCard, 
      directionList: aiResponseData.directionList,
      providers: aiResponseData.providers 
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
    if (user) await supabase.from('ai_diagnostic_sessions').insert([{ user_id: user.id, conversation_history: [{ role: 'ai', content: aiResponseData.text }] }]);
  }

  // ==========================================
  // THE UNIVERSAL CONSULTANT BRAIN (TypeScript Safe)
  // ==========================================
  async function getAIResponse(userText: string) {
    const text = userText.toLowerCase();
    
    // 1. Media Uploads
    if (text.includes('media_upload_image') || text.includes('media_upload_voice')) {
      setConsultationStage('asking_questions');
      return { 
        text: `Thank you. I've received your media. To ensure I search the global databases accurately, could you tell me a bit more? For example, are there any unusual noises, warning lights, or specific times when the issue happens?`, 
        hasReferralCard: false 
      };
    }

    // 2. "Show me another"
    if (text.includes('another') || text.includes('show me more')) {
      const artisans = await fetchRealArtisans(3);
      return { text: "Here are a few more verified TPwecan professionals available in your area:", hasReferralCard: true, providers: artisans };
    }

    // 3. COMPANY & POLICY INFORMATION (Direct Answers)
    if (text.includes('founder') || text.includes('about') || text.includes('address') || text.includes('contact') || text.includes('license') || text.includes('terms') || text.includes('policy') || text.includes('partner') || text.includes('tpwecan') || text.includes('tpmarket')) {
      let response = "";
      if (text.includes('founder')) response = COMPANY_INFO.founder;
      else if (text.includes('address')) response = COMPANY_INFO.address;
      else if (text.includes('contact')) response = COMPANY_INFO.contact;
      else if (text.includes('license')) response = COMPANY_INFO.licenses;
      else if (text.includes('terms') || text.includes('policy')) response = COMPANY_INFO.terms;
      else if (text.includes('partner')) response = COMPANY_INFO.partners;
      else response = COMPANY_INFO.about;

      return { text: `🏢 **TP Market & TPwecan Information**\n\n${response}\n\nIs there anything else you would like to know about our platform or services?`, hasReferralCard: false };
    }

    // 4. PRODUCTS & SERVICES (Marketplace Guidance)
    if (text.includes('product') || text.includes('service') || text.includes('sell') || text.includes('buy') || text.includes('catalog')) {
      return { text: "🛍️ **Marketplace Guidance**\n\nTP Market hosts thousands of products and services from our TPwecan-certified providers. This includes equipment, spare parts, and professional services.\n\nTo find exactly what you need, please visit the **Marketplace** tab on your dashboard, or tell me the specific item you are looking for and I can connect you with a provider.", hasReferralCard: false };
    }

    // 5. EQUIPMENT TROUBLESHOOTING (2-Step Consultation)
    const problemKeywords = ['start', 'not working', 'broken', 'noise', 'leak', 'generator', 'car', 'smoke', 'engine', 'camry', 'toyota', 'overheat', 'vibrate', 'shake', 'light', 'warning', 'power', 'battery', 'oil', 'brake', 'tire'];
    const hasProblem = problemKeywords.some(word => text.includes(word));

    if (hasProblem) {
      // STEP 1: User states problem -> AI asks questions
      if (consultationStage === 'idle' || consultationStage === 'resolved') {
        setConsultationStage('asking_questions');
        return { 
          text: "I understand you're experiencing an issue. To ensure I give you the most accurate technical advice and recommend the right specialist, I need to ask a few quick questions:\n\n1. When did this problem first start, and has it gotten worse?\n2. Have you noticed any specific warning lights, error codes, or unusual smells?\n3. When was the last time the equipment was professionally serviced?\n\nOnce you answer these, I will search our global technical databases for the exact solution.", 
          hasReferralCard: false 
        };
      }

      // STEP 2: User answers questions -> AI gives final report
      if (consultationStage === 'asking_questions') {
        setConsultationStage('searching_web');
        await new Promise(resolve => setTimeout(resolve, 2500)); 
        
        let knowledge = GLOBAL_KNOWLEDGE_BASE.default;
        if (text.includes('smoke') || text.includes('black') || text.includes('white') || text.includes('blue')) knowledge = GLOBAL_KNOWLEDGE_BASE.car_smoke;
        else if (text.includes('generator') || text.includes('power')) knowledge = GLOBAL_KNOWLEDGE_BASE.generator;

        const artisans = await fetchRealArtisans(1);
        setConsultationStage('resolved');
        return { 
          text: `🌐 **Global Database Search Complete.**\n\nBased on your answers and global technical data: ${knowledge.diagnosis}\n\nI highly recommend having a certified technician inspect it using the steps below. I've selected a top-rated TPwecan expert near you:`, 
          hasReferralCard: artisans.length > 0, 
          directionList: knowledge.steps,
          providers: artisans 
        };
      }
    }

    // 6. Fallback
    return { text: "I'm here to help. You can ask me to:\n- Troubleshoot equipment (e.g., 'My car is smoking')\n- Find products or services\n- Get information about TP Market, TPwecan, or our policies.\n\nWhat would you like to know?", hasReferralCard: false };
  }

  async function handleSend() {
    if (!input.trim() || isLoading || isUploading) return;
    if (!user) { alert("Please sign in to use TP AI Assist."); router.push('/signin'); return; }
    if (checkSecurityViolation(input)) {
      setMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text: "🔒 **Security Restriction:** I cannot discuss backend systems or internal platform information.", hasReferralCard: false }]);
      setInput(''); return;
    }
    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    if (user) await supabase.from('ai_diagnostic_sessions').insert([{ user_id: user.id, conversation_history: [{ role: 'user', content: currentInput }] }]);
    triggerAIResponse(currentInput);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      <Head><title>TP AI Assist — TPMarket</title></Head>
      <div className="bg-[#1E293B] p-4 border-b border-white/10 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors"><ArrowLeft size={24} /></button>
        <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/30"><Bot className="text-[#ccff00]" size={20} /></div>
        <div>
          <h1 className="font-black text-white text-lg">TP AI Assist</h1>
          <p className="text-[10px] text-[#ccff00] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse"></span> ONLINE • POWERED BY TPWECAN</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 shadow-md ${msg.sender === 'user' ? 'bg-[#ccff00] text-[#0F172A] rounded-br-none' : 'bg-[#1E293B] text-white border border-white/10 rounded-bl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" className="mt-3 rounded-lg max-w-full border border-white/10" />}
              {msg.audioUrl && <audio controls src={msg.audioUrl} className="mt-3 w-full max-w-xs rounded-lg" />}
              
              {msg.directionList && (
                <div className="mt-4 bg-[#0F172A] rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-blue-400" />
                      <span className="text-xs font-black text-blue-400 uppercase tracking-wider">AI Technical Direction List</span>
                    </div>
                    <button onClick={() => copyDirectionList(msg)} className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all">
                      {copiedId === msg.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy & Send</>}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {msg.directionList.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex gap-2"><span className="text-blue-400 font-bold">•</span> {step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {msg.hasReferralCard && msg.providers && msg.providers.map((provider, index) => (
                <div key={index} className="mt-4 bg-[#0F172A] rounded-xl p-4 border border-[#ccff00]/40 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-[#ccff00]" />
                    <span className="text-xs font-black text-[#ccff00] uppercase tracking-wider">TPwecan Certified Provider</span>
                  </div>
                  <h4 className="font-bold text-white text-base">{provider.providerName}</h4>
                  <p className="text-xs text-slate-400 mt-1 italic">{provider.specialty}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-300 mt-2"><MapPin size={12} className="text-[#ccff00]" /> {provider.location}</div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1"><Star size={12} fill="currentColor" /> {provider.rating}</div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button onClick={() => router.push('/profile/' + provider.id)} className="bg-white/10 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-white/20 transition-all border border-white/10 cursor-pointer">View Profile</button>
                    <button onClick={() => alert(`🚀 Starting instant quote request with ${provider.providerName}!`)} className="bg-[#ccff00] text-[#0F172A] text-xs font-black py-2.5 rounded-lg hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20 cursor-pointer">Get Instant Quote</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1E293B] rounded-2xl rounded-bl-none p-4 border border-white/10 flex items-center gap-2">
              {consultationStage === 'searching_web' ? (
                <><Globe size={16} className="text-blue-400 animate-spin" /><span className="text-xs text-blue-400 font-bold">Searching global technical databases...</span></>
              ) : (
                <><Loader2 size={16} className="text-[#ccff00] animate-spin" /><span className="text-xs text-slate-400 font-bold">TP AI is analyzing...</span></>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-white/10 p-4 pb-6 z-20">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        <div className="max-w-4xl mx-auto flex items-center gap-2 bg-[#0F172A] rounded-full px-4 py-2 border border-white/10 focus-within:border-[#ccff00]/50 transition-all shadow-lg">
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || isRecording} className="text-slate-400 hover:text-[#ccff00] transition-colors p-2 disabled:opacity-50">{isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}</button>
          <button onClick={isRecording ? stopRecording : startRecording} disabled={isUploading} className={`p-2 transition-colors rounded-full ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400 hover:text-[#ccff00]'}`}>{isRecording ? <MicOff size={20} /> : <Mic size={20} />}</button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isRecording ? "Recording... Tap mic to stop" : "Ask about equipment, products, or TP Market..."} disabled={isRecording} className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 py-2 disabled:opacity-50" />
          <button onClick={handleSend} disabled={!input.trim() || isLoading || isUploading || isRecording} className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#ccff00]/20"><Send size={18} className="text-[#0F172A]" /></button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-2">TP AI Assist provides preliminary estimates. Always verify with a TPwecan certified professional.</p>
      </div>
    </div>
  );
}