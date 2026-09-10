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

export const WORKTREE = {
    id: 'worktree', label: 'WORKTREE', machine: 'computer', side: 'left',
    title: '(Optional) spin up a worktree',
    plain: "A worktree is a power-user trick: several branches checked out at once, each in its own folder. Perfect for running two AI coding sessions in parallel — one building a feature, one fixing a bug — without them stepping on each other. Skip it until you feel the need; a plain branch is all most work requires.",
    real: "<code>git worktree add -b hotfix/login ../picnic-hotfix</code> gives you a second working folder on the <code>hotfix/login</code> branch, side by side with your main folder — same repo, no clashing. Tidy up with <code>git worktree remove ../picnic-hotfix</code> when done.",
    analogy: "having two desks in the same office — one for the feature you're building, one for a quick fix — so you never clear either desk just to switch tasks.",
  };

export const BEATS = [
  {
    id: 'branch', label: 'BRANCH', machine: 'computer', side: 'right',
    title: 'You open a branch',
    plain: "Before touching anything, you spin off a branch — a named line of work starting from your current code. Your edits stay separate from main until you merge them. In this example, main is the branch Vercel uses for production.",
    real: "First get current: <code>git checkout main</code> then <code>git pull</code>. Then <code>git checkout -b feature/rsvp-reminders</code> creates the branch and switches you onto it. In Claude Code or Cursor you rarely type this — say \"start a branch for RSVP reminders\" and your AI can run the commands for you. Check which branch it chose.",
    analogy: "grabbing a fresh photocopy of the master document to scribble on — the original stays clean no matter what you do.",
  },
  WORKTREE,
  {
    id: 'edit', label: 'EDIT', machine: 'computer', side: 'right',
    title: 'You make a change',
    plain: "In this example, you or your AI pair edit files on your computer. You might describe a change in Claude Code or Cursor, then review what it wrote. The files have changed locally, but nothing has been deployed to your live site.",
    real: "Your files as they sit right now are the <b>working directory</b>. The whole tracked project is the <b>repository</b> (\"repo\"). AI tools work right here — Claude Code and Cursor edit the same working directory you would, on your branch <code>feature/rsvp-reminders</code>. Some tools also offer hosted workspaces; AI services may receive code context even before you push.",
    analogy: "editing a photocopy of a document — with a very fast assistant holding the pen — while the original stays untouched.",
  },
  {
    id: 'commit', label: 'COMMIT', machine: 'computer', side: 'left',
    title: 'You commit the change',
    plain: "A commit is a labeled save point. You gather up the edits and write a short note describing them. Unlike saving a file, a commit records a snapshot in Git history, so you can return to it while that history is retained.",
    real: "<code>git add &lt;files&gt;</code> stages the files (puts them in the envelope); <code>git commit -m \"…\"</code> seals it with a message. Each commit gets a unique <b>hash</b> so it can always be found again. AI tools usually write the commit message for you — read it before you approve; it should accurately describe your change.",
    analogy: "saving a version of a doc titled \"added reminder emails\" — with a history of the versions you have kept.",
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
    plain: "A Pull Request (PR) is you formally proposing: \"Please fold my branch's changes into the main app.\" It's a single page to review and discuss one set of changes, alongside any checks and previews configured for the project.",
    real: "You're asking to merge your <b>compare branch</b> (the feature) into the <b>base branch</b> (<code>main</code>). Claude Code can open it for you (<code>gh pr create</code>). Even solo it's worth doing: it gives you a place to review the diff, check results, and open a preview before merging. Checks and deployments can also start when you push, depending on the setup.",
    analogy: "a request to merge your photocopy edits back into the master document — with an automatic safety inspection attached.",
    action: { label: 'OPEN THE PULL REQUEST', cls: 'b-indigo', event: 'pr', doneStatus: 'example PR #128 open — ready for review' },
  },
  {
    id: 'checks', label: 'CHECKS', machine: 'github', side: 'right',
    title: 'Automatic checks run',
    plain: "With CI configured, automated checks inspect your changes when you push or open a PR. They can catch problems before deployment. Here, four example gates show the kinds of checks a project might run.",
    real: "This is <b>CI</b> (Continuous Integration), run by <b>GitHub Actions</b>. Four typical jobs: <b>Lint</b>, <b>Typecheck</b>, <b>Test</b>, and <b>Build</b>. Failed checks block a merge when the repository requires them. Green means these checks passed, not that the change is bug-free. Review the diff and test the preview too. If a check fails, inspect the log, fix the cause, and push again.",
    analogy: "an automatic quality inspection on an assembly line — every item checked before it can move on.",
    action: { label: 'RUN THE CHECKS', cls: 'b-indigo', event: 'checks', busyStatus: 'checks running…', doneStatus: '4 example checks passed — review and test the preview too' },
  },
  {
    id: 'preview', label: 'PREVIEW', machine: 'vercel', side: 'left',
    title: 'Vercel builds a preview',
    plain: "With the Git integration configured, Vercel builds your branch at a separate preview address when you push. You can test the change without replacing your production site. Who can open the preview depends on its access settings.",
    real: "This is a <b>Preview Deployment</b>. A branch deployment gets a <code>*.vercel.app</code> URL and uses the <b>Preview</b> environment variables. Enable <b>Deployment Protection</b> if access should be restricted. Test with suitable data: a preview is not automatically isolated from your production database or services.",
    analogy: "a working showroom model of your product — with its own guest list — before it reaches the main shop window.",
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
    plain: "In this setup, a push or merge to main starts a production build on Vercel. After a successful build and deployment, the new version is served at your real domain. Check the deployment status and try the live feature to confirm it shipped.",
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
  ['branch', "A named line of development where changes can stay separate until merged. You work on branches, then merge them in."],
  ['worktree', "A power-user setup where several branches are checked out at once, each in its own folder — same repo, no switching."],
  ['commit', "A labeled save point in Git history. A snapshot of your files plus a short message describing what changed."],
  ['hash', "The unique ID of a commit (a short code like a1b2c3d). Lets you point to one exact moment in history."],
  ['push', "Uploading your commits from your laptop up to GitHub, so they're backed up and shareable."],
  ['pull', "Fetching changes from a remote repository and integrating them into your current branch. Conflicts sometimes need resolving."],
  ['origin', "A conventional nickname for a remote repository. Here it points to GitHub; it can point to another host."],
  ['main', "The primary branch — the official, source-of-truth version of your app. In this example, changes to main trigger a production deployment."],
  ['pull request', "A PR: a proposal to merge one branch into another, with a review page. Configured checks and previews can appear alongside the review."],
  ['merge', "Combining the changes from one branch into another — e.g. folding your feature into main."],
  ['merge conflict', "When two edits change the same lines and Git can't decide which to keep. You choose the right version, then commit."],
  ['CI', "Continuous Integration — automatic checks (lint, tests, build) that run on every PR to catch problems early."],
  ['GitHub Actions', "GitHub's built-in robot that runs workflows on the events configured for your repository, such as a push or a pull request."],
  ['deploy', "Publishing your code so it actually runs on a server people can reach — done here by Vercel."],
  ['preview deployment', "A separate deployment for testing a branch, often linked from a PR. Access depends on deployment protection and sharing settings."],
  ['production', "The real, public version of your app that live users see — your actual domain."],
  ['environment variable', "A setting supplied to an app by its environment. Some are secrets, such as API keys; others are public. Configure local, preview, and production values appropriately, and never expose secrets in browser code."],
  ['rollback', "Serving a previous deployment when something breaks. A deployment rollback does not automatically undo database or other external changes."],
  ['Claude Code / Cursor', "AI coding tools that can work locally or in hosted environments. They edit your working directory, run git commands, and open PRs — the same pipeline, with an assistant driving."],
  ['IDE', "Integrated Development Environment — the app you edit code in (VS Code, Cursor). Claude Code runs in a terminal but plays the same role."],
  ['working directory', "Your project files as they sit on disk right now — the live scratch space that commits take snapshots of."],
];

// State of the example change at each chapter; all actions are simulations.
export const JOURNEY_STATES = [
  'A separate line of work · production unchanged',
  'Optional second working folder · production unchanged',
  'Files edited locally · not committed yet',
  'Snapshot saved locally · not pushed yet',
  'Branch uploaded to GitHub · production unchanged',
  'Changes proposed for review · not merged yet',
  'Example checks running · human review still matters',
  'Preview deployed separately · access depends on settings',
  'Changes joined main · production build can begin',
  'Successful deployment · available on the live domain',
];

export const TERM_GROUPS = [
  ['On your computer', ['repo', 'branch', 'worktree', 'working directory', 'commit', 'hash', 'Claude Code / Cursor', 'IDE']],
  ['On GitHub', ['push', 'pull', 'origin', 'main', 'pull request', 'merge', 'merge conflict', 'CI', 'GitHub Actions']],
  ['On Vercel', ['deploy', 'preview deployment', 'production', 'environment variable', 'rollback']],
];
