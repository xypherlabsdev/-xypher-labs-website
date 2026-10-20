import { stack } from '../data/site';
import { LogoX } from './Logo';
import '../styles/stack.css';

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  // The track holds the list twice so the loop is seamless at -50%.
  const doubled = [...items, ...items];
  return (
    <div className={`marquee${reverse ? ' marquee--reverse' : ''}`}>
      <div className="marquee__track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee__item" aria-hidden={i >= items.length}>
            <span className={`marquee__word display${i % 2 ? ' is-outline' : ''}`}>{item}</span>
            <LogoX className="marquee__sep" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Stack() {
  const half = Math.ceil(stack.length / 2);
  return (
    <section className="stack-band" aria-label="What we build with">
      <div className="container stack-band__head">
        <p className="eyebrow">built with</p>
        <p className="stack-band__note">Native Android, on-device intelligence, and a few good cloud APIs.</p>
      </div>
      <Row items={stack.slice(0, half)} />
      <Row items={stack.slice(half)} reverse />
    </section>
  );
}
