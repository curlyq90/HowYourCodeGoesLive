// ============================================================
// Bootstrap: DOM beats, smooth scroll, camera scrub, HUD, events
// ============================================================

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createWorld } from './world.js';
import { BEATS, MACHINES, TERMS, JOURNEY_STATES, TERM_GROUPS } from './content.js';

gsap.registerPlugin(ScrollTrigger);

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let REDUCED = motionPreference.matches;
const motionOptions = duration => REDUCED ? { immediate: true } : { duration };
const CAMERA_KEYS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ---------- build beat sections ----------
const beatsHost = document.getElementById('beats');
beatsHost.outerHTML = BEATS.map((b, i) => {
  const m = MACHINES[b.machine];
  const action = b.action ? `
    <button class="btn mono ${b.action.cls}" data-event="${b.action.event}">${b.action.label}</button>
    <div class="status-line" role="status" data-status="${b.action.event}" hidden></div>` : '';
  return `
  <section class="beat" id="beat-${b.id}" data-beat="${i + 1}" data-side="${b.side}">
    <div class="copy">
      <div class="stepno mono">
        <span class="machine ${m.cls}">${m.name}</span>
        <span>STEP ${String(i + 1).padStart(2, '0')} / ${BEATS.length}</span>
      </div>
      <h2>${b.title}</h2>
      <p>${b.plain}</p>
      <p class="change-location"><span class="mini-gem" aria-hidden="true"></span>${JOURNEY_STATES[i]}</p>
      <div class="xp">
        <button class="xp-head" aria-expanded="false" aria-controls="real-${b.id}"><span class="xp-arrow">▸</span> IN REAL DEVELOPER TERMS</button>
        <div class="xp-body" id="real-${b.id}" hidden><div class="xp-pad">${b.real}</div></div>
      </div>
      <div class="xp xp-amber">
        <button class="xp-head" aria-expanded="false" aria-controls="analogy-${b.id}"><span class="xp-arrow">▸</span> THINK OF IT LIKE…</button>
        <div class="xp-body" id="analogy-${b.id}" hidden><div class="xp-pad">${b.analogy}</div></div>
      </div>
      ${action}
      ${b.action ? '<small class="simulation-note">Illustration only — these buttons simulate the process.</small>' : ''}
    </div>
  </section>`;
}).join('');

// expanders
document.addEventListener('click', e => {
  const head = e.target.closest('.xp-head');
  if (!head) return;
  const xp = head.parentElement;
  const open = xp.classList.toggle('open');
  head.setAttribute('aria-expanded', open);
  xp.querySelector('.xp-body').hidden = !open;
  ScrollTrigger.refresh();
  layoutStops();
});

// ---------- boot overlay ----------
const boot = document.createElement('div');
boot.id = 'boot';
boot.innerHTML = `<div class="boot-box" id="boot-box">BIOS v9.6 — picnic pipeline<br></div>`;
document.body.appendChild(boot);
const bootLines = [
  ['checking git…', 'OK'],
  ['mounting github remote…', 'OK'],
  ['waking vercel…', 'OK'],
];

// ---------- world (created in init(), after fonts load: canvas
// textures bake text at build time, so fonts must be ready) ----------
let world = null;

