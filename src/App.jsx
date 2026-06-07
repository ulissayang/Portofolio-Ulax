import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Briefcase, GraduationCap, Award, Mail, MapPin,
  Code, Menu, X, CheckCircle2, Star, Building2, ChevronRight,
  Settings, Download, Globe, Github, Linkedin, Layers,
  Loader2, FileText, ExternalLink, Eye, EyeOff
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useInView, usePageSnap } from './hooks/useInView';

// ─── Security helpers ─────────────────────────────────────────────────
function sanitizeHtml(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '').replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<(?!\/?(?:strong|em|b|i|br))[^>]+>/gi, '');
}
function safeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try { const u = new URL(url); return (u.protocol==='https:'||u.protocol==='http:') ? url : null; }
  catch { return null; }
}

// ─── Skeleton ─────────────────────────────────────────────────────────
function Sk({ className = '' }) {
  return <div className={`animate-pulse bg-blue-100/50 rounded ${className}`}/>;
}

// ─── Animate on scroll (lazy reveal) ─────────────────────────────────
// variant: 'fade-up' | 'fade-left' | 'fade-right' | 'fade-down' | 'zoom'
function Reveal({ children, variant = 'fade-up', delay = 0, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.08 });

  const variants = {
    'fade-up':    { hidden: 'opacity-0 translate-y-12', visible: 'opacity-100 translate-y-0' },
    'fade-down':  { hidden: 'opacity-0 -translate-y-10', visible: 'opacity-100 translate-y-0' },
    'fade-left':  { hidden: 'opacity-0 translate-x-12', visible: 'opacity-100 translate-x-0' },
    'fade-right': { hidden: 'opacity-0 -translate-x-12', visible: 'opacity-100 translate-x-0' },
    'zoom':       { hidden: 'opacity-0 scale-90', visible: 'opacity-100 scale-100' },
  };
  const v = variants[variant] || variants['fade-up'];

  return (
    <div ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? v.visible : v.hidden} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}>
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, iconBg = 'bg-blue-100', iconColor = 'text-blue-600' }) {
  return (
    <Reveal variant="fade-right">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={iconColor}/>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
      </div>
    </Reveal>
  );
}

