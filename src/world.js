// ============================================================
// The 3D world — "inside the machine".
// A bright, beige-box-era computer landscape laid out along the
// X axis. One commit (the gem) travels the whole pipeline:
//
//   x≈0    branch splits off main
//   x≈16   worktree rooms
//   x≈32   CRT monitor (edit)
//   x≈48   commit pedestal (gem is forged)
//   x≈64   push gantry (laptop → GitHub)
//   x≈80   PR gate
//   x≈92+  four CI inspection arches
//   x≈114  Vercel preview pod (elevated, off to the side)
//   x≈126  merge junction (branch welds back into main)
//   x≈142  production globe
// ============================================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';

// ---------- palette ----------
const C = {
  paper: 0xFBF9F4,
  paperDeep: 0xF1EBDD,
  ink: 0x22242B,
  inkSoft: 0x565A66,
  line: 0xD9D2C2,
  // Color language: BLUE = your work (feature branch, the gem),
  // INDIGO = GitHub / main, PURPLE = Vercel. GREEN appears only
  // as a success signal (checks passed, live).
  blue: 0x3D6FF0,
  indigo: 0x4A52E0,
  indigoDeep: 0x343aa8,
  green: 0x1FA971,
  greenDeep: 0x166a49,
  purple: 0x7C5CFC,
  coral: 0xF26D5B,
  amber: 0xE8A33D,
  beige: 0xEDE6D6,
  screen: 0x1f2230,
};

// ---------- materials (shared) ----------
const M = {
  chrome: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.18 }),
  beige: new THREE.MeshStandardMaterial({ color: C.beige, metalness: 0, roughness: 0.62 }),
  beigeDark: new THREE.MeshStandardMaterial({ color: 0xDDD3BC, metalness: 0, roughness: 0.7 }),
  ink: new THREE.MeshStandardMaterial({ color: C.ink, metalness: 0.2, roughness: 0.5 }),
  greenRail: new THREE.MeshStandardMaterial({ color: C.indigo, metalness: 0.35, roughness: 0.3, emissive: C.indigo, emissiveIntensity: 0.22 }),
  purpleRail: new THREE.MeshStandardMaterial({ color: C.blue, metalness: 0.35, roughness: 0.3, emissive: C.blue, emissiveIntensity: 0.22 }),
};

// ============================================================
// canvas-texture panel helpers (all in-world text)
// ============================================================
const PPU = 56; // pixels per world unit (x2 DPR below)

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * PPU * 2);
  c.height = Math.round(h * PPU * 2);
  const g = c.getContext('2d');
  g.scale((c.width) / (w * PPU), (c.height) / (h * PPU));
  return [c, g];
}

function panelMesh(c, w, h, opts = {}) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: !!opts.transparent });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.userData.tex = tex;
  return mesh;
}

// standard "paper card" chrome: bg, ink border, optional title strip
function paperBG(g, W, H, { border = '#22242B', bg = '#FBF9F4', bw = 3 } = {}) {
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = border;
  g.lineWidth = bw;
  g.strokeRect(bw / 2, bw / 2, W - bw, H - bw);
}

function px(n) { return n * PPU / 56; } // font sizing helper at base scale

// generic mono-text card
function textCard({ w, h, lines, title = null, titleColor = '#3D6FF0', pad = 14, fs = 13, lh = 1.75, bg = '#FBF9F4' }) {
  const [c, g] = makeCanvas(w, h);
  const W = w * PPU, H = h * PPU;
  paperBG(g, W, H, { bg });
  let y = pad + fs;
  if (title) {
    g.font = `700 ${fs * 0.72}px "JetBrains Mono"`;
    g.fillStyle = titleColor;
    g.fillText(title, pad, y - fs * 0.15);
    y += fs * lh * 0.85;
    g.strokeStyle = '#D9D2C2';
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(pad, y - fs); g.lineTo(W - pad, y - fs); g.stroke();
    y += fs * 0.35;
  }
  g.font = `500 ${fs}px "JetBrains Mono"`;
  for (const ln of lines) {
    let x = pad;
    const parts = Array.isArray(ln) ? ln : [[ln, '#565A66']];
    for (const [txt, col, weight] of parts) {
      g.font = `${weight || 500} ${fs}px "JetBrains Mono"`;
      g.fillStyle = col || '#565A66';
      g.fillText(txt, x, y);
      x += g.measureText(txt).width;
    }
    y += fs * lh;
  }
  return panelMesh(c, w, h);
}

// big district sign text
function signPanel({ text, w = 10, h = 1.7, color = '#22242B', bg = '#FBF9F4' }) {
  const [c, g] = makeCanvas(w, h);
  const W = w * PPU, H = h * PPU;
  paperBG(g, W, H, { bg, bw: 4 });
  g.font = `800 ${H * 0.44}px "Bricolage Grotesque"`;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, W / 2, H / 2 + 1);
  return panelMesh(c, w, h);
}

// small floating label
function label({ text, color = '#565A66', w = 3.4, h = 0.55, fs = 14, bg = '#FBF9F4' }) {
  const [c, g] = makeCanvas(w, h);
  const W = w * PPU, H = h * PPU;
  paperBG(g, W, H, { bg, bw: 2, border: color });
  g.font = `600 ${fs}px "JetBrains Mono"`;
  g.fillStyle = color;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, W / 2, H / 2 + 1);
  return panelMesh(c, w, h);
}

