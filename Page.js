"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ——— Firebase ——————————————————————————————————————————————————————
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "boostflow-63633.firebaseapp.com",
  projectId: "boostflow-63633",
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ——— API CONFIGS (Using Environment Variables) ——————————————————————
const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";
const ELEVENLABS_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_KEY;
const ELEVENLABS_VOICE = "21m00Tcm4lfsIz0nmLcg";
const REMOVEBG_KEY = process.env.NEXT_PUBLIC_REMOVEBG_KEY;
const MONETAG_ZONE = "10671722";

// ——— Monetag Interstitial ——————————————————————————————————————————
const triggerInterstitialAd = () => {
  if (typeof window !== "undefined" && window.show_monetag_interstitial) {
    try { window.show_monetag_interstitial(MONETAG_ZONE); } catch (_) {}
  }
};

// ——— ICONS ——————————————————————————————————————————————————————————
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    seo: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    script: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    voice: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    image: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    finance: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>,
    pause: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    inbox: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  };
  return <span className={className}>{icons[name] || null}</span>;
};

// --- SKELETON & COMPONENTS ---
const Skeleton = ({ h = "h-4", w = "w-full", rounded = "rounded" }) => (
  <div className={`${h} ${w} ${rounded} bg-white/5 animate-pulse`} />
);

const GlassCard = ({ children, className = "", onClick }) => (
  <motion.div
    whileHover={{ scale: 1.01, y: -1 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 ${className}`}
  >
    {children}
  </motion.div>
);

const Btn = ({ children, onClick, loading, variant = "emerald", className = "", disabled }) => {
  const variants = {
    emerald: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold",
    purple: "bg-purple-600 hover:bg-purple-500 text-white font-semibold",
    ghost: "border border-white/20 hover:bg-white/10 text-white",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>
      ) : children}
    </motion.button>
  );
};

const tabVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

// ——— HOME TAB ——————————————————————————————————————————————————————
const tickerItems = [
  "🟢 SEO Report generated • 2s ago",
  "💜 Voice synthesis complete • 14s ago",
  "💰 Expense logged: $42.00 • 1m ago",
  "🖼️ Background removed • 3m ago",
  "📧 Temp mail created • 5m ago",
  "🚀 Script generated • 8m ago",
];

const HomeTab = ({ setActiveTab }) => {
  const [tickerIdx, setTickerIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % tickerItems.length), 2800);
    return () => clearInterval(t);
  }, []);

  const tools = [
    { id: "seo", label: "AI SEO Engine", desc: "Generate optimized content", icon: "seo", color: "from-emerald-500/20 to-emerald-900/10" },
    { id: "script", label: "Script Writer", desc: "AI-powered video scripts", icon: "script", color: "from-purple-500/20 to-purple-900/10" },
    { id: "voice", label: "Voice Lab", desc: "Neural TTS synthesis", icon: "voice", color: "from-blue-500/20 to-blue-900/10" },
    { id: "image", label: "Image Suite", desc: "Remove backgrounds", icon: "image", color: "from-pink-500/20 to-pink-900/10" },
    { id: "mail", label: "Temp Mail", desc: "Disposable emails", icon: "mail", color: "from-yellow-500/20 to-yellow-900/10" },
    { id: "finance", label: "Expense Tracker", desc: "Track your finances", icon: "finance", color: "from-teal-500/20 to-teal-900/10" },
  ];

  return (
    <motion.div variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">BoostFlow <span className="text-emerald-400">AI</span></h1>
          <p className="text-xs text-white/40 mt-0.5">Your AI productivity suite</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(tool.id)}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tool.color} p-4 cursor-pointer`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-white">
              <Icon name={tool.icon} size={18} />
            </div>
            <p className="text-sm font-bold text-white">{tool.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ——— SEO TAB ——————————————————————————————————————————————————————
const SEOTab = () => {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!keyword.trim()) return;
    setLoading(true); setError(""); setResult("");
    triggerInterstitialAd();
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${HF_TOKEN}` },
        body: JSON.stringify({ inputs: `[INST] SEO expert: keyword "${keyword}" [/INST]`, parameters: { max_new_tokens: 300 } }),
      });
      const data = await res.json();
      setResult(data[0]?.generated_text || "Error generating");
    } catch (e) { setError("API Error"); }
    finally { setLoading(false); }
  };

  return (
    <motion.div variants={tabVariants} className="space-y-4">
      <h2 className="text-white font-bold">SEO Engine</h2>
      <GlassCard>
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter Keyword" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none mb-3" />
        <Btn onClick={generate} loading={loading} className="w-full">Generate</Btn>
      </GlassCard>
      {result && <GlassCard className="text-xs text-white/70">{result}</GlassCard>}
    </motion.div>
  );
};

// ——— SCRIPT TAB —————————————————————————————————————————————————————
const ScriptTab = () => {
    const [topic, setTopic] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
  
    const generate = async () => {
      if (!topic.trim()) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${HF_TOKEN}` },
          body: JSON.stringify({ inputs: `[INST] Write video script: ${topic} [/INST]` }),
        });
        const data = await res.json();
        setResult(data[0]?.generated_text);
      } catch (e) {} finally { setLoading(false); }
    };
  
    return (
      <motion.div variants={tabVariants} className="space-y-4">
        <h2 className="text-white font-bold">Script Writer</h2>
        <GlassCard>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Video Topic" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none mb-3" />
          <Btn variant="purple" onClick={generate} loading={loading} className="w-full">Create Script</Btn>
        </GlassCard>
        {result && <GlassCard className="text-xs text-white/70">{result}</GlassCard>}
      </motion.div>
    );
};

