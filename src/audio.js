/* MateMonstruos · audio sintetizado (WebAudio). Sin archivos externos. */
(function (G) {
'use strict';
let ctx = null, master = null, musicG = null, sfxG = null, noiseBuf = null;
let muted = false, music = null, timer = null;
try { muted = localStorage.getItem('mm_muted') === '1'; } catch (e) {}

const mf = m => 440 * Math.pow(2, (m - 69) / 12);

function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp); comp.connect(ctx.destination);
  musicG = ctx.createGain(); musicG.gain.value = 0.22; musicG.connect(master);
  sfxG = ctx.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);
  const len = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
}

function tone(dest, f, t, dur, type, vol, slideTo, att) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.008));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
}
function noise(dest, t, dur, vol, fq, q) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = fq > 3000 ? 'highpass' : 'bandpass'; f.frequency.value = fq || 1500; f.Q.value = q || 0.8;
  const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
}

/* ---------- efectos ---------- */
const SFX = {
  click: t => tone(sfxG, 660, t, .07, 'square', .25, 880),
  move: t => tone(sfxG, 420, t, .05, 'triangle', .22),
  select: t => { tone(sfxG, 523, t, .08, 'square', .28); tone(sfxG, 784, t + .07, .12, 'square', .28); },
  correct: t => { [72, 76, 79, 84].forEach((m, i) => tone(sfxG, mf(m), t + i * .06, .16, 'square', .3)); tone(sfxG, mf(60), t, .3, 'triangle', .35); },
  combo: t => { [79, 83, 86, 91, 95].forEach((m, i) => tone(sfxG, mf(m), t + i * .05, .18, 'square', .28)); tone(sfxG, mf(67), t, .35, 'sawtooth', .18); },
  hit: t => { noise(sfxG, t, .18, .6, 900, 1); tone(sfxG, 220, t, .2, 'sawtooth', .35, 70); },
  wrong: t => { tone(sfxG, 196, t, .28, 'sawtooth', .35, 90); tone(sfxG, 147, t + .12, .35, 'square', .3, 60); noise(sfxG, t, .15, .3, 700, 1); },
  heart: t => { tone(sfxG, 330, t, .1, 'triangle', .4, 110); noise(sfxG, t, .12, .35, 4500); },
  heal: t => [72, 76, 79, 84, 88].forEach((m, i) => tone(sfxG, mf(m), t + i * .07, .22, 'triangle', .3)),
  boss: t => { tone(sfxG, 55, t, 1.4, 'sawtooth', .5, 40, .05); tone(sfxG, 82, t, 1.4, 'square', .25, 55, .05); noise(sfxG, t, 1.1, .25, 300, 1); [0, .35, .7].forEach(o => noise(sfxG, t + o, .15, .5, 200, 1)); },
  win: t => { [72, 72, 72, 76, 79, 76, 79, 84].forEach((m, i) => tone(sfxG, mf(m), t + i * .11, i === 7 ? .7 : .14, 'square', .3)); [48, 55, 60].forEach(m => tone(sfxG, mf(m), t + .8, .9, 'triangle', .35)); },
  lose: t => [67, 64, 61, 55].forEach((m, i) => tone(sfxG, mf(m), t + i * .22, .35, 'sawtooth', .3, mf(m) * .94)),
  crack: t => { noise(sfxG, t, .08, .7, 3000); noise(sfxG, t + .12, .08, .7, 3500); },
  hatch: t => { noise(sfxG, t, .35, .6, 2000); [76, 83, 88, 95].forEach((m, i) => tone(sfxG, mf(m), t + .1 + i * .06, .3, 'triangle', .3)); },
  evolve: t => { for (let i = 0; i < 14; i++) tone(sfxG, mf(60 + i * 2), t + i * .06, .2, 'square', .2); [84, 88, 91].forEach(m => tone(sfxG, mf(m), t + .95, .8, 'triangle', .35)); },
  capture: t => { [84, 88, 91, 96].forEach((m, i) => tone(sfxG, mf(m), t + i * .08, .25, 'triangle', .32)); noise(sfxG, t, .4, .25, 6000); },
  whoosh: t => { noise(sfxG, t, .3, .35, 1200, 2); tone(sfxG, 200, t, .3, 'sawtooth', .12, 900); }
};
function sfx(name) {
  if (muted) return; init(); if (!ctx || !SFX[name]) return;
  try { SFX[name](ctx.currentTime + 0.005); } catch (e) {}
}

