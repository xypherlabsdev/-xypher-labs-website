import { piecePaths } from '../lib/logo';

type Props = {
  size?: number;
  /** Cobalt tile behind a white X. Without it the X uses currentColor. */
  tile?: boolean;
  className?: string;
  title?: string;
};

export function LogoMark({ size = 32, tile = true, className, title = 'Xypher Labs' }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={title} className={className}>
      {tile && <rect width="100" height="100" rx="24" fill="var(--cobalt)" />}
      <g transform="translate(19 27.37) scale(0.62)" fill={tile ? 'var(--paper)' : 'currentColor'}>
        {piecePaths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Just the X, in its own 100 × 73 box. */
export function LogoX({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 73" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {piecePaths.map((d, i) => (
        <path key={i} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
