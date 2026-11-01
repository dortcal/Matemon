/* MateMonstruos · generador de criaturas originales en SVG
   Todas las criaturas se dibujan por código (no hay personajes de terceros). */
(function (G) {
'use strict';
const INK = '#1b1140';
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, t) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }

const ELEM = {
  fuego: { body: '#ff7a3d', belly: '#ffe3ac', acc: '#ffd23f', dark: '#8a2412', label: 'Fuego' },
  agua: { body: '#3fa7ff', belly: '#d9f2ff', acc: '#2de2c6', dark: '#0b3a7a', label: 'Agua' },
  planta: { body: '#5fd35f', belly: '#f0ffc4', acc: '#ff6fc0', dark: '#1d5a2a', label: 'Planta' },
  rayo: { body: '#b8f03c', belly: '#f4ffc8', acc: '#ff4fa0', dark: '#2d5a00', label: 'Rayo' },
  tierra: { body: '#c8935f', belly: '#f6e3c4', acc: '#7de0a3', dark: '#4a2f18', label: 'Tierra' },
  cosmos: { body: '#9b6bff', belly: '#e6dcff', acc: '#ff5fd0', dark: '#2a1670', label: 'Cosmos' }
};
const BODIES = ['blob', 'cat', 'dino', 'bird', 'fish', 'bug'];
const SYL = {
  fuego: [['Pir', 'Brasi', 'Lavi', 'Tiz', 'Ceni', 'Cráter', 'Fogo', 'Chispi'], ['ko', 'tón', 'la', 'zo', 'ito', 'ín', 'run', 'ñoz']],
  agua: [['Bur', 'Mari', 'Ola', 'Gotu', 'Coral', 'Nauti', 'Splu', 'Bubi'], ['xa', 'ño', 'ta', 'bi', 'llo', 'mar', 'pi', 'dú']],
  planta: [['Hoji', 'Brot', 'Lauri', 'Musgo', 'Fron', 'Pétal', 'Raíz', 'Helec'], ['to', 'lín', 'na', 'ba', 'zol', 'ño', 'fa', 'rrí']],
  rayo: [['Chis', 'Volti', 'Trueni', 'Zap', 'Relam', 'Elec', 'Fulgu', 'Rayu'], ['pi', 'to', 'zo', 'ra', 'ín', 'ka', 'tón', 'lo']],
  tierra: [['Roki', 'Tobo', 'Pedri', 'Basal', 'Lapi', 'Malpa', 'Grava', 'Terro'], ['to', 'no', 'llo', 'ñón', 'co', 'rro', 'zo', 'mi']],
  cosmos: [['Astro', 'Luni', 'Cosmi', 'Nebu', 'Estre', 'Orbi', 'Cometi', 'Galax'], ['to', 'ka', 'ín', 'lú', 'ña', 'xi', 'mo', 'ro']]
};
const EPITHET = ['', '', '', ' el Veloz', ' la Bromista', ' el Valiente', ' la Lista', ' el Curioso'];

function make(seed, elements) {
  const r = rng(seed);
  const el = elements[Math.floor(r() * elements.length)];
  const body = BODIES[Math.floor(r() * BODIES.length)];
  const tail = Math.floor(r() * 3);
  const hue = (r() - .5) * .35; // variación de tono
  const E = ELEM[el];
  const s = SYL[el];
  const name = s[0][Math.floor(r() * s[0].length)] + s[1][Math.floor(r() * s[1].length)];
  const col = { body: mix(E.body, r() < .5 ? '#ffffff' : E.dark, Math.abs(hue)), belly: E.belly, acc: E.acc, dark: E.dark };
  return { seed, element: el, body, tail, name: name.charAt(0).toUpperCase() + name.slice(1), col, label: E.label };
}