// ---------- smooth scroll ----------
const lenis = new Lenis({ lerp: 0.1, smoothWheel: !REDUCED, wheelMultiplier: 0.95 });
motionPreference.addEventListener('change', event => {
  REDUCED = event.matches;
  lenis.options.smoothWheel = !REDUCED;
  if (REDUCED) lenis.scrollTo(window.scrollY, { immediate: true });
  if (world) world.reducedMotion = REDUCED;
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);

// ---------- journey timeline (the header bar) ----------
// Drag anywhere on the bar and the page scrolls with you — camera, gem
// and step events all follow. Click a step stop to jump to that step;
// hover to see which step is where. In map mode the bar widens and
// shows every step's name.
const scrubbers = [];
const sections = () => [...document.querySelectorAll('.beat')];
const clamp01 = v => Math.min(1, Math.max(0, v));

function buildScrubber(host) {
  host.innerHTML = '';
  host.classList.add('scrub');
  host.setAttribute('role', 'group');
  host.setAttribute('tabindex', '0');

  host.title = 'Drag to move through the journey';

  const fill = document.createElement('div');
  fill.className = 'scrub-fill';
  host.appendChild(fill);

  const stops = BEATS.map((b, i) => {
    const m = MACHINES[b.machine];
    const stop = document.createElement('button');
    stop.className = `stop ${m.cls}`;
    stop.dataset.stop = i + 1;
    stop.setAttribute('aria-label', `Step ${i + 1}: ${b.label}`);
    stop.innerHTML = `<span class="stop-lbl">${String(i + 1).padStart(2, '0')}<br>${b.label}</span>`;
    // keyboard activation only — pointer clicks are handled by the drag logic below
    stop.addEventListener('click', e => { if (e.detail === 0) snapToBeat(i + 1); });
    host.appendChild(stop);
    return stop;
  });

  const head = document.createElement('div');
  head.className = 'scrub-head';
  head.innerHTML = '<span class="scrub-gem"></span>';
  host.appendChild(head);

  const hint = document.createElement('div');
  hint.className = 'scrub-hint mono';
  host.appendChild(hint);

  // --- pointer: hover hint, click to jump, drag to move ---
  let rect = null, downX = 0, dragging = false, downStop = null;
  const pctAt = e => clamp01((e.clientX - rect.left) / rect.width);
  host.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    rect = host.getBoundingClientRect();
    downX = e.clientX;
    dragging = false;
    downStop = e.target.closest('.stop');
    host.setPointerCapture(e.pointerId);
    host.classList.add('active');
    e.preventDefault();
  });
  host.addEventListener('pointermove', e => {
    if (!host.hasPointerCapture(e.pointerId)) {
      rect = host.getBoundingClientRect();
      showHint(hint, pctAt(e));
      return;
    }
    if (!dragging && Math.abs(e.clientX - downX) < 3) return;
    dragging = true;
    host.classList.add('dragging');
    const pct = pctAt(e);
    scrollToPct(pct, true);
    showHint(hint, pct);
  });
  const release = e => {
    if (!host.hasPointerCapture(e.pointerId)) return;
    host.releasePointerCapture(e.pointerId);
    host.classList.remove('active', 'dragging');
    if (!dragging) {
      if (downStop) snapToBeat(+downStop.dataset.stop);
      else scrollToPct(pctAt(e), false);
    }
    dragging = false;
    if (e.pointerType !== 'mouse') hint.classList.remove('show');
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('pointerleave', () => { if (!dragging) hint.classList.remove('show'); });

  const scrub = { host, fill, head, stops, hint };
  scrubbers.push(scrub);
  return scrub;
}

// where each beat's center sits, as a fraction of total scroll
let beatCenters = [];
function layoutStops() {
  const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  beatCenters = BEATS.map(b => {
    const section = document.getElementById(`beat-${b.id}`);
    const center = section.offsetTop + section.offsetHeight * 0.5 - window.innerHeight * 0.5;
    return clamp01(center / total);
  });
  scrubbers.forEach(s => s.stops.forEach((stop, i) => {
    stop.style.left = `${Math.min(99, Math.max(1, beatCenters[i] * 100))}%`;
  }));
}

