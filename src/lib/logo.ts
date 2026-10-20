// Geometry of the Xypher X, drawn in a 100 × 73 box.
// Two 45° bands make a normal X. The left half (both left arms plus the
// centre diamond) becomes the chevron; the two right arms are cut free of it
// by a gap that runs parallel to the chevron's edges.

export type Pt = [number, number];

export const X_W = 100;
export const X_H = 73;

/** Three pieces: chevron, upper-right arm, lower-right arm. `gap` is measured perpendicular to the cut. */
export function xPieces(gap = 4): Pt[][] {
  const c = gap * Math.SQRT2;
  const a = (100 + c) / 2;
  const b = (127 + c) / 2;
  const chevron: Pt[] = [[0, 0], [27, 0], [63.5, 36.5], [27, 73], [0, 73], [36.5, 36.5]];
  const upper: Pt[] = [[73, 0], [100, 0], [b, 100 - b], [a, 73 - a]];
  const lower: Pt[] = [[b, b - 27], [100, 73], [73, 73], [a, a]];
  return [chevron, upper, lower];
}

type Corner = { a: Pt; p: Pt; b: Pt };

/** For every vertex, the points where its rounded corner starts (a) and ends (b). */
export function roundedCorners(pts: Pt[], r: number): Corner[] {
  const n = pts.length;
  return pts.map((p, i) => {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const dPrev = Math.hypot(prev[0] - p[0], prev[1] - p[1]);
    const dNext = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const rr = Math.min(r, dPrev * 0.45, dNext * 0.45);
    return {
      a: [p[0] + ((prev[0] - p[0]) / dPrev) * rr, p[1] + ((prev[1] - p[1]) / dPrev) * rr],
      p,
      b: [p[0] + ((next[0] - p[0]) / dNext) * rr, p[1] + ((next[1] - p[1]) / dNext) * rr],
    };
  });
}

export function toSvgPath(pts: Pt[], r = 1.8): string {
  const c = roundedCorners(pts, r);
  const f = (v: number) => +v.toFixed(2);
  let d = `M${f(c[0].b[0])} ${f(c[0].b[1])}`;
  for (let i = 1; i <= c.length; i++) {
    const k = c[i % c.length];
    d += `L${f(k.a[0])} ${f(k.a[1])}Q${f(k.p[0])} ${f(k.p[1])} ${f(k.b[0])} ${f(k.b[1])}`;
  }
  return d + 'Z';
}

export const piecePaths = xPieces().map((p) => toSvgPath(p));

/** Centroid of each piece in the 100 × 73 box, handy for transform origins. */
export const pieceCentres: Pt[] = xPieces().map((pts) => {
  const sx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const sy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [sx, sy];
});
