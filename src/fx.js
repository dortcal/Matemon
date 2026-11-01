/* MateMonstruos · fondos por mundo y partículas */
(function (G) {
'use strict';
const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- fondos SVG ---------- */
function stars(n, seed, ymax) {
  const r = G.Creature.rng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle class="tw" style="animation-delay:${(r() * 4).toFixed(2)}s" cx="${(r() * 1600).toFixed(0)}" cy="${(r() * ymax).toFixed(0)}" r="${(r() * 2 + .7).toFixed(1)}" fill="#fff"/>`;
  return s;
}
function wave(y, fill, op, cls) { return `<g class="wv ${cls}"><path d="M0 ${y} q100 -34 200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 t200 0 V900 H0Z" fill="${fill}" opacity="${op}"/></g>`; }
const SCENES = {
  teide: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="skT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a5c"/><stop offset=".5" stop-color="#b52a7e"/><stop offset=".82" stop-color="#ff8a4c"/><stop offset="1" stop-color="#ffd27a"/></linearGradient><radialGradient id="snT"><stop offset="0" stop-color="#fff2b8"/><stop offset=".35" stop-color="#ffc872" stop-opacity=".8"/><stop offset="1" stop-color="#ffc872" stop-opacity="0"/></radialGradient><radialGradient id="lvT"><stop offset="0" stop-color="#ffec8a"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#skT)"/>${stars(40, 11, 330)}
<circle cx="1220" cy="560" r="260" fill="url(#snT)"/><circle cx="1220" cy="560" r="70" fill="#fff6c8"/>
<path d="M-50 900 L180 650 L330 600 L470 690 L640 560 L820 900Z" fill="#6d2380"/>
<path d="M-100 900 L520 600 L690 480 L790 340 L860 300 L930 340 L1020 480 L1190 600 L1750 900Z" fill="#3b1259"/>
<path d="M770 352 L800 332 L860 300 L930 332 L948 366 L906 352 L880 376 L850 354 L816 376 L790 360Z" fill="#fff5e8"/>
<ellipse cx="860" cy="300" rx="64" ry="20" fill="url(#lvT)" class="pulse"/>
<g class="smoke"><circle cx="860" cy="270" r="26" fill="#fff" opacity=".3"/><circle cx="880" cy="228" r="34" fill="#fff" opacity=".22"/><circle cx="910" cy="180" r="44" fill="#fff" opacity=".15"/></g>
<g class="drift d1" opacity=".92"><ellipse cx="300" cy="760" rx="300" ry="46" fill="#fff" opacity=".75"/><ellipse cx="760" cy="790" rx="360" ry="50" fill="#ffe6ef" opacity=".8"/><ellipse cx="1300" cy="750" rx="320" ry="44" fill="#fff" opacity=".7"/></g>
<g class="drift d2"><ellipse cx="100" cy="830" rx="340" ry="60" fill="#fff" opacity=".9"/><ellipse cx="900" cy="840" rx="420" ry="64" fill="#ffd9e6" opacity=".9"/><ellipse cx="1550" cy="825" rx="300" ry="56" fill="#fff" opacity=".85"/></g>
<path d="M0 900 L0 860 Q120 830 210 870 Q330 820 460 880 L520 900Z M1200 900 L1290 868 Q1420 820 1520 862 Q1580 850 1600 870 L1600 900Z" fill="#1b0a3d"/></svg>`,
  atlantico: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="skA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#062067"/><stop offset=".5" stop-color="#1676c9"/><stop offset="1" stop-color="#56e0d8"/></linearGradient><radialGradient id="snA"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#c8fbff" stop-opacity=".7"/><stop offset="1" stop-color="#c8fbff" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#skA)"/>
<circle cx="1180" cy="170" r="230" fill="url(#snA)"/><circle cx="1180" cy="170" r="60" fill="#fff"/>
<g class="rays"><polygon points="1180,170 700,900 900,900" fill="#fff" opacity=".07"/><polygon points="1180,170 1000,900 1200,900" fill="#fff" opacity=".07"/><polygon points="1180,170 1320,900 1500,900" fill="#fff" opacity=".06"/></g>
<g class="drift d3"><path d="M300 400 q40 -20 80 0 q-40 -4 -80 0Z M420 360 q40 -20 80 0 q-40 -4 -80 0Z" fill="#fff" opacity=".5"/></g>
${wave(560, '#2fb7e8', .55, 'w1')}${wave(640, '#1a8ad0', .75, 'w2')}${wave(730, '#1160b3', .9, 'w3')}${wave(820, '#0a3f8f', 1, 'w4')}
<g class="fishes"><path d="M100 780 q40 -30 80 0 q-40 30 -80 0 M180 780 l26 -18 v36z" fill="#0a2a6e" opacity=".55"/></g></svg>`,
  laurisilva: () => { const r = G.Creature.rng(77); let t = '';
    for (let i = 0; i < 9; i++) { const x = 40 + i * 190 + (r() * 60 - 30), w = 50 + r() * 50, c = ['#0b3a2a', '#0f4a35', '#145a40'][i % 3]; t += `<rect x="${x}" y="-20" width="${w}" height="960" rx="22" fill="${c}"/><circle cx="${x + w / 2}" cy="${120 + r() * 60}" r="${140 + r() * 70}" fill="${['#1f8a55', '#2fa36b', '#166f45'][i % 3]}" opacity=".9"/>`; }
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="skL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2f2a"/><stop offset=".5" stop-color="#1f8a60"/><stop offset="1" stop-color="#b9f5a0"/></linearGradient></defs><rect width="1600" height="900" fill="url(#skL)"/>
<g class="rays"><polygon points="500,0 760,0 380,900 80,900" fill="#fff6b0" opacity=".14"/><polygon points="1000,0 1200,0 980,900 700,900" fill="#fff6b0" opacity=".12"/><polygon points="1350,0 1500,0 1560,900 1250,900" fill="#fff6b0" opacity=".1"/></g>
${t}<g class="drift d1"><ellipse cx="300" cy="640" rx="380" ry="60" fill="#e8fff0" opacity=".35"/><ellipse cx="1100" cy="700" rx="460" ry="70" fill="#e8fff0" opacity=".3"/></g><g class="drift d2"><ellipse cx="600" cy="790" rx="520" ry="80" fill="#f3fff6" opacity=".4"/><ellipse cx="1500" cy="800" rx="380" ry="70" fill="#f3fff6" opacity=".35"/></g>
<path d="M0 900 V820 Q60 760 120 830 Q150 770 220 840 Q280 780 340 850 L420 900Z M1180 900 L1260 850 Q1330 770 1390 840 Q1450 770 1520 835 Q1570 790 1600 840 V900Z" fill="#06241c"/></svg>`; },
  cosmos: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="skC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05021c"/><stop offset=".6" stop-color="#2a0f6e"/><stop offset="1" stop-color="#8a38f0"/></linearGradient><radialGradient id="plC" cx="35%" cy="30%"><stop offset="0" stop-color="#ffd8f4"/><stop offset=".5" stop-color="#ff5fd0"/><stop offset="1" stop-color="#5a1aa8"/></radialGradient><linearGradient id="auC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2de2ff" stop-opacity="0"/><stop offset=".5" stop-color="#b6ff3b" stop-opacity=".35"/><stop offset="1" stop-color="#ff3d9a" stop-opacity="0"/></linearGradient></defs>
<rect width="1600" height="900" fill="url(#skC)"/>${stars(150, 5, 700)}
<path class="aur" d="M0 260 Q400 120 800 240 T1600 200 V330 Q1200 400 800 320 T0 370Z" fill="url(#auC)"/>
<g class="float"><circle cx="1220" cy="270" r="120" fill="url(#plC)"/><ellipse cx="1220" cy="270" rx="210" ry="40" fill="none" stroke="#ffd23f" stroke-width="12" opacity=".8" transform="rotate(-18 1220 270)"/><path d="M1100 270 A120 120 0 0 0 1340 270" fill="none"/></g>
<circle cx="330" cy="200" r="46" fill="#e6dcff"/><circle cx="318" cy="190" r="10" fill="#c5b6f0"/><circle cx="346" cy="214" r="7" fill="#c5b6f0"/>
<g class="shoot"><line x1="0" y1="0" x2="160" y2="60" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
<path d="M-50 900 L260 720 L420 650 L520 720 L760 640 L930 740 L1180 700 L1380 780 L1700 900Z" fill="#12063a"/>
<path d="M740 650 q40 -60 80 0Z" fill="#cfc4ff"/><rect x="740" y="650" width="80" height="26" fill="#9a8ae0"/><line x1="780" y1="598" x2="800" y2="570" stroke="#fff" stroke-width="5"/>
<path d="M0 900 V850 Q200 800 420 860 L520 900Z M1100 900 L1250 840 Q1450 800 1600 850 V900Z" fill="#07021f"/></svg>`
};

/* ---------- partículas ---------- */
let cv, cx, W = 0, H = 0, parts = [], world = 'teide', raf = 0, last = 0;
function resize() { const dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
function init() { cv = document.getElementById('fx'); cx = cv.getContext('2d'); resize(); window.addEventListener('resize', resize); last = performance.now(); loop(last); }
function setWorld(w) {
  world = w; const bg = document.getElementById('bg'); bg.dataset.world = w; bg.innerHTML = SCENES[w]();
}
function add(p) { if (parts.length < 600) parts.push(p); }
function burst(x, y, colors, n, speed, o) {
  o = o || {}; if (reduce()) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = (.3 + Math.random()) * (speed || 6);
    add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), g: o.g == null ? .25 : o.g, life: 0, max: 30 + Math.random() * 30, s: 3 + Math.random() * 5, c: colors[i % colors.length], shape: o.shape || (Math.random() < .4 ? 'star' : 'circle'), rot: Math.random() * 6, vr: (Math.random() - .5) * .3 });
  }
}
function confetti(n) {
  if (reduce()) n = Math.ceil(n / 4);
  const cols = ['#ff3d9a', '#2de2ff', '#b6ff3b', '#ffd23f', '#ff7a3d', '#9b6bff', '#fff'];
  for (let i = 0; i < n; i++) add({ x: Math.random() * W, y: -20 - Math.random() * H * .3, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4, g: .05, life: 0, max: 140 + Math.random() * 80, s: 5 + Math.random() * 6, c: cols[i % cols.length], shape: 'rect', rot: Math.random() * 6, vr: (Math.random() - .5) * .4 });
}
function ambient() {
  if (reduce() || parts.length > 160) return;
  const rn = Math.random();
  if (world === 'teide' && rn < .25) add({ x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * .8, vy: -(1 + Math.random() * 2), g: -.005, life: 0, max: 200, s: 2 + Math.random() * 3, c: Math.random() < .5 ? '#ffb347' : '#ffe27a', shape: 'circle', amb: 1 });
  if (world === 'atlantico' && rn < .18) add({ x: Math.random() * W, y: H + 10, vx: (Math.random() - .5) * .6, vy: -(.8 + Math.random() * 1.6), g: 0, life: 0, max: 280, s: 3 + Math.random() * 7, c: '#bff6ff', shape: 'ring', amb: 1 });
  if (world === 'laurisilva' && rn < .12) add({ x: Math.random() * W, y: H * (.3 + Math.random() * .6), vx: (Math.random() - .5) * 1, vy: (Math.random() - .5) * .6, g: 0, life: 0, max: 220, s: 2.5 + Math.random() * 2.5, c: '#f3ff7a', shape: 'glow', amb: 1 });
  if (world === 'cosmos' && rn < .08) add({ x: Math.random() * W, y: Math.random() * H * .7, vx: -.2, vy: .15, g: 0, life: 0, max: 160, s: 2 + Math.random() * 2, c: '#fff', shape: 'star', amb: 1 });
}
function draw(p) {
  const k = p.life / p.max, a = p.amb ? Math.sin(Math.PI * k) * .8 : 1 - k * k;
  cx.globalAlpha = Math.max(0, a); cx.fillStyle = p.c; cx.strokeStyle = p.c;
  cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
  switch (p.shape) {
    case 'rect': cx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); break;
    case 'ring': cx.lineWidth = 1.6; cx.beginPath(); cx.arc(0, 0, p.s, 0, 7); cx.stroke(); break;
    case 'glow': cx.shadowColor = p.c; cx.shadowBlur = 14; cx.beginPath(); cx.arc(0, 0, p.s, 0, 7); cx.fill(); cx.shadowBlur = 0; break;
    case 'star': cx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? p.s * .45 : p.s * 1.2, an = i * Math.PI / 4; cx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } cx.closePath(); cx.fill(); break;
    default: cx.beginPath(); cx.arc(0, 0, p.s, 0, 7); cx.fill();
  }
  cx.restore();
}
function loop(t) {
  raf = requestAnimationFrame(loop);
  if (document.hidden) return;
  cx.clearRect(0, 0, W, H); ambient();
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr || 0;
    if (p.life > p.max || p.y > H + 40) { parts.splice(i, 1); continue; }
    draw(p);
  }
  cx.globalAlpha = 1;
}
G.FX = { init, setWorld, burst, confetti, SCENES };
})(window);
