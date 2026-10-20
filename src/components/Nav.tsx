import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { nav, site } from '../data/site';
import { onAnchorClick, pauseScroll } from '../lib/scroll';
import { LogoMark } from './Logo';
import '../styles/nav.css';

const EASE = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const vh = window.innerHeight;
    setSolid(y > vh * 0.12);
    // Past the hero, tuck the bar away while reading down and bring it back on the way up.
    if (y < vh * 2.6 || y < prev - 4) setHidden(false);
    else if (y > prev + 4) setHidden(true);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    pauseScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    // Lenis ignores scrollTo while stopped, so resume it before jumping.
    pauseScroll(false);
    onAnchorClick(e);
  };

  return (
    <>
      <header className={`nav${solid || open ? ' is-solid' : ''}${hidden && !open ? ' is-hidden' : ''}${open ? ' is-open' : ''}`}>
        <div className="nav__bar">
          <a className="nav__brand" href="#top" onClick={go} aria-label="Xypher Labs, back to top">
            <LogoMark size={34} tile={solid || open} className="nav__mark" />
            <span>
              Xypher <span className="nav__labs">Labs</span>
            </span>
          </a>
          <nav className="nav__links" aria-label="Main">
            {nav.map((item) => (
              <a key={item.href} className="nav__link" href={item.href} onClick={go}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="nav__cta" href={site.playUrl} target="_blank" rel="noreferrer">
            Google Play <span aria-hidden="true">↗</span>
          </a>
          <button
            className="nav__burger"
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <nav className="menu__links container" aria-label="Menu">
              {nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={go}
                  className="menu__link display"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.06 }}
                >
                  <span className="menu__chev" aria-hidden="true">›</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="menu__foot container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={site.playUrl} target="_blank" rel="noreferrer">
                Google Play ↗
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