function nearestBeat(pct) {
  let best = 0, bestD = Infinity;
  beatCenters.forEach((c, i) => {
    const d = Math.abs(c - pct);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best; // 0-based
}

function showHint(hint, pct) {
  if (!beatCenters.length) return;
  const i = nearestBeat(pct);
  hint.textContent = `${String(i + 1).padStart(2, '0')} ${BEATS[i].label}`;
  hint.style.left = `${pct * 100}%`;
  hint.classList.add('show');
}

function scrollToPct(pct, immediate) {
  const target = pct * lenis.limit;
  lenis.scrollTo(target, immediate ? { immediate: true } : motionOptions(0.8));
}

function snapToBeat(n) {
  const section = document.getElementById(`beat-${BEATS[n - 1].id}`);
  if (mapOn) setMap(false);
  const target = section.offsetTop + section.offsetHeight / 2 - window.innerHeight / 2;
  lenis.scrollTo(target, motionOptions(1.4));
}

function setScrubPct(pct) {
  scrubbers.forEach(s => {
    s.fill.style.width = `${pct * 100}%`;
    s.head.style.left = `${pct * 100}%`;
    s.host.setAttribute('aria-label', `Journey timeline: ${Math.round(pct * 100)}% complete. Use arrow keys to change chapter.`);
  });
}

buildScrubber(document.getElementById('hud-progress'));

// ---------- camera scrub: whole track → progress 0..11 ----------
// Map each chapter to its original 3D station, including optional worktrees.
function cameraProgress() {
  const all = sections();
  const centers = all.map((section, i) => i === 0 ? 0 :
    i === all.length - 1 ? document.documentElement.scrollHeight - innerHeight :
    section.offsetTop + section.offsetHeight / 2 - innerHeight / 2);
  let i = 0;
  while (i < centers.length - 2 && window.scrollY > centers[i + 1]) i++;
  const f = clamp01((window.scrollY - centers[i]) / Math.max(1, centers[i + 1] - centers[i]));
  return REDUCED ? CAMERA_KEYS[f < 0.5 ? i : i + 1] : CAMERA_KEYS[i] + (CAMERA_KEYS[i + 1] - CAMERA_KEYS[i]) * f;
}
ScrollTrigger.create({
  trigger: '#track',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: self => {
    if (world) world.setProgress(cameraProgress());
    setScrubPct(self.progress);
  },
});

// ---------- per-beat triggers: copy reveal + HUD + auto events ----------
const hudStep = document.getElementById('hud-step');
const autoFired = new Set();
let journeyRun = 0;

function setHud(beatIdx) {
  if (beatIdx <= 0) hudStep.textContent = 'BOOT';
  else if (beatIdx > BEATS.length) hudStep.textContent = 'EOF';
  else hudStep.textContent = `${BEATS[beatIdx - 1].label} ${String(beatIdx).padStart(2, '0')}/${BEATS.length}`;
  document.querySelectorAll('[data-chapter]').forEach(button => {
    if (+button.dataset.chapter === beatIdx) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('.stop').forEach(s => {
    const n = +s.dataset.stop;
    s.classList.toggle('done', n < beatIdx);
    s.classList.toggle('current', n === beatIdx);
  });
}

let activeBeat = 0;

// derive the active beat from where the page actually is — used after
// boot and on resize, when the enter/leave callbacks may have fired
// against a layout that has since changed
function syncHud() {
  const mid = window.scrollY + window.innerHeight * 0.5;
  let idx = 0;
  sections().forEach(s => { if (s.offsetTop <= mid) idx = +s.dataset.beat; });
  activeBeat = idx;
  setHud(idx);
}

document.querySelectorAll('.beat').forEach(section => {
  const beatIdx = +section.dataset.beat;
  const copy = section.querySelector('.copy');
  const isHero = copy && copy.classList.contains('copy-hero');

  if (copy && !isHero && !REDUCED) {
    gsap.set(copy, { opacity: 0, y: REDUCED ? 0 : 30 });
    const showCopy = () => {
      gsap.to(copy, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
      if (!REDUCED) {
        gsap.fromTo(copy.children,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, delay: 0.08, ease: 'power2.out', overwrite: 'auto' });
      }
    };
    ScrollTrigger.create({
      trigger: section,
      start: 'top 62%',
      end: 'bottom 38%',
      onEnter: showCopy,
      onEnterBack: () => gsap.to([copy, ...copy.children], { opacity: 1, y: 0, duration: 0.4, overwrite: 'auto' }),
      onLeave: () => gsap.to(copy, { opacity: 0, y: REDUCED ? 0 : -24, duration: 0.35, overwrite: 'auto' }),
      onLeaveBack: () => gsap.to(copy, { opacity: 0, y: REDUCED ? 0 : 30, duration: 0.35, overwrite: 'auto' }),
    });
  } else if (copy && !REDUCED) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom 30%',
      onLeave: () => gsap.to(copy, { opacity: 0, duration: 0.4 }),
      onEnterBack: () => gsap.to(copy, { opacity: 1, duration: 0.4 }),
    });
  }

  // HUD + auto-fire in-world events as you arrive at a beat
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 45%',
    onEnter: () => { activeBeat = beatIdx; setHud(beatIdx); maybeAutoFire(beatIdx); },
    onEnterBack: () => { activeBeat = beatIdx; setHud(beatIdx); },
  });
});

function maybeAutoFire(beatIdx) {
  if (!world) return;
  const beat = BEATS[beatIdx - 1];
  if (!beat || !beat.action || autoFired.has(beat.action.event)) return;
  autoFired.add(beat.action.event);
  const version = journeyRun;
  setTimeout(() => { if (version === journeyRun) fireEvent(beat.action.event); }, REDUCED ? 0 : 700);
}

// ---------- interactive buttons + status lines ----------
function fireEvent(event) {
  if (!world) return;
  const beat = BEATS.find(b => b.action && b.action.event === event);
  const btn = document.querySelector(`[data-event="${event}"]`);
  const status = document.querySelector(`[data-status="${event}"]`);
  if (beat.action.busyStatus && status) {
    status.hidden = false;
    status.className = 'status-line busy';
    status.textContent = '▸ ' + beat.action.busyStatus;
  }
  if (btn) btn.disabled = true;
  const version = journeyRun;
  world.trigger(event).then(() => {
    if (version !== journeyRun) return;
    if (status) {
      status.hidden = false;
      status.className = 'status-line ok';
      status.textContent = '✓ ' + beat.action.doneStatus;
    }
    if (btn) { btn.disabled = false; btn.textContent = '✓ DONE'; }
    if (event === 'checks') {
      document.querySelector('#beat-checks .change-location').innerHTML = '<span class="mini-gem" aria-hidden="true"></span>Example checks passed · review the change and preview';
    }
  });
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-event]');
  if (btn && !btn.disabled) fireEvent(btn.dataset.event);
  const brand = e.target.closest('.brand');
  if (brand) {
    e.preventDefault();
    if (mapOn) setMap(false);
    lenis.scrollTo(0, motionOptions(1.6));
  }
});

