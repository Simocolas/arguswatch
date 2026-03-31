'use strict';

// ── Math helpers ──────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

function smoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// Layer 1 only: starts at 1, fades out between [os, oe]
function fadeOut(p, os, oe) {
  if (p <= os) return 1;
  if (p >= oe) return 0;
  return 1 - smoothstep((p - os) / (oe - os));
}

// Layer 4 only: fades in between [is, ie], stays at 1
function fadeIn(p, is_, ie) {
  if (p <= is_) return 0;
  if (p >= ie)  return 1;
  return smoothstep((p - is_) / (ie - is_));
}

// Layers 2 & 3: bell — fades in [is, ie] then out [os, oe]
function fadeInOut(p, is_, ie, os, oe) {
  if (p <= is_) return 0;
  if (p >= oe)  return 0;
  if (p >= os)  return 1 - smoothstep((p - os) / (oe - os));
  return smoothstep((p - is_) / (ie - is_));
}

// ── Stars ─────────────────────────────────────────────────────────────────────

function buildStars(container, count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const size        = 1 + Math.random() * 2;          // 1–3 px
    const baseOpacity = (0.35 + Math.random() * 0.65).toFixed(2);
    el.style.width    = `${size}px`;
    el.style.height   = `${size}px`;
    el.style.left     = `${Math.random() * 100}%`;
    el.style.top      = `${Math.random() * 50}%`;       // top half only
    el.style.setProperty('--base-opacity', baseOpacity);
    el.style.setProperty('--dur',   `${(2 + Math.random() * 3).toFixed(1)}s`);
    el.style.setProperty('--delay', `${-(Math.random() * 5).toFixed(1)}s`);
    frag.appendChild(el);
  }
  container.appendChild(frag);
}

// ── Clouds ────────────────────────────────────────────────────────────────────

function buildClouds(container, defs) {
  defs.forEach(({ w, h, top, color, dur, delay }) => {
    const el = document.createElement('div');
    el.className = 'cloud';
    el.style.width   = `${w}px`;
    el.style.height  = `${h}px`;
    el.style.top     = `${top}%`;
    el.style.left    = `-${w}px`;                        // start off-screen left
    el.style.background = color;
    el.style.setProperty('--drift-dur',   `${dur}s`);
    el.style.setProperty('--drift-delay', `${delay}s`);
    el.style.setProperty('--drift-dist',  `calc(100vw + ${w}px)`);
    container.appendChild(el);
  });
}

// ── Mountain SVG (Banff-style, oblique) ───────────────────────────────────────

function buildMountains(container) {
  const NS  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1000 400');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.classList.add('mountain-svg');

  // Helper: create a filled polygon
  function poly(points, fill, opacity) {
    const el = document.createElementNS(NS, 'polygon');
    el.setAttribute('points', points);
    el.setAttribute('fill', fill);
    el.setAttribute('opacity', String(opacity));
    return el;
  }

  // Far ghostly range — hazy, light slate
  svg.appendChild(poly(
    `0,400 0,295 60,250 130,260 195,215 270,228
     340,178 415,192 480,150 555,162
     618,122 675,138 728,102 788,118
     848,88  904,104 952,78 1000,92 1000,400`,
    '#8a9aaa', 0.45
  ));

  // Mid range — main Rockies silhouette
  svg.appendChild(poly(
    `420,400 420,330
     458,290 488,306 524,256 555,272
     590,218 626,235 664,190 694,205
     732,162 764,178 802,138 834,155
     870,118 904,133 936,108 966,122
     1000,104 1000,400`,
    '#3a4a5a', 0.88
  ));

  // Near foreground — darkest, rightmost spurs
  svg.appendChild(poly(
    `640,400 640,352
     672,318 700,333 732,298 760,312
     792,278 822,292 854,260 882,274
     912,242 938,256 964,230 986,242
     1000,228 1000,400`,
    '#2a3848', 0.94
  ));

  // Snow caps — three peaks
  svg.appendChild(poly(
    `802,138 812,150 822,143 832,154 843,146 850,136
     840,128 830,118 820,128 810,121 802,138`,
    'rgba(218,228,234,0.58)', 1
  ));
  svg.appendChild(poly(
    `870,118 880,130 890,122 898,132 908,125 914,116
     905,107 894,97 882,107 874,100 870,118`,
    'rgba(218,228,234,0.52)', 1
  ));
  svg.appendChild(poly(
    `936,108 944,120 952,113 960,122 968,115 972,106
     964,97 954,88 944,98 938,91 936,108`,
    'rgba(218,228,234,0.46)', 1
  ));

  container.appendChild(svg);
}

