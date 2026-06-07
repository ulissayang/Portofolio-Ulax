import { useEffect, useRef, useState } from 'react';

/**
 * useInView — trigger animasi saat elemen masuk viewport
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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...options });

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [once]);

  return [ref, inView];
}
