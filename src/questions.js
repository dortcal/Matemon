/* MateMonstruos · motor de preguntas
   Generadores paramétricos por categoría y ciclo. d = dificultad 0..1 dentro del ciclo. */
(function (G) {
'use strict';

/* ---------- utilidades ---------- */
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: a => a[Math.floor(Math.random() * a.length)],
  chance: p => Math.random() < p,
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  lerp: (d, a, b) => Math.round(a + (b - a) * d)
};
const nf = new Intl.NumberFormat('es-ES');
const D = n => String(Math.round(n * 1000) / 1000).replace('.', ',');
const N = n => Number.isInteger(n) ? (Math.abs(n) >= 10000 ? nf.format(n) : String(n)) : D(n);
const F = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
const BLANK = '<span class="blank">?</span>';
const gcd = (a, b) => b ? gcd(b, a % b) : a;

function numWrong(c, extra) {
  const m = Math.abs(c) < 10 ? [1, 2, 3] : Math.abs(c) < 100 ? [1, 2, 10, 5] : Math.abs(c) < 1000 ? [1, 10, 100, 2] : [1, 10, 100, 1000];
  const out = [];
  m.forEach(s => out.push(c + s, c - s));
  (extra || []).forEach(x => out.push(x));
  return out.filter(v => Number.isFinite(v) && v >= 0 && v !== c && (Number.isInteger(v) || !Number.isInteger(c))).map(N);
}

function build(o) {
  const bad = s => s == null || /NaN|undefined|Infinity/.test(String(s));
  if (bad(o.correct) || bad(o.text)) return null;
  const seen = new Set([o.correct]); const opts = [o.correct];
  const max = o.n || 4, min = o.min || 3;
  for (const w of R.shuffle(o.wrong || [])) {
    if (bad(w) || seen.has(w)) continue;
    seen.add(w); opts.push(w);
    if (opts.length >= max) break;
  }
  if (opts.length < min) return null;
  const order = o.order ? o.order.filter(x => opts.includes(x)) : o.keepOrder ? opts : R.shuffle(opts);
  return { cat: o.cat, text: o.text, visual: o.visual || '', answers: order, correct: order.indexOf(o.correct), hint: o.hint || '', key: o.key || (o.cat + '|' + o.text + '|' + o.correct), big: !!o.big };
}

/* ---------- SVG ---------- */
const INK = '#1b1140';
const TCOL = ['#ff3d9a', '#2de2ff', '#b6ff3b', '#ffd23f', '#ff7a3d', '#9b6bff'];
const svg = (vb, inner, cls) => `<svg viewBox="${vb}" class="${cls || ''}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
const ngon = (n, cx, cy, r, rot) => { rot = rot == null ? (n % 2 === 0 ? -90 + 180 / n : -90) : rot; let p = []; for (let i = 0; i < n; i++) { const a = (rot + 360 * i / n) * Math.PI / 180; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return p.join(' '); };
const starPts = (cx, cy, R1, R2, n) => { let p = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? R2 : R1, a = (-90 + 180 * i / n) * Math.PI / 180; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); } return p.join(' '); };
const STW = `stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const ST = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function tok(shape, col) {
  let p;
  switch (shape) {
    case 'circle': p = '<circle cx="20" cy="20" r="14"/>'; break;
    case 'square': p = '<rect x="6" y="6" width="28" height="28" rx="4"/>'; break;
    case 'triangle': p = '<polygon points="20,5 35,33 5,33"/>'; break;
    case 'star': p = `<polygon points="${starPts(20, 21, 17, 7.5, 5)}"/>`; break;
    case 'diamond': p = '<polygon points="20,3 36,20 20,37 4,20"/>'; break;
    default: p = '<path d="M20 35 C4 24 4 10 13 9 C17 9 19 12 20 14 C21 12 23 9 27 9 C36 10 36 24 20 35Z"/>';
  }
  return svg('0 0 40 40', `<g fill="${col}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">${p}</g>`, 'tok');
}
const TSHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'heart'];

/* figuras 2D / 3D (120x120) */
function shape2d(name, col) {
  col = col || R.pick(TCOL);
  const f = `fill="${col}" ${ST}`;
  const m = {
    circulo: `<circle cx="60" cy="60" r="44" ${f}/>`,
    cuadrado: `<rect x="18" y="18" width="84" height="84" rx="3" ${f}/>`,
    rectangulo: `<rect x="8" y="34" width="104" height="52" rx="3" ${f}/>`,
    triangulo: `<polygon points="60,12 108,100 12,100" ${f}/>`,
    rombo: `<polygon points="60,8 106,60 60,112 14,60" ${f}/>`
  };
  return svg('0 0 120 120', m[name], 'fig');
}
function solid(name) {
  const c1 = '#ff3d9a', c2 = '#2de2ff', c3 = '#ffd23f';
  const m = {
    esfera: `<defs><radialGradient id="gs" cx="35%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${c2}"/><stop offset="1" stop-color="#1668c9"/></radialGradient></defs><circle cx="60" cy="62" r="46" fill="url(#gs)" ${ST}/>`,
    cubo: `<polygon points="60,10 104,34 60,58 16,34" fill="${c3}" ${ST}/><polygon points="16,34 60,58 60,110 16,86" fill="${c1}" ${ST}/><polygon points="104,34 60,58 60,110 104,86" fill="#b3126a" ${ST}/>`,
    cono: `<ellipse cx="60" cy="96" rx="40" ry="14" fill="#ff7a3d" ${ST}/><polygon points="60,10 20,96 100,96" fill="#ff7a3d" ${ST}/><ellipse cx="60" cy="96" rx="40" ry="14" fill="#ffa266" ${ST}/>`,
    cilindro: `<rect x="20" y="28" width="80" height="68" fill="#b6ff3b" ${ST}/><ellipse cx="60" cy="96" rx="40" ry="14" fill="#b6ff3b" ${ST}/><rect x="22" y="28" width="76" height="66" fill="#b6ff3b"/><ellipse cx="60" cy="28" rx="40" ry="14" fill="#e4ff9e" ${ST}/>`,
    piramide: `<polygon points="60,8 18,86 60,106" fill="#ffd23f" ${ST}/><polygon points="60,8 60,106 104,80" fill="#e0a800" ${ST}/>`
  };
  return svg('0 0 120 120', m[name], 'fig');
}
function polyFig(n, col, rot) { return svg('0 0 120 120', `<polygon points="${ngon(n, 60, 62, 48, rot)}" fill="${col || R.pick(TCOL)}" ${ST}/>`, 'fig'); }

/* ---------- SUMAS Y RESTAS ---------- */
const NAMES = ['Ayoze', 'Naira', 'Yeray', 'Candela', 'Dácil', 'Airam', 'Acaymo', 'Nauzet', 'Kenia', 'Beneharo'];
const THINGS = [['plátanos', 'm'], ['papas', 'f'], ['cabras', 'f'], ['barcos', 'm'], ['cometas', 'f'], ['conchas', 'f'], ['lagartos', 'm'], ['gaviotas', 'f'], ['piedras', 'f'], ['sandías', 'f'], ['pegatinas', 'f'], ['tomates', 'm']];
const Cuan = g => g === 'f' ? 'Cuántas' : 'Cuántos';

function sumres(c, d) {
  const kind = (c === 1 && d < .3) ? R.pick(['sum', 'sub', 'sum', 'sub', 'miss']) : R.pick(['sum', 'sub', 'miss', 'prob', 'prob']);
  if (c === 3 && d > .5 && R.chance(.35)) {
    const a = R.int(11, 899) / 10, b = R.int(11, 899) / 10, sub = R.chance(.5);
    const x = sub ? Math.max(a, b) : a, y = sub ? Math.min(a, b) : b;
    if (x === y) return null;
    const ans = Math.round((sub ? x - y : x + y) * 10) / 10;
    const w = [ans + .1, ans - .1, ans + 1, ans - 1, ans + 10, ans - 10, Math.round((sub ? x + y : Math.abs(x - y)) * 10) / 10].filter(v => v >= 0 && v !== ans).map(D);
    return build({ cat: 'sumres', text: `${D(x)} ${sub ? '−' : '+'} ${D(y)} = ?`, correct: D(ans), wrong: w, hint: `Alinea las comas: ${D(x)} ${sub ? '−' : '+'} ${D(y)} = ${D(ans)}` });
  }
  let max;
  if (c === 1) max = d < .2 ? 10 : d < .45 ? 20 : d < .75 ? 50 : 100;
  else if (c === 2) max = R.lerp(d, 300, 9999);
  else max = d < .4 ? R.lerp(d, 1000, 99999) : 999999;
  const lo = c === 1 ? 1 : Math.max(2, Math.floor(max / 10));
  const sub = kind === 'sub' || ((kind === 'miss' || kind === 'prob') && R.chance(.5));
  let a, b, s;
  if (!sub) {
    a = R.int(lo, c === 1 ? max - 1 : Math.floor(max * .7));
    b = R.int(lo, c === 1 ? Math.max(1, max - a) : Math.floor(max * .7));
    s = a + b;
  } else {
    s = R.int(c === 1 ? 2 : lo * 2, max);
    a = R.int(c === 1 ? 1 : lo, s - (c === 1 ? 1 : lo));
    if (a >= s) return null;
    b = s - a;
  }
  // sum: a+b=s ; sub: s-a=b
  let text, ans, hint;
  if (kind === 'sum' || kind === 'sub') {
    if (!sub) { text = `${N(a)} + ${N(b)} = ?`; ans = s; hint = `${N(a)} + ${N(b)} = ${N(s)}`; }
    else { text = `${N(s)} − ${N(a)} = ?`; ans = b; hint = `${N(s)} − ${N(a)} = ${N(b)}`; }
  } else if (kind === 'miss') {
    if (!sub) { text = `${N(a)} + ${BLANK} = ${N(s)}`; ans = b; hint = `Lo que falta: ${N(s)} − ${N(a)} = ${N(b)}`; }
    else { text = `${N(s)} − ${BLANK} = ${N(b)}`; ans = a; hint = `Lo que falta: ${N(s)} − ${N(b)} = ${N(a)}`; }
  } else {
    const [u, g] = R.pick(THINGS), n1 = R.pick(NAMES), n2 = R.pick(NAMES.filter(x => x !== n1));
    if (!sub) {
      text = R.pick([
        `${n1} tiene ${N(a)} ${u} y ${n2} tiene ${N(b)}. ¿${Cuan(g)} ${u} tienen entre los dos?`,
        `En una cesta hay ${N(a)} ${u} y en otra hay ${N(b)}. ¿${Cuan(g)} ${u} hay en total?`,
        `${n1} tenía ${N(a)} ${u} y encuentra ${N(b)} más. ¿${Cuan(g)} ${u} tiene ahora?`]);
      ans = s; hint = `Suma: ${N(a)} + ${N(b)} = ${N(s)}`;
    } else {
      text = R.pick([
        `${n1} tenía ${N(s)} ${u} y regala ${N(a)}. ¿${Cuan(g)} ${u} le quedan?`,
        `En el puerto había ${N(s)} ${u} y se llevan ${N(a)}. ¿${Cuan(g)} quedan?`,
        `${n1} tiene ${N(s)} ${u} y ${n2} tiene ${N(a)}. ¿${Cuan(g)} ${u} más tiene ${n1}?`]);
      ans = b; hint = `Resta: ${N(s)} − ${N(a)} = ${N(b)}`;
    }
  }
  return build({ cat: 'sumres', text, correct: N(ans), wrong: numWrong(ans, [a + b, Math.abs(a - b), s + a]), hint });
}

/* ---------- TABLAS ---------- */
function mulHint(a, b) {
  const p = a * b;
  if (b > 5) return `${a} × ${b} = ${a} × 5 + ${a} × ${b - 5} = ${a * 5} + ${a * (b - 5)} = ${p}`;
  return `${a} × ${b} = ${Array(b).fill(a).join(' + ')} = ${p}`;
}
function tablas(c, d) {
  if (c === 2) {
    const pool = d < .3 ? [2, 5, 10] : d < .6 ? [2, 3, 4, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = R.pick(pool), b = R.int(2, d < .3 ? 5 : 10), p = a * b;
    const form = R.pick(['mul', 'mul', 'mul', 'miss', 'miss', 'prob', 'dbl']);
    const w = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, p + a, p - a, p + b, p - b];
    if (form === 'mul') return build({ cat: 'tablas', text: `${a} × ${b} = ?`, correct: N(p), wrong: w.filter(x => x > 0 && x !== p).map(N).concat(numWrong(p)), hint: mulHint(a, b) });
    if (form === 'miss') {
      const left = R.chance(.5);
      return build({ cat: 'tablas', text: left ? `${a} × ${BLANK} = ${p}` : `${BLANK} × ${b} = ${p}`, correct: N(left ? b : a), wrong: numWrong(left ? b : a, [a, b, p / 2 | 0]), hint: `${p} ÷ ${left ? a : b} = ${left ? b : a}, porque ${a} × ${b} = ${p}` });
    }
    if (form === 'dbl') {
      const n = R.int(3, d < .5 ? 20 : 50), t = R.chance(.5);
      const ans = n * (t ? 2 : 3);
      return build({ cat: 'tablas', text: `¿Cuál es el ${t ? 'doble' : 'triple'} de ${n}?`, correct: N(ans), wrong: numWrong(ans, [n + (t ? 2 : 3), n * (t ? 3 : 2)]), hint: `${t ? 'Doble' : 'Triple'} de ${n}: ${n} × ${t ? 2 : 3} = ${ans}` });
    }
    const [u, g] = R.pick(THINGS);
    return build({ cat: 'tablas', text: `Hay ${a} cajas con ${b} ${u} cada una. ¿${Cuan(g)} ${u} hay en total?`, correct: N(p), wrong: w.filter(x => x > 0 && x !== p).map(N).concat(numWrong(p)), hint: `${a} × ${b} = ${p}` });
  }
  // ciclo 3
  const form = d < .25 ? R.pick(['t', 'p10', 'miss']) : d < .6 ? R.pick(['t', 'm2', 'p10', 'miss', 'prob']) : R.pick(['m2', 'm2', 'mm', 'p10', 'miss', 'prob', 'dec']);
  if (form === 't') {
    const a = R.pick([6, 7, 8, 9, 11, 12, 13, 14, 15]), b = R.int(3, 12), p = a * b;
    return build({ cat: 'tablas', text: `${a} × ${b} = ?`, correct: N(p), wrong: [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, p + 10, p - 10].filter(x => x > 0).map(N), hint: b > 10 ? `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = ${p}` : `${a} × ${b} = ${a} × 5 + ${a} × ${b - 5} = ${a * 5} + ${a * (b - 5)} = ${p}` });
  }
  if (form === 'm2') {
    const x = R.int(12, 99), y = R.int(2, 9), p = x * y;
    return build({ cat: 'tablas', text: `${x} × ${y} = ?`, correct: N(p), wrong: numWrong(p, [x * (y + 1), x * (y - 1), p + 20, p - 20]), hint: `${x} × ${y} = ${Math.floor(x / 10) * 10} × ${y} + ${x % 10} × ${y} = ${Math.floor(x / 10) * 10 * y} + ${(x % 10) * y} = ${p}` });
  }
  if (form === 'mm') {
    const x = R.int(11, 25), y = R.int(11, 15), p = x * y;
    return build({ cat: 'tablas', text: `${x} × ${y} = ?`, correct: N(p), wrong: numWrong(p, [x * y + 10, x * y - 10, x * (y + 1), x * (y - 1), (x + 1) * y]), hint: `${x} × ${y} = ${x} × 10 + ${x} × ${y - 10} = ${x * 10} + ${x * (y - 10)} = ${p}` });
  }
  if (form === 'p10') {
    const n = R.int(2, 99), k = R.pick([10, 100, 1000]), p = n * k;
    return build({ cat: 'tablas', text: `${n} × ${N(k)} = ?`, correct: N(p), wrong: [n * k * 10, n * k / 10, n * (k / 10 || 1) * 10 + n, n * k + n, n * (k * 10 > 1000 ? 100 : 1000)].filter(x => x !== p && x >= 1).map(N), hint: `Multiplicar por ${N(k)}: añade ${String(k).length - 1} cero${k > 10 ? 's' : ''} → ${N(p)}` });
  }
  if (form === 'dec') {
    const n = R.int(11, 99) / 10, k = R.pick([10, 100]), p = Math.round(n * k * 100) / 100;
    return build({ cat: 'tablas', text: `${D(n)} × ${k} = ?`, correct: N(p), wrong: [p * 10, p / 10, n * k + n, n + k].filter(x => x !== p).map(N), hint: `Multiplicar por ${k} desplaza la coma ${k === 10 ? 'un lugar' : 'dos lugares'}: ${N(p)}` });
  }
  if (form === 'miss') {
    const a = R.int(6, 15), b = R.int(3, 12), p = a * b;
    return build({ cat: 'tablas', text: `${a} × ${BLANK} = ${p}`, correct: N(b), wrong: numWrong(b, [a, p / 10 | 0]), hint: `${p} ÷ ${a} = ${b}` });
  }
  const a = R.int(12, 60), b = R.int(3, 9), p = a * b, [u, g] = R.pick(THINGS);
  return build({ cat: 'tablas', text: `Cada caja trae ${a} ${u}. Con ${b} cajas, ¿${Cuan(g)} ${u} hay?`, correct: N(p), wrong: numWrong(p, [a + b, a * (b + 1)]), hint: `${a} × ${b} = ${p}` });
}

/* ---------- DIVISIONES ---------- */
function divisiones(c, d) {
  if (c === 2) {
    const pool = d < .3 ? [2, 5, 10] : d < .6 ? [2, 3, 4, 5, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const b = R.pick(pool), q = R.int(2, 10);
    const form = d > .65 ? R.pick(['div', 'resto', 'resto', 'miss']) : R.pick(['div', 'div', 'miss', 'rep']);
    if (form === 'div') return build({ cat: 'divisiones', text: `${b * q} ÷ ${b} = ?`, correct: N(q), wrong: numWrong(q, [b, q + b]), hint: `${b} × ${q} = ${b * q}, así que ${b * q} ÷ ${b} = ${q}` });
    if (form === 'miss') return build({ cat: 'divisiones', text: `${BLANK} ÷ ${b} = ${q}`, correct: N(b * q), wrong: numWrong(b * q, [q + b, b * (q + 1)]), hint: `${q} × ${b} = ${b * q}` });
    if (form === 'rep') { const [u, g] = R.pick(THINGS); return build({ cat: 'divisiones', text: `Reparto ${b * q} ${u} entre ${b} amigos por igual. ¿${Cuan(g)} ${u} recibe cada uno?`, correct: N(q), wrong: numWrong(q, [b]), hint: `${b * q} ÷ ${b} = ${q}` }); }
    const r = R.int(1, b - 1), D0 = b * q + r;
    const ok = `${q} y sobran ${r}`;
    return build({ cat: 'divisiones', text: `${D0} ÷ ${b}: ¿cociente y resto?`, correct: ok, wrong: [`${q} y sobran ${r + 1 < b ? r + 1 : r - 1 || 1}`, `${q + 1} y sobran ${r}`, `${q - 1} y sobran ${r}`, `${q} y sobran 0`, `${r} y sobran ${q % b}`].filter(x => x !== ok), hint: `${b} × ${q} = ${b * q}; ${D0} − ${b * q} = ${r}` });
  }
  const form = d < .3 ? R.pick(['div', 'p10']) : d < .65 ? R.pick(['div', 'resto', 'p10', 'prob']) : R.pick(['div2', 'resto', 'prueba', 'div', 'miss']);
  if (form === 'div') { const b = R.int(2, 9), q = R.int(12, 110); return build({ cat: 'divisiones', text: `${b * q} ÷ ${b} = ?`, correct: N(q), wrong: numWrong(q, [q + b, q - b]), hint: `${b} × ${q} = ${b * q}` }); }
  if (form === 'p10') { const k = R.pick([10, 100]), q = R.int(2, 99), n = q * k; return build({ cat: 'divisiones', text: `${N(n)} ÷ ${k} = ?`, correct: N(q), wrong: [q * 10, q / 10, q + 1, q * 100].filter(x => x !== q && x >= 1).map(N), hint: `Dividir entre ${k}: quita ${k === 10 ? 'un cero' : 'dos ceros'} → ${q}` }); }
  if (form === 'resto') {
    const b = R.int(3, 9), q = R.int(11, 99), r = R.int(1, b - 1), D0 = b * q + r, ok = `${q} y sobran ${r}`;
    return build({ cat: 'divisiones', text: `${D0} ÷ ${b}: ¿cociente y resto?`, correct: ok, wrong: [`${q} y sobran ${r + 1 < b ? r + 1 : r - 1}`, `${q + 1} y sobran ${r}`, `${q - 1} y sobran ${r}`, `${q + 10} y sobran ${r}`, `${q} y sobran 0`].filter(x => x !== ok), hint: `${b} × ${q} = ${b * q}; ${D0} − ${b * q} = ${r}` });
  }
  if (form === 'prob') { const b = R.int(3, 9), q = R.int(12, 80), [u, g] = R.pick(THINGS); return build({ cat: 'divisiones', text: `Se reparten ${b * q} ${u} en ${b} bolsas iguales. ¿${Cuan(g)} ${u} hay en cada bolsa?`, correct: N(q), wrong: numWrong(q, [q + b]), hint: `${b * q} ÷ ${b} = ${q}` }); }
  if (form === 'div2') { const b = R.int(11, 15), q = R.int(6, 19); return build({ cat: 'divisiones', text: `${b * q} ÷ ${b} = ?`, correct: N(q), wrong: numWrong(q, [q + 10, q - 10, q + b]), hint: `${b} × ${q} = ${b * q}` }); }
  if (form === 'prueba') {
    const b = R.int(4, 9), q = R.int(12, 40), r = R.int(1, b - 1), D0 = b * q + r;
    return build({ cat: 'divisiones', text: `En una división el divisor es ${b}, el cociente ${q} y el resto ${r}. ¿Cuál es el dividendo?`, correct: N(D0), wrong: numWrong(D0, [b * q, b * q - r, q + b + r]), hint: `Dividendo = divisor × cociente + resto = ${b} × ${q} + ${r} = ${D0}` });
  }
  const b = R.int(4, 12), q = R.int(11, 60);
  return build({ cat: 'divisiones', text: `${BLANK} ÷ ${b} = ${q}`, correct: N(b * q), wrong: numWrong(b * q, [q + b, b * (q + 1)]), hint: `${q} × ${b} = ${b * q}` });
}

/* ---------- SECUENCIAS ---------- */
function seqBox(arr, bi) {
  return '<div class="seq">' + arr.map((v, i) => `<b class="${i === bi ? 'miss' : ''}">${i === bi ? '?' : N(v)}</b>`).join('') + '</div>';
}
function seqNum(c, d) {
  let seq = [], hint = '';
  const len = 5;
  if (c === 1) {
    const steps = d < .3 ? [1, 2] : d < .6 ? [1, 2, 5, 10] : [2, 3, 5, 10, 20];
    const st = R.pick(steps), down = d > .35 && R.chance(.35);
    const start = down ? R.int(st * 5, Math.max(st * 5 + 10, 60)) : R.int(0, 30);
    for (let i = 0; i < len; i++) seq.push(down ? start - st * i : start + st * i);
    hint = `Cada número ${down ? 'baja' : 'sube'} de ${st} en ${st}`;
  } else if (c === 2) {
    const mode = d > .7 && R.chance(.3) ? 'dbl' : 'ar';
    if (mode === 'dbl') { const s = R.pick([1, 2, 3, 5]); for (let i = 0; i < len; i++) seq.push(s * 2 ** i); hint = 'Cada número es el doble del anterior'; }
    else {
      const st = R.pick(d < .4 ? [2, 3, 4, 5, 6] : [3, 4, 6, 7, 8, 9, 10, 25, 50, 100]), down = R.chance(.35);
      const start = down ? st * R.int(6, 14) : R.int(0, 5) * st + R.int(0, 3);
      for (let i = 0; i < len; i++) seq.push(down ? start - st * i : start + st * i);
      hint = `Cada número ${down ? 'baja' : 'sube'} de ${st} en ${st}`;
    }
  } else {
    const m = R.pick(d < .4 ? ['ar', 'ar', 'dec', 'geo'] : ['ar', 'dec', 'geo', 'alt', 'grow', 'sq', 'tri', 'fib']);
    if (m === 'ar') { const st = R.pick([12, 15, 25, 35, 125, 250, 1000]), s = R.int(2, 40) * 10; for (let i = 0; i < len; i++) seq.push(s + st * i); hint = `Cada número suma ${N(st)}`; }
    else if (m === 'dec') { const st = R.pick([.5, .25, 1.5, .1, 2.5]), s = R.int(1, 20) / 2; for (let i = 0; i < len; i++) seq.push(Math.round((s + st * i) * 100) / 100); hint = `Cada número suma ${D(st)}`; }
    else if (m === 'geo') { const k = R.pick([2, 3, 10]), s = R.pick([1, 2, 3, 5]); for (let i = 0; i < len; i++) seq.push(s * k ** i); hint = `Cada número se multiplica por ${k}`; }
    else if (m === 'alt') { const a = R.int(2, 9), b = R.int(1, a - 1) * -1 || -1, s = R.int(20, 60); seq = [s]; for (let i = 1; i < len + 1; i++) seq.push(seq[i - 1] + (i % 2 ? a : b)); seq = seq.slice(0, len + 1); hint = `Alterna: suma ${a}, resta ${-b}`; }
    else if (m === 'grow') { const s = R.int(1, 20), k = R.int(1, 3); seq = [s]; for (let i = 1; i < len; i++) seq.push(seq[i - 1] + k * i + k); hint = `Se suma ${k * 2}, luego ${k * 3}, luego ${k * 4}…: cada vez ${k} más`; seq = []; let v = s; for (let i = 0; i < len; i++) { seq.push(v); v += k * (i + 2); } hint = `Se suma ${k * 2}, luego ${k * 3}, luego ${k * 4}… (cada vez ${k} más)`; }
    else if (m === 'sq') { const s = R.int(1, 7); for (let i = 0; i < len; i++) seq.push((s + i) ** 2); hint = 'Son cuadrados: 1×1, 2×2, 3×3…'; }
    else if (m === 'tri') { const s = R.int(1, 4); for (let i = 0; i < len; i++) { const n = s + i; seq.push(n * (n + 1) / 2); } hint = 'Se suma 2, 3, 4, 5… cada vez uno más'; }
    else { const a = R.int(1, 5), b = R.int(2, 6); seq = [a, b]; for (let i = 2; i < len; i++) seq.push(seq[i - 1] + seq[i - 2]); hint = 'Cada número es la suma de los dos anteriores'; }
  }
  const bi = R.int(1, seq.length - 1), ans = seq[bi];
  const wrong = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans * 2, Math.round(ans / 2)].filter(v => v >= 0 && v !== ans && !seq.includes(v));
  const stepEst = Math.abs((seq[1] - seq[0]) || 1);
  wrong.push(ans + stepEst, ans - stepEst, ans + 2 * stepEst);
  return build({ cat: 'secuencias', text: '¿Qué número falta en la secuencia?', visual: seqBox(seq, bi), correct: N(ans), wrong: wrong.filter(v => v >= 0 && v !== ans).map(N), hint, key: 'seq|' + seq.join(',') + '|' + bi });
}
function seqShape(c, d) {
  let tokens, len = 7;
  const shapes = R.shuffle(TSHAPES), cols = R.shuffle(TCOL);
  const T = (i, j) => [shapes[i % shapes.length], cols[j % cols.length]];
  let pat, hint;
  if (c <= 2) {
    const opts = c === 1 ? (d < .4 ? ['AB', 'AAB'] : ['AB', 'AAB', 'ABB', 'ABC']) : (d < .4 ? ['ABC', 'AABC', 'ABB'] : ['ABC', 'AABC', 'ABAC', 'ABCD', 'AABB']);
    pat = R.pick(opts);
    const letters = [...new Set(pat)]; const map = {}; letters.forEach((l, i) => map[l] = T(i, i));
    const units = pat.split('').map(l => map[l]);
    tokens = []; for (let i = 0; i < len + 1; i++) tokens.push(units[i % units.length]);
    hint = `El patrón se repite: ` + units.map(t => tok(t[0], t[1])).join('') + ` y vuelve a empezar`;
  } else {
    const p1 = R.pick([2, 3]), p2 = p1 === 2 ? 3 : R.pick([2, 4]);
    tokens = []; for (let i = 0; i < 9; i++) tokens.push(T(i % p1, (i % p2) + 1));
    hint = `Las formas se repiten cada ${p1} y los colores cada ${p2}`;
  }
  const shown = tokens.slice(0, tokens.length - 1), ans = tokens[tokens.length - 1];
  const key = t => t[0] + t[1];
  const poolW = [];
  tokens.forEach(t => { if (key(t) !== key(ans)) poolW.push(t); });
  if (c === 3) { poolW.push([ans[0], R.pick(cols.filter(x => x !== ans[1]))], [R.pick(shapes.filter(x => x !== ans[0])), ans[1]]); }
  poolW.push([R.pick(shapes), R.pick(cols)]);
  const row = '<div class="seq tokens">' + shown.map(t => tok(t[0], t[1])).join('') + `<span class="tok q">?</span></div>`;
  return build({ cat: 'secuencias', text: '¿Qué figura sigue?', visual: row, correct: tok(ans[0], ans[1]), wrong: poolW.filter(t => key(t) !== key(ans)).map(t => tok(t[0], t[1])), hint, key: 'sq|' + tokens.map(key).join(''), big: true });
}
function secuencias(c, d) {
  if (R.chance(c === 1 ? .25 : .35)) { const q = algoritmo(c, d); if (q) return q; }
  const pv = c === 1 ? .5 : c === 2 ? .3 : .2;
  return R.chance(pv) ? seqShape(c, d) : seqNum(c, d);
}

/* ---------- COMPARAR ---------- */
function compRange(c, d) { return c === 1 ? (d < .3 ? 20 : d < .65 ? 100 : 999) : c === 2 ? R.lerp(d, 999, 9999) : R.lerp(d, 9999, 999999); }
function opExpr(c, d) {
  let t, v;
  const k = R.pick(c === 1 ? ['+', '−'] : ['+', '−', '×']);
  if (k === '+') { const a = R.int(2, c === 1 ? 30 : 60), b = R.int(2, c === 1 ? 30 : 60); t = `${a} + ${b}`; v = a + b; }
  else if (k === '−') { const a = R.int(10, c === 1 ? 60 : 99), b = R.int(1, a - 1); t = `${a} − ${b}`; v = a - b; }
  else { const a = R.int(2, 10), b = R.int(2, c === 2 ? 10 : 12); t = `${a} × ${b}`; v = a * b; }
  return { t, v };
}
function comparar(c, d) {
  const form = R.pick(c === 1 ? (d < .4 ? ['max', 'min', 'sym'] : ['max', 'min', 'sym', 'ops']) : ['max', 'min', 'sym', 'ops', 'dec']);
  const mx = compRange(c, d);
  if (form === 'dec' && c < 3) return comparar(c, d);
  if (form === 'max' || form === 'min') {
    const isMax = form === 'max'; const set = new Set();
    let tries = 0; while (set.size < 4 && tries++ < 50) set.add(R.int(c === 1 ? 0 : Math.floor(mx / 20), mx));
    if (c >= 2 && d > .5) { // cifras parecidas
      const base = R.int(Math.floor(mx / 10), mx), digs = String(base).split(''); set.clear(); set.add(base);
      let t2 = 0; while (set.size < 4 && t2++ < 80) { const dd = digs.slice(); const i = R.int(0, dd.length - 1), j = R.int(0, dd.length - 1); [dd[i], dd[j]] = [dd[j], dd[i]]; const v = +dd.join(''); if (String(v).length === String(base).length) set.add(v); }
      let t3 = 0; while (set.size < 4 && t3++ < 50) set.add(base + R.int(-90, 90));
    }
    const arr = [...set]; if (arr.length < 4) return null;
    const ans = isMax ? Math.max(...arr) : Math.min(...arr);
    return build({ cat: 'comparar', text: `¿Cuál es el número ${isMax ? 'MAYOR' : 'MENOR'}?`, correct: N(ans), wrong: arr.filter(v => v !== ans).map(N), hint: `Compara cifra a cifra desde la izquierda. ${isMax ? 'Mayor' : 'Menor'}: ${N(ans)}`, key: 'cmp|' + form + arr.sort().join(',') });
  }
  if (form === 'dec') {
    const isMax = R.chance(.5); const set = new Set(); const w = R.int(1, 9);
    while (set.size < 4) set.add(Math.round((w + R.int(0, 99) / 100) * 100) / 100);
    const arr = [...set]; const ans = isMax ? Math.max(...arr) : Math.min(...arr);
    return build({ cat: 'comparar', text: `¿Cuál es el número decimal ${isMax ? 'MAYOR' : 'MENOR'}?`, correct: D(ans), wrong: arr.filter(v => v !== ans).map(D), hint: 'Compara primero la parte entera y luego décimas y centésimas', key: 'dec|' + arr.sort().join(',') });
  }
  if (form === 'ops') {
    const isMax = R.chance(.5); const ex = []; let t = 0;
    while (ex.length < 4 && t++ < 60) { const e = opExpr(c, d); if (!ex.some(x => x.v === e.v || x.t === e.t)) ex.push(e); }
    if (ex.length < 4) return null;
    const best = ex.reduce((a, b) => (isMax ? b.v > a.v : b.v < a.v) ? b : a);
    return build({ cat: 'comparar', text: `¿Qué operación da el resultado ${isMax ? 'MAYOR' : 'MENOR'}?`, correct: best.t, wrong: ex.filter(e => e !== best).map(e => e.t), hint: ex.map(e => `${e.t} = ${e.v}`).join(' · '), key: 'ops|' + ex.map(e => e.t).sort().join(',') });
  }
  // sym
  let L, Rr, lv, rv;
  const rel = R.pick(['<', '>', '=']);
  if (d > .45 && R.chance(.5)) {
    const e = opExpr(c, d); L = e.t; lv = e.v;
    if (rel === '=') { rv = lv; Rr = N(lv); }
    else if (rel === '<') { rv = lv + R.int(1, 9); Rr = N(rv); }
    else { if (lv < 2) return null; rv = lv - R.int(1, Math.min(9, lv - 1)); Rr = N(rv); }
  } else {
    lv = R.int(c === 1 ? 0 : Math.floor(mx / 20), mx); L = N(lv);
    if (rel === '=') { if (lv < 4) return null; rv = lv; Rr = R.chance(.5) ? `${N(lv - 1)} + 1` : N(lv); if (Rr === L) { Rr = `${N(lv - 1)} + 1`; } }
    else { let delta = R.int(1, Math.max(2, Math.floor(c === 1 ? 6 : mx / 10))); delta = Math.min(delta, Math.max(1, Math.floor(lv / 2))); rv = rel === '<' ? lv + delta : Math.max(0, lv - delta); if (rv === lv) return null; Rr = N(rv); }
  }
  const real = lv < rv ? '<' : lv > rv ? '>' : '=';
  return build({ cat: 'comparar', text: `${L} ${BLANK} ${Rr}`, correct: real, wrong: ['<', '>', '='].filter(x => x !== real), n: 3, order: ['<', '=', '>'], hint: `${N(lv)} ${real} ${N(rv)}`, big: true, key: 'sym|' + L + '|' + Rr });
}

