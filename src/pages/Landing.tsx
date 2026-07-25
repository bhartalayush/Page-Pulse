import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Clock, FileText, Image as ImageIcon, AlertTriangle,
  CheckCircle, Copy, Check, RotateCcw, ExternalLink,
  ArrowLeftRight, History, ShieldAlert, Info, Activity,
  ChevronRight, Zap, Eye, Search,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════ */
interface AuditResult {
  url: string; status: number; responseTimeMs: number;
  title: string; metaDescription: string;
  h1Count: number; imagesMissingAlt: number; wordCount: number;
  score?: number; timestamp?: number;
}

/* ════════════════════════════════════════════════════════
   FLOATING GRAPHIC BACKGROUND
════════════════════════════════════════════════════════ */
function FloatingGraphics() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {/* Soft contrasty pastel morphing background shapes */}
      <div className="anim-floatA absolute"
        style={{ top: '-8%', left: '-6%', width: 540, height: 540,
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          background: 'radial-gradient(circle at 40% 40%, #B9D7F2, #D4E6F7 70%)',
          filter: 'blur(24px)', opacity: 0.65 }} />

      <div className="anim-floatB absolute"
        style={{ bottom: '-10%', right: '-8%', width: 600, height: 600,
          borderRadius: '45% 55% 40% 60% / 60% 40% 60% 40%',
          background: 'radial-gradient(circle at 60% 60%, #F5BEA6, #FAD6C5 70%)',
          filter: 'blur(28px)', opacity: 0.6 }} />

      <div className="anim-floatC absolute"
        style={{ top: '28%', right: '-5%', width: 400, height: 400,
          borderRadius: '55% 45% 60% 40% / 40% 60% 40% 60%',
          background: 'radial-gradient(circle at 50% 50%, #F5E296, #FAF0C0 70%)',
          filter: 'blur(20px)', opacity: 0.55 }} />

      <div className="anim-floatD absolute"
        style={{ top: '52%', left: '-4%', width: 360, height: 360,
          borderRadius: '50% 50% 60% 40% / 60% 40% 50% 50%',
          background: 'radial-gradient(circle at 45% 45%, #D4C4F7, #E6DCFA 70%)',
          filter: 'blur(22px)', opacity: 0.5 }} />

      <div className="anim-floatA absolute"
        style={{ animationDelay: '-4s', top: '15%', left: '42%', width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #B2D6B6, #D2E8D4 70%)',
          filter: 'blur(18px)', opacity: 0.45 }} />

      {/* Decorative spinning vector rings & geometric accents */}
      <div className="anim-spin absolute"
        style={{ top: '6%', right: '12%', width: 160, height: 160,
          borderRadius: '50%',
          border: '2px solid rgba(200,169,107,0.4)',
          boxShadow: '0 0 0 12px rgba(200,169,107,0.08)' }} />

      <div className="anim-spinR absolute"
        style={{ top: '7.5%', right: '13.5%', width: 128, height: 128,
          borderRadius: '50%',
          border: '1.5px dashed rgba(200,169,107,0.3)' }} />

      <div className="anim-spin absolute"
        style={{ animationDuration: '32s', bottom: '14%', left: '8%',
          width: 120, height: 120,
          border: '2px solid rgba(15,44,74,0.2)',
          borderRadius: '20px', transform: 'rotate(20deg)' }} />

      <div className="anim-floatB absolute"
        style={{ animationDelay: '-6s', top: '42%', left: '5%',
          width: 64, height: 64, borderRadius: '16px',
          background: '#FAD6C5', border: '1px solid #F3B89F', opacity: 0.75 }} />

      <div className="anim-floatC absolute"
        style={{ animationDelay: '-3s', top: '8%', left: '48%',
          width: 52, height: 52, borderRadius: '12px',
          background: '#D4E6F7', border: '1px solid #B0D0EF', opacity: 0.8,
          transform: 'rotate(45deg)' }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HELPERS & THEMES
════════════════════════════════════════════════════════ */
const PRESETS = [
  { label: 'Wikipedia',   url: 'https://en.wikipedia.org' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com' },
  { label: 'Example',     url: 'https://example.com' },
];

function calcScore(r: Omit<AuditResult, 'score'>): number {
  let s = 30;
  if (r.status === 200) s += 20; else if (r.status < 400) s += 10;
  const tl = r.title !== 'No title tag found' ? r.title.length : 0;
  if (tl >= 10 && tl <= 60) s += 15; else if (tl > 0) s += 5;
  const dl = r.metaDescription !== 'No meta description found' ? r.metaDescription.length : 0;
  if (dl >= 50 && dl <= 160) s += 15; else if (dl > 0) s += 5;
  if (r.h1Count === 1) s += 10; else if (r.h1Count > 1) s += 5;
  s += Math.max(0, 10 - r.imagesMissingAlt);
  if (r.wordCount >= 250) s += 10; else if (r.wordCount > 50) s += 5;
  return Math.min(100, Math.max(0, s));
}

function scoreInfo(s: number) {
  if (s >= 80) return { label: 'EXCELLENT', color: '#1B5E34', bg: '#C2E8CC', border: '#8AD49E' };
  if (s >= 55) return { label: 'AVERAGE',   color: '#6B4C00', bg: '#FCEAA6', border: '#F2D368' };
  return              { label: 'CRITICAL',  color: '#8A1C1C', bg: '#FCD4D4', border: '#F29B9B' };
}

const STEPS = [
  'RESOLVING HOST…', 'FETCHING HTML STREAM…', 'PARSING CONTENT TYPE…',
  'SCANNING META NODES…', 'AUDITING ALT TAGS…', 'COMPILING SEO REPORT…',
  'CALCULATING PULSE SCORE…',
];

/* Contrasty Pastel Card Palettes */
const PASTEL_BG = [
  { bg: 'linear-gradient(135deg, #D4E6F7 0%, #C2DCF2 100%)', border: '#9EC2E6', iconBg: '#0F2C4A', text: '#0F2C4A', badgeBg: 'rgba(15, 44, 74, 0.12)' },
  { bg: 'linear-gradient(135deg, #FAD6C5 0%, #F5C6B0 100%)', border: '#EAA284', iconBg: '#4A1D0F', text: '#4A1D0F', badgeBg: 'rgba(74, 29, 15, 0.12)' },
  { bg: 'linear-gradient(135deg, #FAF0C0 0%, #F5E59E 100%)', border: '#E6CF73', iconBg: '#4A3B0F', text: '#4A3B0F', badgeBg: 'rgba(74, 59, 15, 0.12)' },
  { bg: 'linear-gradient(135deg, #E6DCFA 0%, #D8C7F7 100%)', border: '#B6A0E6', iconBg: '#2D1F4A', text: '#2D1F4A', badgeBg: 'rgba(45, 31, 74, 0.12)' },
];

/* ════════════════════════════════════════════════════════
   KPI CARD (Squarish, Center Aligned, High-Contrast Pastels)
════════════════════════════════════════════════════════ */
function KpiCard({ icon, label, value, unit, badge, badgeColor, index = 0 }: {
  icon: React.ReactNode; label: string; value: string | number;
  unit?: string; badge?: string; badgeColor?: string; index?: number;
}) {
  const theme = PASTEL_BG[index % PASTEL_BG.length];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center text-center aspect-square border transition-transform hover:scale-[1.02]"
      style={{
        background: theme.bg,
        borderColor: theme.border,
        boxShadow: '0 4px 16px rgba(14,27,44,0.06)',
      }}>
      {/* Top right floating badge */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="text-[11px] font-mono tracking-widest px-3 py-1 rounded-full uppercase font-semibold"
            style={{ color: theme.text, background: theme.badgeBg }}>
            {badge}
          </span>
        </div>
      )}

      {/* Centered Icon */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3 mt-2"
        style={{ background: theme.iconBg, color: '#FAF8F5' }}>
        {icon}
      </div>

      {/* Centered Content */}
      <p className="text-xs font-display tracking-[0.2em] uppercase font-semibold mb-1"
        style={{ color: theme.text, opacity: 0.85 }}>
        {label}
      </p>
      <p className="text-4xl font-display font-medium leading-none" style={{ color: theme.text }}>
        {value}
        {unit && <span className="text-sm ml-1 font-mono opacity-75">{unit}</span>}
      </p>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   CHECK ROW (Smartly Proportioned Typography)
════════════════════════════════════════════════════════ */
function CheckRow({ n, label, desc, value, status, extra }: {
  n: string; label: string; desc: string; value?: string;
  status: 'pass' | 'warn' | 'fail'; extra?: string;
}) {
  const palette = {
    pass: { color: '#1B5E34', bg: '#C2E8CC', border: '#8AD49E', icon: <CheckCircle className="w-4 h-4" /> },
    warn: { color: '#6B4C00', bg: '#FCEAA6', border: '#F2D368', icon: <Info className="w-4 h-4" /> },
    fail: { color: '#8A1C1C', bg: '#FCD4D4', border: '#F29B9B', icon: <AlertTriangle className="w-4 h-4" /> },
  };
  const p = palette[status];
  return (
    <div className="flex gap-5 py-5 border-b border-[rgba(14,27,44,0.07)] last:border-0 items-start">
      <div className="w-9 h-9 rounded-full border border-[rgba(14,27,44,0.12)] bg-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono text-[#4A607A] font-semibold">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg tracking-[0.1em] uppercase text-[#0E1B2C] mb-1 font-semibold"
          style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          {label}
        </p>
        <p className="text-sm text-[#3A5070] leading-relaxed mb-2.5"
          style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 300 }}>
          {desc}
        </p>
        {value && (
          <p className="text-xs font-mono text-[#0E1B2C] bg-[#F2EFE9] border border-[rgba(14,27,44,0.08)] rounded-xl px-4 py-2.5 truncate font-medium">
            "{value}"
          </p>
        )}
        {extra && (
          <p className="text-xs font-mono mt-2 font-medium" style={{ color: p.color }}>{extra}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase font-semibold"
        style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}>
        {p.icon}
        <span className="hidden sm:inline">{status}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
════════════════════════════════════════════════════════ */
export default function Landing() {
  const [url, setUrl]           = useState('');
  const [auditing, setAuditing] = useState(false);
  const [step, setStep]         = useState(0);
  const [report, setReport]     = useState<AuditResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [history, setHistory]   = useState<AuditResult[]>([]);
  const [tab, setTab]           = useState<'seo' | 'a11y' | 'compare' | 'json'>('seo');
  const [copied, setCopied]     = useState(false);
  const [compareUrl, setCompareUrl]       = useState('');
  const [comparing, setComparing]         = useState(false);
  const [compareReport, setCompareReport] = useState<AuditResult | null>(null);
  const [compareErr, setCompareErr]       = useState<string | null>(null);
  const [showNav, setShowNav]   = useState(true);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    try {
      const h = localStorage.getItem('pp_history');
      if (h) setHistory(JSON.parse(h));
    } catch (_) {}
  }, []);

  const goHome = () => {
    setReport(null);
    setUrl('');
    setError(null);
    setCompareReport(null);
    setCompareUrl('');
  };

  useEffect(() => {
    let t: any;
    const reset = () => {
      setShowNav(true); clearTimeout(t);
      t = setTimeout(() => { if (window.scrollY > 80) setShowNav(false); }, 3000);
    };
    ['mousemove','scroll','keydown','touchstart'].forEach(ev => window.addEventListener(ev, reset));
    reset();
    return () => {
      clearTimeout(t);
      ['mousemove','scroll','keydown','touchstart'].forEach(ev => window.removeEventListener(ev, reset));
    };
  }, []);

  useEffect(() => {
    if (!auditing) return;
    setStep(0);
    const iv = setInterval(() => setStep(p => p < STEPS.length - 1 ? p + 1 : p), 650);
    return () => clearInterval(iv);
  }, [auditing]);

  const push = (r: AuditResult) => {
    const next = [r, ...history.filter(h => h.url !== r.url)].slice(0, 12);
    setHistory(next);
    localStorage.setItem('pp_history', JSON.stringify(next));
  };

  const audit = async (target: string) => {
    if (!target.trim()) return;
    let u = target.trim();
    if (!u.startsWith('http')) u = 'https://' + u;
    setError(null); setAuditing(true); setReport(null);
    setCompareReport(null); setCompareUrl('');
    try {
      const res  = await fetch(`/api/audit?url=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      const r: AuditResult = { ...data, score: calcScore(data), timestamp: Date.now() };
      setReport(r); push(r);
    } catch (e: any) { setError(e.message); }
    finally { setAuditing(false); }
  };

  const compare = async (target: string) => {
    if (!target.trim()) return;
    let u = target.trim();
    if (!u.startsWith('http')) u = 'https://' + u;
    setCompareErr(null); setComparing(true); setCompareReport(null);
    try {
      const res  = await fetch(`/api/audit?url=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setCompareReport({ ...data, score: calcScore(data), timestamp: Date.now() });
    } catch (e: any) { setCompareErr(e.message); }
    finally { setComparing(false); }
  };

  const copy = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden"
      style={{ background: '#FAF8F5', fontFamily: 'Josefin Sans, sans-serif', fontWeight: 300, letterSpacing: '0.04em' }}>

      {/* Vector animations */}
      <FloatingGraphics />

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside
        className="relative z-20 flex flex-col h-full border-r"
        style={{
          width: sideOpen ? 280 : 76,
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(250,248,245,0.85)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(14,27,44,0.08)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-6 border-b" style={{ borderColor: 'rgba(14,27,44,0.06)' }}>
          <button onClick={goHome}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            style={{ background: '#0E1B2C' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#C8A96B')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0E1B2C')}
            title="Go to Home"
          >
            <Activity className="w-5 h-5 text-[#FAF8F5]" />
          </button>
          {sideOpen && (
            <button onClick={goHome} className="overflow-hidden whitespace-nowrap leading-none text-left cursor-pointer">
              <p className="text-sm tracking-[0.32em] uppercase text-[#0E1B2C] font-medium"
                style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Page</p>
              <p className="text-sm tracking-[0.32em] uppercase font-medium"
                style={{ fontFamily: 'Josefin Sans, sans-serif', color: '#C8A96B' }}>Pulse</p>
            </button>
          )}
        </div>

        <nav className="flex flex-col gap-1.5 p-3 flex-1 overflow-hidden">
          {[
            { icon: <Search className="w-5 h-5" />, label: 'Audit',   act: goHome },
            { icon: <History className="w-5 h-5" />, label: 'History', act: () => setSideOpen(true) },
          ].map(item => (
            <button key={item.label} onClick={item.act}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer transition-all"
              style={{ color: '#3A5070' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.color = '#0E1B2C'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3A5070'; }}
            >
              <span className="shrink-0">{item.icon}</span>
              {sideOpen && <span className="text-xs tracking-widest uppercase font-semibold">{item.label}</span>}
            </button>
          ))}

          {sideOpen && history.length > 0 && (
            <div className="mt-4 flex-1 overflow-y-auto">
              <p className="text-xs font-mono tracking-[0.22em] uppercase text-[#7A90A8] px-3 mb-2.5 font-semibold">Recent Audits</p>
              {history.slice(0, 8).map(h => (
                <button key={h.url} onClick={() => { setUrl(h.url); audit(h.url); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer mb-1 transition-all"
                  style={{ color: '#3A5070' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.color = '#0E1B2C'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3A5070'; }}
                >
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md border shrink-0 font-semibold"
                    style={{ color: scoreInfo(h.score || 0).color, borderColor: scoreInfo(h.score || 0).border, background: scoreInfo(h.score || 0).bg }}>
                    {h.score}
                  </span>
                  <span className="text-xs truncate font-medium">{h.url.replace(/^https?:\/\//, '')}</span>
                </button>
              ))}
              <button onClick={() => { setHistory([]); localStorage.removeItem('pp_history'); }}
                className="text-xs font-mono text-[#7A90A8] hover:text-[#8A1C1C] px-3 mt-3 cursor-pointer font-medium">
                CLEAR HISTORY
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(14,27,44,0.06)' }}>
          {sideOpen && (
            <p className="text-xs font-mono tracking-widest text-[#7A90A8]">v1.0 — PAGEPULSE</p>
          )}
        </div>
      </aside>

      {/* ══════════════════ MAIN ══════════════════════ */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-y-auto">

        {/* ── Vanishing top nav ── */}
        <AnimatePresence>
          {showNav && (
            <motion.header key="nav"
              initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -64, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b"
              style={{ background: 'rgba(250,248,245,0.85)', backdropFilter: 'blur(20px)', borderColor: 'rgba(14,27,44,0.08)' }}>
              <div className="flex items-center gap-6">
                <button onClick={goHome} className="cursor-pointer text-left group flex items-center gap-3">
                  <div>
                    <h1 className="text-base tracking-[0.35em] uppercase text-[#0E1B2C] leading-none group-hover:opacity-75 transition-opacity font-medium"
                      style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                      Page <span style={{ color: '#C8A96B' }}>Pulse</span>
                    </h1>
                    <p className="text-xs font-mono text-[#7A90A8] mt-0.5">Website Audit Terminal</p>
                  </div>
                </button>
                {report && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#7A90A8]">
                    <span>/</span>
                    <span className="text-[#0E1B2C] font-medium">{report.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                    <span style={{ color: '#C8A96B' }} className="font-semibold">#{report.score}</span>
                  </div>
                )}
              </div>
              {report && (
                <button onClick={goHome}
                  className="text-xs font-mono tracking-widest text-[#3A5070] hover:text-[#0E1B2C] cursor-pointer border border-[rgba(14,27,44,0.12)] px-4 py-2 rounded-xl hover:bg-white/80 transition-all font-medium">
                  NEW AUDIT
                </button>
              )}
            </motion.header>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-8 mt-4 flex gap-3 items-start p-4 rounded-2xl border"
              style={{ background: '#FCD4D4', borderColor: '#F29B9B', boxShadow: '0 4px 16px rgba(138,28,28,0.08)' }}>
              <ShieldAlert className="w-5 h-5 text-[#8A1C1C] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-mono tracking-widest text-[#8A1C1C] uppercase mb-1 font-bold">Audit Error</p>
                <p className="text-sm text-[#4A1D0F] font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-xs font-mono text-[#8A1C1C] hover:opacity-80 cursor-pointer font-bold">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ HERO ════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {!report && !auditing && (
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center px-8 md:px-16">

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono tracking-[0.3em] text-[#7A90A8] mb-6 uppercase font-semibold">
                ◆ &nbsp; Website Intelligence Terminal &nbsp; ◆
              </motion.p>

              {/* Main title */}
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                style={{
                  fontFamily: 'Josefin Sans, sans-serif', fontWeight: 100,
                  letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1,
                  fontSize: 'clamp(3.2rem, 8.5vw, 8rem)', color: '#0E1B2C',
                }}>
                Audit
                <span style={{ color: '#C8A96B', fontStyle: 'italic',
                  fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
                  letterSpacing: '0.06em' }}> any </span>
                Website
              </motion.h2>

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="text-xl text-[#3A5070] mt-6 mb-10"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300 }}>
                SEO · Accessibility · Performance · Structure
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className="w-full max-w-2xl mb-8">
                <form onSubmit={e => { e.preventDefault(); audit(url); }}
                  className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-[rgba(14,27,44,0.12)] rounded-2xl px-6 py-4"
                  style={{ boxShadow: '0 6px 32px rgba(14,27,44,0.08)' }}>
                  <Globe className="w-5 h-5 text-[#7A90A8] shrink-0" />
                  <input autoFocus type="text"
                    placeholder="enter url — e.g. wikipedia.org"
                    value={url} onChange={e => setUrl(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[#0E1B2C] placeholder:text-[#7A90A8]/60 text-sm font-medium"
                    style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }} />
                  <button type="submit" disabled={!url.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs tracking-[0.18em] uppercase transition-all cursor-pointer disabled:opacity-40 font-semibold"
                    style={{ background: '#0E1B2C', color: '#FAF8F5', fontFamily: 'Josefin Sans, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#C8A96B'; e.currentTarget.style.color = '#0E1B2C'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#0E1B2C'; e.currentTarget.style.color = '#FAF8F5'; }}>
                    Scan <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-3 mt-4 justify-center">
                  <span className="text-xs font-mono tracking-widest text-[#7A90A8] font-semibold">QUICK —</span>
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => { setUrl(p.url); audit(p.url); }}
                      className="text-xs font-mono tracking-wider text-[#0E1B2C] border border-[rgba(14,27,44,0.12)] bg-white/70 px-4 py-2 rounded-xl hover:bg-white transition-all cursor-pointer font-medium shadow-xs">
                      {p.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* High-Contrast Pastel Feature Pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }}
                className="flex flex-wrap gap-3 justify-center max-w-2xl">
                {[
                  { icon: <Zap className="w-4 h-4" />, text: 'Response Timing', bg: '#D4E6F7', border: '#9EC2E6', textCol: '#0F2C4A' },
                  { icon: <Eye className="w-4 h-4" />, text: 'SEO Meta Audit', bg: '#FAD6C5', border: '#EAA284', textCol: '#4A1D0F' },
                  { icon: <ImageIcon className="w-4 h-4" />, text: 'Alt Text Check', bg: '#FAF0C0', border: '#E6CF73', textCol: '#4A3B0F' },
                  { icon: <FileText className="w-4 h-4" />, text: 'Content Density', bg: '#D2E8D4', border: '#A2D4A6', textCol: '#1E3A2B' },
                  { icon: <ArrowLeftRight className="w-4 h-4" />, text: 'Site Comparison', bg: '#E6DCFA', border: '#B6A0E6', textCol: '#2D1F4A' },
                ].map(f => (
                  <div key={f.text}
                    className="flex items-center gap-2 text-xs font-mono tracking-wide border px-4 py-2 rounded-full font-semibold shadow-xs"
                    style={{ background: f.bg, borderColor: f.border, color: f.textCol }}>
                    {f.icon} {f.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ LOADER ══════════════════════════════════ */}
        <AnimatePresence>
          {auditing && (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-[rgba(14,27,44,0.08)]" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-[#C8A96B] animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-dashed border-[rgba(200,169,107,0.4)] animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-6 h-6" style={{ color: '#C8A96B' }} />
                  </div>
                </div>
                <h3 className="text-lg tracking-[0.28em] uppercase text-[#0E1B2C] mb-2 font-medium"
                  style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Analyzing</h3>
                <p className="text-sm font-mono mb-6 font-semibold" style={{ color: '#C8A96B' }}>&gt; {STEPS[step]}</p>
                <div className="w-64 h-1 bg-[rgba(14,27,44,0.08)] mx-auto overflow-hidden rounded-full">
                  <motion.div className="h-full" style={{ background: '#C8A96B' }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4 }} />
                </div>
                <p className="text-xs font-mono text-[#7A90A8] mt-3 font-medium">
                  {Math.round(((step + 1) / STEPS.length) * 100)}%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════ RESULTS ═════════════════════════════════ */}
        <AnimatePresence>
          {report && !auditing && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col overflow-hidden">

              {/* Score Header Band */}
              <div className="flex items-center gap-6 px-8 py-5 border-b"
                style={{ borderColor: 'rgba(14,27,44,0.08)', background: 'rgba(250,248,245,0.75)', backdropFilter: 'blur(10px)' }}>
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" stroke="rgba(14,27,44,0.08)" strokeWidth="4" fill="none" />
                    <motion.circle cx="28" cy="28" r="24" stroke="#C8A96B" strokeWidth="4" fill="none"
                      strokeLinecap="round" strokeDasharray="150.8"
                      initial={{ strokeDashoffset: 150.8 }}
                      animate={{ strokeDashoffset: 150.8 - (150.8 * (report.score || 0)) / 100 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-medium text-[#0E1B2C]"
                      style={{ fontFamily: 'Josefin Sans, sans-serif' }}>{report.score}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-mono tracking-widest px-3 py-1 rounded-full font-bold border"
                      style={{ color: scoreInfo(report.score || 0).color, background: scoreInfo(report.score || 0).bg, borderColor: scoreInfo(report.score || 0).border }}>
                      {scoreInfo(report.score || 0).label}
                    </span>
                    <span className="text-xs font-mono text-[#7A90A8] font-medium">
                      {new Date(report.timestamp || 0).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-mono text-[#0E1B2C] truncate font-semibold">{report.url}</p>
                    <a href={report.url} target="_blank" rel="noopener noreferrer"
                      className="text-[#7A90A8] hover:text-[#C8A96B] transition-colors shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <button onClick={() => audit(report.url)}
                  className="flex items-center gap-2 text-xs font-mono tracking-widest border border-[rgba(14,27,44,0.14)] px-4 py-2.5 rounded-xl text-[#0E1B2C] bg-white/70 hover:bg-white cursor-pointer transition-all font-semibold shadow-xs">
                  <RotateCcw className="w-3.5 h-3.5 text-[#C8A96B]" /> RESCAN
                </button>
              </div>

              {/* KPI row — Centered Squarish Cards with High-Contrast Pastel Gradients */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-6 border-b"
                style={{ borderColor: 'rgba(14,27,44,0.06)' }}>
                <KpiCard icon={<Globe className="w-5 h-5" />} label="HTTP Status"
                  value={report.status} index={0}
                  badge={report.status === 200 ? '200 OK' : 'ERROR'}
                  badgeColor={report.status === 200 ? '#1B5E34' : '#8A1C1C'} />
                <KpiCard icon={<Clock className="w-5 h-5" />} label="Response"
                  value={report.responseTimeMs} unit="ms" index={1}
                  badge={report.responseTimeMs < 300 ? 'FAST' : report.responseTimeMs < 700 ? 'AVG' : 'SLOW'}
                  badgeColor={report.responseTimeMs < 300 ? '#1B5E34' : report.responseTimeMs < 700 ? '#6B4C00' : '#8A1C1C'} />
                <KpiCard icon={<ImageIcon className="w-5 h-5" />} label="Missing Alt"
                  value={report.imagesMissingAlt} unit="imgs" index={2}
                  badge={report.imagesMissingAlt === 0 ? 'CLEAN' : 'ISSUES'}
                  badgeColor={report.imagesMissingAlt === 0 ? '#1B5E34' : '#8A1C1C'} />
                <KpiCard icon={<FileText className="w-5 h-5" />} label="Word Count"
                  value={`~${report.wordCount}`} unit="words" index={3} />
              </div>

              {/* Tabs */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b px-8" style={{ background: 'rgba(250,248,245,0.5)', borderColor: 'rgba(14,27,44,0.08)' }}>
                  {(['seo','a11y','compare','json'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className="relative px-6 py-3.5 text-xs font-mono tracking-[0.2em] uppercase cursor-pointer transition-colors"
                      style={{ color: tab === t ? '#0E1B2C' : '#7A90A8', fontWeight: tab === t ? 600 : 400 }}>
                      {t === 'seo' ? 'SEO' : t === 'a11y' ? 'Accessibility' : t === 'compare' ? 'Compare' : 'JSON'}
                      {tab === t && (
                        <motion.div layoutId="tab-line"
                          className="absolute bottom-0 left-0 right-0 h-[2px]"
                          style={{ background: '#C8A96B' }} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6">

                  {/* ── SEO ── */}
                  {tab === 'seo' && (
                    <div className="max-w-4xl">
                      <p className="text-xs font-mono tracking-widest text-[#7A90A8] uppercase mb-4 font-semibold">
                        Search Engine Optimization Audit
                      </p>
                      <CheckRow n="01" label="Page Title"
                        desc="Should be 10–60 characters. Appears as the main clickable link in search engine result pages."
                        value={report.title}
                        extra={`${report.title !== 'No title tag found' ? report.title.length : 0} characters`}
                        status={report.title === 'No title tag found' ? 'fail' : report.title.length >= 10 && report.title.length <= 60 ? 'pass' : 'warn'} />
                      <CheckRow n="02" label="Meta Description"
                        desc="Should be 50–160 characters. This summary snippet is rendered by search engines under the page title."
                        value={report.metaDescription}
                        extra={`${report.metaDescription !== 'No meta description found' ? report.metaDescription.length : 0} characters`}
                        status={report.metaDescription === 'No meta description found' ? 'fail' : report.metaDescription.length >= 50 && report.metaDescription.length <= 160 ? 'pass' : 'warn'} />
                      <CheckRow n="03" label="H1 Heading Structure"
                        desc="Exactly one <h1> tag should exist per page to establish a clear document hierarchy for crawlers."
                        extra={`Found: ${report.h1Count} H1 element(s) on this page`}
                        status={report.h1Count === 1 ? 'pass' : report.h1Count === 0 ? 'fail' : 'warn'} />
                      <CheckRow n="04" label="Content Density"
                        desc="Pages with 250+ words tend to rank higher for informational and long-tail query intent."
                        extra={`~${report.wordCount} visible words detected in document body`}
                        status={report.wordCount >= 250 ? 'pass' : report.wordCount > 50 ? 'warn' : 'fail'} />
                    </div>
                  )}

                  {/* ── A11Y ── */}
                  {tab === 'a11y' && (
                    <div className="max-w-4xl">
                      <p className="text-xs font-mono tracking-widest text-[#7A90A8] uppercase mb-4 font-semibold">
                        Accessibility — WCAG Audit Checklist
                      </p>
                      <CheckRow n="01" label="Image Alt Attributes"
                        desc="Every image element requires descriptive alt text so assistive screen reader technology can convey visual context."
                        extra={report.imagesMissingAlt === 0 ? 'All images contain valid alt attributes' : `${report.imagesMissingAlt} image(s) are missing alt text`}
                        status={report.imagesMissingAlt === 0 ? 'pass' : 'fail'} />
                      {report.imagesMissingAlt > 0 && (
                        <div className="mt-5 p-6 rounded-2xl border"
                          style={{ background: '#FFF8EE', borderColor: 'rgba(200,169,107,0.3)' }}>
                          <p className="text-xs font-mono tracking-widest text-[#6B4C00] uppercase mb-3 font-bold">Recommended Accessibility Code Fix</p>
                          <div className="space-y-2 font-mono text-xs text-[#0E1B2C] leading-relaxed">
                            <p><span style={{ color: '#8A1C1C' }} className="font-bold">✗ BAD:  </span>{'<img src="photo.jpg" />'}</p>
                            <p><span style={{ color: '#1B5E34' }} className="font-bold">✓ GOOD: </span>{'<img src="photo.jpg" alt="Descriptive text here" />'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Compare ── */}
                  {tab === 'compare' && (
                    <div className="max-w-4xl">
                      <p className="text-xs font-mono tracking-widest text-[#7A90A8] uppercase mb-4 font-semibold">
                        Side-by-Side Competitor Comparison
                      </p>
                      {!compareReport && !comparing && (
                        <form onSubmit={e => { e.preventDefault(); compare(compareUrl); }}
                          className="flex items-center gap-3 bg-white/80 border border-[rgba(14,27,44,0.12)] rounded-2xl px-5 py-3.5 max-w-lg mb-6"
                          style={{ backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(14,27,44,0.04)' }}>
                          <Globe className="w-4 h-4 text-[#7A90A8] shrink-0" />
                          <input type="text" placeholder="competitor url..."
                            value={compareUrl} onChange={e => setCompareUrl(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-xs text-[#0E1B2C] font-medium placeholder:text-[#7A90A8]/60"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                          <button type="submit" disabled={!compareUrl.trim()}
                            className="text-xs font-mono tracking-widest px-4 py-2 rounded-xl cursor-pointer disabled:opacity-40 transition-all font-semibold"
                            style={{ background: '#0E1B2C', color: '#FAF8F5', fontFamily: 'Josefin Sans, sans-serif' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#C8A96B'; e.currentTarget.style.color = '#0E1B2C'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#0E1B2C'; e.currentTarget.style.color = '#FAF8F5'; }}>
                            COMPARE
                          </button>
                        </form>
                      )}
                      {comparing && (
                        <div className="flex items-center gap-3 text-xs font-mono text-[#7A90A8] p-4 font-medium">
                          <Activity className="w-4 h-4 animate-spin text-[#C8A96B]" />
                          Auditing competitor page…
                        </div>
                      )}
                      {compareErr && (
                        <div className="flex items-center gap-2 text-xs font-mono text-[#8A1C1C] mb-4 font-semibold">
                          <AlertTriangle className="w-4 h-4" /> {compareErr}
                          <button onClick={() => setCompareErr(null)} className="ml-2 underline cursor-pointer">reset</button>
                        </div>
                      )}
                      {compareReport && (
                        <>
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-mono text-[#7A90A8] font-medium">
                              {report.url.replace(/^https?:\/\//,'')} vs {compareReport.url.replace(/^https?:\/\//,'')}
                            </p>
                            <button onClick={() => { setCompareReport(null); setCompareUrl(''); }}
                              className="text-xs font-mono text-[#7A90A8] hover:text-[#8A1C1C] cursor-pointer font-semibold">CLEAR</button>
                          </div>
                          <div className="rounded-2xl border overflow-hidden bg-white/70 backdrop-blur"
                            style={{ borderColor: 'rgba(14,27,44,0.1)' }}>
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="border-b" style={{ background: '#F2EFE9', borderColor: 'rgba(14,27,44,0.08)' }}>
                                  <th className="px-5 py-3.5 text-left text-xs font-mono tracking-widest text-[#7A90A8] uppercase font-semibold">Metric</th>
                                  <th className="px-5 py-3.5 text-left text-xs font-mono tracking-widest text-[#0E1B2C] uppercase font-bold">
                                    {report.url.replace(/^https?:\/\//,'').split('/')[0]}
                                  </th>
                                  <th className="px-5 py-3.5 text-left text-xs font-mono tracking-widest text-[#0E1B2C] uppercase font-bold">
                                    {compareReport.url.replace(/^https?:\/\//,'').split('/')[0]}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { label:'Pulse Score',  a:`${report.score}/100`,  b:`${compareReport.score}/100`,
                                    aWin:(report.score||0) > (compareReport.score||0), bWin:(compareReport.score||0) > (report.score||0) },
                                  { label:'Response',     a:`${report.responseTimeMs}ms`, b:`${compareReport.responseTimeMs}ms`,
                                    aWin:report.responseTimeMs < compareReport.responseTimeMs,
                                    bWin:compareReport.responseTimeMs < report.responseTimeMs },
                                  { label:'H1 Count',     a:`${report.h1Count}`,  b:`${compareReport.h1Count}`,
                                    aWin:report.h1Count===1, bWin:compareReport.h1Count===1 },
                                  { label:'Missing Alts', a:`${report.imagesMissingAlt}`, b:`${compareReport.imagesMissingAlt}`,
                                    aWin:report.imagesMissingAlt < compareReport.imagesMissingAlt,
                                    bWin:compareReport.imagesMissingAlt < report.imagesMissingAlt },
                                  { label:'Word Count',   a:`~${report.wordCount}`, b:`~${compareReport.wordCount}`,
                                    aWin:report.wordCount > compareReport.wordCount,
                                    bWin:compareReport.wordCount > report.wordCount },
                                ].map((row) => (
                                  <tr key={row.label} className="border-b transition-colors"
                                    style={{ borderColor:'rgba(14,27,44,0.05)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td className="px-5 py-3.5 text-xs font-mono tracking-widest text-[#7A90A8] uppercase font-medium">{row.label}</td>
                                    <td className="px-5 py-3.5 font-mono font-semibold text-xs" style={{ color: row.aWin ? '#1B5E34' : '#0E1B2C' }}>
                                      {row.a} {row.aWin && <span className="text-xs">▲</span>}
                                    </td>
                                    <td className="px-5 py-3.5 font-mono font-semibold text-xs" style={{ color: row.bWin ? '#1B5E34' : '#0E1B2C' }}>
                                      {row.b} {row.bWin && <span className="text-xs">▲</span>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── JSON ── */}
                  {tab === 'json' && (
                    <div className="max-w-4xl">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs font-mono tracking-widest text-[#7A90A8] uppercase font-semibold">
                          GET /api/audit?url={report.url}
                        </p>
                        <button onClick={copy}
                          className="flex items-center gap-2 text-xs font-mono tracking-widest border border-[rgba(14,27,44,0.12)] px-4 py-2 rounded-xl text-[#0E1B2C] bg-white/70 hover:bg-white cursor-pointer transition-all font-semibold">
                          {copied ? <><Check className="w-3.5 h-3.5 text-[#1B5E34]" /> COPIED</> : <><Copy className="w-3.5 h-3.5" /> COPY</>}
                        </button>
                      </div>
                      <pre className="text-xs leading-relaxed p-6 rounded-2xl overflow-x-auto max-h-[28rem] selection:bg-[#C8A96B]/30"
                        style={{ background: '#0E1B2C', color: '#FAF8F5', fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.7' }}>
                        {JSON.stringify(report, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="shrink-0 px-8 py-4 border-t flex justify-between items-center"
          style={{ borderColor: 'rgba(14,27,44,0.06)', background: 'rgba(250,248,245,0.5)' }}>
          <p className="text-[10px] font-mono tracking-widest text-[#7A90A8] font-medium">
            © {new Date().getFullYear()} PAGEPULSE AUDIT TERMINAL
          </p>
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-mono tracking-widest text-[#7A90A8] hover:text-[#C8A96B] transition-colors flex items-center gap-1 font-medium">
            BUILT FOR DIGITAL HEROES TRAINING TASK BY AYUSH <ExternalLink className="w-3 h-3" />
          </a>
        </footer>
      </div>
    </div>
  );
}