// ——— VOICE TAB ——————————————————————————————————————————————————————
const VoiceTab = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const synthesize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_KEY },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <motion.div variants={tabVariants} className="space-y-4">
      <h2 className="text-white font-bold">Voice Lab</h2>
      <GlassCard>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type text..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mb-3" />
        <Btn onClick={synthesize} loading={loading} className="w-full">Speak</Btn>
      </GlassCard>
      {audioUrl && <audio controls src={audioUrl} className="w-full mt-2" />}
    </motion.div>
  );
};

// ——— IMAGE TAB —————————————————————————————————————————————————————
const ImageTab = () => {
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => setPreview(URL.createObjectURL(f));

  return (
    <motion.div variants={tabVariants} className="space-y-4">
      <h2 className="text-white font-bold">Image Suite</h2>
      <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-white/10 p-10 text-center rounded-2xl">
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {preview ? <img src={preview} className="max-h-40 mx-auto" /> : <p className="text-white/40">Upload Image</p>}
      </div>
    </motion.div>
  );
};

// ——— MAIL TAB ——————————————————————————————————————————————————————
const MailTab = () => {
  const [email, setEmail] = useState("");
  const generate = async () => {
    setEmail("loading...");
    const res = await fetch("https://api.mail.tm/domains");
    const data = await res.json();
    setEmail(`user${Math.floor(Math.random()*1000)}@${data["hydra:member"][0].domain}`);
  };

  return (
    <motion.div variants={tabVariants} className="space-y-4">
      <h2 className="text-white font-bold">Temp Mail</h2>
      <Btn onClick={generate} className="w-full">New Email</Btn>
      {email && <GlassCard className="text-yellow-400 font-mono">{email}</GlassCard>}
    </motion.div>
  );
};

// ——— FINANCE TAB ———————————————————————————————————————————————————
const FinanceTab = () => {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const add = async () => {
    await addDoc(collection(db, "expenses"), { description: desc, amount: Number(amount), createdAt: serverTimestamp() });
    setAmount(""); setDesc(""); alert("Saved!");
  };

  return (
    <motion.div variants={tabVariants} className="space-y-4">
      <h2 className="text-white font-bold">Finance Tracker</h2>
      <GlassCard className="space-y-2">
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Item" className="w-full bg-white/5 p-2 text-white rounded-lg" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full bg-white/5 p-2 text-white rounded-lg" />
        <Btn onClick={add} className="w-full">Log Expense</Btn>
      </GlassCard>
    </motion.div>
  );
};

// ——— MAIN APP ——————————————————————————————————————————————————————
const navItems = [
  { id: "home", label: "Home", icon: "home" },
  { id: "seo", label: "SEO", icon: "seo" },
  { id: "script", label: "Script", icon: "script" },
  { id: "voice", label: "Voice", icon: "voice" },
  { id: "image", label: "Image", icon: "image" },
  { id: "mail", label: "Mail", icon: "mail" },
  { id: "finance", label: "Finance", icon: "finance" },
];

export default function BoostFlowApp() {
  const [activeTab, setActiveTab] = useState("home");

  const renderTab = () => {
    switch (activeTab) {
      case "home": return <HomeTab setActiveTab={setActiveTab} />;
      case "seo": return <SEOTab />;
      case "script": return <ScriptTab />;
      case "voice": return <VoiceTab />;
      case "image": return <ImageTab />;
      case "mail": return <MailTab />;
      case "finance": return <FinanceTab />;
      default: return <HomeTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <main className="px-4 pt-5 pb-24 max-w-md mx-auto">
        <AnimatePresence mode="wait">{renderTab()}</AnimatePresence>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#030712]/90 backdrop-blur-xl border-t border-white/10 px-2 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center ${activeTab === item.id ? "text-emerald-400" : "text-white/40"}`}>
              <Icon name={item.icon} size={20} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