/* ---------- FRACCIONES ---------- */
function pie(n, k, col) {
  col = col || '#ff3d9a'; let s = '';
  for (let i = 0; i < n; i++) {
    const a1 = (-90 + 360 * i / n) * Math.PI / 180, a2 = (-90 + 360 * (i + 1) / n) * Math.PI / 180;
    const x1 = 60 + 50 * Math.cos(a1), y1 = 60 + 50 * Math.sin(a1), x2 = 60 + 50 * Math.cos(a2), y2 = 60 + 50 * Math.sin(a2);
    s += `<path d="M60 60 L${x1.toFixed(1)} ${y1.toFixed(1)} A50 50 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${i < k ? col : '#fff'}" ${ST} stroke-width="2.5"/>`;
  }
  if (n === 1) s = `<circle cx="60" cy="60" r="50" fill="${k ? col : '#fff'}" ${ST}/>`;
  return svg('0 0 120 120', s, 'fig');
}
function bar(n, k, col) {
  col = col || '#2de2ff'; let s = ''; const w = 200 / n;
  for (let i = 0; i < n; i++) s += `<rect x="${5 + i * w}" y="14" width="${w}" height="42" fill="${i < k ? col : '#fff'}" ${ST} stroke-width="2.5"/>`;
  return svg('0 0 210 70', s, 'fig wide');
}
function dots(n, k, col) {
  col = col || '#ffd23f'; const cols = Math.min(n, n > 8 ? 6 : 4), rows = Math.ceil(n / cols); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${16 + (i % cols) * 28}" cy="${16 + Math.floor(i / cols) * 28}" r="11" fill="${i < k ? col : '#fff'}" ${ST} stroke-width="2.5"/>`;
  return svg(`0 0 ${cols * 28 + 4} ${rows * 28 + 4}`, s, 'fig wide');
}
function fracciones(c, d) {
  const dens = c === 2 ? (d < .4 ? [2, 3, 4] : [2, 3, 4, 5, 6, 8, 10]) : [2, 3, 4, 5, 6, 8, 10, 12];
  const form = c === 2 ? R.pick(['read', 'read', 'read', 'of', 'of', d > .55 ? 'equiv' : 'cmp1', 'cmp1']) : R.pick(['read', 'of', 'of', 'equiv', 'add', 'sub', 'dec', 'cmpv', 'pct', 'simp']);
  if (form === 'read') {
    const n = R.pick(dens), k = R.int(1, n - 1), v = R.pick([pie, pie, bar, dots]);
    const vis = v === dots ? dots(n, k) : v(n, k);
    const comp = F(n - k, n);
    return build({ cat: 'fracciones', text: '¿Qué fracción está pintada?', visual: vis, correct: F(k, n), wrong: [comp, F(k, n + 1), F(k + 1, n), F(k, n - 1 > 1 ? n - 1 : n + 2), F(n, k), F(k - 1 > 0 ? k - 1 : k + 2, n)], hint: `Hay ${n} partes iguales y ${k} están pintadas: ${k}/${n}`, big: true, key: 'frr|' + n + k + (v === pie ? 'p' : v === bar ? 'b' : 'd') });
  }
  if (form === 'of') {
    const q = R.pick(c === 2 ? (d < .5 ? [2, 3, 4] : [2, 3, 4, 5, 10]) : [2, 3, 4, 5, 6, 8, 10]);
    const k = c === 2 ? 1 : R.int(1, q - 1), unit = R.int(2, c === 2 ? 10 : 12), tot = q * unit, ans = unit * k;
    return build({ cat: 'fracciones', text: `¿Cuánto es ${F(k, q)} de ${tot}?`, correct: N(ans), wrong: numWrong(ans, [tot - ans, unit, tot / 2, tot - unit]), hint: `Divide entre ${q}: ${tot} ÷ ${q} = ${unit}${k > 1 ? `; multiplica por ${k}: ${ans}` : ''}`, key: 'fof|' + k + q + tot });
  }
  if (form === 'cmp1') {
    const a = R.pick([2, 3, 4, 5, 6, 8]), b = R.pick([2, 3, 4, 5, 6, 8].filter(x => x !== a));
    const big = a < b ? a : b; // 1/menor denominador es mayor
    return build({ cat: 'fracciones', text: '¿Qué fracción es MAYOR?', visual: `<div class="duo">${pie(a, 1)}${pie(b, 1)}</div>`, correct: F(1, big), wrong: [F(1, big === a ? b : a)], n: 2, min: 2, order: [F(1, a), F(1, b)], hint: `Cuantas más partes, más pequeñas: 1/${big} es mayor que 1/${big === a ? b : a}`, key: 'fc1|' + a + b });
  }
  if (form === 'equiv') {
    const base = R.pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [2, 5]]), m = R.int(2, c === 2 ? 4 : 6), n2 = base[1] * m, k2 = base[0] * m;
    return build({ cat: 'fracciones', text: `${F(base[0], base[1])} = ${F(BLANK, n2)}`, correct: N(k2), wrong: numWrong(k2, [base[0] + m, k2 + 1]), hint: `Multiplica arriba y abajo por ${m}: ${base[0]}×${m} = ${k2}`, key: 'feq|' + base + m });
  }
  if (form === 'simp') {
    const base = R.pick([[1, 2], [1, 3], [3, 4], [2, 3], [2, 5], [3, 5], [1, 4]]), m = R.int(2, 5);
    const ok = F(base[0], base[1]);
    return build({ cat: 'fracciones', text: `Simplifica ${F(base[0] * m, base[1] * m)}`, correct: ok, wrong: [F(base[0] * m, base[1]), F(base[0], base[1] * m), F(base[1], base[0]), F(base[0] + 1, base[1] + 1)], hint: `Divide arriba y abajo entre ${m}: ${base[0]}/${base[1]}`, key: 'fsi|' + base + m, big: true });
  }
  if (form === 'add' || form === 'sub') {
    const n = R.pick([5, 6, 7, 8, 9, 10, 12]); let a = R.int(1, n - 2), b = R.int(1, n - a - 1 || 1);
    if (form === 'sub') { a = R.int(2, n - 1); b = R.int(1, a - 1); }
    const r = form === 'add' ? a + b : a - b;
    return build({ cat: 'fracciones', text: `${F(a, n)} ${form === 'add' ? '+' : '−'} ${F(b, n)} = ?`, correct: F(r, n), wrong: [F(r, n * 2), F(r + 1, n), F(r > 1 ? r - 1 : r + 2, n), F(r, n + n), F(a + b + (form === 'sub' ? 2 : 0), n + n)], hint: `Mismo denominador: ${form === 'add' ? 'sumas' : 'restas'} los numeradores: ${a} ${form === 'add' ? '+' : '−'} ${b} = ${r}`, big: true, key: 'fas|' + form + a + b + n });
  }
  if (form === 'dec') {
    const t = R.pick([[1, 2, '0,5'], [1, 4, '0,25'], [3, 4, '0,75'], [1, 5, '0,2'], [2, 5, '0,4'], [1, 10, '0,1'], [3, 10, '0,3'], [7, 10, '0,7'], [3, 5, '0,6']]);
    return build({ cat: 'fracciones', text: `¿Qué decimal es ${F(t[0], t[1])}?`, correct: t[2], wrong: ['0,5', '0,25', '0,75', '0,2', '0,4', '0,1', '0,3', '0,7', '0,6', '1,2'].filter(x => x !== t[2]), hint: `${t[0]} ÷ ${t[1]} = ${t[2]}`, key: 'fde|' + t });
  }
  if (form === 'pct') {
    const p = R.pick([[50, 2], [25, 4], [10, 10], [20, 5], [75, 4]]), unit = R.int(2, 20), tot = unit * p[1] * (p[0] === 75 ? 1 : 1), ans = p[0] === 75 ? unit * 3 : tot / p[1];
    return build({ cat: 'fracciones', text: `¿Cuánto es el ${p[0]} % de ${tot}?`, correct: N(ans), wrong: numWrong(ans, [tot - ans, tot / 2]), hint: `${p[0]} % equivale a ${p[0] === 50 ? '1/2' : p[0] === 25 ? '1/4' : p[0] === 10 ? '1/10' : p[0] === 20 ? '1/5' : '3/4'}`, key: 'fpc|' + p + tot });
  }
  // cmpv: dos pies distintos denominadores
  const a = R.pick([[1, 2], [2, 3], [3, 4], [3, 5], [2, 5], [5, 6], [3, 8], [7, 10]]), b = R.pick([[1, 2], [2, 3], [3, 4], [3, 5], [2, 5], [5, 6], [3, 8], [7, 10]]);
  if (a[0] * b[1] === b[0] * a[1]) return null;
  const left = a[0] * b[1] > b[0] * a[1];
  return build({ cat: 'fracciones', text: '¿Cuál es MAYOR?', visual: `<div class="duo">${pie(a[1], a[0], '#ff3d9a')}${pie(b[1], b[0], '#2de2ff')}</div>`, correct: F(...(left ? a : b)), wrong: [F(...(left ? b : a))], n: 2, min: 2, order: [F(...a), F(...b)], hint: `${a[0]}/${a[1]} = ${(a[0] / a[1]).toFixed(2).replace('.', ',')} y ${b[0]}/${b[1]} = ${(b[0] / b[1]).toFixed(2).replace('.', ',')}`, key: 'fcv|' + a + b, big: true });
}

/* ---------- GEOMETRÍA ---------- */
const POLYNAMES = { 3: 'triángulo', 4: 'cuadrilátero', 5: 'pentágono', 6: 'hexágono', 7: 'heptágono', 8: 'octógono', 9: 'eneágono', 10: 'decágono' };
function angleSvg(deg) {
  const ox = 28, oy = 92, L = 78, rad = deg * Math.PI / 180, ex = ox + L * Math.cos(rad), ey = oy - L * Math.sin(rad);
  const ar = 22, ax = ox + ar * Math.cos(rad), ay = oy - ar * Math.sin(rad);
  let mark = deg === 90 ? `<path d="M${ox + 16} ${oy} V${oy - 16} H${ox}" fill="none" stroke="#ffd23f" stroke-width="3"/>` : `<path d="M${ox + ar} ${oy} A${ar} ${ar} 0 ${deg > 180 ? 1 : 0} 0 ${ax.toFixed(1)} ${ay.toFixed(1)}" fill="none" stroke="#ffd23f" stroke-width="3"/>`;
  return svg('0 0 120 110', `<line x1="${ox}" y1="${oy}" x2="${ox + L + 10}" y2="${oy}" ${STW}/><line x1="${ox}" y1="${oy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" ${STW}/>${mark}<circle cx="${ox}" cy="${oy}" r="4" fill="#ff3d9a"/>`, 'fig');
}
function geometria(c, d) {
  if (R.chance(.35)) { const q = espacial(c, d); if (q) return q; }
  if (c === 1) {
    const form = R.pick(['name2d', 'name2d', 'sides', 'name3d', 'real', 'find2d', 'find3d']);
    const n2 = ['círculo', 'cuadrado', 'triángulo', 'rectángulo'], k2 = ['circulo', 'cuadrado', 'triangulo', 'rectangulo'];
    const n3 = ['esfera', 'cubo', 'cono', 'cilindro'];
    if (form === 'name2d') { const i = R.int(0, 3); return build({ cat: 'geometria', text: '¿Cómo se llama esta figura?', visual: shape2d(k2[i]), correct: n2[i], wrong: n2.filter((_, j) => j !== i), hint: `Es un ${n2[i]}`, key: 'g1n|' + i + Math.random(), big: false }); }
    if (form === 'sides') { const i = R.int(0, 3), lados = [0, 4, 3, 4][i]; return build({ cat: 'geometria', text: '¿Cuántos lados tiene?', visual: shape2d(k2[i]), correct: String(lados), wrong: ['0', '1', '2', '3', '4', '5'], hint: `El ${n2[i]} ${lados ? 'tiene ' + lados + ' lados' : 'no tiene lados rectos'}`, key: 'g1s|' + i + Math.random() }); }
    if (form === 'name3d') { const i = R.int(0, 3); return build({ cat: 'geometria', text: '¿Qué cuerpo geométrico es?', visual: solid(n3[i]), correct: n3[i], wrong: n3.filter((_, j) => j !== i), hint: `Es ${i === 1 ? 'un' : i === 0 ? 'una' : 'un'} ${n3[i]}`, key: 'g1c|' + i + Math.random() }); }
    if (form === 'real') { const t = R.pick([['una pelota', 'esfera'], ['un dado', 'cubo'], ['un cucurucho de helado', 'cono'], ['una lata de atún', 'cilindro'], ['una caja de zapatos', 'cubo'], ['un gorro de cumpleaños', 'cono']]); return build({ cat: 'geometria', text: `¿Qué cuerpo geométrico se parece a ${t[0]}?`, correct: t[1], wrong: n3.filter(x => x !== t[1]), hint: `${t[0]} se parece a ${t[1] === 'esfera' ? 'una' : 'un'} ${t[1]}`, key: 'g1r|' + t[0] }); }
    if (form === 'find2d') { const i = R.int(0, 3), cols = R.shuffle(TCOL); return build({ cat: 'geometria', text: `Busca el ${n2[i].toUpperCase()}`, correct: shape2d(k2[i], cols[0]), wrong: k2.filter((_, j) => j !== i).map((k, j) => shape2d(k, cols[j + 1])), hint: `El ${n2[i]} es la figura correcta`, big: true, key: 'g1f|' + i + Math.random() }); }
    const i = R.int(0, 3); return build({ cat: 'geometria', text: `Busca ${i === 0 ? 'la' : 'el'} ${n3[i].toUpperCase()}`, correct: solid(n3[i]), wrong: n3.filter((_, j) => j !== i).map(solid), hint: `${i === 0 ? 'La' : 'El'} ${n3[i]} es la correcta`, big: true, key: 'g1f3|' + i + Math.random() });
  }
  if (c === 2) {
    const form = R.pick(['poly', 'poly', 'sides', 'verts', 'faces', 'right', 'par']);
    const maxN = d < .5 ? 6 : 8;
    if (form === 'poly') { const n = R.int(3, maxN); return build({ cat: 'geometria', text: '¿Cómo se llama este polígono?', visual: polyFig(n), correct: POLYNAMES[n], wrong: [3, 4, 5, 6, 7, 8].filter(x => x !== n).map(x => POLYNAMES[x]), hint: `${n} lados → ${POLYNAMES[n]}`, key: 'g2p|' + n + Math.random() }); }
    if (form === 'sides' || form === 'verts') { const n = R.int(3, maxN), w = form === 'sides' ? 'lados' : 'vértices'; return build({ cat: 'geometria', text: `¿Cuántos ${w} tiene este polígono?`, visual: polyFig(n), correct: String(n), wrong: numWrong(n).filter(x => +x >= 3), hint: `Un ${POLYNAMES[n]} tiene ${n} ${w}`, key: 'g2s|' + form + n + Math.random() }); }
    if (form === 'faces') {
      const t = R.pick([['cubo', 'cubo', 6, 'caras'], ['cubo', 'cubo', 8, 'vértices'], ['cubo', 'cubo', 12, 'aristas'], ['piramide', 'pirámide de base cuadrada', 5, 'caras'], ['piramide', 'pirámide de base cuadrada', 5, 'vértices'], ['piramide', 'pirámide de base cuadrada', 8, 'aristas']]);
      return build({ cat: 'geometria', text: `¿Cuántas ${t[3]} tiene ${t[0] === 'cubo' ? 'un' : 'una'} ${t[1]}?`.replace('Cuántas vértices', 'Cuántos vértices').replace('Cuántas aristas', 'Cuántas aristas'), visual: solid(t[0]), correct: String(t[2]), wrong: [4, 5, 6, 7, 8, 9, 10, 12].map(String), hint: `${t[1][0].toUpperCase() + t[1].slice(1)}: ${t[2]} ${t[3]}`, key: 'g2f|' + t });
    }
    if (form === 'right') {
      const t = R.pick([['cuadrado', 4], ['rectángulo', 4], ['triángulo equilátero', 0], ['rombo (no cuadrado)', 0]]);
      return build({ cat: 'geometria', text: `¿Cuántos ángulos rectos tiene un ${t[0]}?`, correct: String(t[1]), wrong: ['0', '1', '2', '3', '4'], hint: `Un ${t[0]} tiene ${t[1]} ángulos rectos`, key: 'g2r|' + t });
    }
    const t = R.pick([['rectángulo', 2], ['cuadrado', 2], ['hexágono regular', 3], ['triángulo', 0]]);
    return build({ cat: 'geometria', text: `¿Cuántos pares de lados paralelos tiene un ${t[0]}?`, correct: String(t[1]), wrong: ['0', '1', '2', '3', '4'], hint: `El ${t[0]} tiene ${t[1]} pares de lados paralelos`, key: 'g2l|' + t });
  }
  // ciclo 3
  const form = R.pick(['angle', 'angle', 'tri', 'trisum', 'poly', 'circle', 'perim', 'solid']);
  if (form === 'angle') {
    const deg = R.pick([30, 45, 60, 75, 90, 90, 110, 120, 135, 150, 180]), type = deg < 90 ? 'agudo' : deg === 90 ? 'recto' : deg < 180 ? 'obtuso' : 'llano';
    return build({ cat: 'geometria', text: `Este ángulo mide ${deg}°. ¿Qué tipo de ángulo es?`, visual: deg === 180 ? svg('0 0 120 110', `<line x1="14" y1="80" x2="106" y2="80" ${STW}/><circle cx="60" cy="80" r="4" fill="#ff3d9a"/>`, 'fig') : angleSvg(deg), correct: type, wrong: ['agudo', 'recto', 'obtuso', 'llano'].filter(x => x !== type), hint: `Agudo < 90°, recto = 90°, obtuso entre 90° y 180°, llano = 180°`, key: 'g3a|' + deg });
  }
  if (form === 'tri') {
    const t = R.pick(['equilátero', 'isósceles', 'escaleno']), a = R.int(3, 12);
    const sides = t === 'equilátero' ? [a, a, a] : t === 'isósceles' ? [a, a, a + R.int(1, 4)] : [a, a + 1 + R.int(0, 2), a + 4 + R.int(0, 3)];
    const pts = t === 'equilátero' ? '60,14 104,92 16,92' : t === 'isósceles' ? '60,10 90,96 30,96' : '22,96 100,96 70,18';
    const v = svg('0 0 120 110', `<polygon points="${pts}" fill="#b6ff3b" ${ST}/>`, 'fig') ;
    return build({ cat: 'geometria', text: `Un triángulo tiene lados de ${sides[0]} cm, ${sides[1]} cm y ${sides[2]} cm. ¿Cómo es?`, visual: v, correct: t, wrong: ['equilátero', 'isósceles', 'escaleno'].filter(x => x !== t), n: 3, hint: `Equilátero: 3 lados iguales · Isósceles: 2 iguales · Escaleno: ninguno igual`, key: 'g3t|' + sides + Math.random() });
  }
  if (form === 'trisum') {
    const a = R.int(30, 80), b = R.int(30, 80), ans = 180 - a - b;
    return build({ cat: 'geometria', text: `Un triángulo tiene ángulos de ${a}° y ${b}°. ¿Cuánto mide el tercero?`, correct: ans + '°', wrong: [ans + 10, ans - 10, 180 - a, 360 - a - b, ans + 5, ans - 5].filter(x => x > 0).map(x => x + '°'), hint: `Los ángulos de un triángulo suman 180°: 180 − ${a} − ${b} = ${ans}`, key: 'g3s|' + a + b });
  }
  if (form === 'poly') { const n = R.int(5, 10); return build({ cat: 'geometria', text: `¿Cómo se llama un polígono de ${n} lados?`, visual: polyFig(n), correct: POLYNAMES[n], wrong: [5, 6, 7, 8, 9, 10].filter(x => x !== n).map(x => POLYNAMES[x]), hint: `${n} lados → ${POLYNAMES[n]}`, key: 'g3p|' + n + Math.random() }); }
  if (form === 'circle') {
    const r = R.int(2, 25), toD = R.chance(.5), v = svg('0 0 120 120', `<circle cx="60" cy="60" r="46" fill="#2de2ff" ${ST}/><line x1="60" y1="60" x2="106" y2="60" ${STW}/><circle cx="60" cy="60" r="4" fill="#ff3d9a"/>`, 'fig');
    return build({ cat: 'geometria', text: toD ? `El radio de un círculo mide ${r} cm. ¿Cuánto mide su diámetro?` : `El diámetro mide ${2 * r} cm. ¿Cuánto mide el radio?`, visual: v, correct: (toD ? 2 * r : r) + ' cm', wrong: [r, 2 * r, 4 * r, r + 2, r * r, r / 2 | 0].filter(x => x > 0 && x !== (toD ? 2 * r : r)).map(x => x + ' cm'), hint: 'Diámetro = 2 × radio', key: 'g3c|' + r + toD });
  }
  if (form === 'perim') {
    const n = R.pick([3, 4, 5, 6, 8]), l = R.int(2, 15), p = n * l;
    return build({ cat: 'geometria', text: `Un ${POLYNAMES[n]} regular tiene lados de ${l} cm. ¿Cuál es su perímetro?`, visual: polyFig(n), correct: p + ' cm', wrong: [p + l, p - l, l * l, p + 2, l + n, 2 * p].filter(x => x > 0 && x !== p).map(x => x + ' cm'), hint: `Perímetro = ${n} lados × ${l} cm = ${p} cm`, key: 'g3pe|' + n + l });
  }
  const t = R.pick([['prisma triangular', 5, 'caras'], ['prisma triangular', 6, 'vértices'], ['prisma triangular', 9, 'aristas'], ['pirámide triangular', 4, 'caras'], ['pirámide triangular', 6, 'aristas'], ['prisma rectangular', 6, 'caras'], ['prisma rectangular', 8, 'vértices'], ['prisma rectangular', 12, 'aristas']]);
  return build({ cat: 'geometria', text: `¿Cuántas ${t[2]} tiene un${t[0].startsWith('pirámide') ? 'a' : ''} ${t[0]}?`.replace('Cuántas vértices', 'Cuántos vértices'), correct: String(t[1]), wrong: ['4', '5', '6', '7', '8', '9', '10', '12'], hint: `${t[0][0].toUpperCase() + t[0].slice(1)}: ${t[1]} ${t[2]}`, key: 'g3s2|' + t });
}

/* ---------- ÁREAS ---------- */
function cellsSvg(cols, rows, shaded, col, labels) {
  const s = 24, pad = 22; let o = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const on = shaded(r, c);
    o += `<rect x="${pad + c * s}" y="${pad + r * s}" width="${s}" height="${s}" fill="${on ? col : '#fff'}" ${ST} stroke-width="2" stroke="${on ? INK : '#8a7fb8'}"/>`;
  }
  if (labels) o += `<text x="${pad + cols * s / 2}" y="14" text-anchor="middle" class="dim">${labels[0]}</text><text x="${pad + cols * s + 6}" y="${pad + rows * s / 2 + 5}" class="dim">${labels[1]}</text>`;
  return svg(`0 0 ${pad * 2 + cols * s + (labels ? 24 : 0)} ${pad * 2 + rows * s}`, o, 'fig grid');
}
function areas(c, d) {
  if (c === 1) {
    if (d > .5 && R.chance(.4)) {
      const cols = 4, rows = 3, mk = k => { const set = new Set(); while (set.size < k) set.add(R.int(0, rows * cols - 1)); return set; };
      const ka = R.int(3, 9); let kb = R.int(3, 9); const A = mk(ka), B = mk(kb);
      const v = `<div class="duo">${cellsSvg(cols, rows, (r, c0) => A.has(r * cols + c0), '#ff3d9a')}${cellsSvg(cols, rows, (r, c0) => B.has(r * cols + c0), '#2de2ff')}</div>`;
      const real = ka > kb ? 'La rosa' : ka < kb ? 'La azul' : 'Igual';
      return build({ cat: 'areas', text: '¿Qué figura tiene MÁS cuadraditos pintados?', visual: v, correct: real, wrong: ['La rosa', 'La azul', 'Igual'].filter(x => x !== real), n: 3, order: ['La rosa', 'Igual', 'La azul'], hint: `Rosa (izquierda): ${ka} cuadraditos · Azul (derecha): ${kb} cuadraditos`, key: 'a1c|' + [...A] + '|' + [...B], big: true });
    }
    const cols = R.int(3, d < .4 ? 4 : 6), rows = R.int(2, d < .4 ? 3 : 4), k = R.int(3, Math.min(rows * cols - 1, Math.round(5 + d * 9)));
    const set = new Set(); while (set.size < k) set.add(R.int(0, rows * cols - 1));
    return build({ cat: 'areas', text: '¿Cuántos cuadraditos están pintados?', visual: cellsSvg(cols, rows, (r, c0) => set.has(r * cols + c0), R.pick(TCOL)), correct: String(k), wrong: numWrong(k), hint: `Cuenta uno a uno: hay ${k} cuadraditos pintados`, key: 'a1|' + cols + rows + [...set] });
  }
  if (c === 2) {
    const form = R.pick(d < .4 ? ['rect', 'rect', 'count'] : ['rect', 'L', 'perim', 'dims', 'count']);
    if (form === 'rect') { const w = R.int(2, d < .5 ? 6 : 9), h = R.int(2, d < .5 ? 5 : 7); return build({ cat: 'areas', text: 'Cada cuadrito mide 1 cm². ¿Cuál es el área?', visual: cellsSvg(w, h, () => true, R.pick(TCOL), [w + ' cm', h + ' cm']), correct: (w * h) + ' cm²', wrong: [w * h + w, w * h - w, w + h, 2 * (w + h), w * h + h, w * h - h].filter(x => x > 0 && x !== w * h).map(x => x + ' cm²'), hint: `Área = ${w} × ${h} = ${w * h} cm²`, key: 'a2r|' + w + h }); }
    if (form === 'count') { const cols = R.int(4, 8), rows = R.int(3, 5), k = R.int(5, Math.min(rows * cols - 2, 16)); const set = new Set(); while (set.size < k) set.add(R.int(0, rows * cols - 1)); return build({ cat: 'areas', text: 'Cada cuadrito mide 1 cm². ¿Qué área tiene la parte pintada?', visual: cellsSvg(cols, rows, (r, c0) => set.has(r * cols + c0), R.pick(TCOL)), correct: k + ' cm²', wrong: numWrong(k).map(x => x + ' cm²'), hint: `Cuenta los cuadritos pintados: ${k} cm²`, key: 'a2c|' + cols + rows + [...set] }); }
    if (form === 'L') { const W = R.int(4, 7), H = R.int(4, 6), cw = R.int(1, W - 2), ch = R.int(1, H - 2), area = W * H - cw * ch; return build({ cat: 'areas', text: 'Cada cuadrito mide 1 cm². ¿Qué área tiene la figura pintada?', visual: cellsSvg(W, H, (r, c0) => !(r < ch && c0 >= W - cw), R.pick(TCOL)), correct: area + ' cm²', wrong: [W * H, area + cw, area - ch, area + 2, area - 2, W + H].filter(x => x > 0 && x !== area).map(x => x + ' cm²'), hint: `Rectángulo grande ${W}×${H} = ${W * H}; quitas ${cw}×${ch} = ${cw * ch}; queda ${area} cm²`, key: 'a2L|' + W + H + cw + ch }); }
    if (form === 'perim') { const w = R.int(2, 8), h = R.int(2, 6), p = 2 * (w + h); return build({ cat: 'areas', text: 'Cada cuadrito mide 1 cm de lado. ¿Cuál es el PERÍMETRO?', visual: cellsSvg(w, h, () => true, R.pick(TCOL), [w + ' cm', h + ' cm']), correct: p + ' cm', wrong: [w * h, w + h, p + 2, p - 2, p + 4].filter(x => x > 0 && x !== p).map(x => x + ' cm'), hint: `Perímetro = ${w} + ${h} + ${w} + ${h} = ${p} cm`, key: 'a2p|' + w + h }); }
    const w = R.int(3, 12), h = R.int(2, 9); return build({ cat: 'areas', text: `Un rectángulo mide ${w} cm de largo y ${h} cm de ancho. ¿Cuál es su área?`, correct: (w * h) + ' cm²', wrong: [w * h + w, w * h - h, w + h, 2 * (w + h), w * h + 10].filter(x => x > 0 && x !== w * h).map(x => x + ' cm²'), hint: `Área = largo × ancho = ${w} × ${h} = ${w * h} cm²`, key: 'a2d|' + w + h });
  }
  const form = R.pick(d < .35 ? ['rect', 'square', 'perim'] : ['rect', 'square', 'tri', 'para', 'L', 'miss', 'tri']);
  const u = R.pick(['cm', 'm']);
  if (form === 'rect') {
    const l = R.int(4, 25), w = R.int(3, 15), v = svg('0 0 200 120', `<rect x="25" y="25" width="140" height="70" fill="#2de2ff" ${ST}/><text x="95" y="18" text-anchor="middle" class="dim">${l} ${u}</text><text x="172" y="64" class="dim">${w} ${u}</text>`, 'fig wide');
    return build({ cat: 'areas', text: '¿Cuál es el área de este rectángulo?', visual: v, correct: `${l * w} ${u}²`, wrong: [l * w + l, l * w - w, 2 * (l + w), l + w, l * w + 10, l * w - 10].filter(x => x > 0 && x !== l * w).map(x => x + ' ' + u + '²'), hint: `Área = base × altura = ${l} × ${w} = ${l * w} ${u}²`, key: 'a3r|' + l + w + u });
  }
  if (form === 'square') {
    const l = R.int(3, 16), v = svg('0 0 140 130', `<rect x="25" y="25" width="85" height="85" fill="#b6ff3b" ${ST}/><text x="67" y="18" text-anchor="middle" class="dim">${l} ${u}</text>`, 'fig');
    return build({ cat: 'areas', text: '¿Cuál es el área de este cuadrado?', visual: v, correct: `${l * l} ${u}²`, wrong: [4 * l, 2 * l, l * l + l, l * l - l, l * 3].filter(x => x > 0 && x !== l * l).map(x => x + ' ' + u + '²'), hint: `Área = lado × lado = ${l} × ${l} = ${l * l} ${u}²`, key: 'a3s|' + l + u });
  }
  if (form === 'perim') {
    const l = R.int(4, 25), w = R.int(3, 15), p = 2 * (l + w), v = svg('0 0 200 120', `<rect x="25" y="25" width="140" height="70" fill="#ffd23f" ${ST}/><text x="95" y="18" text-anchor="middle" class="dim">${l} ${u}</text><text x="172" y="64" class="dim">${w} ${u}</text>`, 'fig wide');
    return build({ cat: 'areas', text: '¿Cuál es el PERÍMETRO de este rectángulo?', visual: v, correct: `${p} ${u}`, wrong: [l * w, l + w, p + 2, p - 2, p + 4].filter(x => x > 0 && x !== p).map(x => x + ' ' + u), hint: `Perímetro = 2 × (${l} + ${w}) = ${p} ${u}`, key: 'a3p|' + l + w + u });
  }
  if (form === 'tri') {
    const b = 2 * R.int(2, 12), h = R.int(3, 14), a = b * h / 2, v = svg('0 0 200 130', `<polygon points="20,105 180,105 120,25" fill="#ff7a3d" ${ST}/><line x1="120" y1="25" x2="120" y2="105" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/><text x="100" y="124" text-anchor="middle" class="dim">base ${b} ${u}</text><text x="128" y="70" class="dim">${h} ${u}</text>`, 'fig wide');
    return build({ cat: 'areas', text: '¿Cuál es el área de este triángulo?', visual: v, correct: `${a} ${u}²`, wrong: [b * h, a + b, a - h, b + h, a * 2 + 2].filter(x => x > 0 && x !== a).map(x => x + ' ' + u + '²'), hint: `Área = base × altura ÷ 2 = ${b} × ${h} ÷ 2 = ${a} ${u}²`, key: 'a3t|' + b + h + u });
  }
  if (form === 'para') {
    const b = R.int(4, 20), h = R.int(3, 12), a = b * h, v = svg('0 0 200 130', `<polygon points="40,105 170,105 200,35 70,35" fill="#9b6bff" ${ST}/><line x1="70" y1="35" x2="70" y2="105" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/><text x="105" y="124" text-anchor="middle" class="dim">base ${b} ${u}</text><text x="76" y="75" class="dim">${h} ${u}</text>`, 'fig wide');
    return build({ cat: 'areas', text: '¿Cuál es el área de este paralelogramo?', visual: v, correct: `${a} ${u}²`, wrong: [a / 2, a + b, a - h, b + h, 2 * (b + h)].filter(x => x > 0 && x !== a && Number.isInteger(x)).map(x => x + ' ' + u + '²'), hint: `Área = base × altura = ${b} × ${h} = ${a} ${u}²`, key: 'a3g|' + b + h + u });
  }
  if (form === 'L') {
    const W = R.int(8, 16), H = R.int(8, 14), cw = R.int(3, W - 3), ch = R.int(3, H - 3), a = W * H - cw * ch;
    const v = svg('0 0 200 140', `<polygon points="20,20 ${180 - 60},20 ${180 - 60},${20 + 40} 180,${20 + 40} 180,120 20,120" fill="#ff3d9a" ${ST}/><text x="100" y="14" text-anchor="middle" class="dim">${W} ${u}</text><text x="186" y="85" class="dim">${H - ch}</text><text x="10" y="75" class="dim" text-anchor="end">${H}</text>`, 'fig wide');
    return build({ cat: 'areas', text: `Un rectángulo de ${W} × ${H} ${u} al que le quitamos una esquina de ${cw} × ${ch} ${u}. ¿Qué área queda?`, correct: `${a} ${u}²`, wrong: [W * H, a + cw, a - ch, cw * ch, a + 10, a - 10].filter(x => x > 0 && x !== a).map(x => x + ' ' + u + '²'), hint: `${W} × ${H} = ${W * H}; ${cw} × ${ch} = ${cw * ch}; ${W * H} − ${cw * ch} = ${a} ${u}²`, key: 'a3L|' + W + H + cw + ch });
  }
  const l = R.int(3, 15), w = R.int(2, 12), a = l * w;
  return build({ cat: 'areas', text: `Un rectángulo tiene un área de ${a} ${u}² y un lado de ${l} ${u}. ¿Cuánto mide el otro lado?`, correct: `${w} ${u}`, wrong: [a - l, l + w, w + 1, w - 1, a / 2 | 0, l].filter(x => x > 0 && x !== w).map(x => x + ' ' + u), hint: `${a} ÷ ${l} = ${w} ${u}`, key: 'a3m|' + l + w + u });
}

/* ---------- registro ---------- */
const GEN = { sumres, tablas, divisiones, secuencias, comparar, fracciones, geometria, areas, medida, datos };
const BYCYCLE = {
  1: ['sumres', 'secuencias', 'comparar', 'geometria', 'areas', 'medida', 'datos'],
  2: ['sumres', 'tablas', 'divisiones', 'secuencias', 'fracciones', 'comparar', 'geometria', 'areas', 'medida', 'datos'],
  3: ['sumres', 'tablas', 'divisiones', 'secuencias', 'fracciones', 'comparar', 'geometria', 'areas', 'medida', 'datos']
};
const INFO = {
  sumres: { name: 'Sumas y restas', color: '#ff7a3d', boss: 'Gran Sumador' },
  tablas: { name: 'Tablas de multiplicar', color: '#ff3d9a', boss: 'Reina de las Tablas' },
  divisiones: { name: 'Divisiones', color: '#9b6bff', boss: 'Divisora Suprema' },
  secuencias: { name: 'Secuencias lógicas', color: '#2de2ff', boss: 'Maga del Patrón' },
  fracciones: { name: 'Fracciones', color: '#ffd23f', boss: 'Lord Pizza' },
  comparar: { name: 'Mayor y menor', color: '#b6ff3b', boss: 'Jueza Mayor-Menor' },
  geometria: { name: 'Geometría', color: '#4d8dff', boss: 'Arquitecto Prisma' },
  areas: { name: 'Áreas', color: '#ff8fb8', boss: 'Gigante Cuadrícula' },
  medida: { name: 'Medidas', color: '#34d399', boss: 'Maestra del Reloj' },
  datos: { name: 'Datos y azar', color: '#fb7185', boss: 'Capitán Gráfico' }
};

