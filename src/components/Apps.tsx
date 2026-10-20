import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { apps, type App } from '../data/site';
import { FadeUp, RevealLines } from './Reveal';
import '../styles/apps.css';

function AppCard({ app, i, progress, range, targetScale }: {
  app: App;
  i: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const dim = useTransform(progress, range, [0, targetScale < 1 ? 0.35 : 0]);
  const style = { ['--app-bg' as string]: app.bg, ['--app-accent' as string]: app.accent, ['--i' as string]: i };

  return (
    <div className="stack__item">
      <motion.article className="app-card" style={{ ...style, scale }} aria-label={app.name}>
        <div className="app-card__glow" aria-hidden="true" />
        <div className="app-card__info">
          <div className="app-card__head">
            <img className="app-card__icon" src={app.icon} alt="" width={64} height={64} loading="lazy" />
            <div className="app-card__chips">
              <span className="chip">{app.category}</span>
              {app.smart && <span className="chip chip--accent">{app.smart}</span>}
            </div>
          </div>
          <h3 className="app-card__name display">{app.name}</h3>
          <p className="app-card__tagline">{app.tagline}</p>
          <p className="app-card__desc">{app.description}</p>
          <ul className="app-card__features">
            {app.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <a className="btn btn--app" href={app.url} target="_blank" rel="noreferrer" data-cursor="Play">
            Get it on Google Play <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
        <a className="app-card__shots" href={app.url} target="_blank" rel="noreferrer" data-cursor="Open" tabIndex={-1} aria-hidden="true">
          {app.shots.map((src, k) => (
            <img key={src} className={`shot shot--${k}`} src={src} alt="" loading="lazy" width={600} height={1067} />
          ))}
        </a>
        <motion.div className="app-card__dim" style={{ opacity: dim }} aria-hidden="true" />
      </motion.article>
    </div>
  );
}

export function Apps() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });

  return (
    <section className="apps" id="apps" aria-label="Our apps">
      <div className="apps__head container">
        <div>
          <p className="eyebrow">shipped</p>
          <RevealLines
            as="h2"
            className="apps__title display"
            label="Four apps, live on Google Play."
            lines={['Four apps,', 'live on Google Play.']}
          />
        </div>
        <FadeUp className="apps__intro">
          <p>Each one takes a single everyday problem and solves it properly. Built natively in Kotlin, designed to stay out of your way.</p>
        </FadeUp>
      </div>
      <div className="stack" ref={container}>
        {apps.map((app, i) => {
          const last = i === apps.length - 1;
          return (
            <AppCard
              key={app.id}
              app={app}
              i={i}
              progress={scrollYProgress}
              range={[i / apps.length, 1]}
              targetScale={last ? 1 : 1 - (apps.length - i) * 0.04}
            />
          );
        })}
      </div>
    </section>
  );
}
