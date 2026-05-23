import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Admin from './pages/Admin.jsx';
import './index.css';

function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  el.classList.add('out');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
}

function Root() {
  const [page] = useState(
    () => window.location.hash.startsWith('#/admin') ? 'admin' : 'public'
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Update splash logo/sub sesuai halaman
    const isAdmin = page === 'admin';
    const logo = document.querySelector('#splash .sp-logo');
    const sub  = document.querySelector('#splash .sp-sub');
    if (logo) logo.innerHTML = isAdmin ? 'ULIS.<span>ADMIN</span>' : 'ULIS.<span>PORTFOLIO</span>';
    if (sub)  sub.textContent = isAdmin ? 'Dashboard Admin' : 'Portfolio';

    // Sembunyikan splash sesudah progress bar (~1.9 detik)
    const timer = setTimeout(() => {
      hideSplash();
      // Tampilkan root
      const root = document.getElementById('root');
      if (root) root.classList.add('ready');
      setReady(true);
    }, 1900);
    return () => clearTimeout(timer);
  }, []);

  // hash change → reload penuh agar splash muncul ulang
  useEffect(() => {
    const onHash = () => { window.location.reload(); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className={ready ? 'pg-enter' : 'opacity-0'}>
      {page === 'admin' ? <Admin /> : <App />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