/* ---------- MEDIDA (sentido de la medida) ---------- */
function clockSvg(h, m) {
  let s = `<circle cx="60" cy="60" r="52" fill="#fff" ${ST}/>`;
  for (let i = 1; i <= 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; s += `<text x="${(60 + 41 * Math.cos(a)).toFixed(1)}" y="${(60 + 41 * Math.sin(a) + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="900" fill="${INK}" font-family="Arial Black,sans-serif">${i}</text>`; }
  const ha = ((h % 12) + m / 60) * 30 - 90, ma = m * 6 - 90, P = (a, l) => `${(60 + l * Math.cos(a * Math.PI / 180)).toFixed(1)}" y2="${(60 + l * Math.sin(a * Math.PI / 180)).toFixed(1)}`;
  s += `<line x1="60" y1="60" x2="${P(ha, 24)}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><line x1="60" y1="60" x2="${P(ma, 36)}" stroke="#ff3d9a" stroke-width="4.5" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="${INK}"/>`;
  return svg('0 0 120 120', s, 'fig');
}
const art = h => (h === 1 ? 'la 1' : `las ${h}`);
function timeWords(h, m) {
  const h12 = ((h - 1) % 12) + 1, n12 = (h12 % 12) + 1;
  if (m === 0) return `${art(h12)} en punto`;
  if (m === 15) return `${art(h12)} y cuarto`;
  if (m === 30) return `${art(h12)} y media`;
  if (m === 45) return `${art(n12)} menos cuarto`;
  return m < 30 ? `${art(h12)} y ${m}` : `${art(n12)} menos ${60 - m}`;
}
const digital = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const WEEK = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const UNITS = [['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000], ['l', 'ml', 1000], ['h', 'min', 60], ['cm', 'mm', 10]];
const EST = [['la altura de una puerta', 'm', ['cm', 'km', 'mm']], ['la longitud de un lápiz', 'cm', ['m', 'km', 'mm']], ['la distancia entre dos pueblos', 'km', ['m', 'cm', 'mm']], ['el peso de una manzana', 'g', ['kg', 'l', 'ml']], ['el peso de un coche', 'kg', ['g', 'ml', 'l']], ['la capacidad de una botella de agua', 'l', ['ml', 'kg', 'cm']], ['una cucharadita de jarabe', 'ml', ['l', 'kg', 'g']], ['lo que dura una clase', 'min', ['s', 'h', 'g']], ['lo que tardas en parpadear', 's', ['min', 'h', 'ml']], ['la longitud de una hormiga', 'mm', ['m', 'cm', 'km']]];
function medida(c, d) {
  const form = R.pick(c === 1 ? ['clock', 'clock', 'cmp', 'cmp', 'money', 'days'] : c === 2 ? ['clock', 'units', 'units', 'est', 'money', 'time'] : ['units', 'units', 'timeadd', 'est', 'vol', 'money', 'clock']);
  if (form === 'clock') {
    const h = R.int(1, 12), m = c === 1 ? R.pick(d < .4 ? [0] : [0, 30]) : c === 2 ? R.pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]) : R.pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
    if (c === 3) { const ok = digital(h, m); return build({ cat: 'medida', text: '¿Qué hora marca el reloj?', visual: clockSvg(h, m), correct: ok, wrong: [digital(h, (m + 15) % 60), digital(m === 0 ? h : (m / 5 > 12 ? 1 : m / 5), h * 5 % 60), digital(h % 12 + 1, m), digital(h, (m + 30) % 60), digital(((h + 10) % 12) + 1, m)], hint: `La hora corta marca el ${h} y la larga los minutos: ${ok}`, key: 'm|ck' + h + m }); }
    const ok = timeWords(h, m);
    return build({ cat: 'medida', text: '¿Qué hora marca el reloj?', visual: clockSvg(h, m), correct: ok, wrong: [timeWords(h, (m + 30) % 60), timeWords(h % 12 + 1, m), timeWords(((h + 10) % 12) + 1, m), timeWords(h, m === 0 ? 30 : 0)].concat(c === 1 ? [] : [timeWords(h, (m + 15) % 60)]), hint: `La aguja corta señala la hora y la larga los minutos: ${ok}`, key: 'm|ck' + h + m, big: false });
  }
  if (form === 'cmp') {
    const P = R.pick([['¿Qué pesa MÁS?', 'un elefante', 'un gato'], ['¿Qué pesa MÁS?', 'un coche', 'una pluma'], ['¿Qué pesa MENOS?', 'una hoja', 'una mesa'], ['¿Qué mide MÁS?', 'un autobús', 'un lápiz'], ['¿Qué mide MENOS?', 'una hormiga', 'una jirafa'], ['¿Qué pesa MÁS?', 'una vaca', 'un pájaro'], ['¿Qué pesa MENOS?', 'un bolígrafo', 'una bicicleta'], ['¿Qué mide MÁS?', 'un árbol', 'una flor'], ['¿Qué mide MENOS?', 'un dedo', 'una puerta'], ['¿Qué tiene MÁS capacidad?', 'una bañera', 'una taza'], ['¿Qué tiene MENOS capacidad?', 'un dedal', 'una garrafa'], ['¿Qué dura MÁS?', 'un mes', 'un día'], ['¿Qué dura MENOS?', 'una hora', 'un año'], ['¿Qué pesa MÁS?', 'un camión', 'una moto'], ['¿Qué mide MÁS?', 'el Teide', 'un edificio'], ['¿Qué tiene MÁS capacidad?', 'una piscina', 'un vaso'], ['¿Qué tiene MENOS capacidad?', 'una cucharita', 'un cubo'], ['¿Qué dura MÁS?', 'un día', 'una hora'], ['¿Qué dura MENOS?', 'un minuto', 'una semana']]);
    const more = /MÁS/.test(P[0]), win = P[0].includes('MENOS') ? P[2 - 1] : P[1];
    const ok = (more ? P[1] : P[1]); // P[1] siempre es la respuesta correcta (ya redactadas)
    return build({ cat: 'medida', text: P[0], correct: P[1], wrong: [P[2]], n: 2, min: 2, hint: `${P[1][0].toUpperCase() + P[1].slice(1)} ${more ? 'es mayor' : 'es menor'} que ${P[2]}`, key: 'm|cmp' + P[0] + P[1] });
  }
  if (form === 'money') {
    if (c === 1) { const a = R.int(1, 4), b = R.int(1, 3), cc = d > .5 ? R.int(0, 2) : 0, t = a + 2 * b + 5 * cc; return build({ cat: 'medida', text: `Tienes ${a} moneda${a > 1 ? 's' : ''} de 1 €, ${b} de 2 €${cc ? ' y ' + cc + ' billete' + (cc > 1 ? 's' : '') + ' de 5 €' : ''}. ¿Cuántos euros tienes?`, correct: t + ' €', wrong: numWrong(t).map(x => x + ' €'), hint: `Suma: ${[...Array(a).fill(1), ...Array(b).fill(2), ...Array(cc).fill(5)].join(' + ')} = ${t} €`, key: 'm|mo1' + a + b + cc }); }
    if (c === 2) { const a = R.int(2, 9), b = R.int(1, 9), pay = R.pick([10, 20]), t = a + b; if (t >= pay) return null; return build({ cat: 'medida', text: `Compras ${R.pick(['un bocadillo', 'unas papas', 'un helado'])} de ${a} € y ${R.pick(['un zumo', 'un batido', 'una fruta'])} de ${b} €. Pagas con ${pay} €. ¿Cuánto te devuelven?`, correct: (pay - t) + ' €', wrong: [pay - t + 1, pay - t - 1, t, pay - t + 2, pay - t - 2, pay].filter(x => x >= 0 && x !== pay - t).map(x => x + ' €'), hint: `${a} + ${b} = ${t}; ${pay} − ${t} = ${pay - t} €`, key: 'm|mo2' + a + b + pay }); }
    const a = R.int(100, 799) / 100, b = R.int(100, 799) / 100, t = Math.round((a + b) * 100) / 100;
    return build({ cat: 'medida', text: `Un cuaderno cuesta ${D(a)} € y un bolígrafo ${D(b)} €. ¿Cuánto cuestan los dos?`, correct: D(t) + ' €', wrong: [t + .1, t - .1, t + 1, t - 1, Math.round(Math.abs(a - b) * 100) / 100, t + .5].filter(x => x > 0 && x !== t).map(x => D(x) + ' €'), hint: `${D(a)} + ${D(b)} = ${D(t)} €`, key: 'm|mo3' + a + b });
  }
  if (form === 'days') {
    if (R.chance(.65) || d < .5) { const i = R.int(0, 6), next = R.chance(.5), ans = WEEK[(i + (next ? 1 : 6)) % 7]; return build({ cat: 'medida', text: `Hoy es ${WEEK[i]}. ¿Qué día ${next ? 'será mañana' : 'fue ayer'}?`, correct: ans, wrong: WEEK.filter(x => x !== ans), hint: `Después de ${WEEK[i]} ${next ? 'viene ' + ans : 'estuvimos en ' + ans}`, key: 'm|dy' + i + next }); }
    const i = R.int(0, 11), ans = MONTHS[(i + 1) % 12]; return build({ cat: 'medida', text: `¿Qué mes viene después de ${MONTHS[i]}?`, correct: ans, wrong: MONTHS.filter(x => x !== ans), hint: `Después de ${MONTHS[i]} viene ${ans}`, key: 'm|mn' + i });
  }
  if (form === 'units') {
    const U = c === 2 ? R.pick(UNITS.slice(0, 5)) : R.pick(UNITS), n = c === 2 ? R.int(1, 5) : R.pick([1.5, 2.5, 3.5, 0.5, 4, 6, 2.25, 7.5]);
    if (c === 3 && R.chance(.4)) { const big = n * U[2]; return build({ cat: 'medida', text: `${N(big)} ${U[1]} = ${BLANK} ${U[0]}`, correct: N(n), wrong: [n * 10, n / 10, n * 100, n / 100, n + 1].filter(x => x !== n && x > 0).map(N), hint: `1 ${U[0]} = ${N(U[2])} ${U[1]}, así que ${N(big)} ${U[1]} son ${N(n)} ${U[0]}`, key: 'm|u2' + U + n }); }
    const ans = n * U[2];
    return build({ cat: 'medida', text: `${N(n)} ${U[0]} = ${BLANK} ${U[1]}`, correct: N(ans), wrong: [ans * 10, ans / 10, ans * 100, ans / 100, ans + U[2]].filter(x => x !== ans && x > 0).map(N), hint: `1 ${U[0]} = ${N(U[2])} ${U[1]}, así que ${N(n)} ${U[0]} = ${N(ans)} ${U[1]}`, key: 'm|u' + U + n });
  }
  if (form === 'est') {
    const e = R.pick(EST); return build({ cat: 'medida', text: `¿En qué unidad medirías ${e[0]}?`, correct: e[1], wrong: e[2], hint: `Para ${e[0]} lo más cómodo es medir en ${e[1]}`, key: 'm|es' + e[0] });
  }
  if (form === 'time') {
    const k = R.pick([[2, 0], [1, 30], [3, 0], [2, 30], [4, 0], [1, 15]]), t = k[0] * 60 + k[1];
    return build({ cat: 'medida', text: `¿Cuántos minutos hay en ${k[0]} hora${k[0] > 1 ? 's' : ''}${k[1] ? ' y ' + (k[1] === 30 ? 'media' : k[1] + ' minutos') : ''}?`, correct: String(t), wrong: [t + 10, t - 10, t + 30, t - 30, k[0] * 100 + k[1], t + 60].filter(x => x > 0 && x !== t).map(String), hint: `1 hora = 60 minutos: ${k[0]} × 60 = ${k[0] * 60}${k[1] ? ' + ' + k[1] : ''} = ${t} minutos`, key: 'm|tm' + t });
  }
  if (form === 'timeadd') {
    const h = R.int(8, 18), m = R.pick([0, 15, 30, 45]), dh = R.int(0, 2), dm = R.pick([15, 30, 45]), tot = h * 60 + m + dh * 60 + dm, eh = Math.floor(tot / 60), em = tot % 60;
    return build({ cat: 'medida', text: `Una actividad empieza a las ${digital(h, m)} y dura ${dh ? dh + ' h ' : ''}${dm} min. ¿A qué hora termina?`, correct: digital(eh, em), wrong: [tot + 15, tot - 15, tot + 60, tot - 60, tot + 30].map(x => digital(Math.floor(x / 60), x % 60)), hint: `${digital(h, m)} + ${dh ? dh + ' h ' : ''}${dm} min = ${digital(eh, em)}`, key: 'm|ta' + h + m + dh + dm });
  }
  if (form === 'vol') {
    if (R.chance(.5)) { const l = R.int(2, 5); return build({ cat: 'medida', text: `Un cubo tiene aristas de ${l} cm. ¿Cuál es su volumen?`, visual: solid('cubo'), correct: `${l ** 3} cm³`, wrong: [l * l, 3 * l, l ** 3 + l, l ** 3 - l, 6 * l * l].filter(x => x > 0 && x !== l ** 3).map(x => x + ' cm³'), hint: `Volumen = ${l} × ${l} × ${l} = ${l ** 3} cm³`, key: 'm|vc' + l }); }
    const a = R.int(2, 5), b = R.int(2, 4), cc = R.int(2, 4), v = a * b * cc;
    return build({ cat: 'medida', text: `Un prisma se llena con ${a} × ${b} × ${cc} cubitos de 1 cm³. ¿Cuál es su volumen?`, correct: `${v} cm³`, wrong: [a + b + cc, v + a, v - b, a * b, v + 10].filter(x => x > 0 && x !== v).map(x => x + ' cm³'), hint: `Volumen = ${a} × ${b} × ${cc} = ${v} cm³`, key: 'm|vp' + a + b + cc });
  }
  return null;
}

/* ---------- DATOS Y AZAR (sentido estocástico) ---------- */
const FRUITS = [['plátano', '#ffd23f'], ['papaya', '#ff7a3d'], ['mango', '#ff3d9a'], ['piña', '#b6ff3b'], ['uva', '#9b6bff']];
function pictoSvg(cats, vals) {
  let s = ''; cats.forEach((c, i) => { s += `<text x="4" y="${24 + i * 32}" font-size="15" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif" stroke="${INK}" stroke-width="3.5" paint-order="stroke">${c[0]}</text>`; for (let k = 0; k < vals[i]; k++) s += `<circle cx="${100 + k * 22}" cy="${19 + i * 32}" r="9" fill="${c[1]}" stroke="${INK}" stroke-width="2.5"/>`; });
  return svg(`0 0 ${Math.max(...vals) * 22 + 112} ${cats.length * 32 + 4}`, s, 'fig wide');
}
function barSvg(cats, vals, step, max) {
  const W = 40 + cats.length * 46, H = 150; let s = '';
  for (let v = 0; v <= max; v += step) { const y = 128 - v / max * 108; s += `<line x1="30" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff55" stroke-width="1.5"/><text x="26" y="${y + 5}" text-anchor="end" font-size="12" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif">${v}</text>`; }
  cats.forEach((c, i) => { const h = vals[i] / max * 108, x = 40 + i * 46; s += `<rect x="${x}" y="${128 - h}" width="32" height="${h}" rx="3" fill="${c[1]}" ${ST} stroke-width="2.5"/><text x="${x + 16}" y="144" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif">${c[0].slice(0, 7)}</text>`; });
  return svg(`0 0 ${W} ${H}`, s, 'fig wide');
}
function bagSvg(counts, cols) {
  let s = '', i = 0; const per = Math.max(4, Math.ceil(Math.sqrt(counts.reduce((a, b) => a + b, 0) * 1.6)));
  counts.forEach((n, ci) => { for (let k = 0; k < n; k++, i++) s += `<circle cx="${18 + (i % per) * 26}" cy="${18 + Math.floor(i / per) * 26}" r="10.5" fill="${cols[ci][1]}" stroke="${INK}" stroke-width="2.5"/>`; });
  const rows = Math.ceil(i / per);
  return svg(`0 0 ${per * 26 + 8} ${rows * 26 + 8}`, s, 'fig wide');
}
const BALLS = [['roja', '#ff3d5a'], ['azul', '#2d9bff'], ['verde', '#43d65a'], ['amarilla', '#ffd23f']];
function datos(c, d) {
  const form = R.pick(c === 1 ? ['pic', 'pic', 'pic', 'azar', 'azar'] : c === 2 ? ['bar', 'bar', 'pic', 'azar', 'moda'] : ['bar', 'bar', 'azar', 'media', 'moda', 'prob']);
  if (form === 'pic') {
    const cats = R.shuffle(FRUITS).slice(0, 4), vals = cats.map(() => R.int(1, c === 1 ? 6 : 8)); if (new Set(vals).size < 4) return null;
    const v = pictoSvg(cats, vals), kind = R.pick(c === 1 ? ['max', 'count', 'min'] : ['max', 'count', 'diff', 'tot']), i = R.int(0, 3);
    if (kind === 'max' || kind === 'min') { const best = kind === 'max' ? Math.max(...vals) : Math.min(...vals), bi = vals.indexOf(best); return build({ cat: 'datos', text: `¿Qué fruta es la ${kind === 'max' ? 'MÁS' : 'MENOS'} votada?`, visual: v, correct: cats[bi][0], wrong: cats.filter((_, j) => j !== bi).map(x => x[0]), hint: `Cada círculo es un voto. Cuenta: ${cats.map((x, j) => x[0] + ' ' + vals[j]).join(', ')}`, key: 'd|p' + kind + vals + cats.map(x => x[0]) }); }
    if (kind === 'count') return build({ cat: 'datos', text: `¿Cuántos votos tiene el ${cats[i][0]}?`.replace('el uva', 'la uva').replace('el papaya', 'la papaya').replace('el piña', 'la piña'), visual: v, correct: String(vals[i]), wrong: numWrong(vals[i]), hint: `Cuenta los círculos de ${cats[i][0]}: ${vals[i]}`, key: 'd|pc' + vals + i + cats.map(x => x[0]) });
    if (kind === 'tot') { const t = vals.reduce((a, b) => a + b, 0); return build({ cat: 'datos', text: '¿Cuántos votos hay en total?', visual: v, correct: String(t), wrong: numWrong(t), hint: `${vals.join(' + ')} = ${t}`, key: 'd|pt' + vals }); }
    const j = (i + 1) % 4, dif = Math.abs(vals[i] - vals[j]); return build({ cat: 'datos', text: `¿Cuántos votos de diferencia hay entre ${cats[i][0]} y ${cats[j][0]}?`, visual: v, correct: String(dif), wrong: numWrong(dif, [vals[i] + vals[j]]), hint: `${Math.max(vals[i], vals[j])} − ${Math.min(vals[i], vals[j])} = ${dif}`, key: 'd|pd' + vals + i });
  }
  if (form === 'bar') {
    const n = 4, cats = R.shuffle(FRUITS).slice(0, n), step = c === 2 ? 2 : 10, max = c === 2 ? 10 : 50, vals = cats.map(() => c === 2 ? R.int(1, 10) : R.int(1, 10) * 5);
    if (new Set(vals).size < n) return null; const v = barSvg(cats, vals, step, max), i = R.int(0, n - 1), j = (i + 1) % n;
    const kind = R.pick(c === 2 ? ['val', 'max', 'diff'] : ['val', 'max', 'diff', 'tot']);
    if (kind === 'val') return build({ cat: 'datos', text: `¿Qué valor tiene la barra de ${cats[i][0]}?`, visual: v, correct: String(vals[i]), wrong: numWrong(vals[i], [vals[i] + step / 2]), hint: `Mira hasta dónde llega la barra de ${cats[i][0]}: ${vals[i]}`, key: 'd|bv' + vals + i + cats.map(x => x[0]) });
    if (kind === 'max') { const bi = vals.indexOf(Math.max(...vals)); return build({ cat: 'datos', text: '¿Qué barra es la MÁS alta?', visual: v, correct: cats[bi][0], wrong: cats.filter((_, k) => k !== bi).map(x => x[0]), hint: `La más alta es ${cats[bi][0]} con ${vals[bi]}`, key: 'd|bm' + vals + cats.map(x => x[0]) }); }
    if (kind === 'tot') { const t = vals.reduce((a, b) => a + b, 0); return build({ cat: 'datos', text: 'Suma todas las barras. ¿Cuál es el total?', visual: v, correct: String(t), wrong: numWrong(t), hint: `${vals.join(' + ')} = ${t}`, key: 'd|bt' + vals }); }
    const dif = Math.abs(vals[i] - vals[j]); return build({ cat: 'datos', text: `¿Cuántas unidades más tiene ${vals[i] > vals[j] ? cats[i][0] : cats[j][0]} que ${vals[i] > vals[j] ? cats[j][0] : cats[i][0]}?`, visual: v, correct: String(dif), wrong: numWrong(dif, [vals[i] + vals[j]]), hint: `${Math.max(vals[i], vals[j])} − ${Math.min(vals[i], vals[j])} = ${dif}`, key: 'd|bd' + vals + i + cats.map(x => x[0]) });
  }
  if (form === 'azar') {
    const cols = R.shuffle(BALLS).slice(0, 3);
    if (c === 1 || d < .4) {
      const mode = R.pick(['sure', 'imp', 'pos']); let counts, target;
      if (mode === 'sure') { counts = [R.int(3, 8)]; target = 0; } else if (mode === 'imp') { counts = [R.int(3, 8)]; target = 1; } else { counts = [R.int(2, 5), R.int(2, 5)]; target = R.int(0, 1); }
      const real = mode === 'sure' ? 'seguro' : mode === 'imp' ? 'imposible' : 'posible';
      return build({ cat: 'datos', text: `Sacas una bola sin mirar. ¿Sacar una bola ${cols[target][0]} es seguro, posible o imposible?`, visual: bagSvg(counts, cols), correct: real, wrong: ['seguro', 'posible', 'imposible'].filter(x => x !== real), n: 3, hint: mode === 'sure' ? 'Todas las bolas son de ese color: es seguro' : mode === 'imp' ? 'No hay ninguna bola de ese color: es imposible' : 'Hay bolas de ese color y de otros: es posible', key: 'd|az' + mode + counts + target + cols.map(x => x[0]) });
    }
    const a = R.int(1, 3), b = R.int(5, 9), arr = R.chance(.5) ? [b, a] : [a, b], t = R.int(0, 1), pr = arr[t] > arr[1 - t] ? 'muy probable' : 'poco probable';
    return build({ cat: 'datos', text: `Sacas una bola sin mirar. ¿Sacar una bola ${cols[t][0]} es…?`, visual: bagSvg(arr, cols), correct: pr, wrong: ['seguro', 'muy probable', 'poco probable', 'imposible'].filter(x => x !== pr), hint: `Hay ${arr[t]} bolas ${cols[t][0]}s y ${arr[1 - t]} ${cols[1 - t][0]}s: ${pr}`, key: 'd|az2' + arr + t + cols.map(x => x[0]) });
  }
  if (form === 'moda') {
    const base = R.int(1, 9), arr = []; const m = R.int(1, 9); for (let i = 0; i < 3; i++) arr.push(m);
    while (arr.length < (c === 2 ? 7 : 9)) { const x = R.int(1, c === 2 ? 9 : 20); if (x !== m && arr.filter(y => y === x).length < 2) arr.push(x); }
    const sh = R.shuffle(arr); return build({ cat: 'datos', text: `Notas de un grupo: ${sh.join(', ')}. ¿Cuál es la MODA (el dato que más se repite)?`, correct: String(m), wrong: numWrong(m, [Math.max(...arr), Math.min(...arr)]), hint: `El ${m} aparece 3 veces: es la moda`, key: 'd|mo' + sh });
  }
  if (form === 'media') {
    const n = R.pick([4, 5]), mean = R.int(3, 15), arr = []; let sum = mean * n; for (let i = 0; i < n - 1; i++) { const x = Math.max(1, mean + R.int(-3, 3)); arr.push(x); sum -= x; }
    if (sum < 1) return null; arr.push(sum); const sh = R.shuffle(arr);
    return build({ cat: 'datos', text: `Calcula la MEDIA de: ${sh.join(', ')}`, correct: String(mean), wrong: numWrong(mean, [Math.max(...arr), Math.min(...arr), mean * n]), hint: `Suma: ${sh.join(' + ')} = ${mean * n}; ${mean * n} ÷ ${n} = ${mean}`, key: 'd|me' + sh });
  }
  const cols = R.shuffle(BALLS).slice(0, 3), cnt = [R.int(1, 5), R.int(1, 5), R.int(1, 5)], tot = cnt.reduce((a, b) => a + b, 0), t = R.int(0, 2), g = gcd(cnt[t], tot);
  return build({ cat: 'datos', text: `Sacas una bola sin mirar. ¿Qué probabilidad hay de sacar una bola ${cols[t][0]}?`, visual: bagSvg(cnt, cols), correct: F(cnt[t], tot), wrong: [F(1, tot), F(tot - cnt[t], tot), F(cnt[t], tot + 1), F(cnt[t], cnt[(t + 1) % 3]), F(tot, cnt[t])], hint: `${cnt[t]} bolas ${cols[t][0]}s de un total de ${tot}: ${cnt[t]}/${tot}`, big: true, key: 'd|pr' + cnt + t + cols.map(x => x[0]) });
}

/* ---------- ESPACIAL (posición, giros, simetría) ---------- */
const DIRS4 = ['arriba', 'derecha', 'abajo', 'izquierda'];
function espacial(c, d) {
  const form = R.pick(c === 1 ? ['turn', 'turn', 'turn'] : c === 2 ? ['cell', 'turn', 'sym', 'sym'] : ['coord', 'coord', 'turn', 'sym']);
  if (form === 'cell') {
    const g = c === 1 ? 4 : 5, r0 = R.int(0, g - 1), c0 = R.int(0, g - 1), s = 28, pad = 22; let o = '';
    for (let r = 0; r < g; r++) for (let cc = 0; cc < g; cc++) o += `<rect x="${pad + cc * s}" y="${pad + r * s}" width="${s}" height="${s}" fill="#fff" stroke="#8a7fb8" stroke-width="2"/>`;
    for (let k = 0; k < g; k++) o += `<text x="${pad + k * s + s / 2}" y="16" text-anchor="middle" class="dim">${'ABCDE'[k]}</text><text x="8" y="${pad + k * s + s / 2 + 5}" text-anchor="middle" class="dim">${k + 1}</text>`;
    o += `<polygon points="${starPts(pad + c0 * s + s / 2, pad + r0 * s + s / 2 + 1, 12, 5.5, 5)}" fill="#ffd23f" ${ST} stroke-width="2.5"/>`;
    const ok = `${'ABCDE'[c0]}${r0 + 1}`;
    return build({ cat: 'geometria', text: '¿En qué casilla está la estrella?', visual: svg(`0 0 ${pad + g * s + 8} ${pad + g * s + 8}`, o, 'fig grid'), correct: ok, wrong: [`${'ABCDE'[r0 % g]}${c0 + 1}`, `${'ABCDE'[Math.min(g - 1, c0 + 1)]}${r0 + 1}`, `${'ABCDE'[c0]}${Math.min(g, r0 + 2)}`, `${'ABCDE'[Math.max(0, c0 - 1)]}${r0 + 1}`, `${'ABCDE'[c0]}${Math.max(1, r0)}`], hint: `Letra de la columna y número de la fila: columna ${'ABCDE'[c0]}, fila ${r0 + 1} → ${ok}`, key: 'e|cell' + g + c0 + r0 });
  }
  if (form === 'coord') {
    const x = R.int(1, 6), y = R.int(1, 6), s = 24, pad = 24; let o = '';
    for (let k = 0; k <= 6; k++) o += `<line x1="${pad + k * s}" y1="${pad}" x2="${pad + k * s}" y2="${pad + 6 * s}" stroke="#ffffff66" stroke-width="1.5"/><line x1="${pad}" y1="${pad + k * s}" x2="${pad + 6 * s}" y2="${pad + k * s}" stroke="#ffffff66" stroke-width="1.5"/><text x="${pad + k * s}" y="${pad + 6 * s + 16}" text-anchor="middle" class="dim">${k}</text><text x="${pad - 8}" y="${pad + (6 - k) * s + 5}" text-anchor="end" class="dim">${k}</text>`;
    o += `<line x1="${pad}" y1="${pad}" x2="${pad}" y2="${pad + 6 * s}" stroke="#fff" stroke-width="3"/><line x1="${pad}" y1="${pad + 6 * s}" x2="${pad + 6 * s}" y2="${pad + 6 * s}" stroke="#fff" stroke-width="3"/><circle cx="${pad + x * s}" cy="${pad + (6 - y) * s}" r="7" fill="#ff3d9a" ${ST} stroke-width="2.5"/>`;
    return build({ cat: 'geometria', text: '¿Cuáles son las coordenadas del punto?', visual: svg(`0 0 ${pad + 6 * s + 20} ${pad + 6 * s + 26}`, o, 'fig grid'), correct: `(${x}, ${y})`, wrong: [`(${y}, ${x})`, `(${x + 1 > 6 ? x - 1 : x + 1}, ${y})`, `(${x}, ${y + 1 > 6 ? y - 1 : y + 1})`, `(${Math.max(0, x - 1)}, ${y})`], hint: `Primero se lee el número horizontal y luego el vertical: ${x} hacia la derecha y ${y} hacia arriba → (${x}, ${y})`, key: 'e|co' + x + y });
  }
  if (form === 'turn') {
    const s = R.int(0, 3), k = c === 1 ? 1 : R.pick([1, 2, 3]), right = c === 1 ? true : R.chance(.5), ans = DIRS4[(s + (right ? k : 4 - k)) % 4];
    const turn = k === 1 ? 'un cuarto de vuelta' + (c === 3 ? ' (90°)' : '') : k === 2 ? 'media vuelta' + (c === 3 ? ' (180°)' : '') : 'tres cuartos de vuelta' + (c === 3 ? ' (270°)' : '');
    const arrow = svg('0 0 80 80', `<circle cx="40" cy="40" r="34" fill="#fff" ${ST}/><g transform="rotate(${s * 90} 40 40)"><polygon points="40,10 52,38 28,38" fill="#ff3d9a" ${ST} stroke-width="2.5"/><rect x="35" y="36" width="10" height="26" fill="#ff3d9a" ${ST} stroke-width="2.5"/></g>`, 'fig');
    return build({ cat: 'geometria', text: `Miras hacia ${DIRS4[s]} y giras ${turn} a la ${right ? 'derecha' : 'izquierda'}. ¿Hacia dónde miras ahora?`, visual: arrow, correct: ans, wrong: DIRS4.filter(x => x !== ans), hint: `Cada cuarto de vuelta a la ${right ? 'derecha' : 'izquierda'} cambia la dirección: ${DIRS4[s]} → ${ans}`, key: 'e|tu' + s + k + right });
  }
  const t = c === 2 ? R.pick([[4, 'cuadrado', polyFig(4)], [2, 'rectángulo', shape2d('rectangulo')], [3, 'triángulo equilátero', polyFig(3)]]) : R.pick([[5, 'pentágono regular', polyFig(5)], [6, 'hexágono regular', polyFig(6)], [4, 'cuadrado', polyFig(4)], [3, 'triángulo equilátero', polyFig(3)], [2, 'rombo', shape2d('rombo')]]);
  return build({ cat: 'geometria', text: `¿Cuántos ejes de simetría tiene un ${t[1]}?`, visual: t[2], correct: String(t[0]), wrong: ['1', '2', '3', '4', '5', '6', '0'], hint: `Un ${t[1]} tiene ${t[0]} ejes de simetría (líneas que lo dividen en dos mitades iguales)`, key: 'e|sy' + t[1] });
}

/* ---------- ALGORITMOS, ECUACIONES Y LÓGICA (sentido algebraico y pensamiento computacional) ---------- */
const AR = d => `<svg class="arw" viewBox="0 0 24 24" style="transform:rotate(${{ U: 0, R: 90, D: 180, L: 270 }[d]}deg)" aria-hidden="true"><path d="M12 3L21 15H15V21H9V15H3z" fill="#ffd23f" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
function robotQ(c, d) {
  const g = c === 1 ? 4 : 5, V = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
  for (let tries = 0; tries < 60; tries++) {
    const loop = c >= 2 && d > .35 && R.chance(.5); const n = loop ? 2 : (c === 1 ? R.int(2, 3) : R.int(3, 5));
    const block = []; for (let i = 0; i < n; i++) block.push(R.pick(['U', 'D', 'L', 'R'])); const k = loop ? R.int(2, 3) : 1;
    let r = R.int(0, g - 1), cc = R.int(0, g - 1); const sr = r, sc = cc; let ok = true;
    for (let t = 0; t < k && ok; t++) for (const m of block) { r += V[m][0]; cc += V[m][1]; if (r < 0 || r >= g || cc < 0 || cc >= g) { ok = false; break; } }
    if (!ok || (r === sr && cc === sc)) continue;
    const cand = [[r, cc]], addC = (rr, c2) => { if (rr >= 0 && rr < g && c2 >= 0 && c2 < g && !(rr === sr && c2 === sc) && !cand.some(p => p[0] === rr && p[1] === c2)) cand.push([rr, c2]); };
    [[r, g - 1 - cc], [g - 1 - r, cc], [r + 1, cc], [r - 1, cc], [r, cc + 1], [r, cc - 1], [sr, cc], [r, sc]].forEach(p => addC(p[0], p[1]));
    if (cand.length < 4) continue; const four = [cand[0]].concat(R.shuffle(cand.slice(1)).slice(0, 3)), letters = R.shuffle(['A', 'B', 'C', 'D']), s = 30, pad = 4;
    let o = ''; for (let a = 0; a < g; a++) for (let b = 0; b < g; b++) o += `<rect x="${pad + b * s}" y="${pad + a * s}" width="${s}" height="${s}" fill="#fff" stroke="#8a7fb8" stroke-width="2"/>`;
    o += `<rect x="${pad + sc * s + 3}" y="${pad + sr * s + 3}" width="${s - 6}" height="${s - 6}" rx="6" fill="#ff3d9a" ${ST} stroke-width="2.5"/><text x="${pad + sc * s + s / 2}" y="${pad + sr * s + s / 2 + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif">R</text>`;
    four.forEach((p, i) => { o += `<circle cx="${pad + p[1] * s + s / 2}" cy="${pad + p[0] * s + s / 2}" r="11" fill="#2de2ff" ${ST} stroke-width="2.5"/><text x="${pad + p[1] * s + s / 2}" y="${pad + p[0] * s + s / 2 + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="${INK}" font-family="Arial Black,sans-serif">${letters[i]}</text>`; });
    const inst = `<div class="inst">${loop ? '<b>Repite ' + k + ' veces:</b> ' : ''}${block.map(AR).join('')}</div>`;
    const names = { U: 'arriba', D: 'abajo', L: 'izquierda', R: 'derecha' };
    return build({ cat: 'secuencias', text: '¿En qué letra termina el robot R?', visual: `<div class="duo">${svg(`0 0 ${g * s + 2 * pad} ${g * s + 2 * pad}`, o, 'fig grid')}${inst}</div>`, correct: letters[0], wrong: letters.slice(1), hint: `Paso a paso: ${block.map(m => names[m]).join(', ')}${loop ? ' (' + k + ' veces)' : ''} → llega a la letra ${letters[0]}`, key: 'a|rb' + g + sr + sc + block.join('') + k });
  }
  return null;
}
function machineQ(c, d) {
  let v = R.int(2, c === 1 ? 10 : 20); const s0 = v, steps = [], n = c === 1 ? 2 : c === 2 ? R.int(2, 3) : 3;
  for (let i = 0; i < n; i++) {
    const op = R.pick(c === 1 ? ['+', '−'] : c === 2 ? ['+', '−', '×'] : ['+', '−', '×', '÷']);
    if (op === '+') { const a = R.int(1, c === 1 ? 5 : 12); v += a; steps.push(`sumas ${a}`); }
    else if (op === '−') { const a = R.int(1, Math.max(1, Math.min(v - 1, c === 1 ? 5 : 12))); if (v - a < 0) return null; v -= a; steps.push(`restas ${a}`); }
    else if (op === '×') { const a = R.int(2, c === 2 ? 3 : 5); v *= a; steps.push(`multiplicas por ${a}`); }
    else { const dv = [2, 3, 4, 5].filter(x => v % x === 0 && v / x >= 1); if (!dv.length) return null; const a = R.pick(dv); v /= a; steps.push(`divides entre ${a}`); }
  }
  if (v > 200) return null;
  return build({ cat: 'secuencias', text: `Una máquina de números: empiezas con ${s0}, ${steps.join(', luego ')}. ¿Qué número sale?`, correct: N(v), wrong: numWrong(v, [v + 2, v - 2]), hint: `Hazlo paso a paso con papel: ${s0} → ${steps.join(' → ')} = ${N(v)}`, key: 'a|ma' + s0 + steps.join() });
}
function ecuQ(c, d) {
  if (c === 1) { const a = R.int(1, 8), x = R.int(1, 9); return build({ cat: 'secuencias', text: `Si ${tok('star', '#ffd23f')} + ${a} = ${a + x}, ¿cuánto vale la estrella?`, correct: String(x), wrong: numWrong(x, [a, a + x]), hint: `${a + x} − ${a} = ${x}`, key: 'a|ec1' + a + x }); }
  const kind = c === 2 ? R.pick(['+', '−', '×']) : R.pick(['2x+', 'x÷', '3x−']);
  if (kind === '+') { const a = R.int(2, 20), x = R.int(2, 20); return build({ cat: 'secuencias', text: `Si x + ${a} = ${a + x}, ¿cuánto vale x?`, correct: String(x), wrong: numWrong(x, [a, a + x]), hint: `x = ${a + x} − ${a} = ${x}`, key: 'a|ec+' + a + x }); }
  if (kind === '−') { const a = R.int(2, 12), x = R.int(a + 1, 30); return build({ cat: 'secuencias', text: `Si x − ${a} = ${x - a}, ¿cuánto vale x?`, correct: String(x), wrong: numWrong(x, [x - a, a]), hint: `x = ${x - a} + ${a} = ${x}`, key: 'a|ec-' + a + x }); }
  if (kind === '×') { const a = R.int(2, 9), x = R.int(2, 10); return build({ cat: 'secuencias', text: `Si ${a} × x = ${a * x}, ¿cuánto vale x?`, correct: String(x), wrong: numWrong(x, [a, a * x]), hint: `x = ${a * x} ÷ ${a} = ${x}`, key: 'a|ec×' + a + x }); }
  if (kind === '2x+') { const a = R.int(2, 5), b = R.int(1, 9), x = R.int(2, 9); return build({ cat: 'secuencias', text: `Si ${a} × x + ${b} = ${a * x + b}, ¿cuánto vale x?`, correct: String(x), wrong: numWrong(x, [x + 1, a, b]), hint: `Primero quita ${b}: ${a * x + b} − ${b} = ${a * x}; luego ${a * x} ÷ ${a} = ${x}`, key: 'a|ec2' + a + b + x }); }
  if (kind === 'x÷') { const a = R.int(2, 9), q = R.int(2, 12); return build({ cat: 'secuencias', text: `Si x ÷ ${a} = ${q}, ¿cuánto vale x?`, correct: String(a * q), wrong: numWrong(a * q, [q, a + q]), hint: `x = ${q} × ${a} = ${a * q}`, key: 'a|ecd' + a + q }); }
  const a = R.int(2, 5), b = R.int(1, 9), x = R.int(2, 9); return build({ cat: 'secuencias', text: `Si ${a} × x − ${b} = ${a * x - b}, ¿cuánto vale x?`, correct: String(x), wrong: numWrong(x, [x + 1, a, b]), hint: `Primero suma ${b}: ${a * x - b} + ${b} = ${a * x}; luego ${a * x} ÷ ${a} = ${x}`, key: 'a|ec3' + a + b + x });
}
function condQ(c, d) {
  const par = R.chance(.5), s = R.int(3, 30), isEven = s % 2 === 0, a = R.int(2, 5), b = R.int(1, 3);
  const ans = isEven ? s / 2 : s + a;
  return build({ cat: 'secuencias', text: `Programa: si el número es PAR, lo divides entre 2; si es IMPAR, le sumas ${a}. Empiezas con ${s}. ¿Qué número sale?`, correct: N(ans), wrong: numWrong(ans, [isEven ? s + a : s / 2 | 0, s]), hint: `${s} es ${isEven ? 'par' : 'impar'}, así que ${isEven ? s + ' ÷ 2' : s + ' + ' + a} = ${N(ans)}`, key: 'a|co' + s + a });
}
function algoritmo(c, d) {
  const f = R.pick(c === 1 ? ['robot', 'robot', 'machine', 'ecu'] : ['robot', 'machine', 'ecu', 'ecu', 'cond']);
  return f === 'robot' ? robotQ(c, d) : f === 'machine' ? machineQ(c, d) : f === 'ecu' ? ecuQ(c, d) : condQ(c, d);
}

