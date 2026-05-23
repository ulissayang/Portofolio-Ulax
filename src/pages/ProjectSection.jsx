import React from 'react';
import { Globe, Github, Layers, FileText, Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState, useEffect, useCallback } from 'react';

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-600"/>
        </div>
        <h3 className="font-bold text-slate-900 text-center text-lg mb-2">Hapus Proyek?</h3>
        <p className="text-slate-500 text-center text-sm mb-6">Data yang dihapus tidak bisa dikembalikan.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold text-sm">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectSection({ toast }) {
  const emptyForm = {
    title: '', category: '', description: '',
    tech_stack: [], demo_url: '', github_url: '',
    image_url: '', status: 'Aktif', sort_order: 1
  };

  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('portfolio_projects').select('*').order('sort_order');
    setItems(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (item) => { setEditId(item.id); setForm({ ...item }); };
  const cancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const save = async () => {
    setSaving(true);
    const payload = { ...form };
    delete payload.id; delete payload.created_at;
    if (!payload.sort_order) payload.sort_order = items.length + 1;
    const { error } = editId && editId !== 'new'
      ? await supabase.from('portfolio_projects').update(payload).eq('id', editId)
      : await supabase.from('portfolio_projects').insert(payload);
    if (error) toast('Gagal: ' + error.message, 'error');
    else { toast('Proyek berhasil disimpan!', 'success'); load(); cancelEdit(); }
    setSaving(false);
  };

  const remove = async (id) => {
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (error) toast('Gagal hapus: ' + error.message, 'error');
    else { toast('Proyek dihapus!', 'success'); load(); }
    setConfirm(null);
  };

  const move = async (idx, dir) => {
    const newItems = [...items];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    await Promise.all(newItems.map((item, i) =>
      supabase.from('portfolio_projects').update({ sort_order: i + 1 }).eq('id', item.id)
    ));
    load();
  };

  const techStr = Array.isArray(form.tech_stack) ? form.tech_stack.join(', ') : form.tech_stack || '';

  return (
    <div>
      {confirm && <ConfirmDialog onConfirm={() => remove(confirm)} onCancel={() => setConfirm(null)}/>}

      {/* Header card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Layers size={18} className="text-white"/>
          </div>
          <h2 className="text-white font-bold text-base">Proyek</h2>
        </div>
        <div className="p-6">

          {/* Form */}
          {editId !== null && (
            <div className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
                <h3 className="font-bold text-slate-800 text-sm">{editId === 'new' ? '✨ Tambah Proyek Baru' : '✏️ Edit Proyek'}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-x-5">
                <div className="md:col-span-2">
                  <Field label="Nama Proyek">
                    <input type="text" value={form.title||''} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} placeholder="SiPegawai - Sistem Informasi Pegawai"/>
                  </Field>
                </div>
                <Field label="Kategori">
                  <input type="text" value={form.category||''} onChange={e => setForm({...form, category: e.target.value})} className={inputCls} placeholder="Web App, Mobile, dll"/>
                </Field>
                <Field label="Status">
                  <select value={form.status||'Aktif'} onChange={e => setForm({...form, status: e.target.value})} className={inputCls}>
                    <option value="Aktif">🟢 Aktif (sedang berjalan)</option>
                    <option value="Selesai">🔵 Selesai</option>
                    <option value="Arsip">⚫ Arsip</option>
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Deskripsi">
                    <textarea value={form.description||''} onChange={e => setForm({...form, description: e.target.value})} className={`${inputCls} resize-none`} rows={3} placeholder="Jelaskan fungsi, tujuan, dan dampak proyek..."/>
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Tech Stack" hint="Pisahkan dengan koma">
                    <input type="text" value={techStr} onChange={e => setForm({...form, tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className={inputCls} placeholder="React, Supabase, Tailwind CSS, Cloudflare Pages"/>
                  </Field>
                </div>
                <Field label="🌐 Link Demo / Website">
                  <div className="relative">
                    <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="url" value={form.demo_url||''} onChange={e => setForm({...form, demo_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://silapas.pages.dev"/>
                  </div>
                </Field>
                <Field label="GitHub Repository (opsional)">
                  <div className="relative">
                    <Github size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="url" value={form.github_url||''} onChange={e => setForm({...form, github_url: e.target.value})} className={`${inputCls} pl-9`} placeholder="https://github.com/username/repo"/>
                  </div>
                </Field>
                <div className="md:col-span-2">
                  <Field label="URL Screenshot Proyek" hint="Paste URL gambar screenshot langsung (dari Supabase Storage, Cloudinary, dll)">
                    <input type="url" value={form.image_url||''} onChange={e => setForm({...form, image_url: e.target.value})} className={inputCls} placeholder="https://..."/>
                  </Field>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={cancelEdit} className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-sm">
                  <X size={15}/> Batal
                </button>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm disabled:opacity-60 shadow-lg shadow-emerald-500/25">
                  <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}

          {/* Add button */}
          {editId === null && (
            <button onClick={() => { setEditId('new'); setForm(emptyForm); }}
              className="w-full mb-4 py-3 border-2 border-dashed border-teal-200 text-teal-600 hover:border-teal-400 hover:bg-teal-50 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all">
              <Plus size={16}/> Tambah Proyek Baru
            </button>
          )}

          {/* List */}
          <div className="space-y-2">
            {items.length === 0 && editId === null && (
              <div className="text-center py-10 text-slate-400">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><FileText size={20}/></div>
                <p className="font-medium text-sm">Belum ada proyek</p>
                <p className="text-xs mt-1">Klik tombol di atas untuk menambah</p>
              </div>
            )}
            {items.map((item, idx) => (
              <div key={item.id} className="group bg-white border-2 border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:border-teal-200 hover:shadow-sm transition-all">
                {/* Order */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-100 hover:text-teal-600 disabled:opacity-30"><ChevronUp size={13}/></button>
                  <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-teal-100 hover:text-teal-600 disabled:opacity-30"><ChevronDown size={13}/></button>
                </div>

                {/* Screenshot thumb */}
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-14 h-10 rounded-lg object-cover shrink-0 border border-slate-200"/>
                  : <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Globe size={16} className="text-slate-300"/></div>
                }

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.title}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                      item.status === 'Selesai' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">
                    {item.category}
                    {item.demo_url && <span className="text-teal-500 ml-2">· 🌐 Demo</span>}
                    {item.github_url && <span className="text-slate-500 ml-2">· GitHub</span>}
                  </p>
                  {item.tech_stack?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.tech_stack.slice(0,3).map((t,i) => <span key={i} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>)}
                      {item.tech_stack.length > 3 && <span className="text-xs text-slate-400">+{item.tech_stack.length - 3}</span>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"><Pencil size={14}/></button>
                  <button onClick={() => setConfirm(item.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
