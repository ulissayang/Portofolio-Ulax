import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, User, Briefcase, GraduationCap, Award,
  Settings, LogOut, Plus, Pencil, Trash2, Save, X,
  CheckCircle2, AlertCircle, ChevronUp, ChevronDown, Eye,
  Lock, Camera, Sparkles, FileText, Star, Menu,
  ImageIcon, Loader2, ExternalLink, Globe, Upload, Link2,
  Layers, Github, Linkedin, Download, KeyRound, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProjectSection from './ProjectSection';
import CVGenerator from './CVGenerator';

// ─── helpers ────────────────────────────────────────────────────────
const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

// Ambil public URL Supabase Storage dengan benar (bukan localhost)
function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}


// ─── Pagination ───────────────────────────────────────────────────────
function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const pages = Array.from({length: totalPages}, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
      <p className="text-xs text-slate-400 font-medium">
        Menampilkan {Math.min((page-1)*perPage+1, total)}–{Math.min(page*perPage, total)} dari {total} data
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page-1)} disabled={page<=1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors text-sm font-bold">‹</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${p===page ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page+1)} disabled={page>=totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors text-sm font-bold">›</button>
      </div>
    </div>
  );
}

// ─── Visibility Toggle ────────────────────────────────────────────────
function VisibilityToggle({ visible, onToggle, loading = false }) {
  return (
    <button onClick={onToggle} disabled={loading}
      title={visible ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
        visible ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
      }`}>
      {loading ? <Loader2 size={13} className="animate-spin"/> : visible ? <Eye size={14}/> : <EyeOff size={14}/>}
    </button>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-semibold border ${
      type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-400/30' : 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400/30'
    }`}>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        {type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
      </div>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={15}/></button>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-600"/>
        </div>
        <h3 className="font-bold text-slate-900 text-center text-lg mb-2">Hapus Data?</h3>
        <p className="text-slate-500 text-center text-sm mb-6">{msg}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold text-sm shadow-lg shadow-red-500/30">Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = 'blue', children }) {
  const colors = {
    blue: 'from-blue-500 to-indigo-600', emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600', purple: 'from-purple-500 to-violet-600',
    rose: 'from-rose-500 to-pink-600', slate: 'from-slate-500 to-slate-700',
    teal: 'from-teal-500 to-cyan-600',
  };
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${colors[color]} px-6 py-4 flex items-center gap-3`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon size={18} className="text-white"/>
        </div>
        <h2 className="text-white font-bold text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Photo Upload ────────────────────────────────────────────────────
function PhotoUpload({ currentUrl, onUploaded, toast }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || null);
  const fileRef = useRef();

  useEffect(() => { if (currentUrl) setPreview(currentUrl); }, [currentUrl]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast('Ukuran file max 3MB', 'error'); return; }

    // Preview lokal sementara
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = `avatar_${Date.now()}.${ext}`;

    // Upload ke Supabase Storage
    const { error: upErr } = await supabase.storage
      .from('portfolio-assets')
      .upload(fileName, file, { upsert: true, cacheControl: '3600', contentType: file.type });

    if (upErr) {
      toast('Upload gagal: ' + upErr.message, 'error');
      setPreview(currentUrl || null);
      setUploading(false);
      return;
    }

    // Ambil URL publik dari Supabase (bukan localhost)
    const publicUrl = getPublicUrl('portfolio-assets', fileName);
    setPreview(publicUrl); // ganti preview dari localhost ke Supabase URL
    onUploaded(publicUrl);
    toast('Foto berhasil diupload!', 'success');
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-xl">
          {preview
            ? <img src={preview} alt="avatar" className="w-full h-full object-cover" onError={() => setPreview(null)}/>
            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={36} className="text-blue-300"/></div>
          }
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
            <Loader2 size={28} className="text-white animate-spin"/>
          </div>
        )}
        <button onClick={() => fileRef.current?.click()}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110">
          <Camera size={16}/>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden"/>
      <div className="text-center">
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50">
          {uploading ? 'Mengupload...' : 'Ganti Foto Profil'}
        </button>
        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP · Maks 3MB</p>
      </div>
    </div>
  );
}

// ─── Certificate Upload ───────────────────────────────────────────────
function CertificateUpload({ currentUrl, onUploaded, toast }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Ukuran file max 5MB', 'error'); return; }

    setUploading(true);
    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = `cert_${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('portfolio-assets')
      .upload(fileName, file, { upsert: true, cacheControl: '3600', contentType: file.type });

    if (upErr) { toast('Upload gagal: ' + upErr.message, 'error'); setUploading(false); return; }

    const publicUrl = getPublicUrl('portfolio-assets', fileName);
    onUploaded(publicUrl);
    toast('Sertifikat berhasil diupload!', 'success');
    setUploading(false);
  };

  return (
    <div className="mt-2">
      <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden"/>
      <div className="flex items-center gap-3">
        {currentUrl && (
          <a href={currentUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
            <Eye size={12}/> Lihat File
          </a>
        )}
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          {uploading ? <><Loader2 size={12} className="animate-spin"/> Mengupload...</> : <><Upload size={12}/> {currentUrl ? 'Ganti File' : 'Upload Sertifikat'}</>}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1">JPG, PNG, atau PDF · Maks 5MB</p>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────
function HeroSection({ toast }) {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('portfolio_hero').select('*').single().then(({ data }) => {
      setData(data); setForm(data || {});
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = { ...form }; delete payload.id; delete payload.created_at;
    const { error } = data?.id
      ? await supabase.from('portfolio_hero').update(payload).eq('id', data.id)
      : await supabase.from('portfolio_hero').insert(payload);
    if (error) toast('Gagal: ' + error.message, 'error');
    else { toast('Beranda berhasil disimpan!', 'success'); setData({ ...data, ...form }); setEditing(false); }
    setSaving(false);
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-800 font-medium flex-1">{value || <span className="text-slate-300 italic">—</span>}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Foto Profil" icon={Camera} color="purple">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <PhotoUpload
            currentUrl={data?.avatar_url}
            onUploaded={async (url) => {
              setForm(f => ({ ...f, avatar_url: url }));
              setData(d => ({ ...d, avatar_url: url }));
              if (data?.id) {
                const { error } = await supabase.from('portfolio_hero').update({ avatar_url: url }).eq('id', data.id);
                if (error) toast('Gagal simpan foto: ' + error.message, 'error');
              }
            }}
            toast={toast}
          />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-900 text-lg">{data?.full_name || 'Nama belum diisi'}</h3>
            <p className="text-slate-500 text-sm mt-1">{data?.tagline || '—'}</p>
            {data?.gpa && <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full"><Sparkles size={12}/> IPK: {data.gpa}</div>}
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5"/>
          <span>Pastikan bucket <strong>portfolio-assets</strong> sudah dibuat di Supabase Storage dengan akses <strong>Public</strong>.</span>
        </div>
      </SectionCard>

      <SectionCard title="Informasi Beranda" icon={LayoutDashboard} color="blue">
        {!editing ? (
          <div>
            <InfoRow label="Nama" value={data?.full_name}/>
            <InfoRow label="Tagline" value={data?.tagline}/>
            <InfoRow label="Bio" value={data?.bio}/>
            <InfoRow label="Email" value={data?.email}/>
            <InfoRow label="Telepon" value={data?.phone}/>
            <InfoRow label="Lokasi" value={data?.location}/>
            <InfoRow label="Gelar" value={data?.degree}/>
            <InfoRow label="IPK" value={data?.gpa}/>
            <InfoRow label="Inisial" value={data?.avatar_initials}/>
            <InfoRow label="Brand" value={`${data?.brand_name||''}${data?.brand_suffix||''}`}/>
            <div className="mt-5">
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all">
                <Pencil size={15}/> Edit Informasi
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid md:grid-cols-2 gap-x-5">
              <Field label="Nama Lengkap"><input type="text" value={form.full_name||''} onChange={e => setForm({...form, full_name: e.target.value})} className={inputCls}/></Field>
              <Field label="Tagline / Jabatan"><input type="text" value={form.tagline||''} onChange={e => setForm({...form, tagline: e.target.value})} className={inputCls}/></Field>
              <div className="md:col-span-2"><Field label="Bio Singkat"><textarea value={form.bio||''} onChange={e => setForm({...form, bio: e.target.value})} className={`${inputCls} resize-none`} rows={3}/></Field></div>
              <Field label="Email"><input type="email" value={form.email||''} onChange={e => setForm({...form, email: e.target.value})} className={inputCls}/></Field>
              <Field label="No. Telepon"><input type="text" value={form.phone||''} onChange={e => setForm({...form, phone: e.target.value})} className={inputCls}/></Field>
              <Field label="Lokasi"><input type="text" value={form.location||''} onChange={e => setForm({...form, location: e.target.value})} className={inputCls}/></Field>
              <Field label="Gelar (kartu profil)"><input type="text" value={form.degree||''} onChange={e => setForm({...form, degree: e.target.value})} className={inputCls}/></Field>
              <Field label="IPK"><input type="text" value={form.gpa||''} onChange={e => setForm({...form, gpa: e.target.value})} className={inputCls} placeholder="3.99"/></Field>
              <Field label="Inisial Avatar" hint="Tampil jika tidak ada foto"><input type="text" value={form.avatar_initials||''} onChange={e => setForm({...form, avatar_initials: e.target.value})} className={inputCls} placeholder="UL"/></Field>
              <Field label="Brand Name"><input type="text" value={form.brand_name||''} onChange={e => setForm({...form, brand_name: e.target.value})} className={inputCls}/></Field>
              <Field label="Brand Suffix"><input type="text" value={form.brand_suffix||''} onChange={e => setForm({...form, brand_suffix: e.target.value})} className={inputCls}/></Field>
              <Field label="GitHub URL"><div className="relative"><Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="url" value={form.github_url||''} onChange={e => setForm({...form, github_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://github.com/username"/></div></Field>
              <Field label="LinkedIn URL"><div className="relative"><Linkedin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="url" value={form.linkedin_url||''} onChange={e => setForm({...form, linkedin_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://linkedin.com/in/username"/></div></Field>
              <div className="md:col-span-2"><Field label="URL Download CV" hint="Upload CV ke Google Drive / Storage, paste link publik di sini"><div className="relative"><Download size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="url" value={form.cv_url||''} onChange={e => setForm({...form, cv_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://drive.google.com/..."/></div></Field></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-sm"><X size={15}/> Batal</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm disabled:opacity-60 shadow-lg shadow-emerald-500/25">
                <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── About Section ────────────────────────────────────────────────────
function AboutSection({ toast }) {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('portfolio_about').select('*').single().then(({ data }) => {
      setData(data); setForm(data || {});
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = { ...form }; delete payload.id; delete payload.created_at;
    const { error } = data?.id
      ? await supabase.from('portfolio_about').update(payload).eq('id', data.id)
      : await supabase.from('portfolio_about').insert(payload);
    if (error) toast('Gagal: ' + error.message, 'error');
    else { toast('Tentang berhasil disimpan!', 'success'); setData({ ...data, ...form }); setEditing(false); }
    setSaving(false);
  };

  return (
    <SectionCard title="Tentang Saya" icon={User} color="emerald">
      {!editing ? (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi</p>
            <p className="text-sm text-slate-700 leading-relaxed">{data?.description || <span className="text-slate-400 italic">Belum diisi</span>}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">💬 Moto</p>
            <p className="text-sm font-bold text-blue-800 italic">"{data?.motto || '—'}"</p>
            <p className="text-xs text-blue-600 mt-1">{data?.motto_detail}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CTA</p>
            <p className="text-sm font-semibold text-slate-700">{data?.cta_title}</p>
            <p className="text-xs text-slate-500 mt-1">{data?.cta_description}</p>
          </div>
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm shadow-lg shadow-emerald-500/25">
            <Pencil size={15}/> Edit
          </button>
        </div>
      ) : (
        <div>
          <Field label="Deskripsi"><textarea value={form.description||''} onChange={e => setForm({...form, description: e.target.value})} className={`${inputCls} resize-none`} rows={4}/></Field>
          <Field label="Moto / Kutipan"><input type="text" value={form.motto||''} onChange={e => setForm({...form, motto: e.target.value})} className={inputCls}/></Field>
          <Field label="Penjelasan Moto"><input type="text" value={form.motto_detail||''} onChange={e => setForm({...form, motto_detail: e.target.value})} className={inputCls}/></Field>
          <Field label="Judul CTA"><input type="text" value={form.cta_title||''} onChange={e => setForm({...form, cta_title: e.target.value})} className={inputCls}/></Field>
          <Field label="Deskripsi CTA"><textarea value={form.cta_description||''} onChange={e => setForm({...form, cta_description: e.target.value})} className={`${inputCls} resize-none`} rows={2}/></Field>
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-sm"><X size={15}/> Batal</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm disabled:opacity-60 shadow-lg shadow-emerald-500/25">
              <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Generic List Section ─────────────────────────────────────────────
function ListSection({ title, icon, color, table, emptyForm, renderRow, renderForm, orderField = 'sort_order', toast, perPage = 8 }) {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from(table).select('*').order(orderField);
    setItems(data || []);
    setPage(1);
  }, [table, orderField]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (item) => { setEditId(item.id); setForm({ ...item }); };
  const cancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const save = async () => {
    setSaving(true);
    const payload = { ...form }; delete payload.id; delete payload.created_at;
    if (!payload[orderField]) payload[orderField] = items.length + 1;
    // Set visible default true jika belum ada
    if (payload.visible === undefined) payload.visible = true;
    const { error } = editId && editId !== 'new'
      ? await supabase.from(table).update(payload).eq('id', editId)
      : await supabase.from(table).insert(payload);
    if (error) toast('Gagal: ' + error.message, 'error');
    else { toast('Berhasil disimpan!', 'success'); load(); cancelEdit(); }
    setSaving(false);
  };

  const remove = async (id) => {
    setDeleting(id);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast('Gagal hapus: ' + error.message, 'error');
    else { toast('Data dihapus!', 'success'); load(); }
    setDeleting(null); setConfirm(null);
  };

  const toggleVisible = async (item) => {
    setTogglingId(item.id);
    const { error } = await supabase.from(table).update({ visible: !item.visible }).eq('id', item.id);
    if (error) toast('Gagal: ' + error.message, 'error');
    else {
      toast(!item.visible ? 'Ditampilkan di portfolio' : 'Disembunyikan dari portfolio', 'success');
      setItems(prev => prev.map(i => i.id === item.id ? {...i, visible: !i.visible} : i));
    }
    setTogglingId(null);
  };

  const move = async (idx, dir) => {
    const globalIdx = (page - 1) * perPage + idx;
    const newItems = [...items];
    const target = globalIdx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[globalIdx], newItems[target]] = [newItems[target], newItems[globalIdx]];
    await Promise.all(newItems.map((item, i) => supabase.from(table).update({ [orderField]: i + 1 }).eq('id', item.id)));
    load();
  };

  // Paginate
  const pageItems = items.slice((page-1)*perPage, page*perPage);

  return (
    <div>
      {confirm && <ConfirmDialog msg="Data yang dihapus tidak bisa dikembalikan." onConfirm={() => remove(confirm)} onCancel={() => setConfirm(null)}/>}
      <SectionCard title={title} icon={icon} color={color}>
        {editId !== null && (
          <div className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
              <h3 className="font-bold text-slate-800 text-sm">{editId === 'new' ? '✨ Tambah Data Baru' : '✏️ Edit Data'}</h3>
            </div>
            {renderForm(form, setForm)}
            <div className="flex gap-3 mt-2">
              <button onClick={cancelEdit} className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-sm"><X size={15}/> Batal</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm disabled:opacity-60 shadow-lg shadow-emerald-500/25">
                <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}

        {editId === null && (
          <button onClick={() => { setEditId('new'); setForm(emptyForm); }}
            className="w-full mb-4 py-3 border-2 border-dashed border-blue-200 text-blue-500 hover:border-blue-400 hover:bg-blue-50 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all">
            <Plus size={16}/> Tambah Data Baru
          </button>
        )}

        {/* Info badge visibility */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <Eye size={13} className="text-emerald-500 shrink-0"/>
            <p className="text-xs text-slate-500"><span className="font-semibold text-emerald-600">{items.filter(i=>i.visible!==false).length}</span> tampil · <span className="font-semibold text-slate-400">{items.filter(i=>i.visible===false).length}</span> tersembunyi · Klik ikon mata untuk toggle</p>
          </div>
        )}

        <div className="space-y-2">
          {items.length === 0 && editId === null && (
            <div className="text-center py-10 text-slate-400">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><FileText size={20}/></div>
              <p className="font-medium text-sm">Belum ada data</p>
            </div>
          )}
          {pageItems.map((item, idx) => (
            <div key={item.id} className={`group bg-white border-2 rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-sm ${
              item.visible === false ? 'opacity-60 border-slate-100' : editId === item.id ? 'border-blue-300' : 'border-slate-100 hover:border-blue-200'
            }`}>
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => move(idx, -1)} disabled={idx === 0 && page === 1} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30"><ChevronUp size={13}/></button>
                <button onClick={() => move(idx, 1)} disabled={idx === pageItems.length-1 && page === Math.ceil(items.length/perPage)} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30"><ChevronDown size={13}/></button>
              </div>
              <div className="flex-1 min-w-0">{renderRow(item)}</div>
              <div className="flex gap-1.5 shrink-0">
                <VisibilityToggle
                  visible={item.visible !== false}
                  onToggle={() => toggleVisible(item)}
                  loading={togglingId === item.id}
                />
                <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={14}/></button>
                <button onClick={() => setConfirm(item.id)} disabled={deleting === item.id} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center disabled:opacity-40 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
        <Pagination total={items.length} page={page} perPage={perPage} onChange={setPage}/>
      </SectionCard>
    </div>
  );
}

// ─── Experience Section ───────────────────────────────────────────────
function ExperienceSection({ toast }) {
  const emptyForm = { title: '', company: '', period: '', description: '', tasks: [], color: '#3b82f6', sort_order: 1 };
  const renderRow = (item) => (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color || '#3b82f6' }}/>
      <div>
        <p className="font-bold text-slate-800 text-sm">{item.title}</p>
        <p className="text-slate-500 text-xs">{item.company} · {item.period}</p>
      </div>
    </div>
  );
  const renderForm = (form, setForm) => {
    const tasksStr = Array.isArray(form.tasks) ? form.tasks.join('\n') : form.tasks || '';
    return (
      <div className="grid md:grid-cols-2 gap-x-5">
        <Field label="Jabatan / Posisi"><input type="text" value={form.title||''} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} placeholder="Staff IT"/></Field>
        <Field label="Perusahaan / Instansi"><input type="text" value={form.company||''} onChange={e => setForm({...form, company: e.target.value})} className={inputCls}/></Field>
        <Field label="Periode"><input type="text" value={form.period||''} onChange={e => setForm({...form, period: e.target.value})} className={inputCls} placeholder="Jan 2024 - Sekarang"/></Field>
        <Field label="Warna Badge">
          <div className="flex items-center gap-3">
            <input type="color" value={form.color||'#3b82f6'} onChange={e => setForm({...form, color: e.target.value})} className="h-11 w-16 rounded-xl border border-slate-200 p-1 cursor-pointer"/>
            <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-500 font-mono">{form.color||'#3b82f6'}</div>
          </div>
        </Field>
        <div className="md:col-span-2"><Field label="Deskripsi Singkat"><textarea value={form.description||''} onChange={e => setForm({...form, description: e.target.value})} className={`${inputCls} resize-none`} rows={2}/></Field></div>
        <div className="md:col-span-2"><Field label="Daftar Tugas" hint="Satu tugas per baris"><textarea value={tasksStr} onChange={e => setForm({...form, tasks: e.target.value.split('\n').filter(s => s.trim())})} className={`${inputCls} resize-none`} rows={4} placeholder={"Mengelola database\nMembuat laporan\nKoordinasi tim"}/></Field></div>
      </div>
    );
  };
  return <ListSection title="Pengalaman Kerja" icon={Briefcase} color="blue" table="portfolio_experiences" emptyForm={emptyForm} renderRow={renderRow} renderForm={renderForm} toast={toast}/>;
}

// ─── Achievement / Project Section ────────────────────────────────────
// Mendukung: demo_url (link website), image_url (screenshot)
function AchievementSection({ toast }) {
  const emptyForm = { year: '', title: '', description: '', project_title: '', project_description: '', demo_url: '', tags: [], sort_order: 1 };

  const renderRow = (item) => (
    <div className="flex items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{item.year}</span>
          <p className="font-bold text-slate-800 text-sm">{item.title}</p>
        </div>
        {item.project_title && (
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-slate-400 text-xs">📁 {item.project_title}</p>
            {item.demo_url && <span className="text-xs font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md flex items-center gap-1"><Globe size={10}/> Demo</span>}
          </div>
        )}
      </div>
    </div>
  );

  const renderForm = (form, setForm) => (
    <div className="grid md:grid-cols-2 gap-x-5">
      <Field label="Tahun"><input type="text" value={form.year||''} onChange={e => setForm({...form, year: e.target.value})} className={inputCls} placeholder="2025"/></Field>
      <div className="md:col-span-2"><Field label="Judul Pencapaian"><input type="text" value={form.title||''} onChange={e => setForm({...form, title: e.target.value})} className={inputCls}/></Field></div>
      <div className="md:col-span-2"><Field label="Deskripsi" hint="Tag <strong> diperbolehkan"><textarea value={form.description||''} onChange={e => setForm({...form, description: e.target.value})} className={`${inputCls} resize-none`} rows={3}/></Field></div>
      <Field label="Judul Proyek (opsional)"><input type="text" value={form.project_title||''} onChange={e => setForm({...form, project_title: e.target.value})} className={inputCls}/></Field>
      <Field label="Tags" hint="Pisahkan koma"><input type="text" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags||''} onChange={e => setForm({...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className={inputCls} placeholder="Flutter, React, API"/></Field>
      <div className="md:col-span-2"><Field label="Deskripsi Proyek"><textarea value={form.project_description||''} onChange={e => setForm({...form, project_description: e.target.value})} className={`${inputCls} resize-none`} rows={3}/></Field></div>
      <div className="md:col-span-2">
        <Field label="🌐 Link Demo / Website" hint="URL website proyek yang bisa dikunjungi">
          <div className="relative">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="url" value={form.demo_url||''} onChange={e => setForm({...form, demo_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://silapas.pages.dev"/>
          </div>
        </Field>
      </div>
    </div>
  );

  return <ListSection title="Pencapaian & Proyek" icon={Award} color="amber" table="portfolio_achievements" emptyForm={emptyForm} renderRow={renderRow} renderForm={renderForm} toast={toast}/>;
}

// ─── Education Section ────────────────────────────────────────────────
function EducationSection({ toast }) {
  const emptyForm = { degree: '', institution: '', period: '', gpa: '', grade: '', color: '#2563eb', sort_order: 1 };
  const renderRow = (item) => (
    <div className="flex items-center gap-3">
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color || '#2563eb' }}/>
      <div className="flex-1">
        <p className="font-bold text-slate-800 text-sm">{item.degree}</p>
        <p className="text-slate-500 text-xs">{item.institution} · {item.period}</p>
      </div>
      {item.gpa && <span className="shrink-0 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">IPK {item.gpa}</span>}
    </div>
  );
  const renderForm = (form, setForm) => (
    <div className="grid md:grid-cols-2 gap-x-5">
      <Field label="Gelar / Jenjang"><input type="text" value={form.degree||''} onChange={e => setForm({...form, degree: e.target.value})} className={inputCls} placeholder="S1 Teknik Informatika"/></Field>
      <Field label="Institusi"><input type="text" value={form.institution||''} onChange={e => setForm({...form, institution: e.target.value})} className={inputCls}/></Field>
      <Field label="Periode"><input type="text" value={form.period||''} onChange={e => setForm({...form, period: e.target.value})} className={inputCls} placeholder="2020 - 2025"/></Field>
      <Field label="Warna Aksen">
        <div className="flex items-center gap-3">
          <input type="color" value={form.color||'#2563eb'} onChange={e => setForm({...form, color: e.target.value})} className="h-11 w-16 rounded-xl border border-slate-200 p-1 cursor-pointer"/>
          <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-sm text-slate-500 font-mono">{form.color||'#2563eb'}</div>
        </div>
      </Field>
      <Field label="IPK (opsional)"><input type="text" value={form.gpa||''} onChange={e => setForm({...form, gpa: e.target.value})} className={inputCls} placeholder="3.99"/></Field>
      <Field label="Nilai (jika bukan IPK)"><input type="text" value={form.grade||''} onChange={e => setForm({...form, grade: e.target.value})} className={inputCls} placeholder="90"/></Field>
    </div>
  );
  return <ListSection title="Pendidikan" icon={GraduationCap} color="purple" table="portfolio_educations" emptyForm={emptyForm} renderRow={renderRow} renderForm={renderForm} toast={toast}/>;
}

// ─── Certification Section (+ upload sertifikat) ──────────────────────
function CertificationSection({ toast }) {
  const emptyForm = { title: '', group_name: '', type: 'certification', institution: '', date_label: '', certificate_url: '', sort_order: 1 };

  const renderRow = (item) => (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'certification' ? 'bg-teal-100' : 'bg-blue-100'}`}>
        <CheckCircle2 size={13} className={item.type === 'certification' ? 'text-teal-600' : 'text-blue-600'}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm leading-tight truncate">{item.title}</p>
        <p className="text-slate-400 text-xs mt-0.5">{item.group_name} · {item.date_label}</p>
      </div>
      {item.certificate_url && (
        <a href={item.certificate_url} target="_blank" rel="noreferrer"
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg transition-colors">
          <Eye size={11}/> Lihat
        </a>
      )}
    </div>
  );

  // renderForm pakai komponen khusus karena butuh state upload
  const CertForm = ({ form, setForm }) => (
    <div className="grid md:grid-cols-2 gap-x-5">
      <div className="md:col-span-2"><Field label="Judul Sertifikasi / Pelatihan"><input type="text" value={form.title||''} onChange={e => setForm({...form, title: e.target.value})} className={inputCls}/></Field></div>
      <Field label="Nama Grup"><input type="text" value={form.group_name||''} onChange={e => setForm({...form, group_name: e.target.value})} className={inputCls} placeholder="Sertifikasi Dicoding"/></Field>
      <Field label="Tipe">
        <select value={form.type||'certification'} onChange={e => setForm({...form, type: e.target.value})} className={inputCls}>
          <option value="certification">Sertifikasi</option>
          <option value="training">Pelatihan</option>
        </select>
      </Field>
      <Field label="Institusi (opsional)"><input type="text" value={form.institution||''} onChange={e => setForm({...form, institution: e.target.value})} className={inputCls}/></Field>
      <Field label="Label Waktu"><input type="text" value={form.date_label||''} onChange={e => setForm({...form, date_label: e.target.value})} className={inputCls} placeholder="Sep 2025 - Sep 2028"/></Field>
      <div className="md:col-span-2">
        <Field label="📄 File Sertifikat" hint="Upload gambar atau PDF sertifikat">
          <CertificateUpload
            currentUrl={form.certificate_url}
            onUploaded={(url) => setForm({ ...form, certificate_url: url })}
            toast={toast}
          />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Atau tempel URL sertifikat (opsional)">
          <div className="relative">
            <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="url" value={form.certificate_url||''} onChange={e => setForm({...form, certificate_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://dicoding.com/certificates/..."/>
          </div>
        </Field>
      </div>
    </div>
  );

  return <ListSection title="Sertifikasi & Pelatihan" icon={Star} color="rose" table="portfolio_certifications" emptyForm={emptyForm} renderRow={(item) => renderRow(item)} renderForm={(form, setForm) => <CertForm form={form} setForm={setForm}/>} toast={toast}/>;
}

// ─── Skills Section ───────────────────────────────────────────────────
function SkillSection({ toast }) {
  const emptyForm = { name: '', category: 'Lainnya', sort_order: 1 };
  const renderRow = (item) => (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><CheckCircle2 size={12} className="text-blue-600"/></div>
      <div>
        <span className="font-semibold text-slate-700 text-sm">{item.name}</span>
        {item.category && <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{item.category}</span>}
      </div>
    </div>
  );
  const renderForm = (form, setForm) => (
    <div className="grid md:grid-cols-2 gap-x-5">
      <Field label="Nama Keterampilan"><input type="text" value={form.name||''} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} placeholder="mis. React, Supabase"/></Field>
      <Field label="Kategori">
        <select value={form.category||'Lainnya'} onChange={e => setForm({...form, category: e.target.value})} className={inputCls}>
          {['Frontend','Backend','Database','Tools','Office','Soft Skill','Lainnya'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
    </div>
  );
  return <ListSection title="Keterampilan" icon={Settings} color="slate" table="portfolio_skills" emptyForm={emptyForm} renderRow={renderRow} renderForm={renderForm} toast={toast}/>;
}

// ─── Stats Overview ───────────────────────────────────────────────────
function StatsOverview() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    Promise.all([
      supabase.from('portfolio_experiences').select('id', { count: 'exact' }),
      supabase.from('portfolio_achievements').select('id', { count: 'exact' }),
      supabase.from('portfolio_educations').select('id', { count: 'exact' }),
      supabase.from('portfolio_skills').select('id', { count: 'exact' }),
    ]).then(([exp, ach, edu, sk]) => setStats({ exp: exp.count, ach: ach.count, edu: edu.count, sk: sk.count }));
  }, []);

  const cards = [
    { label: 'Pengalaman', value: stats.exp, icon: Briefcase, bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Pencapaian', value: stats.ach, icon: Award, bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Pendidikan', value: stats.edu, icon: GraduationCap, bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Keterampilan', value: stats.sk, icon: Settings, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(c => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center mb-3`}><Icon size={18}/></div>
            <div className="text-2xl font-extrabold text-slate-900">{c.value ?? '—'}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}



// ─── Section Visibility Settings ─────────────────────────────────────
function SectionVisibilitySection({ toast }) {
  const SECTIONS = [
    { key: 'show_about',          label: 'Tentang Saya',          desc: 'Bagian bio dan moto' },
    { key: 'show_experience',     label: 'Pengalaman Kerja',      desc: 'Timeline pengalaman' },
    { key: 'show_projects',       label: 'Proyek',                desc: 'Kartu portfolio proyek' },
    { key: 'show_achievements',   label: 'Pencapaian',            desc: 'Bootcamp & penghargaan' },
    { key: 'show_education',      label: 'Pendidikan',            desc: 'Riwayat pendidikan' },
    { key: 'show_certifications', label: 'Sertifikasi & Pelatihan', desc: 'Daftar sertifikat' },
    { key: 'show_skills',         label: 'Keterampilan',          desc: 'Skill & kompetensi' },
  ];

  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    supabase.from('portfolio_settings').select('*').then(({ data }) => {
      if (data) {
        const s = {};
        data.forEach(r => { s[r.key] = r.value === true || r.value === 'true'; });
        setSettings(s);
      }
      setLoading(false);
    });
  }, []);

  const toggle = async (key) => {
    setToggling(key);
    const newVal = !settings[key];
    const { error } = await supabase.from('portfolio_settings')
      .upsert({ key, value: newVal, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) toast('Gagal: ' + error.message, 'error');
    else {
      setSettings(s => ({ ...s, [key]: newVal }));
      toast(`${SECTIONS.find(s=>s.key===key)?.label} ${newVal ? 'ditampilkan' : 'disembunyikan'}`, 'success');
    }
    setToggling(null);
  };

  return (
    <SectionCard title="Tampilan Halaman Portfolio" icon={Eye} color="teal">
      <p className="text-slate-500 text-sm mb-5 leading-relaxed">
        Atur section mana yang tampil di halaman portfolio publik. Toggle bisa diubah kapan saja dan langsung berlaku.
      </p>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl"/>)}</div>
      ) : (
        <div className="space-y-2">
          {SECTIONS.map(sec => {
            const isOn = settings[sec.key] !== false;
            return (
              <div key={sec.key}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isOn ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm">{sec.label}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {isOn ? 'Tampil' : 'Tersembunyi'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{sec.desc}</p>
                </div>
                <button onClick={() => toggle(sec.key)} disabled={toggling === sec.key}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-all duration-200 ${
                    isOn ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-200'
                  } disabled:opacity-60`}>
                  <span className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${isOn ? 'translate-x-5' : 'translate-x-0.5'}`}>
                    {toggling === sec.key && <Loader2 size={10} className="animate-spin text-slate-400 m-auto mt-[3px] ml-[3px]"/>}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
        <AlertCircle size={13} className="shrink-0 mt-0.5"/>
        <span>Perubahan langsung berlaku di halaman portfolio. Refresh halaman portfolio untuk melihat hasilnya.</span>
      </div>
    </SectionCard>
  );
}

// ─── Account / Security Section ──────────────────────────────────────
function AccountSection({ toast, session }) {
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Ubah password form
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);

  const sendReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
      redirectTo: window.location.origin + window.location.pathname + '#/admin',
    });
    if (error) toast('Gagal kirim email: ' + error.message, 'error');
    else { toast('Link reset dikirim ke email kamu!', 'success'); setResetSent(true); }
    setLoading(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (form.newPw.length < 8) { toast('Password baru minimal 8 karakter.', 'error'); return; }
    if (form.newPw !== form.confirm) { toast('Konfirmasi password tidak cocok.', 'error'); return; }
    setChangingPw(true);

    // Verifikasi password lama dulu
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: session.user.email, password: form.current,
    });
    if (loginErr) { toast('Password saat ini salah.', 'error'); setChangingPw(false); return; }

    // Update password baru
    const { error } = await supabase.auth.updateUser({ password: form.newPw });
    if (error) toast('Gagal ubah password: ' + error.message, 'error');
    else {
      toast('Password berhasil diubah!', 'success');
      setForm({ current: '', newPw: '', confirm: '' });
    }
    setChangingPw(false);
  };

  const PwInput = ({ field, label, placeholder }) => (
    <Field label={label}>
      <div className="relative">
        <input
          type={showPw[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          className={inputCls + ' pr-11'}
          placeholder={placeholder}
          autoComplete={field === 'current' ? 'current-password' : 'new-password'}
        />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <Eye size={15}/>
        </button>
      </div>
    </Field>
  );

  return (
    <div className="space-y-6">
      {/* Info Akun */}
      <SectionCard title="Informasi Akun" icon={ShieldCheck} color="blue">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <User size={22} className="text-white"/>
          </div>
          <div>
            <p className="font-bold text-slate-800">Administrator</p>
            <p className="text-slate-500 text-sm">{session.user.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Login terakhir: {session.user.last_sign_in_at
                ? new Date(session.user.last_sign_in_at).toLocaleString('id-ID')
                : '—'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Ubah Password */}
      <SectionCard title="Ubah Password" icon={KeyRound} color="emerald">
        <form onSubmit={changePassword} className="space-y-1">
          <PwInput field="current" label="Password Saat Ini" placeholder="Password yang sekarang"/>
          <PwInput field="newPw" label="Password Baru" placeholder="Minimal 8 karakter"/>
          <PwInput field="confirm" label="Konfirmasi Password Baru" placeholder="Ulangi password baru"/>

          {/* Indikator kekuatan password */}
          {form.newPw && (
            <div className="mt-1 mb-3">
              {(() => {
                const pw = form.newPw;
                let strength = 0;
                if (pw.length >= 8) strength++;
                if (/[A-Z]/.test(pw)) strength++;
                if (/[0-9]/.test(pw)) strength++;
                if (/[^A-Za-z0-9]/.test(pw)) strength++;
                const labels = ['', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
                const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
                const textColors = ['', 'text-red-600', 'text-amber-600', 'text-blue-600', 'text-emerald-600'];
                return (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-slate-200'}`}/>
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${textColors[strength]}`}>{labels[strength]}</p>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={changingPw || !form.current || !form.newPw || !form.confirm}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all">
              {changingPw ? <><Loader2 size={15} className="animate-spin"/> Menyimpan...</> : <><KeyRound size={15}/> Simpan Password Baru</>}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Reset via Email */}
      <SectionCard title="Reset Password via Email" icon={Lock} color="amber">
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          Kirim link reset password ke email <strong>{session.user.email}</strong>.
          Gunakan ini jika kamu lupa password dan tidak bisa ubah password secara langsung.
        </p>
        {resetSent ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={18}/>
            Link sudah dikirim! Cek inbox atau folder spam.
          </div>
        ) : (
          <button onClick={sendReset} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all">
            {loading ? <><Loader2 size={15} className="animate-spin"/> Mengirim...</> : <><Lock size={15}/> Kirim Link Reset ke Email</>}
          </button>
        )}
        <p className="text-xs text-slate-400 mt-3">
          ⚠️ Setelah klik link di email, kamu akan diarahkan ke halaman admin untuk mengatur password baru.
        </p>
      </SectionCard>
    </div>
  );
}

// ─── Login Page (dengan reset password & rate limiting) ───────────────
function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Rate limiting: maks 5 percobaan per sesi
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    if (!locked) return;
    let secs = 30;
    setLockTimer(secs);
    const id = setInterval(() => {
      secs--;
      setLockTimer(secs);
      if (secs <= 0) { setLocked(false); setAttempts(0); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true); setMsg({ text: '', type: '' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) { setLocked(true); setMsg({ text: 'Terlalu banyak percobaan. Tunggu 30 detik.', type: 'error' }); }
      else { setMsg({ text: `Email atau password salah. (${next}/5)`, type: 'error' }); }
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setMsg({ text: 'Masukkan email dulu.', type: 'error' }); return; }
    setLoading(true); setMsg({ text: '', type: '' });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + '#/admin',
    });
    if (error) setMsg({ text: 'Gagal: ' + error.message, type: 'error' });
    else setMsg({ text: 'Link reset password sudah dikirim ke email kamu! Cek inbox/spam.', type: 'success' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"/>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"/>
      <div className="relative w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock size={28} className="text-white"/>
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {mode === 'login' ? 'Admin Dashboard' : 'Reset Password'}
            </h1>
            <p className="text-blue-200 text-sm mt-1">Portfolio Ulis Leuwol</p>
          </div>
          <div className="px-8 py-7">
            {msg.text && (
              <div className={`mb-4 p-3 rounded-xl text-sm flex items-start gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 size={15} className="shrink-0 mt-0.5"/> : <AlertCircle size={15} className="shrink-0 mt-0.5"/>}
                {msg.text}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={inputCls} placeholder="admin@email.com" required autoComplete="email"/>
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={inputCls + ' pr-11'}
                      placeholder="••••••••" required autoComplete="current-password"/>
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <Eye size={16}/>
                    </button>
                  </div>
                </Field>
                <div className="text-right -mt-2 mb-1">
                  <button type="button" onClick={() => { setMode('reset'); setMsg({ text:'', type:'' }); }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Lupa password?
                  </button>
                </div>
                <button type="submit" disabled={loading || locked}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60 flex items-center justify-center gap-2">
                  {locked
                    ? `Tunggu ${lockTimer}s...`
                    : loading ? <><Loader2 size={16} className="animate-spin"/> Masuk...</>
                    : <><Lock size={16}/> Masuk</>
                  }
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-slate-500 text-sm mb-4">Masukkan email admin. Link reset password akan dikirim ke email tersebut.</p>
                <Field label="Email Admin">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className={inputCls} placeholder="admin@email.com" required autoComplete="email"/>
                </Field>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin"/> Mengirim...</> : 'Kirim Link Reset'}
                </button>
                <button type="button" onClick={() => { setMode('login'); setMsg({ text:'', type:'' }); }}
                  className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
                  ← Kembali ke Login
                </button>
              </form>
            )}

            <p className="text-center text-xs text-slate-400 mt-5">
              <a href="#/" className="hover:text-blue-600 flex items-center justify-center gap-1">
                <Eye size={12}/> Lihat Portfolio
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin ───────────────────────────────────────────────────────
export default function Admin() {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('adminTab') || 'hero');
  const [toastData, setToastData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((msg, type = 'success') => setToastData({ msg, type }), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
      // Jika user datang dari link reset password, arahkan langsung ke tab Keamanan Akun
      if (session && window.location.hash.includes('type=recovery')) {
        setActiveTab('akun');
        sessionStorage.setItem('adminTab', 'akun');
        showToast('Silakan ubah password kamu sekarang.', 'success');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      // Deteksi password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('akun');
        sessionStorage.setItem('adminTab', 'akun');
      }
    });
    return () => subscription.unsubscribe();
  }, [showToast]);

  if (checkingAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="text-blue-400 animate-spin"/>
        <p className="text-slate-400 text-sm font-medium">Memeriksa sesi...</p>
      </div>
    </div>
  );

  if (!session) return <LoginPage/>;

  const tabs = [
    { id: 'hero', label: 'Beranda', icon: LayoutDashboard, desc: 'Foto & info utama' },
    { id: 'about', label: 'Tentang', icon: User, desc: 'Bio & moto' },
    { id: 'experience', label: 'Pengalaman', icon: Briefcase, desc: 'Riwayat kerja' },
    { id: 'projects', label: 'Proyek', icon: Layers, desc: 'Portofolio proyek' },
    { id: 'achievements', label: 'Pencapaian', icon: Award, desc: 'Bootcamp & pencapaian' },
    { id: 'education', label: 'Pendidikan', icon: GraduationCap, desc: 'Riwayat pendidikan' },
    { id: 'certifications', label: 'Sertifikasi', icon: Star, desc: 'Sertifikat & file' },
    { id: 'skills', label: 'Keterampilan', icon: Settings, desc: 'Daftar skill' },
    { id: 'cv', label: 'Generate CV', icon: FileText, desc: 'Download CV otomatis' },
    { id: 'tampilan', label: 'Tampilan Publik', icon: Eye, desc: 'Atur section yang tampil' },
    { id: 'akun', label: 'Keamanan Akun', icon: ShieldCheck, desc: 'Reset & ubah password' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'hero': return <><StatsOverview/><HeroSection toast={showToast}/></>;
      case 'about': return <AboutSection toast={showToast}/>;
      case 'experience': return <ExperienceSection toast={showToast}/>;
      case 'projects': return <ProjectSection toast={showToast}/>;
      case 'achievements': return <AchievementSection toast={showToast}/>;
      case 'education': return <EducationSection toast={showToast}/>;
      case 'certifications': return <CertificationSection toast={showToast}/>;
      case 'skills': return <SkillSection toast={showToast}/>;
      case 'cv': return <CVGenerator toast={showToast}/>;
      case 'tampilan': return <SectionVisibilitySection toast={showToast}/>;
      case 'akun': return <AccountSection toast={showToast} session={session}/>;
      default: return null;
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {toastData && <Toast msg={toastData.msg} type={toastData.type} onClose={() => setToastData(null)}/>}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={16} className="text-white"/>
            </div>
            <div>
              <div className="font-extrabold text-white text-base leading-tight">ULIS.<span className="text-blue-400">ADMIN</span></div>
              <div className="text-slate-500 text-xs">Portfolio Manager</div>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-4 bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <User size={16} className="text-white"/>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold">Administrator</p>
            <p className="text-slate-400 text-xs truncate">{session.user.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="text-slate-600 text-xs font-bold uppercase tracking-wider px-3 mb-2">Menu</p>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); sessionStorage.setItem('adminTab', tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${active ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white/20' : 'bg-slate-800'}`}><Icon size={15}/></div>
                <div>
                  <div className="text-sm font-bold leading-tight">{tab.label}</div>
                  <div className={`text-xs ${active ? 'text-blue-200' : 'text-slate-600'}`}>{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 space-y-2">
          <a href="#/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all">
            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center"><Eye size={15}/></div>
            Lihat Portfolio
          </a>
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all">
            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center"><LogOut size={15}/></div>
            Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-9 h-9 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl flex items-center justify-center">
              <Menu size={18}/>
            </button>
            {activeTabData && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <activeTabData.icon size={15}/>
                </div>
                <div>
                  <h1 className="font-extrabold text-slate-900 text-base leading-tight">{activeTabData.label}</h1>
                  <p className="text-slate-400 text-xs">{activeTabData.desc}</p>
                </div>
              </div>
            )}
            <div className="ml-auto">
              <a href="#/" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all">
                <Eye size={14}/> Lihat Portfolio
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
