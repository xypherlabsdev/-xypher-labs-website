import { useRef, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { site } from '../data/site';
import { LogoX } from './Logo';
import { Magnetic } from './Magnetic';
import { RevealLines } from './Reveal';
import { Scramble } from './Scramble';
import '../styles/contact.css';

// Outline chevrons drifting behind the headline, each at its own depth.
const FLOATERS = [
  { left: '66%', top: '12%', size: 260, depth: 1, rot: 8 },
  { left: '86%', top: '50%', size: 150, depth: 0.6, rot: -14 },
  { left: '70%', top: '74%', size: 100, depth: 0.4, rot: 18 },
  { left: '90%', top: '8%', size: 80, depth: 0.8, rot: -4 },
];

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const px = useSpring(0, { stiffness: 60, damping: 20 });
  const py = useSpring(0, { stiffness: 60, damping: 20 });

  const move = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    py.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(site.email);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = site.email;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      ta.remove();
    }
    setCopied(ok ? 'done' : 'failed');
    window.setTimeout(() => setCopied('idle'), 2200);
  };

  return (
    <section className="contact" id="contact" ref={ref} onPointerMove={move} aria-label="Contact">
      <div className="contact__floaters" aria-hidden="true">
        {FLOATERS.map((f, i) => (
          <Floater key={i} {...f} px={px} py={py} />
        ))}
      </div>
      <div className="container contact__inner">
        <p className="eyebrow eyebrow--light">contact</p>
        <RevealLines
          as="h2"
          className="contact__title display"
          label="Got an everyday problem worth decoding?"
          lines={[
            'Got an everyday',
            'problem worth',
            <span key="d" className="contact__decode">
              <Scramble text="decoding?" duration={1000} />
            </span>,
          ]}
        />
        <p className="contact__text">Ideas, feedback on our apps, or something you would like built. Write to us.</p>
        <div className="contact__actions">
          <Magnetic>
            <a className="btn btn--light btn--xl" href={`mailto:${site.email}`} data-cursor="Write">
              {site.email}
            </a>
          </Magnetic>
          <button className="btn btn--ghost-light btn--xl" type="button" onClick={copy}>
            {copied === 'done' ? 'Copied ✓' : copied === 'failed' ? 'Copy blocked, use the address' : 'Copy email'}
          </button>
        </div>
      </div>
    </section>
  );
}

function Floater({ left, top, size, depth, rot, px, py }: (typeof FLOATERS)[number] & { px: MotionValue<number>; py: MotionValue<number> }) {
  const x = useTransform(px, (v) => v * depth * 40);
  const y = useTransform(py, (v) => v * depth * 30);
  return (
    <motion.div className="floater" style={{ left, top, width: size, x, y, rotate: rot }}>
      <LogoX />
    </motion.div>
  );
}
