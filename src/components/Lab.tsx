import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { apps, experiments, site, stack } from '../data/site';
import playStats from '../data/play-stats.json';
import { FadeUp, RevealLines } from './Reveal';
import '../styles/lab.css';

type Line = { kind: 'in' | 'out' | 'dim' | 'err' | 'ok'; text: string };

const APP_KEYS: Record<string, string> = { autotally: 'autotally', applock: 'applock', sipience: 'sipience', qr: 'qrscan', qrscan: 'qrscan' };

const rot13 = (s: string) =>
  s.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });

function run(raw: string, narrow: boolean): Line[] | 'clear' {
  const [cmd = '', ...args] = raw.trim().split(/\s+/);
  const arg = args.join(' ');
  switch (cmd.toLowerCase()) {
    case '':
      return [];
    case 'help':
      return [
        { kind: 'dim', text: 'available commands' },
        { kind: 'out', text: '  apps          our live apps' },
        { kind: 'out', text: '  lab           what is cooking right now' },
        { kind: 'out', text: '  stats         installs on Google Play' },
        { kind: 'out', text: '  open <app>    open an app on Google Play' },
        { kind: 'out', text: '  about         who we are' },
        { kind: 'out', text: '  stack         what we build with' },
        { kind: 'out', text: '  contact       how to reach us' },
        { kind: 'out', text: '  decode <txt>  try our cipher' },
        { kind: 'out', text: '  clear         clean the screen' },
      ];
    case 'apps':
      return [
        ...apps.flatMap((a): Line[] =>
          narrow
            ? [
                { kind: 'out', text: `  ${a.id.padEnd(11)} ${a.category.toLowerCase()}` },
                { kind: 'dim', text: `    ${a.tagline.toLowerCase()}` },
              ]
            : [{ kind: 'out', text: `  ${a.id.padEnd(11)} ${a.category.toLowerCase().padEnd(9)} ${a.tagline.toLowerCase()}` }],
        ),
        { kind: 'dim', text: "type 'open autotally' to see one on Google Play" },
      ];
    case 'lab':
    case 'xypher':
      if (narrow)
        return experiments.flatMap((e): Line[] => [
          { kind: 'out', text: `  ${e.id.padEnd(15)} ● ${e.status}` },
          { kind: 'dim', text: `    ${e.what}` },
        ]);
      return [
        { kind: 'dim', text: `  ${'experiment'.padEnd(15)} ${'what it does'.padEnd(36)} status` },
        ...experiments.map((e) => ({ kind: 'out' as const, text: `  ${e.id.padEnd(15)} ${e.what.padEnd(36)} ● ${e.status}` })),
      ];
    case 'stats': {
      const byId = playStats.apps as Record<string, { label: string; min: number } | undefined>;
      const total = apps.reduce((s, a) => s + (byId[a.id]?.min ?? 0), 0);
      return [
        ...apps.map((a) => ({ kind: 'out' as const, text: `  ${a.id.padEnd(11)} ${(byId[a.id]?.label ?? '–').padStart(5)} installs` })),
        { kind: 'ok', text: `  total       ${total.toLocaleString('en-US')}+ on Google Play` },
      ];
    }
    case 'open': {
      const key = APP_KEYS[arg.toLowerCase()];
      const app = apps.find((a) => a.id === key);
      if (!app) return [{ kind: 'err', text: `no app called '${arg || '?'}'. try: ${apps.map((a) => a.id).join(', ')}` }];
      window.open(app.url, '_blank', 'noopener');
      return [{ kind: 'ok', text: `opening ${app.name} on Google Play…` }];
    }
    case 'about':
      return [
        { kind: 'out', text: `${site.name} is an independent AI and software studio from ${site.country}.` },
        { kind: 'out', text: 'We build fast, private Android apps that make everyday life a little easier.' },
      ];
    case 'stack':
      return [{ kind: 'out', text: stack.map((s) => s.toLowerCase()).join(' · ') }];
    case 'contact':
    case 'email':
      return [
        { kind: 'out', text: `  email   ${site.email}` },
        { kind: 'out', text: '  play    play.google.com → Xypher Labs' },
      ];
    case 'decode': {
      const text = arg || 'Rirelqnl ceboyrzf';
      return [{ kind: 'ok', text: `${text} → ${rot13(text)}` }];
    }
    case 'whoami':
      return [{ kind: 'out', text: 'a curious visitor. we like you already.' }];
    case 'sudo':
      return [{ kind: 'err', text: 'permission denied. nice try though.' }];
    case 'hi':
    case 'hello':
    case 'hey':
      return [{ kind: 'out', text: "hey! type 'help' to look around." }];
    case 'clear':
      return 'clear';
    default:
      return [{ kind: 'err', text: `command not found: ${cmd}. type 'help'` }];
  }
}

