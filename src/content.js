// ============================================================
// Journey copy — grounded in a made-up product so it's easy to
// follow: "Picnic", a little community-events app at mypicnic.app.
// The example change: RSVP reminder emails.
//
// Each beat: machine, title, plain, real (HTML), analogy,
// side (which side the copy card sits on), and optional action.
// AI-pair notes (Claude Code / Cursor) are woven in because most
// non-developers aren't typing in a terminal — their AI is.
// ============================================================

export const PROD_URL = 'mypicnic.app';

export const MACHINES = {
  computer: { name: 'YOUR COMPUTER', cls: 'm-computer', kicker: '' },
  github:   { name: 'GITHUB',        cls: 'm-github',   kicker: 'k-github' },
  vercel:   { name: 'VERCEL',        cls: 'm-vercel',   kicker: 'k-vercel' },
};

export const BEATS = [
  {
    id: 'branch', label: 'BRANCH', machine: 'computer', side: 'right',
    title: 'You open a branch',
    plain: "Before touching anything, you spin off a branch — a private, named line of work that starts as an exact copy of the live code. This keeps main (the version users see) pristine while you experiment. It's the very first move when starting any new piece of work.",
    real: "First get current: <code>git checkout main</code> then <code>git pull</code>. Then <code>git checkout -b feature/rsvp-reminders</code> creates the branch and switches you onto it. In Claude Code or Cursor you rarely type this — say \"start a branch for RSVP reminders\" and your AI runs these exact commands.",
    analogy: "grabbing a fresh photocopy of the master document to scribble on — the original stays clean no matter what you do.",
  },
  {
    id: 'worktree', label: 'WORKTREE', machine: 'computer', side: 'left',
    title: '(Optional) spin up a worktree',
    plain: "A worktree is a power-user trick: several branches checked out at once, each in its own folder. Perfect for running two AI coding sessions in parallel — one building a feature, one fixing a bug — without them stepping on each other. Skip it until you feel the need; a plain branch is all most work requires.",
    real: "<code>git worktree add ../picnic-hotfix hotfix/login</code> gives you a second working folder on the <code>hotfix/login</code> branch, side by side with your main folder — same repo, no clashing. Tidy up with <code>git worktree remove</code> when done.",
    analogy: "having two desks in the same office — one for the feature you're building, one for a quick fix — so you never clear either desk just to switch tasks.",
  },
  {
    id: 'edit', label: 'EDIT', machine: 'computer', side: 'right',
    title: 'You make a change',
    plain: "This is your laptop — your private workshop. Maybe you type the code yourself, but more likely you're in Claude Code or Cursor, describing what you want while your AI pair edits the actual files. Either way the result is identical: changed files on your machine. Crucially, no user and no server can see any of this yet.",
    real: "Your files as they sit right now are the <b>working directory</b>. The whole tracked project is the <b>repository</b> (\"repo\"). AI tools work right here — Claude Code and Cursor edit the same working directory you would, on your branch <code>feature/rsvp-reminders</code>.",
    analogy: "editing a photocopy of a document — with a very fast assistant holding the pen — while the original stays untouched.",
  },
  {
    id: 'commit', label: 'COMMIT', machine: 'computer', side: 'left',
    title: 'You commit the change',
    plain: "A commit is a labeled save point. You gather up the edits and write a short note describing them. Unlike a normal \"save\", every commit is kept forever — you can always rewind to exactly this moment.",
    real: "<code>git add</code> stages the files (puts them in the envelope); <code>git commit -m \"…\"</code> seals it with a message. Each commit gets a unique <b>hash</b> so it can always be found again. AI tools usually write the commit message for you — read it before you approve; it's your label forever.",
    analogy: "saving a version of a doc titled \"added reminder emails\" — except you can jump back to any save you've ever made.",
    action: { label: 'SEAL THE COMMIT', cls: '', event: 'commit', doneStatus: 'commit a1b2c3d sealed · 3 files' },
  },
  {
    id: 'push', label: 'PUSH', machine: 'github', side: 'right',
    title: 'You push to GitHub',
    plain: "Your commit still only exists on your laptop. Pushing uploads your branch to GitHub — the shared cloud home for your code. Now it's backed up, and other machines (like Vercel) can see it.",
    real: "<code>git push origin feature/rsvp-reminders</code>. <b>origin</b> is just a nickname for \"GitHub, the remote copy\". In Claude Code, \"push this\" runs the same command. Your local branch now has a twin living in the cloud.",
    analogy: "dropping your sealed envelope at the post office's sorting center — safely stored, and ready to be routed onward.",
  },
  {
    id: 'pr', label: 'PULL REQUEST', machine: 'github', side: 'left',
    title: 'You open a Pull Request',
    plain: "A Pull Request (PR) is you formally proposing: \"Please fold my branch's changes into the main app.\" It's a single page to review one set of changes — and opening it is what triggers all the automatic magic that follows.",
    real: "You're asking to merge your <b>compare branch</b> (the feature) into the <b>base branch</b> (<code>main</code>). Claude Code can open it for you (<code>gh pr create</code>). Even solo it's worth doing: the PR is what kicks off the checks and gives you a preview before anything reaches real users.",
    analogy: "a request to merge your photocopy edits back into the master document — with an automatic safety inspection attached.",
    action: { label: 'OPEN THE PULL REQUEST', cls: 'b-indigo', event: 'pr', doneStatus: 'PR #128 open — GitHub & Vercel spring into action' },
  },
  {
    id: 'checks', label: 'CHECKS', machine: 'github', side: 'right',
    title: 'Automatic checks run',
    plain: "The instant your PR exists, robots inspect your code — no button to press. If any fail, you find out here, long before a single user is affected. Watch the four inspection gates do their pass.",
    real: "This is <b>CI</b> (Continuous Integration), run by <b>GitHub Actions</b>. Four typical jobs: <b>Lint</b>, <b>Typecheck</b>, <b>Test</b>, and <b>Build</b>. A red ✗ blocks the merge; all green means it's safe to proceed. When one fails, paste the log into your AI — it's usually a quick fix and a re-push.",
    analogy: "an automatic quality inspection on an assembly line — every item checked before it can move on.",
    action: { label: 'RUN THE CHECKS', cls: 'b-indigo', event: 'checks', busyStatus: 'checks running…', doneStatus: 'all 4 checks passed — safe to merge' },
  },
  {
    id: 'preview', label: 'PREVIEW', machine: 'vercel', side: 'left',
    title: 'Vercel builds a preview',
    plain: "This is the part you never see from inside your editor. The moment your PR opens, Vercel quietly builds a private, fully-working copy of your app — with your changes — at its own temporary web address. You can click around the real thing before the public does.",
    real: "This is a <b>Preview Deployment</b>. Every PR gets one at a <code>*.vercel.app</code> URL, using the <b>Preview</b> environment variables. Your live users never see it.",
    analogy: "a working showroom model of your product — open only to you — before it ever hits the shelves.",
    action: { label: 'DEPLOY THE PREVIEW', cls: 'b-purple', event: 'preview', busyStatus: 'building preview…', doneStatus: 'picnic-git-feat-rsvp-reminders.vercel.app is live' },
  },
  {
    id: 'merge', label: 'MERGE', machine: 'github', side: 'right',
    title: 'You merge to main',
    plain: "Checks green and preview looking good? Merging folds your branch into main — the official, single source of truth for your app. This is the decision that says \"yes, ship this.\"",
    real: "You click <b>Merge pull request</b>. Your commits now live on <code>main</code>. If Git can't auto-combine two edits to the same lines, that's a <b>merge conflict</b> — you (or your AI) pick the right version, then commit.",
    analogy: "your approved photocopy edits finally being copied back onto the master document everyone works from.",
    action: { label: 'MERGE TO MAIN', cls: 'b-indigo', event: 'merge', doneStatus: 'merged — main moved forward' },
  },
  {
    id: 'live', label: 'LIVE', machine: 'vercel', side: 'left',
    title: 'It goes live automatically',
    plain: "The instant main changes, Vercel notices and — with no action from you — rebuilds and publishes it to your real domain. Your feature is now live for everyone. That's the whole loop.",
    real: "This is the <b>Production Deployment</b>, triggered by the merge to <code>main</code>. It uses <b>Production</b> env vars and serves your live site. One caution: if your change needs a database migration, make sure it actually runs — green checks don't guarantee that.",
    analogy: "the delivery truck taking the approved master copy and shipping it to every store at once.",
    action: { label: 'SHIP IT LIVE', cls: 'b-purple', event: 'ship', busyStatus: 'deploying to production…', doneStatus: PROD_URL + ' is live for everyone' },
  },
];

