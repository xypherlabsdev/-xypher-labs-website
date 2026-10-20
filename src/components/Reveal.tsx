import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

type LinesProps = {
  lines: ReactNode[];
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  label: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount instead of on scroll into view. */
  onMount?: boolean;
};

/** Each line slides up from behind a mask. */
export function RevealLines({ lines, className, as = 'h2', label, delay = 0, stagger = 0.08, onMount }: LinesProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const trigger = onMount ? { animate: 'shown' } : { whileInView: 'shown', viewport: { once: true, amount: 0.4 } };
  return (
    <Tag className={className} aria-label={label} initial={reduce ? false : 'hidden'} {...trigger}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask" aria-hidden="true">
          <motion.span
            className="line-inner"
            variants={{ hidden: { y: '115%' }, shown: { y: '0%' } }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Fade and lift a block once it scrolls into view. */
export function FadeUp({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