// ── Build all layers ──────────────────────────────────────────────────────────

function buildLayers() {
  const L1 = document.getElementById('sky-layer-1');
  const L2 = document.getElementById('sky-layer-2');
  const L3 = document.getElementById('sky-layer-3');
  const L4 = document.getElementById('sky-layer-4');

  // Layer 1 — stars + faint cirrus wisps
  buildStars(L1, 100);
  buildClouds(L1, [
    { w: 520, h:  78, top:  8, color: 'rgba(255,255,255,0.035)', dur: 62, delay:    0 },
    { w: 400, h:  58, top: 19, color: 'rgba(255,255,255,0.025)', dur: 78, delay:  -22 },
    { w: 640, h:  90, top: 30, color: 'rgba(255,255,255,0.025)', dur: 52, delay:  -38 },
  ]);

  // Layer 2 — mid-level cumulus puffs
  buildClouds(L2, [
    { w: 720, h: 130, top: 18, color: 'rgba(200,218,240,0.048)', dur: 56, delay:  -12 },
    { w: 520, h: 105, top: 36, color: 'rgba(200,218,240,0.040)', dur: 68, delay:  -32 },
    { w: 840, h: 120, top: 11, color: 'rgba(200,218,240,0.036)', dur: 46, delay:   -6 },
    { w: 380, h:  80, top: 48, color: 'rgba(200,218,240,0.030)', dur: 74, delay:  -50 },
  ]);

  // Layer 3 — warm haze bands near horizon
  buildClouds(L3, [
    { w: 940, h: 155, top: 46, color: 'rgba(184,131,74,0.14)', dur: 72, delay:  -18 },
    { w: 720, h: 120, top: 60, color: 'rgba(232,192,106,0.09)', dur: 60, delay:  -42 },
    { w: 560, h:  95, top: 30, color: 'rgba(160,180,210,0.06)', dur: 50, delay:  -10 },
  ]);

  // Layer 4 — prairie, city smudge, mountains
  const prairie = document.createElement('div');
  prairie.className = 'prairie-overlay';
  L4.appendChild(prairie);

  const city = document.createElement('div');
  city.className = 'city-impression';
  L4.appendChild(city);

  buildMountains(L4);
}

// ── Blimp ─────────────────────────────────────────────────────────────────────

// Blimp is visible only in #hero. Position and patrol handled entirely by CSS.
// JS only toggles opacity via IntersectionObserver on #hero.
function setupBlimpVisibility() {
  const blimp = document.getElementById('blimp-container');
  const hero  = document.getElementById('hero');
  if (!blimp || !hero) return;

  // Start hidden; observer will reveal it if hero is in view on load
  blimp.style.opacity = '0';

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      blimp.style.opacity = e.isIntersecting ? '1' : '0';
    });
  }, { threshold: 0.3 });

  obs.observe(hero);
}

// ── Scroll handler ────────────────────────────────────────────────────────────

const LAYERS = {};

function onScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const p = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  // Crossfade breakpoints aligned so transitions overlap cleanly:
  //   L1 out ↔ L2 in  : 0.08 – 0.22
  //   L2 out ↔ L3 in  : 0.42 – 0.56
  //   L3 out ↔ L4 in  : 0.70 – 0.82
  LAYERS.L1.style.opacity = fadeOut  (p, 0.08, 0.22);
  LAYERS.L2.style.opacity = fadeInOut(p, 0.08, 0.22, 0.42, 0.56);
  LAYERS.L3.style.opacity = fadeInOut(p, 0.42, 0.56, 0.70, 0.82);
  LAYERS.L4.style.opacity = fadeIn   (p, 0.70, 0.82);
}

