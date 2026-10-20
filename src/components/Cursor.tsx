import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/** A dot that tracks the pointer exactly and a ring that trails it. Mouse only. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<{ mode: 'idle' | 'hover' | 'label'; label: string }>({ mode: 'idle', label: '' });
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 420, damping: 36, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor], a, button, summary, input');
      if (!el) return setState({ mode: 'idle', label: '' });
      const label = el.dataset.cursor ?? '';
      setState({ mode: label ? 'label' : 'hover', label });
    };
    const leaveWindow = () => {
      x.set(-100);
      y.set(-100);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerover', over);
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    document.addEventListener('pointerleave', leaveWindow);
    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.removeEventListener('pointerleave', leaveWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden="true" />
      <motion.div
        className={`cursor-ring is-${state.mode}${down ? ' is-down' : ''}`}
        style={{ x: rx, y: ry }}
        aria-hidden="true"
      >
        {state.mode === 'label' && <span>{state.label}</span>}
      </motion.div>
    </>
  );
}
