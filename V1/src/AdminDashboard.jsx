import React, { useState } from 'react';
import {
  Home, User, Briefcase, Award, GraduationCap, Settings,
  LogOut, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Eye, Shield, CheckCircle2
} from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';

// ─── Komponen kecil ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', rows }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    {rows ? (
      <textarea
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    ) : (
      <input
        type={type}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

const SaveButton = ({ onClick, saved }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
      saved
        ? 'bg-green-500 text-white'
        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
    }`}
  >
    {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
    {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
  </button>
);

// ─── Section: Beranda ─────────────────────────────────────────────────────────
function SeksiBerandaEdit({ data, onChange }) {
  const [saved, setSaved] = useState(false);
  const update = (key, val) => onChange({ ...data, [key]: val });
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div>
      <SectionHeader title="Beranda / Hero Section" subtitle="Informasi utama yang tampil di halaman pertama." />
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <InputField label="Nama Lengkap" value={data.nama} onChange={v => update('nama', v)} placeholder="Ulis Leuwol" />
          <InputField label="Inisial (ditampilkan di kartu)" value={data.inisial} onChange={v => update('inisial', v)} placeholder="UL" />
          <InputField label="Gelar / Posisi" value={data.gelar} onChange={v => update('gelar', v)} placeholder="IT Professional & Data Administrator" />
          <InputField label="Sub-Gelar (bawah inisial kartu)" value={data.subGelar} onChange={v => update('subGelar', v)} placeholder="S1 Teknik Informatika" />
          <InputField label="IPK" value={data.ipk} onChange={v => update('ipk', v)} placeholder="3.99" />
          <InputField label="Lokasi" value={data.lokasi} onChange={v => update('lokasi', v)} placeholder="Haria, Saparua" />
          <InputField label="Telepon" value={data.telepon} onChange={v => update('telepon', v)} placeholder="0852 8035 7433" />
          <InputField label="Email" value={data.email} onChange={v => update('email', v)} placeholder="email@example.com" type="email" />
        </div>
        <InputField label="Deskripsi Singkat" value={data.deskripsi} onChange={v => update('deskripsi', v)} placeholder="Deskripsi yang tampil di bawah nama..." rows={3} />
        <div className="pt-2">
          <SaveButton onClick={handleSave} saved={saved} />
        </div>
      </div>
    </div>
  );
}

// ─── Section: Tentang ─────────────────────────────────────────────────────────
function SeksiTentangEdit({ data, onChange }) {
  const [saved, setSaved] = useState(false);
  const update = (key, val) => onChange({ ...data, [key]: val });
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <SectionHeader title="Tentang Saya" subtitle="Paragraf perkenalan dan moto profesional." />
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <InputField label="Paragraf Tentang Saya" value={data.teks} onChange={v => update('teks', v)} rows={5} placeholder="Tulis deskripsi diri Anda..." />
        <InputField label="Moto Profesional" value={data.moto} onChange={v => update('moto', v)} placeholder='"Kalau bisa dipermudah, kenapa harus dipersulit?"' />
        <InputField label="Prinsip Kerja (sub-moto)" value={data.prinsip} onChange={v => update('prinsip', v)} rows={2} placeholder="Prinsip saya dalam bekerja..." />
        <SaveButton onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

// ─── Section: Pengalaman ──────────────────────────────────────────────────────
function SeksiPengalamanEdit({ data, onChange }) {
  const [editId, setEditId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleSave = () => { setSaved(true); setEditId(null); setTimeout(() => setSaved(false), 2000); };

  const addNew = () => {
    const newItem = { id: Date.now(), periode: '', jabatan: '', institusi: '', deskripsi: '', poin: [''], warna: 'blue' };
    onChange([...data, newItem]);
    setEditId(newItem.id);
    setExpandedId(newItem.id);
  };

  const removeItem = (id) => onChange(data.filter(d => d.id !== id));

  const updateItem = (id, key, val) => onChange(data.map(d => d.id === id ? { ...d, [key]: val } : d));

  const addPoin = (id) => {
    const item = data.find(d => d.id === id);
    updateItem(id, 'poin', [...item.poin, '']);
  };
  const updatePoin = (id, idx, val) => {
    const item = data.find(d => d.id === id);
    const newPoin = [...item.poin];
    newPoin[idx] = val;
    updateItem(id, 'poin', newPoin);
  };
  const removePoin = (id, idx) => {
    const item = data.find(d => d.id === id);
    updateItem(id, 'poin', item.poin.filter((_, i) => i !== idx));
  };

  const WARNA_OPTS = ['indigo', 'blue', 'teal', 'slate', 'amber', 'green'];

  return (
    <div>
      <SectionHeader title="Pengalaman Kerja" subtitle="Kelola riwayat pengalaman kerja." />
      <div className="space-y-3 mb-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div>
                <p className="font-semibold text-slate-800 text-sm">{item.jabatan || '(Belum ada jabatan)'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.institusi || '-'} • {item.periode || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setEditId(editId === item.id ? null : item.id); setExpandedId(item.id); }}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                  <Edit3 size={15} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={15} />
                </button>
                {expandedId === item.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>

            {/* Edit Form */}
            {expandedId === item.id && editId === item.id && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <InputField label="Jabatan" value={item.jabatan} onChange={v => updateItem(item.id, 'jabatan', v)} placeholder="Nama jabatan" />
                  <InputField label="Periode" value={item.periode} onChange={v => updateItem(item.id, 'periode', v)} placeholder="Jan 2024 - Sekarang" />
                </div>
                <InputField label="Institusi / Perusahaan" value={item.institusi} onChange={v => updateItem(item.id, 'institusi', v)} placeholder="Nama institusi" />
                <InputField label="Deskripsi (opsional)" value={item.deskripsi} onChange={v => updateItem(item.id, 'deskripsi', v)} rows={2} placeholder="Deskripsi singkat pekerjaan..." />
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Poin-poin Pekerjaan</label>
                  <div className="space-y-2">
                    {item.poin.map((p, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={p}
                          onChange={e => updatePoin(item.id, idx, e.target.value)}
                          placeholder={`Poin ${idx + 1}`}
                        />
                        <button onClick={() => removePoin(item.id, idx)} className="p-2 text-red-400 hover:text-red-600 transition">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addPoin(item.id)} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition mt-1">
                      <Plus size={14} /> Tambah Poin
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Warna Aksen</label>
                  <div className="flex gap-2 flex-wrap">
                    {WARNA_OPTS.map(w => (
                      <button key={w} onClick={() => updateItem(item.id, 'warna', w)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 capitalize transition ${item.warna === w ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <SaveButton onClick={handleSave} saved={saved} />
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={addNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:border-blue-500 hover:bg-blue-50 transition w-full justify-center">
        <Plus size={16} /> Tambah Pengalaman
      </button>
    </div>
  );
}

// ─── Section: Pencapaian ──────────────────────────────────────────────────────
function SeksiPencapaianEdit({ data, onChange }) {
  const [editId, setEditId] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setEditId(null); setTimeout(() => setSaved(false), 2000); };

  const addNew = () => {
    const newItem = { id: Date.now(), tahun: '', judul: '', deskripsi: '', proyekJudul: '', proyekDeskripsi: '', tags: [] };
    onChange([...data, newItem]);
    setEditId(newItem.id);
  };
  const removeItem = (id) => onChange(data.filter(d => d.id !== id));
  const updateItem = (id, key, val) => onChange(data.map(d => d.id === id ? { ...d, [key]: val } : d));

  const updateTags = (id, rawVal) => {
    updateItem(id, 'tags', rawVal.split(',').map(t => t.trim()).filter(Boolean));
  };

  return (
    <div>
      <SectionHeader title="Pencapaian & Proyek" subtitle="Sertifikasi, penghargaan, atau proyek unggulan." />
      <div className="space-y-3 mb-4">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{item.judul || '(Belum ada judul)'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.tahun || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditId(editId === item.id ? null : item.id)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {editId === item.id && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <InputField label="Tahun / Label Badge" value={item.tahun} onChange={v => updateItem(item.id, 'tahun', v)} placeholder="Tahun 2025" />
                  <InputField label="Judul Pencapaian" value={item.judul} onChange={v => updateItem(item.id, 'judul', v)} placeholder="Judul utama..." />
                </div>
                <InputField label="Deskripsi Pencapaian" value={item.deskripsi} onChange={v => updateItem(item.id, 'deskripsi', v)} rows={4} placeholder="Ceritakan pencapaian ini..." />
                <InputField label="Judul Proyek (opsional)" value={item.proyekJudul} onChange={v => updateItem(item.id, 'proyekJudul', v)} placeholder="Proyek Akhir: Nama Proyek" />
                <InputField label="Deskripsi Proyek (opsional)" value={item.proyekDeskripsi} onChange={v => updateItem(item.id, 'proyekDeskripsi', v)} rows={3} placeholder="Deskripsi singkat proyek..." />
                <InputField
                  label="Tags (pisahkan dengan koma)"
                  value={item.tags.join(', ')}
                  onChange={v => updateTags(item.id, v)}
                  placeholder="Flutter, Mobile Development, ..."
                />
                <SaveButton onClick={handleSave} saved={saved} />
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={addNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-amber-300 text-amber-600 font-semibold text-sm hover:border-amber-500 hover:bg-amber-50 transition w-full justify-center">
        <Plus size={16} /> Tambah Pencapaian
      </button>
    </div>
  );
}

// ─── Section: Pendidikan ──────────────────────────────────────────────────────
function SeksiPendidikanEdit({ data, onChange }) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const updateFormal = (id, key, val) =>
    onChange({ ...data, formal: data.formal.map(d => d.id === id ? { ...d, [key]: val } : d) });
  const addFormal = () => {
    const newItem = { id: Date.now(), jenjang: '', institusi: '', periode: '', nilai: '', warna: 'blue' };
    onChange({ ...data, formal: [...data.formal, newItem] });
  };
  const removeFormal = (id) => onChange({ ...data, formal: data.formal.filter(d => d.id !== id) });

  const updateSert = (id, key, val) =>
    onChange({ ...data, sertifikasi: data.sertifikasi.map(d => d.id === id ? { ...d, [key]: val } : d) });
  const addSert = () => {
    const newItem = { id: Date.now(), judul: '', tanggal: '', kategori: 'dicoding', institusi: '' };
    onChange({ ...data, sertifikasi: [...data.sertifikasi, newItem] });
  };
  const removeSert = (id) => onChange({ ...data, sertifikasi: data.sertifikasi.filter(d => d.id !== id) });

  return (
    <div>
      <SectionHeader title="Pendidikan & Sertifikasi" subtitle="Riwayat pendidikan formal dan sertifikat / pelatihan." />

      {/* Pendidikan Formal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Pendidikan Formal</h3>
        <div className="space-y-4">
          {data.formal.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputField label="Jenjang / Nama Sekolah" value={item.jenjang} onChange={v => updateFormal(item.id, 'jenjang', v)} placeholder="S1 Teknik Informatika" />
                <InputField label="Institusi / Jurusan" value={item.institusi} onChange={v => updateFormal(item.id, 'institusi', v)} placeholder="Nama universitas" />
                <InputField label="Periode" value={item.periode} onChange={v => updateFormal(item.id, 'periode', v)} placeholder="2020 - 2025" />
                <InputField label="Nilai / IPK" value={item.nilai} onChange={v => updateFormal(item.id, 'nilai', v)} placeholder="IPK: 3.99" />
              </div>
              <button onClick={() => removeFormal(item.id)} className="flex items-center gap-1 text-red-500 text-xs font-medium hover:text-red-700 transition mt-1">
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          ))}
        </div>
        <button onClick={addFormal} className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-800 transition mt-3">
          <Plus size={14} /> Tambah Pendidikan
        </button>
      </div>

      {/* Sertifikasi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Sertifikasi & Pelatihan</h3>
        <div className="space-y-3">
          {data.sertifikasi.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputField label="Judul Sertifikat / Pelatihan" value={item.judul} onChange={v => updateSert(item.id, 'judul', v)} placeholder="Nama sertifikat..." />
                <InputField label="Tanggal / Masa Berlaku" value={item.tanggal} onChange={v => updateSert(item.id, 'tanggal', v)} placeholder="Sep 2025 - Sep 2028" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.kategori}
                    onChange={e => updateSert(item.id, 'kategori', e.target.value)}
                  >
                    <option value="dicoding">Dicoding</option>
                    <option value="pelatihan">Pelatihan Kampus</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
                {(item.kategori === 'pelatihan' || item.kategori === 'lainnya') && (
                  <InputField label="Institusi" value={item.institusi || ''} onChange={v => updateSert(item.id, 'institusi', v)} placeholder="Nama institusi" />
                )}
              </div>
              <button onClick={() => removeSert(item.id)} className="flex items-center gap-1 text-red-500 text-xs font-medium hover:text-red-700 transition">
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          ))}
        </div>
        <button onClick={addSert} className="flex items-center gap-1 text-teal-600 text-sm font-semibold hover:text-teal-800 transition mt-3">
          <Plus size={14} /> Tambah Sertifikat
        </button>
      </div>

      <SaveButton onClick={handleSave} saved={saved} />
    </div>
  );
}

// ─── Section: Keterampilan ────────────────────────────────────────────────────
function SeksiKeterampilanEdit({ data, onChange }) {
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const addSkill = () => {
    if (newSkill.trim()) {
      onChange([...data, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (idx) => onChange(data.filter((_, i) => i !== idx));
  const updateSkill = (idx, val) => {
    const updated = [...data];
    updated[idx] = val;
    onChange(updated);
  };

  return (
    <div>
      <SectionHeader title="Keterampilan" subtitle="Kelola daftar keterampilan teknis dan profesional." />
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {data.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5">
              <input
                className="text-sm font-medium text-blue-700 bg-transparent outline-none w-auto"
                value={skill}
                onChange={e => updateSkill(idx, e.target.value)}
                style={{ width: `${Math.max(skill.length, 5)}ch` }}
              />
              <button onClick={() => removeSkill(idx)} className="text-blue-400 hover:text-red-500 transition ml-1">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="Tambah keterampilan baru..."
          />
          <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            <Plus size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">💡 Klik teks pada tag untuk mengedit langsung. Tekan Enter untuk tambah cepat.</p>
        <SaveButton onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Password salah. Coba lagi.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-blue-200 text-sm mt-1">Portfolio Ulis Leuwol</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-blue-100 text-sm font-medium mb-2">Password Admin</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="Masukkan password..."
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/30"
          >
            Masuk
          </button>
        </div>
        <p className="text-center text-blue-300/60 text-xs mt-6">Password default: admin123</p>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard({ portfolioData, onDataChange }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('beranda');

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'tentang', label: 'Tentang', icon: User },
    { id: 'pengalaman', label: 'Pengalaman', icon: Briefcase },
    { id: 'pencapaian', label: 'Pencapaian', icon: Award },
    { id: 'pendidikan', label: 'Pendidikan', icon: GraduationCap },
    { id: 'keterampilan', label: 'Keterampilan', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'beranda':
        return <SeksiBerandaEdit data={portfolioData.beranda} onChange={v => onDataChange({ ...portfolioData, beranda: v })} />;
      case 'tentang':
        return <SeksiTentangEdit data={portfolioData.tentang} onChange={v => onDataChange({ ...portfolioData, tentang: v })} />;
      case 'pengalaman':
        return <SeksiPengalamanEdit data={portfolioData.pengalaman} onChange={v => onDataChange({ ...portfolioData, pengalaman: v })} />;
      case 'pencapaian':
        return <SeksiPencapaianEdit data={portfolioData.pencapaian} onChange={v => onDataChange({ ...portfolioData, pencapaian: v })} />;
      case 'pendidikan':
        return <SeksiPendidikanEdit data={portfolioData.pendidikan} onChange={v => onDataChange({ ...portfolioData, pendidikan: v })} />;
      case 'keterampilan':
        return <SeksiKeterampilanEdit data={portfolioData.keterampilan} onChange={v => onDataChange({ ...portfolioData, keterampilan: v })} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed top-0 left-0 h-full z-40 shadow-xl">
        <div className="px-6 py-6 border-b border-slate-800">
          <span className="font-bold text-lg tracking-tight">ULIS.<span className="text-blue-400">ADMIN</span></span>
          <p className="text-slate-400 text-xs mt-1">Dashboard Pengelolaan Portfolio</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveMenu(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeMenu === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <Eye size={18} />
            Lihat Portfolio
          </a>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 max-w-4xl">
        <div className="mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Shield size={12} /> <span>Admin</span> <span>/</span>
            <span className="text-blue-600 font-semibold capitalize">{activeMenu}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {menuItems.find(m => m.id === activeMenu)?.label}
          </h1>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
