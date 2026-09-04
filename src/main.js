// ============================================================
// Bootstrap: DOM beats, smooth scroll, camera scrub, HUD, events
// ============================================================

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createWorld } from './world.js';
import { BEATS, MACHINES, TERMS } from './content.js';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- build beat sections ----------
const beatsHost = document.getElementById('beats');
beatsHost.outerHTML = BEATS.map((b, i) => {
  const m = MACHINES[b.machine];
  const action = b.action ? `
    <button class="btn mono ${b.action.cls}" data-event="${b.action.event}">${b.action.label}</button>
    <div class="status-line" data-status="${b.action.event}" hidden></div>` : '';
  return `
  <section class="beat" id="beat-${b.id}" data-beat="${i + 1}" data-side="${b.side}">
    <div class="copy">
      <div class="stepno mono">
        <span class="machine ${m.cls}">${m.name}</span>
        <span>STEP ${String(i + 1).padStart(2, '0')} / 10</span>
      </div>
      <h2>${b.title}</h2>
      <p>${b.plain}</p>
      <div class="xp">
        <button class="xp-head" aria-expanded="false"><span class="xp-arrow">▸</span> IN REAL DEVELOPER TERMS</button>
        <div class="xp-body"><div class="xp-pad">${b.real}</div></div>
      </div>
      <div class="xp xp-amber">
        <button class="xp-head" aria-expanded="false"><span class="xp-arrow">▸</span> THINK OF IT LIKE…</button>
        <div class="xp-body"><div class="xp-pad">${b.analogy}</div></div>
      </div>
      ${action}
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
const lenis = new Lenis({ lerp: REDUCED ? 1 : 0.1, wheelMultiplier: 0.95 });
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
  host.setAttribute('role', 'slider');
  host.setAttribute('tabindex', '0');
  host.setAttribute('aria-valuemin', '0');
  host.setAttribute('aria-valuemax', '100');
  host.setAttribute('aria-valuenow', '0');
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
  lenis.scrollTo(target, immediate ? { immediate: true } : { duration: 0.8 });
}

function snapToBeat(n) {
  const section = document.getElementById(`beat-${BEATS[n - 1].id}`);
  lenis.scrollTo(section, { duration: 1.4, offset: -window.innerHeight * 0.05 });
}

function setScrubPct(pct) {
  scrubbers.forEach(s => {
    s.fill.style.width = `${pct * 100}%`;
    s.head.style.left = `${pct * 100}%`;
    s.host.setAttribute('aria-valuenow', Math.round(pct * 100));
  });
}

buildScrubber(document.getElementById('hud-progress'));

// ---------- camera scrub: whole track → progress 0..11 ----------
const N_KEYS = 11; // intro(0) .. outro(11)
ScrollTrigger.create({
  trigger: '#track',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: self => {
    if (world) world.setProgress(self.progress * N_KEYS);
    setScrubPct(self.progress);
  },
});

// ---------- per-beat triggers: copy reveal + HUD + auto events ----------
const hudStep = document.getElementById('hud-step');
const autoFired = new Set();

function setHud(beatIdx) {
  if (beatIdx <= 0) hudStep.textContent = 'BOOT';
  else if (beatIdx > BEATS.length) hudStep.textContent = 'EOF';
  else hudStep.textContent = `${BEATS[beatIdx - 1].label} ${String(beatIdx).padStart(2, '0')}/10`;
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

  if (copy && !isHero) {
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
  } else if (copy) {
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
  setTimeout(() => fireEvent(beat.action.event), 700);
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
  world.trigger(event).then(() => {
    if (status) {
      status.hidden = false;
      status.className = 'status-line ok';
      status.textContent = '✓ ' + beat.action.doneStatus;
    }
    if (btn) { btn.disabled = false; btn.textContent = '✓ DONE'; }
  });
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-event]');
  if (btn && !btn.disabled) fireEvent(btn.dataset.event);
  const brand = e.target.closest('.brand');
  if (brand) {
    e.preventDefault();
    lenis.scrollTo(0, { duration: 1.6 });
  }
});

document.getElementById('btn-restart').addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 2.2 });
});

// ---------- keyboard: arrows step through beats ----------
document.addEventListener('keydown', e => {
  if (!document.getElementById('jargon').hidden) return;
  if (e.key === 'Escape' && mapOn) { setMap(false); return; }
  if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  const all = sections();
  const next = (e.key === 'ArrowDown' || e.key === 'ArrowRight')
    ? Math.min(activeBeat + 1, all.length - 1)
    : Math.max(activeBeat - 1, 0);
  const target = all.find(s => +s.dataset.beat === next) || all[0];
  e.preventDefault();
  lenis.scrollTo(target, { duration: 1.1, offset: -window.innerHeight * 0.05 });
});

// ---------- map mode: zoom all the way out to the whole line ----------
// The camera pulls back to an aerial view of the entire pipeline, the
// text cards fade away, and the header timeline widens to show every
// step's name. Scrolling, dragging, and arrow keys still move the
// beacon — and still fire each step's animation as you cross it.
let mapOn = false;
const btnMap = document.getElementById('btn-map');
function setMap(on) {
  if (!world || on === mapOn) return;
  mapOn = on;
  document.body.classList.toggle('map-mode', on);
  btnMap.textContent = on ? '✕ CLOSE MAP' : '⤢ MAP';
  btnMap.setAttribute('aria-pressed', String(on));
  world.setOverview(on);
}
btnMap.addEventListener('click', () => setMap(!mapOn));
document.getElementById('btn-map-outro').addEventListener('click', () => setMap(true));

// ---------- jargon overlay ----------
const jargon = document.getElementById('jargon');
const chipsHost = document.getElementById('jargon-chips');
const termEl = document.getElementById('jargon-term');
const textEl = document.getElementById('jargon-text');
let lastFocus = null;

TERMS.forEach(([term, def], i) => {
  const chip = document.createElement('button');
  chip.className = 'mono' + (i === 0 ? ' active' : '');
  chip.textContent = term;
  chip.addEventListener('click', () => {
    chipsHost.querySelectorAll('button').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    termEl.textContent = term;
    textEl.textContent = def;
  });
  chipsHost.appendChild(chip);
});
termEl.textContent = TERMS[0][0];
textEl.textContent = TERMS[0][1];

function openJargon() {
  lastFocus = document.activeElement;
  jargon.hidden = false;
  lenis.stop();
  document.getElementById('btn-jargon-close').focus();
}
function closeJargon() {
  jargon.hidden = true;
  lenis.start();
  if (lastFocus) lastFocus.focus();
}
document.getElementById('btn-jargon').addEventListener('click', openJargon);
document.getElementById('btn-jargon-outro').addEventListener('click', openJargon);
document.getElementById('btn-jargon-close').addEventListener('click', closeJargon);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !jargon.hidden) closeJargon();
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
  await Promise.all([
    document.fonts.load('600 16px "JetBrains Mono"'),
    document.fonts.load('700 16px "JetBrains Mono"'),
    document.fonts.load('800 32px "Bricolage Grotesque"'),
    document.fonts.load('500 14px "Instrument Sans"'),
  ]).catch(() => {});
  await document.fonts.ready;
  await typing;

  world = createWorld(document.getElementById('gl'));
  world.reducedMotion = REDUCED;
  layoutStops();
  // sync camera + scrubbers to wherever the page is (e.g. reload mid-scroll)
  const st = ScrollTrigger.getAll().find(t => t.vars.trigger === '#track');
  world.setProgress((st ? st.progress : 0) * N_KEYS);
  setScrubPct(st ? st.progress : 0);
  syncHud();

  await new Promise(r => setTimeout(r, 200));
  boot.classList.add('gone');
  setTimeout(() => boot.remove(), 600);
}
bootUp();