/* ---------- CONTENIDOS DE AJUSTE AL CURRÍCULO (Decreto 211/2022, anexo Matemáticas) ---------- */
const Z = n => (n < 0 ? '−' : '') + Math.abs(n);
const EU = x => x.toFixed(2).replace('.', ',') + ' €';
const DIRC = ['norte', 'este', 'sur', 'oeste'];
function relQ() {
  const shapes = R.shuffle(TSHAPES).slice(0, 3), cols = R.shuffle(TCOL).slice(0, 3), t = i => tok(shapes[i], cols[i]);
  const row = '<div class="seq tokens">' + [0, 1, 2].map(t).join('') + '</div>', k = R.pick(['entre', 'der', 'izq']);
  if (k === 'entre') return build({ cat: 'geometria', text: '¿Qué figura está ENTRE las otras dos?', visual: row, correct: t(1), wrong: [t(0), t(2), tok(R.pick(TSHAPES.filter(x => !shapes.includes(x))), cols[0])], hint: 'La figura del centro está entre la de la izquierda y la de la derecha', big: true, key: 'x|re' + shapes + cols });
  if (k === 'der') return build({ cat: 'geometria', text: '¿Qué figura está a la DERECHA de todas?', visual: row, correct: t(2), wrong: [t(0), t(1), tok(R.pick(TSHAPES.filter(x => !shapes.includes(x))), cols[1])], hint: 'La derecha es el lado de la mano con la que escribes (la mayoría)', big: true, key: 'x|rd' + shapes + cols });
  return build({ cat: 'geometria', text: '¿Qué figura está a la IZQUIERDA de todas?', visual: row, correct: t(0), wrong: [t(1), t(2), tok(R.pick(TSHAPES.filter(x => !shapes.includes(x))), cols[2])], hint: 'La izquierda es el lado contrario a la derecha', big: true, key: 'x|ri' + shapes + cols });
}
function sym1Q() {
  const L = [['cuadrado', `<rect x="22" y="22" width="76" height="76" rx="3"/>`, 'Sí'], ['círculo', `<circle cx="60" cy="60" r="42"/>`, 'Sí'], ['triángulo', `<polygon points="60,16 104,100 16,100"/>`, 'Sí'], ['rectángulo', `<rect x="18" y="34" width="84" height="52" rx="3"/>`, 'Sí'], ['triángulo con ángulo recto', `<polygon points="22,100 98,100 22,20"/>`, 'No'], ['forma en L', `<polygon points="25,20 55,20 55,72 95,72 95,100 25,100"/>`, 'No'], ['flecha torcida', `<polygon points="30,20 80,20 100,60 50,100 30,60"/>`, 'No']];
  const f = R.pick(L), v = svg('0 0 120 120', `<g fill="${R.pick(TCOL)}" ${ST}>${f[1]}</g><line x1="60" y1="6" x2="60" y2="114" stroke="#fff" stroke-width="3.5" stroke-dasharray="7 6"/>`, 'fig');
  return build({ cat: 'geometria', text: 'Si doblas por la línea, ¿las dos partes coinciden?', visual: v, correct: f[2], wrong: [f[2] === 'Sí' ? 'No' : 'Sí'], n: 2, min: 2, order: ['Sí', 'No'], hint: f[2] === 'Sí' ? 'Las dos mitades son iguales: hay simetría' : 'Las dos mitades no son iguales: no hay simetría', key: 'x|s1' + f[0] + Math.random() });
}
function linesQ() {
  const k = R.pick(['paralelas', 'perpendiculares', 'oblicuas']), a = k === 'paralelas' ? [[15, 40, 105, 40], [15, 80, 105, 80]] : k === 'perpendiculares' ? [[15, 60, 105, 60], [60, 12, 60, 108]] : [[15, 95, 100, 25], [25, 25, 100, 90]];
  const v = svg('0 0 120 120', a.map(l => `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#fff" stroke-width="6" stroke-linecap="round"/><line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" stroke="#ff3d9a" stroke-width="2.5" stroke-linecap="round"/>`).join(''), 'fig');
  return build({ cat: 'geometria', text: '¿Cómo son estas dos rectas?', visual: v, correct: k, wrong: ['paralelas', 'perpendiculares', 'oblicuas'].filter(x => x !== k), n: 3, hint: 'Paralelas: nunca se cruzan · Perpendiculares: se cruzan formando ángulos rectos · Oblicuas: se cruzan sin ser rectas', key: 'x|ln' + k + Math.random() });
}
function angle2Q() {
  const deg = R.pick([90, 90, 30, 45, 60, 75, 100, 120, 135, 150]), t = deg < 90 ? 'agudo' : deg === 90 ? 'recto' : 'obtuso';
  return build({ cat: 'geometria', text: '¿Qué tipo de ángulo es este?', visual: angleSvg(deg), correct: t, wrong: ['agudo', 'recto', 'obtuso'].filter(x => x !== t), n: 3, hint: 'Recto: como la esquina de un folio · Agudo: más cerrado · Obtuso: más abierto', key: 'x|an' + deg });
}
function halfRectQ() {
  const w = 2 * R.int(2, 6), h = R.int(2, 7), v = svg('0 0 235 120', `<rect x="25" y="25" width="140" height="70" fill="#2de2ff" ${ST}/><line x1="25" y1="25" x2="165" y2="95" stroke="#fff" stroke-width="4" stroke-dasharray="8 6"/><text x="95" y="18" text-anchor="middle" class="dim">${w} cm</text><text x="172" y="64" class="dim">${h} cm</text>`, 'fig wide');
  return build({ cat: 'areas', text: 'El rectángulo se corta por la diagonal en dos triángulos iguales. ¿Qué área tiene cada triángulo?', visual: v, correct: `${w * h / 2} cm²`, wrong: [w * h, w + h, w * h / 2 + 2, w * h / 2 - 2, 2 * (w + h)].filter(x => x > 0 && x !== w * h / 2).map(x => x + ' cm²'), hint: `Área del rectángulo: ${w} × ${h} = ${w * h} cm²; cada triángulo es la mitad: ${w * h / 2} cm²`, key: 'x|hr' + w + h });
}
function barC1Q() {
  const cats = R.shuffle(FRUITS).slice(0, 4), vals = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4), v = barSvg(cats, vals, 1, 8), i = R.int(0, 3);
  if (R.chance(.5)) return build({ cat: 'datos', text: `¿Cuántas unidades tiene ${cats[i][0] === 'uva' ? 'la' : 'el'} ${cats[i][0]}?`.replace('el papaya', 'la papaya').replace('el piña', 'la piña'), visual: v, correct: String(vals[i]), wrong: numWrong(vals[i]), hint: `Mira hasta dónde llega la barra: ${vals[i]}`, key: 'x|b1v' + vals + i + cats.map(x => x[0]) });
  const bi = vals.indexOf(Math.max(...vals)); return build({ cat: 'datos', text: '¿Qué barra es la MÁS alta?', visual: v, correct: cats[bi][0], wrong: cats.filter((_, k) => k !== bi).map(x => x[0]), hint: `La más alta es ${cats[bi][0]}`, key: 'x|b1m' + vals + cats.map(x => x[0]) });
}
let GRD = 0;
const up = () => GRD % 2 === 0;
const gcd2 = (a, b) => b ? gcd2(b, a % b) : a;
const EXTRA = {
  sumres(c) {
    if (c === 1) { const half = R.chance(.5), n = R.int(1, 10) * 10, ans = half ? n / 2 : n * (n > 50 ? 1 : 2) / (n > 50 ? 1 : 1); if (half) return build({ cat: 'sumres', text: `¿Cuál es la mitad de ${n}?`, correct: String(n / 2), wrong: numWrong(n / 2, [n * 2]), hint: `${n / 2} + ${n / 2} = ${n}, así que la mitad de ${n} es ${n / 2}`, key: 'x|mi' + n }); const m = R.int(1, 5) * 10; return build({ cat: 'sumres', text: `¿Cuál es el doble de ${m}?`, correct: String(m * 2), wrong: numWrong(m * 2, [m + 2, m / 2]), hint: `${m} + ${m} = ${m * 2}`, key: 'x|do' + m }); }
    if (c === 2) {
      const k = R.pick(up() ? ['dec', 'dec', 'cent', 'chg'] : ['cent', 'chg', 'chg']);
      if (k === 'dec') { const a = R.int(11, 99) / 10, b = R.int(11, 99) / 10, sub = R.chance(.5), x = sub ? Math.max(a, b) : a, y = sub ? Math.min(a, b) : b; if (x === y) return null; const ans = Math.round((sub ? x - y : x + y) * 10) / 10; return build({ cat: 'sumres', text: `${D(x)} ${sub ? '−' : '+'} ${D(y)} = ?`, correct: D(ans), wrong: [ans + .1, ans - .1, ans + 1, ans - 1, ans + 10].filter(v => v > 0 && v !== ans).map(D), hint: `Alinea las comas: ${D(x)} ${sub ? '−' : '+'} ${D(y)} = ${D(ans)}`, key: 'x|dc' + x + y + sub }); }
      if (k === 'cent') { const a = R.int(1, 8) + R.pick([.5, .25, .75, .2, .3]), b = R.int(1, 5) + R.pick([.5, .25, .1, .3]), t = a + b; return build({ cat: 'sumres', text: `Un bocadillo cuesta ${EU(a)} y un zumo ${EU(b)}. ¿Cuánto cuestan los dos?`, correct: EU(t), wrong: [t + .5, t - .5, t + 1, t - 1, t + .1, t - .1].filter(v => v > 0).map(EU), hint: `${EU(a)} + ${EU(b)} = ${EU(t)}`, key: 'x|ce' + a + b }); }
      const price = R.int(1, 9) + R.pick([.5, .25, .8, .2]), pay = Math.ceil(price) + R.pick([1, 5]), ch = pay - price; return build({ cat: 'sumres', text: `Un helado cuesta ${EU(price)}. Pagas con ${pay} €. ¿Cuánto te devuelven?`, correct: EU(ch), wrong: [ch + .5, ch - .5, ch + 1, ch - 1, price, ch + .1].filter(v => v > 0 && v !== ch).map(EU), hint: `${pay} − ${D(price)} = ${D(ch)} €`, key: 'x|ch' + price + pay });
    }
    const k = R.pick(up() ? ['neg', 'neg', 'half', 'q', 'sale', 'sale'] : ['half', 'half', 'q', 'sale']);
    if (k === 'neg') { const t = R.int(-9, -1), up = R.int(2, 15), ans = t + up, tem = R.chance(.6); return build({ cat: 'sumres', text: tem ? `A las 7:00 hacía ${Z(t)} °C y la temperatura subió ${up} grados. ¿Qué temperatura hay ahora?` : `Estás en la planta ${Z(t)} del aparcamiento y subes ${up} plantas. ¿En qué planta estás?`, correct: tem ? Z(ans) + ' °C' : 'planta ' + Z(ans), wrong: [ans + 1, ans - 1, ans + 2, ans - 2, -ans, t - up].filter(v => v !== ans).map(v => tem ? Z(v) + ' °C' : 'planta ' + Z(v)), hint: `Parte de ${Z(t)} y avanza ${up} en la recta numérica: ${Z(ans)}`, key: 'x|ng' + t + up + tem }); }
    if (k === 'half') { const m = R.pick([2, 4, 5]), n = R.int(2, 20) * 4, mulz = R.pick([[.5, 2, 'la mitad'], [.25, 4, 'la cuarta parte']]), ans = n * mulz[0]; return build({ cat: 'sumres', text: `${n} × ${D(mulz[0])} = ?`, correct: D(ans), wrong: [n * 2, n * 4, n / 10, ans + 1, ans - 1].filter(x => x !== ans && x > 0).map(D), hint: `Multiplicar por ${D(mulz[0])} es calcular ${mulz[2]}: ${n} ÷ ${mulz[1]} = ${D(ans)}`, key: 'x|hm' + n + mulz[0] }); }
    if (k === 'q') { const n = R.int(5, 40), ans = n * 2; return build({ cat: 'sumres', text: `${n} ÷ 0,5 = ?`, correct: String(ans), wrong: [n / 2, n * 5, n + 2, ans + 10, ans - 10].filter(x => x > 0 && x !== ans).map(D), hint: `Dividir entre 0,5 es lo mismo que multiplicar por 2: ${n} × 2 = ${ans}`, key: 'x|dq' + n }); }
    const p = R.pick([[10, .1], [20, .2], [25, .25], [50, .5]]), price = R.pick([20, 40, 60, 80, 100, 120]), save = price * p[1]; return build({ cat: 'sumres', text: `Una camiseta de ${price} € tiene un ${p[0]} % de descuento. ¿Cuánto cuesta ahora?`, correct: D(price - save) + ' €', wrong: [price + save, save, price - save + 5, price - save - 5, price - 2 * save].filter(x => x > 0 && x !== price - save).map(x => D(x) + ' €'), hint: `El ${p[0]} % de ${price} es ${D(save)} €; ${price} − ${D(save)} = ${D(price - save)} €`, key: 'x|sl' + price + p[0] });
  },
  tablas(c) {
    if (c === 2) { if (R.chance(.55)) { const a = R.int(2, 99), t = R.pick([10, 100]); return build({ cat: 'tablas', text: `${a} × ${t} = ?`, correct: N(a * t), wrong: [a * t * 10, a * t / 10, a * t + a, a + t].map(N), hint: `Por ${t}: añade ${t === 10 ? 'un cero' : 'dos ceros'} → ${N(a * t)}`, key: 'x|t10' + a + t }); }
      const m = R.pick(up() ? [3, 4, 5, 6, 7, 8, 9] : [2, 3, 4, 5]), good = m * R.int(2, 9), bad = new Set(); while (bad.size < 3) { const x = R.int(10, 70); if (x % m) bad.add(x); }
      return build({ cat: 'tablas', text: `¿Cuál de estos números es múltiplo de ${m}?`, correct: String(good), wrong: [...bad].map(String), hint: `Los múltiplos de ${m} salen en su tabla: ${m}, ${2 * m}, ${3 * m}, ${4 * m}… → ${good} = ${m} × ${good / m}`, key: 'x|mu' + m + good + [...bad] }); }
    const k = R.pick(up() ? ['pow', 'pow', 'mcm', 'mcd', 'prime', 'prop', 'prop'] : ['pow', 'prop', 'prop', 'prime']);
    if (k === 'pow') { const b = R.int(2, 10), e = b <= 5 ? R.pick([2, 3]) : 2, p = b ** e; return build({ cat: 'tablas', text: `${b}<sup>${e}</sup> = ?`, correct: N(p), wrong: [b * e, p + b, p - b, b ** (e + 1), (b + 1) ** e].filter(x => x !== p).map(N), hint: `${b}<sup>${e}</sup> = ${Array(e).fill(b).join(' × ')} = ${N(p)}`, key: 'x|pw' + b + e }); }
    if (k === 'mcm') { const a = R.pick([2, 3, 4, 5, 6]), b = R.pick([3, 4, 5, 6, 8, 9].filter(x => x !== a)), l = a * b / gcd2(a, b); return build({ cat: 'tablas', text: `¿Cuál es el mínimo común múltiplo de ${a} y ${b}?`, correct: String(l), wrong: [a * b, l + a, l - 1, l * 2, a + b].filter(x => x !== l && x > 0).map(String), hint: `Múltiplos de ${a}: ${[1, 2, 3, 4, 5, 6].map(i => a * i).join(', ')}… y de ${b}: ${[1, 2, 3, 4, 5, 6].map(i => b * i).join(', ')}… El primero común es ${l}`, key: 'x|mc' + a + b }); }
    if (k === 'mcd') { const g = R.pick([2, 3, 4, 5, 6]), a = g * R.pick([2, 3, 4]), b = g * R.pick([5, 6, 7].filter(x => x * g !== a)), d = gcd2(a, b); return build({ cat: 'tablas', text: `¿Cuál es el máximo común divisor de ${a} y ${b}?`, correct: String(d), wrong: [1, 2, d * 2, d + 1, d - 1, a - b > 0 ? a - b : b - a].filter(x => x !== d && x > 0).map(String), hint: `El mayor número que divide a los dos es ${d}`, key: 'x|md' + a + b }); }
    if (k === 'prime') { const P = [11, 13, 17, 19, 23, 29, 31, 37], C = [15, 21, 25, 27, 33, 35, 39, 49, 51, 57], p = R.pick(P), others = R.shuffle(C).slice(0, 3); return build({ cat: 'tablas', text: '¿Cuál de estos números es PRIMO?', correct: String(p), wrong: others.map(String), hint: `${p} solo se puede dividir entre 1 y entre sí mismo. Los otros tienen más divisores`, key: 'x|pr' + p + others }); }
    const u = R.int(2, 9), cost = R.int(2, 8) * u / u * 2, n1 = R.int(2, 5), n2 = n1 + R.int(2, 5), price = R.int(2, 9) * 0 + R.int(2, 6), tot1 = price * n1, ans = price * n2; return build({ cat: 'tablas', text: `${n1} cuadernos cuestan ${tot1} €. ¿Cuánto cuestan ${n2} cuadernos al mismo precio?`, correct: ans + ' €', wrong: [tot1 + n2, ans + price, ans - price, tot1 * 2, n2].filter(x => x !== ans && x > 0).map(x => x + ' €'), hint: `Un cuaderno: ${tot1} ÷ ${n1} = ${price} €; ${n2} cuadernos: ${n2} × ${price} = ${ans} €`, key: 'x|pp' + n1 + n2 + price });
  },
  fracciones(c) {
    if (c === 2) {
      const k = R.pick(up() ? ['add', 'sub', 'pct', 'pct'] : ['add', 'sub', 'add']);
      if (k === 'pct') { const p = R.pick([[50, 2, '1/2'], [25, 4, '1/4'], [75, 4, '3/4']]), u = R.int(2, 12), tot = 4 * u, ans = tot * p[0] / 100; return build({ cat: 'fracciones', text: `¿Cuánto es el ${p[0]} % de ${tot}?`, correct: String(ans), wrong: numWrong(ans, [tot - ans, tot / 2]).filter(x => x !== String(ans)), hint: `${p[0]} % es ${p[0] === 50 ? 'la mitad' : p[0] === 25 ? 'la mitad de la mitad' : 'el 100 % menos el 25 %'}: ${ans}`, key: 'x|p2' + p[0] + tot }); }
      const n = R.pick([4, 5, 6, 8, 10, 12]); let a = R.int(1, n - 2), b = R.int(1, n - a - 1 || 1); if (k === 'sub') { a = R.int(2, n - 1); b = R.int(1, a - 1); } const r = k === 'add' ? a + b : a - b;
      return build({ cat: 'fracciones', text: `${F(a, n)} ${k === 'add' ? '+' : '−'} ${F(b, n)} = ?`, correct: F(r, n), wrong: [F(r, n * 2), F(r + 1, n), F(r > 1 ? r - 1 : r + 2, n), F(a + b, n + n)], hint: `Mismo denominador: ${k === 'add' ? 'suma' : 'resta'} los numeradores: ${a} ${k === 'add' ? '+' : '−'} ${b} = ${r}`, big: true, key: 'x|f2' + k + a + b + n });
    }
    const k = R.pick(up() ? ['diff', 'diff', 'mixed', 'imp'] : ['imp', 'imp', 'mixed', 'mixed']);
    if (k === 'imp') { const d = R.pick([3, 4, 5, 6, 8]), good = [d + R.int(1, d), d], bad = [[R.int(1, d - 1), d], [R.int(1, d - 1), d + 1], [R.int(1, d - 2) || 1, d + 2]]; return build({ cat: 'fracciones', text: '¿Cuál de estas es una fracción IMPROPIA (mayor que 1)?', correct: F(...good), wrong: bad.map(x => F(...x)), hint: `Una fracción impropia tiene el numerador mayor que el denominador: ${good[0]}/${good[1]}`, big: true, key: 'x|im' + good + bad }); }
    if (k === 'mixed') { const d = R.pick([2, 3, 4, 5]), w = R.int(1, 3), r = R.int(1, d - 1), num = w * d + r; return build({ cat: 'fracciones', text: `Escribe ${F(num, d)} como número mixto`, correct: `${w} y ${r}/${d}`, wrong: [`${w + 1} y ${r}/${d}`, `${w} y ${d - r}/${d}`, `${w - 1 || 2} y ${r}/${d}`, `${r} y ${w}/${d}`], hint: `${num} ÷ ${d} = ${w} y sobran ${r}: ${w} enteros y ${r}/${d}`, key: 'x|mx' + num + d }); }
    const b = R.pick([2, 3, 4, 5]), m = R.pick([2, 3, 4]), d = b * m, a = R.int(1, b - 1), cc = R.int(1, d - 1), eq = a * m, r = eq + cc;
    return build({ cat: 'fracciones', text: `${F(a, b)} + ${F(cc, d)} = ?`, correct: F(r, d), wrong: [F(a + cc, b + d), F(r, b), F(r + 1, d), F(a + cc, d)], hint: `Pasa ${a}/${b} a denominador ${d}: ${a}/${b} = ${eq}/${d}; ${eq}/${d} + ${cc}/${d} = ${r}/${d}`, big: true, key: 'x|fd' + a + b + cc + d });
  },
  comparar(c) {
    if (c === 3 && !up()) return null;
    if (c === 3) { const set = new Set(); while (set.size < 4) set.add(R.int(-9, 9)); const arr = [...set], isMax = R.chance(.5), ans = isMax ? Math.max(...arr) : Math.min(...arr); return build({ cat: 'comparar', text: `¿Cuál es el número ${isMax ? 'MAYOR' : 'MENOR'}?`, correct: Z(ans), wrong: arr.filter(x => x !== ans).map(Z), hint: 'En los números negativos, cuanto más lejos del cero, menor es: −8 < −2 < 0 < 5', key: 'x|cn' + arr.sort() + isMax }); }
    const a = R.int(10, 99), b = R.int(10, 99); if (a === b) return null; return build({ cat: 'comparar', text: `${a} ${BLANK} ${b}`, correct: a > b ? '>' : '<', wrong: ['<', '>', '='].filter(x => x !== (a > b ? '>' : '<')), n: 3, order: ['<', '=', '>'], big: true, hint: `${a} ${a > b ? '>' : '<'} ${b}`, key: 'x|cs' + a + b });
  },
  medida(c) {
    if (c === 1) { const k = R.pick(['est', 'est', 'week']); if (k === 'est') { const e = R.pick(EST.filter(x => ['m', 'cm', 'kg', 'g', 'l', 'min'].includes(x[1]))); const fam = { m: ['cm', 'kg', 'l'], cm: ['m', 'kg', 'g'], kg: ['g', 'm', 'l'], g: ['kg', 'cm', 'l'], l: ['kg', 'm', 'cm'], min: ['m', 'kg', 'l'] }; return build({ cat: 'medida', text: `¿En qué unidad medirías ${e[0]}?`, correct: e[1], wrong: fam[e[1]], hint: `Para ${e[0]} lo más cómodo es ${e[1]}`, key: 'x|e1' + e[0] }); } const Q1 = R.pick([['¿Cuántos días tiene una semana?', 7], ['¿Cuántos meses tiene un año?', 12], ['¿Cuántas horas tiene un día?', 24], ['¿Cuántos minutos tiene una hora?', 60]]); return build({ cat: 'medida', text: Q1[0], correct: String(Q1[1]), wrong: numWrong(Q1[1], [Q1[1] + 2, Q1[1] * 2]), hint: `${Q1[0].replace('¿', '').replace('?', '')}: ${Q1[1]}`, key: 'x|wk' + Q1[1] }); }
    if (c === 2) {
      const k = R.pick(up() ? ['digital', 'sec', 'unit2', 'tool'] : ['digital', 'sec', 'tool', 'tool']);
      if (k === 'digital') { const h = R.int(1, 12), m = R.pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]); return build({ cat: 'medida', text: '¿Qué hora marca el reloj? (escríbela como un reloj digital)', visual: clockSvg(h, m), correct: digital(h, m), wrong: [digital(h, (m + 15) % 60), digital(h % 12 + 1, m), digital(((h + 10) % 12) + 1, m), digital(h, (m + 30) % 60)], hint: `La aguja corta señala el ${h} y la larga ${m} minutos: ${digital(h, m)}`, key: 'x|dg' + h + m }); }
      if (k === 'sec') { const n = R.int(1, 5); return build({ cat: 'medida', text: `${n} min = ${BLANK} s`, correct: String(n * 60), wrong: [n * 100, n * 10, n * 60 + 60, n * 30, n * 24].filter(x => x !== n * 60).map(String), hint: `1 minuto = 60 segundos: ${n} × 60 = ${n * 60}`, key: 'x|sc' + n }); }
      if (k === 'tool') { const T = R.pick([['la longitud de tu mesa', 'una regla o una cinta métrica'], ['lo que pesa una sandía', 'una balanza'], ['el agua de una jarra', 'un recipiente graduado'], ['lo que dura un recreo', 'un reloj'], ['la altura de una puerta', 'una cinta métrica']]), all = ['una regla o una cinta métrica', 'una balanza', 'un recipiente graduado', 'un reloj']; return build({ cat: 'medida', text: `¿Qué instrumento usarías para medir ${T[0]}?`, correct: T[1] === 'una cinta métrica' ? 'una regla o una cinta métrica' : T[1], wrong: all.filter(x => x !== (T[1] === 'una cinta métrica' ? 'una regla o una cinta métrica' : T[1])), hint: `Para medir ${T[0]} se usa ${T[1]}`, key: 'x|to' + T[0] }); }
      { const U2 = R.pick([['la superficie del suelo de un aula', 'm²', ['m', 'cm', 'l']], ['la superficie de un sello de correos', 'cm²', ['m', 'cm', 'km']], ['la superficie de un campo de fútbol', 'm²', ['m', 'cm²', 'kg']]]); return build({ cat: 'medida', text: `¿Con qué unidad medirías ${U2[0]}?`, correct: U2[1], wrong: U2[2], hint: `La superficie se mide en unidades cuadradas: ${U2[1]}`, key: 'x|u2' + U2[0] }); }
    }
    const k = R.pick(up() ? ['dm2', 'cm3', 'cl', 'perim', 'time'] : ['cl', 'time', 'perim']);
    if (k === 'cl') { const n = R.pick([1, 2, 3, 5]), u = R.pick([['l', 'cl', 100], ['l', 'dl', 10], ['dl', 'cl', 10]]); return build({ cat: 'medida', text: `${n} ${u[0]} = ${BLANK} ${u[1]}`, correct: String(n * u[2]), wrong: [n * u[2] * 10, n * u[2] / 10 || 1, n * 1000, n + u[2]].filter(x => x !== n * u[2]).map(String), hint: `1 ${u[0]} = ${u[2]} ${u[1]}`, key: 'x|cl' + n + u }); }
    if (k === 'dm2') { const n = R.pick([2, 3, 5, 7]), u = R.pick([['dm²', 'cm²', 100], ['m²', 'dm²', 100]]); return build({ cat: 'medida', text: `${n} ${u[0]} = ${BLANK} ${u[1]}`, correct: String(n * 100), wrong: [n * 10, n * 1000, n * 100 + 100, n * 10000].map(String), hint: `1 ${u[0]} = 100 ${u[1]}`, key: 'x|d2' + n + u }); }
    if (k === 'time') { const t = R.pick([['siglos', 100], ['décadas', 10], ['milenios', 1000]]), n = R.int(2, 6); return build({ cat: 'medida', text: `¿Cuántos años hay en ${n} ${t[0]}?`, correct: N(n * t[1]), wrong: [n * 10, n * 100, n * 1000, n * 12, n * 365].filter(x => x !== n * t[1]).map(N), hint: `1 ${t[0].slice(0, -1).replace('milenio', 'milenio')} = ${N(t[1])} años: ${n} × ${t[1]} = ${N(n * t[1])}`, key: 'x|ti' + t[0] + n }); }
    if (k === 'cm3') { const n = R.pick([1, 2, 3, 5]); return build({ cat: 'medida', text: `${n} dm³ = ${BLANK} cm³`, correct: N(n * 1000), wrong: [n * 100, n * 10, n * 10000].map(N), hint: `1 dm³ = 1 000 cm³ (un cubo de 10 cm de arista)`, key: 'x|c3' + n }); }
    const a = R.pick([[3, 5, 2, 6], [4, 4, 2, 6], [3, 7, 4, 6], [1, 9, 5, 5]]), A1 = a[0] * a[1], A2 = a[2] * a[3]; if (A1 === A2) return null; return build({ cat: 'medida', text: `Un rectángulo mide ${a[0]} × ${a[1]} cm y otro ${a[2]} × ${a[3]} cm. ¿Cuál tiene MÁS área?`, correct: A1 > A2 ? `El de ${a[0]} × ${a[1]}` : `El de ${a[2]} × ${a[3]}`, wrong: [A1 > A2 ? `El de ${a[2]} × ${a[3]}` : `El de ${a[0]} × ${a[1]}`], n: 2, min: 2, hint: `${a[0]} × ${a[1]} = ${A1} cm² y ${a[2]} × ${a[3]} = ${A2} cm²`, key: 'x|pa' + a });
  },
  geometria(c) {
    if (c === 1) return R.chance(.5) ? relQ() : sym1Q();
    if (c === 2) { const k = R.pick(up() ? ['ang', 'ang', 'poly', 'lines'] : ['lines', 'lines', 'ang']); if (k === 'ang') return angle2Q(); if (k === 'lines') return linesQ(); const n = R.int(7, 10); return build({ cat: 'geometria', text: '¿Cómo se llama este polígono?', visual: polyFig(n), correct: POLYNAMES[n], wrong: [5, 6, 7, 8, 9, 10].filter(x => x !== n).map(x => POLYNAMES[x]), hint: `${n} lados → ${POLYNAMES[n]}`, key: 'x|p2' + n + Math.random() }); }
    const k = R.pick(up() ? ['card', 'circ', 'circ2', 'circ'] : ['card', 'card']);
    if (k === 'card') { const s = R.int(0, 3), q = R.pick([[1, 'a la derecha', 90], [3, 'a la izquierda', 90], [2, 'media vuelta (180°)', 180]]), ans = q[2] === 180 ? DIRC[(s + 2) % 4] : DIRC[(s + q[0]) % 4]; return build({ cat: 'geometria', text: q[2] === 180 ? `Miras al ${DIRC[s]} y das ${q[1]}. ¿Hacia qué punto cardinal miras?` : `Miras al ${DIRC[s]} y giras 90° ${q[1]}. ¿Hacia qué punto cardinal miras?`, correct: ans, wrong: DIRC.filter(x => x !== ans), hint: q[2] === 180 ? 'Media vuelta: pasas al punto cardinal opuesto' : (q[0] === 1 ? 'Girar a la derecha sigue el orden norte → este → sur → oeste' : 'Girar a la izquierda va al revés: norte → oeste → sur → este'), key: 'x|cd' + s + q[1] }); }
    const d = R.int(2, 20); if (k === 'circ') return build({ cat: 'geometria', text: `Un círculo tiene un diámetro de ${d} cm. ¿Cuánto mide su circunferencia? (π ≈ 3,14)`, correct: D(Math.round(3.14 * d * 100) / 100) + ' cm', wrong: [d * 2, d * 3, d * 4, d + 3.14, d * 3.14 * 2].map(x => D(Math.round(x * 100) / 100) + ' cm').filter(x => x !== D(Math.round(3.14 * d * 100) / 100) + ' cm'), hint: `Circunferencia = π × diámetro ≈ 3,14 × ${d} = ${D(Math.round(3.14 * d * 100) / 100)} cm`, key: 'x|ci' + d });
    return build({ cat: 'geometria', text: `Una circunferencia mide aproximadamente ${D(Math.round(3.14 * d * 100) / 100)} cm. ¿Cuánto mide su diámetro? (π ≈ 3,14)`, correct: d + ' cm', wrong: [d * 2, d + 3, Math.round(d * 3.14), d / 2 | 0 || 1, d * 10].filter(x => x !== d).map(x => x + ' cm'), hint: `Diámetro = circunferencia ÷ 3,14 = ${d} cm`, key: 'x|c2' + d });
  },
  areas(c) { if (c === 2) return halfRectQ(); const l = R.pick([10, 12, 14, 16, 20]), pa = R.pick([3, 4, 5]); return null; },
  datos(c) {
    if (c === 1) return barC1Q();
    const var1 = R.chance(.35);
    if (var1) { const V = R.pick([['el color favorito', 'cualitativa'], ['la fruta que más te gusta', 'cualitativa'], ['el número de hermanos', 'cuantitativa'], ['la altura de una persona', 'cuantitativa'], ['el deporte favorito', 'cualitativa'], ['los puntos de un partido', 'cuantitativa']]); return build({ cat: 'datos', text: `En una encuesta se pregunta por ${V[0]}. ¿Qué tipo de variable es?`, correct: V[1], wrong: [V[1] === 'cualitativa' ? 'cuantitativa' : 'cualitativa'], n: 2, min: 2, hint: 'Cualitativa: se responde con una cualidad (palabra). Cuantitativa: se responde con un número', key: 'x|va' + V[0] }); }
    if (c === 2) { const k = R.pick(up() ? ['media', 'cmp'] : ['cmp']); if (k === 'media') { const n = 4, mean = R.int(2, 9), arr = []; let sum = mean * n; for (let i = 0; i < n - 1; i++) { const x = Math.max(1, mean + R.int(-2, 2)); arr.push(x); sum -= x; } if (sum < 1) return null; arr.push(sum); const sh = R.shuffle(arr); return build({ cat: 'datos', text: `Calcula la MEDIA de: ${sh.join(', ')}`, correct: String(mean), wrong: numWrong(mean, [Math.max(...arr), mean * n]), hint: `Suma: ${sh.join(' + ')} = ${mean * n}; ${mean * n} ÷ ${n} = ${mean}`, key: 'x|m2' + sh }); }
      const cols = R.shuffle(BALLS).slice(0, 2), cnt = [R.int(1, 4), R.int(5, 9)], sw = R.chance(.5), arr = sw ? [cnt[1], cnt[0]] : cnt, best = arr[0] > arr[1] ? 0 : 1; return build({ cat: 'datos', text: 'Sacas una bola sin mirar. ¿De qué color es más PROBABLE que salga?', visual: bagSvg(arr, cols), correct: cols[best][0], wrong: [cols[1 - best][0]], n: 2, min: 2, hint: `Hay ${arr[0]} bolas ${cols[0][0]}s y ${arr[1]} ${cols[1][0]}s: es más probable la que tiene más bolas`, key: 'x|cp' + arr + cols.map(x => x[0]) }); }
    const k = R.pick(up() ? ['med', 'pct', 'pct', 'rng'] : ['rng', 'med']);
    if (k === 'med') { const set = new Set(); while (set.size < 5) set.add(R.int(1, 20)); const arr = R.shuffle([...set]), s = [...arr].sort((a, b) => a - b); return build({ cat: 'datos', text: `Halla la MEDIANA de: ${arr.join(', ')}`, correct: String(s[2]), wrong: [s[1], s[3], Math.round(s.reduce((a, b) => a + b, 0) / 5), s[0], s[4]].filter(x => x !== s[2]).map(String), hint: `Ordena: ${s.join(', ')}. La mediana es el dato del centro: ${s[2]}`, key: 'x|md' + s }); }
    if (k === 'rng') { const arr = Array.from({ length: 5 }, () => R.int(2, 40)), mx = Math.max(...arr), mn = Math.min(...arr); if (mx === mn) return null; return build({ cat: 'datos', text: `Datos: ${arr.join(', ')}. ¿Cuál es el RANGO (diferencia entre el mayor y el menor)?`, correct: String(mx - mn), wrong: numWrong(mx - mn, [mx, mn, mx + mn]), hint: `${mx} − ${mn} = ${mx - mn}`, key: 'x|rg' + arr }); }
    const p = R.pick([[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [1, 10, 10]]), blue = p[1] - p[0]; return build({ cat: 'datos', text: `En una bolsa hay ${p[1]} bolas y ${p[0]} ${p[0] === 1 ? 'es roja' : 'son rojas'}. ¿Qué probabilidad hay de sacar una roja, en %?`, correct: p[2] + ' %', wrong: [10, 20, 25, 50, 75, 100].filter(x => x !== p[2]).map(x => x + ' %'), hint: `${p[0]}/${p[1]} = ${p[2]} %`, key: 'x|pp' + p });
  },
  secuencias(c) {
    if (c < 3) return null;
    const n = R.int(3, 9), a = R.int(2, 4), b = R.int(1, 9), r = n * a - b; return build({ cat: 'secuencias', text: `Pienso un número, lo multiplico por ${a} y le resto ${b}. Me sale ${r}. ¿Qué número pensé?`, correct: String(n), wrong: numWrong(n, [r, r - b, n + a]), hint: `Ve hacia atrás: ${r} + ${b} = ${r + b}; ${r + b} ÷ ${a} = ${n}`, key: 'x|bk' + n + a + b });
  }
};