// ─── CV Download Button with section picker ───────────────────────────
function CVDownloadButton({ sm = false }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const [step, setStep] = useState('format'); // 'format' | 'sections'
  const [chosenType, setChosenType] = useState(null);
  const [sections, setSections] = useState({
    ringkasan: true, keterampilan: true, pengalaman: true,
    proyek: true, pendidikan: true, sertifikasi: true,
  });

  const sectionLabels = {
    ringkasan: 'Ringkasan Profesional', keterampilan: 'Keterampilan',
    pengalaman: 'Pengalaman Kerja', proyek: 'Proyek',
    pendidikan: 'Pendidikan', sertifikasi: 'Sertifikasi & Pelatihan',
  };

  const fetchAll = async () => {
    const [h,ab,ex,ed,cert,sk,pr] = await Promise.all([
      supabase.from('portfolio_hero').select('*').single(),
      supabase.from('portfolio_about').select('*').single(),
      supabase.from('portfolio_experiences').select('*').order('sort_order').eq('visible',true),
      supabase.from('portfolio_educations').select('*').order('sort_order').eq('visible',true),
      supabase.from('portfolio_certifications').select('*').order('sort_order').eq('visible',true),
      supabase.from('portfolio_skills').select('*').order('sort_order').eq('visible',true),
      supabase.from('portfolio_projects').select('*').order('sort_order').eq('visible',true),
    ]);
    return { hero:h.data, about:ab.data, exp:ex.data||[], edu:ed.data||[], cert:cert.data||[], skills:sk.data||[], proj:pr.data||[] };
  };

  const go = async () => {
    setLoading(chosenType);
    const d = await fetchAll();
    const byCat = {};
    d.skills.forEach(s => { const c=s.category||'Lainnya'; if(!byCat[c])byCat[c]=[]; byCat[c].push(s.name); });
    const byCertGroup = {};
    d.cert.forEach(c => { if(!byCertGroup[c.group_name])byCertGroup[c.group_name]=[]; byCertGroup[c.group_name].push(c); });
    const html = chosenType === 'creative'
      ? buildCreativeCV(d, byCat, byCertGroup, sections)
      : buildAtsCV(d, byCertGroup, sections);
    window.open(URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),'_blank');
    setLoading(null); setOpen(false); setStep('format'); setChosenType(null);
  };

  const close = () => { setOpen(false); setStep('format'); setChosenType(null); };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o=>!o)}
        className={`flex items-center gap-2 font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 transition-all ${sm?'px-3 py-2 text-xs':'px-5 py-2.5 text-sm'}`}>
        <Download size={sm?13:15}/> {sm?'CV':'Download CV'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close}/>
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72">
            {step === 'format' ? (
              <>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Pilih Format CV</p>
                <div className="space-y-2">
                  {[
                    { id:'creative', label:'CV Kreatif', sub:'Desain modern berwarna', bg:'from-violet-500 to-purple-600' },
                    { id:'ats', label:'CV ATS', sub:'Hitam putih, ramah sistem HR', bg:'from-slate-600 to-slate-700' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => { setChosenType(opt.id); setStep('sections'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all bg-slate-50">
                      <div className={`w-8 h-8 bg-gradient-to-br ${opt.bg} rounded-lg flex items-center justify-center shrink-0`}>
                        {opt.id==='creative'?<Star size={14} className="text-white"/>:<FileText size={14} className="text-white"/>}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">{opt.label}</div>
                        <div className="text-xs text-slate-400">{opt.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setStep('format')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronRight size={16} className="rotate-180"/>
                  </button>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Pilih Section CV</p>
                </div>
                <div className="space-y-1.5 mb-4">
                  {Object.entries(sectionLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <div onClick={() => setSections(s=>({...s,[key]:!s[key]}))}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                          sections[key] ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                        }`}>
                        {sections[key] && <CheckCircle2 size={12} className="text-white"/>}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
                <button onClick={go} disabled={loading !== null}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
                  {loading ? <><Loader2 size={14} className="animate-spin"/>Membuat...</> : <><Download size={14}/>Generate & Download</>}
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center">Tab baru → Ctrl+P → Save as PDF</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// CV builders
function buildCreativeCV(d, byCat, byCertGroup, show) {
  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/><title>CV Kreatif - ${d.hero?.full_name}</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:white;color:#1e293b;print-color-adjust:exact;-webkit-print-color-adjust:exact}.page{max-width:210mm;margin:0 auto;min-height:297mm;display:flex;flex-direction:column}.layout{display:flex;flex:1}.sidebar{width:68mm;background:linear-gradient(160deg,#1e3a5f,#1d4ed8 60%,#0ea5e9);color:white;padding:28px 20px;flex-shrink:0}.main{flex:1;padding:28px 24px}.av{width:80px;height:80px;border-radius:50%;border:3px solid rgba(255,255,255,0.35);margin:0 auto 10px;overflow:hidden;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:white}.av img{width:100%;height:100%;object-fit:cover}.nm{font-size:14px;font-weight:700;text-align:center}.tg{font-size:9px;color:rgba(255,255,255,0.65);text-align:center;margin-top:3px}.div{width:36px;height:2px;background:rgba(255,255,255,0.3);margin:14px auto}.ss{margin-bottom:16px}.st{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.55);margin-bottom:6px}.ci{display:flex;align-items:center;gap:6px;font-size:9px;color:rgba(255,255,255,0.85);margin-bottom:4px;word-break:break-all}.sk{display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.9);font-size:8px;font-weight:600;padding:2px 7px;border-radius:20px;margin:2px 2px 2px 0}.sc{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.45);margin:7px 0 3px}.mn{font-size:22px;font-weight:800;color:#1e3a5f}.mt{font-size:11px;font-weight:500;color:#3b82f6;margin:3px 0 16px}.ab{font-size:9.5px;color:#475569;line-height:1.7;margin-bottom:18px;border-left:3px solid #3b82f6;padding-left:10px}.sec{margin-bottom:18px}.sh{display:flex;align-items:center;gap:7px;margin-bottom:10px;border-bottom:1.5px solid #e2e8f0;padding-bottom:5px}.si{width:20px;height:20px;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);border-radius:5px;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;flex-shrink:0}.stitle{font-size:11px;font-weight:700;color:#1e3a5f;text-transform:uppercase}.ei{margin-bottom:12px;padding-left:10px;border-left:2px solid #e2e8f0;position:relative}.ei::before{content:'';position:absolute;left:-4px;top:3px;width:7px;height:7px;border-radius:50%;background:#3b82f6;border:1.5px solid white;box-shadow:0 0 0 1px #3b82f6}.et{font-size:10px;font-weight:700}.ec{font-size:9px;font-weight:600;color:#3b82f6}.ep{font-size:8px;color:#94a3b8;margin:2px 0 3px}.etask{font-size:8.5px;color:#475569;display:flex;gap:4px;align-items:flex-start;margin-bottom:1px}.etask::before{content:'▸';color:#3b82f6;flex-shrink:0}.tcol{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px}.pn{font-size:9.5px;font-weight:700}.pd{font-size:8px;color:#64748b;margin:2px 0}.pt{font-size:7px;font-weight:600;background:#dbeafe;color:#1d4ed8;padding:1px 5px;border-radius:3px;margin:1px 1px 0 0;display:inline-block}.ci2{font-size:8.5px;color:#475569;display:flex;gap:4px;align-items:flex-start;margin-bottom:3px}.ci2::before{content:'✓';color:#0ea5e9;font-weight:700;flex-shrink:0}.ft{background:#1e3a5f;color:rgba(255,255,255,0.5);text-align:center;font-size:8px;padding:8px;margin-top:auto}</style></head><body><div class="page"><div class="layout"><div class="sidebar"><div style="text-align:center;margin-bottom:18px"><div class="av">${d.hero?.avatar_url?`<img src="${d.hero.avatar_url}" alt=""/>`:(d.hero?.avatar_initials||'UL')}</div><div class="nm">${d.hero?.full_name||''}</div><div class="tg">${d.hero?.tagline||''}</div></div><div class="div"></div><div class="ss"><div class="st">Kontak</div>${d.hero?.email?`<div class="ci">@ ${d.hero.email}</div>`:''} ${d.hero?.phone?`<div class="ci">📞 ${d.hero.phone}</div>`:''} ${d.hero?.location?`<div class="ci">📍 ${d.hero.location}</div>`:''} ${d.hero?.github_url?`<div class="ci">GH ${d.hero.github_url.replace('https://','')}</div>`:''} ${d.hero?.linkedin_url?`<div class="ci">in ${d.hero.linkedin_url.replace('https://','')}</div>`:''}</div>${d.edu.length>0?`<div class="ss"><div class="st">Pendidikan</div>${d.edu.map(e=>`<div style="margin-bottom:8px"><div style="font-size:9px;font-weight:700;color:white">${e.degree}</div><div style="font-size:8px;color:rgba(255,255,255,0.7)">${e.institution}</div><div style="font-size:8px;color:rgba(255,255,255,0.5)">${e.period}</div>${e.gpa?`<div style="font-size:8px;font-weight:700;color:#fbbf24">IPK: ${e.gpa}</div>`:''}</div>`).join('')}</div>`:''} ${show.keterampilan&&Object.keys(byCat).length>0?`<div class="ss"><div class="st">Keterampilan</div>${Object.entries(byCat).map(([c,ss])=>`<div class="sc">${c}</div>${ss.map(s=>`<span class="sk">${s}</span>`).join('')}`).join('')}</div>`:''}</div><div class="main"><div class="mn">${d.hero?.full_name||''}</div><div class="mt">${d.hero?.degree||''} · ${d.hero?.tagline||''} ${d.hero?.gpa?`· IPK ${d.hero.gpa}`:''}</div>${show.ringkasan&&d.about?.description?`<div class="ab">${d.about.description}</div>`:''} ${show.pengalaman&&d.exp.length>0?`<div class="sec"><div class="sh"><div class="si">💼</div><div class="stitle">Pengalaman Kerja</div></div>${d.exp.map(e=>`<div class="ei"><div class="et">${e.title}</div><div class="ec">${e.company}</div><div class="ep">${e.period}</div>${e.description?`<div style="font-size:8.5px;color:#64748b;margin-bottom:2px">${e.description}</div>`:''} ${e.tasks?.length?e.tasks.map(t=>`<div class="etask">${t}</div>`).join(''):''}</div>`).join('')}</div>`:''} ${show.proyek&&d.proj.length>0?`<div class="sec"><div class="sh"><div class="si">🚀</div><div class="stitle">Proyek</div></div><div class="tcol">${d.proj.slice(0,4).map(p=>`<div class="pi"><div class="pn">${p.title}</div>${p.description?`<div class="pd">${p.description.substring(0,90)}...</div>`:''} ${p.tech_stack?.length?p.tech_stack.slice(0,3).map(t=>`<span class="pt">${t}</span>`).join(''):''} ${p.demo_url?`<div style="font-size:7px;color:#0ea5e9;margin-top:3px">🌐 ${p.demo_url}</div>`:''}</div>`).join('')}</div></div>`:''} ${show.sertifikasi&&d.cert.length>0?`<div class="sec"><div class="sh"><div class="si">🏆</div><div class="stitle">Sertifikasi</div></div><div class="tcol">${Object.entries(byCertGroup).map(([g,items])=>`<div><div style="font-size:8px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:3px">${g}</div>${items.map(c=>`<div class="ci2">${c.title}${c.date_label?` (${c.date_label})`:''}</div>`).join('')}</div>`).join('')}</div></div>`:''} ${d.about?.motto?`<div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:white;padding:12px 16px;border-radius:8px;margin-top:6px"><div style="font-size:8px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.5);margin-bottom:3px">Moto</div><div style="font-size:11px;font-weight:700;font-style:italic">"${d.about.motto}"</div></div>`:''}</div></div><div class="ft">CV ${d.hero?.full_name} · ${new Date().getFullYear()}</div></div><script>window.onload=()=>window.print();</script></body></html>`;
}

function buildAtsCV(d, byCertGroup, show) {
  const skills = d.skills.map(s=>s.name).join(' · ');
  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/><title>CV ATS - ${d.hero?.full_name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;background:white;color:#000;font-size:11pt;line-height:1.45;print-color-adjust:exact}.page{max-width:216mm;margin:0 auto;padding:18mm 20mm;min-height:279mm}@media print{.page{padding:14mm 18mm}}.hd{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px}.nm{font-size:18pt;font-weight:700;text-transform:uppercase;letter-spacing:1px}.tg{font-size:10pt;color:#333;margin-top:2px}.ct{font-size:9.5pt;margin-top:5px;display:flex;justify-content:center;flex-wrap:wrap;gap:3px 16px}.sec{margin-bottom:12px}.st{font-size:10pt;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:2px;margin-bottom:7px}.eh{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1px}.et{font-size:11pt;font-weight:700}.ec{font-size:10pt;font-weight:600;font-style:italic;color:#222}.ep{font-size:10pt;color:#333;white-space:nowrap;margin-left:8px;font-weight:600}.ei{margin-bottom:9px}.bl{margin:2px 0;font-size:10pt;padding-left:14px;position:relative}.bl::before{content:'•';position:absolute;left:3px}.di{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px}.dg{font-size:11pt;font-weight:700}.di2{font-size:10pt;color:#333}.dr{text-align:right;margin-left:8px}.dp{font-size:10pt}.dgpa{font-size:10.5pt;font-weight:700}.pi{margin-bottom:7px}.pn{font-size:11pt;font-weight:700}.pd{font-size:10pt;color:#333;margin:1px 0}.ps{font-size:9.5pt;color:#444;font-style:italic}.ci{font-size:10pt;padding-left:14px;position:relative;margin-bottom:2px}.ci::before{content:'•';position:absolute;left:3px}.sm{font-size:10.5pt;line-height:1.7;text-align:justify}</style></head><body><div class="page"><div class="hd"><div class="nm">${d.hero?.full_name||''}</div><div class="tg">${d.hero?.tagline||''} ${d.hero?.degree?`| ${d.hero.degree}`:''} ${d.hero?.gpa?`| IPK: ${d.hero.gpa}`:''}</div><div class="ct">${d.hero?.email?`<span>${d.hero.email}</span>`:''} ${d.hero?.phone?`<span>${d.hero.phone}</span>`:''} ${d.hero?.location?`<span>${d.hero.location}</span>`:''} ${d.hero?.github_url?`<span>${d.hero.github_url.replace('https://','')}</span>`:''} ${d.hero?.linkedin_url?`<span>${d.hero.linkedin_url.replace('https://','')}</span>`:''}</div></div>${show.ringkasan&&d.about?.description?`<div class="sec"><div class="st">Ringkasan Profesional</div><div class="sm">${d.about.description}</div></div>`:''} ${show.keterampilan&&d.skills.length>0?`<div class="sec"><div class="st">Keterampilan</div><div style="font-size:10.5pt;line-height:1.8">${skills}</div></div>`:''} ${show.pengalaman&&d.exp.length>0?`<div class="sec"><div class="st">Pengalaman Kerja</div>${d.exp.map(e=>`<div class="ei"><div class="eh"><div><div class="et">${e.title}</div><div class="ec">${e.company}</div></div><div class="ep">${e.period}</div></div>${e.description?`<div style="font-size:10pt;color:#333;margin:1px 0">${e.description}</div>`:''} ${e.tasks?.length?e.tasks.map(t=>`<div class="bl">${t}</div>`).join(''):''}</div>`).join('')}</div>`:''} ${show.proyek&&d.proj.length>0?`<div class="sec"><div class="st">Proyek</div>${d.proj.map(p=>`<div class="pi"><div class="eh"><div class="pn">${p.title}</div><span style="font-size:9.5pt;color:#555">${p.status||''}</span></div>${p.description?`<div class="pd">${p.description}</div>`:''} ${p.tech_stack?.length?`<div class="ps">Teknologi: ${p.tech_stack.join(', ')}</div>`:''} ${p.demo_url?`<div class="ps">URL: ${p.demo_url}</div>`:''}</div>`).join('')}</div>`:''} ${show.pendidikan&&d.edu.length>0?`<div class="sec"><div class="st">Pendidikan</div>${d.edu.map(e=>`<div class="di"><div><div class="dg">${e.degree}</div><div class="di2">${e.institution}</div></div><div class="dr"><div class="dp">${e.period}</div>${e.gpa?`<div class="dgpa">IPK: ${e.gpa}</div>`:''}</div></div>`).join('')}</div>`:''} ${show.sertifikasi&&d.cert.length>0?`<div class="sec"><div class="st">Sertifikasi & Pelatihan</div>${Object.entries(byCertGroup).map(([g,items])=>`<div style="margin-bottom:5px"><div style="font-weight:700;font-size:10.5pt;margin-bottom:2px">${g}</div>${items.map(c=>`<div class="ci">${c.title}${c.institution?` – ${c.institution}`:''} ${c.date_label?`(${c.date_label})`:''}</div>`).join('')}</div>`).join('')}</div>`:''}</div><script>window.onload=()=>window.print();</script></body></html>`;
}

// ─── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    hero:null, about:null, experiences:[], achievements:[],
    projects:[], educations:[], certifications:[], skills:[],
  });
  const [settings, setSettings] = useState({
    show_about:true, show_experience:true, show_projects:true,
    show_achievements:true, show_education:true,
    show_certifications:true, show_skills:true,
  });

  // Enable page snapping
  usePageSnap();

  useEffect(() => {
    (async () => {
      const [hero, about, exp, ach, proj, edu, cert, skills, sett] = await Promise.all([
        supabase.from('portfolio_hero').select('*').single(),
        supabase.from('portfolio_about').select('*').single(),
        supabase.from('portfolio_experiences').select('*').order('sort_order').eq('visible',true),
        supabase.from('portfolio_achievements').select('*').order('sort_order').eq('visible',true),
        supabase.from('portfolio_projects').select('*').order('sort_order').eq('visible',true),
        supabase.from('portfolio_educations').select('*').order('sort_order').eq('visible',true),
        supabase.from('portfolio_certifications').select('*').order('sort_order').eq('visible',true),
        supabase.from('portfolio_skills').select('*').order('sort_order').eq('visible',true),
        supabase.from('portfolio_settings').select('*'),
      ]);
      setData({ hero:hero.data, about:about.data, experiences:exp.data||[], achievements:ach.data||[], projects:proj.data||[], educations:edu.data||[], certifications:cert.data||[], skills:skills.data||[] });
      // Parse settings
      if (sett.data) {
        const s = {};
        sett.data.forEach(r => { s[r.key] = r.value === true || r.value === 'true'; });
        setSettings(prev => ({...prev, ...s}));
      }
      setLoading(false);
    })();
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false); };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const ids = ['home','about','experience','projects','achievements','education','keterampilan'];
      const pos = window.scrollY + 120;
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= pos && el.offsetTop + el.offsetHeight > pos) setActive(id);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { hero, about } = data;

  const navLinks = [
    { id:'home', l:'Beranda' },
    ...(settings.show_about ? [{ id:'about', l:'Tentang' }] : []),
    ...(settings.show_experience ? [{ id:'experience', l:'Pengalaman' }] : []),
    ...(settings.show_projects ? [{ id:'projects', l:'Proyek' }] : []),
    ...(settings.show_achievements ? [{ id:'achievements', l:'Pencapaian' }] : []),
    ...(settings.show_education ? [{ id:'education', l:'Pendidikan' }] : []),
    ...(settings.show_skills ? [{ id:'keterampilan', l:'Keterampilan' }] : []),
  ];

  const skillGroups = {};
  data.skills.forEach(s => { const c=s.category||'Lainnya'; if(!skillGroups[c])skillGroups[c]=[]; skillGroups[c].push(s); });
  const certGroups = {};
  data.certifications.forEach(c => { if(!certGroups[c.group_name])certGroups[c.group_name]=[]; certGroups[c.group_name].push(c); });

  const catColor = {
    'Frontend':'bg-blue-100 text-blue-700 border-blue-200',
    'Backend':'bg-violet-100 text-violet-700 border-violet-200',
    'Database':'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Tools':'bg-orange-100 text-orange-700 border-orange-200',
    'Office':'bg-slate-100 text-slate-700 border-slate-200',
    'Soft Skill':'bg-pink-100 text-pink-700 border-pink-200',
    'Lainnya':'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden">

      {/* ══ NAVBAR ══ */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5' : 'bg-white/80 backdrop-blur-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollTo('home')} className="font-extrabold text-xl tracking-tight flex-shrink-0">
              <span className="text-blue-600">{hero?.brand_name||'ULIS.'}</span>
              <span className="text-slate-800">{hero?.brand_suffix||'PORTFOLIO'}</span>
            </button>
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${active===l.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'}`}>
                  {l.l}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-2">
              {hero?.github_url && <a href={safeUrl(hero.github_url)||'#'} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"><Github size={16}/></a>}
              {hero?.linkedin_url && <a href={safeUrl(hero.linkedin_url)||'#'} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-all"><Linkedin size={16}/></a>}
              <CVDownloadButton sm/>
            </div>
            <button className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600" onClick={() => setMenuOpen(o=>!o)}>
              {menuOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-3 py-2 space-y-0.5">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scrollTo(l.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${active===l.id?'bg-blue-50 text-blue-600':'text-slate-700 hover:bg-slate-50'}`}>
                  {l.l}
                </button>
              ))}
              <div className="flex items-center gap-2 px-3 pt-3 pb-1 border-t border-slate-100 mt-1">
                {hero?.github_url && <a href={safeUrl(hero.github_url)||'#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-slate-600"><Github size={15}/> GitHub</a>}
                {hero?.linkedin_url && <a href={safeUrl(hero.linkedin_url)||'#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600"><Linkedin size={15}/> LinkedIn</a>}
                <div className="ml-auto"><CVDownloadButton sm/></div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section id="home" className="min-h-screen flex items-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-14">
          <div className="flex-1 text-center md:text-left space-y-6">
            {loading ? (
              <><Sk className="h-6 w-44 mx-auto md:mx-0"/><Sk className="h-14 w-full max-w-md mt-3"/><Sk className="h-5 w-full max-w-lg mt-2"/></>
            ) : (
              <>
                <Reveal variant="fade-down" delay={0}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/> {hero?.tagline}
                  </div>
                </Reveal>
                <Reveal variant="fade-up" delay={100}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                    Halo, Saya{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                      {hero?.full_name}
                    </span>
                  </h1>
                </Reveal>
                <Reveal variant="fade-up" delay={200}>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto md:mx-0 leading-relaxed">{hero?.bio}</p>
                </Reveal>
                <Reveal variant="fade-up" delay={300}>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button onClick={() => scrollTo('projects')} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                      <Layers size={16}/> Lihat Proyek
                    </button>
                    <a href={`mailto:${hero?.email}`} className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center gap-2 border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5">
                      <Mail size={16}/> Hubungi Saya
                    </a>
                    <CVDownloadButton/>
                  </div>
                </Reveal>
                <Reveal variant="fade-up" delay={400}>
                  <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 justify-center md:justify-start">
                    {hero?.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500"/> {hero.location}</span>}
                    {hero?.github_url && <a href={safeUrl(hero.github_url)||'#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"><Github size={14}/> GitHub</a>}
                    {hero?.linkedin_url && <a href={safeUrl(hero.linkedin_url)||'#'} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors"><Linkedin size={14}/> LinkedIn</a>}
                  </div>
                </Reveal>
              </>
            )}
          </div>

          <Reveal variant="zoom" delay={200} className="flex-1 w-full max-w-sm mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-3xl rotate-3 scale-[1.04] -z-10"/>
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Code size={110}/></div>
                <div className="w-32 h-32 rounded-full mb-5 border-4 border-white shadow-xl relative overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 z-10">
                  {loading ? <Sk className="w-full h-full rounded-full"/> : hero?.avatar_url
                    ? <img src={hero.avatar_url} alt={hero?.full_name} className="w-full h-full object-cover" loading="lazy"/>
                    : <span className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-blue-600">{hero?.avatar_initials||'UL'}</span>
                  }
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white z-10"/>
                </div>
                {loading ? (
                  <><Sk className="h-6 w-32 mb-2"/><Sk className="h-4 w-40 mt-1"/></>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 z-10">{hero?.full_name}</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1 z-10">{hero?.degree}</p>
                    {hero?.gpa && <div className="mt-4 px-5 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 z-10"><p className="text-blue-700 font-bold text-sm">IPK: {hero.gpa}</p></div>}
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      {settings.show_about && (
        <section id="about" className="min-h-screen flex items-center py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <SectionHeader icon={User} title="Tentang Saya"/>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 shadow-sm space-y-6 mt-8">
              {loading ? <><Sk className="h-5 w-full"/><Sk className="h-5 w-5/6"/></> : (
                <>
                  <Reveal variant="fade-up">
                    <p className="text-lg text-slate-700 leading-relaxed">{about?.description}</p>
                  </Reveal>
                  {about?.motto && (
                    <Reveal variant="zoom" delay={150}>
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-7 rounded-2xl relative overflow-hidden shadow-xl shadow-blue-500/20">
                        <div className="absolute top-0 right-0 opacity-10"><Star size={140} fill="currentColor" className="-mt-6 -mr-6"/></div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={13}/> Moto Profesional</p>
                        <blockquote className="text-2xl md:text-3xl font-bold italic leading-snug z-10 relative">"{about.motto}"</blockquote>
                        <div className="w-12 h-0.5 bg-blue-300/50 my-4"/>
                        <p className="text-blue-100 text-base z-10 relative">{about.motto_detail}</p>
                      </div>
                    </Reveal>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ EXPERIENCE ══ */}
      {settings.show_experience && (
        <section id="experience" className="min-h-screen flex items-center py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <SectionHeader icon={Briefcase} title="Pengalaman Kerja"/>
            <div className="relative mt-10">
              <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-200 to-transparent -translate-x-1/2"/>
              <div className="space-y-10">
                {loading ? [1,2,3].map(i => <Sk key={i} className="h-44 rounded-2xl ml-14 md:ml-0"/>) :
                  data.experiences.map((exp, idx) => (
                    <Reveal key={exp.id} variant={idx%2===0 ? 'fade-right' : 'fade-left'} delay={idx*80}>
                      <div className={`relative flex md:items-center ${idx%2===0?'md:flex-row':'md:flex-row-reverse'} gap-8`}>
                        <div className="absolute left-5 md:left-1/2 w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white -translate-x-1/2 z-10"
                          style={{backgroundColor:exp.color||'#3b82f6'}}>
                          <Building2 size={14}/>
                        </div>
                        <div className="ml-14 md:ml-0 w-full md:w-[calc(50%-2rem)] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6">
                          <span className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3"
                            style={{background:`${exp.color||'#3b82f6'}15`, color:exp.color||'#3b82f6'}}>
                            {exp.period}
                          </span>
                          <h3 className="font-bold text-lg text-slate-900 mb-1">{exp.title}</h3>
                          <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1.5"><Building2 size={12}/> {exp.company}</p>
                          {exp.description && <p className="text-sm text-slate-600 mb-3 leading-relaxed">{exp.description}</p>}
                          {exp.tasks?.length > 0 && (
                            <ul className="space-y-1.5">
                              {exp.tasks.map((t,i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-600 items-start">
                                  <ChevronRight size={13} className="shrink-0 mt-0.5" style={{color:exp.color||'#3b82f6'}}/> {t}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="hidden md:block w-[calc(50%-2rem)] shrink-0"/>
                      </div>
                    </Reveal>
                  ))
                }
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ PROJECTS ══ */}
      {settings.show_projects && (
        <section id="projects" className="min-h-screen flex items-center py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <SectionHeader icon={Layers} title="Proyek" iconBg="bg-teal-100" iconColor="text-teal-600"/>
            <Reveal variant="fade-up" delay={100}>
              <p className="text-slate-500 text-lg mb-10 ml-14">Sistem dan aplikasi yang telah dibangun dan digunakan secara nyata.</p>
            </Reveal>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Sk key={i} className="h-64 rounded-2xl"/>)}</div>
            ) : data.projects.length === 0 ? (
              <Reveal variant="zoom"><div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200"><Layers size={36} className="mx-auto mb-3 text-slate-300"/><p className="text-slate-400">Belum ada proyek</p></div></Reveal>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.projects.map((proj, idx) => (
                  <Reveal key={proj.id} variant="fade-up" delay={idx*80}>
                    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full">
                      <div className="h-44 overflow-hidden relative bg-gradient-to-br from-slate-100 to-blue-50">
                        {proj.image_url
                          ? <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
                          : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><Globe size={32} className="text-slate-300"/><span className="text-xs text-slate-400">Tidak ada screenshot</span></div>
                        }
                        {proj.status && <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow ${proj.status==='Aktif'?'bg-emerald-500':proj.status==='Selesai'?'bg-blue-500':'bg-slate-500'}`}>{proj.status}</span>}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-base text-slate-900 leading-tight mb-0.5">{proj.title}</h3>
                        {proj.category && <span className="text-xs font-bold text-blue-600 mb-2">{proj.category}</span>}
                        <p className="text-sm text-slate-500 leading-relaxed flex-1">{proj.description}</p>
                        {proj.tech_stack?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {proj.tech_stack.map((t,i) => <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">{t}</span>)}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                          {proj.demo_url && <a href={safeUrl(proj.demo_url)||'#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"><Globe size={13}/> Demo</a>}
                          {proj.github_url && <a href={safeUrl(proj.github_url)||'#'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold transition-colors"><Github size={13}/> GitHub</a>}
                          {!proj.demo_url && !proj.github_url && <span className="text-xs text-slate-400 italic">Link tidak tersedia</span>}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ ACHIEVEMENTS ══ */}
      {settings.show_achievements && (
        <section id="achievements" className="min-h-screen flex items-center py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <SectionHeader icon={Award} title="Pencapaian" iconBg="bg-amber-100" iconColor="text-amber-600"/>
            <div className="space-y-8 mt-10">
              {loading ? <Sk className="h-56 w-full rounded-2xl"/> :
                data.achievements.map((ach, idx) => (
                  <Reveal key={ach.id} variant={idx%2===0?'fade-right':'fade-left'} delay={idx*80}>
                    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                      <div className="absolute -top-8 -right-8 opacity-5 text-amber-400"><Award size={200}/></div>
                      <div className="relative z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold mb-5 shadow-md shadow-amber-500/30">{ach.year}</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{ach.title}</h3>
                        <div className="text-slate-700 text-base leading-relaxed mb-6" dangerouslySetInnerHTML={{__html:sanitizeHtml(ach.description)}}/>
                        {ach.demo_url && <a href={safeUrl(ach.demo_url)||'#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"><Globe size={14}/> Lihat Demo</a>}
                        {ach.project_title && (
                          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-md max-w-3xl">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Code size={18} className="text-blue-600"/></div>
                              <h4 className="font-bold text-xl text-slate-900">{ach.project_title}</h4>
                            </div>
                            <div className="text-slate-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{__html:sanitizeHtml(ach.project_description)}}/>
                            {ach.tags?.length > 0 && <div className="flex flex-wrap gap-2">{ach.tags.map((t,i) => <span key={i} className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg border border-slate-200">{t}</span>)}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* ══ EDUCATION ══ */}
      {(settings.show_education || settings.show_certifications) && (
        <section id="education" className="min-h-screen flex items-center py-20 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid md:grid-cols-2 gap-16">
              {settings.show_education && (
                <div>
                  <SectionHeader icon={GraduationCap} title="Pendidikan"/>
                  <div className="space-y-4 mt-8">
                    {loading ? [1,2].map(i => <Sk key={i} className="h-32 rounded-2xl"/>) :
                      data.educations.map((edu, idx) => (
                        <Reveal key={edu.id} variant="fade-right" delay={idx*100}>
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{backgroundColor:edu.color||'#2563eb'}}/>
                            <h3 className="font-bold text-lg text-slate-900">{edu.degree}</h3>
                            <p className="font-semibold text-sm mb-3" style={{color:edu.color||'#2563eb'}}>{edu.institution}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">{edu.period}</span>
                              {edu.gpa && <span className="font-extrabold text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-lg">IPK: {edu.gpa}</span>}
                              {edu.grade && <span className="font-bold text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">Nilai: {edu.grade}</span>}
                            </div>
                          </div>
                        </Reveal>
                      ))
                    }
                  </div>
                </div>
              )}
              {settings.show_certifications && (
                <div>
                  <SectionHeader icon={Award} title="Sertifikasi & Pelatihan" iconBg="bg-teal-100" iconColor="text-teal-600"/>
                  <div className="space-y-4 mt-8">
                    {loading ? [1,2].map(i => <Sk key={i} className="h-40 rounded-2xl"/>) :
                      Object.entries(certGroups).map(([group, items], idx) => (
                        <Reveal key={group} variant="fade-left" delay={idx*100}>
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3 mb-4">{group}</h3>
                            <div className="space-y-3">
                              {items.map(cert => (
                                <div key={cert.id} className="flex gap-3 items-start">
                                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${cert.type==='certification'?'bg-teal-100 text-teal-600':'bg-blue-100 text-blue-600'}`}><CheckCircle2 size={14}/></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-800">{cert.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{cert.institution&&<span className="text-slate-500">{cert.institution} · </span>}{cert.date_label}</p>
                                    {cert.certificate_url && <a href={safeUrl(cert.certificate_url)||'#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-md transition-colors"><ExternalLink size={10}/> Lihat Sertifikat</a>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Reveal>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ SKILLS ══ */}
      {settings.show_skills && (
        <section id="keterampilan" className="min-h-screen flex items-center py-20 bg-gradient-to-br from-slate-50 to-blue-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-12">
              <Reveal variant="zoom">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center"><Settings size={20} className="text-blue-600"/></div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Keterampilan</h2>
                </div>
                <p className="text-slate-500 text-lg">Teknologi dan kemampuan yang saya kuasai.</p>
              </Reveal>
            </div>
            {loading ? <div className="grid md:grid-cols-3 gap-5">{[1,2,3].map(i=><Sk key={i} className="h-36 rounded-2xl"/>)}</div> :
              Object.keys(skillGroups).length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Object.entries(skillGroups).map(([cat, skills], idx) => (
                    <Reveal key={cat} variant="fade-up" delay={idx*80}>
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow h-full">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border mb-4 ${catColor[cat]||catColor['Lainnya']}`}>
                          <Settings size={11}/> {cat}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <span key={skill.id} className="flex items-center gap-1.5 text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg cursor-default hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all hover:-translate-y-0.5">
                              <CheckCircle2 size={12} className="text-blue-500"/> {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                  {data.skills.map((skill, idx) => (
                    <Reveal key={skill.id} variant="fade-up" delay={idx*40}>
                      <span className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-slate-200 text-slate-700 font-bold shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-0.5 transition-all cursor-default">
                        <CheckCircle2 size={16} className="text-blue-500"/> {skill.name}
                      </span>
                    </Reveal>
                  ))}
                </div>
              )
            }
          </div>
        </section>
      )}

      {/* ══ CTA ══ */}
      <section className="min-h-[50vh] flex items-center py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2"/>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/2 translate-y-1/2"/>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 w-full">
          <Reveal variant="zoom">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">{about?.cta_title||'Tertarik untuk bekerja sama?'}</h2>
            <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg">{about?.cta_description}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href={`mailto:${hero?.email}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-base hover:bg-blue-50 hover:scale-105 transition-all shadow-xl">
                <Mail size={18}/> Hubungi via Email
              </a>
              <CVDownloadButton/>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-extrabold text-xl text-white"><span className="text-blue-400">{hero?.brand_name||'ULIS.'}</span>{hero?.brand_suffix||'PORTFOLIO'}</p>
            <p className="text-slate-500 text-sm mt-1">© {new Date().getFullYear()} {hero?.full_name}. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hero?.email && <a href={`mailto:${hero.email}`} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"><Mail size={14} className="text-blue-400"/> {hero.email}</a>}
            {hero?.github_url && <a href={safeUrl(hero.github_url)||'#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"><Github size={14}/> GitHub</a>}
            {hero?.linkedin_url && <a href={safeUrl(hero.linkedin_url)||'#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"><Linkedin size={14} className="text-blue-400"/> LinkedIn</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
