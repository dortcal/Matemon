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
  const w = 2 * R.int(2, 6), h = R.int(2, 7), v = svg('0 0 200 120', `<rect x="25" y="25" width="140" height="70" fill="#2de2ff" ${ST}/><line x1="25" y1="25" x2="165" y2="95" stroke="#fff" stroke-width="4" stroke-dasharray="8 6"/><text x="95" y="18" text-anchor="middle" class="dim">${w} cm</text><text x="172" y="64" class="dim">${h} cm</text>`, 'fig wide');
  return build({ cat: 'areas', text: 'El rectángulo se corta por la diagonal en dos triángulos iguales. ¿Qué área tiene cada triángulo?', visual: v, correct: `${w * h / 2} cm²`, wrong: [w * h, w + h, w * h / 2 + 2, w * h / 2 - 2, 2 * (w + h)].filter(x => x > 0 && x !== w * h / 2).map(x => x + ' cm²'), hint: `Área del rectángulo: ${w} × ${h} = ${w * h} cm²; cada triángulo es la mitad: ${w * h / 2} cm²`, key: 'x|hr' + w + h });
}
function barC1Q() {
  const cats = R.shuffle(FRUITS).slice(0, 4), vals = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4), v = barSvg(cats, vals, 1, 8), i = R.int(0, 3);
  if (R.chance(.5)) return build({ cat: 'datos', text: `¿Cuántas unidades tiene ${cats[i][0] === 'uva' ? 'la' : 'el'} ${cats[i][0]}?`.replace('el papaya', 'la papaya').replace('el piña', 'la piña'), visual: v, correct: String(vals[i]), wrong: numWrong(vals[i]), hint: `Mira hasta dónde llega la barra: ${vals[i]}`, key: 'x|b1v' + vals + i + cats.map(x => x[0]) });
  const bi = vals.indexOf(Math.max(...vals)); return build({ cat: 'datos', text: '¿Qué barra es la MÁS alta?', visual: v, correct: cats[bi][0], wrong: cats.filter((_, k) => k !== bi).map(x => x[0]), hint: `La más alta es ${cats[bi][0]}`, key: 'x|b1m' + vals + cats.map(x => x[0]) });
}
const gcd2 = (a, b) => b ? gcd2(b, a % b) : a;
const EXTRA = {
  sumres(c) {
    if (c === 1) { const half = R.chance(.5), n = R.int(1, 10) * 10, ans = half ? n / 2 : n * (n > 50 ? 1 : 2) / (n > 50 ? 1 : 1); if (half) return build({ cat: 'sumres', text: `¿Cuál es la mitad de ${n}?`, correct: String(n / 2), wrong: numWrong(n / 2, [n * 2]), hint: `${n / 2} + ${n / 2} = ${n}, así que la mitad de ${n} es ${n / 2}`, key: 'x|mi' + n }); const m = R.int(1, 5) * 10; return build({ cat: 'sumres', text: `¿Cuál es el doble de ${m}?`, correct: String(m * 2), wrong: numWrong(m * 2, [m + 2, m / 2]), hint: `${m} + ${m} = ${m * 2}`, key: 'x|do' + m }); }
    if (c === 2) {
      const k = R.pick(['dec', 'dec', 'cent', 'chg']);
      if (k === 'dec') { const a = R.int(11, 99) / 10, b = R.int(11, 99) / 10, sub = R.chance(.5), x = sub ? Math.max(a, b) : a, y = sub ? Math.min(a, b) : b; if (x === y) return null; const ans = Math.round((sub ? x - y : x + y) * 10) / 10; return build({ cat: 'sumres', text: `${D(x)} ${sub ? '−' : '+'} ${D(y)} = ?`, correct: D(ans), wrong: [ans + .1, ans - .1, ans + 1, ans - 1, ans + 10].filter(v => v > 0 && v !== ans).map(D), hint: `Alinea las comas: ${D(x)} ${sub ? '−' : '+'} ${D(y)} = ${D(ans)}`, key: 'x|dc' + x + y + sub }); }
      if (k === 'cent') { const a = R.int(1, 8) + R.pick([.5, .25, .75, .2, .3]), b = R.int(1, 5) + R.pick([.5, .25, .1, .3]), t = a + b; return build({ cat: 'sumres', text: `Un bocadillo cuesta ${EU(a)} y un zumo ${EU(b)}. ¿Cuánto cuestan los dos?`, correct: EU(t), wrong: [t + .5, t - .5, t + 1, t - 1, t + .1, t - .1].filter(v => v > 0).map(EU), hint: `${EU(a)} + ${EU(b)} = ${EU(t)}`, key: 'x|ce' + a + b }); }
      const price = R.int(1, 9) + R.pick([.5, .25, .8, .2]), pay = Math.ceil(price) + R.pick([1, 5]), ch = pay - price; return build({ cat: 'sumres', text: `Un helado cuesta ${EU(price)}. Pagas con ${pay} €. ¿Cuánto te devuelven?`, correct: EU(ch), wrong: [ch + .5, ch - .5, ch + 1, ch - 1, price, ch + .1].filter(v => v > 0 && v !== ch).map(EU), hint: `${pay} − ${D(price)} = ${D(ch)} €`, key: 'x|ch' + price + pay });
    }
    const k = R.pick(['neg', 'neg', 'half', 'q', 'sale', 'sale']);
    if (k === 'neg') { const t = R.int(-9, -1), up = R.int(2, 15), ans = t + up, tem = R.chance(.6); return build({ cat: 'sumres', text: tem ? `A las 7:00 hacía ${Z(t)} °C y la temperatura subió ${up} grados. ¿Qué temperatura hay ahora?` : `Estás en la planta ${Z(t)} del aparcamiento y subes ${up} plantas. ¿En qué planta estás?`, correct: tem ? Z(ans) + ' °C' : 'planta ' + Z(ans), wrong: [ans + 1, ans - 1, ans + 2, ans - 2, -ans, t - up].filter(v => v !== ans).map(v => tem ? Z(v) + ' °C' : 'planta ' + Z(v)), hint: `Parte de ${Z(t)} y avanza ${up} en la recta numérica: ${Z(ans)}`, key: 'x|ng' + t + up + tem }); }
    if (k === 'half') { const m = R.pick([2, 4, 5]), n = R.int(2, 20) * 4, mulz = R.pick([[.5, 2, 'la mitad'], [.25, 4, 'la cuarta parte']]), ans = n * mulz[0]; return build({ cat: 'sumres', text: `${n} × ${D(mulz[0])} = ?`, correct: D(ans), wrong: [n * 2, n * 4, n / 10, ans + 1, ans - 1].filter(x => x !== ans && x > 0).map(D), hint: `Multiplicar por ${D(mulz[0])} es calcular ${mulz[2]}: ${n} ÷ ${mulz[1]} = ${D(ans)}`, key: 'x|hm' + n + mulz[0] }); }
    if (k === 'q') { const n = R.int(5, 40), ans = n * 2; return build({ cat: 'sumres', text: `${n} ÷ 0,5 = ?`, correct: String(ans), wrong: [n / 2, n * 5, n + 2, ans + 10, ans - 10].filter(x => x > 0 && x !== ans).map(D), hint: `Dividir entre 0,5 es lo mismo que multiplicar por 2: ${n} × 2 = ${ans}`, key: 'x|dq' + n }); }
    const p = R.pick([[10, .1], [20, .2], [25, .25], [50, .5]]), price = R.pick([20, 40, 60, 80, 100, 120]), save = price * p[1]; return build({ cat: 'sumres', text: `Una camiseta de ${price} € tiene un ${p[0]} % de descuento. ¿Cuánto cuesta ahora?`, correct: D(price - save) + ' €', wrong: [price + save, save, price - save + 5, price - save - 5, price - 2 * save].filter(x => x > 0 && x !== price - save).map(x => D(x) + ' €'), hint: `El ${p[0]} % de ${price} es ${D(save)} €; ${price} − ${D(save)} = ${D(price - save)} €`, key: 'x|sl' + price + p[0] });
  },
  tablas(c) {
    if (c === 2) { if (R.chance(.55)) { const a = R.int(2, 99), t = R.pick([10, 100]); return build({ cat: 'tablas', text: `${a} × ${t} = ?`, correct: N(a * t), wrong: [a * t * 10, a * t / 10, a * t + a, a + t].map(N), hint: `Por ${t}: añade ${t === 10 ? 'un cero' : 'dos ceros'} → ${N(a * t)}`, key: 'x|t10' + a + t }); }
      const m = R.pick([3, 4, 5, 6, 7, 8, 9]), good = m * R.int(2, 9), bad = new Set(); while (bad.size < 3) { const x = R.int(10, 70); if (x % m) bad.add(x); }
      return build({ cat: 'tablas', text: `¿Cuál de estos números es múltiplo de ${m}?`, correct: String(good), wrong: [...bad].map(String), hint: `Los múltiplos de ${m} salen en su tabla: ${m}, ${2 * m}, ${3 * m}, ${4 * m}… → ${good} = ${m} × ${good / m}`, key: 'x|mu' + m + good + [...bad] }); }
    const k = R.pick(['pow', 'pow', 'mcm', 'mcd', 'prime', 'prop', 'prop']);
    if (k === 'pow') { const b = R.int(2, 10), e = b <= 5 ? R.pick([2, 3]) : 2, p = b ** e; return build({ cat: 'tablas', text: `${b}<sup>${e}</sup> = ?`, correct: N(p), wrong: [b * e, p + b, p - b, b ** (e + 1), (b + 1) ** e].filter(x => x !== p).map(N), hint: `${b}<sup>${e}</sup> = ${Array(e).fill(b).join(' × ')} = ${N(p)}`, key: 'x|pw' + b + e }); }
    if (k === 'mcm') { const a = R.pick([2, 3, 4, 5, 6]), b = R.pick([3, 4, 5, 6, 8, 9].filter(x => x !== a)), l = a * b / gcd2(a, b); return build({ cat: 'tablas', text: `¿Cuál es el mínimo común múltiplo de ${a} y ${b}?`, correct: String(l), wrong: [a * b, l + a, l - 1, l * 2, a + b].filter(x => x !== l && x > 0).map(String), hint: `Múltiplos de ${a}: ${[1, 2, 3, 4, 5, 6].map(i => a * i).join(', ')}… y de ${b}: ${[1, 2, 3, 4, 5, 6].map(i => b * i).join(', ')}… El primero común es ${l}`, key: 'x|mc' + a + b }); }
    if (k === 'mcd') { const g = R.pick([2, 3, 4, 5, 6]), a = g * R.pick([2, 3, 4]), b = g * R.pick([5, 6, 7].filter(x => x * g !== a)), d = gcd2(a, b); return build({ cat: 'tablas', text: `¿Cuál es el máximo común divisor de ${a} y ${b}?`, correct: String(d), wrong: [1, 2, d * 2, d + 1, d - 1, a - b > 0 ? a - b : b - a].filter(x => x !== d && x > 0).map(String), hint: `El mayor número que divide a los dos es ${d}`, key: 'x|md' + a + b }); }
    if (k === 'prime') { const P = [11, 13, 17, 19, 23, 29, 31, 37], C = [15, 21, 25, 27, 33, 35, 39, 49, 51, 57], p = R.pick(P), others = R.shuffle(C).slice(0, 3); return build({ cat: 'tablas', text: '¿Cuál de estos números es PRIMO?', correct: String(p), wrong: others.map(String), hint: `${p} solo se puede dividir entre 1 y entre sí mismo. Los otros tienen más divisores`, key: 'x|pr' + p + others }); }
    const u = R.int(2, 9), cost = R.int(2, 8) * u / u * 2, n1 = R.int(2, 5), n2 = n1 + R.int(2, 5), price = R.int(2, 9) * 0 + R.int(2, 6), tot1 = price * n1, ans = price * n2; return build({ cat: 'tablas', text: `${n1} cuadernos cuestan ${tot1} €. ¿Cuánto cuestan ${n2} cuadernos al mismo precio?`, correct: ans + ' €', wrong: [tot1 + n2, ans + price, ans - price, tot1 * 2, n2].filter(x => x !== ans && x > 0).map(x => x + ' €'), hint: `Un cuaderno: ${tot1} ÷ ${n1} = ${price} €; ${n2} cuadernos: ${n2} × ${price} = ${ans} €`, key: 'x|pp' + n1 + n2 + price });
  },
  fracciones(c) {
    if (c === 2) {
      const k = R.pick(['add', 'sub', 'pct', 'pct']);
      if (k === 'pct') { const p = R.pick([[50, 2, '1/2'], [25, 4, '1/4'], [75, 4, '3/4']]), u = R.int(2, 12), tot = 4 * u, ans = tot * p[0] / 100; return build({ cat: 'fracciones', text: `¿Cuánto es el ${p[0]} % de ${tot}?`, correct: String(ans), wrong: numWrong(ans, [tot - ans, tot / 2]).filter(x => x !== String(ans)), hint: `${p[0]} % es ${p[0] === 50 ? 'la mitad' : p[0] === 25 ? 'la mitad de la mitad' : 'el 100 % menos el 25 %'}: ${ans}`, key: 'x|p2' + p[0] + tot }); }
      const n = R.pick([4, 5, 6, 8, 10, 12]); let a = R.int(1, n - 2), b = R.int(1, n - a - 1 || 1); if (k === 'sub') { a = R.int(2, n - 1); b = R.int(1, a - 1); } const r = k === 'add' ? a + b : a - b;
      return build({ cat: 'fracciones', text: `${F(a, n)} ${k === 'add' ? '+' : '−'} ${F(b, n)} = ?`, correct: F(r, n), wrong: [F(r, n * 2), F(r + 1, n), F(r > 1 ? r - 1 : r + 2, n), F(a + b, n + n)], hint: `Mismo denominador: ${k === 'add' ? 'suma' : 'resta'} los numeradores: ${a} ${k === 'add' ? '+' : '−'} ${b} = ${r}`, big: true, key: 'x|f2' + k + a + b + n });
    }
    const k = R.pick(['imp', 'imp', 'diff', 'diff', 'mixed']);
    if (k === 'imp') { const d = R.pick([3, 4, 5, 6, 8]), good = [d + R.int(1, d), d], bad = [[R.int(1, d - 1), d], [R.int(1, d - 1), d + 1], [R.int(1, d - 2) || 1, d + 2]]; return build({ cat: 'fracciones', text: '¿Cuál de estas es una fracción IMPROPIA (mayor que 1)?', correct: F(...good), wrong: bad.map(x => F(...x)), hint: `Una fracción impropia tiene el numerador mayor que el denominador: ${good[0]}/${good[1]}`, big: true, key: 'x|im' + good + bad }); }
    if (k === 'mixed') { const d = R.pick([2, 3, 4, 5]), w = R.int(1, 3), r = R.int(1, d - 1), num = w * d + r; return build({ cat: 'fracciones', text: `Escribe ${F(num, d)} como número mixto`, correct: `${w} y ${r}/${d}`, wrong: [`${w + 1} y ${r}/${d}`, `${w} y ${d - r}/${d}`, `${w - 1 || 2} y ${r}/${d}`, `${r} y ${w}/${d}`], hint: `${num} ÷ ${d} = ${w} y sobran ${r}: ${w} enteros y ${r}/${d}`, key: 'x|mx' + num + d }); }
    const b = R.pick([2, 3, 4, 5]), m = R.pick([2, 3, 4]), d = b * m, a = R.int(1, b - 1), cc = R.int(1, d - 1), eq = a * m, r = eq + cc;
    return build({ cat: 'fracciones', text: `${F(a, b)} + ${F(cc, d)} = ?`, correct: F(r, d), wrong: [F(a + cc, b + d), F(r, b), F(r + 1, d), F(a + cc, d)], hint: `Pasa ${a}/${b} a denominador ${d}: ${a}/${b} = ${eq}/${d}; ${eq}/${d} + ${cc}/${d} = ${r}/${d}`, big: true, key: 'x|fd' + a + b + cc + d });
  },
  comparar(c) {
    if (c === 3) { const set = new Set(); while (set.size < 4) set.add(R.int(-9, 9)); const arr = [...set], isMax = R.chance(.5), ans = isMax ? Math.max(...arr) : Math.min(...arr); return build({ cat: 'comparar', text: `¿Cuál es el número ${isMax ? 'MAYOR' : 'MENOR'}?`, correct: Z(ans), wrong: arr.filter(x => x !== ans).map(Z), hint: 'En los números negativos, cuanto más lejos del cero, menor es: −8 < −2 < 0 < 5', key: 'x|cn' + arr.sort() + isMax }); }
    const a = R.int(10, 99), b = R.int(10, 99); if (a === b) return null; return build({ cat: 'comparar', text: `${a} ${BLANK} ${b}`, correct: a > b ? '>' : '<', wrong: ['<', '>', '='].filter(x => x !== (a > b ? '>' : '<')), n: 3, order: ['<', '=', '>'], big: true, hint: `${a} ${a > b ? '>' : '<'} ${b}`, key: 'x|cs' + a + b });
  },
  medida(c) {
    if (c === 1) { const k = R.pick(['est', 'est', 'week']); if (k === 'est') { const e = R.pick(EST.filter(x => ['m', 'cm', 'kg', 'g', 'l', 'min'].includes(x[1]))); const fam = { m: ['cm', 'kg', 'l'], cm: ['m', 'kg', 'g'], kg: ['g', 'm', 'l'], g: ['kg', 'cm', 'l'], l: ['kg', 'm', 'cm'], min: ['m', 'kg', 'l'] }; return build({ cat: 'medida', text: `¿En qué unidad medirías ${e[0]}?`, correct: e[1], wrong: fam[e[1]], hint: `Para ${e[0]} lo más cómodo es ${e[1]}`, key: 'x|e1' + e[0] }); } const Q1 = R.pick([['¿Cuántos días tiene una semana?', 7], ['¿Cuántos meses tiene un año?', 12], ['¿Cuántas horas tiene un día?', 24], ['¿Cuántos minutos tiene una hora?', 60]]); return build({ cat: 'medida', text: Q1[0], correct: String(Q1[1]), wrong: numWrong(Q1[1], [Q1[1] + 2, Q1[1] * 2]), hint: `${Q1[0].replace('¿', '').replace('?', '')}: ${Q1[1]}`, key: 'x|wk' + Q1[1] }); }
    if (c === 2) {
      const k = R.pick(['digital', 'sec', 'tool', 'tool', 'unit2']);
      if (k === 'digital') { const h = R.int(1, 12), m = R.pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]); return build({ cat: 'medida', text: '¿Qué hora marca el reloj? (escríbela como un reloj digital)', visual: clockSvg(h, m), correct: digital(h, m), wrong: [digital(h, (m + 15) % 60), digital(h % 12 + 1, m), digital(((h + 10) % 12) + 1, m), digital(h, (m + 30) % 60)], hint: `La aguja corta señala el ${h} y la larga ${m} minutos: ${digital(h, m)}`, key: 'x|dg' + h + m }); }
      if (k === 'sec') { const n = R.int(1, 5); return build({ cat: 'medida', text: `${n} min = ${BLANK} s`, correct: String(n * 60), wrong: [n * 100, n * 10, n * 60 + 60, n * 30, n * 24].filter(x => x !== n * 60).map(String), hint: `1 minuto = 60 segundos: ${n} × 60 = ${n * 60}`, key: 'x|sc' + n }); }
      if (k === 'tool') { const T = R.pick([['la longitud de tu mesa', 'una regla o una cinta métrica'], ['lo que pesa una sandía', 'una balanza'], ['el agua de una jarra', 'un recipiente graduado'], ['lo que dura un recreo', 'un reloj'], ['la altura de una puerta', 'una cinta métrica']]), all = ['una regla o una cinta métrica', 'una balanza', 'un recipiente graduado', 'un reloj']; return build({ cat: 'medida', text: `¿Qué instrumento usarías para medir ${T[0]}?`, correct: T[1] === 'una cinta métrica' ? 'una regla o una cinta métrica' : T[1], wrong: all.filter(x => x !== (T[1] === 'una cinta métrica' ? 'una regla o una cinta métrica' : T[1])), hint: `Para medir ${T[0]} se usa ${T[1]}`, key: 'x|to' + T[0] }); }
      { const U2 = R.pick([['la superficie del suelo de un aula', 'm²', ['m', 'cm', 'l']], ['la superficie de un sello de correos', 'cm²', ['m', 'cm', 'km']], ['la superficie de un campo de fútbol', 'm²', ['m', 'cm²', 'kg']]]); return build({ cat: 'medida', text: `¿Con qué unidad medirías ${U2[0]}?`, correct: U2[1], wrong: U2[2], hint: `La superficie se mide en unidades cuadradas: ${U2[1]}`, key: 'x|u2' + U2[0] }); }
    }
    const k = R.pick(['cl', 'dm2', 'time', 'perim', 'cm3']);
    if (k === 'cl') { const n = R.pick([1, 2, 3, 5]), u = R.pick([['l', 'cl', 100], ['l', 'dl', 10], ['dl', 'cl', 10]]); return build({ cat: 'medida', text: `${n} ${u[0]} = ${BLANK} ${u[1]}`, correct: String(n * u[2]), wrong: [n * u[2] * 10, n * u[2] / 10 || 1, n * 1000, n + u[2]].filter(x => x !== n * u[2]).map(String), hint: `1 ${u[0]} = ${u[2]} ${u[1]}`, key: 'x|cl' + n + u }); }
    if (k === 'dm2') { const n = R.pick([2, 3, 5, 7]), u = R.pick([['dm²', 'cm²', 100], ['m²', 'dm²', 100]]); return build({ cat: 'medida', text: `${n} ${u[0]} = ${BLANK} ${u[1]}`, correct: String(n * 100), wrong: [n * 10, n * 1000, n * 100 + 100, n * 10000].map(String), hint: `1 ${u[0]} = 100 ${u[1]}`, key: 'x|d2' + n + u }); }
    if (k === 'time') { const t = R.pick([['siglos', 100], ['décadas', 10], ['milenios', 1000]]), n = R.int(2, 6); return build({ cat: 'medida', text: `¿Cuántos años hay en ${n} ${t[0]}?`, correct: N(n * t[1]), wrong: [n * 10, n * 100, n * 1000, n * 12, n * 365].filter(x => x !== n * t[1]).map(N), hint: `1 ${t[0].slice(0, -1).replace('milenio', 'milenio')} = ${N(t[1])} años: ${n} × ${t[1]} = ${N(n * t[1])}`, key: 'x|ti' + t[0] + n }); }
    if (k === 'cm3') { const n = R.pick([1, 2, 3, 5]); return build({ cat: 'medida', text: `${n} dm³ = ${BLANK} cm³`, correct: N(n * 1000), wrong: [n * 100, n * 10, n * 10000].map(N), hint: `1 dm³ = 1 000 cm³ (un cubo de 10 cm de arista)`, key: 'x|c3' + n }); }
    const a = R.pick([[3, 5, 2, 6], [4, 4, 2, 6], [3, 7, 4, 6], [1, 9, 5, 5]]), A1 = a[0] * a[1], A2 = a[2] * a[3]; if (A1 === A2) return null; return build({ cat: 'medida', text: `Un rectángulo mide ${a[0]} × ${a[1]} cm y otro ${a[2]} × ${a[3]} cm. ¿Cuál tiene MÁS área?`, correct: A1 > A2 ? `El de ${a[0]} × ${a[1]}` : `El de ${a[2]} × ${a[3]}`, wrong: [A1 > A2 ? `El de ${a[2]} × ${a[3]}` : `El de ${a[0]} × ${a[1]}`], n: 2, min: 2, hint: `${a[0]} × ${a[1]} = ${A1} cm² y ${a[2]} × ${a[3]} = ${A2} cm²`, key: 'x|pa' + a });
  },
  geometria(c) {
    if (c === 1) return R.chance(.5) ? relQ() : sym1Q();
    if (c === 2) { const k = R.pick(['ang', 'ang', 'lines', 'lines', 'poly']); if (k === 'ang') return angle2Q(); if (k === 'lines') return linesQ(); const n = R.int(7, 10); return build({ cat: 'geometria', text: '¿Cómo se llama este polígono?', visual: polyFig(n), correct: POLYNAMES[n], wrong: [5, 6, 7, 8, 9, 10].filter(x => x !== n).map(x => POLYNAMES[x]), hint: `${n} lados → ${POLYNAMES[n]}`, key: 'x|p2' + n + Math.random() }); }
    const k = R.pick(['card', 'card', 'circ', 'circ2']);
    if (k === 'card') { const s = R.int(0, 3), q = R.pick([[1, 'a la derecha', 90], [3, 'a la izquierda', 90], [2, 'media vuelta (180°)', 180]]), ans = q[2] === 180 ? DIRC[(s + 2) % 4] : DIRC[(s + q[0]) % 4]; return build({ cat: 'geometria', text: q[2] === 180 ? `Miras al ${DIRC[s]} y das ${q[1]}. ¿Hacia qué punto cardinal miras?` : `Miras al ${DIRC[s]} y giras 90° ${q[1]}. ¿Hacia qué punto cardinal miras?`, correct: ans, wrong: DIRC.filter(x => x !== ans), hint: q[2] === 180 ? 'Media vuelta: pasas al punto cardinal opuesto' : (q[0] === 1 ? 'Girar a la derecha sigue el orden norte → este → sur → oeste' : 'Girar a la izquierda va al revés: norte → oeste → sur → este'), key: 'x|cd' + s + q[1] }); }
    const d = R.int(2, 20); if (k === 'circ') return build({ cat: 'geometria', text: `Un círculo tiene un diámetro de ${d} cm. ¿Cuánto mide su circunferencia? (π ≈ 3,14)`, correct: D(Math.round(3.14 * d * 100) / 100) + ' cm', wrong: [d * 2, d * 3, d * 4, d + 3.14, d * 3.14 * 2].map(x => D(Math.round(x * 100) / 100) + ' cm').filter(x => x !== D(Math.round(3.14 * d * 100) / 100) + ' cm'), hint: `Circunferencia = π × diámetro ≈ 3,14 × ${d} = ${D(Math.round(3.14 * d * 100) / 100)} cm`, key: 'x|ci' + d });
    return build({ cat: 'geometria', text: `Una circunferencia mide aproximadamente ${D(Math.round(3.14 * d * 100) / 100)} cm. ¿Cuánto mide su diámetro? (π ≈ 3,14)`, correct: d + ' cm', wrong: [d * 2, d + 3, Math.round(d * 3.14), d / 2 | 0 || 1, d * 10].filter(x => x !== d).map(x => x + ' cm'), hint: `Diámetro = circunferencia ÷ 3,14 = ${d} cm`, key: 'x|c2' + d });
  },
  areas(c) { if (c === 2) return halfRectQ(); const l = R.pick([10, 12, 14, 16, 20]), pa = R.pick([3, 4, 5]); return null; },
  datos(c) {
    if (c === 1) return barC1Q();
    const var1 = R.chance(.35);
    if (var1) { const V = R.pick([['el color favorito', 'cualitativa'], ['la fruta que más te gusta', 'cualitativa'], ['el número de hermanos', 'cuantitativa'], ['la altura de una persona', 'cuantitativa'], ['el deporte favorito', 'cualitativa'], ['los puntos de un partido', 'cuantitativa']]); return build({ cat: 'datos', text: `En una encuesta se pregunta por ${V[0]}. ¿Qué tipo de variable es?`, correct: V[1], wrong: [V[1] === 'cualitativa' ? 'cuantitativa' : 'cualitativa'], n: 2, min: 2, hint: 'Cualitativa: se responde con una cualidad (palabra). Cuantitativa: se responde con un número', key: 'x|va' + V[0] }); }
    if (c === 2) { const k = R.pick(['media', 'cmp']); if (k === 'media') { const n = 4, mean = R.int(2, 9), arr = []; let sum = mean * n; for (let i = 0; i < n - 1; i++) { const x = Math.max(1, mean + R.int(-2, 2)); arr.push(x); sum -= x; } if (sum < 1) return null; arr.push(sum); const sh = R.shuffle(arr); return build({ cat: 'datos', text: `Calcula la MEDIA de: ${sh.join(', ')}`, correct: String(mean), wrong: numWrong(mean, [Math.max(...arr), mean * n]), hint: `Suma: ${sh.join(' + ')} = ${mean * n}; ${mean * n} ÷ ${n} = ${mean}`, key: 'x|m2' + sh }); }
      const cols = R.shuffle(BALLS).slice(0, 2), cnt = [R.int(1, 4), R.int(5, 9)], sw = R.chance(.5), arr = sw ? [cnt[1], cnt[0]] : cnt, best = arr[0] > arr[1] ? 0 : 1; return build({ cat: 'datos', text: 'Sacas una bola sin mirar. ¿De qué color es más PROBABLE que salga?', visual: bagSvg(arr, cols), correct: cols[best][0], wrong: [cols[1 - best][0]], n: 2, min: 2, hint: `Hay ${arr[0]} bolas ${cols[0][0]}s y ${arr[1]} ${cols[1][0]}s: es más probable la que tiene más bolas`, key: 'x|cp' + arr + cols.map(x => x[0]) }); }
    const k = R.pick(['med', 'rng', 'pct']);
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
const EASY_P = 0.30, EXTRA_P = 0.30;
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

const seen = new Set();
function generate(cat, cycle, d) {
  d = Math.max(0, Math.min(1, d));
  let last = null;
  for (let i = 0; i < 60; i++) {
    let q = null;
    try {
      const r0 = Math.random();
      if (cycle >= 2 && r0 < EASY_P) q = EASY[cat](cycle);
      else if (EXTRA[cat] && r0 < (cycle >= 2 ? EASY_P : 0) + EXTRA_P) q = EXTRA[cat](cycle, d);
      else q = null;
      if (!q) q = GEN[cat](cycle, d);
    } catch (e) { q = null; }
    if (!q) continue;
    last = q;
    if (!seen.has(q.key)) { seen.add(q.key); return q; }
  }
  return last || generate(cat, cycle, d + .01 > 1 ? 0 : d);
}
G.Q = {
  generate, resetSeen: () => seen.clear(),
  cats: c => BYCYCLE[c].slice(),
  info: (cat, cycle) => { const o = Object.assign({}, INFO[cat]); if (cat === 'areas' && cycle === 1) { o.name = 'Cuadraditos'; o.boss = 'Gigante Cuadrícula'; } return o; },
  _R: R, _EASY: EASY, _EXTRA: EXTRA
};
})(typeof window !== 'undefined' ? window : globalThis);