/* ---------- PREGUNTAS MUY FÁCILES (ciclos 2 y 3): se mezclan para que casi todo el alumnado pueda acertarlas ---------- */
const EASY_P = 0.30, EXTRA_P = 0.30, MORE_P = 0.28;
const EASY = {
  sumres(c) {
    const k = R.pick(['tens', 'small', 'dbl', 'sub', 'miss']);
    let a, b, ans, text, hint;
    if (k === 'tens') { const m = c === 2 ? 10 : 100; a = R.int(1, 9) * m; b = R.int(1, 9) * m; ans = a + b; text = `${N(a)} + ${N(b)} = ?`; hint = `${a / m} + ${b / m} = ${ans / m}, así que ${N(a)} + ${N(b)} = ${N(ans)}`; }
    else if (k === 'small') { if (c === 2) { a = R.int(1, 8) * 10 + R.int(0, 5); b = R.int(1, 9 - (a % 10)); } else { a = R.int(2, 9) * 100 + R.int(1, 5) * 10; b = R.int(1, 4) * 10; } ans = a + b; text = `${N(a)} + ${N(b)} = ?`; hint = `${N(a)} + ${N(b)} = ${N(ans)}`; }
    else if (k === 'dbl') { a = c === 2 ? R.int(2, 25) : R.int(10, 250); ans = a * 2; text = `¿Cuál es el doble de ${N(a)}?`; hint = `${N(a)} + ${N(a)} = ${N(ans)}`; }
    else if (k === 'sub') { if (c === 2) { a = R.int(2, 9) * 10 + R.int(5, 9); b = R.int(1, 5); } else { a = R.int(3, 10) * 100; b = R.int(1, a / 100 - 1) * 100; } ans = a - b; text = `${N(a)} − ${N(b)} = ?`; hint = `${N(a)} − ${N(b)} = ${N(ans)}`; }
    else { const m = c === 2 ? 10 : 100; a = R.int(1, 8) * m; b = R.int(1, 9 - a / m) * m; ans = b; text = `${N(a)} + ${BLANK} = ${N(a + b)}`; hint = `Lo que falta: ${N(a + b)} − ${N(a)} = ${N(b)}`; }
    return build({ cat: 'sumres', text, correct: N(ans), wrong: numWrong(ans, [ans + 10, ans - 10]), hint, key: 'e|' + text });
  },
  tablas(c) {
    const t = R.pick(c === 2 ? [1, 2, 5, 10, 10] : [10, 100, 2, 5]), a = R.int(2, c === 2 ? 10 : 12), p = a * t;
    if (t <= 10 && R.chance(.4)) return build({ cat: 'tablas', text: `${a} × ${BLANK} = ${N(p)}`, correct: N(t), wrong: numWrong(t, [a, p / 10 | 0]), hint: `${N(p)} ÷ ${a} = ${t}`, key: 'e|tm' + a + 'x' + t });
    return build({ cat: 'tablas', text: `${a} × ${N(t)} = ?`, correct: N(p), wrong: numWrong(p, [a + t, a * (t + 1)]), hint: t === 10 || t === 100 ? `Por ${t}: añade ${t === 10 ? 'un cero' : 'dos ceros'} → ${N(p)}` : t === 1 ? `Por 1 el número no cambia: ${p}` : `${a} × ${t} = ${p}`, key: 'e|t' + a + 'x' + t });
  },
  divisiones(c) {
    const d = R.pick(c === 2 ? [1, 2, 5, 10] : [2, 5, 10]), q = R.int(2, c === 2 ? 10 : 20), n = d * q;
    if (R.chance(.4)) return build({ cat: 'divisiones', text: `${BLANK} ÷ ${d} = ${q}`, correct: N(n), wrong: numWrong(n, [q + d, d * (q + 1)]), hint: `${q} × ${d} = ${n}`, key: 'e|dm' + n + 'd' + d });
    return build({ cat: 'divisiones', text: `${n} ÷ ${d} = ?`, correct: N(q), wrong: numWrong(q, [d, q + d]), hint: `${d} × ${q} = ${n}, así que ${n} ÷ ${d} = ${q}`, key: 'e|d' + n + 'd' + d });
  },
  secuencias(c) {
    if (R.chance(.4)) { const q = seqShape(1, 0); if (q) { q.key = 'e|' + q.key; return q; } }
    const st = R.pick(c === 2 ? [1, 2, 10] : [5, 10, 100, 2]), s = R.int(0, 6) * (st >= 10 ? 1 : 1), seq = []; const start = c === 2 ? R.int(0, 20) : R.int(0, 9) * st;
    for (let i = 0; i < 5; i++) seq.push(start + st * i);
    const bi = R.int(1, 4), ans = seq[bi];
    return build({ cat: 'secuencias', text: '¿Qué número falta en la secuencia?', visual: seqBox(seq, bi), correct: N(ans), wrong: numWrong(ans, [ans + st, ans - st, ans + 2 * st]), hint: `Cada número sube de ${N(st)} en ${N(st)}`, key: 'e|s' + seq.join(',') + bi });
  },
  comparar(c) {
    const isMax = R.chance(.5), lens = c === 2 ? [[1, 9], [10, 99], [100, 999], [1000, 9999]] : [[100, 999], [1000, 9999], [10000, 99999], [100000, 999999]];
    const arr = lens.map(l => R.int(l[0], l[1])), ans = isMax ? Math.max(...arr) : Math.min(...arr);
    return build({ cat: 'comparar', text: `¿Cuál es el número ${isMax ? 'MAYOR' : 'MENOR'}?`, correct: N(ans), wrong: arr.filter(v => v !== ans).map(N), hint: `Cuantas más cifras tiene un número, mayor es. ${isMax ? 'Mayor' : 'Menor'}: ${N(ans)}`, key: 'e|c' + arr.join(',') + isMax });
  },
  fracciones(c) {
    const k = R.pick(['read', 'half', 'quarter', 'tenth']);
    if (k === 'read') { const n = R.pick([2, 3, 4]), kk = n === 2 ? 1 : R.pick(n === 3 ? [1, 2] : [1, 2, 3]); const v = R.pick([pie, bar]); return build({ cat: 'fracciones', text: '¿Qué fracción está pintada?', visual: v(n, kk), correct: F(kk, n), wrong: [F(n - kk, n), F(kk, n + 1), F(kk + 1, n), F(n, kk)], hint: `Hay ${n} partes iguales y ${kk} están pintadas: ${kk}/${n}`, big: true, key: 'e|fr' + n + kk + (v === pie ? 'p' : 'b') }); }
    const q = k === 'half' ? 2 : k === 'quarter' ? 4 : 10, u = R.int(2, c === 2 ? 5 : 12), tot = q * u;
    return build({ cat: 'fracciones', text: `¿Cuánto es ${F(1, q)} de ${tot}?`, correct: N(u), wrong: numWrong(u, [tot - u, tot / 2 | 0]), hint: `Divide entre ${q}: ${tot} ÷ ${q} = ${u}`, key: 'e|fo' + q + tot });
  },
  geometria(c) {
    if (c === 3 && R.chance(.5)) { const deg = R.pick([90, 30, 45, 60, 120, 180]), type = deg < 90 ? 'agudo' : deg === 90 ? 'recto' : deg < 180 ? 'obtuso' : 'llano'; return build({ cat: 'geometria', text: `Este ángulo mide ${deg}°. ¿Qué tipo de ángulo es?`, visual: deg === 180 ? svg('0 0 120 110', `<line x1="14" y1="80" x2="106" y2="80" ${STW}/><circle cx="60" cy="80" r="4" fill="#ff3d9a"/>`, 'fig') : angleSvg(deg), correct: type, wrong: ['agudo', 'recto', 'obtuso', 'llano'].filter(x => x !== type), hint: 'Agudo < 90°, recto = 90°, obtuso entre 90° y 180°, llano = 180°', key: 'e|g3a' + deg }); }
    const q = geometria(1, R.pick([0, .2, .4])); if (q) q.key = 'e|' + q.key; return q;
  },
  medida(c) {
    if (c === 2) return medida(1, R.pick([0, .2, .4]));
    const U = R.pick([['m', 'cm', 100], ['kg', 'g', 1000], ['l', 'ml', 1000], ['h', 'min', 60]]), n = R.int(1, 4);
    return build({ cat: 'medida', text: `${n} ${U[0]} = ${BLANK} ${U[1]}`, correct: N(n * U[2]), wrong: [n * U[2] * 10, n * U[2] / 10, n * 10, n + U[2]].filter(x => x !== n * U[2]).map(N), hint: `1 ${U[0]} = ${U[2]} ${U[1]}, así que ${n} ${U[0]} = ${n * U[2]} ${U[1]}`, key: 'e|mu' + U + n });
  },
  datos(c) { return datos(1, R.pick([0, .2])); },
  areas(c) {
    if (c === 2) { const q = areas(1, R.pick([0, .1, .3])); if (q) q.key = 'e|' + q.key; return q; }
    const l = R.int(2, 6), w = R.int(2, 6), sq = R.chance(.4);
    return build({ cat: 'areas', text: sq ? `Un cuadrado tiene lados de ${l} cm. ¿Cuál es su área?` : `Un rectángulo mide ${l} cm de largo y ${w} cm de ancho. ¿Cuál es su área?`, correct: `${sq ? l * l : l * w} cm²`, wrong: [sq ? 4 * l : 2 * (l + w), sq ? 2 * l : l + w, (sq ? l * l : l * w) + 2, (sq ? l * l : l * w) - 2, (sq ? l * l : l * w) + l].filter(x => x > 0 && x !== (sq ? l * l : l * w)).map(x => x + ' cm²'), hint: sq ? `Área = lado × lado = ${l} × ${l} = ${l * l} cm²` : `Área = largo × ancho = ${l} × ${w} = ${l * w} cm²`, key: 'e|a3' + sq + l + w });
  }
};


