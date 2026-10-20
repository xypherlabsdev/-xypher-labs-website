import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

const GLYPHS = '<>/\\_-+=*#01XYPHER';
export const DIGITS = '0123456789';

type Props = {
  text: string;
  className?: string;
  /** Start on mount, or the first time the text scrolls into view. */
  trigger?: 'mount' | 'view';
  delay?: number;
  duration?: number;
  /** Characters cycled through while decoding. Separators like ',' and '+' always stay put when this is DIGITS. */
  glyphs?: string;
};

/** Text that "decodes" itself: random glyphs resolve left to right into the real word. */
export function Scramble({ text, className, trigger = 'view', delay = 0, duration = 900, glyphs = GLYPHS }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [out, setOut] = useState(text);
  const go = trigger === 'mount' || inView;

  useEffect(() => {
    if (!go || reduce) {
      setOut(text);
      return;
    }
    let raf = 0;
    let last = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      if (t >= 1) {
        setOut(text);
        return;
      }
      // Re-roll glyphs ~30 times a second so it reads as decoding, not noise.
      if (now - last > 33) {
        last = now;
        const reveal = Math.floor(Math.max(0, t) * text.length);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          const fixed = ch === ' ' || (glyphs === DIGITS && !/\d/.test(ch));
          s += fixed || i < reveal ? ch : glyphs[(Math.random() * glyphs.length) | 0];
        }
        setOut(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, reduce, text, delay, duration, glyphs]);

  return (
    <span ref={ref} className={className}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