// ---------- run it again: rewind the world, then fly back to the top ----------
function resetJourney() {
  journeyRun++;
  if (world) world.reset();
  autoFired.clear();
  BEATS.forEach(b => {
    if (!b.action) return;
    const index = BEATS.indexOf(b);
    document.querySelector(`#beat-${b.id} .change-location`).innerHTML = `<span class="mini-gem" aria-hidden="true"></span>${JOURNEY_STATES[index]}`;
    const btn = document.querySelector(`[data-event="${b.action.event}"]`);
    const status = document.querySelector(`[data-status="${b.action.event}"]`);
    if (btn) { btn.disabled = false; btn.textContent = b.action.label; }
    if (status) { status.hidden = true; status.className = 'status-line'; status.textContent = ''; }
  });
}
document.getElementById('btn-restart').addEventListener('click', () => {
  if (mapOn) setMap(false);
  resetJourney();
  lenis.scrollTo(0, motionOptions(2.2));
});

// ---------- keyboard: arrows step through beats ----------
document.addEventListener('keydown', e => {
  if (!document.getElementById('jargon').hidden) return;
  if (e.key === 'Escape' && mapOn) { setMap(false); return; }
  if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const all = sections();
  const next = (e.key === 'ArrowDown' || e.key === 'ArrowRight')
    ? Math.min(activeBeat + 1, all.length - 1)
    : Math.max(activeBeat - 1, 0);
  const target = all.find(s => +s.dataset.beat === next) || all[0];
  e.preventDefault();
  lenis.scrollTo(Math.max(0, target.offsetTop + target.offsetHeight / 2 - innerHeight / 2), motionOptions(1.1));
});

// ---------- map mode: zoom all the way out to the whole line ----------
// The camera pulls back to an aerial view of the entire pipeline, the
// text cards fade away, and the header timeline widens to show every
// step's name. Scrolling, dragging, and arrow keys still move the
// beacon — and still fire each step's animation as you cross it.
let mapOn = false;
const btnMap = document.getElementById('btn-map');
function setMap(on) {
  if (on === mapOn) return;
  mapOn = on;
  document.body.classList.toggle('map-mode', on);
  document.getElementById('map-index').hidden = !on;
  document.getElementById('track').inert = on;
  if (on) btnMap.focus({ preventScroll: true });
  btnMap.textContent = on ? '✕ CLOSE MAP' : '⤢ MAP';
  btnMap.setAttribute('aria-pressed', String(on));
  if (world) world.setOverview(on);
}
btnMap.addEventListener('click', () => setMap(!mapOn));
document.getElementById('btn-map-outro').addEventListener('click', () => setMap(true));

// Readable chapter navigation complements the distant 3D labels.
const mapIndex = document.getElementById('map-index');
for (const [title, ids] of [
  ['Your computer', ['branch', 'worktree', 'edit', 'commit']],
  ['GitHub', ['push', 'pr', 'checks', 'merge']],
  ['Vercel', ['preview', 'live']],
]) {
  const group = document.createElement('section');
  group.innerHTML = `<h2>${title}</h2>`;
  ids.forEach(id => {
    const i = BEATS.findIndex(b => b.id === id);
    const button = document.createElement('button');
    button.textContent = `${i + 1}. ${BEATS[i].label}`;
    button.dataset.chapter = i + 1;
    button.addEventListener('click', () => {
      snapToBeat(i + 1);
      document.querySelector(`#beat-${id} h2`).focus({ preventScroll: true });
    });
    group.appendChild(button);
  });
  mapIndex.appendChild(group);
}
document.querySelectorAll('.beat h2').forEach(h => h.tabIndex = -1);

// ---------- jargon overlay ----------
const jargon = document.getElementById('jargon');
const chipsHost = document.getElementById('jargon-chips');
const termEl = document.getElementById('jargon-term');
const textEl = document.getElementById('jargon-text');
let lastFocus = null;

