import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { apps, chartOrder } from '../data/site';
import stats from '../data/play-stats.json';
import { DIGITS, Scramble } from './Scramble';
import '../styles/installs.css';

type Series = { id: string; name: string; label: string; min: number; color: string; icon: string };

// One square per install while that stays readable; past ~1,600 squares each one stands for more.
const UNITS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 50000];
const FADE_MS = 280;

function useSeries(): Series[] {
  return useMemo(() => {
    const byId = stats.apps as Record<string, { label: string; min: number } | undefined>;
    return chartOrder.flatMap(({ id, color }) => {
      const app = apps.find((a) => a.id === id);
      const s = byId[id];
      return app && s && s.min > 0 ? [{ id, name: app.name, label: s.label, min: s.min, color, icon: app.icon }] : [];
    });
  }, []);
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Small deterministic jitter so the reveal sweep looks organic but never changes between renders. */
const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function Installs() {
  const series = useSeries();
  const total = series.reduce((s, x) => s + x.min, 0);
  const unit = UNITS.find((u) => total / u <= 1600) ?? UNITS[UNITS.length - 1];
  // cells[i] = index of the series that square belongs to; apps fill in chart order.
  const cells = useMemo(
    () => series.flatMap((s, k) => Array<number>(Math.max(1, Math.round(s.min / unit))).fill(k)),
    [series, unit],
  );

  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; k: number } | null>(null);
  const [height, setHeight] = useState(0);
  const geo = useRef({ cols: 1, rows: 1, s: 10, w: 0 });
  const started = useRef<number | null>(null);
  const active = focus ?? pinned;

  const draw = useCallback(
    (now: number) => {
      const c = canvas.current;
      if (!c) return false;
      const ctx = c.getContext('2d');
      if (!ctx) return false;
      const { cols, rows, s, w } = geo.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, rows * s);
      const t = started.current === null ? -1 : now - started.current;
      const size = Math.max(2, s - 2); // 2px surface gap between squares
      const r = size * 0.28;
      let running = false;

      for (let i = 0; i < cells.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * s + 1;
        const y = row * s + 1;
        const delay = ((col / cols) * 0.72 + (row / rows) * 0.28) * 1150 + jitter(i) * 200;
        const p = reduce ? 1 : t < 0 ? 0 : Math.min(1, Math.max(0, (t - delay) / FADE_MS));
        if (p < 1) running = true;

        ctx.globalAlpha = 1;
        if (p <= 0) {
          ctx.fillStyle = 'rgba(248, 250, 252, 0.06)';
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, r);
          ctx.fill();
          continue;
        }
        const k = cells[i];
        const dim = active !== null && k !== active;
        const grow = 0.55 + 0.45 * (1 - Math.pow(1 - p, 3));
        const sz = size * grow;
        const off = (size - sz) / 2;
        ctx.globalAlpha = dim ? 0.16 : 1;
        ctx.fillStyle = series[k].color;
        ctx.beginPath();
        ctx.roundRect(x + off, y + off, sz, sz, r * grow);
        ctx.fill();
        // A white flash as each square lands, like a bit being decoded.
        if (p < 1 && !dim) {
          ctx.globalAlpha = (1 - p) * 0.75;
          ctx.fillStyle = '#F8FAFC';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      return running;
    },
    [cells, series, active, reduce],
  );
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // Size the grid to the container: square cells, columns chosen from the available width.
  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const layout = () => {
      const w = el.clientWidth;
      const target = w < 520 ? 9 : 12.5;
      const cols = Math.max(10, Math.floor(w / target));
      const s = w / cols;
      const rows = Math.ceil(cells.length / cols);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      geo.current = { cols, rows, s, w };
      c.width = Math.round(w * dpr);
      c.height = Math.round(rows * s * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${rows * s}px`;
      setHeight(rows * s);
      drawRef.current(performance.now());
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cells.length]);

  // Play the reveal once, the first time the grid scrolls into view.
  useEffect(() => {
    if (!inView) return;
    if (started.current === null) started.current = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      if (drawRef.current(now)) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  // Redraw when the highlighted app changes (the reveal loop may already have finished).
  useEffect(() => {
    drawRef.current(performance.now());
  }, [active]);

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { cols, s } = geo.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const i = Math.floor(py / s) * cols + Math.floor(px / s);
    if (px < 0 || px >= rect.width || i < 0 || i >= cells.length) {
      setFocus(null);
      setTip(null);
      return;
    }
    setFocus(cells[i]);
    setTip({ x: px, y: py, k: cells[i] });
  };

  const totalText = `${total.toLocaleString('en-US')}+`;
  const summary = series.map((s) => `${s.name} ${s.label}`).join(', ');
  const tipFlip = tip && tip.x > geo.current.w * 0.62;

  if (!series.length) return null;

  return (
    <section className="installs" id="installs" aria-label="Installs on Google Play">
      <div className="container installs__inner">
        <div className="installs__copy">
          <p className="eyebrow eyebrow--dark">on google play</p>
          <p className="installs__number display">
            <Scramble text={totalText} glyphs={DIGITS} duration={1300} />
          </p>
          <p className="installs__label">installs across our apps, and counting.</p>
          <p className="installs__sub">
            {unit === 1
              ? 'Each square is one install: one phone running something we built.'
              : `Every square is ${unit.toLocaleString('en-US')} installs.`}
          </p>

          <ul className="installs__legend" aria-label="Installs per app">
            {series.map((s, k) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`legend-row${active === k ? ' is-active' : ''}${active !== null && active !== k ? ' is-dim' : ''}`}
                  aria-pressed={pinned === k}
                  onMouseEnter={() => setFocus(k)}
                  onMouseLeave={() => setFocus(null)}
                  onFocus={() => setFocus(k)}
                  onBlur={() => setFocus(null)}
                  onClick={() => setPinned((p) => (p === k ? null : k))}
                >
                  <span className="legend-row__swatch" style={{ background: s.color }} aria-hidden="true" />
                  <img className="legend-row__icon" src={s.icon} alt="" width={22} height={22} loading="lazy" />
                  <span className="legend-row__name">{s.name}</span>
                  <span className="legend-row__value">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="installs__note">
            Google Play shows install ranges, so these are minimums. Updated {formatDate(stats.updated)}.
          </p>
        </div>

        <div className="installs__viz" ref={wrap} style={{ minHeight: height || undefined }}>
          <canvas
            ref={canvas}
            role="img"
            aria-label={`${totalText} installs on Google Play: ${summary}.`}
            onPointerMove={onMove}
            onPointerLeave={() => {
              setFocus(null);
              setTip(null);
            }}
          />
          {tip && (
            <div
              className={`installs__tip${tipFlip ? ' is-flipped' : ''}`}
              style={{ left: tip.x, top: tip.y }}
              role="status"
            >
              <span className="installs__tip-key" style={{ background: series[tip.k].color }} aria-hidden="true" />
              <strong>{series[tip.k].label}</strong>
              <span>installs · {series[tip.k].name}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
