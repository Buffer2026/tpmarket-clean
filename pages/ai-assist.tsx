import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Send, Image, Bot, MapPin, Star, ShieldCheck, ArrowLeft, Loader2, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// TYPESCRIPT INTERFACE FOR MESSAGES
// This tells Vercel exactly what properties a message can have.
// ==========================================
interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  hasReferralCard?: boolean;
  providers?: {
    id: string;
    providerName: string;
    location: string;
    rating: string;
    specialty: string;
  }[];
}

// ==========================================
// SECURITY GUARDRAIL (The "Bouncer")
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

export default function AIAssist() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Now typed with the Message interface!
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm TP AI Assist. 🤖 I am here to help you with 4 specific things:\n\n1️⃣ **Troubleshoot equipment** (Cars, Home, Office, Hospital, Phones, Bikes, EVs, Latest Tech).\n2️⃣ **Connect you** with the nearest TPwecan-profiled artisans for a quote.\n3️⃣ **Recommend accessories** best suited for your equipment.\n4️⃣ **Answer questions** about products published *only* on TP Market.\n\nHow can I assist you today?",
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

  // ==========================================
  // LIVE DATABASE QUERIES (FETCHES MULTIPLE)
  // ==========================================
  async function fetchRealArtisans() {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, id') 
      .eq('tpwecan_verified', true)
      .limit(3); 

    if (error || !data || data.length === 0) return [];
    
    return data.map((p) => ({
      id: p.id, 
      providerName: p.full_name || "Verified TPwecan Provider",
      location: "Nigeria (Verified)", 
      rating: "5.0/5 (TPwecan Certified)", 
      specialty: "Certified Professional"
    }));
  }

  async function fetchRealProduct(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('products') 
        .select('name, price')
        .ilike('name', `%${searchTerm}%`)
        .limit(1)
        .single();

      if (error || !data) return null;
      return data;
    } catch (e) {
      return null; 
    }
  }

  // Smart Diagnostic Engine
  async function getAIResponse(userText: string) {
    const text = userText.toLowerCase();
    
    if (text.includes('mechanic') || text.includes('artisan') || text.includes('repair') || text.includes('quote') || text.includes('technician') || text.includes('another')) {
      const artisans = await fetchRealArtisans();
      
      if (artisans.length > 0) {
        return { 
          text: `I have searched our database and found ${artisans.length} verified TPwecan professional(s) ready to assist you:`, 
          hasReferralCard: true, 
          providers: artisans 
        };
      }
      return { text: "I am currently searching for available TPwecan-certified artisans in your area. Please check back shortly as we onboard more professionals.", hasReferralCard: false };
    }

    if (text.includes('buy') || text.includes('price') || text.includes('product') || text.includes('accessory')) {
      const keyword = text.replace('buy', '').replace('price', '').replace('product', '').trim() || 'part';
      const realProduct = await fetchRealProduct(keyword);

      if (realProduct) {
        return { 
          text: `I found a matching product on TP Market: **${realProduct.name}**. You can view the full details and price in the marketplace.`, 
          hasReferralCard: false 
        };
      }
      return { text: "I can help you find products on TP Market. Could you specify the exact make or model of the part you are looking for?", hasReferralCard: false };
    }

    if (text.includes('start') || text.includes('not working') || text.includes('broken')) {
      const artisans = await fetchRealArtisans();
      return { 
        text: "I understand your equipment is having issues. To give you an accurate diagnosis, please describe the specific symptoms. If it requires physical repair, here are verified experts who can help:", 
        hasReferralCard: artisans.length > 0,
        providers: artisans
      };
    }

    return { 
      text: "I am specifically designed to help with:\n1️⃣ Equipment troubleshooting\n2️⃣ Finding TPwecan-profiled artisans\n3️⃣ Recommending equipment accessories\n4️⃣ Discussing TP Market products.\n\nCould you please ask a question related to one of these areas?", 
      hasReferralCard: false 
    };
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    if (!user) {
      alert("Please sign in to use TP AI Assist.");
      router.push('/signin');
      return;
    }

    if (checkSecurityViolation(input)) {
      const securityBlockMessage: Message = { 
        id: Date.now(), 
        sender: 'ai', 
        text: "🔒 **Security Restriction:** I am only authorized to assist with equipment troubleshooting, spare parts discovery, and connecting you with TPwecan-certified professionals. I cannot discuss backend systems, administrative data, or internal platform information.",
        hasReferralCard: false 
      };
      setMessages((prev) => [...prev, securityBlockMessage]);
      setInput('');
      return;
    }

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    await supabase.from('ai_diagnostic_sessions').insert([
      { user_id: user.id, conversation_history: [{ role: 'user', content: currentInput }] }
    ]);

    const aiResponseData = await getAIResponse(currentInput);
    
    const aiMessage: Message = { 
      id: Date.now() + 1, 
      sender: 'ai', 
      text: aiResponseData.text,
      hasReferralCard: aiResponseData.hasReferralCard,
      providers: aiResponseData.providers 
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);

    supabase.from('ai_diagnostic_sessions').insert([
      { user_id: user.id, conversation_history: [{ role: 'ai', content: aiResponseData.text }] }
    ]);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      <Head><title>TP AI Assist — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-[#1E293B] p-4 border-b border-white/10 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/30">
          <Bot className="text-[#ccff00]" size={20} />
        </div>
        <div>
          <h1 className="font-black text-white text-lg">TP AI Assist</h1>
          <p className="text-[10px] text-[#ccff00] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse"></span> ONLINE • POWERED BY TPWECAN
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
              msg.sender === 'user' 
                ? 'bg-[#ccff00] text-[#0F172A] rounded-br-none' 
                : 'bg-[#1E293B] text-white border border-white/10 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {/* LIVE PROVIDER REFERRAL CARDS */}
              {msg.hasReferralCard && msg.providers && msg.providers.map((provider, index) => (
                <div key={index} className="mt-4 bg-[#0F172A] rounded-xl p-4 border border-[#ccff00]/40 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-[#ccff00]" />
                    <span className="text-xs font-black text-[#ccff00] uppercase tracking-wider">TPwecan Certified Provider</span>
                  </div>
                  <h4 className="font-bold text-white text-base">{provider.providerName}</h4>
                  <p className="text-xs text-slate-400 mt-1 italic">{provider.specialty}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-300 mt-2">
                    <MapPin size={12} className="text-[#ccff00]" /> {provider.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                    <Star size={12} fill="currentColor" /> {provider.rating}
                  </div>
                  
                  {/* ACTIVE BUTTONS */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                      onClick={() => router.push('/profile/' + provider.id)}
                      className="bg-white/10 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => alert(`🚀 Starting instant quote request with ${provider.providerName}! (We will build the dedicated quote page next)`)}
                      className="bg-[#ccff00] text-[#0F172A] text-xs font-black py-2.5 rounded-lg hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20 cursor-pointer"
                    >
                      Get Instant Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1E293B] rounded-2xl rounded-bl-none p-4 border border-white/10 flex items-center gap-2">
              <Loader2 size={16} className="text-[#ccff00] animate-spin" />
              <span className="text-xs text-slate-400 font-bold">Searching TP Market database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-white/10 p-4 pb-6 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-2 bg-[#0F172A] rounded-full px-4 py-2 border border-white/10 focus-within:border-[#ccff00]/50 transition-all shadow-lg">
          <button className="text-slate-400 hover:text-[#ccff00] transition-colors p-2"><Image size={20} /></button>
          <button className="text-slate-400 hover:text-[#ccff00] transition-colors p-2"><Mic size={20} /></button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about equipment, artisans, or TP Market products..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 py-2"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#ccff00]/20"
          >
            <Send size={18} className="text-[#0F172A]" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-2">
          TP AI Assist provides preliminary estimates. Always verify with a TPwecan certified professional.
        </p>
      </div>
    </div>
  );
}