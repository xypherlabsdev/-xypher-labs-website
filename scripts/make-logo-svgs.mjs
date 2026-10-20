// Writes the logo SVGs from the same geometry the site uses.
// Run: node scripts/make-logo-svgs.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { piecePaths } from '../src/lib/logo.ts';

const COBALT = '#2457FF';
const WHITE = '#F8FAFC';
const INK = '#111827';
const paths = (fill) => piecePaths.map((d) => `<path fill="${fill}" d="${d}"/>`).join('');

const tile = (rx) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${rx}" fill="${COBALT}"/><g transform="translate(19 27.37) scale(0.62)">${paths(WHITE)}</g></svg>\n`;
const mark = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 73">${paths(fill)}</svg>\n`;

mkdirSync('public', { recursive: true });
writeFileSync('public/favicon.svg', tile(24));
writeFileSync('public/logo.svg', tile(24));

const out = '../brand';
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/xypher-icon-rounded.svg`, tile(24));
writeFileSync(`${out}/xypher-icon-square.svg`, tile(0));
writeFileSync(`${out}/xypher-x-cobalt.svg`, mark(COBALT));
writeFileSync(`${out}/xypher-x-white.svg`, mark(WHITE));
writeFileSync(`${out}/xypher-x-ink.svg`, mark(INK));
console.log('logo SVGs written');