// ── Scroll reveal (IntersectionObserver) ─────────────────────────────────────

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseFloat(el.dataset.delay || '0');
      el.style.transitionDelay = `${delay}s`;
      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Boot ──────────────────────────────────────────────────────────────────────

// ── Coverage section: pause/resume radar animation on visibility ─────────────

function setupCoverageAnimation() {
  const coverage = document.getElementById('coverage');
  if (!coverage) return;

  const animated = coverage.querySelectorAll('.rdr-ring, .uav-track');

  // Start paused — resume only when section is in view
  animated.forEach(el => { el.style.animationPlayState = 'paused'; });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const state = e.isIntersecting ? 'running' : 'paused';
      animated.forEach(el => { el.style.animationPlayState = state; });
    });
  }, { threshold: 0.08 });

  obs.observe(coverage);
}

// ── Coverage blimp patrol ─────────────────────────────────────────────────────

function setupCoveragePatrol() {
  const blimpG   = document.getElementById('cov-blimp-g');
  if (!blimpG) return;

  const beamLine = document.getElementById('cov-beam-line');
  const ell10    = document.getElementById('cov-ell-10');
  const ell30    = document.getElementById('cov-ell-30');
  const rings    = document.querySelectorAll('.rdr-ring');
  const lbl10    = document.getElementById('cov-lbl-10');
  const lbl30    = document.getElementById('cov-lbl-30');

  // Patrol parameters (SVG coordinate space, viewBox 0 0 1400 800)
  const CENTER     = 700;    // horizontal center of scene
  const RADIUS     = 210;    // ±210 SVG units = 30% of 1400 / 2
  const PERIOD     = 140000; // ms — 140 s full cycle, ≈ 6 SVG units/s

  const BLIMP_CX_OFFSET = 95;  // blimp body cx within its local group
  const GONDOLA_Y       = 174; // global SVG y of gondola/sensor bottom

  function tick(timestamp) {
    const blimpX = CENTER + RADIUS * Math.sin(2 * Math.PI * timestamp / PERIOD);
    const tx     = blimpX - BLIMP_CX_OFFSET;

    blimpG.setAttribute('transform', `translate(${tx.toFixed(1)},56)`);

    if (beamLine) {
      beamLine.setAttribute('x1', blimpX.toFixed(1));
      beamLine.setAttribute('x2', blimpX.toFixed(1));
    }
    if (ell10) ell10.setAttribute('cx', blimpX.toFixed(1));
    if (ell30) ell30.setAttribute('cx', blimpX.toFixed(1));
    rings.forEach(r => r.setAttribute('cx', blimpX.toFixed(1)));
    if (lbl10) lbl10.setAttribute('x', (blimpX + 172).toFixed(1));
    if (lbl30) lbl30.setAttribute('x', (blimpX + 342).toFixed(1));

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ── Navigation ────────────────────────────────────────────────────────────────

function setupNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const links     = Array.from(nav.querySelectorAll('[data-section]'));
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const hamburger = nav.querySelector('.nav-hamburger');
  const navLinks  = nav.querySelector('.nav-links');

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    // Active: last section whose top is above 40% of viewport height
    const threshold = window.scrollY + window.innerHeight * 0.4;
    let activeId = sections.length ? sections[0].id : '';
    sections.forEach(sec => {
      if (sec.offsetTop <= threshold) activeId = sec.id;
    });
    links.forEach(a => a.classList.toggle('active', a.dataset.section === activeId));
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.classList.toggle('is-open', isOpen);
    });

    links.forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('is-open');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  LAYERS.L1 = document.getElementById('sky-layer-1');
  LAYERS.L2 = document.getElementById('sky-layer-2');
  LAYERS.L3 = document.getElementById('sky-layer-3');
  LAYERS.L4 = document.getElementById('sky-layer-4');

  buildLayers();
  setupReveal();
  setupCoverageAnimation();
  setupCoveragePatrol();
  setupBlimpVisibility();
  setupNav();

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // set initial state
});
