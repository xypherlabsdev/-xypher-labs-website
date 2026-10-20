# Xypher Labs website

Static one-page site for Xypher Labs. React 19 + Vite, three.js (via @react-three/fiber) for the 3D logo,
Motion for scroll and UI animation, Lenis for smooth scrolling.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs static files to dist/
npm run preview   # serves the built dist/ locally
```

## Where to change things

| What | File |
|---|---|
| All text: tagline, apps, principles, tech stack, lab experiments, email, Play link | `src/data/site.ts` |
| App icons and Play Store graphics | `public/apps/` |
| Logo geometry (used by the 3D hero, favicon and every SVG) | `src/lib/logo.ts` |
| Regenerate favicon + brand SVGs after a geometry change | `node scripts/make-logo-svgs.mjs` |
| Colours and fonts | top of `src/styles/global.css` |
| Install counts (pulled from Google Play) | `npm run stats` → `src/data/play-stats.json` |

## Sections

1. **Hero**: the app icon blown up to full screen with the X in 3D. Scrolling folds it back into the icon tile.
2. **Apps**: the four live Play Store apps as cards that pin and stack while you scroll.
3. **Approach**: three principles; each one slides a piece of the logo into place.
4. **Built with**: tech stack marquee.
5. **Lab**: a working terminal (`help`, `apps`, `lab`, `open autotally`, `decode` …).
6. **Contact** and **Footer**.

## Install counts

`npm run build` first runs `scripts/update-play-stats.mjs`, which reads the install range ("1K+", "100+")
from each app's Google Play page and saves it to `src/data/play-stats.json`. If Play can't be reached,
the last saved numbers are used and the build still succeeds. Rebuild and redeploy now and then to keep
the numbers fresh. New app? Add its package name in the script and its colour in `chartOrder` (`src/data/site.ts`).

## Deploy

Hosted free on GitHub Pages. `.github/workflows/deploy.yml` builds and publishes the site on every push
to `main`, every Monday (which refreshes the install counts) and from the Actions tab ("Run workflow").

One-time setup:

1. Push this folder to a public GitHub repo (Pages on private repos needs a paid plan).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Settings → Pages → Custom domain: `xypherlabs.dev`, then tick **Enforce HTTPS** once the certificate is ready.
4. DNS lives on Cloudflare. Add these records with the proxy **off** (grey cloud, "DNS only"), otherwise GitHub
   cannot issue the HTTPS certificate:
   - `xypherlabs.dev` (`@`): A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: CNAME to `xypherlabsdev.github.io`
5. Optional but recommended: verify the domain under GitHub → Settings (account) → Pages, so no one else can
   use it on GitHub.

Asset paths are relative (`base: './'` in `vite.config.ts`, `apps/...` in `src/data/site.ts`), so the site works
both at the root of the custom domain and at `<user>.github.io/<repo>/`. Keep new asset paths relative too. `.dev` domains are HTTPS-only in every browser, so the site shows a connection
error until GitHub has issued the certificate (usually under an hour after DNS resolves). The canonical and
`og:` URLs in `index.html` point at `https://xypherlabs.dev/`; change them if the domain ever changes.

GitHub pauses scheduled workflows in public repos after 60 days with no commits and emails you; re-enable it
from the Actions tab, or push any change.
