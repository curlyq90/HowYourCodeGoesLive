# Git workflow interactive prototype

_Started 2026-07-10 17:19 UTC_

---

## User

create an interactive prototype that explains to me, as a non developer, how git works - PRs, merges, CI checks, the live site publishing updates, and how preview and vercel works, etc. ask any clarifying questios you have. do not design this in dark mode - bright and light, and easy for a non engingeer to understand and apply to their workflows.

## Assistant

_[tool: update_todos]_

_[tool: github_get_tree]_

_[tool: github_read_files]_

_[tool: github_read_files]_

_[tool: github_get_tree]_

_[tool: github_read_files]_

I've explored your repo — I can see your real setup: feature branches → PRs → CI checks (Lint, Typecheck, Test, Build) → Vercel preview deployments → merge to `main` → live at kehillahq.com. A few questions before I build:

_[tool: questions_v2]_

## User

Questions answered:
- grounding: use kehilla examples, but also best practices (which i may need to correct)
- format: Decide for me
- depth: All of the above
- perspective: I do it all as a solo founder
- interactivity: between very and moderate
- analogies: mix - i want something that non engingeers can understand, but also build in real termonolgy so they can upskill/learn
- length: Decide for me
- aesthetic: clean, friendly and playful
- other_notes: how the system works that i dont see as i'm in claude code mostly and then make prs, but also push to vercel and then i need to merge, etc

## Assistant

Got it — a guided, hands-on journey following one real change through your Kehilla pipeline, with a troubleshooting section and a jargon buster. Building it now.

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: show_html]_

I want to verify the interactive states render before handing off.

_[tool: show_html]_

Intro looks great. Let me check a journey scene with interactive state — the CI checks after running.

_[tool: multi_screenshot]_

_[tool: multi_screenshot]_

The rail, scene transitions, and CI animation all work — checks ran pending → passed and the rail marked steps done. Handing off to verification.

_[tool: update_todos]_

_[tool: ready_for_verification]_

Built **How your code goes live** — an interactive tour grounded in your real Kehilla setup.

**The Journey** — follow one change (`feat: add yahrzeit email notifications`) through 8 hands-on stages: edit in Claude Code → commit → push → open PR → run your 4 real CI checks (Lint/Typecheck/Test/Build animate live) → Vercel builds a preview URL → merge to main → auto-deploys to kehillahq.com. Each step pairs plain English, real dev terms, and an analogy. You click buttons to advance the simulation.

**When it breaks** — failed checks, the env-var gotcha, merge conflicts, rollbacks, plus the manual-SQL-migration trap that's actually bitten your project.

**Jargon buster** — tap any term for a one-line definition.

Two things worth a sanity-check from you, since you asked me to flag best-practice bits to correct: (1) I show a PR-based flow even for solo work — some solo founders push straight to `main`; I recommend PRs because that's what triggers your checks + preview. (2) I say preview deploys happen automatically on every PR — confirm your Vercel project is connected that way. You can edit the production URL via Tweaks if it's ever not kehillahq.com.

## User

lets add a couple more steps...when you're starting work...opening a branch or a worktree....?

## Assistant

Good addition — starting clean from a branch (and worktrees for parallel Claude Code work) is exactly the invisible "before" step. I'll insert two steps at the front, making it a 10-stage journey.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the template: rename the scene flags and add the two new visuals.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Let me verify the two new steps render correctly.

_[tool: multi_screenshot]_

The preview is showing stale state — let me reload it fresh.

_[tool: show_html]_

_[tool: multi_screenshot]_

Both new steps render correctly — the branch diagram with git commands, and the worktree with two side-by-side folders. The rail now shows all 10 stages ("step 1 of 10"). Handing off to verification.

_[tool: ready_for_verification]_

Added two opening steps, so the journey is now 10 stages:

**1. Branch** — start clean from `main` (`git pull` → `git checkout -b …`), with a diagram of the branch splitting off.
**2. Worktree** *(optional)* — framed as a power-user move for running two branches at once (great for parallel Claude Code work), shown as two side-by-side folders.

Everything after shifted down: Edit → Commit → Push → PR → Checks → Preview → Merge → Live. The rail, step counter, and all interactions updated accordingly.