/* decoraciones elementales (origen en la base, crecen hacia arriba) */
function decor(el, x, y, sc, col, rot) {
  const a = col.acc, dk = col.dark;
  let d = '';
  switch (el) {
    case 'fuego': d = `<path d="M0 0 C-15 -4 -17 -24 -6 -38 C-5 -26 1 -24 3 -33 C13 -24 17 -8 0 0Z" fill="${a}" stroke="${INK}" stroke-width="3"/><path d="M0 -2 C-7 -5 -7 -14 -1 -20 C3 -14 8 -10 0 -2Z" fill="#fff3b0"/>`; break;
    case 'agua': d = `<path d="M0 0 C-14 -2 -16 -16 0 -38 C16 -16 14 -2 0 0Z" fill="${a}" stroke="${INK}" stroke-width="3"/><ellipse cx="-4" cy="-12" rx="2.5" ry="5" fill="#fff" opacity=".7"/>`; break;
    case 'planta': d = `<path d="M0 0 C-2 -12 -2 -20 0 -26" stroke="${INK}" stroke-width="5" fill="none"/><path d="M0 -4 C-26 -8 -26 -34 -8 -32 C-4 -22 -2 -12 0 -4Z" fill="#6fe06f" stroke="${INK}" stroke-width="3"/><path d="M0 -4 C26 -8 26 -34 8 -32 C4 -22 2 -12 0 -4Z" fill="#43b843" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="-30" r="6" fill="${a}" stroke="${INK}" stroke-width="3"/>`; break;
    case 'rayo': d = `<polygon points="5,-42 -12,-16 -2,-16 -8,4 14,-22 3,-22" fill="${a}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`; break;
    case 'tierra': d = `<polygon points="-18,0 -12,-24 -3,-4" fill="${mix(col.body, dk, .35)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><polygon points="-6,0 2,-34 12,0" fill="${mix(col.body, dk, .15)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><polygon points="8,0 16,-22 22,0" fill="${mix(col.body, dk, .4)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`; break;
    default: d = `<polygon points="0,-40 5,-26 20,-26 8,-17 12,-2 0,-11 -12,-2 -8,-17 -20,-26 -5,-26" fill="${a}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${sc})">${d}</g>`;
}

function eyes(mood, fx, fy, boss) {
  const L = fx - 17, Rx = fx + 17;
  const pup = boss ? '#e0143c' : INK;
  if (mood === 'happy') {
    return `<path d="M${L - 9} ${fy + 3} Q${L} ${fy - 11} ${L + 9} ${fy + 3}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M${Rx - 9} ${fy + 3} Q${Rx} ${fy - 11} ${Rx + 9} ${fy + 3}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (mood === 'hurt') {
    return `<polyline points="${L - 9},${fy - 7} ${L + 7},${fy + 1} ${L - 9},${fy + 9}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${Rx + 9},${fy - 7} ${Rx - 7},${fy + 1} ${Rx + 9},${fy + 9}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (mood === 'faint') {
    const x = (cx) => `<path d="M${cx - 8} ${fy - 8} L${cx + 8} ${fy + 8} M${cx + 8} ${fy - 8} L${cx - 8} ${fy + 8}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
    return x(L) + x(Rx);
  }
  const one = cx => `<ellipse cx="${cx}" cy="${fy}" rx="10" ry="11.5" fill="#fff" stroke="${INK}" stroke-width="3.5"/><circle cx="${cx + 1}" cy="${fy + 1}" r="6" fill="${pup}"/><circle cx="${cx - 2}" cy="${fy - 3}" r="2.4" fill="#fff"/>`;
  let s = one(L) + one(Rx);
  if (boss) s += `<path d="M${L - 14} ${fy - 17} L${L + 9} ${fy - 8}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M${Rx + 14} ${fy - 17} L${Rx - 9} ${fy - 8}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
function mouth(mood, fx, fy, boss) {
  if (mood === 'happy') return `<path d="M${fx - 13} ${fy + 12} Q${fx} ${fy + 36} ${fx + 13} ${fy + 12}Z" fill="#7a1030" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><ellipse cx="${fx}" cy="${fy + 23}" rx="6" ry="4" fill="#ff7a9a"/>`;
  if (mood === 'hurt') return `<path d="M${fx - 13} ${fy + 22} q6.5 -9 13 0 q6.5 9 13 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M${fx + 32} ${fy - 18} q-6 9 0 14 q6 -5 0 -14z" fill="#8ee6ff" stroke="${INK}" stroke-width="2.5"/>`;
  if (mood === 'faint') return `<path d="M${fx - 9} ${fy + 14} h18" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><ellipse cx="${fx + 4}" cy="${fy + 22}" rx="5" ry="8" fill="#ff7a9a" stroke="${INK}" stroke-width="3"/>`;
  if (boss) return `<path d="M${fx - 14} ${fy + 20} Q${fx} ${fy + 8} ${fx + 14} ${fy + 20}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M${fx - 8} ${fy + 17} l3 6 l3 -7 M${fx + 2} ${fy + 14} l3 7 l3 -6" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return `<path d="M${fx - 9} ${fy + 14} Q${fx} ${fy + 24} ${fx + 9} ${fy + 14}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
}

function tailPath(cr, col) {
  const D = ['M140 150 C176 152 188 122 168 98', 'M142 154 C164 160 176 152 180 138', 'M140 146 C168 168 190 150 188 128'][cr.tail];
  const tip = { 'M140 150 C176 152 188 122 168 98': [168, 98], 'M142 154 C164 160 176 152 180 138': [180, 138], 'M140 146 C168 168 190 150 188 128': [188, 128] }[D];
  return { svg: `<path d="${D}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="${D}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"/>`, tip };
}

/* mood: idle | happy | hurt | faint ; stage 1..3 ; boss: false | 'mini' | 'final' */
function svg(cr, o) {
  o = o || {};
  const mood = o.mood || 'idle', stage = o.stage || 1, boss = o.boss || false;
  let c = Object.assign({}, cr.col);
  if (boss) { c.body = mix(c.body, '#2a0f4d', boss === 'final' ? .5 : .32); c.belly = mix(c.belly, '#b9a6e0', .35); }
  const id = 'g' + (cr.seed % 9973) + (o.uid || '');
  const blob = cr.body === 'blob';
  const fx = 100, fy = blob ? 108 : 86;
  let b = '';
  // aura
  if (stage >= 3 || boss) {
    const ac = boss ? (boss === 'final' ? '#ff2b6a' : '#9b30ff') : c.acc;
    b += `<defs><radialGradient id="${id}a"><stop offset="0" stop-color="${ac}" stop-opacity=".75"/><stop offset="1" stop-color="${ac}" stop-opacity="0"/></radialGradient></defs><circle class="aura" cx="100" cy="112" r="92" fill="url(#${id}a)"/>`;
  }
  // alas / aletas traseras
  if (cr.body === 'bird') b += `<ellipse cx="46" cy="128" rx="22" ry="34" transform="rotate(20 46 128)" fill="${mix(c.body, c.dark, .2)}" stroke="${INK}" stroke-width="5"/><ellipse cx="154" cy="128" rx="22" ry="34" transform="rotate(-20 154 128)" fill="${mix(c.body, c.dark, .2)}" stroke="${INK}" stroke-width="5"/>`;
  if (cr.body === 'bug') b += `<ellipse cx="52" cy="108" rx="30" ry="22" transform="rotate(-25 52 108)" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="4"/><ellipse cx="148" cy="108" rx="30" ry="22" transform="rotate(25 148 108)" fill="#fff" fill-opacity=".6" stroke="${INK}" stroke-width="4"/>`;
  if (stage >= 3 && cr.body !== 'bird' && cr.body !== 'bug') b += `<path d="M58 118 C20 96 12 130 30 150 C40 132 50 128 62 134Z" fill="${c.acc}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M142 118 C180 96 188 130 170 150 C160 132 150 128 138 134Z" fill="${c.acc}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`;
  // cola
  if (cr.body !== 'blob' && cr.body !== 'bird') {
    const t = tailPath(cr, c.body); b += t.svg;
    if (cr.body === 'cat' || cr.body === 'dino') b += decor(cr.element, t.tip[0], t.tip[1] + 4, stage >= 2 ? .8 : .6, c, 20);
  }
  if (cr.body === 'fish') b += `<path d="M142 140 L186 112 L180 150 L186 178 Z" fill="${c.acc}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  // cuerpo
  if (blob) {
    b += `<ellipse cx="62" cy="172" rx="20" ry="11" fill="${mix(c.body, c.dark, .25)}" stroke="${INK}" stroke-width="5"/><ellipse cx="138" cy="172" rx="20" ry="11" fill="${mix(c.body, c.dark, .25)}" stroke="${INK}" stroke-width="5"/>`;
    b += `<ellipse cx="100" cy="116" rx="68" ry="64" fill="${c.body}" stroke="${INK}" stroke-width="5.5"/><ellipse cx="100" cy="146" rx="42" ry="30" fill="${c.belly}" opacity=".9"/>`;
    b += `<circle cx="52" cy="62" r="15" fill="${c.body}" stroke="${INK}" stroke-width="5"/><circle cx="148" cy="62" r="15" fill="${c.body}" stroke="${INK}" stroke-width="5"/><circle cx="52" cy="62" r="7" fill="${c.acc}"/><circle cx="148" cy="62" r="7" fill="${c.acc}"/>`;
  } else {
    const rx = cr.body === 'dino' ? 52 : 47, ry = cr.body === 'fish' ? 38 : 42;
    b += `<ellipse cx="80" cy="172" rx="17" ry="10" fill="${mix(c.body, c.dark, .25)}" stroke="${INK}" stroke-width="5"/><ellipse cx="120" cy="172" rx="17" ry="10" fill="${mix(c.body, c.dark, .25)}" stroke="${INK}" stroke-width="5"/>`;
    b += `<ellipse cx="100" cy="134" rx="${rx}" ry="${ry}" fill="${c.body}" stroke="${INK}" stroke-width="5.5"/><ellipse cx="100" cy="144" rx="${rx - 18}" ry="${ry - 12}" fill="${c.belly}" opacity=".92"/>`;
    b += `<ellipse cx="${100 - rx - 2}" cy="132" rx="11" ry="16" transform="rotate(18 ${100 - rx - 2} 132)" fill="${c.body}" stroke="${INK}" stroke-width="5"/><ellipse cx="${100 + rx + 2}" cy="132" rx="11" ry="16" transform="rotate(-18 ${100 + rx + 2} 132)" fill="${c.body}" stroke="${INK}" stroke-width="5"/>`;
    if (cr.body === 'bug') b += `<path d="M60 126 q40 10 80 0 M62 144 q38 9 76 0" fill="none" stroke="${c.acc}" stroke-width="6" stroke-linecap="round"/>`;
    if (stage >= 2 && cr.body !== 'bug') b += `<path d="M62 118 l10 12 M78 112 l10 14 M126 112 l-10 14 M142 118 l-10 12" stroke="${c.acc}" stroke-width="6" stroke-linecap="round"/>`;
    if (stage >= 3) b += `<polygon points="58,112 44,92 70,100" fill="${c.acc}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><polygon points="142,112 156,92 130,100" fill="${c.acc}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    // cabeza
    b += `<circle cx="100" cy="84" r="38" fill="${c.body}" stroke="${INK}" stroke-width="5.5"/>`;
    // rasgos de cabeza según tipo
    if (cr.body === 'cat') b += `<polygon points="68,66 70,32 96,52" fill="${c.body}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><polygon points="132,66 130,32 104,52" fill="${c.body}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><polygon points="74,56 75,41 88,52" fill="${c.acc}"/><polygon points="126,56 125,41 112,52" fill="${c.acc}"/>`;
    if (cr.body === 'dino') b += `<polygon points="80,52 88,34 96,48" fill="${c.acc}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><polygon points="100,46 108,26 116,46" fill="${c.acc}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><polygon points="116,50 126,36 128,56" fill="${c.acc}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="100" cy="102" rx="19" ry="12" fill="${c.belly}" opacity=".9"/>`;
    if (cr.body === 'bird') b += `<path d="M84 50 q-6 -18 4 -26 q2 12 8 22 M100 46 q0 -22 12 -28 q-2 14 -4 28 M112 50 q8 -14 20 -14 q-8 8 -12 18" fill="${c.acc}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><polygon points="100,92 88,104 112,104" fill="${c.acc}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    if (cr.body === 'fish') b += `<path d="M66 70 Q100 18 134 70 Q100 52 66 70Z" fill="${c.acc}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="62" cy="92" rx="10" ry="16" transform="rotate(30 62 92)" fill="${c.acc}" stroke="${INK}" stroke-width="4"/><ellipse cx="138" cy="92" rx="10" ry="16" transform="rotate(-30 138 92)" fill="${c.acc}" stroke="${INK}" stroke-width="4"/>`;
    if (cr.body === 'bug') b += `<path d="M82 52 Q70 28 56 24 M118 52 Q130 28 144 24" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="55" cy="23" r="8" fill="${c.acc}" stroke="${INK}" stroke-width="4"/><circle cx="145" cy="23" r="8" fill="${c.acc}" stroke="${INK}" stroke-width="4"/>`;
  }
  // decoración elemental en la cabeza
  const topY = blob ? 56 : cr.body === 'bug' || cr.body === 'bird' || cr.body === 'dino' ? 50 : 50;
  if (cr.body === 'blob' || cr.body === 'fish' || cr.body === 'bug' || cr.body === 'bird') b += decor(cr.element, 100, topY, stage === 1 ? .85 : stage === 2 ? 1.15 : 1.45, c);
  else if (cr.body === 'cat' || cr.body === 'dino') b += decor(cr.element, 100, topY - 4, stage === 1 ? .55 : stage === 2 ? .8 : 1.05, c);
  // cara
  if (o.mood !== 'faint' && mood !== 'hurt') b += `<ellipse cx="${fx - 36}" cy="${fy + 12}" rx="9" ry="6" fill="${c.acc}" opacity=".65"/><ellipse cx="${fx + 36}" cy="${fy + 12}" rx="9" ry="6" fill="${c.acc}" opacity=".65"/>`;
  b += eyes(mood, fx, fy, boss) + mouth(mood, fx, fy, boss);
  if (boss) { // corona o cuernos
    b += boss === 'final'
      ? `<path d="M64 ${blob ? 52 : 56} L70 ${blob ? 22 : 26} L84 ${blob ? 40 : 44} L100 ${blob ? 14 : 18} L116 ${blob ? 40 : 44} L130 ${blob ? 22 : 26} L136 ${blob ? 52 : 56}Z" fill="#ffd23f" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="100" cy="${blob ? 40 : 44}" r="5" fill="#ff3d9a" stroke="${INK}" stroke-width="2.5"/>`
      : `<path d="M62 54 C40 40 44 16 58 10 C56 28 70 36 78 44Z" fill="#fff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M138 54 C160 40 156 16 142 10 C144 28 130 36 122 44Z" fill="#fff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`;
  }
  if (stage >= 3 && !boss) b += `<polygon points="30,60 34,70 44,72 34,76 30,86 26,76 16,72 26,70" fill="#fff" stroke="${INK}" stroke-width="2" class="spark"/><polygon points="170,50 173,58 181,59 173,63 170,71 167,63 159,59 167,58" fill="#fff" stroke="${INK}" stroke-width="2" class="spark s2"/>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="cr-svg" aria-hidden="true">${b}</svg>`;
}

function egg(el, o) {
  o = o || {}; const E = ELEM[el];
  const crack = o.crack ? `<path d="M52 92 l14 -12 l10 14 l12 -14 l12 14 l12 -14 l12 14 l12 -12" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>` : '';
  return `<svg viewBox="0 0 150 190" xmlns="http://www.w3.org/2000/svg" class="egg-svg" aria-hidden="true"><defs><radialGradient id="eg${el}" cx="35%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${E.belly}"/><stop offset="1" stop-color="${E.body}"/></radialGradient></defs><path d="M75 12 C112 12 138 66 138 118 C138 158 110 182 75 182 C40 182 12 158 12 118 C12 66 38 12 75 12Z" fill="url(#eg${el})" stroke="${INK}" stroke-width="6"/><circle cx="48" cy="80" r="11" fill="${E.acc}" stroke="${INK}" stroke-width="4"/><circle cx="104" cy="104" r="14" fill="${E.dark}" opacity=".85"/><circle cx="62" cy="136" r="9" fill="${E.acc}" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="58" r="7" fill="${E.dark}" opacity=".85"/>${crack}</svg>`;
}

G.Creature = { make, svg, egg, ELEM, rng, mix };
})(typeof window !== 'undefined' ? window : globalThis);
