# How Your Code Goes Live

**Live site → [how-your-code-goes-live.vercel.app](https://how-your-code-goes-live.vercel.app/)**

A scroll-driven, 3D motion site that explains — in plain English, for non-engineers —
what actually happens between "I asked my AI for a change" and "it's live on my website."

You follow a single code change (a glowing gem) through the whole pipeline:

1. **Branch** — spin off a private copy of the code
2. **Worktree** *(optional)* — two branches open at once
3. **Edit** — you (or your AI pair — Claude Code, Cursor) change the files
4. **Commit** — seal a labeled save point
5. **Push** — upload it to GitHub
6. **Pull Request** — propose folding it into the main app
7. **Checks** — CI robots inspect the code (Lint · Typecheck · Test · Build)
8. **Preview** — Vercel builds a private, working copy at a temporary URL
9. **Merge** — the change joins `main`, the source of truth
10. **Live** — Vercel automatically publishes it to the real domain

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