/* ---------- MÁS PREGUNTAS POR CURSO (1.º a 6.º) ---------- */
const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const hm = (h, m) => ((((h - 1) % 12) + 12) % 12 + 1) + ':' + String(m).padStart(2, '0');
const du = (t, u) => `${t} ${t === 1 ? 'decena' : 'decenas'} y ${u} ${u === 1 ? 'unidad' : 'unidades'}`;
const mq = (cat, key, text, correct, wrong, hint, o) => build(Object.assign({ cat, text, correct, wrong, hint, key: 'n|' + key }, o || {}));
const uniq = a => [...new Set(a)];
const perms3 = a => [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(p => p.map(i => a[i]));
const MORE = {
  sumres(g) {
    const f = R.pick([null, ['tens', 'three', 'to10', 'tens'], ['tens', 'three', 'plus10', 'to100', 'plus10'], ['round', 'plus100', 'price', 'mentalSub'], ['round', 'mentalSub', 'price', 'plus100'], ['ops', 'roundDec', 'mentalSub2'], ['ops2', 'roundBig', 'roundDec', 'ops2']].slice(g, g + 1)[0]);
    if (f === 'tens') { const t = R.int(1, g === 1 ? 3 : 9), u = R.int(1, 9), n = t * 10 + u; return mq('sumres', 'tn' + n, `¿Cuántas decenas y unidades tiene el número ${n}?`, du(t, u), uniq([du(u, t), du(t + 1, u), du(t, u === 9 ? 8 : u + 1), du(t, 0).replace(' y 0 unidades', ' y 0 unidades')]).filter(x => x !== du(t, u)), `${n} = ${t * 10} + ${u}: ${du(t, u)}`); }
    if (f === 'three') { const lim = g === 1 ? 5 : 20, a = R.int(g === 1 ? 1 : 2, lim), b = R.int(g === 1 ? 1 : 2, lim), c = R.int(g === 1 ? 1 : 2, lim), s = a + b + c; return mq('sumres', 'th' + a + b + c, `${a} + ${b} + ${c} = ?`, N(s), numWrong(s, [a + b, b + c, s + a]), `${a} + ${b} = ${a + b}; ${a + b} + ${c} = ${s}`); }
    if (f === 'to10') { const a = R.int(1, 9); return mq('sumres', 't10' + a, `${a} + ${BLANK} = 10`, String(10 - a), numWrong(10 - a, [a, 10]), `Desde ${a} hasta 10 faltan ${10 - a}: ${a} + ${10 - a} = 10`); }
    if (f === 'plus10') { const n = R.int(11, 89), up = R.chance(.5), ans = up ? n + 10 : n - 10; return mq('sumres', 'p10' + n + up, `${n} ${up ? '+' : '−'} 10 = ?`, String(ans), uniq([ans + 1, ans - 1, ans + 10, ans - 10, up ? n - 10 : n + 10, n].filter(x => x > 0 && x !== ans).map(String)), `${up ? 'Sumar' : 'Restar'} 10 cambia solo las decenas: ${n} ${up ? '+' : '−'} 10 = ${ans}`); }
    if (f === 'to100') { const a = R.int(11, 95); return mq('sumres', 't100' + a, `${a} + ${BLANK} = 100`, String(100 - a), numWrong(100 - a, [a, 100 - a + 10]), `100 − ${a} = ${100 - a}`); }
    if (f === 'round') {
      const k = g === 3 ? 10 : R.pick([10, 100]), n = g === 3 ? R.int(11, 99) : R.int(111, 9999); if (n % k === k / 2) return null;
      const ans = Math.round(n / k) * k, lo = Math.floor(n / k) * k, hi = lo + k, other = ans === lo ? hi : lo;
      return mq('sumres', 'rd' + n + k, `Redondea ${N(n)} a la ${k === 10 ? 'decena' : 'centena'} más cercana`, N(ans), uniq([other, ans + k, ans - k, n].filter(x => x > 0 && x !== ans).map(N)), `${N(n)} está entre ${N(lo)} y ${N(hi)}; está más cerca de ${N(ans)}`);
    }
    if (f === 'plus100') { const k = R.pick(g === 3 ? [10, 100] : [100, 1000]), n = g === 3 ? R.int(120, 890) : R.int(1200, 8900), ans = n + k; return mq('sumres', 'pl' + n + k, `${N(n)} + ${N(k)} = ?`, N(ans), numWrong(ans, [ans + k, ans - 2 * k, n + 10 * k]), `Sumar ${N(k)} cambia solo ${k === 10 ? 'las decenas' : k === 100 ? 'las centenas' : 'las unidades de millar'}: ${N(ans)}`); }
    if (f === 'price') { const a = R.int(2, g === 3 ? 15 : 40), b = R.int(2, g === 3 ? 15 : 40), s = a + b; return mq('sumres', 'pr' + a + b, `Un cuaderno cuesta ${a} € y un estuche ${b} €. ¿Cuánto cuestan los dos?`, s + ' €', numWrong(s, [a, b]).map(x => x + ' €'), `${a} + ${b} = ${s} €`); }
    if (f === 'mentalSub') { const x = g === 3 ? R.pick([15, 25, 35, 45, 65, 75]) : R.pick([150, 250, 350, 450, 275, 625, 125, 375]), t = g === 3 ? 100 : 1000, ans = t - x; return mq('sumres', 'ms' + x + t, `${N(t)} − ${N(x)} = ?`, N(ans), numWrong(ans, [x, ans + 100]), `${N(t)} − ${N(x)} = ${N(ans)}. Truco: ${N(x)} + ${N(ans)} = ${N(t)}`); }
    if (f === 'mentalSub2') { const a = R.int(2, 9) * 1000, b = R.pick([250, 500, 750, 1250, 1750]); const ans = a - b; return mq('sumres', 'm2' + a + b, `${N(a)} − ${N(b)} = ?`, N(ans), numWrong(ans, [a - b - 1000, a - b + 500]), `${N(a)} − ${N(b)} = ${N(ans)}`); }
    if (f === 'ops') { const a = R.int(2, 20), b = R.int(2, 9), c = R.int(2, 9), minus = R.chance(.4) && a > b * c; const ans = minus ? a - b * c : a + b * c; return mq('sumres', 'op' + a + b + c + minus, `${a} ${minus ? '−' : '+'} ${b} × ${c} = ?`, String(ans), uniq([(minus ? a - b : a + b) * c, a + b + c, a * b + c, ans + b, ans - c].filter(x => x > 0 && x !== ans).map(String)), `Primero se multiplica: ${b} × ${c} = ${b * c}; después ${minus ? 'se resta' : 'se suma'}: ${a} ${minus ? '−' : '+'} ${b * c} = ${ans}`); }
    if (f === 'ops2') { const a = R.int(2, 12), b = R.int(2, 9), c = R.int(2, 9), par = R.chance(.6), ans = par ? (a + b) * c : a + b * c; return mq('sumres', 'o2' + a + b + c + par, par ? `(${a} + ${b}) × ${c} = ?` : `${a} + ${b} × ${c} = ?`, String(ans), uniq([par ? a + b * c : (a + b) * c, a + b + c, a * b * c, ans + c, ans - b].filter(x => x > 0 && x !== ans).map(String)), par ? `Primero el paréntesis: ${a} + ${b} = ${a + b}; luego ${a + b} × ${c} = ${ans}` : `Primero la multiplicación: ${b} × ${c} = ${b * c}; luego ${a} + ${b * c} = ${ans}`); }
    if (f === 'roundDec') { const n = R.int(101, 999) / 100, h = Math.round(n * 100) % 10; if (h === 5) return null; const unit = g === 6, ans = unit ? Math.round(n) : Math.round(n * 10) / 10, step = unit ? 1 : .1, lo = unit ? Math.floor(n) : Math.floor(n * 10) / 10, other = ans === lo ? Math.round((lo + step) * 100) / 100 : lo; return mq('sumres', 'rdd' + n + unit, `Redondea ${D(n)} a ${unit ? 'las unidades' : 'las décimas'}`, D(ans), uniq([other, ans + step, ans - step, n].filter(x => x > 0 && x !== ans).map(x => D(Math.round(x * 100) / 100))), `${D(n)} está entre ${D(lo)} y ${D(Math.round((lo + step) * 100) / 100)}; está más cerca de ${D(ans)}`); }
    if (f === 'roundBig') { const k = R.pick([1000, 10000]), n = R.int(10001, 999999); if (n % k === k / 2) return null; const ans = Math.round(n / k) * k, lo = Math.floor(n / k) * k, other = ans === lo ? lo + k : lo; return mq('sumres', 'rb' + n + k, `Redondea ${N(n)} a ${k === 1000 ? 'las unidades de millar' : 'las decenas de millar'}`, N(ans), uniq([other, ans + k, ans - k, n].filter(x => x > 0 && x !== ans).map(N)), `${N(n)} está entre ${N(lo)} y ${N(lo + k)}; está más cerca de ${N(ans)}`); }
    return null;
  },
  comparar(g) {
    const f = R.pick([null, ['ba', 'eo', 'order'], ['ba', 'eo', 'order'], ['ba', 'order', 'place'], ['ba', 'order', 'place'], ['between', 'order', 'place'], ['between', 'order', 'place']][g]);
    const hi = [0, 20, 99, 999, 9999][g];
    if (f === 'ba') { const n = R.int(3, hi - 2), k = R.pick(['antes', 'despues', 'entre']); if (k === 'antes') return mq('comparar', 'ba' + n + k, `¿Qué número va justo ANTES del ${N(n)}?`, N(n - 1), numWrong(n - 1, [n + 1, n]), `Antes del ${N(n)} va el ${N(n - 1)}`); if (k === 'despues') return mq('comparar', 'ba' + n + k, `¿Qué número va justo DESPUÉS del ${N(n)}?`, N(n + 1), numWrong(n + 1, [n - 1, n]), `Después del ${N(n)} va el ${N(n + 1)}`); return mq('comparar', 'ba' + n + k, `¿Qué número está ENTRE el ${N(n)} y el ${N(n + 2)}?`, N(n + 1), numWrong(n + 1, [n, n + 2]), `Entre ${N(n)} y ${N(n + 2)} está el ${N(n + 1)}`); }
    if (f === 'between') { const fine = g === 6, a = fine ? R.int(300, 899) / 100 : R.int(10, 89) / 10, st = fine ? .02 : .2, mid = Math.round((a + st / 2) * 100) / 100, top = Math.round((a + st) * 100) / 100, s = fine ? .01 : .1; return mq('comparar', 'bw' + a + fine, `¿Qué número está entre ${D(a)} y ${D(top)}?`, D(mid), uniq([a, top, Math.round((top + s) * 100) / 100, Math.round((a - s) * 100) / 100].map(D)).filter(x => x !== D(mid)), `Entre ${D(a)} y ${D(top)} está ${D(mid)}`); }
    if (f === 'eo') { const even = R.chance(.5), lim = g === 1 ? 20 : 99, ok = (R.int(1, lim / 2 | 0)) * 2 + (even ? 0 : -1), bad = new Set(); if (ok < 1) return null; while (bad.size < 3) { const x = R.int(1, lim); if ((x % 2 === 0) !== even && x !== ok) bad.add(x); } return mq('comparar', 'eo' + ok + [...bad] + even, `¿Cuál de estos números es ${even ? 'PAR' : 'IMPAR'}?`, String(ok), [...bad].map(String), `${even ? 'Los pares acaban en 0, 2, 4, 6 u 8' : 'Los impares acaban en 1, 3, 5, 7 o 9'}: ${ok}`); }
    if (f === 'order') {
      const asc = R.chance(.6); let vals, fmt = N;
      if (g <= 4) { const m = [0, 20, 99, 999, 9999][g], s = new Set(); while (s.size < 3) s.add(R.int(g === 1 ? 1 : 10, m)); vals = [...s]; }
      else if (g === 5) { const s = new Set(); while (s.size < 3) s.add(R.int(10, 999) / 100); vals = [...s]; fmt = D; }
      else { const s = new Set(); while (s.size < 3) s.add(R.int(-9, 9)); vals = [...s]; fmt = Z; }
      const sorted = vals.slice().sort((a, b) => asc ? a - b : b - a), correct = sorted.map(fmt).join(', ');
      const wrong = perms3(sorted).map(p => p.map(fmt).join(', ')).filter(x => x !== correct);
      return mq('comparar', 'od' + vals + asc, `Ordena de ${asc ? 'menor a mayor' : 'mayor a menor'}: ${R.shuffle(vals).map(fmt).join(', ')}`, correct, wrong, `${asc ? 'De menor a mayor' : 'De mayor a menor'}: ${correct}`, { big: true });
    }
    if (f === 'place') {
      if (g <= 4) { const digs = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, g === 3 ? 4 : 5), n = Number(digs.join('')), i = R.int(0, digs.length - 1), p = digs.length - 1 - i, d = digs[i], ans = d * 10 ** p; return mq('comparar', 'pl' + n + d, `En el número ${N(n)}, ¿qué valor tiene la cifra ${d}?`, N(ans), digs.map((_, j) => digs.length - 1 - j).filter(q => q !== p).map(q => N(d * 10 ** q)).slice(0, 4), `La cifra ${d} ocupa el lugar de ${['las unidades', 'las decenas', 'las centenas', 'las unidades de millar', 'las decenas de millar'][p]}: vale ${N(ans)}`); }
      const digs = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, g === 5 ? 4 : 5), ip = g === 5 ? 2 : 2, n = Math.round(Number(digs.slice(0, ip).join('') + '.' + digs.slice(ip).join('')) * 1e5) / 1e5, i = R.int(0, digs.length - 1), p = ip - 1 - i, d = digs[i], val = Math.round(d * 10 ** p * 1e5) / 1e5; return mq('comparar', 'pd' + n + d, `En el número ${D(n)}, ¿qué valor tiene la cifra ${d}?`, D(val), digs.map((_, j) => ip - 1 - j).filter(q => q !== p).map(q => D(Math.round(d * 10 ** q * 1e5) / 1e5)).slice(0, 4), `La cifra ${d} está en el lugar de ${['las milésimas', 'las centésimas', 'las décimas', 'las unidades', 'las decenas'][p + 3]}: vale ${D(val)}`);
    }
    return null;
  },
  secuencias(g) {
    if (g <= 2) { const st = R.pick(g === 1 ? [1, 2, 5, 10] : [2, 3, 5, 10]), down = g === 2 && R.chance(.4), s = down ? st * R.int(8, 14) : R.int(0, 4) * st, a = s, b = down ? s - st : s + st, c = down ? s - 2 * st : s + 2 * st, ans = down ? s - 3 * st : s + 3 * st; if (ans < 0) return null; return mq('secuencias', 'ct' + s + st + down, `Cuenta de ${st} en ${st}${down ? ' hacia atrás' : ''}: ${a}, ${b}, ${c}… ¿Qué número sigue?`, String(ans), numWrong(ans, [ans + st, ans - st, c]), `Cada número ${down ? 'baja' : 'sube'} ${st}: ${c} ${down ? '−' : '+'} ${st} = ${ans}`); }
    if (g <= 4) { const a = g === 3 ? R.int(1, 20) : R.int(10, 100), k = g === 3 ? R.int(2, 5) : R.int(6, 12), n = g === 3 ? R.int(4, 6) : R.int(5, 8), ans = a + k * (n - 1), list = Array.from({ length: Math.min(4, n) }, (_, i) => a + k * i).join(', '); return mq('secuencias', 'ru' + a + k + n, `Una secuencia empieza en ${a} y cada número es ${k} más que el anterior. ¿Qué número ocupa el lugar ${n}.º?`, String(ans), numWrong(ans, [a + k * n, a + k * (n - 2), a * k]), `Se suma ${k} cada vez: ${list}… y en el lugar ${n}.º está ${ans}`); }
    if (g === 5 || R.chance(.5)) { const m = R.pick([2, 3]), c = R.pick([0, 1, 2]), s0 = R.int(1, 3), seq = [s0]; for (let i = 1; i < 5; i++) seq.push(seq[i - 1] * m + c); return mq('secuencias', 'r2' + seq, '¿Qué número falta en la secuencia?', N(seq[4]), numWrong(seq[4], [seq[3] + seq[2], seq[3] * (m + 1) + c, seq[4] + m]), `Cada número es el anterior × ${m}${c ? ' + ' + c : ''}: ${seq[3]} × ${m}${c ? ' + ' + c : ''} = ${seq[4]}`, { visual: seqBox(seq, 4) }); }
    const a = R.int(2, 9), k = R.int(3, 8), n = R.pick([10, 12, 15, 20]), ans = a + k * (n - 1); return mq('secuencias', 'nt' + a + k + n, `En la secuencia ${[0, 1, 2, 3].map(i => a + k * i).join(', ')}… ¿qué número ocupa el lugar ${n}.º?`, String(ans), numWrong(ans, [a + k * n, a + k * (n - 2), a + k * n - 1]), `Se suma ${k} cada vez. En el lugar ${n}.º se han sumado ${n - 1} veces ${k}: ${a} + ${k} × ${n - 1} = ${ans}`);
  },
  medida(g) {
    const f = R.pick([null, ['cal', 'coins', 'cmp'], ['cal', 'coins', 'dur'], ['coins', 'dur', 'conv'], ['dur', 'conv', 'conv'], ['dur', 'conv'], ['dur', 'conv']][g]);
    if (f === 'cal') { if (g === 1 || R.chance(.4)) { const i = R.int(0, 6), after = R.chance(.5); return mq('medida', 'cd' + i + after, after ? `Hoy es ${DAYS[i]}. ¿Qué día será mañana?` : `Hoy es ${DAYS[i]}. ¿Qué día fue ayer?`, DAYS[(i + (after ? 1 : 6)) % 7], DAYS.filter((_, j) => j !== (i + (after ? 1 : 6)) % 7 && j !== i), `Los días van en orden: lunes, martes, miércoles, jueves, viernes, sábado, domingo`); } const i = R.int(0, 11), after = R.chance(.5), ans = MONTHS[(i + (after ? 1 : 11)) % 12]; return mq('medida', 'cm' + i + after, `¿Qué mes viene ${after ? 'DESPUÉS de' : 'ANTES de'} ${MONTHS[i]}?`, ans, MONTHS.filter(m => m !== ans && m !== MONTHS[i]), `Los meses van en orden: ${MONTHS.slice(0, 6).join(', ')}…`); }
    if (f === 'coins') {
      if (g === 3) { const n = R.pick([2, 4, 6, 8, 10]); return mq('medida', 'c50' + n, `Tienes ${n} monedas de 50 céntimos. ¿Cuántos euros son?`, D(n / 2) + ' €', [n, n / 2 + 1, n / 2 - .5, n * 5, n / 4].filter(x => x > 0 && x !== n / 2).map(x => D(x) + ' €'), `Cada 2 monedas de 50 céntimos hacen 1 €: ${n} ÷ 2 = ${D(n / 2)} €`); }
      const a = R.int(1, 3), b = R.int(1, 3), c5 = g === 2 ? R.int(1, 2) : 0, t = 2 * a + b + 5 * c5, p = (k, s, pl) => `${k} ${k === 1 ? s : pl}`;
      return mq('medida', 'cn' + a + b + c5, `Tienes ${c5 ? p(c5, 'billete', 'billetes') + ' de 5 €, ' : ''}${p(a, 'moneda', 'monedas')} de 2 € y ${p(b, 'moneda', 'monedas')} de 1 €. ¿Cuántos euros tienes?`, t + ' €', numWrong(t, [a + b + c5, 2 * a + b]).map(x => x + ' €'), `${c5 ? c5 * 5 + ' + ' : ''}${2 * a} + ${b} = ${t} €`);
    }
    if (f === 'cmp') { const P = R.pick([['un elefante', 'un ratón'], ['un camión', 'una bicicleta'], ['una sandía', 'una cereza'], ['un coche', 'un patinete'], ['una ballena', 'un pez payaso']]), sw = R.chance(.5); return mq('medida', 'cp' + P[0] + sw, sw ? '¿Qué pesa MENOS?' : '¿Qué pesa MÁS?', sw ? P[1] : P[0], [sw ? P[0] : P[1]], sw ? `${P[1]} pesa menos` : `${P[0]} pesa más`, { n: 2, min: 2 }); }
    if (f === 'dur') {
      let h, m0, dm, text, ans, hint;
      if (g === 2) { h = R.int(1, 9); const d = R.int(1, 3); m0 = 0; dm = d * 60; text = `La película empieza a las ${hm(h, 0)} y dura ${d} ${d === 1 ? 'hora' : 'horas'}. ¿A qué hora termina?`; }
      else if (g === 3) { h = R.int(1, 9); m0 = R.pick([0, 30]); dm = R.pick([30, 60, 90]); text = `La clase empieza a las ${hm(h, m0)} y dura ${dm === 90 ? '1 hora y 30 minutos' : dm === 60 ? '1 hora' : '30 minutos'}. ¿A qué hora termina?`; }
      else if (g === 4) { h = R.int(1, 9); m0 = R.pick([10, 15, 20, 40, 45]); dm = R.pick([20, 30, 40, 50]); text = `Una excursión sale a las ${hm(h, m0)} y dura ${dm} minutos. ¿A qué hora llega?`; }
      else if (g === 5) { h = R.int(1, 9); m0 = R.pick([15, 30, 45, 50]); dm = R.pick([75, 80, 100, 105, 130]); text = `Un partido empieza a las ${hm(h, m0)} y dura ${Math.floor(dm / 60)} h ${dm % 60} min. ¿A qué hora termina?`; }
      else { h = R.int(1, 9); m0 = R.pick([0, 15, 30, 45]); dm = R.pick([95, 110, 125, 140, 155]); const tt = h * 60 + m0 + dm, eh = Math.floor(tt / 60), em = tt % 60; return mq('medida', 'du6' + h + m0 + dm, `Una película empieza a las ${hm(h, m0)} y termina a las ${hm(eh, em)}. ¿Cuánto dura?`, `${Math.floor(dm / 60)} h ${dm % 60} min`, uniq([dm + 15, dm - 15, dm + 30, dm - 20, dm + 60].map(x => `${Math.floor(x / 60)} h ${x % 60} min`)).filter(x => x !== `${Math.floor(dm / 60)} h ${dm % 60} min`), `De ${hm(h, m0)} a ${hm(eh, em)} pasan ${dm} min = ${Math.floor(dm / 60)} h ${dm % 60} min`); }
      const tt = h * 60 + m0 + dm, eh = Math.floor(tt / 60), em = tt % 60, ok = hm(eh, em);
      return mq('medida', 'du' + g + h + m0 + dm, text, ok, uniq([hm(eh + 1, em), hm(eh - 1, em), hm(eh, (em + 30) % 60), hm(eh, (em + 15) % 60), hm(eh, (em + 45) % 60)]).filter(x => x !== ok), `${hm(h, m0)} + ${dm} min = ${ok}`);
    }
    if (f === 'conv') {
      if (g <= 4) { const U = g === 3 ? [['m', 'cm', 100], ['cm', 'mm', 10]] : [['km', 'm', 1000], ['kg', 'g', 1000], ['h', 'min', 60], ['m', 'cm', 100]], u = R.pick(U), n = R.int(2, 9), ans = n * u[2]; return mq('medida', 'cv' + n + u, `${n} ${u[0]} = ${BLANK} ${u[1]}`, N(ans), uniq([ans * 10, ans / 10, n + u[2], ans + u[2]]).filter(x => x > 0 && x !== ans).map(N), `1 ${u[0]} = ${N(u[2])} ${u[1]}: ${n} × ${N(u[2])} = ${N(ans)}`); }
      if (g === 5) { const u = R.pick([['l', 'ml', 1000], ['m', 'cm', 100], ['kg', 'g', 1000], ['km', 'm', 1000]]), x = R.pick([.5, 1.5, 2.5, .25, .75, 3.5]), ans = Math.round(x * u[2]); return mq('medida', 'cd5' + x + u, `${D(x)} ${u[0]} = ${BLANK} ${u[1]}`, N(ans), uniq([ans * 10, ans / 10, ans + u[2], Math.round(x * 10)]).filter(v => v > 0 && v !== ans).map(N), `1 ${u[0]} = ${N(u[2])} ${u[1]}: ${D(x)} × ${N(u[2])} = ${N(ans)}`); }
      const u = R.pick([['m', 'km', 1000], ['g', 'kg', 1000], ['ml', 'l', 1000], ['cm', 'm', 100]]), a = R.pick([500, 2500, 750, 1500, 3200, 250, 4500, 1250]), ans = Math.round(a / u[2] * 1000) / 1000; return mq('medida', 'cr6' + a + u, `${N(a)} ${u[0]} = ${BLANK} ${u[1]}`, D(ans), uniq([ans * 10, ans / 10, a / u[2] * 100, ans + 1]).filter(v => v > 0 && v !== ans).map(x => D(Math.round(x * 1000) / 1000)), `${N(u[2])} ${u[0]} = 1 ${u[1]}: ${N(a)} ÷ ${N(u[2])} = ${D(ans)}`);
    }
    return null;
  },
  areas(g) {
    if (g <= 2) return null;
    const f = R.pick([null, null, null, ['perimSq', 'areaRect'], ['perimRect', 'areaRect', 'missing'], ['perimPoly', 'areaPar', 'areaTri'], ['sqFromPerim', 'circleArea', 'rhombus']][g]);
    if (f === 'perimSq') { const l = R.int(2, 12); return mq('areas', 'ps' + l, `Un cuadrado tiene lados de ${l} cm. ¿Cuál es su perímetro?`, 4 * l + ' cm', [l * l, 2 * l, l + 4, 3 * l].filter(x => x !== 4 * l).map(x => x + ' cm'), `El perímetro es la suma de los 4 lados: ${l} + ${l} + ${l} + ${l} = ${4 * l} cm`); }
    if (f === 'areaRect') { const l = R.int(3, 9), w = R.int(2, 8); if (l === w) return null; return mq('areas', 'ar' + l + w, `Una baldosa rectangular mide ${l} cm por ${w} cm. ¿Cuál es su área?`, l * w + ' cm²', [2 * (l + w), l + w, l * w + l, l * w - w].filter(x => x !== l * w).map(x => x + ' cm²'), `Área = largo × ancho = ${l} × ${w} = ${l * w} cm²`); }
    if (f === 'perimRect') { const l = R.int(4, 15), w = R.int(2, l - 1); return mq('areas', 'pr' + l + w, `Un rectángulo mide ${l} m de largo y ${w} m de ancho. ¿Cuál es su perímetro?`, 2 * (l + w) + ' m', [l * w, l + w, 2 * l + w, l + 2 * w].filter(x => x !== 2 * (l + w)).map(x => x + ' m'), `Perímetro = 2 × (${l} + ${w}) = 2 × ${l + w} = ${2 * (l + w)} m`); }
    if (f === 'missing') { const l = R.int(5, 15), w = R.int(2, l - 1), P = 2 * (l + w); return mq('areas', 'ms' + l + w, `Un rectángulo tiene un perímetro de ${P} cm y mide ${l} cm de largo. ¿Cuánto mide de ancho?`, w + ' cm', [P - l, P / 2, l + w, w + 1, w - 1].filter(x => x > 0 && x !== w).map(x => x + ' cm'), `La mitad del perímetro es largo + ancho: ${P / 2}. Entonces ancho = ${P / 2} − ${l} = ${w} cm`); }
    if (f === 'perimPoly') { const n = R.pick([[3, 'triángulo equilátero'], [5, 'pentágono regular'], [6, 'hexágono regular'], [8, 'octógono regular']]), l = R.int(2, 12); return mq('areas', 'pp' + n[0] + l, `Un ${n[1]} tiene lados de ${l} cm. ¿Cuánto mide su perímetro?`, n[0] * l + ' cm', [l * l, (n[0] + 1) * l, (n[0] - 1) * l, l + n[0]].filter(x => x !== n[0] * l).map(x => x + ' cm'), `${n[0]} lados iguales de ${l} cm: ${n[0]} × ${l} = ${n[0] * l} cm`); }
    if (f === 'areaPar') { const b = R.int(3, 14), h = R.int(2, 9); return mq('areas', 'pa' + b + h, `Un paralelogramo tiene base de ${b} cm y altura de ${h} cm. ¿Cuál es su área?`, b * h + ' cm²', [b + h, 2 * (b + h), b * h / 2 | 0, b * h + b].filter(x => x > 0 && x !== b * h).map(x => x + ' cm²'), `Área del paralelogramo = base × altura = ${b} × ${h} = ${b * h} cm²`); }
    if (f === 'areaTri') { const b = R.int(2, 8) * 2, h = R.int(2, 9); return mq('areas', 'at' + b + h, `Un triángulo tiene base de ${b} cm y altura de ${h} cm. ¿Cuál es su área?`, b * h / 2 + ' cm²', [b * h, b + h, b * h / 4, b * h / 2 + b].filter(x => x !== b * h / 2).map(x => x + ' cm²'), `Área del triángulo = base × altura ÷ 2 = ${b} × ${h} ÷ 2 = ${b * h / 2} cm²`); }
    if (f === 'sqFromPerim') { const l = R.int(2, 12); return mq('areas', 'sp' + l, `Un cuadrado tiene un perímetro de ${4 * l} cm. ¿Cuál es su área?`, l * l + ' cm²', [4 * l, 2 * l, l * l * 2, l + 4].filter(x => x !== l * l).map(x => x + ' cm²'), `Lado = ${4 * l} ÷ 4 = ${l} cm; área = ${l} × ${l} = ${l * l} cm²`); }
    if (f === 'circleArea') { const r = R.int(2, 6), A = Math.round(3.14 * r * r * 100) / 100, fm = x => D(Math.round(x * 100) / 100) + ' cm²'; return mq('areas', 'ca' + r, `Un círculo tiene un radio de ${r} cm. ¿Cuál es su área? (π ≈ 3,14)`, fm(A), uniq([fm(3.14 * 2 * r), fm(3.14 * r), fm(r * r), fm(3.14 * r * r * 2)]).filter(x => x !== fm(A)), `Área = π × r × r ≈ 3,14 × ${r} × ${r} = ${D(A)} cm²`); }
    if (f === 'rhombus') { const a = R.int(2, 9) * 2, b = R.int(3, 9); return mq('areas', 'rh' + a + b, `Un rombo tiene diagonales de ${a} cm y ${b} cm. ¿Cuál es su área?`, a * b / 2 + ' cm²', [a * b, a + b, a * b / 4, (a + b) * 2].filter(x => x !== a * b / 2).map(x => x + ' cm²'), `Área del rombo = diagonal mayor × diagonal menor ÷ 2 = ${a} × ${b} ÷ 2 = ${a * b / 2} cm²`); }
    return null;
  },
  geometria(g) {
    const f = R.pick([null, ['sh1', 'sh1', 'sh1b', 'noflat1'], ['sidesName', 'noflat', 'dado'], ['tri', 'quad', 'turn'], ['quad', 'turn', 'tri'], ['sum3', 'quad', 'turn'], ['sum4', 'radio', 'axes']][g]);
    if (f === 'sh1') { const S = R.pick([['el triángulo', 3], ['el cuadrado', 4], ['el rectángulo', 4]]), w = R.pick(['lados', 'esquinas']); return mq('geometria', 's1' + S[0] + w, `¿${w === 'lados' ? 'Cuántos' : 'Cuántas'} ${w} tiene ${S[0]}?`, String(S[1]), ['2', '3', '4', '5', '6'].filter(x => x !== String(S[1])), `${S[0][0].toUpperCase() + S[0].slice(1)} tiene ${S[1]} ${w}`); }
    if (f === 'sh1b') { const S = R.pick([['el triángulo', 3], ['el cuadrado', 4]]), k = ['el círculo', 'el cuadrado', 'el triángulo', 'el rectángulo'], c = S[1] === 3 ? 'el triángulo' : 'el cuadrado'; return mq('geometria', 'sb' + S[1], `¿Qué figura tiene ${S[1]} lados ${S[1] === 4 ? 'iguales' : ''}`.trim() + '?', c, k.filter(x => x !== c && !(S[1] === 4 && x === 'el rectángulo')).concat(S[1] === 3 ? ['el rectángulo'] : []).slice(0, 3), `${c[0].toUpperCase() + c.slice(1)} tiene ${S[1]} lados${S[1] === 4 ? ' iguales' : ''}`); }
    if (f === 'noflat1' || f === 'noflat') return mq('geometria', 'nf' + (f === 'noflat1' ? 1 : 2), f === 'noflat1' ? '¿Qué cuerpo geométrico puede rodar como una pelota?' : '¿Cuál de estos cuerpos NO tiene ninguna cara plana?', 'la esfera', ['el cubo', 'el cilindro', 'el cono', 'la pirámide'].slice(0, f === 'noflat1' ? 3 : 4), f === 'noflat1' ? 'La esfera rueda hacia cualquier lado' : 'La esfera es redonda por todas partes: no tiene caras planas');
    if (f === 'sidesName') { const n = R.int(5, 8); return mq('geometria', 'sn' + n, `¿Cómo se llama el polígono de ${n} lados?`, POLYNAMES[n], [3, 4, 5, 6, 7, 8].filter(x => x !== n).map(x => POLYNAMES[x]), `${n} lados: ${POLYNAMES[n]}`); }
    if (f === 'dado') { const t = R.pick([['un dado', 6], ['una caja de zapatos', 6], ['un cubo', 6]]); return mq('geometria', 'dd' + t[0], `¿Cuántas caras tiene ${t[0]}?`, String(t[1]), ['4', '5', '8', '12'], `${t[0][0].toUpperCase() + t[0].slice(1)} tiene 6 caras`); }
    if (f === 'tri') { const T = R.pick([['sus 3 lados iguales', 'equilátero'], ['2 lados iguales y 1 distinto', 'isósceles'], ['sus 3 lados distintos', 'escaleno']]); return mq('geometria', 'tr' + T[1], `Un triángulo tiene ${T[0]}. ¿Cómo se llama?`, T[1], ['equilátero', 'isósceles', 'escaleno'].filter(x => x !== T[1]), `Equilátero: 3 lados iguales. Isósceles: 2 iguales. Escaleno: ninguno igual`); }
    if (f === 'quad') { const Q4 = R.pick([['4 lados iguales y 4 ángulos rectos', 'cuadrado'], ['4 ángulos rectos y los lados de dos en dos iguales, no todos', 'rectángulo'], ['4 lados iguales pero sin ángulos rectos', 'rombo'], ['un solo par de lados paralelos', 'trapecio']]); return mq('geometria', 'qd' + Q4[1], `¿Qué cuadrilátero tiene ${Q4[0]}?`, Q4[1], ['cuadrado', 'rectángulo', 'rombo', 'trapecio'].filter(x => x !== Q4[1]), `Es el ${Q4[1]}`); }
    if (f === 'turn') { const T = R.pick([['media vuelta', 180], ['un cuarto de vuelta', 90], ['una vuelta completa', 360]]); return mq('geometria', 'tu' + T[1], `¿Cuántos grados son ${T[0]}?`, T[1] + '°', [90, 180, 270, 360, 45].filter(x => x !== T[1]).map(x => x + '°'), T[1] === 360 ? 'Una vuelta completa son 360°' : `Una vuelta completa son 360°; ${T[0]} es ${T[1]}°`); }
    if (f === 'sum3') { const a = R.int(30, 80), b = R.int(30, 80); if (a + b > 150) return null; const c = 180 - a - b; return mq('geometria', 's3' + a + b, `Dos ángulos de un triángulo miden ${a}° y ${b}°. ¿Cuánto mide el tercero?`, c + '°', [a + b, 360 - a - b, c + 10, c - 10, 90].filter(x => x > 0 && x !== c).map(x => x + '°'), `Los ángulos de un triángulo suman 180°: 180 − ${a} − ${b} = ${c}°`); }
    if (f === 'sum4') { const a = R.int(70, 110), b = R.int(70, 110), c = R.int(70, 110), d = 360 - a - b - c; return mq('geometria', 's4' + a + b + c, `Tres ángulos de un cuadrilátero miden ${a}°, ${b}° y ${c}°. ¿Cuánto mide el cuarto?`, d + '°', [d + 10, d - 10, 180 - a, 360 - a - b, a + b + c].filter(x => x > 0 && x !== d).map(x => x + '°'), `Los ángulos de un cuadrilátero suman 360°: 360 − ${a} − ${b} − ${c} = ${d}°`); }
    if (f === 'radio') { const r = R.int(2, 15); if (R.chance(.5)) return mq('geometria', 'rd' + r, `El radio de un círculo mide ${r} cm. ¿Cuánto mide su diámetro?`, 2 * r + ' cm', [r, r + 2, 3 * r, r / 2 | 0 || 1].filter(x => x !== 2 * r).map(x => x + ' cm'), `El diámetro es el doble del radio: ${r} × 2 = ${2 * r} cm`); return mq('geometria', 'dr' + r, `El diámetro de un círculo mide ${2 * r} cm. ¿Cuánto mide su radio?`, r + ' cm', [2 * r, r + 2, 4 * r, r - 1].filter(x => x > 0 && x !== r).map(x => x + ' cm'), `El radio es la mitad del diámetro: ${2 * r} ÷ 2 = ${r} cm`); }
    if (f === 'axes') { const F6 = R.pick([['cuadrado', 4], ['rectángulo', 2], ['triángulo equilátero', 3], ['hexágono regular', 6]]); return mq('geometria', 'ax' + F6[0], `¿Cuántos ejes de simetría tiene un ${F6[0]}?`, String(F6[1]), ['1', '2', '3', '4', '6'].filter(x => x !== String(F6[1])), `Un ${F6[0]} tiene ${F6[1]} ejes de simetría`); }
    return null;
  },
  datos(g) {
    const f = R.pick([null, ['chance'], ['chance', 'chance', 'modeW'], ['chance', 'modeW'], ['modeN', 'chance'], ['mean', 'modeN'], ['mean', 'prob', 'prob']][g]);
    if (f === 'chance') { const S = R.pick([['Que mañana salga el sol', 'seguro'], ['Que al tirar un dado salga un 7', 'imposible'], ['Que al tirar una moneda salga cara', 'posible'], ['Que un perro vuele sin ayuda', 'imposible'], ['Que después del martes venga el miércoles', 'seguro'], ['Que llueva en Tenerife esta semana', 'posible'], ['Que de una bolsa con solo bolas rojas saques una verde', 'imposible'], ['Que mañana te encuentres con un amigo por la calle', 'posible'], ['Que el agua del mar sepa dulce', 'imposible'], ['Que, si lanzas una pelota hacia arriba, vuelva a caer', 'seguro']]); return mq('datos', 'ch' + S[0], `¿Es seguro, posible o imposible? ${S[0]}`, S[1], ['seguro', 'posible', 'imposible'].filter(x => x !== S[1]), `${S[0]}: es ${S[1]}`); }
    if (f === 'modeW') { const C = R.shuffle(['rojo', 'azul', 'verde', 'amarillo']).slice(0, 3), c1 = R.int(3, 4), arr = []; C.forEach((c, i) => { const k = i === 0 ? c1 : i === 1 ? 2 : 1; for (let j = 0; j < k; j++) arr.push(c); }); const sh = R.shuffle(arr); return mq('datos', 'mw' + sh, `Se han votado estos colores: ${sh.join(', ')}. ¿Qué color se repite MÁS?`, C[0], C.slice(1).concat(['ninguno']), `${C[0]} se repite ${c1} veces: es el que más aparece`); }
    if (f === 'modeN') { const set = R.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]).slice(0, 4), m = set[0], arr = [m, m, m, set[1], set[1], set[2], set[3]], sh = R.shuffle(arr); return mq('datos', 'mn' + sh, `¿Cuál es la MODA de: ${sh.join(', ')}?`, String(m), set.slice(1).map(String), `La moda es el dato que más se repite: ${m} aparece 3 veces`); }
    if (f === 'mean') { const m = R.int(g === 5 ? 6 : 8, g === 5 ? 20 : 40), d1 = R.int(1, 4), d2 = R.int(1, 4), arr = R.shuffle([m + d1, m - d1, m + d2, m - d2, m]); const sorted = arr.slice().sort((a, b) => a - b); return mq('datos', 'me' + arr, `Calcula la MEDIA de: ${arr.join(', ')}`, String(m), numWrong(m, [Math.max(...arr), arr.reduce((a, b) => a + b, 0)]).filter(x => x !== String(m)), `Suma: ${arr.join(' + ')} = ${m * 5}; ${m * 5} ÷ 5 = ${m}`); }
    if (f === 'prob') { const P = R.pick([['un número PAR', [1, 2]], ['un número IMPAR', [1, 2]], ['un número mayor que 4', [1, 3]], ['un múltiplo de 3', [1, 3]], ['un número menor que 3', [1, 3]], ['un 6', [1, 6]]]), all = [[1, 6], [1, 3], [1, 2], [2, 3], [5, 6]], ok = P[1]; return mq('datos', 'pb' + P[0], `Lanzas un dado de 6 caras. ¿Qué probabilidad hay de sacar ${P[0]}?`, F(ok[0], ok[1]), all.filter(x => x[0] !== ok[0] || x[1] !== ok[1]).map(x => F(x[0], x[1])), `Casos favorables entre casos posibles: ${P[0]} son ${ok[0] === 1 && ok[1] === 2 ? '3 de 6 = 1/2' : ok[1] === 3 ? '2 de 6 = 1/3' : '1 de 6'}`, { big: true }); }
    return null;
  },
  fracciones(g) {
    if (g <= 2) return null;
    const f = R.pick([null, null, null, ['qty', 'pizza'], ['equiv', 'qty2', 'pizza'], ['qty2', 'decfrac', 'equiv'], ['pct', 'simplify', 'qty3']][g]);
    if (f === 'qty') { const dn = R.pick([[2, 'la mitad'], [3, 'la tercera parte'], [4, 'la cuarta parte'], [5, 'la quinta parte']]), q = dn[0] * R.int(2, 10); return mq('fracciones', 'q1' + dn[0] + q, `¿Cuál es ${dn[1]} de ${q}?`, String(q / dn[0]), numWrong(q / dn[0], [q - q / dn[0], q / 2, q]), `${q} ÷ ${dn[0]} = ${q / dn[0]}`); }
    if (f === 'pizza') { const n = R.pick([4, 6, 8]), k = R.int(1, 3); return mq('fracciones', 'pz' + n + k, `Una tarta se corta en ${n} trozos iguales y te comes ${k}. ¿Qué fracción de la tarta te has comido?`, F(k, n), [F(n - k, n), F(k, n + 1), F(n, k), F(k + 1, n)], `Hay ${n} trozos iguales y te comes ${k}: ${k}/${n}`, { big: true }); }
    if (f === 'equiv') { const b = R.pick([2, 3, 4, 5]), a = R.int(1, b - 1), m = R.pick([2, 3, 4, 5]); return mq('fracciones', 'eq' + a + b + m, `${F(a, b)} = ${F(BLANK, b * m)}`, String(a * m), numWrong(a * m, [a + m, b * m, a * m + 1]), `Multiplica arriba y abajo por ${m}: ${a} × ${m} = ${a * m} y ${b} × ${m} = ${b * m}`, { big: true }); }
    if (f === 'qty2' || f === 'qty3') { const n = f === 'qty2' ? R.pick([3, 4, 5, 8, 10]) : R.pick([6, 8, 9, 12]), k = R.int(2, n - 1), u = R.int(2, f === 'qty2' ? 6 : 9), q = n * u, ans = u * k; return mq('fracciones', 'qq' + k + n + q, `¿Cuánto son ${F(k, n)} de ${q}?`, String(ans), numWrong(ans, [u, q - ans, q]), `${q} ÷ ${n} = ${u}; ${u} × ${k} = ${ans}`); }
    if (f === 'decfrac') { const T = R.pick([[1, 10, .1], [3, 10, .3], [1, 4, .25], [1, 2, .5], [3, 4, .75], [1, 5, .2], [7, 10, .7], [1, 100, .01]]); return mq('fracciones', 'df' + T, `${F(T[0], T[1])} escrito como decimal es…`, D(T[2]), uniq([T[2] * 10, T[2] / 10, 1 - T[2], T[2] + .1, T[2] * 2].map(x => D(Math.round(x * 1000) / 1000))).filter(x => x !== D(T[2])), `${T[0]} ÷ ${T[1]} = ${D(T[2])}`); }
    if (f === 'pct') { const p = R.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), base = R.pick([20, 40, 60, 80, 100, 120, 200, 300, 400, 500]), ans = base * p / 100; return mq('fracciones', 'pc' + p + base, `¿Cuánto es el ${p} % de ${base}?`, String(ans), numWrong(ans, [base - ans, ans * 2, p]), `El ${p} % de ${base} es ${base} × ${p} ÷ 100 = ${ans}`); }
    if (f === 'simplify') { const B = R.pick([[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4]]), m = R.pick([2, 3, 4, 5]); return mq('fracciones', 'sm' + B + m, `Simplifica ${F(B[0] * m, B[1] * m)} hasta la fracción irreducible`, F(B[0], B[1]), [F(B[0] * m, B[1]), F(B[0], B[1] * m), F(B[0] + 1, B[1]), F(B[1], B[0])], `Divide arriba y abajo entre ${m}: ${B[0] * m}/${B[1] * m} = ${B[0]}/${B[1]}`, { big: true }); }
    return null;
  },
  tablas(g) {
    if (g <= 2) return null;
    const f = R.pick([null, null, null, ['groups', 'dbl'], ['derived', 'derived', 'dbl'], ['distrib', 'decMul'], ['decMul2', 'big', 'distrib']][g]);
    if (f === 'groups') { const a = R.int(2, 5), b = R.int(2, 10), [u, gd] = R.pick(THINGS); return mq('tablas', 'gr' + a + b, `Hay ${a} cestas con ${b} ${u} en cada una. ¿${Cuan(gd)} ${u} hay en total?`, String(a * b), numWrong(a * b, [a + b, a * (b + 1)]), `${a} × ${b} = ${a * b}`); }
    if (f === 'dbl') { const n = R.int(2, 15), t = R.chance(.5); return mq('tablas', 'db' + n + t, `¿Cuál es el ${t ? 'doble' : 'triple'} de ${n}?`, String(n * (t ? 2 : 3)), numWrong(n * (t ? 2 : 3), [n + (t ? 2 : 3)]), `${n} × ${t ? 2 : 3} = ${n * (t ? 2 : 3)}`); }
    if (f === 'derived') { const a = R.int(6, 9), b = R.int(3, 9), up = R.chance(.6), ans = up ? a * b + a : a * b - a; return mq('tablas', 'dv' + a + b + up, `Sabes que ${a} × ${b} = ${a * b}. Entonces ${a} × ${up ? b + 1 : b - 1} = ?`, String(ans), uniq([a * b + b, a * b + 1, a * b - 1, ans + a, up ? a * b - a : a * b + a]).filter(x => x > 0 && x !== ans).map(String), `${up ? 'Un grupo más' : 'Un grupo menos'} de ${a}: ${a * b} ${up ? '+' : '−'} ${a} = ${ans}`); }
    if (f === 'distrib') { const t = R.int(1, 9), u = R.int(2, 9), y = R.int(2, 9), x = t * 10 + u; return mq('tablas', 'ds' + x + y, `${x} × ${y} = ${t * 10 * y} + ${BLANK}`, String(u * y), numWrong(u * y, [t * y, x * y, u + y]), `${x} × ${y} = ${t * 10} × ${y} + ${u} × ${y} = ${t * 10 * y} + ${u * y} = ${x * y}`); }
    if (f === 'decMul') { const x = R.pick([1.5, 2.5, .5, 3.2, 1.2, 2.4, 4.5]), k = R.int(2, 5), ans = Math.round(x * k * 100) / 100; return mq('tablas', 'dm' + x + k, `${D(x)} × ${k} = ?`, D(ans), uniq([ans * 10, ans / 10, ans + 1, ans - 1, x + k]).filter(v => v > 0 && v !== ans).map(x2 => D(Math.round(x2 * 100) / 100)), `Multiplica como si no hubiera coma (${Math.round(x * 10)} × ${k} = ${Math.round(x * 10) * k}) y pon la coma: ${D(ans)}`); }
    if (f === 'decMul2') { const P = R.pick([[.5, 8], [1.5, 4], [.25, 8], [2.5, 4], [.2, 15], [1.2, 5], [3.5, 2], [.75, 4]]), ans = Math.round(P[0] * P[1] * 100) / 100; return mq('tablas', 'd2' + P, `${D(P[0])} × ${P[1]} = ?`, D(ans), uniq([ans * 10, ans / 10, ans + 1, ans - 1]).filter(v => v > 0 && v !== ans).map(x2 => D(Math.round(x2 * 100) / 100)), `${D(P[0])} × ${P[1]} = ${D(ans)}`); }
    if (f === 'big') { const x = R.int(11, 60), t = R.pick([20, 30, 40, 50]), ans = x * t; return mq('tablas', 'bg' + x + t, `${x} × ${t} = ?`, N(ans), numWrong(ans, [x * t / 10, x * t * 10, ans + 100]), `${x} × ${t / 10} = ${x * t / 10}; y por 10: ${N(ans)}`); }
    return null;
  },
  divisiones(g) {
    if (g <= 2) return null;
    const f = R.pick([null, null, null, ['groups', 'groups'], ['cars', 'cars', 'groups'], ['div3', 'div3'], ['decDiv', 'long', 'div3']][g]);
    if (f === 'groups') { const b = R.pick([2, 3, 4, 5, 10]), q = R.int(2, 10), n = b * q, [u, gd] = R.pick(THINGS); return mq('divisiones', 'g' + n + b, `Tienes ${n} ${u} y ${gd === 'f' ? 'las' : 'los'} pones en grupos de ${b}. ¿Cuántos grupos salen?`, String(q), numWrong(q, [b, q + b]), `${n} ÷ ${b} = ${q}`); }
    if (f === 'cars') { const b = R.pick([4, 5, 6]), q = R.int(3, 9), r = R.int(1, b - 1), n = b * q + r; return mq('divisiones', 'ca' + n + b, `Van ${n} personas en coches de ${b} plazas. ¿Cuántos coches hacen falta como mínimo?`, String(q + 1), numWrong(q + 1, [q, r, n - b * q]), `${n} ÷ ${b} = ${q} y sobran ${r}: hace falta un coche más para esas ${r} personas`); }
    if (f === 'div3') { const b = R.pick([3, 4, 5, 6, 7, 8, 9]), q = R.int(30, 120), n = b * q, T = R.pick([['lápices', 'estuches', 'estuche'], ['libros', 'clases', 'clase'], ['folios', 'grupos', 'grupo'], ['caramelos', 'niños', 'niño']]); return mq('divisiones', 'd3' + n + b, `Se reparten ${n} ${T[0]} entre ${b} ${T[1]} por igual. ¿Cuántos ${T[0]} le tocan a cada ${T[2]}?`, String(q), numWrong(q, [q + b, q - b]), `${n} ÷ ${b} = ${q}, porque ${b} × ${q} = ${n}`); }
    if (f === 'decDiv') { const P = R.pick([[9, 2], [7, 4], [15, 2], [1, 4], [3, 5], [9, 4], [6, 5], [21, 6]]), ans = Math.round(P[0] / P[1] * 100) / 100; return mq('divisiones', 'dd' + P, `${P[0]} ÷ ${P[1]} = ?`, D(ans), uniq([ans * 10, ans / 10, Math.floor(ans), Math.ceil(ans) + .5, ans + 1]).filter(v => v > 0 && v !== ans).map(x2 => D(Math.round(x2 * 100) / 100)), `${P[0]} ÷ ${P[1]} = ${D(ans)}, porque ${D(ans)} × ${P[1]} = ${P[0]}`); }
    if (f === 'long') { const b = R.pick([12, 15, 16, 18, 20, 25]), q = R.int(4, 30), n = b * q; return mq('divisiones', 'lg' + n + b, `${N(n)} ÷ ${b} = ?`, String(q), numWrong(q, [q + 10, q - 10, q + b]), `${b} × ${q} = ${N(n)}`); }
    return null;
  }
};


/* ---------- 10 PREGUNTAS NUEVAS POR BLOQUE (PLUS_*) ----------
   Cada bloque tiene 10 plantillas nuevas, con rango de cursos [mín, máx].
   En 1.º-2.º solo se usan números enteros, sumas y restas. */
