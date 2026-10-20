import { Component, Suspense, lazy, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { apps, site } from '../data/site';
import { easeInOutCubic, heroLayout, useElementSize, useNearViewport } from '../lib/hooks';
import { onAnchorClick } from '../lib/scroll';
import { LogoX } from './Logo';
import { Magnetic } from './Magnetic';
import { RevealLines } from './Reveal';
import { Scramble } from './Scramble';
import type { PointerState } from './HeroScene';
import '../styles/hero.css';

const HeroScene = lazy(() => import('./HeroScene'));

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Flat X used while three.js loads, and instead of it when WebGL is unavailable. */
function FlatX({ collapse, w, h, copyBottom }: { collapse: MotionValue<number>; w: number; h: number; copyBottom: number }) {
  const L = heroLayout(w, h, copyBottom);
  const width = useTransform(collapse, (p) => L.restW + (L.iconW - L.restW) * easeInOutCubic(p));
  const x = useTransform(collapse, (p) => L.restX * (1 - easeInOutCubic(p)));
  const y = useTransform(collapse, (p) => L.restY * (1 - easeInOutCubic(p)));
  return (
    <motion.div className="hero__flat" style={{ width, x, y, translateX: '-50%', translateY: '-50%' }}>
      <LogoX />
    </motion.div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [stickyRef, { w, h }] = useElementSize<HTMLDivElement>();
  const [nearRef, near] = useNearViewport<HTMLDivElement>('0px');
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false });
  const reduce = !!useReducedMotion();
  const webgl = useRef<boolean | null>(null);
  if (webgl.current === null && typeof window !== 'undefined') webgl.current = hasWebGL();

  const ctas = useRef<HTMLDivElement>(null);
  const [copyBottom, setCopyBottom] = useState(0);
  // Bottom edge of the CTA row inside the hero, ignoring animation transforms. Portrait layouts park the X below it.
  useLayoutEffect(() => {
    const measure = () => {
      const el = ctas.current;
      if (!el) return;
      let y = el.offsetHeight;
      for (let n: HTMLElement | null = el; n && n !== stickyRef.current; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
      setCopyBottom(y);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [w, h, stickyRef]);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const collapse = useTransform(scrollYProgress, [0, 0.5], [0, 1], { clamp: true });
  const L = heroLayout(w || 1, h || 1, copyBottom);

  const clipPath = useTransform(collapse, (p) => {
    const e = easeInOutCubic(p);
    const t = ((h - L.icon) / 2) * e;
    const l = ((w - L.icon) / 2) * e;
    return `inset(${t}px ${l}px ${t}px ${l}px round ${L.icon * 0.24 * e}px)`;
  });
  const contentOpacity = useTransform(collapse, [0, 0.32], [1, 0]);
  const contentY = useTransform(collapse, [0, 0.32], [0, -70]);
  const gridOpacity = useTransform(collapse, [0, 0.6], [1, 0]);
  const afterOpacity = useTransform(scrollYProgress, [0.4, 0.62], [0, 1]);
  const afterY = useTransform(scrollYProgress, [0.4, 0.62], [36, 0]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = stickyRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside = e.clientY >= r.top && e.clientY <= r.bottom && collapse.get() < 0.08;
      pointer.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: ((e.clientY - r.top) / r.height) * 2 - 1,
        inside: inside && e.pointerType === 'mouse',
      };
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [collapse, stickyRef]);

  const fallback = w > 0 ? <FlatX collapse={collapse} w={w} h={h} copyBottom={copyBottom} /> : null;

  return (
    <section className="hero" id="top" ref={section} aria-label="Introduction">
      <div className="hero__sticky" ref={stickyRef} style={{ ['--icon' as string]: `${L.icon}px` }}>
        <motion.div className="manifesto" style={{ opacity: afterOpacity, y: afterY }}>
          <p className="eyebrow manifesto__label">the mark</p>
          <p className="manifesto__side manifesto__side--left display">One chevron.</p>
          <p className="manifesto__side manifesto__side--right display">Two arms.</p>
          <div className="manifesto__below">
            <p className="manifesto__big display">Gaps on purpose.</p>
            <p className="manifesto__text">
              Our X is a code chevron and two arms that never quite touch. The gaps are deliberate: room for the people
              who use our apps, and a pause before we add anything new.
            </p>
          </div>
        </motion.div>

        <motion.div className="hero__panel" style={{ clipPath }} ref={nearRef}>
          <motion.div className="hero__grid" style={{ opacity: gridOpacity }} aria-hidden="true" />
          {w > 0 &&
            (webgl.current ? (
              <SceneBoundary fallback={fallback}>
                <Suspense fallback={fallback}>
                  <HeroScene collapse={collapse} pointer={pointer} active={near} reduce={reduce} copyBottom={copyBottom} />
                </Suspense>
              </SceneBoundary>
            ) : (
              fallback
            ))}

          <motion.div className="hero__content container" style={{ opacity: contentOpacity, y: contentY }}>
            <motion.p
              className="eyebrow hero__eyebrow"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              AI &amp; software studio · {site.country}
            </motion.p>
            <RevealLines
              as="h1"
              onMount
              delay={0.25}
              stagger={0.1}
              className="hero__title display"
              label={site.tagline}
              lines={[
                'Everyday',
                'problems,',
                <span className="hero__decoded" key="d">
                  <Scramble text="decoded." trigger="mount" delay={900} duration={1100} />
                  <span className="hero__caret" aria-hidden="true" />
                </span>,
              ]}
            />
            <motion.p
              className="hero__sub"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75 }}
            >
              Xypher Labs builds fast, private Android apps for money, privacy and health, with AI only where it
              genuinely helps.
            </motion.p>
            <motion.div
              ref={ctas}
              className="hero__ctas"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
            >
              <Magnetic>
                <a className="btn btn--light" href="#apps" onClick={onAnchorClick}>
                  See our apps <span className="arrow down" aria-hidden="true">↓</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn--ghost-light" href={site.playUrl} target="_blank" rel="noreferrer">
                  Google Play <span className="arrow" aria-hidden="true">↗</span>
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>

          <motion.div className="hero__meta container" style={{ opacity: contentOpacity }}>
            <ul className="hero__facts">
              <li>{apps.length} apps live on Google Play</li>
              <li>Kotlin &amp; Jetpack Compose</li>
              <li>Made in {site.country}</li>
            </ul>
            <span className="hero__scroll" aria-hidden="true">
              Scroll <span className="hero__scroll-chevron">›</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
