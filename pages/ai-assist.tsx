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
  directionList?: string[]; // The copyable technical steps
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
// GLOBAL TECHNICAL KNOWLEDGE ENGINE (Simulates Web Search)
// ==========================================
const GLOBAL_KNOWLEDGE_BASE: Record<string, { diagnosis: string; steps: string[] }> = {
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
  car: {
    diagnosis: "Global automotive databases indicate that starting issues or unusual noises are usually linked to the battery, starter motor, alternator, or fuel delivery system.",
    steps: [
      "1. Test battery voltage with a multimeter (should be 12.6V+ when off, 13.7-14.7V when running).",
      "2. Listen for a single 'click' (starter solenoid) or rapid clicking (weak battery).",
      "3. Check fuel pump fuse and relay in the fuse box.",
      "4. Listen for the fuel pump priming sound when turning the key to 'ON'.",
      "5. Use an OBD2 scanner to check for crankshaft/camshaft sensor error codes.",
      "6. Inspect spark plugs for fouling if the engine cranks but won't fire."
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
  
  const [consultationStage, setConsultationStage] = useState<'idle' | 'gathering_info' | 'searching_web' | 'resolved'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm TP AI Assist. 🤖 Think of me as your personal equipment consultant. \n\nTell me what's wrong, or upload a photo/voice note. I will search global technical databases to diagnose the issue, give you a step-by-step direction list to hand to your mechanic, and connect you with the best TPwecan-certified expert.\n\nHow can I help you today?",
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

  async function getAIResponse(userText: string) {
    const text = userText.toLowerCase();
    
    if (text.includes('media_upload_image') || text.includes('media_upload_voice')) {
      const isImage = text.includes('image');
      setConsultationStage('gathering_info');
      return { text: `Thank you. I've received your ${isImage ? 'image' : 'voice note'}. To help me search the global databases accurately, could you tell me a bit more? For example, are there any unusual noises, warning lights, or specific times when the issue happens?`, hasReferralCard: false };
    }

    if (text.includes('another') || text.includes('show me more')) {
      const artisans = await fetchRealArtisans(3);
      return { text: "Here are a few more verified TPwecan professionals available in your area:", hasReferralCard: true, providers: artisans };
    }

    if (text.includes('start') || text.includes('not working') || text.includes('broken') || text.includes('noise') || text.includes('leak') || text.includes('generator') || text.includes('car')) {
      if (consultationStage === 'idle' || consultationStage === 'gathering_info') {
        setConsultationStage('searching_web');
        // Simulate deep web search delay
        await new Promise(resolve => setTimeout(resolve, 2500)); 
        
        // Select knowledge base
        let knowledge = GLOBAL_KNOWLEDGE_BASE.default;
        if (text.includes('generator') || text.includes('power')) knowledge = GLOBAL_KNOWLEDGE_BASE.generator;
        if (text.includes('car') || text.includes('start') || text.includes('vehicle')) knowledge = GLOBAL_KNOWLEDGE_BASE.car;

        const artisans = await fetchRealArtisans(1);
        setConsultationStage('resolved');
        return { 
          text: `🌐 **Global Database Search Complete.**\n\n${knowledge.diagnosis}\n\nI highly recommend having a certified technician inspect it using the steps below. I've selected a top-rated TPwecan expert near you:`, 
          hasReferralCard: artisans.length > 0, 
          directionList: knowledge.steps,
          providers: artisans 
        };
      }
    }

    if (text.includes('mechanic') || text.includes('artisan') || text.includes('buy') || text.includes('price')) {
      const artisans = await fetchRealArtisans(1);
      return { text: "I can certainly help you with that. I've found a verified TPwecan professional ready to assist you:", hasReferralCard: true, providers: artisans };
    }

    return { text: "I'm here to help. Could you please describe the equipment issue you're facing?", hasReferralCard: false };
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
              
              {/* DIRECTION LIST UI */}
              {msg.directionList && (
                <div className="mt-4 bg-[#0F172A] rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-blue-400" />
                      <span className="text-xs font-black text-blue-400 uppercase tracking-wider">AI Technical Direction List</span>
                    </div>
                    <button 
                      onClick={() => copyDirectionList(msg)}
                      className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all"
                    >
                      {copiedId === msg.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy & Send</>}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {msg.directionList.map((step, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex gap-2">
                        <span className="text-blue-400 font-bold">•</span> {step}
                      </li>
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
                <>
                  <Globe size={16} className="text-blue-400 animate-spin" />
                  <span className="text-xs text-blue-400 font-bold">Searching global technical databases...</span>
                </>
              ) : (
                <>
                  <Loader2 size={16} className="text-[#ccff00] animate-spin" />
                  <span className="text-xs text-slate-400 font-bold">TP AI is analyzing...</span>
                </>
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
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isRecording ? "Recording... Tap mic to stop" : "Describe your equipment issue..."} disabled={isRecording} className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 py-2 disabled:opacity-50" />
          <button onClick={handleSend} disabled={!input.trim() || isLoading || isUploading || isRecording} className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#ccff00]/20"><Send size={18} className="text-[#0F172A]" /></button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-2">TP AI Assist provides preliminary estimates. Always verify with a TPwecan certified professional.</p>
      </div>
    </div>
  );
}