/* ---------- música procedural ---------- */
// escalas: raíz MIDI, progresión [semitono raíz, calidad]
const WORLDS = {
  teide:       { root: 45, prog: [[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']], pent: [0, 3, 5, 7, 10] },
  atlantico:   { root: 50, prog: [[0, 'm'], [5, 'M'], [10, 'M'], [7, 'm']], pent: [0, 2, 5, 7, 9] },
  laurisilva:  { root: 43, prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']], pent: [0, 2, 4, 7, 9] },
  cosmos:      { root: 52, prog: [[0, 'm'], [3, 'M'], [8, 'M'], [7, 'M']], pent: [0, 3, 5, 7, 10] }
};
const TRACKS = { menu: { bpm: 104, drums: false, lead: .5 }, battle: { bpm: 132, drums: true, lead: .8 }, boss: { bpm: 156, drums: true, lead: 1, dark: true }, final: { bpm: 168, drums: true, lead: 1, dark: true } };

function startMusic(track, world) {
  init(); if (!ctx) return;
  stopMusic(true);
  const W = WORLDS[world] || WORLDS.teide, T = TRACKS[track] || TRACKS.battle;
  const r = G.Creature ? G.Creature.rng(Math.floor(Math.random() * 1e9)) : Math.random;
  // motivo de 8 notas que se repite con variación
  const motif = []; for (let i = 0; i < 8; i++) motif.push(r() < .2 ? null : W.pent[Math.floor(r() * 5)] + (r() < .35 ? 12 : 0));
  music = { W, T, step: 0, next: ctx.currentTime + .08, motif, world, track };
  const sixteenth = () => 60 / T.bpm / 4;
  const sched = () => {
    if (!music) return;
    while (music.next < ctx.currentTime + .18) {
      play(music, music.next); music.next += sixteenth(); music.step++;
    }
  };
  sched(); timer = setInterval(sched, 40);
}
function chordTones(root, q) { return q === 'm' ? [0, 3, 7, 12] : [0, 4, 7, 12]; }
function play(m, t) {
  const s = m.step % 64, bar = Math.floor(s / 16), st = s % 16;
  const [off, q] = m.W.prog[bar], base = m.W.root + off, tones = chordTones(base, q);
  const T = m.T, bassVol = T.dark ? .5 : .38;
  // bajo
  if (st % 4 === 0 || (T.drums && st % 8 === 6)) tone(musicG, mf(base - 12), t, .2, T.dark ? 'sawtooth' : 'triangle', bassVol);
  if (T.dark && st % 2 === 0) tone(musicG, mf(base - 12), t, .1, 'square', .18);
  // arpegio
  const ar = tones[(st * (T.dark ? 3 : 1)) % tones.length] + 12;
  if (st % 2 === 0 || T.dark) tone(musicG, mf(base + ar), t, .09, 'square', T.dark ? .12 : .1);
  // melodía
  if (st % 2 === 0 && Math.random() < T.lead) {
    const n = m.motif[(st / 2 + (bar % 2) * 4) % 8];
    if (n != null) tone(musicG, mf(m.W.root + 24 + n + (bar === 3 && st > 8 ? 2 : 0)), t, .22, 'square', .15, null, .01);
  }
  // percusión
  if (T.drums) {
    if (st % 4 === 0) { tone(musicG, 150, t, .14, 'sine', .8, 45); }
    if (st % 8 === 4) noise(musicG, t, .12, .45, 1800, .8);
    if (st % 2 === 1) noise(musicG, t, .04, .18, 7000);
    if (T.dark && st === 15) noise(musicG, t, .1, .35, 2500);
  } else if (st % 8 === 0) noise(musicG, t, .05, .1, 6000);
}
function stopMusic(quick) {
  if (timer) { clearInterval(timer); timer = null; }
  music = null;
}
function setMuted(v) {
  muted = !!v; try { localStorage.setItem('mm_muted', muted ? '1' : '0'); } catch (e) {}
  if (master) master.gain.setTargetAtTime(muted ? 0 : .9, ctx.currentTime, .02);
}
function duck(on) { if (musicG) musicG.gain.setTargetAtTime(on ? .06 : .22, ctx.currentTime, .05); }

G.MMAudio = { init, sfx, startMusic, stopMusic, setMuted, isMuted: () => muted, duck };
})(typeof window !== 'undefined' ? window : globalThis);
