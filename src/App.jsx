import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, GraduationCap, Award, 
  Mail, Phone, MapPin, Code, Menu, X, 
  CheckCircle2, Star, Building2, ChevronRight, Settings
} from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Smooth scroll handler
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Scroll spy to update active nav link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'experience', 'achievements', 'education', 'keterampilan'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && 
            element.offsetTop <= scrollPosition && 
            (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Beranda' },
    { id: 'about', label: 'Tentang' },
    { id: 'experience', label: 'Pengalaman' },
    { id: 'achievements', label: 'Pencapaian' },
    { id: 'education', label: 'Pendidikan' },
    { id: 'keterampilan', label: 'Keterampilan' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => scrollTo('home')}>
              <span className="font-bold text-xl tracking-tight text-blue-700">ULIS.<span className="text-slate-800">PORTFOLIO</span></span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === link.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeSection === link.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-2">
            IT Professional & Data Administrator
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            Halo, Saya <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              Ulis Leuwol
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto md:mx-0">
            Mencari solusi yang efisien, praktis, dan bermanfaat melalui teknologi dan pengelolaan data yang baik.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
            <button onClick={() => scrollTo('experience')} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30 flex items-center justify-center gap-2">
              <Briefcase size={18} />
              Lihat Pengalaman
            </button>
            <a href="mailto:ulissleksmart@gmail.com" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-slate-700 border border-slate-200 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
              <Mail size={18} />
              Hubungi Saya
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500"/> Haria, Saparua</span>
            <span className="flex items-center gap-1.5"><Phone size={16} className="text-blue-500"/> 0852 8035 7433</span>
          </div>
        </div>
        
        {/* Profile Card */}
        <div className="flex-1 w-full max-w-md mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center aspect-square relative overflow-hidden hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-600">
              <Code size={120} />
            </div>
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg z-10 relative">
              <span className="text-5xl font-bold text-blue-600">UL</span>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 z-10">Ulis Leuwol</h3>
            <p className="text-slate-500 mt-2 z-10 font-medium">S1 Teknik Informatika</p>
            <div className="mt-4 z-10 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <p className="text-blue-700 font-bold text-sm">IPK: 3.99</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <User className="text-blue-600" size={28} />
            <h2 className="text-3xl font-bold text-slate-900">Tentang Saya</h2>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <p className="text-lg text-slate-700 leading-relaxed">
              Saya adalah pribadi yang memiliki semangat belajar tinggi, terbuka terhadap hal baru, dan selalu berusaha memberikan hasil terbaik dalam setiap pekerjaan. Saya menyukai tantangan yang dapat mengembangkan kemampuan diri serta memiliki komitmen kuat terhadap tanggung jawab dan profesionalitas.
            </p>
            
            <div className="bg-blue-600 text-white p-6 md:p-8 rounded-xl relative overflow-hidden shadow-lg shadow-blue-500/20">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <Star size={120} fill="currentColor" />
              </div>
              <h3 className="text-blue-100 font-medium mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
                <Award size={16} /> Moto Profesional
              </h3>
              <blockquote className="text-2xl md:text-3xl font-bold italic relative z-10 leading-tight">
                "Kalau bisa dipermudah, kenapa harus dipersulit?"
              </blockquote>
              <div className="w-12 h-1 bg-blue-400 mt-4 mb-4 opacity-50"></div>
              <p className="text-blue-50 relative z-10 text-lg">
                Prinsip saya dalam bekerja adalah mencari solusi yang efisien, praktis, dan bermanfaat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <Briefcase className="text-blue-600" size={28} />
            <h2 className="text-3xl font-bold text-slate-900">Pengalaman Kerja</h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:via-slate-300 before:to-transparent">
            
            {/* Experience 1 - MagangHub Lapas Saparua */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Building2 size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-indigo-600 font-semibold text-sm bg-indigo-50 px-3 py-1 rounded-full">24 Nov 2025 - 24 Mei 2026</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-1">Pengelola Fasilitas Umum</h3>
                <div className="text-slate-500 font-medium text-sm mb-4 flex items-center gap-1.5">
                  <Building2 size={14} /> MagangHub Kemnaker - Lapas Kelas III Saparua
                </div>
                <p className="text-slate-600 text-sm font-medium mb-3">Deskripsi Pekerjaan:</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2 items-start"><ChevronRight size={16} className="text-indigo-500 shrink-0 mt-0.5"/> <span>Menyiapkan sarana pendukung kegiatan umum seperti ruang rapat, kendaraan, dan logistik.</span></li>
                  <li className="flex gap-2 items-start"><ChevronRight size={16} className="text-indigo-500 shrink-0 mt-0.5"/> <span>Memantau penggunaan fasilitas agar efisien.</span></li>
                  <li className="flex gap-2 items-start"><ChevronRight size={16} className="text-indigo-500 shrink-0 mt-0.5"/> <span>Mengatur perawatan rutin fasilitas umum.</span></li>
                  <li className="flex gap-2 items-start"><ChevronRight size={16} className="text-indigo-500 shrink-0 mt-0.5"/> <span>Membantu kebutuhan operasional kantor.</span></li>
                </ul>
              </div>
            </div>

            {/* Experience 2 - Admin Sektor (Ongoing) */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Briefcase size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-full">Januari 2025 - Sekarang</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-1">Admin Sektor - MSIPT & Website Gereja</h3>
                <div className="text-slate-500 font-medium text-sm mb-4 flex items-center gap-1.5">
                  <Building2 size={14} /> Gereja Protestan Maluku - Halong Anugerah
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  Bertanggung jawab dalam pengelolaan data jemaat melalui sistem informasi pelayanan terpadu berbasis web.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5"/> <span>Pembaruan data jemaat yang telah ada serta penambahan data baru secara berkala.</span></li>
                  <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5"/> <span>Memastikan akurasi, kelengkapan, dan keterkinian informasi.</span></li>
                  <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5"/> <span>Melaksanakan validasi data dan koordinasi lintas sektor.</span></li>
                </ul>
              </div>
            </div>

            {/* Experience 3 - Freelance KSOP */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-teal-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Code size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-teal-600 font-semibold text-sm bg-teal-50 px-3 py-1 rounded-full">Oktober 2021 - Sekarang</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-1">Freelance Admin Data Processor</h3>
                <div className="text-slate-500 font-medium text-sm mb-4 flex items-center gap-1.5">
                  <Building2 size={14} /> KSOP Kelas I Ambon (Remote)
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  Dipercaya secara pribadi untuk melanjutkan tugas pengolahan data dan penyusunan laporan bulanan secara remote berdasarkan kinerja saat KKP.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5"/> <span>Mengunduh data dari website SPS Inapornet Kemenhub.</span></li>
                  <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5"/> <span>Mengolah data aktivitas bongkar muat barang berbahaya & pengisian bahan bakar kapal.</span></li>
                  <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5"/> <span>Menginput data ke MS Excel dan menyusun laporan bulanan.</span></li>
                </ul>
              </div>
            </div>

            {/* Experience 4 - KKP KSOP */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Briefcase size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-slate-600 font-semibold text-sm bg-slate-100 px-3 py-1 rounded-full">Juli 2021 - September 2021</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-1">Administrasi - KKP</h3>
                <div className="text-slate-500 font-medium text-sm mb-4 flex items-center gap-1.5">
                  <Building2 size={14} /> KSOP Kelas I Ambon
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Kuliah Kerja Praktek (KKP). Bertugas mengambil data dari website SPS Inapornet milik Kementerian Perhubungan, mencetak, serta menginput data ke dalam Excel untuk disusun menjadi laporan bulanan.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <Award className="text-amber-500" size={28} />
            <h2 className="text-3xl font-bold text-slate-900">Pencapaian & Proyek</h2>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-amber-200 opacity-50 transition-transform duration-700 hover:rotate-12">
              <Award size={250} />
            </div>
            
            <div className="relative z-10">
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500 text-white font-bold text-sm mb-6 shadow-md shadow-amber-500/20">
                Tahun 2025
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Lulus BEKUP Create: Upskilling Bootcamp 2025</h3>
              <p className="text-slate-700 leading-relaxed mb-8 max-w-3xl text-lg">
                Menyelesaikan Upskilling Bootcamp BEKUP Create 2025 yang diinisiasi oleh <strong>Badan Ekonomi Kreatif (BEKRAF)</strong> dan <strong>Dicoding Indonesia</strong>. Mempelajari pengembangan aplikasi menggunakan Flutter serta mengasah soft skill penting seperti personal productivity, critical thinking, dan effective communication.
              </p>
              
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100 max-w-3xl hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Code size={24}/>
                  </div>
                  <h4 className="font-bold text-xl text-slate-800">
                    Proyek Akhir: "Jejak Cerita Rakyat"
                  </h4>
                </div>
                <p className="text-slate-600 mb-5">
                  Aplikasi edukatif berbasis Flutter yang bertujuan mengenalkan kembali cerita rakyat Indonesia kepada anak-anak. Dilengkapi dengan <strong>fitur text-to-speech yang ramah disabilitas</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">Flutter</span>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">Mobile Development</span>
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">Text-to-Speech API</span>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200">Team Collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education & Certifications Section */}
      <section id="education" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold text-slate-900">Pendidikan</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600"></div>
                  <h3 className="font-bold text-xl text-slate-900">S1 Teknik Informatika</h3>
                  <p className="text-blue-600 font-medium mb-2">Institut Teknologi dan Bisnis STIKOM Ambon</p>
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                    <span className="text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1 rounded-md">2020 - 2025</span>
                    <span className="font-extrabold text-lg text-slate-800 bg-amber-100 text-amber-800 px-4 py-1 rounded-md shadow-sm">IPK: 3.99</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-400"></div>
                  <h3 className="font-bold text-lg text-slate-900">SMA Nambuasa Tulehu</h3>
                  <p className="text-slate-600 font-medium mb-2">Jurusan Ilmu Pengetahuan Alam (IPA)</p>
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                    <span className="text-slate-500 text-sm font-bold bg-slate-100 px-3 py-1 rounded-md">2016 - 2018</span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">Nilai: 90</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications & Training */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Award className="text-teal-600" size={28} />
                <h2 className="text-3xl font-bold text-slate-900">Sertifikasi & Pelatihan</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    Sertifikasi Dicoding
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Belajar Penggunaan Generative AI", date: "Sep 2025" },
                      { title: "Belajar Dasar AI", date: "Sep 2025 - Sep 2028" },
                      { title: "AI Praktis untuk Produktivitas", date: "Mei 2025 - Mei 2028" }
                    ].map((cert, idx) => (
                      <div key={idx} className="flex gap-3 items-start group">
                        <div className="mt-0.5 bg-teal-50 p-1.5 rounded-md text-teal-600 group-hover:bg-teal-100 transition-colors"><CheckCircle2 size={16}/></div>
                        <div>
                          <h4 className="font-bold text-slate-700 text-sm group-hover:text-teal-700 transition-colors">{cert.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{cert.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 mb-4">Pelatihan Kampus</h3>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Advance Microsoft Excel", date: "Juni 2022", inst: "ITB STIKOM Ambon" },
                      { title: "Merakit Dan Instalasi PC", date: "Desember 2021", inst: "ITB STIKOM Ambon" }
                    ].map((train, idx) => (
                      <div key={idx} className="flex gap-3 items-start group">
                        <div className="mt-0.5 bg-blue-50 p-1.5 rounded-md text-blue-600 group-hover:bg-blue-100 transition-colors"><CheckCircle2 size={16}/></div>
                        <div>
                          <h4 className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{train.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{train.inst} • <span className="text-slate-400">{train.date}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Keterampilan Section (Sesuai CV) */}
      <section id="keterampilan" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 inline-flex items-center gap-3 justify-center">
              <Settings className="text-blue-600" size={28} /> Keterampilan
            </h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-lg">
              Keterampilan teknis dan administratif yang mendukung kinerja profesional.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              "Problem Solving", 
              "Microsoft PowerPoint", 
              "Microsoft Word",
              "Menunjukkan komitmen", 
              "Data Entry", 
              "Installation System Operasi Windows", 
              "Installation Software", 
              "Microsoft Excel",
              "Menggunakan Komputer",
              "Microsoft Office"
            ].map((skill, index) => (
              <div 
                key={index} 
                className="px-5 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 cursor-default"
              >
                <CheckCircle2 size={18} className="text-blue-500" />
                {skill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Tertarik untuk bekerja sama?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Saya selalu terbuka untuk mendiskusikan peluang baru, proyek, atau kolaborasi yang dapat memberikan dampak positif.
          </p>
          <a href="mailto:ulissleksmart@gmail.com" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-lg">
            <Mail size={20} />
            Hubungi Saya Melalui Email
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="font-bold text-2xl tracking-tight text-white block mb-2">ULIS.<span className="text-blue-500">PORTFOLIO</span></span>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Ulis Leuwol. All rights reserved.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm font-medium">
            <a href="mailto:ulissleksmart@gmail.com" className="hover:text-white transition-colors flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
              <Mail size={16} className="text-blue-400"/> ulissleksmart@gmail.com
            </a>
            <span className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
              <Phone size={16} className="text-green-400"/> 0852 8035 7433
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}