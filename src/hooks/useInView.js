import { useEffect, useRef, useState } from 'react';

/**
 * useInView — trigger animasi saat elemen masuk viewport
 * @param {object} options - IntersectionObserver options
 * @param {boolean} once - hanya trigger sekali (default true)
 */
export function useInView(options = {}, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) observer.unobserve(el);
      } else if (!once) {
        setInView(false);
      }
    }, { threshold: 0.12, ...options });

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [once]);

  return [ref, inView];
}

/**
 * usePageSnap — snap-scroll ke section berikutnya saat 1x scroll
 * Hanya aktif di desktop (layar >= 1024px)
 */
export function usePageSnap() {
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    let isScrolling = false;
    let currentIdx = 0;

    const getActiveIdx = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      sections.forEach((s, i) => {
        if (s.offsetTop <= mid) idx = i;
      });
      return idx;
    };

    const snapTo = (idx) => {
      const target = sections[idx];
      if (!target) return;
      isScrolling = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrolling = false; }, 900);
    };

    const onWheel = (e) => {
      if (window.innerWidth < 1024) return; // hanya desktop
      if (isScrolling) { e.preventDefault(); return; }

      currentIdx = getActiveIdx();
      if (e.deltaY > 0 && currentIdx < sections.length - 1) {
        e.preventDefault();
        snapTo(currentIdx + 1);
      } else if (e.deltaY < 0 && currentIdx > 0) {
        e.preventDefault();
        snapTo(currentIdx - 1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
}
