import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { principles } from '../data/site';
import { piecePaths } from '../lib/logo';
import { Scramble } from './Scramble';
import '../styles/approach.css';

// Where each piece waits (in SVG units) before it slides into the X.
const START: [number, number][] = [
  [-46, 0],
  [34, -34],
  [34, 34],
];

function Piece({ d, i, progress, state }: { d: string; i: number; progress: MotionValue<number>; state: 'waiting' | 'active' | 'placed' }) {
  const from = i / 3;
  const to = from + 0.22;
  const x = useTransform(progress, [from, to], [START[i][0], 0], { clamp: true });
  const y = useTransform(progress, [from, to], [START[i][1], 0], { clamp: true });
  return <motion.path d={d} className={`piece is-${state}`} style={{ x, y }} />;
}

export function Approach() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(3, Math.floor(p * 3 + 0.12))));
  const done = step >= 3;

  return (
    <section className="approach" id="approach" ref={ref} aria-label="How we build">
      <div className="approach__sticky container">
        <div className="approach__visual">
          <svg viewBox="-50 -40 200 153" className={`approach__x${done ? ' is-done' : ''}`} aria-hidden="true">
            {piecePaths.map((d, i) => (
              <Piece
                key={i}
                d={d}
                i={i}
                progress={scrollYProgress}
                state={done ? 'placed' : step === i ? 'active' : step > i ? 'placed' : 'waiting'}
              />
            ))}
          </svg>
          <p className="approach__caption eyebrow" aria-live="polite">
            {done ? <Scramble text="three pieces · one X" trigger="mount" duration={700} /> : `piece ${Math.min(step + 1, 3)} of 3`}
          </p>
        </div>

        <div className="approach__copy">
          <p className="eyebrow">how we build</p>
          <h2 className="approach__title display">Three pieces, one way of building.</h2>
          <ol className="approach__list">
            {principles.map((p, i) => (
              <li key={p.title} className={`principle${step === i || done ? ' is-active' : ''}${step > i && !done ? ' is-past' : ''}`}>
                <h3 className="principle__title display">{p.title}</h3>
                <p className="principle__body">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
