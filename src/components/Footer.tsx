import { useRef } from 'react';
import { nav, site } from '../data/site';
import { onAnchorClick } from '../lib/scroll';
import { LogoMark } from './Logo';
import '../styles/footer.css';

export function Footer() {
  const word = useRef<HTMLDivElement>(null);

  // A cobalt spotlight follows the pointer across the giant outlined wordmark.
  const move = (e: React.PointerEvent) => {
    const el = word.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <footer className="footer" onPointerMove={move}>
      <div className="container footer__top">
        <div className="footer__brand">
          <LogoMark size={44} />
          <p>
            An independent AI and software studio from {site.country}, building Android apps for everyday life.
          </p>
        </div>
        <nav className="footer__col" aria-label="Footer">
          <p className="footer__label">Explore</p>
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={onAnchorClick}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="footer__col">
          <p className="footer__label">Elsewhere</p>
          <a href={site.playUrl} target="_blank" rel="noreferrer">
            Google Play ↗
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </div>
      </div>

      <div className="footer__word" ref={word} aria-hidden="true">
        <span className="footer__word-base display">XYPHER</span>
        <span className="footer__word-lit display">XYPHER</span>
      </div>

      <div className="container">
        <div className="footer__bottom">
        <span>
          © {new Date().getFullYear()} {site.name} · Made in {site.country}
        </span>
        <a href="#top" onClick={onAnchorClick} className="footer__top-link">
          Back to top <span aria-hidden="true">↑</span>
        </a>
        </div>
      </div>
    </footer>
  );
}