const INTRO = 'xypher lab --status';

/** Colours the status dot at the end of a lab row. */
function LineText({ text }: { text: string }) {
  const at = text.lastIndexOf('● ');
  if (at < 0) return <>{text}</>;
  const status = text.slice(at + 2);
  return (
    <>
      {text.slice(0, at)}
      <span className={`t-status t-status--${status}`}>● {status}</span>
    </>
  );
}

export function Lab() {
  const box = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const inView = useInView(box, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([{ kind: 'dim', text: `${site.name.toLowerCase()} · experiments · ${new Date().getFullYear()}` }]);
  const [typed, setTyped] = useState('');
  const [value, setValue] = useState('');
  const [ready, setReady] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);

  const exec = (cmd: string) => {
    const narrow = (box.current?.clientWidth ?? 800) < 560;
    const out = run(cmd, narrow);
    if (cmd.trim()) history.current.unshift(cmd);
    cursor.current = -1;
    if (out === 'clear') setLines([]);
    else setLines((l) => [...l, { kind: 'in', text: cmd }, ...out]);
  };

  // Type the first command by itself the first time the terminal scrolls into view.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      exec(INTRO);
      setReady(true);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(INTRO.slice(0, i));
      if (i >= INTRO.length) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setTyped('');
          exec(INTRO);
          setReady(true);
        }, 350);
      }
    }, 55);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typed]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    exec(value);
    setValue('');
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault();
      cursor.current = Math.min(cursor.current + 1, h.length - 1);
      setValue(h[cursor.current]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor.current = Math.max(cursor.current - 1, -1);
      setValue(cursor.current < 0 ? '' : h[cursor.current]);
    }
  };

  return (
    <section className="lab" id="lab" aria-label="The lab">
      <div className="container lab__inner">
        <div className="lab__copy">
          <p className="eyebrow eyebrow--dark">the lab</p>
          <RevealLines as="h2" className="lab__title display" label="Where the next apps start." lines={['Where the next', 'apps start.']} />
          <FadeUp>
            <p className="lab__text">
              Small experiments with on-device AI. Most never leave the lab. The good ones grow into apps you can download.
            </p>
            <p className="lab__hint">
              The terminal is real. Try <code>help</code>, <code>apps</code> or <code>decode</code>.
            </p>
          </FadeUp>
        </div>

        <FadeUp className="terminal-wrap" delay={0.1}>
          <div className="terminal" ref={box} onClick={() => input.current?.focus({ preventScroll: true })}>
            <div className="terminal__bar">
              <span className="terminal__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="terminal__title">xypher@lab: ~</span>
            </div>
            <div className="terminal__body" ref={body} data-lenis-prevent aria-live="polite">
              {lines.map((l, i) => (
                <div key={i} className={`t-line t-${l.kind}`}>
                  {l.kind === 'in' && <span className="t-prompt">›</span>}
                  <LineText text={l.text} />
                </div>
              ))}
              {typed && (
                <div className="t-line t-in">
                  <span className="t-prompt">›</span>
                  {typed}
                  <span className="t-caret" />
                </div>
              )}
              {ready && (
                <form className="t-line t-form" onSubmit={submit}>
                  <span className="t-prompt">›</span>
                  <label htmlFor="lab-input" className="visually-hidden">
                    Terminal command
                  </label>
                  <input
                    id="lab-input"
                    ref={input}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKey}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="type a command"
                  />
                </form>
              )}
            </div>
          </div>
          <div className="terminal__chips" aria-label="Quick commands">
            {['help', 'apps', 'lab', 'decode', 'clear'].map((c) => (
              <button key={c} type="button" className="t-chip" onClick={() => exec(c)} disabled={!ready}>
                {c}
              </button>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