function selectTerm(term) {
  const entry = TERMS.find(([name]) => name === term) || TERMS[0];
  chipsHost.querySelectorAll('button').forEach(button => {
    const active = button.textContent === entry[0];
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  termEl.textContent = entry[0];
  textEl.textContent = entry[1];
}
TERM_GROUPS.forEach(([label, terms]) => {
  const group = document.createElement('section');
  group.className = 'term-group';
  group.innerHTML = `<h3>${label}</h3><div class="term-buttons"></div>`;
  terms.forEach(term => {
    const chip = document.createElement('button');
    chip.className = 'mono';
    chip.textContent = term;
    chip.addEventListener('click', () => selectTerm(term));
    group.querySelector('.term-buttons').appendChild(chip);
  });
  chipsHost.appendChild(group);
});
selectTerm('repo');
const modalBackground = [...document.body.children].filter(el => el !== jargon && el.tagName !== 'SCRIPT');
const previousInert = new Map();

function openJargon() {
  lastFocus = document.activeElement;
  jargon.hidden = false;
  selectTerm(({ pr: 'pull request', checks: 'CI', preview: 'preview deployment', live: 'production', edit: 'working directory' })[BEATS[activeBeat - 1]?.id] || BEATS[activeBeat - 1]?.id || 'repo');
  modalBackground.forEach(el => { previousInert.set(el, el.inert); el.inert = true; });
  lenis.stop();
  document.getElementById('btn-jargon-close').focus();
}
function closeJargon() {
  jargon.hidden = true;
  previousInert.forEach((value, el) => { el.inert = value; });
  previousInert.clear();
  lenis.start();
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
document.getElementById('btn-jargon').addEventListener('click', openJargon);
document.getElementById('btn-jargon-outro').addEventListener('click', openJargon);
document.getElementById('btn-jargon-close').addEventListener('click', closeJargon);
document.addEventListener('keydown', e => {
  if (jargon.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeJargon(); }
  if (e.key === 'Tab') {
    const items = [...jargon.querySelectorAll('button')];
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// ---------- scroll hint fades after first real scroll ----------
const heroChip = document.getElementById('hero-chip');
lenis.on('scroll', ({ scroll }) => {
  if (scroll > 60 && heroChip.style.opacity !== '0') {
    heroChip.style.transition = 'opacity .5s';
    heroChip.style.opacity = '0';
  }
});

// ---------- frame loop ----------
let last = performance.now();
gsap.ticker.add(() => {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (world) world.update(dt);
});

window.addEventListener('resize', () => {
  if (world) world.resize();
  ScrollTrigger.refresh();
  layoutStops();
  syncHud();
});

// ---------- boot: type the BIOS log while fonts load, then build
// the world (canvas textures need the real fonts) ----------
async function bootUp() {
  const box = document.getElementById('boot-box');
  const typing = (async () => {
    for (const [line, ok] of bootLines) {
      await new Promise(r => setTimeout(r, 160));
      box.innerHTML += `${line} <span class="ok">${ok}</span><br>`;
    }
  })();
  // make sure the faces we bake into textures are actually loaded
  await Promise.race([Promise.all([
    document.fonts.load('600 16px "JetBrains Mono"'),
    document.fonts.load('700 16px "JetBrains Mono"'),
    document.fonts.load('800 32px "Bricolage Grotesque"'),
    document.fonts.load('500 14px "Instrument Sans"'),
  ]).catch(() => {}), new Promise(resolve => setTimeout(resolve, 2500))]);
  // Font failures must never prevent access to the explanation.
  await typing;

  try {
    world = createWorld(document.getElementById('gl'));
    world.reducedMotion = REDUCED;
    layoutStops();
    // sync camera + scrubbers to wherever the page is (e.g. reload mid-scroll)
    const st = ScrollTrigger.getAll().find(t => t.vars.trigger === '#track');
    world.setProgress(cameraProgress());
    setScrubPct(st ? st.progress : 0);
    syncHud();
    maybeAutoFire(activeBeat);

  } catch (error) {
    console.warn('3D view unavailable; showing the reading experience.', error);
    document.body.classList.add('reading-mode');
    document.getElementById('render-notice').hidden = false;
    document.querySelectorAll('[data-event], .simulation-note').forEach(el => { el.hidden = true; });
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    gsap.set('.copy, .copy > *', { clearProps: 'all' });
    layoutStops();
    syncHud();
    lenis.on('scroll', () => { syncHud(); setScrubPct(window.scrollY / Math.max(1, lenis.limit)); });
  }
  await new Promise(r => setTimeout(r, REDUCED ? 0 : 200));
  boot.classList.add('gone');
  setTimeout(() => boot.remove(), 600);
}
bootUp();