// ============================================================
// world builder
// ============================================================
export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.paper);
  scene.fog = new THREE.Fog(C.paper, 70, 220);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 900);
  camera.position.set(70, 55, 120);

  // environment for chrome reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;   // keep the beige plastic from blowing out
  M.chrome.envMapIntensity = 2.2;     // …but keep chrome properly shiny

  // lights — warm, bright, soft (kept below blowout for the beige plastic)
  scene.add(new THREE.HemisphereLight(0xFFFDF6, 0xD8CFBB, 0.85));
  const sun = new THREE.DirectionalLight(0xFFF6E8, 1.1);
  sun.position.set(40, 60, 50);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xE8F0FF, 0.35);
  fill.position.set(-30, 20, -40);
  scene.add(fill);

  // ---------- ground grid ----------
  const grid = new THREE.GridHelper(500, 125, C.line, C.line);
  grid.position.y = 0;
  grid.material.opacity = 0.55;
  grid.material.transparent = true;
  scene.add(grid);
  const gridMajor = new THREE.GridHelper(500, 25, 0xC6BCA4, 0xC6BCA4);
  gridMajor.position.y = 0.01;
  gridMajor.material.opacity = 0.5;
  gridMajor.material.transparent = true;
  scene.add(gridMajor);

  // ============================================================
  // rails
  // ============================================================
  function tubeFromPoints(pts, mat, r = 0.16) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.05);
    const geo = new THREE.TubeGeometry(curve, 200, r, 10, false);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    return { mesh, curve };
  }

  // main rail — straight along z=0
  tubeFromPoints([[-30, 0.35, 0], [160, 0.35, 0]], M.greenRail, 0.18);

  // commit nodes on main (history)
  const nodeGeo = new THREE.SphereGeometry(0.42, 20, 16);
  [-16, -8, 0, 34, 70, 104].forEach(x => {
    const n = new THREE.Mesh(nodeGeo, M.chrome);
    n.position.set(x, 0.35, 0);
    scene.add(n);
  });

  // feature branch rail — splits at x=0, runs at z=6, ghost-merges at x≈126
  const branchPts = [
    [0, 0.35, 0], [3, 0.35, 1.6], [7, 0.35, 4.4], [11, 0.35, 6],
    [30, 0.35, 6], [60, 0.35, 6], [90, 0.35, 6], [118, 0.35, 6],
  ];
  tubeFromPoints(branchPts, M.purpleRail, 0.15);

  // merge segment — starts as a ghost (dashed look via transparency), welds on merge
  const mergeMat = new THREE.MeshStandardMaterial({
    color: C.blue, transparent: true, opacity: 0.18, metalness: 0.3, roughness: 0.4,
    emissive: C.blue, emissiveIntensity: 0,
  });
  const mergeSeg = tubeFromPoints(
    [[115, 0.35, 6], [118, 0.35, 6], [122, 0.35, 5.2], [125.5, 0.35, 2.4], [127.5, 0.35, 0.4]],
    mergeMat, 0.15
  );

  // rail labels
  const mainLbl = label({ text: 'main', color: '#343aa8', w: 1.8, h: 0.5 });
  mainLbl.position.set(-4, 1.4, 0); scene.add(mainLbl);
  const featLbl = label({ text: 'feature/rsvp-reminders', color: '#3D6FF0', w: 5.2, h: 0.5 });
  featLbl.position.set(16, 1.35, 6); scene.add(featLbl);

  // ============================================================
  // district sign gantries
  // ============================================================
  function gantry(x, text, color) {
    const grp = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.14, 0.18, 7, 10);
    for (const z of [-5, 9]) {
      const leg = new THREE.Mesh(legGeo, M.chrome);
      leg.position.set(0, 3.5, z);
      grp.add(leg);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 14.6), M.chrome);
    beam.position.set(0, 7, 2);
    grp.add(beam);
    const sign = signPanel({ text, color, w: 9.5, h: 1.6 });
    sign.position.set(0, 5.9, 2);
    grp.add(sign);
    grp.position.x = x;
    scene.add(grp);
  }
  gantry(-5, 'YOUR COMPUTER', '#3D6FF0');
  gantry(72.5, 'GITHUB', '#343aa8');
  gantry(131.5, 'VERCEL', '#5a3fd6');

  // ============================================================
  // beat 1 — branch split (the split is the rails themselves)
  // ============================================================
  const branchCard = textCard({
    w: 6.4, h: 2.4, title: 'TERMINAL', fs: 15,
    lines: [
      [['$ ', '#9a9ea8'], ['git checkout ', '#3D6FF0', 600], ['main', '#343aa8']],
      [['$ ', '#9a9ea8'], ['git pull', '#3D6FF0', 600]],
      [['$ ', '#9a9ea8'], ['git checkout -b ', '#3D6FF0', 600], ['feature/rsvp-reminders', '#3D6FF0']],
    ],
  });
  branchCard.position.set(-1.5, 3.6, 3);
  scene.add(branchCard);

  // ============================================================
  // beat 2 — worktree rooms
  // ============================================================
  function room(x, z, accent, folder, branch) {
    const grp = new THREE.Group();
    const box = new THREE.BoxGeometry(5, 3.2, 4.2);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(box),
      new THREE.LineBasicMaterial({ color: accent })
    );
    edges.position.y = 1.6;
    grp.add(edges);
    // floor slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 4.2), M.beige);
    slab.position.y = 0.06;
    grp.add(slab);
    // desk + tiny tower
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 1.1), M.beigeDark);
    desk.position.set(0, 1.0, -0.9);
    grp.add(desk);
    for (const lx of [-0.9, 0.9]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.9), M.beigeDark);
      leg.position.set(lx, 0.5, -0.9);
      grp.add(leg);
    }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.5, 0.9), M.beige);
    tower.position.set(1.9, 0.75, -0.9);
    grp.add(tower);
    const lbl1 = label({ text: folder, color: '#22242B', w: 3.4, h: 0.55 });
    lbl1.position.set(0, 3.9, 0);
    grp.add(lbl1);
    const lbl2 = label({ text: branch, color: accent === 0xF26D5B ? '#F26D5B' : '#3D6FF0', w: 4.4, h: 0.5 });
    lbl2.position.set(0, 3.25, 0);
    grp.add(lbl2);
    grp.position.set(x, 0, z);
    scene.add(grp);
    return grp;
  }
  room(13.5, 10.5, 0x3D6FF0, 'picnic/', 'feature/rsvp-reminders');
  room(19.5, 10.5, 0xF26D5B, 'picnic-hotfix/', 'hotfix/login');
  const wtChip = label({ text: 'one repo · two branches open at once', color: '#343aa8', w: 7.4, h: 0.55, bg: '#EEF0FF' });
  wtChip.position.set(16.5, 5.2, 10.5);
  scene.add(wtChip);

  // ============================================================
  // beat 3 — CRT monitor (edit)
  // ============================================================
  const editGrp = new THREE.Group();
  {
    // body: beveled beige CRT
    const body = new THREE.Mesh(new THREE.BoxGeometry(6.4, 5.0, 3.4), M.beige);
    body.position.y = 3.4;
    editGrp.add(body);
    const bodyEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(6.42, 5.02, 3.42)),
      new THREE.LineBasicMaterial({ color: 0xC6BCA4 })
    );
    bodyEdges.position.y = 3.4;
    editGrp.add(bodyEdges);
    // screen bezel inset
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.2, 0.2), M.beigeDark);
    bezel.position.set(0, 3.5, 1.72);
    editGrp.add(bezel);
    // screen — diff code texture w/ scanlines
    const w = 5.1, h = 3.7;
    const [c, g] = makeCanvas(w, h);
    const W = w * PPU, H = h * PPU;
    g.fillStyle = '#1f2230'; g.fillRect(0, 0, W, H);
    // title strip
    g.fillStyle = '#2a2e40'; g.fillRect(0, 0, W, 22);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = ['#f45b5b', '#f6c343', '#3fb950'][i];
      g.beginPath(); g.arc(12 + i * 14, 11, 4, 0, 7); g.fill();
    }
    g.font = '600 9px "JetBrains Mono"'; g.fillStyle = '#8b90a3';
    g.fillText('Claude Code — feature/rsvp-reminders', 56, 14.5);
    // code
    const rows = [
      ['// lib/email/rsvp.ts', '#6b7089', false],
      ['14  export async function sendRsvpReminder(', '#c8cee0', false],
      ['+     await resend.emails.send({', '#3fb950', true],
      ['+       to: guest.email,', '#3fb950', true],
      ["+       template: 'rsvp-reminder',", '#3fb950', true],
      ['+     });', '#3fb950', true],
      ['19  }', '#c8cee0', false],
    ];
    g.font = '500 11.5px "JetBrains Mono"';
    let y = 44;
    for (const [txt, col, add] of rows) {
      if (add) { g.fillStyle = 'rgba(63,169,113,.16)'; g.fillRect(0, y - 12, W, 17); }
      g.fillStyle = col; g.fillText(txt, 12, y);
      y += 19;
    }
    // AI prompt line
    g.font = '500 10px "JetBrains Mono"';
    g.fillStyle = '#7d9bf5';
    g.fillText('> remind guests to rsvp — done, edited 3 files', 12, y + 3);
    // status bar
    g.fillStyle = '#171a26'; g.fillRect(0, H - 20, W, 20);
    g.fillStyle = '#6b7089'; g.font = '500 9px "JetBrains Mono"';
    g.fillText('3 files changed · your AI pair works here', 12, H - 7);
    g.fillStyle = '#f6c343';
    g.textAlign = 'right'; g.fillText('● unsaved to Git', W - 12, H - 7); g.textAlign = 'left';
    // scanlines
    g.fillStyle = 'rgba(0,0,0,.09)';
    for (let sy = 0; sy < H; sy += 4) g.fillRect(0, sy, W, 1.4);
    const screen = panelMesh(c, w, h);
    screen.position.set(0, 3.5, 1.84);
    editGrp.add(screen);
    // stand
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.6, 12), M.beigeDark);
    neck.position.y = 0.6;
    editGrp.add(neck);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.3, 18), M.beige);
    base.position.y = 0.15;
    editGrp.add(base);
    // floating floppies
    const flopGeo = new THREE.BoxGeometry(0.9, 0.08, 0.9);
    const flops = [];
    [[-4.2, 4.5, 1.5, C.blue], [4.3, 5.6, 0.8, C.purple], [-3.6, 2.0, 2.2, C.coral]].forEach(([fx, fy, fz, col]) => {
      const f = new THREE.Group();
      const bodyF = new THREE.Mesh(flopGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
      f.add(bodyF);
      const lblF = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.085, 0.42), new THREE.MeshStandardMaterial({ color: 0xFBF9F4, roughness: 0.8 }));
      lblF.position.set(0, 0.004, 0.18);
      f.add(lblF);
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.085, 0.22), M.chrome);
      shutter.position.set(0.08, 0.004, -0.28);
      f.add(shutter);
      f.position.set(fx, fy, fz);
      f.rotation.set(0.4, 0.7, 0.15);
      editGrp.add(f);
      flops.push(f);
    });
    editGrp.userData.flops = flops;
  }
  editGrp.position.set(32, 0, 6.5);
  scene.add(editGrp);

  // ============================================================
  // beat 4 — commit pedestal + THE GEM
  // ============================================================
  const commitGrp = new THREE.Group();
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 0.9, 6), M.beige);
  pedestal.position.y = 0.45;
  commitGrp.add(pedestal);
  const pedestalTop = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.12, 6), M.chrome);
  pedestalTop.position.y = 0.96;
  commitGrp.add(pedestalTop);

  // seal ring — starts hovering high, drops on commit
  const sealRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.09, 12, 40),
    new THREE.MeshStandardMaterial({ color: C.blue, metalness: 0.7, roughness: 0.25, emissive: C.blue, emissiveIntensity: 0.3 })
  );
  sealRing.rotation.x = Math.PI / 2;
  sealRing.position.y = 4.6;
  commitGrp.add(sealRing);

  const hashLbl = label({ text: 'a1b2c3d · 3 files', color: '#4b9a78', w: 3.4, h: 0.5, bg: '#E9F7F0' });
  hashLbl.position.set(0, 4.4, 0);
  hashLbl.visible = false;
  commitGrp.add(hashLbl);
  commitGrp.position.set(48, 0, 6);
  scene.add(commitGrp);

  // the gem — ghost until sealed
  const gemMat = new THREE.MeshStandardMaterial({
    color: C.blue, metalness: 0.55, roughness: 0.2, flatShading: true,
    emissive: C.blue, emissiveIntensity: 0.12, transparent: true, opacity: 0.3, wireframe: true,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), gemMat);
  gem.position.set(48, 2.3, 6);
  scene.add(gem);
  const gemState = { sealed: false, offsetY: 0, burst: false, visible: 0 };

  // ============================================================
  // beat 5 — push gantry (dashes flow along branch rail)
  // ============================================================
  {
    const g2 = new THREE.Group();
    const arrowCard = textCard({
      w: 5.6, h: 1.15, fs: 16,
      lines: [[['git push ', '#3D6FF0', 600], ['→ origin', '#22242B', 600]]],
      pad: 16,
    });
    arrowCard.position.set(0, 4.6, 0);
    g2.add(arrowCard);
    for (const dx of [-2.6, 2.6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 4.1, 10), M.chrome);
      leg.position.set(dx, 2.05, 0);
      g2.add(leg);
    }
    g2.position.set(64, 0, 6);
    scene.add(g2);
  }
  // flowing dash particles along the branch between laptop & github
  const dashCount = 9;
  const dashes = new THREE.Group();
  const dashGeo = new THREE.BoxGeometry(0.7, 0.1, 0.1);
  const dashMat = new THREE.MeshBasicMaterial({ color: C.blue });
  for (let i = 0; i < dashCount; i++) {
    const d = new THREE.Mesh(dashGeo, dashMat);
    dashes.add(d);
  }
  scene.add(dashes);

  // ============================================================
  // beat 6 — PR gate
  // ============================================================
  const prGrp = new THREE.Group();
  const gateFrameMat = M.chrome;
  {
    const post = new THREE.BoxGeometry(0.5, 6.4, 0.5);
    for (const dz of [-2.6, 2.6]) {
      const p = new THREE.Mesh(post, gateFrameMat);
      p.position.set(0, 3.2, dz);
      prGrp.add(p);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 5.7), gateFrameMat);
    top.position.set(0, 6.6, 0);
    prGrp.add(top);
  }
  // gate bars (closed until PR opened) — own material each so fades don't fight
  const bars = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 5.0),
      new THREE.MeshStandardMaterial({ color: C.inkSoft, metalness: 0.4, roughness: 0.4, transparent: true })
    );
    bar.position.set(0, 0.8 + i * 1.1, 0);
    bars.add(bar);
  }
  prGrp.add(bars);

  // PR card — draft/open textures
  function prCardTexture(open) {
    const w = 6.2, h = 3.4;
    const [c, g] = makeCanvas(w, h);
    const W = w * PPU, H = h * PPU;
    paperBG(g, W, H);
    // badge
    g.fillStyle = open ? '#1FA971' : '#9a9ea8';
    g.fillRect(14, 14, open ? 62 : 54, 22);
    g.font = '700 11px "JetBrains Mono"';
    g.fillStyle = '#fff';
    g.fillText(open ? '● OPEN' : 'DRAFT', 22, 29);
    g.fillStyle = '#9a9ea8';
    g.font = '600 12px "JetBrains Mono"';
    g.fillText('#128', W - 52, 30);
    // title
    g.font = '700 19px "Bricolage Grotesque"';
    g.fillStyle = '#22242B';
    g.fillText('Add RSVP reminder emails', 14, 64);
    // branches
    g.font = '500 11.5px "JetBrains Mono"';
    g.fillStyle = '#3D6FF0'; g.fillText('feature/rsvp-reminders', 14, 88);
    const bw2 = g.measureText('feature/rsvp-reminders').width;
    g.fillStyle = '#c0c4ce'; g.fillText(' → ', 14 + bw2, 88);
    g.fillStyle = '#343aa8'; g.fillText('main', 14 + bw2 + g.measureText(' → ').width, 88);
    // divider
    g.strokeStyle = '#F1EDE3'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 102); g.lineTo(W, 102); g.stroke();
    // body
    g.font = '500 12px "Instrument Sans"';
    g.fillStyle = '#565A66';
    g.fillText('Sends a reminder email to each guest a few days', 14, 124);
    g.fillText('before the event, using the Resend template.', 14, 142);
    g.font = '600 11.5px "JetBrains Mono"';
    g.fillStyle = '#1FA971'; g.fillText('+38', 14, 170);
    g.fillStyle = '#F26D5B'; g.fillText('−4', 58, 170);
    g.fillStyle = '#9a9ea8'; g.fillText('3 files', 92, 170);
    return c;
  }
  // card stands beside the gate, angled toward the approach
  const prCard = panelMesh(prCardTexture(false), 6.2, 3.4);
  prCard.position.set(1.6, 4.3, 3.6);
  prCard.rotation.y = -0.35;
  prGrp.add(prCard);
  prGrp.position.set(80, 0, 6);
  scene.add(prGrp);

  function setPRCard(open) {
    const tex = new THREE.CanvasTexture(prCardTexture(open));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    prCard.material.map = tex;
    prCard.material.needsUpdate = true;
  }

  // ============================================================
  // beat 7 — four CI inspection arches
  // ============================================================
  const CHECKS = ['LINT', 'TYPECHECK', 'TEST', 'BUILD'];
  const arches = [];
  CHECKS.forEach((name, i) => {
    const grp = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.16, 12, 40, Math.PI),
      M.chrome
    );
    frame.rotation.y = Math.PI / 2;
    grp.add(frame);
    for (const dz of [-2.0, 2.0]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.6, 10), M.chrome);
      leg.position.set(0, 0.3, dz);
      grp.add(leg);
    }
    frame.position.y = 0.6;
    // lamp
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xCFC9B8, emissive: 0x000000, emissiveIntensity: 0.9, roughness: 0.3 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), lampMat);
    lamp.position.set(0, 3.0, 0);
    grp.add(lamp);
    // scan beam (hidden)
    const beamMat = new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0 });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.4), beamMat);
    beam.position.set(0, 1.4, 0);
    beam.rotation.y = Math.PI / 2;
    grp.add(beam);
    const lbl = label({ text: name, color: '#565A66', w: 2.6, h: 0.55 });
    lbl.position.set(0, 4.0, 0);
    grp.add(lbl);
    grp.position.set(91 + i * 4.5, 0, 6);
    scene.add(grp);
    arches.push({ grp, lampMat, beamMat, beam, lbl, name });
  });

  // ============================================================
  // beat 8 — Vercel preview pod (elevated)
  // ============================================================
  const podGrp = new THREE.Group();
  {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.0, 0.5, 8), M.beige);
    podGrp.add(plate);
    const plateEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(4.62, 5.02, 0.52, 8)),
      new THREE.LineBasicMaterial({ color: 0x9c8fd8 })
    );
    podGrp.add(plateEdge);
    // dome — wireframe
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: C.purple, wireframe: true, transparent: true, opacity: 0.28 })
    );
    dome.position.y = 0.25;
    podGrp.add(dome);
    podGrp.userData.dome = dome;
    // mini site billboard
    const w = 4.6, h = 3.1;
    const [c, g] = makeCanvas(w, h);
    const W = w * PPU, H = h * PPU;
    paperBG(g, W, H);
    // url bar
    g.fillStyle = '#F7F5EF'; g.fillRect(3, 3, W - 6, 26);
    g.strokeStyle = '#ECE7DC'; g.strokeRect(3, 3, W - 6, 26);
    g.font = '500 9px "JetBrains Mono"';
    g.fillStyle = '#7C5CFC';
    g.fillText('picnic-git-feat-rsvp-reminders.vercel.app', 12, 20);
    // mini UI
    g.font = '700 15px "Bricolage Grotesque"';
    g.fillStyle = '#22242B';
    g.fillText('RSVP reminders', 16, 58);
    g.font = '500 10.5px "Instrument Sans"';
    g.fillStyle = '#8A8E99';
    g.fillText('Your new feature — on a separate preview.', 16, 76);
    g.fillStyle = '#eef3ff';
    g.fillRect(16, 92, W - 32, 10);
    g.fillRect(16, 110, (W - 32) * 0.7, 10);
    g.fillStyle = '#7C5CFC';
    g.fillRect(16, 132, 118, 24);
    g.font = '600 10px "Instrument Sans"';
    g.fillStyle = '#fff';
    g.fillText('Send test reminder', 26, 148);
    const board = panelMesh(c, w, h);
    board.position.set(0, 2.1, 0);
    podGrp.add(board);
    const podLbl = label({ text: 'VERCEL · PREVIEW', color: '#5a3fd6', w: 3.8, h: 0.55, bg: '#F1EDFE' });
    podLbl.position.set(0, 5.6, 0);
    podGrp.add(podLbl);
  }
  podGrp.position.set(114, 8, -10);
  podGrp.scale.setScalar(0.001);   // hidden until deployed
  podGrp.visible = false;
  scene.add(podGrp);
  // pod pylon from ground
  const pylon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.16, 8, 8),
    new THREE.MeshStandardMaterial({ color: C.purple, transparent: true, opacity: 0.25 })
  );
  pylon.position.set(114, 4, -10);
  scene.add(pylon);
  // placeholder "ready to build" marker at pod site
  const podIdle = label({ text: 'preview will appear here…', color: '#9a9ea8', w: 5.4, h: 0.6 });
  podIdle.position.set(114, 8.6, -10);
  scene.add(podIdle);

  // ============================================================
  // beat 9 — merge junction marker
  // ============================================================
  const weldRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.08, 10, 36),
    new THREE.MeshStandardMaterial({ color: C.indigo, emissive: C.indigo, emissiveIntensity: 0, transparent: true, opacity: 0 })
  );
  weldRing.position.set(127.5, 0.35, 0.4);
  weldRing.rotation.x = Math.PI / 2;
  scene.add(weldRing);
  const mergeLbl = label({ text: 'merge → main', color: '#343aa8', w: 3.2, h: 0.5 });
  mergeLbl.position.set(126, 2.2, 3);
  scene.add(mergeLbl);

  // ============================================================
  // beat 10 — production globe
  // ============================================================
  const globeGrp = new THREE.Group();
  const globeMat = new THREE.MeshBasicMaterial({ color: C.indigo, wireframe: true, transparent: true, opacity: 0.4 });
  const globe = new THREE.Mesh(new THREE.IcosahedronGeometry(4.4, 2), globeMat);
  globeGrp.add(globe);
  const eq = new THREE.Mesh(
    new THREE.TorusGeometry(4.9, 0.06, 8, 64),
    new THREE.MeshStandardMaterial({ color: C.indigoDeep, metalness: 0.4, roughness: 0.4 })
  );
  eq.rotation.x = Math.PI / 2.4;
  globeGrp.add(eq);
  const urlLbl = label({ text: 'mypicnic.app', color: '#9a9ea8', w: 4.4, h: 0.72, fs: 17 });
  const urlLblIdleMap = urlLbl.material.map;
  urlLbl.position.set(0, -6.0, 0);
  globeGrp.add(urlLbl);
  const liveLbl = label({ text: '● LIVE — everyone can see it', color: '#166a49', w: 6.6, h: 0.6, bg: '#E9F7F0' });
  liveLbl.position.set(0, -7.0, 0);
  liveLbl.visible = false;
  globeGrp.add(liveLbl);
  globeGrp.position.set(142, 12, 0);
  scene.add(globeGrp);
  // deploy beam (hidden until ship)
  const beamMat10 = new THREE.MeshBasicMaterial({ color: C.purple, transparent: true, opacity: 0 });
  const deployBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.5, 11, 10, 1, true), beamMat10);
  deployBeam.position.set(142, 6, 0);
  scene.add(deployBeam);

  // burst particles
  const BURST_N = 260;
  const burstGeo = new THREE.BufferGeometry();
  const burstPos = new Float32Array(BURST_N * 3);
  const burstCol = new Float32Array(BURST_N * 3);
  const burstVel = [];
  const burstColors = [C.blue, C.green, C.coral, C.purple, C.amber].map(h => new THREE.Color(h));
  for (let i = 0; i < BURST_N; i++) {
    const col = burstColors[i % burstColors.length];
    burstCol[i * 3] = col.r; burstCol[i * 3 + 1] = col.g; burstCol[i * 3 + 2] = col.b;
    burstVel.push(new THREE.Vector3());
  }
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  burstGeo.setAttribute('color', new THREE.BufferAttribute(burstCol, 3));
  const burstMat = new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, opacity: 0 });
  const burstPts = new THREE.Points(burstGeo, burstMat);
  burstPts.visible = false;
  scene.add(burstPts);
  let burstT = -1;

  // ============================================================
  // map-mode beacon — a "you are here" marker tall enough to read
  // from the aerial overview, where the gem itself is a speck
  // ============================================================
  const beaconGrp = new THREE.Group();
  const beaconMat = new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0, depthWrite: false });
  const beaconPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.55, 16, 12, 1, true), beaconMat);
  beaconPillar.position.y = 8;
  beaconGrp.add(beaconPillar);
  const beaconRingMat = new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0, depthWrite: false });
  const beaconRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.2, 8, 48), beaconRingMat);
  beaconRing.rotation.x = Math.PI / 2;
  beaconRing.position.y = 0.4;
  beaconGrp.add(beaconRing);
  const beaconTipMat = new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0, depthWrite: false });
  const beaconTip = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), beaconTipMat);
  beaconTip.position.y = 17;
  beaconGrp.add(beaconTip);
  beaconGrp.visible = false;
  scene.add(beaconGrp);

  // ============================================================
  // camera keyframes — one per beat (0 = intro … 11 = outro)
  // ============================================================
  const sideOff = s => (s === 'right' ? 3.0 : s === 'left' ? -3.0 : 0);
  const KEYS = [
    { pos: [64, 30, 88], look: [64, 13, 0] },                       // 0 intro aerial (strip sits low, under the hero)
    { pos: [0.5, 4.6, 19.5], look: [1.8, 2.6, 2.6] },               // 1 branch (includes the district sign)
    { pos: [13, 6, 26], look: [14.2, 2.4, 10.5] },                  // 2 worktree
    { pos: [32 + 3, 4.4, 18.5], look: [32 + 3, 3.4, 6.5] },         // 3 edit
    { pos: [45.5, 4.6, 17.5], look: [46.5, 2, 6] },                 // 4 commit
    { pos: [64 + 3, 5.5, 19], look: [64 + 3, 1.6, 6] },             // 5 push
    { pos: [72.5, 4.8, 18], look: [80, 3.4, 7.2] },                 // 6 pr (angled at gate)
    { pos: [89 + 3, 4.2, 16.5], look: [97 + 2, 2.2, 6] },           // 7 checks (down the row)
    { pos: [114 - 3.4, 10.6, 4], look: [114 - 3.2, 9.4, -10] },     // 8 preview pod
    { pos: [126 + 3, 6.5, 17], look: [126 + 2.4, 0.8, 2.4] },       // 9 merge
    { pos: [139.6, 13, 24], look: [139.8, 11, 0] },                 // 10 live globe
    { pos: [96, 28, 74], look: [72, 2, 0] },                         // 11 outro aerial
  ];
  const _pa = new THREE.Vector3(), _pb = new THREE.Vector3();
  const _la = new THREE.Vector3(), _lb = new THREE.Vector3();
  const camLook = new THREE.Vector3(70, 2, 0);

  // gem waypoints keyed by beat progress
  const GEM_KEYS = [
    [4.0, 48, 2.3, 6],
    [5.0, 64, 1.6, 6],
    [6.0, 80, 1.6, 6],
    [7.0, 98, 1.6, 6],
    [8.0, 110, 1.6, 6],
    [9.0, 127.5, 1.6, 0.6],
    [10.0, 142, 2.2, 0],
  ];

  const smooth = t => t * t * (3 - 2 * t);

  // ---------- map mode: aerial overview of the whole line ----------
  // The beacon follows the *whole* journey, including the beats before
  // the gem exists (branch, worktree, edit). [progress, x, z]
  const MAP_PATH = [
    [0, -14, 0], [1, 1, 2], [2, 16.5, 10.5], [3, 32, 6.5], [4, 48, 6],
    [5, 64, 6], [6, 80, 6], [7, 98, 6], [8, 110, 6], [9, 127.5, 0.6],
    [10, 142, 0], [11, 154, 0],
  ];
  const overview = { mix: 0 };   // 0 = scroll-driven camera … 1 = aerial map
  const MAP_LOOK = new THREE.Vector3(66, 2, 0);
  const MAP_DIR = new THREE.Vector3(0, 0.62, 0.78).normalize();
  const _mp = new THREE.Vector3();
  function mapCameraPos(out) {
    // pull back far enough that x ≈ -34 … 166 fits the frame at any aspect
    const halfW = 100;
    const d = Math.min(460, Math.max(150, halfW / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)));
    return out.copy(MAP_DIR).multiplyScalar(d).add(MAP_LOOK);
  }
  function setOverview(on, duration = 1.5) {
    gsap.killTweensOf(overview);
    gsap.to(overview, { mix: on ? 1 : 0, duration: api.reducedMotion ? 0 : duration, ease: 'power2.inOut' });
  }

  let progress = 0;
  let clockT = 0;

  function setProgress(p) { progress = p; }

  function updateCamera() {
    const p = Math.max(0, Math.min(api.reducedMotion ? Math.round(progress) : progress, KEYS.length - 1));
    const i = Math.min(Math.floor(p), KEYS.length - 2);
    const f = smooth(p - i);
    const A = KEYS[i], B = KEYS[i + 1];
    _pa.set(...A.pos); _pb.set(...B.pos);
    _la.set(...A.look); _lb.set(...B.look);
    camera.position.lerpVectors(_pa, _pb, f);
    camLook.lerpVectors(_la, _lb, f);
    if (overview.mix > 0) {
      const m = smooth(overview.mix);
      camera.position.lerp(mapCameraPos(_mp), m);
      camLook.lerp(MAP_LOOK, m);
    }
    // the map needs to see the far end of the strip, so push the fog out
    scene.fog.near = 70 + overview.mix * 280;
    scene.fog.far = 220 + overview.mix * 520;
    if (!api.reducedMotion) {
      // gentle idle sway
      camera.position.y += Math.sin(clockT * 0.6) * 0.12;
      camera.position.x += Math.sin(clockT * 0.42) * 0.09;
    }
    camera.lookAt(camLook);
  }

  function updateGem(dt) {
    // fade in near commit beat
    const target = progress > 3.45 ? 1 : 0;
    gemState.visible = api.reducedMotion ? target : gemState.visible + (target - gemState.visible) * Math.min(1, dt * 5);
    gem.visible = gemState.visible > 0.02;
    // position from waypoints
    const p = Math.min(Math.max(progress, GEM_KEYS[0][0]), GEM_KEYS[GEM_KEYS.length - 1][0]);
    let k = 0;
    while (k < GEM_KEYS.length - 2 && p > GEM_KEYS[k + 1][0]) k++;
    const A = GEM_KEYS[k], B = GEM_KEYS[k + 1];
    const f = smooth((p - A[0]) / (B[0] - A[0]));
    gem.position.set(
      A[1] + (B[1] - A[1]) * f,
      A[2] + (B[2] - A[2]) * f + Math.sin(clockT * 1.7) * 0.16 + gemState.offsetY,
      A[3] + (B[3] - A[3]) * f
    );
    if (!api.reducedMotion) gem.rotation.y += dt * 0.9;
    gem.rotation.x = Math.sin(clockT * 0.8) * 0.18;
    const s = gemState.visible * (1 + overview.mix * 1.8);
    gem.scale.setScalar(Math.max(s, 0.001));
  }

  // ============================================================
  // event animations
  // ============================================================
  const api = { setProgress, setOverview, resize, update, trigger, reset, states: {}, reducedMotion: false };

  let reducedMotion = false;
  Object.defineProperty(api, 'reducedMotion', {
    get: () => reducedMotion,
    set(value) {
      if (Boolean(value) === reducedMotion) return;
      reducedMotion = Boolean(value);
      if (reducedMotion) {
        const completed = Object.keys(api.states).filter(key => api.states[key] && key !== 'checksRunning');
        if (api.states.checksRunning) completed.push('checks');
        reset();
        completed.forEach(event => trigger(event));
        gsap.killTweensOf(overview);
        overview.mix = overview.mix > 0.5 ? 1 : 0;
      }
    },
  });

  // Every event animation belongs to a "run". reset() bumps the run, so
  // any delayed step still pending from the previous run quietly no-ops.
  let run = 0;
  const later = (t, fn) => {
    const my = run;
    return gsap.delayedCall(t, () => { if (my === run) fn(); });
  };
  let mergeNode = null;

  const pendingEvents = new Set();
  function trigger(event) {
    return new Promise(resolve => {
      pendingEvents.add(resolve);
      triggerEvent(event).then(() => { pendingEvents.delete(resolve); resolve(); });
    });
  }

  function triggerEvent(event) {
    if (api.reducedMotion) {
      api.states[event] = true;
      switch (event) {
        case 'commit':
          gemState.sealed = true; gemMat.wireframe = false; gemMat.opacity = 1;
          sealRing.material.opacity = 0; hashLbl.visible = true; break;
        case 'pr': setPRCard(true); bars.visible = false; break;
        case 'checks':
          arches.forEach(a => { a.lampMat.color.set(C.green); a.lampMat.emissive.set(C.green); }); break;
        case 'preview': podIdle.visible = false; podGrp.visible = true; podGrp.scale.setScalar(1); break;
        case 'merge': mergeMat.opacity = 1; mergeMat.emissiveIntensity = 0.35; break;
        case 'ship': globeMat.opacity = 0.55; liveLbl.visible = true; liveLbl.scale.setScalar(1); break;
      }
      return Promise.resolve();
    }
    switch (event) {
      case 'commit': return animCommit();
      case 'pr': return animPR();
      case 'checks': return animChecks();
      case 'preview': return animPreview();
      case 'merge': return animMerge();
      case 'ship': return animShip();
    }
    return Promise.resolve();
  }

  function animCommit() {
    if (api.states.commit) return Promise.resolve();
    api.states.commit = true;
    gemState.sealed = true;
    return new Promise(res => {
      gsap.to(sealRing.position, { y: 2.3, duration: 0.55, ease: 'power3.in' });
      gsap.to(sealRing.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.4, delay: 0.55, ease: 'power2.out' });
      gsap.to(sealRing.material, { opacity: 0, duration: 0.4, delay: 0.6, onStart: () => { sealRing.material.transparent = true; } });
      later(0.55, () => {
        gemMat.wireframe = false;
        gemMat.opacity = 1;
        gemMat.emissiveIntensity = 0.5;
        gsap.to(gemMat, { emissiveIntensity: 0.25, duration: 1.2 });
        gsap.fromTo(gem.scale, { x: 1.35, y: 1.35, z: 1.35 }, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(2)' });
        hashLbl.visible = true;
        gsap.fromTo(hashLbl.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'back.out(2)' });
        res();
      });
    });
  }

  function animPR() {
    if (api.states.pr) return Promise.resolve();
    api.states.pr = true;
    setPRCard(true);
    return new Promise(res => {
      bars.children.forEach((bar, i) => {
        gsap.to(bar.position, { y: 5.6 + i * 0.22, duration: 0.7, delay: i * 0.08, ease: 'power2.inOut' });
        gsap.to(bar.material, { opacity: 0, duration: 0.4, delay: 0.5 + i * 0.08 });
      });
      later(1.0, () => { bars.visible = false; res(); });
    });
  }

  function animChecks() {
    if (api.states.checksRunning) return Promise.resolve();
    api.states.checksRunning = true;
    // reset
    arches.forEach(a => {
      a.lampMat.color.set(0xCFC9B8);
      a.lampMat.emissive.set(0x000000);
    });
    const amber = new THREE.Color(C.amber);
    const green = new THREE.Color(C.green);
    return new Promise(res => {
      arches.forEach((a, i) => {
        const t0 = i * 0.95;
        later(t0, () => {
          a.lampMat.color.copy(amber);
          a.lampMat.emissive.copy(amber);
          gsap.fromTo(a.beamMat, { opacity: 0.85 }, { opacity: 0, duration: 0.8, ease: 'power1.in' });
          gsap.fromTo(a.beam.position, { y: 2.6 }, { y: 0.4, duration: 0.75, ease: 'power1.inOut' }); // beam sweep
        });
        later(t0 + 0.85, () => {
          a.lampMat.color.copy(green);
          a.lampMat.emissive.copy(green);
          gsap.fromTo(a.grp.scale, { x: 1.06, y: 1.06, z: 1.06 }, { x: 1, y: 1, z: 1, duration: 0.3 });
        });
      });
      later(arches.length * 0.95 + 0.4, () => {
        api.states.checks = true;
        api.states.checksRunning = false;
        res();
      });
    });
  }

  function animPreview() {
    if (api.states.preview) return Promise.resolve();
    api.states.preview = true;
    return new Promise(res => {
      gsap.to(podIdle.material, { opacity: 0, duration: 0.3, onStart: () => { podIdle.material.transparent = true; }, onComplete: () => { podIdle.visible = false; } });
      gsap.to(pylon.material, { opacity: 0.7, duration: 1.2 });
      later(0.9, () => {
        podGrp.visible = true;
        gsap.to(podGrp.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'elastic.out(1,0.65)', onComplete: res });
      });
    });
  }

  function animMerge() {
    if (api.states.merge) return Promise.resolve();
    api.states.merge = true;
    return new Promise(res => {
      gsap.to(mergeMat, { opacity: 1, emissiveIntensity: 0.35, duration: 0.7, ease: 'power2.out' });
      gsap.to(weldRing.material, { opacity: 1, emissiveIntensity: 0.9, duration: 0.35, delay: 0.5 });
      gsap.to(weldRing.scale, { x: 2.2, y: 2.2, z: 2.2, duration: 0.8, delay: 0.5, ease: 'power2.out' });
      gsap.to(weldRing.material, { opacity: 0, duration: 0.5, delay: 1.1, onComplete: res });
      // a new chrome node lands on main
      later(0.9, () => {
        const n = new THREE.Mesh(nodeGeo, M.chrome);
        n.position.set(127.5, 0.35, 0);
        scene.add(n);
        mergeNode = n;
        gsap.fromTo(n.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2.5)' });
      });
    });
  }

  function animShip() {
    if (api.states.ship) return Promise.resolve();
    api.states.ship = true;
    return new Promise(res => {
      gsap.to(beamMat10, { opacity: 0.4, duration: 0.5 });
      gsap.to(gemState, { offsetY: 9.8, duration: 1.6, ease: 'power2.inOut' });
      later(1.7, () => {
        // burst!
        gemState.visible = 0; gem.visible = false;
        gsap.to(beamMat10, { opacity: 0, duration: 0.6 });
        burstT = 0;
        burstPts.visible = true;
        burstMat.opacity = 1;
        for (let i = 0; i < BURST_N; i++) {
          burstPos[i * 3] = 142; burstPos[i * 3 + 1] = 12; burstPos[i * 3 + 2] = 0;
          const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
          const sp = 3.5 + Math.random() * 5;
          burstVel[i].set(Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp + 2, Math.sin(ph) * Math.sin(th) * sp);
        }
        burstGeo.attributes.position.needsUpdate = true;
        globeMat.opacity = 0.95;
        gsap.to(globeMat, { opacity: 0.55, duration: 2 });
        // relabel URL as live
        urlLbl.material.map = label({ text: 'mypicnic.app', color: '#166a49', w: 4.4, h: 0.72, fs: 17, bg: '#E9F7F0' }).material.map;
        urlLbl.material.needsUpdate = true;
        liveLbl.visible = true;
        gsap.fromTo(liveLbl.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' });
        later(1.2, res);
      });
    });
  }

  // ============================================================
  // reset — rewind every event animation to its untouched state
  // ============================================================
  function reset() {
    pendingEvents.forEach(resolve => resolve());
    pendingEvents.clear();
    run++;
    gsap.killTweensOf([
      sealRing.position, sealRing.scale, sealRing.material, gemMat, gem.scale, hashLbl.scale,
      ...bars.children.map(b => b.position), ...bars.children.map(b => b.material),
      ...arches.flatMap(a => [a.beamMat, a.beam.position, a.grp.scale]),
      podIdle.material, pylon.material, podGrp.scale,
      mergeMat, weldRing.material, weldRing.scale,
      beamMat10, gemState, globeMat, liveLbl.scale,
    ]);
    for (const k of Object.keys(api.states)) delete api.states[k];

    // commit
    gemState.sealed = false; gemState.offsetY = 0; gemState.burst = false;
    sealRing.position.y = 4.6; sealRing.scale.setScalar(1); sealRing.material.opacity = 1;
    gemMat.wireframe = true; gemMat.opacity = 0.3; gemMat.emissiveIntensity = 0.12;
    hashLbl.visible = false;
    // pull request
    setPRCard(false);
    bars.visible = true;
    bars.children.forEach((bar, i) => { bar.position.y = 0.8 + i * 1.1; bar.material.opacity = 1; });
    // checks
    arches.forEach(a => {
      a.lampMat.color.set(0xCFC9B8); a.lampMat.emissive.set(0x000000);
      a.beamMat.opacity = 0; a.beam.position.y = 1.4; a.grp.scale.setScalar(1);
    });
    // preview
    podIdle.visible = true; podIdle.material.opacity = 1;
    pylon.material.opacity = 0.25;
    podGrp.visible = false; podGrp.scale.setScalar(0.001);
    // merge
    mergeMat.opacity = 0.18; mergeMat.emissiveIntensity = 0;
    weldRing.material.opacity = 0; weldRing.material.emissiveIntensity = 0; weldRing.scale.setScalar(1);
    if (mergeNode) { scene.remove(mergeNode); mergeNode = null; }
    // ship
    beamMat10.opacity = 0;
    burstT = -1; burstPts.visible = false; burstMat.opacity = 0;
    globeMat.opacity = 0.4;
    urlLbl.material.map = urlLblIdleMap; urlLbl.material.needsUpdate = true;
    liveLbl.visible = false; liveLbl.scale.setScalar(1);
  }

  // ============================================================
  // frame loop
  // ============================================================
  function update(dt) {
    if (api.reducedMotion) dt = 0;
    clockT += dt;
    updateCamera();
    updateGem(dt);

    // map-mode beacon follows the whole journey
    beaconGrp.visible = overview.mix > 0.01;
    if (beaconGrp.visible) {
      const p = Math.max(0, Math.min(progress, MAP_PATH.length - 1));
      const i = Math.min(Math.floor(p), MAP_PATH.length - 2);
      const f = smooth(p - i);
      const A = MAP_PATH[i], B = MAP_PATH[i + 1];
      beaconGrp.position.set(A[1] + (B[1] - A[1]) * f, 0, A[2] + (B[2] - A[2]) * f);
      const o = overview.mix;
      beaconMat.opacity = 0.3 * o;
      beaconRingMat.opacity = 0.8 * o;
      beaconTipMat.opacity = 0.95 * o;
      beaconTip.rotation.y += dt * 1.2;
      beaconTip.position.y = 17 + Math.sin(clockT * 1.5) * 0.5;
      beaconRing.scale.setScalar(1 + Math.sin(clockT * 2.2) * 0.12);
    }

    // flowing push dashes
    for (let i = 0; i < dashCount; i++) {
      const t = ((clockT * 0.11 + i / dashCount) % 1);
      dashes.children[i].position.set(52 + t * 26, 0.62, 6);
      dashes.children[i].material = dashMat;
      const edgeFade = Math.min(t * 6, (1 - t) * 6, 1);
      dashes.children[i].scale.setScalar(Math.max(edgeFade, 0.001));
    }

    // floppies float
    if (!api.reducedMotion) editGrp.userData.flops.forEach((f, i) => {
      f.position.y += Math.sin(clockT * 1.1 + i * 2.1) * 0.0035;
      f.rotation.y += dt * 0.35;
    });

    // pod dome spin
    if (podGrp.visible) podGrp.userData.dome.rotation.y += dt * 0.5;

    // globe rotate
    globe.rotation.y += dt * 0.22;
    eq.rotation.z += dt * 0.1;

    // burst physics
    if (burstT >= 0) {
      burstT += dt;
      for (let i = 0; i < BURST_N; i++) {
        burstVel[i].y -= 6.5 * dt;
        burstPos[i * 3] += burstVel[i].x * dt;
        burstPos[i * 3 + 1] += burstVel[i].y * dt;
        burstPos[i * 3 + 2] += burstVel[i].z * dt;
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = Math.max(0, 1 - burstT / 2.6);
      if (burstT > 2.8) { burstT = -1; burstPts.visible = false; }
    }

    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  return api;
}
