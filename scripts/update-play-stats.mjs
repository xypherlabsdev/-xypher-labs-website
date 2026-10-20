// Pulls the install range ("1K+", "100+", …) for each app from its Google Play listing
// and writes src/data/play-stats.json. Runs before every build; if Play can't be reached
// or its page layout changes, the last saved numbers are kept and the build carries on.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../src/data/play-stats.json', import.meta.url);
const APPS = {
  autotally: 'com.autotally.app',
  applock: 'com.vaultx.applock',
  sipience: 'com.xypherlabs.sipience',
  qrscan: 'com.xypher.qrscanpro',
};

const toNumber = (label) => {
  const m = /^([\d.,]+)\s*([KMB]?)\+$/.exec(label.trim());
  if (!m) return null;
  const mult = { '': 1, K: 1e3, M: 1e6, B: 1e9 }[m[2]];
  return Math.round(parseFloat(m[1].replace(/,/g, '')) * mult);
};

let saved = { updated: null, apps: {} };
try {
  saved = JSON.parse(readFileSync(FILE, 'utf8'));
} catch {}

const next = { updated: saved.updated, apps: { ...saved.apps } };
let changed = 0;
for (const [id, pkg] of Object.entries(APPS)) {
  try {
    const res = await fetch(`https://play.google.com/store/apps/details?id=${pkg}&hl=en&gl=US`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    const label = /([\d.,]+[KMB]?\+)<\/div><div[^>]*>Downloads/.exec(html)?.[1];
    const min = label ? toNumber(label) : null;
    if (!label || min === null) throw new Error('install count not found on the page');
    next.apps[id] = { label, min };
    changed++;
  } catch (err) {
    console.warn(`play-stats: kept the saved value for ${id} (${err.message})`);
  }
}

// en-CA formats as YYYY-MM-DD in the local time zone.
if (changed) next.updated = new Date().toLocaleDateString('en-CA');
writeFileSync(FILE, JSON.stringify(next, null, 2) + '\n');
const total = Object.values(next.apps).reduce((s, a) => s + a.min, 0);
console.log(`play-stats: ${changed}/${Object.keys(APPS).length} apps refreshed, total ${total.toLocaleString('en-US')}+ installs`);
