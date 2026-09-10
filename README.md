# How Your Code Goes Live

**Live site → [how-your-code-goes-live.vercel.app](https://how-your-code-goes-live.vercel.app/)**

A scroll-driven, 3D motion site that explains — in plain English, for non-engineers —
what actually happens between "I asked my AI for a change" and "it's live on my website."

You follow a single code change (a glowing gem) through the whole pipeline:

1. **Branch** — start a separate line of development
2. **Worktree (optional)** — open another branch in its own working folder
3. **Edit** — you or your AI pair change the files
4. **Commit** — record a labeled snapshot
5. **Push** — upload it to GitHub
6. **Pull Request** — propose and review the changes
7. **Checks** — configured CI jobs inspect the code
8. **Preview** — Vercel builds a separate deployment for testing
9. **Merge** — the change joins `main`
10. **Live** — a successful production deployment serves the new version

Worktrees appear as optional step 2, with their own scene and explanations.
This illustrates one configured GitHub + Vercel workflow, not universal defaults.
Preview access depends on deployment protection; checks block merging only when required.
The action buttons and status messages are simulations.

Every step pairs a 3D scene with plain-English copy, real developer terminology
(tap to expand), and an everyday analogy. There's also a **jargon buster** — tap
JARGON in the header.

The example product is fictional: *Picnic*, a little community-events app at
`mypicnic.app`.

## Running it locally

Requires [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## How it's built

- [Vite](https://vitejs.dev) — dev server & build
- [Three.js](https://threejs.org) — the 3D world (procedural geometry, canvas-texture signage)
- [GSAP ScrollTrigger](https://gsap.com) — scroll-driven camera and animations
- [Lenis](https://lenis.darkroom.engineering) — smooth scrolling

Key files:

| Path | What it is |
|---|---|
| `index.html` | Page shell, header/HUD, intro & outro |
| `src/content.js` | All journey copy + jargon definitions |
| `src/world.js` | The entire 3D world: scenes, camera path, animations |
| `src/main.js` | Scroll wiring, progress stops, interactions, jargon overlay |
| `src/style.css` | The retro-modern design system |
| `prototype/` | The original flat prototype this evolved from |

## How it deploys

Exactly the way the site teaches: this repo is connected to Vercel.
Every push to `main` automatically rebuilds and publishes the live site.
Pull requests get their own preview deployments.

## Public-sharing refinements

The page includes an ops-builder origin note, practical questions to ask before
approving AI changes, a grouped glossary, readable map navigation, and Open Graph
metadata. `public/social-preview.png` is the 1200 × 630 sharing card. Regenerate it
with `scripts/social-preview.py` (Pillow and macOS Arial fonts).

Reduced-motion preferences disable smooth navigation and use static scene states.
If WebGL cannot initialize, the full written journey remains available.

Validation covers the production build, desktop/mobile layouts, chapter navigation,
disclosures, glossary keyboard containment/return focus, simulated actions, restart,
and temporary reduced-motion/WebGL-failure fixtures.