// ============================================================
// Jargon buster — from the original prototype, plus AI-era terms
// ============================================================
export const TERMS = [
  ['repo', "Short for repository — the project folder that Git is tracking, including its entire history of changes."],
  ['branch', "A safe parallel copy of the code where you make changes without touching the live version. You work on branches, then merge them in."],
  ['worktree', "A power-user setup where several branches are checked out at once, each in its own folder — same repo, no switching."],
  ['commit', "A permanent, labeled save point. A snapshot of your files plus a short message describing what changed."],
  ['hash', "The unique ID of a commit (a short code like a1b2c3d). Lets you point to one exact moment in history."],
  ['push', "Uploading your commits from your laptop up to GitHub, so they're backed up and shareable."],
  ['pull', "The opposite of push — downloading the latest commits from GitHub onto your laptop."],
  ['origin', "The default nickname for \"GitHub\" — the remote, cloud copy of your repo."],
  ['main', "The primary branch — the official, source-of-truth version of your app. Merging into main is what goes live."],
  ['pull request', "A PR: a proposal to merge one branch into another, with a review page. Opening it triggers checks and a preview."],
  ['merge', "Combining the changes from one branch into another — e.g. folding your feature into main."],
  ['merge conflict', "When two edits change the same lines and Git can't decide which to keep. You choose the right version, then commit."],
  ['CI', "Continuous Integration — automatic checks (lint, tests, build) that run on every PR to catch problems early."],
  ['GitHub Actions', "GitHub's built-in robot that runs your CI checks automatically whenever code changes."],
  ['deploy', "Publishing your code so it actually runs on a server people can reach — done here by Vercel."],
  ['preview deployment', "A private, live copy of your app for a single PR, at a temporary *.vercel.app URL. For testing before it's public."],
  ['production', "The real, public version of your app that live users see — your actual domain."],
  ['environment variable', "A secret setting (API key, database URL) stored on the machine, not in your code. Must be set on Vercel separately from your laptop."],
  ['rollback', "Instantly reverting your live site to a previous good deploy when something breaks."],
  ['Claude Code / Cursor', "AI coding tools that live on your machine. They edit your working directory, run git commands, and open PRs — the same pipeline, with an assistant driving."],
  ['IDE', "Integrated Development Environment — the app you edit code in (VS Code, Cursor). Claude Code runs in a terminal but plays the same role."],
  ['working directory', "Your project files as they sit on disk right now — the live scratch space that commits take snapshots of."],
];
