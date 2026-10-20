import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** True while the element is anywhere near the viewport. Used to pause the WebGL loop. */
export function useNearViewport<T extends HTMLElement>(margin = '200px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, near] as const;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Where the hero X sits at rest and how big the logo tile is once the hero collapses. All in px.
 * On portrait screens the X fills the space between the bottom of the hero copy (`copyBottom`) and the scroll cue.
 */
export function heroLayout(w: number, h: number, copyBottom = 0) {
  const portrait = w <= h;
  const icon = Math.round(Math.min(w, h) * (portrait ? 0.44 : 0.3));
  if (!portrait) {
    return { portrait, restW: Math.min(w * 0.33, (h * 0.54) / 0.73), restX: w * 0.225, restY: h * 0.02, icon, iconW: icon * 0.62 };
  }
  const top = copyBottom > 0 ? copyBottom + 28 : h * 0.6;
  const room = Math.max(70, h - 64 - top);
  const restW = Math.min(w * 0.56, (room * 0.86) / 0.73);
  return { portrait, restW, restX: 0, restY: top + room / 2 - h / 2, icon, iconW: icon * 0.62 };
}
