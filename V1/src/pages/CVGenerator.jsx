import React, { useState } from 'react';
import { Download, Loader2, FileText, Sparkles, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── CV Generator ────────────────────────────────────────────────────
// Mengambil data dari Supabase dan generate HTML CV yang bisa diprint/download

export default function CVGenerator({ toast }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(null); // 'creative' | 'ats'

  const fetchData = async () => {
    const [hero, about, experiences, educations, certifications, skills, projects] = await Promise.all([
      supabase.from('portfolio_hero').select('*').single(),
      supabase.from('portfolio_about').select('*').single(),
      supabase.from('portfolio_experiences').select('*').order('sort_order'),
      supabase.from('portfolio_educations').select('*').order('sort_order'),
      supabase.from('portfolio_certifications').select('*').order('sort_order'),
      supabase.from('portfolio_skills').select('*').order('sort_order'),
      supabase.from('portfolio_projects').select('*').order('sort_order'),
    ]);
    return {
      hero: hero.data,
      about: about.data,
      experiences: experiences.data || [],
      educations: educations.data || [],
      certifications: certifications.data || [],
      skills: skills.data || [],
      projects: projects.data || [],
    };
  };

  const generateCreativeCV = (d) => {
    const { hero, about, experiences, educations, certifications, skills, projects } = d;

    const skillsByCategory = {};
    skills.forEach(s => {
      const cat = s.category || 'Lainnya';
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(s.name);
    });

    const certGroups = {};
    certifications.forEach(c => {
      if (!certGroups[c.group_name]) certGroups[c.group_name] = [];
      certGroups[c.group_name].push(c);
    });

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>CV Kreatif - ${hero?.full_name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#f8fafc;color:#1e293b;print-color-adjust:exact;-webkit-print-color-adjust:exact}
  .page{max-width:210mm;margin:0 auto;background:white;min-height:297mm;display:flex;flex-direction:column}
  @media print{body{background:white}.page{max-width:100%;box-shadow:none}}

  /* SIDEBAR */
  .layout{display:flex;flex:1}
  .sidebar{width:72mm;background:linear-gradient(160deg,#1e3a5f 0%,#1d4ed8 60%,#0ea5e9 100%);color:white;padding:32px 24px;flex-shrink:0}
  .main{flex:1;padding:32px 28px;overflow:hidden}

  /* SIDEBAR ELEMENTS */
  .avatar-wrap{text-align:center;margin-bottom:24px}
  .avatar{width:90px;height:90px;border-radius:50%;border:4px solid rgba(255,255,255,0.3);margin:0 auto 12px;overflow:hidden;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:white}
  .avatar img{width:100%;height:100%;object-fit:cover}
  .name-sidebar{font-size:15px;font-weight:700;color:white;text-align:center;line-height:1.3}
  .tagline-sidebar{font-size:10px;color:rgba(255,255,255,0.7);text-align:center;margin-top:4px}
  .divider-s{width:40px;height:2px;background:rgba(255,255,255,0.3);margin:16px auto}

  .s-section{margin-bottom:20px}
  .s-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.6);margin-bottom:8px}
  .s-item{font-size:10px;color:rgba(255,255,255,0.9);margin-bottom:5px;display:flex;align-items:flex-start;gap:6px;line-height:1.4}
  .s-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.5);margin-top:4px;flex-shrink:0}

  .contact-item{display:flex;align-items:center;gap:8px;font-size:10px;color:rgba(255,255,255,0.85);margin-bottom:6px;word-break:break-all}
  .contact-icon{width:20px;height:20px;background:rgba(255,255,255,0.15);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px}

  .skill-tag{display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.9);font-size:9px;font-weight:600;padding:3px 8px;border-radius:20px;margin:2px 2px 2px 0}
  .skill-cat{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.5);margin:8px 0 4px}

  /* MAIN ELEMENTS */
  .main-name{font-size:26px;font-weight:800;color:#1e3a5f;line-height:1.1}
  .main-tagline{font-size:12px;font-weight:500;color:#3b82f6;margin-top:4px;margin-bottom:20px}
  .about-text{font-size:10.5px;color:#475569;line-height:1.7;margin-bottom:24px;border-left:3px solid #3b82f6;padding-left:12px}

  .section{margin-bottom:22px}
  .section-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:6px}
  .section-icon{width:22px;height:22px;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;flex-shrink:0}
  .section-title{font-size:13px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.5px}

  .exp-item{margin-bottom:14px;padding-left:12px;border-left:2px solid #e2e8f0;position:relative}
  .exp-item::before{content:'';position:absolute;left:-5px;top:4px;width:8px;height:8px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 0 1px #3b82f6}
  .exp-title{font-size:11px;font-weight:700;color:#1e293b}
  .exp-company{font-size:10px;font-weight:600;color:#3b82f6}
  .exp-period{font-size:9px;color:#94a3b8;margin:2px 0 4px}
  .exp-desc{font-size:9.5px;color:#64748b;line-height:1.6}
  .exp-task{font-size:9px;color:#475569;line-height:1.6;display:flex;gap:5px;align-items:flex-start;margin-bottom:1px}
  .exp-task::before{content:'▸';color:#3b82f6;flex-shrink:0;margin-top:1px}

  .edu-item{display:flex;gap:12px;margin-bottom:10px;align-items:flex-start}
  .edu-dot{width:10px;height:10px;border-radius:50%;background:#3b82f6;flex-shrink:0;margin-top:3px}
  .edu-degree{font-size:10.5px;font-weight:700;color:#1e293b}
  .edu-inst{font-size:10px;color:#3b82f6;font-weight:500}
  .edu-period{font-size:9px;color:#94a3b8}
  .edu-gpa{display:inline-block;font-size:9px;font-weight:700;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;margin-top:3px}

  .project-item{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:8px}
  .project-name{font-size:10.5px;font-weight:700;color:#1e293b}
  .project-desc{font-size:9px;color:#64748b;line-height:1.6;margin:3px 0}
  .project-stack{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px}
  .project-tag{font-size:8px;font-weight:600;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:4px}

  .cert-item{font-size:9.5px;color:#475569;display:flex;gap:5px;align-items:flex-start;margin-bottom:4px;line-height:1.5}
  .cert-item::before{content:'✓';color:#0ea5e9;font-weight:700;flex-shrink:0}

  .footer{background:#1e3a5f;color:rgba(255,255,255,0.6);text-align:center;font-size:9px;padding:10px;margin-top:auto}

  .gpa-badge{font-size:10px;font-weight:700;color:#3b82f6}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
</style>
</head>
<body>
<div class="page">
  <div class="layout">
    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="avatar-wrap">
        <div class="avatar">
          ${hero?.avatar_url ? `<img src="${hero.avatar_url}" alt="${hero?.full_name}"/>` : (hero?.avatar_initials || 'UL')}
        </div>
        <div class="name-sidebar">${hero?.full_name || ''}</div>
        <div class="tagline-sidebar">${hero?.tagline || ''}</div>
      </div>
      <div class="divider-s"></div>

      <!-- KONTAK -->
      <div class="s-section">
        <div class="s-title">Kontak</div>
        ${hero?.email ? `<div class="contact-item"><div class="contact-icon">@</div>${hero.email}</div>` : ''}
        ${hero?.phone ? `<div class="contact-item"><div class="contact-icon">📞</div>${hero.phone}</div>` : ''}
        ${hero?.location ? `<div class="contact-item"><div class="contact-icon">📍</div>${hero.location}</div>` : ''}
        ${hero?.github_url ? `<div class="contact-item"><div class="contact-icon">GH</div>${hero.github_url.replace('https://', '')}</div>` : ''}
        ${hero?.linkedin_url ? `<div class="contact-item"><div class="contact-icon">in</div>${hero.linkedin_url.replace('https://', '')}</div>` : ''}
      </div>

      <!-- PENDIDIKAN (sidebar) -->
      <div class="s-section">
        <div class="s-title">Pendidikan</div>
        ${educations.map(edu => `
          <div style="margin-bottom:10px">
            <div style="font-size:10px;font-weight:700;color:white;line-height:1.3">${edu.degree}</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.7)">${edu.institution}</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.5)">${edu.period}</div>
            ${edu.gpa ? `<div style="font-size:9px;font-weight:700;color:#fbbf24;margin-top:2px">IPK: ${edu.gpa}</div>` : ''}
            ${edu.grade ? `<div style="font-size:9px;color:rgba(255,255,255,0.6)">Nilai: ${edu.grade}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- KETERAMPILAN (sidebar) -->
      <div class="s-section">
        <div class="s-title">Keterampilan</div>
        ${Object.entries(skillsByCategory).map(([cat, skList]) => `
          <div class="skill-cat">${cat}</div>
          ${skList.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        `).join('')}
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main">
      <div class="main-name">${hero?.full_name || ''}</div>
      <div class="main-tagline">${hero?.degree || ''} · ${hero?.tagline || ''} ${hero?.gpa ? `· IPK ${hero.gpa}` : ''}</div>

      ${about?.description ? `<div class="about-text">${about.description}</div>` : ''}

      <!-- PENGALAMAN -->
      <div class="section">
        <div class="section-header">
          <div class="section-icon">💼</div>
          <div class="section-title">Pengalaman Kerja</div>
        </div>
        ${experiences.map(exp => `
          <div class="exp-item">
            <div class="exp-title">${exp.title}</div>
            <div class="exp-company">${exp.company}</div>
            <div class="exp-period">${exp.period}</div>
            ${exp.description ? `<div class="exp-desc">${exp.description}</div>` : ''}
            ${exp.tasks?.length ? exp.tasks.map(t => `<div class="exp-task">${t}</div>`).join('') : ''}
          </div>
        `).join('')}
      </div>

      <!-- PROYEK -->
      ${projects.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">🚀</div>
          <div class="section-title">Proyek</div>
        </div>
        <div class="two-col">
          ${projects.slice(0,4).map(proj => `
            <div class="project-item">
              <div class="project-name">${proj.title}</div>
              ${proj.description ? `<div class="project-desc">${proj.description.substring(0,120)}${proj.description.length > 120 ? '...' : ''}</div>` : ''}
              ${proj.tech_stack?.length ? `<div class="project-stack">${proj.tech_stack.slice(0,4).map(t => `<span class="project-tag">${t}</span>`).join('')}</div>` : ''}
              ${proj.demo_url ? `<div style="font-size:8px;color:#0ea5e9;margin-top:4px">🌐 ${proj.demo_url}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- SERTIFIKASI -->
      ${certifications.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">🏆</div>
          <div class="section-title">Sertifikasi & Pelatihan</div>
        </div>
        <div class="two-col">
          ${Object.entries(certGroups).map(([group, items]) => `
            <div>
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${group}</div>
              ${items.map(c => `<div class="cert-item">${c.title}${c.date_label ? ` <span style="color:#94a3b8">(${c.date_label})</span>` : ''}</div>`).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${about?.motto ? `
      <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:white;padding:14px 18px;border-radius:10px;margin-top:8px">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.6);margin-bottom:4px">Moto Profesional</div>
        <div style="font-size:12px;font-weight:700;font-style:italic">"${about.motto}"</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="footer">
    CV ini dibuat secara otomatis dari data portfolio · ${hero?.full_name} · ${new Date().getFullYear()}
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;
  };

  const generateATSCV = (d) => {
    const { hero, about, experiences, educations, certifications, skills, projects } = d;

    const skillNames = skills.map(s => s.name).join(' · ');

    const certGroups = {};
    certifications.forEach(c => {
      if (!certGroups[c.group_name]) certGroups[c.group_name] = [];
      certGroups[c.group_name].push(c);
    });

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>CV ATS - ${hero?.full_name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Calibri:wght@400;600;700&family=Liberation+Serif&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;background:white;color:#000;font-size:11pt;line-height:1.4;print-color-adjust:exact}
  .page{max-width:216mm;margin:0 auto;padding:20mm 20mm;min-height:279mm;background:white}
  @media print{.page{padding:15mm 20mm;max-width:100%}}

  .header{text-align:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:14px}
  .name{font-size:20pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#000}
  .tagline{font-size:10pt;color:#333;margin-top:3px}
  .contact{font-size:9.5pt;color:#000;margin-top:6px;display:flex;justify-content:center;flex-wrap:wrap;gap:4px 18px}
  .contact span::before{content:''}

  .section{margin-bottom:14px}
  .sec-title{font-size:10.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #000;padding-bottom:3px;margin-bottom:8px;color:#000}

  .exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px}
  .exp-title{font-size:11pt;font-weight:700;color:#000}
  .exp-company{font-size:10.5pt;font-weight:600;font-style:italic;color:#222}
  .exp-period{font-size:10pt;color:#333;white-space:nowrap;flex-shrink:0;margin-left:10px;font-weight:600}
  .exp-desc{font-size:10pt;color:#333;margin:2px 0 3px;line-height:1.5}
  .exp-item{margin-bottom:10px}

  .bullet{margin:2px 0;font-size:10pt;color:#000;padding-left:16px;position:relative;line-height:1.5}
  .bullet::before{content:'•';position:absolute;left:4px;color:#000}

  .edu-item{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}
  .edu-left .edu-degree{font-size:11pt;font-weight:700;color:#000}
  .edu-left .edu-inst{font-size:10pt;color:#333}
  .edu-right{text-align:right;flex-shrink:0;margin-left:10px}
  .edu-period{font-size:10pt;color:#333}
  .edu-gpa{font-size:10.5pt;font-weight:700;color:#000}

  .skills-text{font-size:10.5pt;color:#000;line-height:1.8}

  .proj-item{margin-bottom:8px}
  .proj-header{display:flex;justify-content:space-between}
  .proj-name{font-size:11pt;font-weight:700}
  .proj-status{font-size:9.5pt;color:#555}
  .proj-desc{font-size:10pt;color:#333;margin:2px 0;line-height:1.5}
  .proj-stack{font-size:9.5pt;color:#444;font-style:italic}

  .cert-item{font-size:10pt;color:#000;padding-left:16px;position:relative;margin-bottom:3px;line-height:1.5}
  .cert-item::before{content:'•';position:absolute;left:4px}

  .summary-text{font-size:10.5pt;color:#000;line-height:1.7;text-align:justify}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="name">${hero?.full_name || ''}</div>
    <div class="tagline">${hero?.tagline || ''} ${hero?.degree ? `| ${hero.degree}` : ''} ${hero?.gpa ? `| IPK: ${hero.gpa}` : ''}</div>
    <div class="contact">
      ${hero?.email ? `<span>${hero.email}</span>` : ''}
      ${hero?.phone ? `<span>${hero.phone}</span>` : ''}
      ${hero?.location ? `<span>${hero.location}</span>` : ''}
      ${hero?.github_url ? `<span>${hero.github_url.replace('https://', '')}</span>` : ''}
      ${hero?.linkedin_url ? `<span>${hero.linkedin_url.replace('https://', '')}</span>` : ''}
    </div>
  </div>

  <!-- RINGKASAN -->
  ${about?.description ? `
  <div class="section">
    <div class="sec-title">Ringkasan Profesional</div>
    <div class="summary-text">${about.description}</div>
  </div>
  ` : ''}

  <!-- KETERAMPILAN -->
  ${skills.length > 0 ? `
  <div class="section">
    <div class="sec-title">Keterampilan</div>
    <div class="skills-text">${skillNames}</div>
  </div>
  ` : ''}

  <!-- PENGALAMAN KERJA -->
  ${experiences.length > 0 ? `
  <div class="section">
    <div class="sec-title">Pengalaman Kerja</div>
    ${experiences.map(exp => `
      <div class="exp-item">
        <div class="exp-header">
          <div>
            <div class="exp-title">${exp.title}</div>
            <div class="exp-company">${exp.company}</div>
          </div>
          <div class="exp-period">${exp.period}</div>
        </div>
        ${exp.description ? `<div class="exp-desc">${exp.description}</div>` : ''}
        ${exp.tasks?.length ? exp.tasks.map(t => `<div class="bullet">${t}</div>`).join('') : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- PROYEK -->
  ${projects.length > 0 ? `
  <div class="section">
    <div class="sec-title">Proyek</div>
    ${projects.map(proj => `
      <div class="proj-item">
        <div class="proj-header">
          <div class="proj-name">${proj.title}</div>
          <div class="proj-status">${proj.status || ''}</div>
        </div>
        ${proj.description ? `<div class="proj-desc">${proj.description}</div>` : ''}
        ${proj.tech_stack?.length ? `<div class="proj-stack">Teknologi: ${proj.tech_stack.join(', ')}</div>` : ''}
        ${proj.demo_url ? `<div class="proj-stack">URL: ${proj.demo_url}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- PENDIDIKAN -->
  ${educations.length > 0 ? `
  <div class="section">
    <div class="sec-title">Pendidikan</div>
    ${educations.map(edu => `
      <div class="edu-item">
        <div class="edu-left">
          <div class="edu-degree">${edu.degree}</div>
          <div class="edu-inst">${edu.institution}</div>
        </div>
        <div class="edu-right">
          <div class="edu-period">${edu.period}</div>
          ${edu.gpa ? `<div class="edu-gpa">IPK: ${edu.gpa}</div>` : ''}
          ${edu.grade ? `<div class="edu-gpa">Nilai: ${edu.grade}</div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- SERTIFIKASI -->
  ${certifications.length > 0 ? `
  <div class="section">
    <div class="sec-title">Sertifikasi & Pelatihan</div>
    ${Object.entries(certGroups).map(([group, items]) => `
      <div style="margin-bottom:6px">
        <div style="font-weight:700;font-size:10.5pt;margin-bottom:3px">${group}</div>
        ${items.map(c => `<div class="cert-item">${c.title}${c.institution ? ` – ${c.institution}` : ''}${c.date_label ? ` (${c.date_label})` : ''}</div>`).join('')}
      </div>
    `).join('')}
  </div>
  ` : ''}

</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;
  };

  const generate = async (cvType) => {
    setLoading(true);
    setType(cvType);
    try {
      const data = await fetchData();
      const html = cvType === 'creative' ? generateCreativeCV(data) : generateATSCV(data);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) toast('Popup diblokir browser. Izinkan popup lalu coba lagi.', 'error');
      else toast(`CV ${cvType === 'creative' ? 'Kreatif' : 'ATS'} berhasil dibuat! Gunakan Ctrl+P untuk menyimpan PDF.`, 'success');
    } catch (err) {
      toast('Gagal membuat CV: ' + err.message, 'error');
    }
    setLoading(false);
    setType(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <FileText size={18} className="text-white"/>
        </div>
        <div>
          <h2 className="text-white font-bold text-base">Generate CV Otomatis</h2>
          <p className="text-white/70 text-xs">Data diambil langsung dari portfolio</p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-slate-500 text-sm mb-6">
          CV dibuat otomatis dari semua data yang sudah kamu isi di portfolio. Tidak perlu input ulang.
          Setelah terbuka, gunakan <strong>Ctrl+P → Save as PDF</strong> untuk menyimpan.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Creative CV */}
          <div className="border-2 border-violet-100 rounded-2xl p-5 hover:border-violet-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-violet-200 group-hover:to-purple-200 transition-all">
              <Sparkles size={22} className="text-violet-600"/>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">CV Kreatif</h3>
            <p className="text-slate-500 text-xs mb-1 leading-relaxed">Desain modern dengan sidebar berwarna. Cocok untuk melamar ke perusahaan startup, tech company, dan kreatif.</p>
            <ul className="text-xs text-slate-400 space-y-1 mb-4">
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-violet-500 shrink-0"/> Sidebar gradient biru</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-violet-500 shrink-0"/> Foto profil + kontak</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-violet-500 shrink-0"/> Skill per kategori</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-violet-500 shrink-0"/> Kartu proyek 2 kolom</li>
            </ul>
            <button onClick={() => generate('creative')} disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && type === 'creative' ? <><Loader2 size={15} className="animate-spin"/> Membuat...</> : <><Download size={15}/> Download CV Kreatif</>}
            </button>
          </div>

          {/* ATS CV */}
          <div className="border-2 border-slate-100 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-all">
              <FileText size={22} className="text-slate-600"/>
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">CV ATS</h3>
            <p className="text-slate-500 text-xs mb-1 leading-relaxed">Format bersih hitam-putih tanpa elemen grafis. Dapat dibaca oleh sistem ATS (Applicant Tracking System) perusahaan besar.</p>
            <ul className="text-xs text-slate-400 space-y-1 mb-4">
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-slate-500 shrink-0"/> Format teks murni</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-slate-500 shrink-0"/> Mudah dibaca sistem HR</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-slate-500 shrink-0"/> Struktur standar kronologis</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-slate-500 shrink-0"/> Keyword-friendly</li>
            </ul>
            <button onClick={() => generate('ats')} disabled={loading}
              className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && type === 'ats' ? <><Loader2 size={15} className="animate-spin"/> Membuat...</> : <><Download size={15}/> Download CV ATS</>}
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
          <Sparkles size={13} className="shrink-0 mt-0.5"/>
          <span>CV akan terbuka di tab baru dan langsung tampil dialog print. Pilih <strong>Save as PDF</strong> → <strong>Save</strong>. Pastikan semua data di portfolio sudah lengkap sebelum generate.</span>
        </div>
      </div>
    </div>
  );
}
