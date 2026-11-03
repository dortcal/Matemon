/* MateMonstruos · lógica de juego y pantallas */
(function () {
'use strict';
const Q = window.Q, C = window.Creature, AU = window.MMAudio, FX = window.FX;
const app = document.getElementById('screen');
const sfx = n => AU.sfx(n);
const R = Q._R;
const strip = h => String(h).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const sleepRaw = ms => new Promise(r => setTimeout(r, ms));

/* ---------- datos ---------- */
const LEVELS = {
  1: { name: 'Cría Chispa', grades: '1.º y 2.º de Primaria', desc: 'Sumas y restas, secuencias, mayor y menor, formas y cuadraditos', color: '#b6ff3b', el: 'planta' },
  2: { name: 'Domador Rayo', grades: '3.º y 4.º de Primaria', desc: 'Tablas, divisiones, fracciones sencillas, geometría y áreas', color: '#2de2ff', el: 'agua' },
  3: { name: 'Maestro Volcán', grades: '5.º y 6.º de Primaria', desc: 'Decimales, fracciones, ángulos, áreas de triángulos y más', color: '#ff3d9a', el: 'fuego' }
};
const WORLDS = {
  teide: { name: 'Volcán Teide', els: ['fuego', 'tierra', 'rayo'], color: '#ff7a3d', desc: 'Lava, rocas y chispas' },
  atlantico: { name: 'Abismo Atlántico', els: ['agua', 'rayo', 'planta'], color: '#2de2ff', desc: 'Mareas, burbujas y corales' },
  laurisilva: { name: 'Laurisilva Mágica', els: ['planta', 'tierra', 'agua'], color: '#b6ff3b', desc: 'Niebla, hojas y luciérnagas' },
  cosmos: { name: 'Cielo del Teide', els: ['cosmos', 'rayo', 'fuego'], color: '#9b6bff', desc: 'Estrellas, planetas y cometas' }
};
const ICON = {
  sumres: '<path d="M8 14h16M16 6v16M24 38h16"/>',
  tablas: '<path d="M12 12l24 24M36 12L12 36"/>',
  divisiones: '<path d="M8 24h32"/><circle cx="24" cy="11" r="3.5" fill="currentColor"/><circle cx="24" cy="37" r="3.5" fill="currentColor"/>',
  secuencias: '<circle cx="9" cy="36" r="3" fill="currentColor"/><circle cx="22" cy="26" r="3" fill="currentColor"/><circle cx="35" cy="16" r="3" fill="currentColor"/><path d="M10 10h28M32 5l6 5-6 5"/>',
  fracciones: '<circle cx="24" cy="24" r="16"/><path d="M24 24V8M24 24l13 9" /><path d="M24 24l-13 9" />',
  comparar: '<path d="M20 10L7 24l13 14M28 10l13 14-13 14"/>',
  geometria: '<path d="M6 40L20 10l14 30zM30 8h12v12H30z"/>',
  medida: '<circle cx="24" cy="24" r="16"/><path d="M24 12v12l8 5"/>',
  datos: '<path d="M8 8v32h34"/><path d="M16 32v-8M26 32V14M36 32v-14"/>',
  areas: '<path d="M8 8h32v32H8zM8 19h32M8 29h32M19 8v32M29 8v32"/><path d="M19 19h10v10H19z" fill="currentColor"/>'
};
const catIcon = c => `<svg viewBox="0 0 48 48" aria-hidden="true">${ICON[c]}</svg>`;
const STAR = '<svg viewBox="0 0 40 40" aria-hidden="true"><polygon points="20,2 25,14 38,15 28,24 31,37 20,30 9,37 12,24 2,15 15,14" fill="#ffd23f" stroke="#1b1140" stroke-width="3" stroke-linejoin="round"/></svg>';
const STAR_OFF = STAR.replace('<svg', '<svg class="off"');
const HEART = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 35C4 24 4 9 13 8c4 0 6 3 7 5 1-2 3-5 7-5 9 1 9 16-7 27z" fill="#ff3d6a" stroke="#1b1140" stroke-width="3" stroke-linejoin="round"/><ellipse cx="13" cy="14" rx="3" ry="2" fill="#fff" opacity=".7"/></svg>';
const ARROW = d => `<svg class="a" viewBox="0 0 24 24" style="transform:rotate(${{ up: 0, right: 90, down: 180, left: 270 }[d]}deg)" aria-hidden="true"><path d="M12 3L22 19H2z"/></svg>`;
const I = {
  mute: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M15 9c2 1.5 2 4.500 0 6M17.500 6.500c3.500 3 3.500 8 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  muteOff: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9z"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4.500" height="16" rx="1"/><rect x="13.500" y="4" width="4.500" height="16" rx="1"/></svg>',
  full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
};

/* ---------- guardado ---------- */
let SAVE = { best: {}, dex: [], last: {} };
try { const j = localStorage.getItem('mm_save'); if (j) SAVE = Object.assign(SAVE, JSON.parse(j)); } catch (e) {}
function save() { try { localStorage.setItem('mm_save', JSON.stringify(SAVE)); } catch (e) {} }

/* ---------- estado ---------- */
const P = { cycle: SAVE.last.cycle || 2, world: SAVE.last.world || 'teide', cr: null };
let UI = { screen: '', back: null }, S = null, tok = 0;
const CANCEL = { cancelled: true };
async function sleep(ms) {
  const my = tok; let t = 0;
  while (t < ms) { await sleepRaw(40); if (my !== tok) throw CANCEL; if (!S || !S.paused) t += 40; }
}
const live = txt => { const l = document.getElementById('sr'); if (l) { l.textContent = ''; setTimeout(() => l.textContent = txt, 30); } };

/* ---------- pantallas ---------- */
function show(name, html, opt) {
  opt = opt || {};
  UI.screen = name; UI.back = opt.back || null;
  app.innerHTML = `<div class="screen" data-screen="${name}">${html}</div>`;
  const b = app.querySelector('[data-first]') || app.querySelector('[data-nav]');
  if (b && !opt.noFocus) b.focus({ preventScroll: true });
  if (opt.backBtn) {
    const bb = document.createElement('button'); bb.className = 'ib'; bb.setAttribute('aria-label', 'Volver'); bb.dataset.act = 'back'; bb.dataset.nav = ''; bb.innerHTML = I.back;
    bb.style.cssText = 'position:absolute;top:.5rem;left:.6rem;z-index:20'; app.appendChild(bb);
  }
}
function pet(cr, o) { return `<div class="pet">${C.svg(cr, o)}</div>`; }
function mkCr(c) { return C.make(c.seed != null ? c.seed : c.s, [c.element || c.e]); }

function titleScreen() {
  FX.setWorld(P.world);
  const els = ['fuego', 'agua', 'planta', 'cosmos', 'tierra', 'rayo'], r = R.shuffle(els).slice(0, 3);
  const pets = r.map((e, i) => pet(C.make(1000 + Math.floor(Math.random() * 99999), [e]), { stage: i === 1 ? 2 : 1, mood: 'idle', uid: 't' + i })).join('');
  show('title', `<h1 class="logo"><span class="a">Mate</span><span class="b">Monstruos</span></h1><p class="sub">Liga del Teide · Matemáticas</p>
  <div class="title-pets">${pets}</div>
  <div class="col"><button class="btn big" data-nav data-first data-act="play">¡Jugar!</button>
  <div class="row"><button class="btn cyan" data-nav data-act="dex">Mi colección (${SAVE.dex.length})</button><button class="btn yellow" data-nav data-act="help">Cómo se juega</button><button class="btn ghost" data-nav data-act="teacher">Para docentes</button></div></div>
  <p class="keys"><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> moverte · <kbd>Espacio</kbd> aceptar · o toca la pantalla · Makey Makey listo</p>
  <p class="credits">Diseñado por <b>David OZC</b> · © David 2026 · Uso gratuito en centros educativos<br><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es" target="_blank" rel="noopener license"><img src="https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png" width="88" height="31" alt="Licencia Creative Commons BY-NC-ND 4.0"></a> <span>CC BY-NC-ND 4.0 · Reconocimiento · NoComercial · SinObraDerivada</span></p>`);
  musicFor('menu');
}
function levelScreen() {
  show('level', `<h2 class="t">¿Qué nivel eliges?</h2><p class="s">Cada nivel adapta las preguntas a tu ciclo</p>
  <div class="row">${[1, 2, 3].map(n => { const L = LEVELS[n]; const cr = C.make(n * 31, [L.el]); return `<button class="card lvl" style="--c:${L.color}" data-nav ${n === P.cycle ? 'data-first' : ''} data-act="level" data-v="${n}"><span class="tag">${L.grades}</span><div class="eggmini">${C.egg(L.el)}</div><span class="nm">${L.name}</span><span class="ds">${L.desc}</span></button>`; }).join('')}</div>`, { back: 'title', backBtn: true });
}
function worldScreen() {
  show('world', `<h2 class="t">Elige tu mundo</h2><p class="s">Cambia los fondos, la música y las criaturas</p>
  <div class="row">${Object.keys(WORLDS).map(k => { const W = WORLDS[k]; return `<button class="card" style="--c:${W.color}" data-nav data-world="${k}" ${k === P.world ? 'data-first' : ''} data-act="world" data-v="${k}"><div class="minis" style="display:flex;gap:.2rem;height:4rem">${W.els.map((e, i) => `<div style="width:4rem">${C.svg(C.make(k.length * 17 + i * 5, [e]), { uid: k + i })}</div>`).join('')}</div><span class="nm">${W.name}</span><span class="ds">${W.desc}</span></button>`; }).join('')}</div>`, { back: 'level', backBtn: true });
}
let eggSeeds = [];
function eggScreen() {
  const els = WORLDS[P.world].els;
  eggSeeds = [0, 1, 2].map(i => ({ seed: Math.floor(Math.random() * 1e6) + 1, el: els[i % els.length] }));
  show('egg', `<h2 class="t">¡Elige un huevo misterioso!</h2><p class="s">Dentro hay tu compañero de aventuras</p>
  <div class="eggs">${eggSeeds.map((e, i) => `<button class="egg" data-nav ${i === 1 ? 'data-first' : ''} data-act="egg" data-v="${i}" aria-label="Huevo ${i + 1}">${C.egg(e.el)}</button>`).join('')}</div>`, { back: 'world', backBtn: true });
}
async function hatch(i) {
  const e = eggSeeds[i]; UI.busy = true;
  const eggs = [...app.querySelectorAll('.egg')];
  eggs.forEach((b, j) => { if (j !== i) b.classList.add('gone'); });
  const b = eggs[i]; b.classList.add('shaking'); sfx('crack'); setTimeout(() => sfx('crack'), 330); setTimeout(() => sfx('crack'), 640);
  await sleepRaw(900);
  const wo = document.createElement('div'); wo.className = 'whiteout'; document.body.appendChild(wo); setTimeout(() => wo.remove(), 950);
  sfx('hatch'); const r = b.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, ['#fff', '#ffd23f', '#ff3d9a', '#2de2ff'], 50, 9); FX.confetti(40);
  await sleepRaw(350);
  const cr = C.make(e.seed, [e.el]); P.cr = { seed: cr.seed, element: cr.element };
  UI.busy = false;
  show('reveal', `<div class="reveal"><span class="chip">¡Ha nacido!</span><div class="big-cr">${C.svg(cr, { mood: 'happy', uid: 'rv' })}</div><div class="nameplate">${cr.name}</div><span class="chip" style="background:${C.ELEM[cr.element].body};color:#1b1140">${cr.label}</span>
  <div class="row"><button class="btn" data-nav data-first data-act="accept">¡Será mi compañero!</button><button class="btn ghost" data-nav data-act="reroll">Otro huevo</button></div></div>`, { back: 'egg' });
  live('Ha nacido ' + cr.name);
}
function best(key) { return SAVE.best[key]; }
function modeScreen() {
  const cats = Q.cats(P.cycle), cr = mkCr(P.cr);
  const bk = k => { const b = best(P.cycle + '|' + k); return b ? `<span class="best">${b.letter} · ${b.score}</span>` : ''; };
  show('mode', `<div style="display:flex;align-items:center;gap:1rem"><div style="width:clamp(4rem,12vmin,7rem)">${C.svg(cr, { mood: 'happy', uid: 'md' })}</div><div><h2 class="t" style="text-align:left">¿A qué jugamos?</h2><p class="s" style="text-align:left">${cr.name} · ${LEVELS[P.cycle].name}</p></div></div>
  <button class="card wide" style="--c:var(--yellow)" data-nav data-first data-act="story">${bk('story')}<div class="ic" style="color:var(--yellow)"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M24 5l5.500 12 13 1.500-9.700 9 2.800 12.800L24 33l-11.600 7.300 2.800-12.800-9.700-9 13-1.500z"/></svg></div><div><span class="nm">Modo historia</span><br><span class="ds">Recorre la liga mezclando todos los retos, con 2 jefes y el JEFE FINAL</span></div></button>
  <div class="cards-grid">${cats.map(c => { const I2 = Q.info(c, P.cycle); return `<button class="card" style="--c:${I2.color}" data-nav data-act="single" data-v="${c}">${bk(c)}<div class="ic" style="color:${I2.color}">${catIcon(c)}</div><span class="nm">${I2.name}</span></button>`; }).join('')}</div>
  <p class="keys">Duelo rápido: 2 combates + jefe de la categoría</p>`, { back: 'egg', backBtn: true });
}
function dexScreen() {
  const n = SAVE.dex.length;
  show('dex', `<h2 class="t">Mi colección · ${n}</h2>${n ? `<div class="dex">${SAVE.dex.map((d, i) => { const cr = mkCr(d); return `<div>${C.svg(cr, { mood: 'happy', uid: 'd' + i })}<br>${cr.name}</div>`; }).join('')}</div>` : '<p class="s">Todavía no has domado ninguna criatura. ¡Gana combates para conseguirlas!</p>'}
  <button class="btn" data-nav data-first data-act="back">Volver</button>`, { back: 'title' });
}

/* ---------- ventanas ---------- */
function modal(html) {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="mbox">${html}</div>`; document.getElementById('app').appendChild(m);
  const f = m.querySelector('[data-first]'); if (f) f.focus({ preventScroll: true });
  const mb = m.querySelector('.mbox'); if (mb) mb.scrollTop = 0;
}
function closeModal() { const m = document.getElementById('modal'); if (m) m.remove(); }
const modalOpen = () => !!document.getElementById('modal');
function helpModal() {
  modal(`<h3>Cómo se juega</h3><p>Tu criatura se enfrenta a otras. <b>Resuelve bien el reto</b> para atacar. Si fallas, pierdes un corazón. ¡Vence a los jefes y consigue la mejor calificación!</p>
  <div class="ctl"><span><kbd>↑</kbd><kbd>←</kbd><kbd>→</kbd><kbd>↓</kbd></span><span>Elegir respuesta (la flecha de cada botón)</span><span><kbd>Espacio</kbd></span><span>Aceptar, continuar y usar el PODER (el botón ESPACIO de la Makey Makey)</span><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> · <kbd>1</kbd>–<kbd>4</kbd></span><span>Alternativas de teclado</span><span><kbd>Esc</kbd> · <kbd>M</kbd></span><span>Pausa · Silenciar</span></div>
  <p><b>Poder:</b> cada acierto carga la barra PODER. Cuando está llena, pulsa <kbd>Espacio</kbd> (o el botón) en una pregunta para eliminar dos respuestas incorrectas. Solo se puede usar una vez por carga. En la Makey Makey basta con ESPACIO; no hace falta el clic.</p>
  <p><b>Makey Makey:</b> conecta ↑ ← → ↓ y ESPACIO a cinco objetos conductores (plastilina, fruta, papel de aluminio…) y la tierra a tu mano. También sirve tocar la pantalla. Pueden jugar varias personas a la vez: una sujeta la tierra y otra toca el cable de la respuesta.</p>
  <button class="btn" data-first data-nav data-act="closemodal">¡Entendido!</button>`);
}
function paperModal() {
  modal(`<h3>¡Alto ahí, mente brillante!</h3>
  <p>Los monstruos de la Liga son muy listos, pero tienen un punto débil: <b>¡no soportan que hagas las cuentas con calma!</b></p>
  <p>Así que te recomendamos jugar con <b>un papel y un bolígrafo (o un lápiz, que también vale)</b> para hacer las operaciones antes de contestar. Tu cerebro lo agradecerá, los números grandes dejarán de ponerse nerviosos y tus criaturas presumirán de ti.</p>
  <p>Eso sí: el papel no hace magia solo, ¡la magia eres tú!</p>
  <div class="row"><button class="btn" data-first data-nav data-act="gostory">¡Ya tengo papel y boli!</button><button class="btn ghost" data-nav data-act="closemodal">Volver</button></div>`);
}

function powersModal() {
  if (!S) return;
  const st = S.stats || {}, pct = (cats) => { let c = 0, t = 0; cats.forEach(k => { if (st[k]) { c += st[k].c; t += st[k].c + st[k].w; } }); return { n: t, p: t ? Math.round(100 * c / t) : 0 }; };
  const lvl = x => x.n < 3 ? ['sin', 'Aún sin datos'] : x.p >= 80 ? ['top', '¡Superpoder!'] : x.p >= 60 ? ['mid', 'Casi lo tienes'] : ['low', 'A entrenar'];
  const row = (name, ref, x, extra) => { const l = lvl(x); return `<div class="pw ${l[0]}"><div class="pwt"><b>${name}</b>${ref ? ` <span class="ref">${ref}</span>` : ''}${extra ? `<br><small>${extra}</small>` : ''}</div><div class="pwv"><span class="pbar"><i style="width:${x.n ? x.p : 0}%"></i></span><span class="pchip">${l[1]}${x.n ? ` · ${x.p}% (${Math.round(x.n * x.p / 100)}/${x.n})` : ''}</span></div></div>`; };
  const all = { n: S.answered, p: S.answered ? Math.round(100 * S.correct / S.answered) : 0 };
  const num = pct(['sumres', 'tablas', 'divisiones', 'fracciones', 'comparar']), med = pct(['medida', 'areas']), esp = pct(['geometria']), alg = pct(['secuencias']), est = pct(['datos']), ops = pct(['sumres', 'tablas', 'divisiones', 'fracciones']);
  const rec = (S.aw || 0) >= 2 ? { n: S.aw, p: Math.round(100 * (S.rc || 0) / S.aw) } : { n: 0, p: 0 };
  const feelTxt = { 1: 'Te has sentido con confianza.', 2: 'Te has sentido más o menos seguro o segura.', 3: 'Has tenido dudas, y está muy bien decirlo.' }[S.feel] || '';
  const weak = [['sumres', 'sumres'], ['tablas', 'tablas'], ['divisiones', 'divisiones'], ['fracciones', 'fracciones'], ['comparar', 'comparar'], ['medida', 'medida'], ['areas', 'areas'], ['geometria', 'geometria'], ['secuencias', 'secuencias'], ['datos', 'datos']].map(a => a[0]).filter(k => st[k] && st[k].c + st[k].w >= 3 && st[k].c / (st[k].c + st[k].w) < .7).map(k => Q.info(k, S.cycle).name);
  modal(`<h3>¡Tus superpoderes mates!</h3>
  <p>Así te ha ido en esta partida. Los superpoderes son lo que mejor dominas; «A entrenar» son retos secretos que puedes conseguir con práctica.</p>
  <h4>Tus sentidos matemáticos</h4>
  ${row('Sentido numérico', 'Bloque I', num)}${row('Sentido de la medida', 'Bloque II', med)}${row('Sentido espacial', 'Bloque III', esp)}${row('Sentido algebraico y pensamiento computacional', 'Bloque IV', alg)}${row('Sentido estocástico (datos y azar)', 'Bloque V', est)}
  <h4>Criterios de evaluación</h4>
  ${row('Elegir una estrategia para resolver problemas aritméticos, geométricos, lógicos y de patrones', 'Criterio 2.1', all)}
  ${row('Elegir y usar las operaciones adecuadas en los problemas', 'Criterio 2.2', ops)}
  ${row('Reconocer patrones y resolver retos con secuencias y algoritmos', 'Criterios 4.1 y 4.2', alg)}
  ${row('Ver el error como una oportunidad: seguir intentándolo tras equivocarte', 'Criterio 7.1', rec, feelTxt || (rec.n ? '' : 'Haría falta equivocarse al menos 2 veces para medirlo'))}
  ${weak.length ? `<p><b>Retos secretos para entrenar:</b> ${weak.join(', ')}. ¡Prueba un duelo rápido de cada uno!</p>` : (all.n >= 3 ? '<p><b>¡Todo lo que has practicado lo dominas muy bien!</b> Sube de nivel o prueba otras categorías.</p>' : '')}
  ${S.mode !== 'story' ? '<p><small>Has jugado una sola categoría: juega el modo historia para ver todos tus superpoderes.</small></p>' : ''}
  <p><small>Resultado orientativo, solo de esta partida y de los criterios 2.1, 2.2, 4.1, 4.2 y 7.1 del Decreto 211/2022. La evaluación la hace tu docente.</small></p>
  <button class="btn" data-first data-nav data-act="closemodal">¡Entendido!</button>`);
  const mb = document.querySelector('#modal .mbox'); if (mb) mb.classList.add('wide');
}
function teacherModal() {
  modal(`<h3>Para docentes</h3>
  <p><b>Adaptado al currículo oficial de Canarias.</b> Los contenidos están seleccionados y secuenciados según los saberes básicos de Matemáticas de Educación Primaria del <b>Decreto 211/2022, de 10 de noviembre</b> (BOC n.º 231, de 23/11/2022; anexo del área de Matemáticas), organizados en sus <b>seis sentidos</b>: numérico, de la medida, espacial, algebraico (y pensamiento computacional), estocástico y socioafectivo. Se citan entre paréntesis las referencias del anexo (p. ej. I.2.13 = sentido numérico, bloque 2, saber 13).</p>
  <table class="tt"><tr><th>Sentido</th><th>1.º–2.º</th><th>3.º–4.º</th><th>5.º–6.º</th></tr>
  <tr><td>I. Numérico</td><td>Sumas y restas (I.2.2, I.2.7; en el juego hasta 100), dobles y mitades de decenas (I.2.13–2.14), comparar y ordenar (I.3.2), monedas y billetes en euros (I.4.1). <b>Sin tablas, divisiones ni fracciones.</b></td><td>Decimales (I.1.6), fracciones hasta denominador 12 y su suma y resta con igual denominador (I.1.7, I.2.14), porcentajes 50, 25 y 75 % (I.2.15), tablas, múltiplos y división (I.2.5–2.7, I.2.12), ×10 y ×100 (I.2.10.1), euros y céntimos (I.4.1).</td><td>Números negativos (I.1.6), fracciones impropias, equivalentes y suma con denominadores múltiplos (I.1.8, I.2.8–2.9), fracción-decimal-porcentaje (I.1.7), potencias (I.1.9), ×0,5 y ÷0,5 (I.2.2.3, I.2.4), mcm, mcd, divisibilidad y primos (I.3.6–3.8), proporcionalidad (I.4.2) y descuentos (I.5.2).</td></tr>
  <tr><td>II. Medida</td><td>Comparar longitud, masa, capacidad y tiempo; unidades cm, m, g, kg, l; reloj y unidades de tiempo (II.1.1–1.3, II.2.2–2.3).</td><td>Unidades km a mm, kg, g, l, ml, cm², m²; reloj analógico y digital; segundos; elegir unidad e instrumento; áreas de rectángulos y triángulos; ángulos rectos, agudos y obtusos (II.1.2–1.3, II.2.2, II.2.4–2.5, II.2.8–2.10).</td><td>cl, dl, dm², cm³ y tiempo de siglos a segundos; ángulos; áreas y volumen; relación área-perímetro (II.1.2, II.2.7, II.2.9–2.10).</td></tr>
  <tr><td>III. Espacial</td><td>Figuras y cuerpos con vértice, lado, arista y cara; arriba, abajo, entre, derecha, izquierda; giros; simetría en dibujos (III.1.1, 1.3, III.2.1–2.2, III.3.1).</td><td>Polígonos hasta 10 lados y cuerpos; paralelo, perpendicular y oblicuo; itinerarios en cuadrícula; simetrías; perímetros (III.1.1, III.2.1, 2.3, III.3.1, III.4.1).</td><td>Radio, diámetro y π; puntos cardinales; coordenadas; giros y simetrías; polígonos y cuerpos (III.1.3, 1.5, III.2.1–2.2, III.3.1).</td></tr>
  <tr><td>IV. Algebraico y pensamiento computacional</td><td>Patrones numéricos y de figuras; símbolo desconocido; algoritmos sencillos con un robot de flechas (IV.1.1, IV.3.2, IV.4.1–4.2).</td><td>Patrones; incógnitas, igualdad y signos mayor y menor; bucles y robot con flechas; máquinas de números (IV.1.1, IV.3.2–3.3, IV.4.1).</td><td>Patrones; ecuaciones sencillas; bucles y condicionales; «ir hacia atrás» como estrategia (IV.1.1, IV.2.4, IV.3.2, IV.4.1).</td></tr>
  <tr><td>V. Estocástico</td><td>Pictogramas y barras; seguro, posible e imposible (V.1.1, V.2.1–2.2).</td><td>Barras y pictogramas; moda y media; probabilidad comparada con bolas (V.1.1, V.1.4, V.2.2–2.3).</td><td>Media, mediana, moda y rango; variables cualitativas y cuantitativas; probabilidad con fracciones y % (V.1.3, V.1.6–1.7, V.2.1, V.2.3).</td></tr>
  <tr><td>VI. Socioafectivo</td><td colspan="3">Mensajes de ánimo y pistas ante el error, tiempo amplio, poder de ayuda, autoevaluación emocional al terminar, nombres, personajes y lenguaje inclusivos (VI.1.1–1.2, VI.2.1). El trabajo en grupo se organiza en el aula: por ejemplo, varias personas ante la Makey Makey, una con la tierra y otra tocando la respuesta (VI.2.2).</td></tr></table>
  <p><b>Criterios de evaluación con los que se relaciona</b> (la evaluación corresponde al docente; el juego solo ofrece práctica y retroalimentación): 2.2 y 2.3 (operaciones en problemas y validez de la solución, mediante las pistas), 4.1 y 4.2 (pensamiento computacional), y 7.1 (emociones y error como oportunidad).</p>
  <p><b>Alcance:</b> es un recurso de práctica que trabaja una selección de los saberes. No sustituye la manipulación de materiales, el uso de la calculadora ni las investigaciones estadísticas propias del aula. Algunos saberes se tratan a un nivel inferior al del anexo (por ejemplo, decimales hasta las centésimas y sumas y restas hasta 100 en 1.º–2.º).</p>
  <p><b>Tiempo:</b> cada pregunta tiene un tiempo máximo (barra visible): 1 minuto en 1.º–2.º, 2 minutos en 3.º–4.º y 3 minutos en 5.º–6.º. Si se agota cuenta como fallo y se muestra la pista.</p>
  <p><b>Papel y boli:</b> al empezar el modo historia en 3.º–4.º y 5.º–6.º aparece un aviso que recomienda jugar con papel y bolígrafo. En esos ciclos se mezclan además preguntas muy fáciles (aprox. 1 de cada 3).</p>
  <p><b>Superpoderes:</b> al terminar (o en game over) el botón «¡Descubre tus superpoderes!» muestra, con los datos de la partida, los sentidos y los criterios 2.1, 2.2, 4.1, 4.2 y 7.1 en los que va mejor y los que debe entrenar. Es orientativo y solo de esa partida: no sustituye la evaluación docente.</p><p><b>Poder:</b> la barra PODER se carga con los aciertos y elimina dos respuestas incorrectas, una vez por carga.</p>
  <p>Las preguntas se generan al vuelo (decenas de miles de combinaciones) y no se repiten dentro de una sesión. No se recogen datos personales: solo se guardan en este navegador las puntuaciones y las criaturas domadas.</p>
  <button class="btn" data-first data-nav data-act="closemodal">Cerrar</button>`);
  const mb = document.querySelector('#modal .mbox'); if (mb) mb.classList.add('wide');
}

/* ---------- música ---------- */
let curTrack = '';
function musicFor(track) { if (curTrack === track + P.world) return; curTrack = track + P.world; if (UI.audioOn) AU.startMusic(track, P.world); }

/* ---------- navegación por teclado/Makey ---------- */
function moveFocus(dir, root) {
  const items = [...(root || app).querySelectorAll('[data-nav]')].filter(e => !e.disabled && e.offsetParent !== null);
  if (!items.length) return;
  const cur = items.includes(document.activeElement) ? document.activeElement : null;
  if (!cur) { items[0].focus(); return; }
  const cr = cur.getBoundingClientRect(), cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
  let best = null, bd = 1e9;
  for (const it of items) {
    if (it === cur) continue; const r = it.getBoundingClientRect(), x = r.left + r.width / 2 - cx, y = r.top + r.height / 2 - cy;
    const ok = dir === 'left' ? x < -4 : dir === 'right' ? x > 4 : dir === 'up' ? y < -4 : y > 4; if (!ok) continue;
    const h = dir === 'left' || dir === 'right', d = (h ? Math.abs(x) : Math.abs(y)) + (h ? Math.abs(y) : Math.abs(x)) * 2.2; if (d < bd) { bd = d; best = it; }
  }
  if (!best) { const idx = items.indexOf(cur); best = (dir === 'left' || dir === 'up') ? items[(idx - 1 + items.length) % items.length] : items[(idx + 1) % items.length]; }
  best.focus({ preventScroll: false }); sfx('move');
}
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'ok', Enter: 'ok', NumpadEnter: 'ok', Escape: 'pause', KeyP: 'pause', KeyM: 'mute', Digit1: 'n1', Digit2: 'n2', Digit3: 'n3', Digit4: 'n4', Numpad1: 'n1', Numpad2: 'n2', Numpad3: 'n3', Numpad4: 'n4' };
const down = new Set();
function startAudio() { if (!UI.audioOn) { UI.audioOn = true; AU.init(); curTrack = ''; musicFor(UI.screen === 'battle' ? 'battle' : 'menu'); } }
window.addEventListener('keydown', e => {
  const a = KEYMAP[e.code]; if (!a || e.ctrlKey || e.metaKey || e.altKey) return;
  e.preventDefault(); if (e.repeat || down.has(e.code)) return; down.add(e.code);
  startAudio(); onAct(a);
});
window.addEventListener('keyup', e => down.delete(e.code));
window.addEventListener('blur', () => down.clear());
window.addEventListener('pointerdown', startAudio, { passive: true });

function onAct(a) {
  if (a === 'mute') { toggleMute(); return; }
  if (UI.busy) return;
  if (modalOpen()) {
    const m = document.getElementById('modal');
    if (a === 'pause') { if (S && S.paused && UI.screen === 'battle') act('resume'); else closeModal(); return; }
    if (a === 'ok') { const f = document.activeElement; if (f && m.contains(f) && f.tagName === 'BUTTON') f.click(); return; }
    if (['up', 'down', 'left', 'right'].includes(a)) moveFocus(a, m); return;
  }
  if (UI.screen === 'battle') return battleKey(a);
  if (a === 'pause') { if (UI.back) act('back'); return; }
  if (a === 'ok') { const f = document.activeElement; if (f && app.contains(f) && f.tagName === 'BUTTON') { f.classList.add('press'); setTimeout(() => f.classList.remove('press'), 120); f.click(); } else { const b = app.querySelector('[data-nav]'); if (b) b.focus(); } return; }
  if (['up', 'down', 'left', 'right'].includes(a)) moveFocus(a);
}
app.addEventListener('focusin', e => { const w = e.target.dataset && e.target.dataset.world; if (w && w !== P.world) { P.world = w; FX.setWorld(w); } });
app.addEventListener('pointerover', e => { const b = e.target.closest && e.target.closest('[data-world]'); if (b && b.dataset.world !== P.world) { P.world = b.dataset.world; FX.setWorld(P.world); } });

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || UI.busy) return;
  startAudio(); if (b.dataset.act !== 'ans') sfx('click'); act(b.dataset.act, b.dataset.v, b);
});
function toggleMute() { const v = !AU.isMuted(); AU.setMuted(v); const m = document.getElementById('bmute'); if (m) { m.innerHTML = v ? I.muteOff : I.mute; m.setAttribute('aria-pressed', v); } }

function act(a, v, el) {
  switch (a) {
    case 'play': levelScreen(); break;
    case 'level': P.cycle = +v; SAVE.last.cycle = P.cycle; save(); worldScreen(); break;
    case 'world': P.world = v; SAVE.last.world = v; save(); FX.setWorld(v); curTrack = ''; musicFor('menu'); eggScreen(); break;
    case 'egg': hatch(+v); break;
    case 'reroll': eggScreen(); break;
    case 'accept': sfx('select'); modeScreen(); break;
    case 'story': if (P.cycle >= 2) paperModal(); else startRun('story', null); break;
    case 'feel': feel(+v); break;
    case 'powers': powersModal(); break;
    case 'gostory': closeModal(); startRun('story', null); break;
    case 'single': startRun('single', v); break;
    case 'dex': dexScreen(); break;
    case 'help': helpModal(); break;
    case 'teacher': teacherModal(); break;
    case 'closemodal': closeModal(); break;
    case 'back': if (UI.back === 'title') titleScreen(); else if (UI.back === 'level') levelScreen(); else if (UI.back === 'world') worldScreen(); else if (UI.back === 'egg') eggScreen(); else titleScreen(); break;
    case 'pause': pauseGame(); break;
    case 'resume': resumeGame(); break;
    case 'quit': quitRun(); break;
    case 'again': startRun(S.mode, S.cat); break;
    case 'menu': tok++; S = null; modeScreen(); musicFor('menu'); break;
    case 'home': tok++; S = null; titleScreen(); break;
    case 'full': toggleFull(); break;
    case 'power': usePower(); break;
    case 'ans': if (el) answer(+el.dataset.i); break;
    case 'cont': if (S && S.resume) S.resume(); break;
  }
}
function feel(v) {
  const m = { 1: '¡Genial! Esa confianza se ha ganado con esfuerzo. Puedes ayudar a quien esté al lado.', 2: 'Es normal: aprender lleva tiempo. Repasa las pistas y vuelve a intentarlo, cada vez sale mejor.', 3: 'Está bien tener dudas. Pide ayuda a tu equipo o a tu docente: nadie aprende solo y preguntar es de valientes.' }[v];
  if (S) S.feel = v;
  const e = document.getElementById('feelmsg'); if (e) e.textContent = m; sfx(v === 1 ? 'heal' : 'select'); live(m);
}
function toggleFull() { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) {} }

/* ---------- partida ---------- */
const ENC = ['¡Casi!', 'Equivocarse también es aprender.', 'No pasa nada, ¡a por la siguiente!', 'Los errores nos ayudan a crecer.', '¡Buen intento!', 'Respira y mira la pista con calma.'];
const PRAISE = ['¡Correcto!', '¡Muy bien!', '¡Bien pensado!', '¡Eso es!'];
const BOSS_FINAL = 'Gran Maestro Calculón';
function buildPlan(mode, cat, cycle) {
  const els = WORLDS[P.world].els, mk = () => C.make(Math.floor(Math.random() * 1e7) + 7, els);
  const plan = [];
  if (mode === 'single') {
    plan.push({ kind: 'wild', cat, need: 4, foe: mk() }, { kind: 'wild', cat, need: 4, foe: mk() }, { kind: 'boss', cat, need: 5, foe: mk(), title: Q.info(cat, cycle).boss });
  } else {
    const order = R.shuffle(Q.cats(cycle)), step = order.length > 8 ? 4 : 3;
    order.forEach((c, i) => {
      plan.push({ kind: 'wild', cat: c, need: 3, foe: mk() });
      if ((i + 1) % step === 0 && i < order.length - 1) plan.push({ kind: 'mini', cat: 'mix', mix: order.slice(0, i + 1), need: 5, foe: mk(), title: Q.info(c, cycle).boss });
    });
    plan.push({ kind: 'final', cat: 'mix', mix: order, need: 8, foe: mk(), title: BOSS_FINAL });
  }
  return plan;
}
function startRun(mode, cat) {
  tok++; closeModal();
  const maxL = P.cycle === 1 ? 7 : P.cycle === 2 ? 6 : 5, plan = buildPlan(mode, cat, P.cycle);
  S = { mode, cat, cycle: P.cycle, me: mkCr(P.cr), lives: maxL, maxLives: maxL, score: 0, streak: 0, best: 0, correct: 0, wrong: 0, answered: 0, stage: 1, plan, pi: -1, tamed: [], dyn: 0, bonus: { enc: 0, boss: 0 }, locked: true, paused: false, totalNeed: plan.reduce((s, e) => s + e.need, 0), limit: P.cycle === 1 ? 60 : P.cycle === 2 ? 120 : 180, pow: 0, powNeed: P.cycle === 3 ? 5 : 4, removed: new Set(), evo2: mode === 'story' ? 9 : 5, evo3: mode === 'story' ? 24 : 11, lastCat: '', stats: {} };
  curTrack = ''; UI.audioOn && musicFor('battle');
  renderBattle();
  run().catch(e => { if (e !== CANCEL) { console.error(e); } });
}
function renderBattle() {
  UI.screen = 'battle'; UI.back = null; UI.busy = false;
  app.innerHTML = `<div class="screen battle" data-screen="battle" style="padding:0;gap:0;justify-content:flex-start;align-items:stretch;overflow:hidden;animation:none">
  <div class="hud"><div class="hl"><div class="hearts" id="hearts" role="img"></div><span class="hpill" id="encInfo"></span></div><button class="power" id="power" data-act="power" aria-label="Poder: eliminar dos respuestas"><span class="segs" id="segs"></span><span class="pl" id="plabel">PODER</span></button><div class="hr"><span class="hpill streak" id="streak"></span><span class="score" id="score">0</span></div></div>
  <div class="arena" id="arena"><div class="plate fplate" id="fplate"></div><div class="sprite foe" id="foe"><div class="shadow"></div><div class="inner bob"></div></div>
  <div class="plate mplate" id="mplate"></div><div class="sprite me" id="me"><div class="shadow"></div><div class="inner bob"></div></div></div>
  <div class="qpanel" id="qpanel"></div><div class="banner" id="banner"></div></div>`;
  const tc = document.getElementById('topctl'); tc.dataset.mode = 'battle';
  setHearts(); setMe(); setHud(); setPower();
}
const $ = id => document.getElementById(id);
function setHearts(lost) {
  $('hearts').innerHTML = Array.from({ length: S.maxLives }, (_, i) => HEART.replace('<svg', `<svg class="${i >= S.lives ? 'lost' : ''}${lost === i ? ' pop' : ''}"`)).join('');
  $('hearts').setAttribute('aria-label', `Vidas: ${S.lives} de ${S.maxLives}`);
}
function setHud() {
  const e = S.plan[Math.max(0, S.pi)];
  $('encInfo').textContent = S.mode === 'story' ? `Combate ${Math.max(1, S.pi + 1)}/${S.plan.length}` : `Duelo ${Math.max(1, S.pi + 1)}/${S.plan.length}`;
  $('score').textContent = S.score.toLocaleString('es-ES');
  const m = mult();
  $('streak').textContent = S.streak >= 2 ? `RACHA ×${m}` : ''; $('streak').style.display = S.streak >= 2 ? '' : 'none'; $('streak').classList.toggle('hot', m >= 3);
}
function setPower() {
  const p = $('power'); if (!p) return; const need = S.powNeed, full = S.pow >= need;
  $('segs').innerHTML = Array.from({ length: need }, (_, i) => `<i class="${i < S.pow ? 'on' : ''}"></i>`).join('');
  const usable = full && S.q && !S.locked && S.q.answers.length >= 3 && !S.removed.size;
  p.classList.toggle('ready', full); p.classList.toggle('usable', !!usable);
  $('plabel').innerHTML = full ? '¡Quitar 2! <kbd>Espacio</kbd>' : 'PODER';
  p.setAttribute('aria-label', full ? 'Poder listo: pulsa para eliminar dos respuestas' : `Poder: ${S.pow} de ${need}`);
}
function usePower() {
  try { document.activeElement && document.activeElement.blur(); } catch (e) {}
  if (!S || S.paused || S.locked || !S.q || S.pow < S.powNeed || S.removed.size || S.q.answers.length < 3) return;
  const wrong = S.q.answers.map((_, i) => i).filter(i => i !== S.q.correct), n = Math.min(2, S.q.answers.length - 2);
  R.shuffle(wrong).slice(0, n).forEach(i => S.removed.add(i));
  document.querySelectorAll('.ans').forEach(b => { if (S.removed.has(+b.dataset.i)) { b.classList.add('gone'); b.disabled = true; const r = b.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, ['#fff', '#2de2ff', '#b6ff3b'], 22, 7); } });
  S.pow = 0; sfx('evolve'); floatText('¡Dos fuera!', $('qcard'), '#2de2ff'); live('Se han eliminado dos respuestas'); setPower();
}
const mult = () => 1 + Math.min(4, Math.floor(S.streak / 3));
function setMe(mood) {
  const inner = $('me').querySelector('.inner'); inner.className = 'inner bob';
  $('me').style.height = ({ 1: '72%', 2: '80%', 3: '88%' })[S.stage] || '';
  inner.innerHTML = C.svg(S.me, { mood: mood || 'idle', stage: S.stage, uid: 'me' });
  $('mplate').innerHTML = `<div class="pn"><span>${S.me.name}</span><span class="pe">Nv ${S.stage}</span></div><div class="hp" style="height:.55rem"><i style="width:${Math.min(100, (S.correct / S.totalNeed) * 100)}%;background:linear-gradient(180deg,#8be9ff,#2d9bff)"></i></div>`;
}
function setFoe(mood, plate) {
  const e = S.enc, foe = $('foe'), inner = foe.querySelector('.inner');
  foe.classList.toggle('boss', !!e.title); inner.className = 'inner bob';
  foe.style.height = e.title ? '78%' : ''; foe.style.top = e.title ? '0' : '';
  inner.innerHTML = `<div style="width:100%;height:100%;transform:scaleX(-1)">${C.svg(e.foe, { mood: mood || 'idle', boss: e.kind === 'final' ? 'final' : e.title ? 'mini' : false, stage: e.title ? 2 : 1, uid: 'fo' })}</div>`;
  if (!plate) return;
  const nm = e.title ? `<span class="bossTag">JEFE</span>${e.title}` : e.foe.name;
  $('fplate').innerHTML = `<div class="pn"><span>${nm}</span><span class="pe">${e.foe.label}</span></div><div class="hp ${e.title ? 'boss' : ''}" id="hpbar"><i style="width:${(S.hp / e.need) * 100}%"></i></div>`;
}
function setHp() { const b = $('hpbar'); if (!b) return; const p = S.hp / S.enc.need; b.firstElementChild.style.width = Math.max(0, p * 100) + '%'; b.classList.toggle('low', p <= .34 && !S.enc.title); anim($('fplate'), 'hitplate', 500); }
function anim(el, cls, ms) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
function banner(t, s, boss, ms) {
  const b = $('banner'); if (!b) return; b.className = 'banner' + (boss ? ' boss' : ''); b.innerHTML = `<span class="bt">${t}</span>${s ? `<span class="bs">${s}</span>` : ''}`;
  clearTimeout(banner.t); banner.t = setTimeout(() => { if (b) b.innerHTML = ''; }, ms || 1700);
}
function center(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .45]; }
function floatText(txt, el, col) {
  const [x, y] = center(el), f = document.createElement('div'); f.className = 'flt'; f.textContent = txt; f.style.left = x + 'px'; f.style.top = y + 'px'; if (col) f.style.color = col;
  document.getElementById('app').appendChild(f); setTimeout(() => f.remove(), 1200);
}
function orb(from, to, color, ms) {
  const a = center(from), b = center(to), o = document.createElement('div'); o.className = 'orb'; o.style.setProperty('--oc', color); o.style.background = `radial-gradient(circle at 35% 30%,#fff,${color})`;
  o.style.left = a[0] - 19 + 'px'; o.style.top = a[1] - 19 + 'px'; document.getElementById('app').appendChild(o);
  const an = o.animate([{ transform: 'translate(0,0) scale(.6)' }, { transform: `translate(${(b[0] - a[0]) / 2}px,${(b[1] - a[1]) / 2 - 30}px) scale(1.4)` }, { transform: `translate(${b[0] - a[0]}px,${b[1] - a[1]}px) scale(1)` }], { duration: ms || 380, easing: 'ease-in' });
  return new Promise(r => { an.onfinish = () => { o.remove(); r(b); }; });
}
function shakeScreen() { const a = document.getElementById('app'); a.classList.remove('shk'); void a.offsetWidth; a.classList.add('shk'); setTimeout(() => a.classList.remove('shk'), 450); }

async function run() {
  while (true) {
    S.pi++;
    if (S.pi >= S.plan.length) return finish(true);
    const e = S.plan[S.pi]; S.enc = e; S.hp = e.need; S.locked = true;
    $('qpanel').innerHTML = ''; setFoe(null, true); setHud();
    const boss = !!e.title;
    if (boss) { const f = document.createElement('div'); f.className = 'bossflash'; document.body.appendChild(f); setTimeout(() => f.remove(), 2300); sfx('boss'); curTrack = ''; musicFor(e.kind === 'final' ? 'final' : 'boss'); shakeScreen(); }
    else { sfx('whoosh'); if (S.pi > 0) { curTrack = ''; musicFor('battle'); } }
    anim($('foe'), 'enter-r', 800);
    const info = e.cat === 'mix' ? null : Q.info(e.cat, S.cycle);
    banner(boss ? `¡${e.title}!` : `¡Aparece ${e.foe.name}!`, boss ? (e.kind === 'final' ? '¡El combate definitivo!' : 'Un jefe bloquea el camino') : info.name, boss, boss ? 2300 : 1500);
    live(boss ? 'Jefe: ' + e.title : 'Aparece ' + e.foe.name);
    await sleep(boss ? 2300 : 1500);
    while (S.hp > 0) {
      await ask();
      if (S.lives <= 0) return finish(false);
    }
    await won();
  }
}
function pickCat() {
  const e = S.enc; if (e.cat !== 'mix') return e.cat;
  const pool = e.mix.filter(c => c !== S.lastCat); return R.pick(pool.length ? pool : e.mix);
}
function diff() {
  const done = S.correct / S.totalNeed, base = .04 + .96 * done, boss = S.enc.title ? .12 : 0;
  const f = S.cycle === 1 ? .5 : S.cycle === 2 ? .78 : 1;
  return Math.max(0, Math.min(1, (base + S.dyn + boss + (Math.random() - .5) * .08) * f));
}
function ask() {
  return new Promise(async res => {
    const cat = pickCat(); S.lastCat = cat; const q = Q.generate(cat, S.cycle, diff()); S.q = q; S.tq = performance.now();
    renderQuestion(q); S.locked = false; S.resolveAsk = res; startTimer(q);
    live(strip(q.text) + (q.visual ? ' ' + strip(q.visual) : ''));
  });
}
let timerId = 0;
function startTimer(q) {
  clearInterval(timerId); if (!S || !S.limit) return;
  S.tLeft = S.limit * 1000; const my = tok;
  timerId = setInterval(() => {
    if (!S || my !== tok || S.q !== q || S.locked) { clearInterval(timerId); return; }
    if (S.paused) return;
    S.tLeft -= 100; const bar = document.querySelector('.tbar'), left = Math.max(0, S.tLeft / 1000);
    if (bar) { bar.firstElementChild.style.width = (S.tLeft / (S.limit * 1000) * 100) + '%'; bar.classList.toggle('low', left <= 10); bar.querySelector('b').textContent = Math.ceil(left) + ' s'; }
    if (left <= 10 && Math.ceil(left) !== S.lastTick) { S.lastTick = Math.ceil(left); if (left <= 5) sfx('move'); }
    if (S.tLeft <= 0) { clearInterval(timerId); lastAnsAt = 0; S.timedOut = true; answer(-1); }
  }, 100);
}
function dirsFor(n) { return n === 4 ? ['up', 'left', 'right', 'down'] : n === 3 ? ['left', 'up', 'right'] : ['left', 'right']; }
function fitAnswers() {
  document.querySelectorAll('.ans').forEach(b => {
    const av = b.querySelector('.av'); if (!av || av.querySelector('svg')) return;
    b.style.fontSize = ''; let fs = parseFloat(getComputedStyle(b).fontSize), guard = 0;
    const arrow = b.querySelector('svg.a'), maxW = b.clientWidth - 10, maxH = b.clientHeight - (arrow ? arrow.getBoundingClientRect().height : 0) - 10;
    const over = () => { const r = document.createRange(); r.selectNodeContents(av); const q = r.getBoundingClientRect(); return q.width > maxW || q.height > maxH; };
    while (over() && fs > 7 && guard++ < 60) { fs -= 0.5; b.style.fontSize = fs + 'px'; }
  });
}
window.addEventListener('resize', () => { try { fitAnswers(); } catch (e) {} });
function renderQuestion(q) {
  const info = Q.info(q.cat, S.cycle), dirs = dirsFor(q.answers.length), plain = strip(q.text);
  const cls = plain.length <= 20 && /[0-9?]/.test(plain) ? 'eq' : plain.length > 70 ? 'long' : '';
  const btns = q.answers.map((a, i) => `<button class="ans${a.includes('<') ? '' : a.length > 10 ? ' l3' : a.length > 7 ? ' l2' : a.length > 5 ? ' l1' : ''}" data-dir="${dirs[i]}" data-i="${i}" data-act="ans" aria-label="${dirs[i] === 'up' ? 'Arriba' : dirs[i] === 'down' ? 'Abajo' : dirs[i] === 'left' ? 'Izquierda' : 'Derecha'}: ${strip(a).replace(/"/g, '')}">${ARROW(dirs[i])}<span class="av">${a}</span></button>`).join('');
  S.removed = new Set(); setPower();
  const p = $('qpanel'); p.style.display = ''; p.innerHTML = `<div class="qcard" id="qcard" style="--c:${info.color}"><span class="qcat">${info.name}</span>${S.limit ? '<div class="tbar"><i></i><b>' + S.limit + ' s</b></div>' : ''}<div class="qtext ${cls}">${q.text}</div><div class="qvis">${q.visual}</div></div><div class="answers">${btns}</div>`;
  fitAnswers();
}
function battleKey(a) {
  if (a === 'pause') { if (S && S.paused) resumeGame(); else pauseGame(); return; }
  if (!S || S.paused) { if (a === 'ok' && S && S.paused) resumeGame(); return; }
  if (a === 'ok') { if (S.resume) { if (performance.now() - S.hintAt > 500) S.resume(); } else usePower(); return; }
  const dirs = S.q ? dirsFor(S.q.answers.length) : [];
  let i = dirs.indexOf(a); if (i < 0 && /^n[1-4]$/.test(a)) i = +a[1] - 1;
  if (i >= 0 && S.q && i < S.q.answers.length && !S.removed.has(i)) answer(i);
}
let lastAnsAt = 0;
async function answer(i) {
  if (!S || S.locked || S.paused || !S.q || (S.removed && S.removed.has(i))) return;
  const now = performance.now(); if (now - lastAnsAt < 250) return; lastAnsAt = now;
  clearInterval(timerId); S.locked = true; setPower(); const q = S.q, ok = i === q.correct, btns = [...document.querySelectorAll('.ans')];
  const secs = (now - S.tq) / 1000; S.answered++;
  if (S.lastWrong) { S.aw = (S.aw || 0) + 1; if (ok) S.rc = (S.rc || 0) + 1; } S.lastWrong = !ok;
  const st = S.stats[q.cat] = S.stats[q.cat] || { c: 0, w: 0 }; ok ? st.c++ : st.w++;
  const my = tok;
  try {
    if (ok) {
      S.streak++; S.best = Math.max(S.best, S.streak); S.correct++; { const was = S.pow >= S.powNeed; if (!was) { S.pow++; if (S.pow >= S.powNeed) setTimeout(() => { sfx('heal'); }, 600); } } S.dyn = Math.min(.2, S.dyn + .03);
      const m = mult(), turbo = Math.max(0, Math.round(60 - secs * 6)), pts = Math.round((100 * m + turbo) * (S.enc.title ? 1.5 : 1));
      S.score += pts; btns.forEach((b, j) => b.classList.add(j === i ? 'ok' : 'dim'));
      sfx(S.streak % 3 === 0 ? 'combo' : 'correct'); setHud();
      const card0 = $('qcard'), t0 = performance.now();
      if (card0 && q.hint) { card0.innerHTML = `<div class="hintcard"><span class="oops good">${R.pick(PRAISE)}</span><div class="ht">${q.hint}</div><span class="go">Pulsa <b>ESPACIO</b> o toca para seguir</span></div>`; S.hintAt = t0; }
      anim($('me'), 'lunger', 560); setMe('happy'); anim($('me').querySelector('.inner'), 'hop', 600);
      await sleepSafe(180);
      const ac = C.ELEM[S.me.element].acc, to = await orb($('me'), $('foe'), ac, 340);
      sfx('hit'); FX.burst(to[0], to[1], [ac, '#fff', '#ffd23f'], 26, 8); S.hp--; setHp(); setFoe('hurt');
      anim($('foe').querySelector('.inner'), 'shake', 500); anim($('foe'), 'flash', 400);
      floatText('+' + pts + (turbo > 40 ? ' ¡TURBO!' : ''), $('foe'));
      if (S.streak >= 3 && S.streak % 3 === 0) { banner(`¡RACHA ×${m}!`, '', false, 1000); }
      await sleep(520);
      if (S.hp > 0) setFoe();
      if (S.stage === 1 && S.correct >= S.evo2) await evolve(2); else if (S.stage === 2 && S.correct >= S.evo3) await evolve(3);
      if (S.hp > 0) setMe();
      { const left = Math.max(400, 3800 - (performance.now() - t0)); await new Promise(r => { let t; S.resume = () => { clearTimeout(t); S.resume = null; r(); }; t = setTimeout(() => { if (S && S.resume) S.resume(); }, left); const c = $('qcard'); if (c) c.onclick = () => { if (S && S.resume && performance.now() - S.hintAt > 400) S.resume(); }; }); }
      await sleep(120);
    } else {
      S.streak = 0; S.wrong++; S.dyn = Math.max(-.2, S.dyn - .07); S.lives--;
      btns.forEach((b, j) => b.classList.add(j === i ? 'bad' : j === q.correct ? 'ok' : 'dim'));
      sfx('wrong'); setHud(); try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
      await sleep(420);
      anim($('foe'), 'lungel', 560); await sleep(220);
      const to = await orb($('foe'), $('me'), '#ff3d6a', 300); sfx('heart'); shakeScreen(); FX.burst(to[0], to[1], ['#ff3d6a', '#fff', '#ffd23f'], 18, 7);
      setMe('hurt'); anim($('me').querySelector('.inner'), 'shake', 500); setHearts(S.lives); floatText('−1', $('me'), '#ff6a8a'); setHud();
      if (S.lives <= 0) {
        setMe('faint'); $('me').querySelector('.inner').classList.remove('bob'); anim($('me').querySelector('.inner'), 'faint', 1100); sfx('lose');
        banner('¡Sin vidas!', 'Tu criatura necesita descansar', false, 1700); await sleep(1900); S.q = null; return S.resolveAsk();
      }
      setMe();
      // pista
      const card = $('qcard');
      card.innerHTML = `<div class="hintcard"><span class="oops">${S.timedOut ? '¡Se acabó el tiempo!' : R.pick(ENC)} La respuesta era ${strip(q.answers[q.correct]) || '…'}</span><div class="ht">${q.hint}</div><span class="go">Pulsa <b>ESPACIO</b> o toca para seguir</span></div>`;
      if (!strip(q.answers[q.correct])) card.querySelector('.oops').textContent = '¡Casi! Fíjate bien en la figura correcta';
      S.hintAt = performance.now(); S.timedOut = false;
      await new Promise(r => { let t; S.resume = () => { clearTimeout(t); S.resume = null; r(); }; t = setTimeout(() => { if (S && S.resume) S.resume(); }, 7000); card.onclick = () => { if (performance.now() - S.hintAt > 400 && S.resume) S.resume(); }; });
    }
    S.q = null; S.resolveAsk && S.resolveAsk();
  } catch (e) { if (e !== CANCEL) throw e; }
}
async function sleepSafe(ms) { return sleep(ms); }
async function evolve(n) {
  S.stage = n; const wo = document.createElement('div'); wo.className = 'whiteout'; document.body.appendChild(wo); setTimeout(() => wo.remove(), 950);
  sfx('evolve'); setMe('happy'); anim($('me'), 'popin', 700); const c = center($('me')); FX.burst(c[0], c[1], ['#fff', '#ffd23f', '#ff3d9a', '#2de2ff'], 70, 11); FX.confetti(30);
  banner('¡EVOLUCIÓN!', `${S.me.name} sube al nivel ${n}`, false, 1700); live(S.me.name + ' evoluciona'); await sleep(1500);
}
async function won() {
  const e = S.enc, boss = !!e.title, my = tok;
  setFoe('faint'); const inner = $('foe').querySelector('.inner'); inner.classList.remove('bob');
  await sleep(450);
  if (!boss) {
    anim(inner, 'spinout', 1000); sfx('capture'); const c = center($('foe')); FX.burst(c[0], c[1], ['#fff', '#b6ff3b', '#ffd23f', '#2de2ff'], 50, 10);
    const isNew = !SAVE.dex.some(d => d.s === e.foe.seed); S.tamed.push({ cr: e.foe, isNew });
    if (isNew) { SAVE.dex.push({ s: e.foe.seed, e: e.foe.element }); if (SAVE.dex.length > 80) SAVE.dex.shift(); save(); }
    S.score += 200; S.bonus.enc += 200; setHud();
    banner(`¡${e.foe.name} domado!`, isNew ? 'Nueva criatura en tu colección' : '', false, 1500); floatText('+200', $('foe'), '#ffd23f'); await sleep(1500);
  } else {
    anim(inner, 'spinout', 1200); sfx('win'); FX.confetti(120); const c = center($('foe')); FX.burst(c[0], c[1], ['#fff', '#ffd23f', '#ff3d9a'], 90, 13);
    S.score += 500; S.bonus.boss += 500; const heal = S.lives < S.maxLives; if (heal) { S.lives++; setHearts(); }
    const isNew = !SAVE.dex.some(d => d.s === e.foe.seed); S.tamed.push({ cr: e.foe, isNew });
    if (isNew) { SAVE.dex.push({ s: e.foe.seed, e: e.foe.element }); if (SAVE.dex.length > 80) SAVE.dex.shift(); save(); }
    setHud(); banner('¡JEFE DERROTADO!', '+500 puntos' + (heal ? ' · ¡+1 corazón!' : ''), true, 2300); floatText('+500', $('foe'), '#ffd23f'); if (heal) setTimeout(() => sfx('heal'), 500); await sleep(2400);
  }
}
function pauseGame() {
  if (!S || S.paused || UI.screen !== 'battle') return;
  S.paused = true; modal(`<h3>Pausa</h3><p>Puntos: ${S.score.toLocaleString('es-ES')} · Vidas: ${S.lives}/${S.maxLives}</p><div class="row"><button class="btn" data-nav data-first data-act="resume">Continuar</button><button class="btn ghost" data-nav data-act="quit">Salir al menú</button></div>`);
}
function resumeGame() { if (S) S.paused = false; closeModal(); }
function quitRun() { clearInterval(timerId); tok++; S = null; closeModal(); document.getElementById('topctl').dataset.mode = ''; modeScreen(); curTrack = ''; musicFor('menu'); }

/* ---------- resultados ---------- */
function rate(done) {
  const acc = S.correct / Math.max(1, S.answered);
  if (done) { if (acc >= .95 && S.lives >= S.maxLives - 1) return ['S', 5, '¡Leyenda de la Liga!']; if (acc >= .85) return ['A', 4, 'Estrella de la Liga']; if (acc >= .7) return ['B', 3, 'Mente Valiente']; return ['C', 2, 'Aprendiz en Camino']; }
  return S.correct / S.totalNeed >= .6 ? ['C', 2, 'Aprendiz en Camino'] : ['D', 1, 'Cría con Mucho Futuro'];
}
function finish(done) {
  tok++; const my = tok; AU.stopMusic(); curTrack = '';
  const [letter, stars, title] = rate(done), livesB = done ? S.lives * 300 : 0, compB = done ? 1000 : 0, total = S.score + livesB + compB;
  const key = S.cycle + '|' + (S.mode === 'story' ? 'story' : S.cat), prev = SAVE.best[key], isBest = !prev || total > prev.score;
  if (isBest) SAVE.best[key] = { score: total, letter }; save();
  const acc = Math.round(100 * S.correct / Math.max(1, S.answered));
  if (done) { sfx('win'); FX.confetti(160); } else sfx('lose');
  document.getElementById('topctl').dataset.mode = '';
  const name = S.mode === 'story' ? 'Modo historia' : Q.info(S.cat, S.cycle).name;
  const st = Object.keys(S.stats).map(c => { const s = S.stats[c], t = s.c + s.w; return `<div><span>${Q.info(c, S.cycle).name}</span><b>${s.c}/${t}</b></div>`; }).join('');
  show('results', `<div class="rating"><span class="chip">${done ? '¡Misión cumplida!' : 'Entrenamiento terminado'} · ${name}</span><div class="letter">${letter}</div><div class="stars">${Array.from({ length: 5 }, (_, i) => i < stars ? STAR : STAR_OFF).join('')}</div><div class="rtitle">${title}</div></div>
  <div class="stats"><div><span>Aciertos</span><b>${S.correct}/${S.answered}</b></div><div><span>Precisión</span><b>${acc}%</b></div><div><span>Mejor racha</span><b>${S.best}</b></div><div><span>Vidas</span><b>${S.lives}/${S.maxLives}</b></div><div><span>Puntos de combate</span><b>${(S.score - S.bonus.enc - S.bonus.boss).toLocaleString('es-ES')}</b></div><div><span>Criaturas y jefes</span><b>+${S.bonus.enc + S.bonus.boss}</b></div>${done ? `<div><span>Corazones</span><b>+${livesB}</b></div><div><span>Misión</span><b>+${compB}</b></div>` : ''}<div class="tot"><span>TOTAL ${isBest ? '<span class="newb">¡RÉCORD!</span>' : ''}</span><b>${total.toLocaleString('es-ES')}</b></div></div>
  ${S.tamed.length ? `<div class="minipets">${S.tamed.map((t, i) => `<div title="${t.cr.name}">${C.svg(t.cr, { mood: 'happy', uid: 'r' + i })}</div>`).join('')}</div>` : ''}
  <div class="feelbox"><span class="chip">¿Cómo te has sentido con los retos?</span><div class="row">${[['Con confianza', 1, '#b6ff3b', 'M26 34q10 10 20 0'], ['Más o menos', 2, '#ffd23f', 'M26 38h20'], ['Con dudas', 3, '#ff9f43', 'M26 40q10-9 20 0']].map(f => `<button class="face" data-nav data-act="feel" data-v="${f[1]}" aria-label="${f[0]}"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="${f[2]}" stroke="#1b1140" stroke-width="4"/><circle cx="26" cy="29" r="4" fill="#1b1140"/><circle cx="46" cy="29" r="4" fill="#1b1140"/><path d="${f[3]}" fill="none" stroke="#1b1140" stroke-width="4" stroke-linecap="round"/></svg><span>${f[0]}</span></button>`).join('')}</div><p class="s" id="feelmsg" aria-live="polite"></p></div>
  <div class="row"><button class="btn" data-nav data-first data-act="again">Jugar otra vez</button><button class="btn pink" data-nav data-act="powers">¡Descubre tus superpoderes!</button><button class="btn cyan" data-nav data-act="menu">Cambiar modo</button><button class="btn ghost" data-nav data-act="home">Inicio</button></div>`, { noFocus: false });
  live(`Calificación ${letter}. ${title}. ${S.correct} aciertos de ${S.answered}. Total ${total} puntos`);
  window.__last = { letter, total, acc, done, stats: S.stats };
  setTimeout(() => { UI.audioOn && AU.startMusic('menu', P.world); curTrack = 'menu' + P.world; }, 2600);
  S.ended = true;
}

/* ---------- arranque ---------- */
function boot() {
  FX.init(); FX.setWorld(P.world);
  const tc = document.getElementById('topctl');
  tc.innerHTML = `<button class="ib" id="bpause" aria-label="Pausa" data-act="pause" style="display:none">${I.pause}</button><button class="ib" id="bmute" aria-label="Sonido" aria-pressed="${AU.isMuted()}" onclick="void 0">${AU.isMuted() ? I.muteOff : I.mute}</button><button class="ib" aria-label="Pantalla completa" data-act="full">${I.full}</button>`;
  document.getElementById('bmute').addEventListener('click', toggleMute);
  new MutationObserver(() => { document.getElementById('bpause').style.display = tc.dataset.mode === 'battle' ? '' : 'none'; }).observe(tc, { attributes: true });
  titleScreen();
}
window.MM = { showQ: q => { if (S) { S.q = q; renderQuestion(q); } }, act, P, get S() { return S; }, Q, SAVE };
boot();
})();