const pq = (cat, key, text, correct, wrong, hint, o) => build(Object.assign({ cat, text, correct, wrong, hint, key: 'p+|' + key }, o || {}));
const NUMTXT = (g, a, b) => R.int(a, b);
const GCELL = 26;
function gridSvg(w, h, gone, col, ox, oy, label) {
  ox = ox || 4; oy = oy || 4; let s = '';
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (gone && gone.has(x + ',' + y)) continue; s += `<rect x="${ox + x * GCELL}" y="${oy + y * GCELL}" width="${GCELL}" height="${GCELL}" fill="${col || '#2de2ff'}" stroke="${INK}" stroke-width="2.5"/>`; }
  if (label) s += `<text x="${ox + w * GCELL / 2}" y="${oy + h * GCELL + 20}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif" stroke="${INK}" stroke-width="3.5" paint-order="stroke">${label}</text>`;
  return s;
}
function tallySvg(n) {
  const gr = Math.ceil(n / 5); let s = '';
  for (let g = 0; g < gr; g++) {
    const k = Math.min(5, n - g * 5), x0 = 10 + g * 62;
    for (let i = 0; i < Math.min(k, 4); i++) s += `<line x1="${x0 + i * 11}" y1="14" x2="${x0 + i * 11}" y2="66" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
    if (k === 5) s += `<line x1="${x0 - 6}" y1="58" x2="${x0 + 42}" y2="22" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>`;
  }
  return svg(`0 0 ${Math.max(140, gr * 62 + 20)} 80`, s, 'fig wide');
}
function tableSvg(head, rows) {
  const cw = 70, ch = 30, W = cw * (head.length + 1) + 8, H = ch * (rows.length + 1) + 8; let s = '';
  const cell = (x, y, t, fill) => `<rect x="${4 + x * cw}" y="${4 + y * ch}" width="${cw}" height="${ch}" fill="${fill}" stroke="${INK}" stroke-width="2.5"/><text x="${4 + x * cw + cw / 2}" y="${4 + y * ch + 21}" text-anchor="middle" font-size="15" font-weight="900" fill="${fill === '#fff' ? INK : '#fff'}" font-family="Arial Black,sans-serif">${t}</text>`;
  s += cell(0, 0, '', '#9b6bff'); head.forEach((h, i) => s += cell(i + 1, 0, h, '#9b6bff'));
  rows.forEach((r, j) => { s += cell(0, j + 1, r[0], '#ff3d9a'); r.slice(1).forEach((v, i) => s += cell(i + 1, j + 1, v, '#fff')); });
  return svg(`0 0 ${W} ${H}`, s, 'grid');
}
function lineSvg(n, k) {
  let s = `<line x1="20" y1="55" x2="300" y2="55" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
  for (let i = 0; i <= n; i++) { const x = 20 + 280 * i / n; s += `<line x1="${x}" y1="${i === 0 || i === n ? 42 : 47}" x2="${x}" y2="68" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`; }
  s += `<text x="20" y="92" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif" stroke="${INK}" stroke-width="3.5" paint-order="stroke">0</text><text x="300" y="92" text-anchor="middle" font-size="16" font-weight="900" fill="#fff" font-family="Arial Black,sans-serif" stroke="${INK}" stroke-width="3.5" paint-order="stroke">1</text>`;
  const px = 20 + 280 * k / n; s += `<polygon points="${px},50 ${px - 9},28 ${px + 9},28" fill="#ffd23f" ${ST}/>`;
  return svg('0 0 320 100', s, 'fig wide');
}
const frs = (a, b) => F(a, b);
const eur = n => N(n) + ' €';
const ITEM = [['plátanos', 'm'], ['galletas', 'f'], ['caramelos', 'm'], ['pegatinas', 'f'], ['cromos', 'm'], ['conchas', 'f']], FOOD = [['plátanos', 'm'], ['galletas', 'f'], ['caramelos', 'm'], ['quesadillas', 'f'], ['mandarinas', 'f'], ['higos', 'm']];

const PLUS = {
  sumres: [
    [1, 2, g => { const [it, gd] = R.pick(ITEM), a = R.int(2, g === 1 ? 10 : 50), b = R.int(2, g === 1 ? 20 - a : 40), nm = R.pick(NAMES); if (g === 1 && a + b > 20) return null; const s = a + b; return pq('sumres', 'h1' + a + b + it, `${nm} tiene ${a} ${it} y le regalan ${b} más. ¿${Cuan(gd)} ${it} tiene ahora?`, String(s), numWrong(s, [a, b, Math.abs(a - b)]), `${a} + ${b} = ${s}`); }],
    [1, 6, g => { const [it, gd] = R.pick(FOOD), t = g === 1 ? R.int(8, 20) : g === 2 ? R.int(20, 99) : g <= 4 ? R.int(100, 999) : R.int(1000, 9999), k = g === 1 ? R.int(1, t - 2) : R.int(2, t - 1) , ans = t - k; return pq('sumres', 'h2' + t + k + it, `Había ${N(t)} ${it} y se han comido ${N(k)}. ¿${Cuan(gd)} ${it} quedan?`, N(ans), numWrong(ans, [t + k, k]).map(String), `${N(t)} − ${N(k)} = ${N(ans)}`); }],
    [1, 2, g => { const a = R.int(1, g === 1 ? 10 : 40), s = 2 * a; return pq('sumres', 'dbl' + a, `${a} + ${a} = ?`, String(s), numWrong(s, [a, a + 1]), `Es el doble de ${a}: ${a} + ${a} = ${s}`); }],
    [2, 6, g => { const t = g === 2 ? R.int(2, 25) * 2 : g <= 4 ? R.int(5, 60) * 2 : R.int(50, 500) * 2, ans = t / 2; return pq('sumres', 'mit' + t, `¿Cuál es la mitad de ${N(t)}?`, N(ans), numWrong(ans, [t, ans * 2 + 2]).map(String), `La mitad de ${N(t)} es ${N(ans)} porque ${N(ans)} + ${N(ans)} = ${N(t)}`); }],
    [3, 6, g => { const lim = g === 3 ? 200 : g === 4 ? 2000 : 9000, a = R.int(11, lim), s = a + R.int(11, lim); return pq('sumres', 'fl' + a + s, `${N(a)} + ${BLANK} = ${N(s)}`, N(s - a), numWrong(s - a, [s + a, a]).map(String), `${N(s)} − ${N(a)} = ${N(s - a)}`); }],
    [3, 6, g => { const d = g === 3 ? 3 : g === 4 ? 4 : 5; let a = R.int(10 ** (d - 1), 10 ** d - 1), b = R.int(10 ** (d - 2), a - 1); if (a % 10 >= b % 10) { a = a - (a % 10) + R.int(0, Math.max(0, (b % 10) - 1)); } if (a <= b) return null; const ans = a - b; return pq('sumres', 'lv' + a + b, `${N(a)} − ${N(b)} = ?`, N(ans), numWrong(ans, [a + b, ans + 100, ans - 100]).map(String), `${N(a)} − ${N(b)} = ${N(ans)}`); }],
    [1, 6, g => { const lim = g === 1 ? 20 : g === 2 ? 90 : g <= 4 ? 500 : 900, p = R.int(g === 1 ? 5 : 10, lim), h = R.int(2, p - 1), ans = p - h, obj = R.pick(['una mochila', 'un juego', 'una bici', 'unas zapatillas', 'una pelota']); return pq('sumres', 'fa' + p + h, `Quieres comprar ${obj} de ${p} € y tienes ${h} €. ¿Cuántos euros te faltan?`, ans + ' €', numWrong(ans, [p, h, p + h]).map(x => x + ' €'), `${p} − ${h} = ${ans}`); }],
    [1, 6, g => { const T = g === 1 ? R.pick([10, 20]) : g === 2 ? R.pick([20, 50, 100]) : g <= 4 ? R.pick([100, 200, 500]) : R.pick([1000, 500, 100]), a = g <= 2 ? R.int(1, T - 1) : R.int(1, T / 5 - 1) * 5, ok = [a, T - a], bad = new Set(); if (T - a === a) return null; const fmt = ([x, y]) => `${N(x)} + ${N(y)}`; while (bad.size < 3) { const x = R.int(1, T - 1), y = T - x + R.pick([-2, -1, 1, 2, 5, -5]); if (x + y !== T && y > 0 && !(x === a && y === T - a)) bad.add(`${N(x)} + ${N(y)}`); } return pq('sumres', 'ps' + T + a, `¿Cuál de estas sumas da ${N(T)}?`, fmt(ok), [...bad], `${fmt(ok)} = ${N(T)}`, { big: true }); }],
    [4, 6, g => { const a = R.int(3, 9) * 100 + R.int(1, 99), b = R.int(2, 8) * 100 + R.int(1, 99), ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100, ans = ra + rb; if (g >= 5) { } return pq('sumres', 'es' + a + b, `Estima redondeando a las centenas: ${N(a)} + ${N(b)} ≈ ?`, N(ans), [ans + 100, ans - 100, ans + 200, ans - 200].filter(x => x > 0).map(N), `${N(a)} ≈ ${N(ra)} y ${N(b)} ≈ ${N(rb)}; ${N(ra)} + ${N(rb)} = ${N(ans)}`); }],
    [5, 6, g => { if (g === 6 && R.chance(.5)) { const t = R.int(-6, 4), up = R.int(3, 9), ans = t + up, lugar = R.pick(['en Izaña', 'en el Teide', 'en Las Cañadas']); return pq('sumres', 'tm' + t + up, `${lugar[0].toUpperCase() + lugar.slice(1)} a las 8:00 hay ${Z(t)} °C y a mediodía suben ${up} grados. ¿Qué temperatura hay a mediodía?`, Z(ans) + ' °C', [ans + 1, ans - 1, ans + 2, ans - 2, t - up, Math.abs(ans)].filter(x => x !== ans).map(x => Z(x) + ' °C'), `${Z(t)} + ${up} = ${Z(ans)}`); } const a = R.int(21, 99) / 10, b = R.int(11, 90) / 10, sub = R.chance(.5) && a > b, ans = Math.round((sub ? a - b : a + b) * 10) / 10; return pq('sumres', 'dc' + a + b + sub, `${D(a)} ${sub ? '−' : '+'} ${D(b)} = ?`, D(ans), [ans + .1, ans - .1, ans + 1, ans - 1, ans * 10].filter(x => x > 0 && x !== ans).map(D), `${D(a)} ${sub ? '−' : '+'} ${D(b)} = ${D(ans)}`); }]
  ],
  comparar: [
    [1, 6, g => { const hi = [0, 20, 99, 999, 9999, 99999, 999999][g], lo = [0, 1, 10, 100, 1000, 10000, 100000][g], s = new Set(); while (s.size < 3) s.add(R.int(lo, hi)); const v = [...s], mx = Math.max(...v); return pq('comparar', 'mx' + v, `¿Cuál es el número MAYOR: ${v.map(N).join(', ')}?`, N(mx), v.filter(x => x !== mx).map(N).concat([N(mx - 1), N(mx + 1)].filter(x => !v.map(N).includes(x))), `El mayor es ${N(mx)}`); }],
    [1, 6, g => { const hi = [0, 20, 99, 999, 9999, 99999, 999999][g], lo = [0, 1, 10, 100, 1000, 10000, 100000][g], s = new Set(); while (s.size < 3) s.add(R.int(lo, hi)); const v = [...s], mn = Math.min(...v); return pq('comparar', 'mn' + v, `¿Cuál es el número MENOR: ${v.map(N).join(', ')}?`, N(mn), v.filter(x => x !== mn).map(N).concat([N(mn - 1), N(mn + 1)].filter(x => !v.map(N).includes(x) && Number(x) > 0)), `El menor es ${N(mn)}`); }],
    [1, 4, g => { const m = g === 1 ? 10 : g === 2 ? 50 : g === 3 ? 20 : 12, a = R.int(1, m), b = R.int(1, m), l = g <= 2 ? `${a} + ${b}` : `${a} × ${b}`, v = g <= 2 ? a + b : a * b, c = Math.max(1, v + R.pick([-3, -2, -1, 0, 0, 1, 2, 3])); if (v === c && R.chance(.5)) { } const sg = v < c ? '<' : v > c ? '>' : '='; return pq('comparar', 'sg' + g + a + b + c, `¿Qué signo va en el hueco? ${l} ${BLANK} ${c}`, sg, ['<', '>', '='].filter(x => x !== sg), `${l} = ${v}; ${v} ${sg} ${c}`, { order: ['<', '=', '>'] }); }],
    [2, 6, g => { const c = R.pick([50, 100, 500, 1000, 5000].filter(x => g === 2 ? x <= 100 : g === 3 ? x <= 500 : true)), ts = [c - R.int(1, 9) * (c / 50 | 0 || 1), c + R.int(3, 9) * (c / 20 | 0 || 1), c + R.int(12, 25) * (c / 50 | 0 || 1), c - R.int(10, 18) * (c / 50 | 0 || 1)].filter(x => x > 0 && x !== c); const mn = Math.min(...ts.map(x => Math.abs(x - c))); const cand = ts.find(x => Math.abs(x - c) === mn); if (ts.filter(x => Math.abs(x - c) === mn).length > 1 || ts.length < 3) return null; return pq('comparar', 'cr' + c + ts, `¿Qué número está más cerca de ${N(c)}?`, N(cand), ts.filter(x => x !== cand).map(N), `${N(cand)} se diferencia de ${N(c)} en ${N(Math.abs(cand - c))}, el que menos`); }],
    [3, 6, g => { const c = R.int(1, 9), d = R.int(1, 9), u = R.int(1, 9), um = R.int(1, 9); const big = g >= 4, n = big ? um * 1000 + c * 100 + d * 10 + u : c * 100 + d * 10 + u, t = `${big ? um + ' ' + (um === 1 ? 'unidad de millar' : 'unidades de millar') + ', ' : ''}${c} ${c === 1 ? 'centena' : 'centenas'}, ${d} ${d === 1 ? 'decena' : 'decenas'} y ${u} ${u === 1 ? 'unidad' : 'unidades'}`; return pq('comparar', 'cp' + n, `¿Qué número es ${t}?`, N(n), uniq([N(Number(String(d) + String(c) + String(u)) + (big ? um * 1000 : 0)), N(n + 10), N(n - 100), N(n + 1)]).filter(x => x !== N(n)), `${t}: ${N(n)}`); }],
    [3, 6, g => { const mil = g >= 4 && R.chance(.6), a = mil ? R.int(1, 9) * 1000 : R.int(1, 9) * 100, b = R.int(1, 9) * (mil ? 100 : 10) + R.int(0, 9) * (mil ? 10 : 1), n = a + b; return pq('comparar', 'ds' + n, `${N(n)} = ${N(a)} + ${BLANK}`, N(b), [b + (mil ? 100 : 10), b - (mil ? 100 : 10), a, b + 1].filter(x => x > 0).map(N), `${N(n)} − ${N(a)} = ${N(b)}`); }],
    [2, 6, g => { const lo = g === 2 ? 20 : g <= 4 ? 100 : 1000, a = R.int(lo, lo * 4), b = a + R.int(3, g === 2 ? 8 : 12) * (g === 2 ? 1 : 2), p = R.chance(.5), mid = a + 1 + R.int(0, (b - a - 2)), par = R.pick(['par', 'impar']); const cand = []; for (let x = a + 1; x < b; x++) if ((x % 2 === 0) === (par === 'par')) cand.push(x); if (cand.length !== 1 && cand.length < 2) return null; const ans = R.pick(cand); const bad = [a, b, a - 1, b + 1, ans + 1].filter(x => (x % 2 === 0) === (par === 'par') ? false : true).concat([a - 2, b + 2]).filter(x => !cand.includes(x)); return pq('comparar', 'mi' + a + b + par + ans, `Soy un número ${par}, mayor que ${N(a)} y menor que ${N(b)}${cand.length > 1 ? ', y acabo en ' + (ans % 10) : ''}. ¿Qué número soy?`, N(ans), bad.map(N), `Entre ${N(a)} y ${N(b)}, ${par}${cand.length > 1 ? ' y acabado en ' + (ans % 10) : ''}: ${N(ans)}`); }],
    [3, 6, g => { const de = g === 3 ? 3 : R.int(2, 5), c = g <= 4 ? R.pick([3, 4, 5, 6, 8]) : R.pick([3, 4, 5, 6, 8]); let a = R.int(1, c - 1), b = R.int(1, c - 1); if (g <= 4) { while (b === a) b = R.int(1, c - 1); const m = Math.max(a, b), l = Math.min(a, b); const win = a > b ? [a, c] : [b, c]; return pq('comparar', 'fr' + a + b + c, `¿Qué fracción es MAYOR, ${frs(a, c)} o ${frs(b, c)}?`, frs(win[0], c), [frs(a === win[0] ? b : a, c), 'Son iguales'], `Con el mismo denominador, es mayor la de numerador más grande: ${win[0]} > ${Math.min(a, b)}`); } const n1 = R.pick([3, 4, 5, 6, 8]), n2 = R.pick([2, 3, 4, 5, 6, 10].filter(x => x !== n1)), big = Math.min(n1, n2), small = Math.max(n1, n2); return pq('comparar', 'fu' + n1 + n2, `¿Qué fracción es MAYOR, ${frs(1, n1)} o ${frs(1, n2)}?`, frs(1, big), [frs(1, small), 'Son iguales'], `Si el entero se reparte en menos partes, cada parte es mayor: ${frs(1, big)} > ${frs(1, small)}`); }],
    [3, 6, g => { const n = g === 3 ? R.int(2, 9) * 100 + R.int(1, 9) * 10 : g === 4 ? R.int(10, 99) * 100 : R.int(10, 999) * 100, k = R.pick(g === 3 ? [10] : [10, 100]), ans = n / k; if (ans < 2) return null; return pq('comparar', 'cu' + n + k, `¿Cuántas ${k === 10 ? 'decenas' : 'centenas'} hay en ${N(n)}?`, N(ans), [ans * 10, ans / 10, ans + 1, ans - 1].filter(x => x > 0 && Number.isInteger(x) && x !== ans).map(N), `${N(n)} ÷ ${k} = ${N(ans)}`); }],
    [5, 6, g => { if (g === 6) { const s = new Set(); while (s.size < 4) s.add(R.int(-9, 9)); const v = [...s], mn = Math.min(...v), lugar = R.pick(['Izaña', 'el Teide', 'La Esperanza']); return pq('comparar', 'ng' + v, `Estas son las temperaturas de esta noche: ${v.map(x => Z(x) + ' °C').join(', ')}. ¿Cuál es la MÁS BAJA?`, Z(mn) + ' °C', v.filter(x => x !== mn).map(x => Z(x) + ' °C'), `Entre los negativos, está más bajo el que tiene mayor valor absoluto: ${Z(mn)}`); } const u = R.int(1, 9), de = R.int(1, 9), ce = R.int(1, 9), n = u + de / 10 + ce / 100; return pq('comparar', 'dc' + u + de + ce, `¿Qué número decimal es ${u} ${u === 1 ? 'unidad' : 'unidades'}, ${de} ${de === 1 ? 'décima' : 'décimas'} y ${ce} ${ce === 1 ? 'centésima' : 'centésimas'}?`, D(Math.round(n * 100) / 100), [D(Math.round((u + ce / 10 + de / 100) * 100) / 100), D(Math.round((u + de + ce / 10) * 10) / 10), D(Math.round((u * 10 + de + ce / 10) * 10) / 10)].filter(x => x !== D(Math.round(n * 100) / 100)), `Unidades ${u}, décimas ${de}, centésimas ${ce}: ${D(Math.round(n * 100) / 100)}`); }]
  ],
  secuencias: [
    [1, 3, g => { const K = R.pick([['rojo', 'azul', 'verde'], ['amarillo', 'verde', 'rosa'], ['sol', 'luna', 'estrella'], ['gato', 'perro', 'pájaro'], ['círculo', 'cuadrado', 'triángulo']]), pat = R.pick([[0, 1], [0, 0, 1], [0, 1, 2], [0, 1]]), n = pat.length, seq = Array.from({ length: n * 2 }, (_, i) => K[pat[i % n]]), ans = K[pat[0]]; return pq('secuencias', 'co' + seq, `Sigue el patrón: ${seq.join(', ')}, ¿?`, ans, K.filter(x => x !== ans), `El patrón se repite: ${pat.map(i => K[i]).join(', ')}`); }],
    [1, 3, g => { const s = R.int(1, g === 1 ? 17 : 90), b = s + 2, ans = s + 1; return pq('secuencias', 'en' + s, `¿Qué número va en el hueco? ${s}, ${BLANK}, ${b}`, String(ans), numWrong(ans, [b, s]).map(String), `Entre ${s} y ${b} va ${ans}`); }],
    [1, 4, g => { const st = g === 1 ? R.pick([1, 2, 5]) : g <= 2 ? R.pick([2, 3, 5, 10]) : R.pick([3, 4, 6, 7, 9]), top = st * R.int(6, g <= 2 ? 9 : 12), seq = [top, top - st, top - 2 * st, top - 3 * st], ans = top - 4 * st; if (ans < 0) return null; return pq('secuencias', 'dw' + st + top, `Cuenta hacia atrás: ${seq.join(', ')}, ¿?`, String(ans), numWrong(ans, [ans + 2 * st, top - 5 * st < 0 ? ans + 1 : top - 5 * st]).map(String), `Cada vez resta ${st}: ${seq[3]} − ${st} = ${ans}`); }],
    [4, 6, g => { const a = R.int(1, 5), k = R.pick([10, 100, 5, 20]), seq = []; for (let i = 0; i < 3; i++) seq.push(a + i, (a + i) * k); const ans = (a + 3), shown = seq.join(', '); return pq('secuencias', 'al' + a + k, `Hay dos secuencias entrelazadas: ${shown}, ¿?`, String(ans), numWrong(ans, [(a + 3) * k, a + 2]).map(String), `Los números de lugar impar suben de 1 en 1 (${a}, ${a + 1}, ${a + 2}…), así que sigue ${ans}`); }],
    [5, 6, g => { const T = R.pick([[[1, 4, 9, 16], 25, ['20', '24', '26', '36'], 'Son los cuadrados: 1×1, 2×2, 3×3, 4×4… el siguiente es 5×5 = 25'], [[1, 3, 6, 10], 15, ['13', '14', '16', '20'], 'Se suma 2, 3, 4 y luego 5: 10 + 5 = 15'], [[1, 2, 4, 8], 16, ['10', '12', '14', '32'], 'Cada número es el doble del anterior: 8 × 2 = 16'], [[1, 3, 9, 27], 81, ['54', '36', '45', '243'], 'Cada número es el triple del anterior: 27 × 3 = 81'], [[2, 6, 12, 20], 30, ['28', '32', '24', '40'], 'Se suma 4, 6, 8 y luego 10: 20 + 10 = 30'], [[1, 8, 27, 64], 125, ['100', '81', '128', '216'], 'Son los cubos: 1, 2×2×2, 3×3×3, 4×4×4… el siguiente es 5×5×5 = 125']]); if (g === 5 && T[1] === 125) return null; return pq('secuencias', 'fg' + T[1], `¿Qué número sigue? ${T[0].join(', ')}, ¿?`, String(T[1]), T[2], T[3]); }],
    [2, 4, g => { const st = g === 2 ? 5 : R.pick([5, 6, 7, 8, 9]), a = st, seq = [a, a * 2, a * 3, a * 4], bad = []; const ok = a * R.int(5, 9); while (bad.length < 3) { const x = ok + R.pick([-2, -1, 1, 2, 3]); if (x % st !== 0 && !bad.includes(x) && x > 0) bad.push(x); } return pq('secuencias', 'pe' + st + ok, `En la secuencia de ${st} en ${st}: ${seq.join(', ')}…, ¿cuál de estos números aparece más adelante?`, String(ok), bad.map(String), `${ok} = ${st} × ${ok / st}: está en la lista de ${st} en ${st}`); }],
    [2, 6, g => { const k = g === 2 ? R.pick([2, 3, 5, 10]) : g <= 4 ? R.pick([4, 6, 7, 9, 12]) : R.pick([15, 25, 50, 125, 8, 11]), a = R.int(1, 9), seq = [a, a + k, a + 2 * k, a + 3 * k], ok = 'suma ' + k, bad = ['suma ' + (k + 1), 'suma ' + (k * 2), 'resta ' + k, 'suma ' + Math.max(1, k - 1)].filter(x => x !== ok); return pq('secuencias', 'rg' + a + k, `¿Cuál es la regla de la secuencia ${seq.join(', ')}…?`, ok, bad, `Cada número es ${k} más que el anterior: ${seq[1]} − ${seq[0]} = ${k}`); }],
    [5, 6, g => { const a = R.pick([1, 2, 3]), b = R.pick([1, 2, 3, 4]), c = a + b, d = b + c, e = c + d, seq = [a, b, c, d]; return pq('secuencias', 'fb' + seq, `Cada número es la suma de los dos anteriores: ${seq.join(', ')}, ¿?`, String(e), numWrong(e, [d + c + 1, d + b]).map(String), `${c} + ${d} = ${e}`); }],
    [3, 5, g => { const L = R.pick(['A, B, A, B, A, B', 'A, B, C, A, B, C', 'A, A, B, A, A, B', 'A, B, B, A, B, B']), arr = L.split(', '), P = { 'A, B, A, B, A, B': 'A', 'A, B, C, A, B, C': 'A', 'A, A, B, A, A, B': 'A', 'A, B, B, A, B, B': 'A' }[L]; const nxt = { 'A, B, A, B, A, B': 'A', 'A, B, C, A, B, C': 'A', 'A, A, B, A, A, B': 'A', 'A, B, B, A, B, B': 'A' }[L]; const lt = R.pick([['M', 'N', 'P'], ['X', 'Y', 'Z'], ['L', 'O', 'S']]), mp = x => ({ A: lt[0], B: lt[1], C: lt[2] }[x]), sh = arr.map(mp).join(', '), ask = R.pick([7, 8, 9]), pat = L.replace(/, /g, '').slice(0, L.replace(/, /g, '').length), unit = { 'A, B, A, B, A, B': 'AB', 'A, B, C, A, B, C': 'ABC', 'A, A, B, A, A, B': 'AAB', 'A, B, B, A, B, B': 'ABB' }[L], ans = mp(unit[(ask - 1) % unit.length]); return pq('secuencias', 'lt' + L + lt + ask, `Mira el patrón: ${sh}… ¿Qué letra ocupa el lugar ${ask}.º si el patrón sigue?`, ans, lt.filter(x => x !== ans).concat([R.pick(['Q', 'T'])]), `El patrón se repite cada ${unit.length}: el lugar ${ask} es la ${(ask - 1) % unit.length + 1}.ª del bloque, ${ans}`); }],
    [2, 6, g => { const d0 = g === 2 ? R.int(2, 8) : R.int(5, 30) , k = g === 2 ? R.pick([2, 3, 5]) : R.pick([2, 3, 4, 5, 8, 10]), w = g === 2 ? R.int(3, 4) : R.int(4, 9), ans = d0 + k * w; return pq('secuencias', 'ah' + d0 + k + w, `Hoy tengo ${d0} € en la hucha y cada semana meto ${k} €. ¿Cuántos euros tendré dentro de ${w} semanas?`, ans + ' €', numWrong(ans, [d0 + k, k * w, d0 * w]).map(x => x + ' €'), `${d0} + ${w} semanas de ${k} € = ${d0} + ${k * w} = ${ans}`); }]
  ],
  medida: [
    [1, 3, g => { const P = R.pick([['una noche de sueño', 'un parpadeo'], ['un verano', 'un estornudo'], ['una película', 'un bostezo'], ['un curso escolar', 'una clase'], ['un fin de semana', 'una hora']]), sw = R.chance(.5); const a = sw ? P[1] : P[0], b = sw ? P[0] : P[1]; return pq('medida', 'dm' + a, `¿Qué dura MÁS: ${a} o ${b}?`, sw ? P[0] : P[0], [sw ? P[1] : P[1], 'Duran igual'], `${P[0][0].toUpperCase() + P[0].slice(1)} dura más`); }],
    [1, 3, g => { const Q = R.pick([['¿Cuántos días tiene una semana?', '7', ['5', '6', '10']], ['¿Cuántos meses tiene un año?', '12', ['10', '11', '7']], ['¿Cuántas horas tiene un día?', '24', ['12', '20', '60']], ['¿Cuántos minutos tiene una hora?', '60', ['30', '100', '24']], ['¿Cuántos días tiene el mes de abril?', '30', ['31', '28', '29']], ['¿Cuántos días de la semana hay sin contar el fin de semana?', '5', ['4', '6', '7']], ['¿Cuántas estaciones tiene el año?', '4', ['3', '5', '6']]]); return pq('medida', 'cn' + Q[0], Q[0], Q[1], Q[2], 'Son ' + Q[1]); }],
    [2, 4, g => { const h = R.int(1, 11), kind = g === 2 ? R.pick(['y', 'enpunto', 'ymedia']) : R.pick(['y', 'ymedia', 'menos']), m = { y: 15, enpunto: 0, ymedia: 30, menos: 45 }[kind], t = hm(h, m), say = kind === 'y' ? `las ${h} y cuarto` : kind === 'ymedia' ? `las ${h} y media` : kind === 'menos' ? `las ${h + 1 > 12 ? 1 : h + 1} menos cuarto` : `las ${h} en punto`; return pq('medida', 'rl' + t + kind, `Son ${say}. ¿Cómo se escribe esa hora en un reloj digital?`, t, uniq([hm(h, m === 15 ? 45 : m === 45 ? 15 : 30), hm(h + 1, m), hm(h, 5), hm(h - 1, m)]).filter(x => x !== t), `${say[0].toUpperCase() + say.slice(1)} = ${t}`.replace('Las', 'Las')); }],
    [1, 6, g => { const lim = g === 1 ? 10 : g === 2 ? 20 : g <= 4 ? 50 : 100; if (g >= 5 && R.chance(.5) || g === 4 && R.chance(.5)) { const pay = R.pick([10, 20, 50]), cost = R.int(Math.floor(pay * 2) / 10 * 5, pay * 9) / 10 * 1; const c = Math.round(R.int(25, pay * 9) * 10) / 100; const ret = Math.round((pay - c) * 100) / 100; if (ret <= 0 || ret === pay) return null; return pq('medida', 'cm' + pay + c, `Pagas con un billete de ${pay} € algo que cuesta ${D(c)} €. ¿Cuánto te devuelven?`, D(ret) + ' €', [D(Math.round((ret + 1) * 100) / 100), D(Math.round((ret - 1) * 100) / 100), D(c), D(Math.round((ret + .5) * 100) / 100)].filter(x => x !== D(ret) && Number(x.replace(',', '.')) > 0).map(x => x + ' €'), `${pay} − ${D(c)} = ${D(ret)}`); } const pay = lim, cost = R.int(2, lim - 1), ret = pay - cost; return pq('medida', 'cm' + pay + cost, `Pagas con ${g === 1 ? 'un billete de 10 €' : 'un billete de ' + pay + ' €'} algo que cuesta ${cost} €. ¿Cuánto te devuelven?`, ret + ' €', numWrong(ret, [cost, pay]).map(x => x + ' €'), `${pay} − ${cost} = ${ret}`); }],
    [2, 6, g => { const I = R.pick([['la altura de una palmera', 'metros', ['centímetros', 'kilómetros', 'milímetros']], ['la longitud de un lápiz', 'centímetros', ['metros', 'kilómetros', 'litros']], ['la distancia entre Santa Cruz y La Laguna', 'kilómetros', ['metros', 'centímetros', 'gramos']], ['la cantidad de agua de una botella', 'litros', ['metros', 'gramos', 'kilómetros']], ['el peso de una sandía', 'kilogramos', ['gramos', 'litros', 'metros']], ['el peso de una pluma', 'gramos', ['kilogramos', 'metros', 'litros']], ['la longitud de un campo de fútbol', 'metros', ['centímetros', 'milímetros', 'gramos']], ['el grosor de una moneda', 'milímetros', ['metros', 'kilómetros', 'kilogramos']]]); if (g === 2 && ['milímetros', 'kilómetros'].includes(I[1])) return null; return pq('medida', 'un' + I[0], `¿En qué unidad medirías ${I[0]}?`, I[1], I[2], `Lo normal es medirlo en ${I[1]}`); }],
    [4, 6, g => { const L = g === 4 ? 1 : R.pick([1, 2, 3]), v = R.pick([250, 200, 500, 100]), n = L * 1000 / v; return pq('medida', 'va' + L + v, `Con una jarra de ${L} ${L === 1 ? 'litro' : 'litros'} se llenan vasos de ${v} ml. ¿Cuántos vasos se llenan? (1 l = 1 000 ml)`, String(n), numWrong(n, [n * 2, L, v]).map(String), `${L} l = ${N(L * 1000)} ml; ${N(L * 1000)} ÷ ${v} = ${n}`); }],
    [3, 6, g => { const mes = R.pick([['enero', 31], ['marzo', 31], ['mayo', 31], ['abril', 30], ['junio', 30], ['septiembre', 30]]), a = R.int(2, 12), b = a + R.int(3, 16); if (b > mes[1]) return null; const dif = b - a; return pq('medida', 'ca' + mes[0] + a + b, `¿Cuántos días pasan desde el ${a} de ${mes[0]} hasta el ${b} de ${mes[0]}?`, String(dif), numWrong(dif, [dif + 1, b + a]).map(String), `${b} − ${a} = ${dif}`); }],
    [4, 6, g => { const h1 = R.int(6, 11), m1 = R.pick([0, 10, 15, 20, 30, 40, 45, 50]), d = R.pick([55, 65, 70, 75, 85, 95, 100, 110, 125]), tt = h1 * 60 + m1 + d, h2 = Math.floor(tt / 60), m2 = tt % 60, hh = Math.floor(d / 60), mm = d % 60, ok = (hh ? hh + ' h ' : '') + (mm ? mm + ' min' : ''), fmt = x => (Math.floor(x / 60) ? Math.floor(x / 60) + ' h ' : '') + (x % 60 ? x % 60 + ' min' : '').trim(), bad = [d + 10, d - 10, d + 30, d - 20, d + 60].filter(x => x > 0).map(fmt).map(s => s.trim()); return pq('medida', 'vi' + h1 + m1 + d, `El ferry sale a las ${hm(h1, m1)} y llega a las ${hm(h2, m2)}. ¿Cuánto dura el viaje?`, fmt(d).trim(), bad.filter(x => x !== fmt(d).trim()), `Desde las ${hm(h1, m1)} hasta las ${hm(h2, m2)} pasan ${fmt(d).trim()}`); }],
    [4, 6, g => { const kg = R.int(1, 4), gr = R.pick([250, 500, 750, 100, 300]), ans = kg * 1000 + gr; return pq('medida', 'pa' + kg + gr, `En la cesta hay ${kg} kg de papas y ${gr} g de tomates. ¿Cuántos gramos hay en total?`, N(ans) + ' g', [N(kg + gr) + ' g', N(kg * 100 + gr) + ' g', N(ans + 1000) + ' g', N(ans - 500) + ' g'].filter(x => x !== N(ans) + ' g'), `${kg} kg = ${N(kg * 1000)} g; ${N(kg * 1000)} + ${gr} = ${N(ans)} g`); }],
    [3, 6, g => { if (g === 6 && R.chance(.6)) { const t = R.int(-8, -1), up = R.int(t * -1 + 1, t * -1 + 8), ans = t + up; return pq('medida', 'tg' + t + up, `El termómetro marca ${Z(t)} °C y sube ${up} grados. ¿Qué temperatura marca ahora?`, Z(ans) + ' °C', [ans + 1, ans - 1, ans + 2, -ans, t - up].filter(x => x !== ans).map(x => Z(x) + ' °C'), `${Z(t)} + ${up} = ${Z(ans)}`); } const t = R.int(12, 30), down = R.chance(.5), k = R.int(3, 9), ans = down ? t - k : t + k; return pq('medida', 'tp' + t + k + down, `El termómetro marca ${t} °C y ${down ? 'baja' : 'sube'} ${k} grados. ¿Qué temperatura marca ahora?`, ans + ' °C', [ans + 1, ans - 1, ans + 2, down ? t + k : t - k].filter(x => x !== ans).map(x => x + ' °C'), `${t} ${down ? '−' : '+'} ${k} = ${ans}`); }]
  ],
  geometria: [
    [1, 3, g => { const S = R.pick([['la tapa de una lata', 'círculo'], ['una ventana normal', 'rectángulo'], ['un pañuelo cuadrado', 'cuadrado'], ['una señal de «ceda el paso»', 'triángulo'], ['la rueda de una bici', 'círculo'], ['una baldosa del suelo', 'cuadrado'], ['una pizza entera', 'círculo'], ['la pantalla de una tableta', 'rectángulo']]), all = ['círculo', 'cuadrado', 'triángulo', 'rectángulo']; return pq('geometria', 'of' + S[0], `¿Qué figura tiene ${S[0]}?`, S[1], all.filter(x => x !== S[1]), `${S[0][0].toUpperCase() + S[0].slice(1)} tiene forma de ${S[1]}`); }],
    [2, 4, g => { const P = ['norte', 'este', 'sur', 'oeste'], i = R.int(0, 3), right = R.chance(.5), j = (i + (right ? 1 : 3)) % 4, ans = P[j]; return pq('geometria', 'br' + i + right, `Miras hacia el ${P[i]} y giras un cuarto de vuelta hacia tu ${right ? 'derecha' : 'izquierda'}. ¿Hacia dónde miras ahora?`, ans, P.filter(x => x !== ans), `Con ${right ? 'giro a la derecha' : 'giro a la izquierda'} desde el ${P[i]} se llega al ${ans}`); }],
    [3, 6, g => { const a = R.pick([20, 35, 45, 60, 85, 90, 100, 120, 135, 150, 170, 180, 30, 75, 110]), t = a < 90 ? 'agudo' : a === 90 ? 'recto' : a < 180 ? 'obtuso' : 'llano'; return pq('geometria', 'ta' + a, `Un ángulo mide ${a}°. ¿Qué tipo de ángulo es?`, t, ['agudo', 'recto', 'obtuso', 'llano'].filter(x => x !== t), `Agudo menor de 90°, recto 90°, obtuso entre 90° y 180°, llano 180°. Este es ${t}`); }],
    [3, 6, g => { const Q = R.pick([['Dos rectas que nunca se cruzan, aunque las alarguemos, son…', 'paralelas', ['secantes', 'perpendiculares', 'oblicuas'], 'Paralelas: van siempre a la misma distancia y nunca se cortan'], ['Dos rectas que se cruzan formando un ángulo recto son…', 'perpendiculares', ['paralelas', 'curvas', 'oblicuas'], 'Perpendiculares: se cortan formando 90°'], ['Dos rectas que se cortan en un punto son…', 'secantes', ['paralelas', 'iguales', 'cóncavas'], 'Secantes: tienen un punto en común'], ['Los dos raíles de un tren en un tramo recto son rectas…', 'paralelas', ['secantes', 'perpendiculares', 'cruzadas'], 'Paralelas: siempre a la misma distancia'], ['Dos lados contiguos de una hoja de papel forman rectas…', 'perpendiculares', ['paralelas', 'curvas', 'llanas'], 'Perpendiculares: la esquina de la hoja es un ángulo recto']]); return pq('geometria', 're' + Q[0], Q[0], Q[1], Q[2], Q[3]); }],
    [4, 6, g => { const S = R.pick([['un cubo', 'caras', 6], ['un cubo', 'aristas', 12], ['un cubo', 'vértices', 8], ['una pirámide de base cuadrada', 'caras', 5], ['una pirámide de base cuadrada', 'vértices', 5], ['una pirámide de base cuadrada', 'aristas', 8], ['un prisma triangular', 'caras', 5], ['un prisma triangular', 'vértices', 6], ['un prisma triangular', 'aristas', 9], ['una caja de zapatos', 'caras', 6]]); return pq('geometria', 'co' + S[0] + S[1], `¿Cuántas ${S[1]} tiene ${S[0]}?`, String(S[2]), numWrong(S[2], [S[2] + 3]).map(String), `${S[0][0].toUpperCase() + S[0].slice(1)} tiene ${S[2]} ${S[1]}`); }],
    [2, 5, g => { const O = R.pick([['una lata de atún', 'cilindro'], ['un balón', 'esfera'], ['un dado', 'cubo'], ['un cucurucho de helado', 'cono'], ['una caja de zapatos', 'prisma'], ['una naranja', 'esfera'], ['un tubo de papel', 'cilindro'], ['un gorro de fiesta', 'cono']]), all = ['cilindro', 'esfera', 'cubo', 'cono', 'prisma', 'pirámide']; const art = ['esfera', 'pirámide'].includes(O[1]) ? 'una' : 'un'; return pq('geometria', 'ob' + O[0], `¿Qué cuerpo geométrico se parece a ${O[0]}?`, O[1], all.filter(x => x !== O[1]), `${O[0][0].toUpperCase() + O[0].slice(1)} se parece a ${art} ${O[1]}`); }],
    [4, 6, g => { const Q = R.pick([['El segmento que une dos puntos de la circunferencia pasando por el centro es el…', 'diámetro'], ['El segmento que va del centro a un punto de la circunferencia es el…', 'radio'], ['Un segmento que une dos puntos de la circunferencia sin pasar por el centro es una…', 'cuerda'], ['Un trozo de circunferencia se llama…', 'arco']]), all = ['diámetro', 'radio', 'cuerda', 'arco']; return pq('geometria', 'ci' + Q[1], Q[0], Q[1], all.filter(x => x !== Q[1]), Q[1][0].toUpperCase() + Q[1].slice(1)); }],
    [5, 6, g => { if (g === 6 && R.chance(.5)) { const a = R.pick([20, 30, 50, 60, 70, 80, 110, 120, 130, 140]), b = 180 - a; return pq('geometria', 'su' + a, `Dos ángulos suplementarios suman 180°. Si uno mide ${a}°, ¿cuánto mide el otro?`, b + '°', [90 - a > 0 ? 90 - a : a + 10, a, b + 10, b - 10].filter(x => x !== b && x > 0).map(x => x + '°'), `180 − ${a} = ${b}`); } const a = R.pick([10, 20, 25, 30, 35, 40, 55, 60, 65, 70]), b = 90 - a; return pq('geometria', 'cm' + a, `Dos ángulos complementarios suman 90°. Si uno mide ${a}°, ¿cuánto mide el otro?`, b + '°', [180 - a, a + 10, b + 10, b - 10, 100 - a].filter(x => x !== b && x > 0).map(x => x + '°'), `90 − ${a} = ${b}`); }],
    [3, 6, g => { const V = ['A', 'H', 'M', 'T', 'U', 'V', 'W', 'Y'], N0 = ['F', 'G', 'J', 'L', 'P', 'R', 'S', 'Z'], ok = R.pick(V), bad = R.shuffle(N0).slice(0, 3); return pq('geometria', 'si' + ok + bad, `¿Cuál de estas letras tiene un eje de simetría vertical (se ve igual a ambos lados de una línea vertical)?`, ok, bad, `La ${ok} es igual a izquierda y derecha`, { big: false }); }],
    [1, 2, g => { const Q = R.pick([['Si la pelota está encima de la mesa, ¿dónde está la mesa respecto a la pelota?', 'debajo', ['encima', 'al lado', 'lejos']], ['Si el gato está delante del sofá, ¿dónde está el sofá respecto al gato?', 'detrás', ['delante', 'encima', 'a la derecha']], ['Si tu mano derecha toca la puerta, ¿qué mano está lejos de la puerta?', 'la izquierda', ['la derecha', 'las dos', 'ninguna']], ['La lámpara está arriba y la alfombra abajo. ¿Qué está más cerca del suelo?', 'la alfombra', ['la lámpara', 'las dos', 'ninguna']], ['Para ir de la entrada al patio, caminas hacia delante. ¿Cómo vuelves?', 'hacia atrás', ['hacia arriba', 'hacia delante', 'a la derecha']]]); return pq('geometria', 'po' + Q[0], Q[0], Q[1], Q[2], Q[1][0].toUpperCase() + Q[1].slice(1)); }]
  ],
  areas: [
    [1, 3, g => { const w = R.int(2, g === 1 ? 5 : 6), h = R.int(2, g === 1 ? 3 : 4), ans = w * h; return pq('areas', 'gc' + w + h, `¿Cuántos cuadraditos tiene este rectángulo?`, String(ans), numWrong(ans, [w + h, 2 * (w + h)]).map(String), `Hay ${h} filas de ${w}: ${Array(h).fill(w).join(' + ')} = ${ans}`, { visual: svg(`0 0 ${w * GCELL + 8} ${h * GCELL + 8}`, gridSvg(w, h), 'grid') }); }],
    [1, 3, g => { const w = R.int(3, 5), h = R.int(3, 4), gone = new Set(), cw = R.int(1, 2), ch = R.int(1, 2); for (let x = w - cw; x < w; x++) for (let y = 0; y < ch; y++) gone.add(x + ',' + y); const ans = w * h - cw * ch; return pq('areas', 'gl' + w + h + cw + ch, `¿Cuántos cuadraditos tiene esta figura?`, String(ans), numWrong(ans, [w * h, w + h]).map(String), `Cuenta uno a uno: ${ans} cuadraditos`, { visual: svg(`0 0 ${w * GCELL + 8} ${h * GCELL + 8}`, gridSvg(w, h, gone, '#ffd23f'), 'grid') }); }],
    [1, 3, g => { const a = [R.int(2, 4), R.int(2, 3)], b = [R.int(2, 4), R.int(2, 3)], A = a[0] * a[1], B = b[0] * b[1], ok = A > B ? 'La figura A' : A < B ? 'La figura B' : 'Las dos igual'; const W = a[0] * GCELL + b[0] * GCELL + 40, H = Math.max(a[1], b[1]) * GCELL + 36; const v = svg(`0 0 ${W} ${H}`, gridSvg(a[0], a[1], null, '#2de2ff', 4, 4, 'A') + gridSvg(b[0], b[1], null, '#ff8fb8', a[0] * GCELL + 36, 4, 'B'), 'grid'); return pq('areas', 'gm' + a + b, '¿Qué figura cubre MÁS cuadraditos?', ok, ['La figura A', 'La figura B', 'Las dos igual'].filter(x => x !== ok), `A tiene ${A} cuadraditos y B tiene ${B}`, { visual: v, order: ['La figura A', 'La figura B', 'Las dos igual'] }); }],
    [3, 5, g => { const w = R.int(2, 7), h = R.int(2, 5), ans = 2 * (w + h); return pq('areas', 'gp' + w + h, 'Cada cuadradito mide 1 cm de lado. ¿Cuál es el perímetro de este rectángulo?', ans + ' cm', numWrong(ans, [w * h, w + h]).map(x => x + ' cm'), `Vuelta completa: ${w} + ${h} + ${w} + ${h} = ${ans} cm`, { visual: svg(`0 0 ${w * GCELL + 8} ${h * GCELL + 8}`, gridSvg(w, h, null, '#b6ff3b'), 'grid') }); }],
    [4, 6, g => { const l = R.int(3, 9), a = R.int(2, 5), cost = R.pick([1, 2, 3]), area = l * a, ans = area * cost; return pq('areas', 'pt' + l + a + cost, `Una pared mide ${l} m de largo y ${a} m de alto. Para cada m² ${cost === 1 ? 'hace falta 1 litro' : 'hacen falta ' + cost + ' litros'} de pintura. ¿Cuántos litros se necesitan?`, ans + ' l', numWrong(ans, [area, 2 * (l + a), l * a * cost + cost]).map(x => x + ' l'), `Área: ${l} × ${a} = ${area} m²; ${area} × ${cost} = ${ans} litros`); }],
    [5, 6, g => { const k = R.int(1, 9), t = R.pick(['m2dm', 'dm2cm']), ans = k * 100; return pq('areas', 'ud' + t + k, t === 'm2dm' ? `${k} m² = ${BLANK} dm²` : `${k} dm² = ${BLANK} cm²`, N(ans), [k * 10, k * 1000, k * 100 + 10, k].map(N).filter(x => x !== N(ans)), `${t === 'm2dm' ? '1 m² = 100 dm²' : '1 dm² = 100 cm²'}; ${k} × 100 = ${ans}`); }],
    [5, 6, g => { const a = R.int(3, 9), b = R.int(2, 6), c = R.int(2, 5), d = R.int(2, 5), A = a * b + c * d; return pq('areas', 'ls' + a + b + c + d, `Un jardín con forma de L se forma con un rectángulo de ${a} m × ${b} m y otro de ${c} m × ${d} m. ¿Cuál es su área total?`, A + ' m²', numWrong(A, [a * b, c * d, (a + c) * (b + d)]).map(x => x + ' m²'), `${a} × ${b} = ${a * b} y ${c} × ${d} = ${c * d}; ${a * b} + ${c * d} = ${A}`); }],
    [4, 6, g => { const l = R.pick([20, 30, 40, 50, 60, 80, 100]), a = R.pick([10, 20, 30, 40, 50, 60].filter(x => x !== l)), ar = l * a, o = R.pick(['un campo de fútbol sala', 'una cancha del patio', 'un terreno en La Laguna', 'una finca de plataneras']); return pq('areas', 'te' + l + a, `${o[0].toUpperCase() + o.slice(1)} mide ${l} m de largo y ${a} m de ancho. ¿Cuál es su área?`, N(ar) + ' m²', numWrong(ar, [2 * (l + a), l + a, ar * 10]).map(x => N(Number(x)) + ' m²'), `${l} × ${a} = ${N(ar)} m²`); }],
    [4, 6, g => { const a = [R.int(3, 9), R.int(2, 8)], b = [R.int(3, 9), R.int(2, 8)], A = a[0] * a[1], B = b[0] * b[1]; if (A === B) return null; const ok = A > B ? 'A' : 'B'; return pq('areas', 'cm' + a + b, `El rectángulo A mide ${a[0]} cm × ${a[1]} cm y el rectángulo B mide ${b[0]} cm × ${b[1]} cm. ¿Cuál tiene MAYOR área?`, 'El rectángulo ' + ok, ['El rectángulo A', 'El rectángulo B', 'Igual'].filter(x => x !== 'El rectángulo ' + ok), `A: ${A} cm²; B: ${B} cm²`, { order: ['El rectángulo A', 'El rectángulo B', 'Igual'] }); }],
    [5, 6, g => { const l = R.int(2, 7), A2 = 4 * l * l; return pq('areas', 'du' + l, `Un cuadrado tiene ${l} cm de lado. Si duplicamos el lado, ¿cuál es el área del nuevo cuadrado?`, A2 + ' cm²', [l * l * 2, l * l, 2 * (2 * l) * 2, l * l * 3].filter(x => x !== A2).map(x => x + ' cm²'), `Nuevo lado ${2 * l} cm; ${2 * l} × ${2 * l} = ${A2} cm²`); }]
  ],
  datos: [
    [2, 4, g => { const n = R.int(g === 2 ? 3 : 6, g === 2 ? 14 : 24); return pq('datos', 'ta' + n, '¿Cuántas marcas hay? (cada grupo tachado vale 5)', String(n), numWrong(n, [n + 5, n - 5, Math.ceil(n / 5)]).map(String), `${Math.floor(n / 5)} grupos de 5 y ${n % 5} sueltas = ${n}`, { visual: tallySvg(n) }); }],
    [3, 5, g => { const cats = R.shuffle(FRUITS).slice(0, 4), vals = R.shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 4), i = R.int(0, 3), ans = vals[i] * 2; return pq('datos', 'p2' + vals + i + cats.map(x => x[0]), `En este pictograma cada círculo vale 2 votos. ¿Cuántos votos tiene ${cats[i][0] === 'uva' || cats[i][0] === 'papaya' || cats[i][0] === 'piña' ? 'la' : 'el'} ${cats[i][0]}?`, String(ans), numWrong(ans, [vals[i], vals[i] * 3]).map(String), `${vals[i]} círculos × 2 = ${ans} votos`, { visual: pictoSvg(cats, vals) }); }],
    [1, 6, g => { const a = R.int(2, g <= 2 ? 4 : 5), b = R.int(a + 2, a + 5), C = R.pick([['roja', 'azul', 'rojas', 'azules', 'rojo', 'azul'], ['verde', 'amarilla', 'verdes', 'amarillas', 'verde', 'amarillo'], ['blanca', 'negra', 'blancas', 'negras', 'blanco', 'negro']]), sw = R.chance(.5), x = sw ? b : a, y = sw ? a : b, win = x > y ? C[4] : C[5], lose = x > y ? C[5] : C[4]; return pq('datos', 'pr' + x + y + C[0], `En una bolsa hay ${x} bolas ${C[2]} y ${y} bolas ${C[3]}. Sacas una sin mirar. ¿De qué color es más probable que salga?`, win, [lose, 'Es igual de probable'], `Hay más bolas ${x > y ? C[2] : C[3]} (${Math.max(x, y)} frente a ${Math.min(x, y)}), así que es más probable ese color`, { order: [win, lose, 'Es igual de probable'].sort() }); }],
    [1, 3, g => { const C = R.pick([[['una manzana', 'un plátano', 'una pera'], 'una silla', 'fruta'], [['un perro', 'un gato', 'un caballo'], 'una mesa', 'animal'], [['un coche', 'una bici', 'un barco'], 'una pera', 'transporte'], [['una camiseta', 'un pantalón', 'un jersey'], 'un lápiz', 'ropa'], [['un lápiz', 'una goma', 'un cuaderno'], 'un gato', 'material escolar']]); const set = R.shuffle(C[0]).slice(0, 3); return pq('datos', 'cl' + C[2] + set, `¿Cuál NO es ${C[2] === 'ropa' ? 'ropa' : C[2] === 'material escolar' ? 'material escolar' : 'un(a) ' + C[2]}?`.replace('un(a) fruta', 'una fruta').replace('un(a) animal', 'un animal').replace('un(a) transporte', 'un medio de transporte'), C[1], set, `${C[1][0].toUpperCase() + C[1].slice(1)} no es ${C[2]}`); }],
    [2, 6, g => { const WD = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'], d = R.shuffle(WD).slice(0, 4).sort((x, y) => WD.indexOf(x) - WD.indexOf(y)), v = d.map(() => R.int(g === 2 ? 2 : 5, g === 2 ? 9 : 40)), tot = v.reduce((a, b) => a + b, 0); const it = R.pick(['libros prestados', 'visitas al huerto', 'bocadillos vendidos']); return pq('datos', 'tt' + d + v, `Esta semana: ${d.map((x, i) => x + ' ' + v[i]).join(', ')} ${it}. ¿Cuántos ${it} fueron en total?`, String(tot), numWrong(tot, [Math.max(...v), tot - Math.min(...v)]).map(String), `${v.join(' + ')} = ${tot}`); }],
    [4, 6, g => { const mx = R.int(20, 35), mn = R.int(10, mx - 3), ans = mx - mn; return pq('datos', 'ra' + mx + mn, `La temperatura más alta de la semana fue ${mx} °C y la más baja ${mn} °C. ¿Cuál es el rango (diferencia entre la mayor y la menor)?`, ans + ' °C', numWrong(ans, [mx + mn, mx]).map(x => x + ' °C'), `${mx} − ${mn} = ${ans}`); }],
    [2, 6, g => { const tot = g <= 3 ? R.pick([10, 20]) : R.pick([20, 24, 30, 40]), k = g <= 3 ? R.int(2, tot - 2) : R.int(3, tot - 3), dep = R.pick(['fútbol', 'baloncesto', 'natación', 'lucha canaria']); if (g >= 5) { const gg = gcd(k, tot); return pq('datos', 'fr' + tot + k, `En una encuesta, ${k} de ${tot} alumnos prefieren ${dep}. ¿Qué fracción del grupo es? (simplificada)`, tot / gg === 1 ? '1' : F(k / gg, tot / gg), [F(tot - k, tot), F(k / gg + 1, tot / gg), F(tot, k), F(k, tot + 1)].filter(x => x !== F(k / gg, tot / gg)), `${k} de ${tot} = ${F(k, tot)} = ${F(k / gg, tot / gg)}`); } return pq('datos', 'nf' + tot + k, `En una encuesta de ${tot} alumnos, ${k} prefieren ${dep}. ¿Cuántos NO lo prefieren?`, String(tot - k), numWrong(tot - k, [tot, k]).map(String), `${tot} − ${k} = ${tot - k}`); }],
    [3, 6, g => { const nm = R.shuffle(['Aday', 'Yaiza', 'Nauzet']).slice(0, 3), hd = ['Lunes', 'Martes'], rows = nm.map(n => [n, R.int(1, 9), R.int(1, 9)]), i = R.int(0, 2), tot = rows[i][1] + rows[i][2]; return pq('datos', 'tb' + rows.flat(), `La tabla muestra los puntos de cada niño. ¿Cuántos puntos consiguió ${rows[i][0]} entre los dos días?`, String(tot), numWrong(tot, [rows[i][1], rows[i][2], tot + 2]).map(String), `${rows[i][1]} + ${rows[i][2]} = ${tot}`, { visual: tableSvg(hd, rows) }); }],
    [2, 5, g => { const WD = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'], d = R.shuffle(WD).slice(0, 4).sort((x, y) => WD.indexOf(x) - WD.indexOf(y)), v = R.shuffle([16, 18, 19, 21, 22, 24, 25, 27]).slice(0, 4), mx = Math.max(...v), warm = R.chance(.5), tg = warm ? Math.max(...v) : Math.min(...v), di = d[v.indexOf(tg)]; return pq('datos', 'tc' + d + v + warm, `Temperaturas: ${d.map((x, i) => x + ' ' + v[i] + ' °C').join(', ')}. ¿Qué día hizo MÁS ${warm ? 'calor' : 'frío'}?`, di, d.filter(x => x !== di), `${warm ? 'La mayor' : 'La menor'} temperatura es ${tg} °C: el ${di}`); }],
    [4, 6, g => { const a = R.int(2, 4), b = R.int(2, 4), ans = a * b, T = R.pick([['camisetas', 'pantalones', 'conjuntos'], ['bocadillos', 'bebidas', 'menús'], ['helados', 'sabores', 'combinaciones']]); if (T[0] === 'helados') return pq('datos', 'cb' + a + b + T[0], `Hay ${a} tipos de cucurucho y ${b} sabores de helado. ¿Cuántas combinaciones distintas hay si eliges un cucurucho y un sabor?`, String(ans), numWrong(ans, [a + b, a * b + a]).map(String), `${a} × ${b} = ${ans}`); return pq('datos', 'cb' + a + b + T[0], `Tienes ${a} ${T[0]} y ${b} ${T[1]}. ¿Cuántos ${T[2]} distintos puedes hacer combinando uno de cada?`, String(ans), numWrong(ans, [a + b, a * b + a]).map(String), `${a} × ${b} = ${ans}`); }]
  ],
  fracciones: [
    [3, 4, g => { const a = R.pick([2, 3, 4, 5, 6, 8]), b = R.pick([2, 3, 4, 5, 6, 8].filter(x => x !== a)), big = Math.min(a, b), sm = Math.max(a, b); return pq('fracciones', 'uf' + a + b, `¿Qué es mayor, ${frs(1, a)} o ${frs(1, b)}?`, frs(1, big), [frs(1, sm), 'Son iguales'], `Cuantas más partes, más pequeña cada parte: ${frs(1, big)} > ${frs(1, sm)}`); }],
    [3, 4, g => { const n = R.int(1, 7), d = R.int(n + 1, 9), Q = R.pick([[`En la fracción ${frs(n, d)}, ¿cómo se llama el número ${d}?`, 'denominador', ['numerador', 'entero', 'cociente']], [`En la fracción ${frs(n, d)}, ¿cómo se llama el número ${n}?`, 'numerador', ['denominador', 'entero', 'cociente']], [`En ${frs(n, d)}, ¿qué indica el denominador ${d}?`, `en cuántas partes iguales se divide el entero`, ['cuántas partes tomamos', 'cuántos enteros hay', 'cuánto mide cada parte en cm']]]); return pq('fracciones', 'nm' + n + d + Q[1], Q[0], Q[1], Q[2], 'El denominador abajo dice en cuántas partes se divide; el numerador arriba, cuántas se toman'); }],
    [4, 5, g => { const d = R.pick([2, 3, 4, 5, 6]), e = R.int(2, 5), ans = d * e, nm = { 2: 'medios', 3: 'tercios', 4: 'cuartos', 5: 'quintos', 6: 'sextos' }[d]; return pq('fracciones', 'en' + d + e, `¿Cuántos ${nm} hay en ${e} enteros?`, String(ans), numWrong(ans, [d + e, e]).map(String), `En 1 entero hay ${d} ${nm}; en ${e} enteros, ${d} × ${e} = ${ans}`); }],
    [5, 6, g => { const n = R.pick([8, 6, 5]), k = R.int(1, n - 1), u = R.int(2, 6), tot = n * u, comido = k * u, ans = tot - comido; return pq('fracciones', 'rs' + n + k + u, `Una caja tiene ${tot} quesadillas. Te comes ${frs(k, n)} de la caja. ¿Cuántas quesadillas quedan?`, String(ans), numWrong(ans, [comido, tot]).map(String), `${frs(k, n)} de ${tot} = ${comido}; ${tot} − ${comido} = ${ans}`); }],
    [4, 6, g => { const d = R.pick([5, 6, 7, 8, 9, 10, 12]), a = R.int(1, d - 3), b = R.int(1, d - a - 1), sub = R.chance(.4) && a > b, s = sub ? a - b : a + b; if (!sub && a + b >= d + 1) return null; if (sub && s < 1) return null; return pq('fracciones', 'ss' + d + a + b + sub, `${frs(a, d)} ${sub ? '−' : '+'} ${frs(b, d)} = ?`, frs(s, d), [frs(s, d + d), frs(a + b + (sub ? 1 : 0) === s ? s + 1 : a + b, d + d), frs(s + 1, d), frs(Math.max(1, s - 1), d)].filter(x => x !== frs(s, d)), `Con el mismo denominador, se ${sub ? 'restan' : 'suman'} los numeradores: ${a} ${sub ? '−' : '+'} ${b} = ${s}`); }],
    [3, 5, g => { const d = R.pick([4, 5, 6, 8, 10]), k = R.int(1, d - 1), t = R.pick(['una tarta', 'una barra de pan', 'una tableta de chocolate']); return pq('fracciones', 'qd' + d + k, `Te comes ${frs(k, d)} de ${t}. ¿Qué fracción queda?`, frs(d - k, d), [frs(k, d), frs(d - k, d + 1), frs(k + 1, d), frs(d, k)].filter(x => x !== frs(d - k, d) && x !== frs(k, d) || (x === frs(k, d) && k !== d - k && x !== frs(d - k, d))), `El entero son ${frs(d, d)}; ${d} − ${k} = ${d - k}`); }],
    [5, 6, g => { const d = R.pick([3, 4, 5, 6]), e = R.int(1, 2), r = R.int(1, d - 1), n = e * d + r; return pq('fracciones', 'im' + n + d, `${frs(n, d)} es igual a…`, `${e} y ${frs(r, d)}`, [`${e + 1} y ${frs(r, d)}`, `${e} y ${frs(r + 1, d)}`, `${e} y ${frs(d - r, d)}`, `${e - 1 || 3} y ${frs(r, d)}`].filter(x => x !== `${e} y ${frs(r, d)}`), `${n} ÷ ${d} = ${e} y sobran ${r}: ${e} y ${frs(r, d)}`); }],
    [5, 6, g => { const T = R.pick([[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [1, 10, 10], [2, 5, 40], [1, 100, 1], [1, 20, 5]]); if (R.chance(.5)) return pq('fracciones', 'pf' + T, `${frs(T[0], T[1])} equivale al ${BLANK} %`, String(T[2]), numWrong(T[2], [T[1], T[0], 100 - T[2]]).map(String), `${frs(T[0], T[1])} de 100 = ${T[2]}`); return pq('fracciones', 'fp' + T, `El ${T[2]} % se escribe como la fracción…`, frs(T[0], T[1]), [frs(T[1], T[0]), frs(T[2], 10), frs(T[0] + 1, T[1]), frs(T[0], T[1] + 1)].filter(x => x !== frs(T[0], T[1])), `${T[2]} % = ${frs(T[2], 100)} = ${frs(T[0], T[1])}`); }],
    [6, 6, g => { const P = R.pick([[1, 2, 1, 4, 3, 4], [1, 4, 1, 4, 1, 2], [1, 2, 1, 3, 5, 6], [1, 3, 1, 6, 1, 2], [3, 4, 1, 2, 5, 4], [2, 3, 1, 6, 5, 6]]); return pq('fracciones', 'dd' + P, `${frs(P[0], P[1])} + ${frs(P[2], P[3])} = ?`, P[5] === 4 && P[4] === 5 ? frs(5, 4) : frs(P[4], P[5]), [frs(P[0] + P[2], P[1] + P[3]), frs(P[4] + 1, P[5]), frs(P[4], P[5] + 2), frs(P[0] + P[2], P[1])].filter(x => x !== frs(P[4], P[5])), `Se pone el mismo denominador (${P[5]}) y se suman los numeradores`); }],
    [4, 6, g => { const n = R.pick([2, 3, 4, 5]), d = n === 2 ? R.pick([4, 6, 8]) : R.pick([n * 2, n * 3]), k = R.int(1, n - 1); return pq('fracciones', 'rl' + n + k, `¿Qué fracción señala la flecha? (el entero está dividido en ${n} partes iguales)`, frs(k, n), [frs(k + 1, n), frs(k, n + 1), frs(n - k, n + 1 > 9 ? n : n), frs(k - 1 || n, n)].filter(x => x !== frs(k, n)), `La flecha está en la marca ${k} de ${n}`, { visual: lineSvg(n, k) }); }]
  ],
  tablas: [
    [3, 6, g => { const t = g <= 4 ? R.int(2, 9) : R.int(6, 15), ok = t * R.int(2, 9), bad = new Set(); while (bad.size < 3) { const x = ok + R.pick([-3, -2, -1, 1, 2, 3, 4]); if (x % t !== 0 && x > 0) bad.add(x); } return pq('tablas', 'mu' + t + ok, `¿Cuál de estos números es múltiplo de ${t}?`, String(ok), [...bad].map(String), `${ok} = ${t} × ${ok / t}, está en la tabla del ${t}`); }],
    [4, 6, g => { const n = R.pick([12, 18, 20, 24, 30, 36]), div = []; for (let d = 2; d < n; d++) if (n % d === 0) div.push(d); const ok = R.pick(div), bad = []; for (let d = 2; d < n && bad.length < 6; d++) if (n % d !== 0) bad.push(d); return pq('tablas', 'dv' + n + ok, `¿Cuál de estos números es divisor de ${n}?`, String(ok), R.shuffle(bad).slice(0, 3).map(String), `${n} ÷ ${ok} = ${n / ok} (división exacta)`); }],
    [3, 4, g => { const a = R.int(3, 9), b = R.int(3, 9); if (a === b) return null; return pq('tablas', 'cm' + a + b, `${a} × ${b} = ${b} × ${BLANK}`, String(a), numWrong(a, [a * b, b]).map(String), `En una multiplicación se pueden cambiar los factores de sitio: ${a} × ${b} = ${b} × ${a}`); }],
    [3, 3, g => { const a = R.int(2, 9), k = R.int(3, 6), s = Array(k).fill(a).join(' + '); return pq('tablas', 'rs' + a + k, `${s} = ${a} × ${BLANK}`, String(k), numWrong(k, [a, a * k]).map(String), `${a} se suma ${k} veces: ${a} × ${k} = ${a * k}`); }],
    [4, 6, g => { const x = g === 6 && R.chance(.5) ? R.int(11, 99) / 10 : R.int(2, 99), p = R.pick([10, 100, 1000]), ans = Math.round(x * p * 1000) / 1000; return pq('tablas', 'pt' + x + p, `${N(x)} × ${N(p)} = ?`, N(ans), uniq([ans * 10, ans / 10, x + p, ans + p]).filter(v => v !== ans && v > 0).map(N), `Multiplicar por ${N(p)}: ${p === 10 ? 'el número se hace 10 veces mayor' : p === 100 ? 'se desplaza 2 lugares' : 'se desplaza 3 lugares'}`); }],
    [4, 6, g => { const n = R.int(3, g === 4 ? 6 : 9), p = R.int(g === 4 ? 6 : 11, g === 4 ? 12 : 29), t = n * p, o = R.pick(['entradas', 'bocadillos', 'camisetas', 'cuadernos']); return pq('tablas', 'pr' + n + p, `Cada ${o.replace(/s$/, '')} cuesta ${p} €. ¿Cuánto cuestan ${n} ${o}?`, t + ' €', numWrong(t, [n + p, p * 10, t + p]).map(x => x + ' €'), `${n} × ${p} = ${t}`); }],
    [5, 6, g => { const n = R.int(3, 12), ans = n * n; return pq('tablas', 'cu' + n, `¿Cuál es el cuadrado de ${n}? (${n} × ${n})`, String(ans), numWrong(ans, [2 * n, n + n + 1]).map(String), `${n} × ${n} = ${ans}`); }],
    [3, 3, g => { const n = R.int(2, 9), k = R.pick([0, 1, 10]), ans = n * k, h = k === 0 ? 'Todo número multiplicado por 0 da 0' : k === 1 ? 'Multiplicar por 1 deja el número igual' : 'Multiplicar por 10 añade un 0'; return pq('tablas', 'sp' + n + k, `${n} × ${k} = ?`, String(ans), numWrong(ans, [n, n + k, n * 2]).map(String), h); }],
    [5, 6, g => { const a = R.int(21, 49), b = R.int(12, 29), ans = Math.round(a / 10) * 10 * Math.round(b / 10) * 10; if (a % 10 === 5 || b % 10 === 5) return null; return pq('tablas', 'ee' + a + b, `¿Cuál es una buena estimación de ${a} × ${b}?`, N(ans), uniq([ans / 10, ans * 10, ans / 2, ans + 500, Math.round(a / 10) * 10 + Math.round(b / 10) * 10]).filter(x => x !== ans && x > 0).map(N), `${a} ≈ ${Math.round(a / 10) * 10} y ${b} ≈ ${Math.round(b / 10) * 10}; ${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${N(ans)}`); }],
    [4, 6, g => { const a = R.int(3, 9), b = R.int(3, 9), p = a * b, dbl = R.chance(.6), ans = dbl ? a * 2 * b : p * 3; if (dbl) return pq('tablas', 'do' + a + b, `Sabes que ${a} × ${b} = ${p}. ¿Cuánto es ${2 * a} × ${b}?`, String(ans), numWrong(ans, [p, p + 2 * a]).map(String), `${2 * a} es el doble de ${a}, así que el resultado es el doble de ${p}: ${ans}`); return pq('tablas', 'tr' + a + b, `Sabes que ${a} × ${b} = ${p}. ¿Cuánto es ${a} × ${b * 3}?`, String(ans), numWrong(ans, [p * 2, p + 3]).map(String), `${b * 3} es el triple de ${b}, así que el resultado es el triple de ${p}: ${ans}`); }]
  ],
  divisiones: [
    [3, 6, g => { const b = R.int(3, 9), q = R.int(3, 9), r = R.int(1, b - 1), n = b * q + r; return pq('divisiones', 'rt' + n + b, `¿Cuál es el resto de ${n} ÷ ${b}?`, String(r), numWrong(r, [q, b]).map(String).filter(x => Number(x) < b || true), `${n} = ${b} × ${q} + ${r}`); }],
    [3, 4, g => { const b = R.int(2, 9), q = R.int(3, 9), n = b * q, W = R.pick([['dividendo', n], ['divisor', b], ['cociente', q]]), all = ['dividendo', 'divisor', 'cociente', 'resto']; return pq('divisiones', 'pn' + n + b + W[0], `En ${n} ÷ ${b} = ${q}, ¿cómo se llama el número ${W[1]}?`, W[0], all.filter(x => x !== W[0]), `${n} es el dividendo, ${b} el divisor y ${q} el cociente`); }],
    [3, 4, g => { const a = R.int(3, 9), b = R.int(3, 9), p = a * b, v = R.pick([a, b]), ans = p / v; return pq('divisiones', 'fm' + a + b + v, `Si ${a} × ${b} = ${p}, entonces ${p} ÷ ${v} = ?`, String(ans), numWrong(ans, [p, v]).map(String), `La división es la operación contraria: ${p} ÷ ${v} = ${ans}`); }],
    [4, 6, g => { const p = R.pick([10, 100]), x = g === 6 && R.chance(.5) ? R.int(11, 999) : R.int(2, 99) * p, ans = Math.round(x / p * 100) / 100; return pq('divisiones', 'dp' + x + p, `${N(x)} ÷ ${p} = ?`, N(ans), uniq([ans * 10, ans / 10, x - p, ans + 1]).filter(v => v !== ans && v > 0).map(N), `Dividir entre ${p} ${p === 10 ? 'mueve la coma un lugar a la izquierda' : 'mueve la coma dos lugares a la izquierda'}`); }],
    [3, 6, g => { const n = R.int(2, 6), tot = g <= 4 ? n * R.int(4, 15) : R.pick([25, 30, 45, 50, 75, 90]), q = tot / n; if (g >= 5 && !Number.isInteger(q * 4)) return null; if (g <= 4 && !Number.isInteger(q)) return null; return pq('divisiones', 're' + tot + n, `Se reparten ${tot} € entre ${n} amigos a partes iguales. ¿Cuánto toca a cada uno?`, D(q) + ' €', [q + 1, q - 1, q * 2, q + .5, tot - n].filter(x => x !== q && x > 0).map(x => D(x) + ' €'), `${tot} ÷ ${n} = ${D(q)}`); }],
    [4, 5, g => { const p = R.pick([20, 30, 40, 50]), v = R.int(3, 12), n = p * v; return pq('divisiones', 'vj' + n + p, `Un camión lleva ${N(n)} cajas y en cada viaje transporta ${p}. ¿Cuántos viajes hace?`, String(v), numWrong(v, [v * 10, n / 10 | 0]).map(String), `${N(n)} ÷ ${p} = ${v}`); }],
    [3, 6, g => { const b = R.int(3, 9), ex = R.int(3, 9) * b, bad = [], d0 = [R.int(3, 9), R.int(3, 9), R.int(3, 9)].map(x => x), mkBad = () => { const bb = R.int(3, 9), n = R.int(20, 80); return n % bb !== 0 ? `${n} ÷ ${bb}` : null; }; const wrong = new Set(); let tries = 0; while (wrong.size < 3 && tries++ < 50) { const w = mkBad(); if (w) wrong.add(w); } return pq('divisiones', 'ex' + ex + b, `¿Cuál de estas divisiones es EXACTA (sin resto)?`, `${ex} ÷ ${b}`, [...wrong], `${ex} ÷ ${b} = ${ex / b}, sin resto`, { big: true }); }],
    [4, 6, g => { const k = g === 4 ? R.pick([2, 5, 10]) : R.pick([2, 3, 5, 9, 10]), ok = k * R.int(g === 4 ? 12 : 20, g === 4 ? 60 : 99), bad = []; while (bad.length < 3) { const x = ok + R.pick([-3, -2, -1, 1, 2, 3, 4, 5]); if (x % k !== 0 && x > 0 && !bad.includes(x)) bad.push(x); } const h = k === 2 ? 'Los pares acaban en 0, 2, 4, 6 u 8' : k === 5 ? 'Acaba en 0 o en 5' : k === 10 ? 'Acaba en 0' : k === 3 ? `La suma de sus cifras es múltiplo de 3` : `La suma de sus cifras es múltiplo de 9`; return pq('divisiones', 'dt' + k + ok, `¿Cuál de estos números es divisible entre ${k}?`, String(ok), bad.map(String), `${ok} ÷ ${k} = ${ok / k}. ${h}`); }],
    [5, 6, g => { const b = R.pick([2, 4, 5, 3]), q = R.int(11, 59) / 10, n = Math.round(q * b * 10) / 10; if (n > 99) return null; return pq('divisiones', 'dc' + n + b, `${D(n)} ÷ ${b} = ?`, D(q), [q + .1, q - .1, q * 10, q + 1, q / 10].filter(x => x > 0 && x !== q).map(D), `${b} × ${D(q)} = ${D(n)}`); }],
    [3, 6, g => { const b = g === 3 ? R.int(2, 9) : R.int(3, 12), r = g === 3 ? R.int(2, 9) : R.int(5, 15), n = b * r; const lb = R.pick(['Pienso', 'He pensado', 'Tengo']); return pq('divisiones', 'in' + n + b, `Pienso un número, lo multiplico por ${b} y obtengo ${n}. ¿Qué número he pensado?`, String(r), numWrong(r, [n, b, n - b]).map(String), `Se hace al revés: ${n} ÷ ${b} = ${r}`); }]
  ]
};
const PLUS_P = .30;
function plusQ(cat, g) {
  const L = PLUS[cat]; if (!L) return null;
  const ok = L.filter(t => g >= t[0] && g <= t[1]); if (!ok.length) return null;
  return R.pick(ok)[2](g);
}

/* dificultad (d) que recorre cada curso: el curso bajo del ciclo es más fácil y el alto, más difícil */
const RANGE = { 1: [0, .5], 2: [.35, 1], 3: [0, .55], 4: [.3, 1], 5: [0, .6], 6: [.35, 1] };
const seen = new Set();
function generate(cat, cycle, d, grade) {
  d = Math.max(0, Math.min(1, d)); GRD = grade || cycle * 2;
  const easyP = cycle >= 2 ? (GRD % 2 === 0 ? .25 : .40) : 0;
  let last = null;
  for (let i = 0; i < 60; i++) {
    let q = null;
    try {
      const r0 = Math.random();
      if (cycle >= 2 && r0 < easyP) q = EASY[cat](cycle);
      else if (EXTRA[cat] && r0 < easyP + EXTRA_P) q = EXTRA[cat](cycle, d);
      else if (MORE[cat] && r0 < easyP + EXTRA_P + MORE_P) q = MORE[cat](GRD);
      else if (PLUS[cat] && r0 < easyP + EXTRA_P + MORE_P + PLUS_P) q = plusQ(cat, GRD);
      else q = null;
      if (!q) q = GEN[cat](cycle, d);
    } catch (e) { q = null; }
    if (!q) continue;
    last = q;
    if (!seen.has(q.key)) { seen.add(q.key); return q; }
  }
  return last || generate(cat, cycle, d + .01 > 1 ? 0 : d, grade);
}
G.Q = {
  generate, resetSeen: () => seen.clear(), range: g => RANGE[g].slice(), cycleOf: g => Math.ceil(g / 2), _MORE: MORE, _PLUS: PLUS, _plusQ: plusQ,
  cats: c => BYCYCLE[c].slice(),
  info: (cat, cycle) => { const o = Object.assign({}, INFO[cat]); if (cat === 'areas' && cycle === 1) { o.name = 'Cuadraditos'; o.boss = 'Gigante Cuadrícula'; } return o; },
  _R: R, _EASY: EASY, _EXTRA: EXTRA
};
})(typeof window !== 'undefined' ? window : globalThis);
