// 監聽室音訊引擎 — 全站聲音 opt-in:POWER 未開,一個音都不出。
// 所有聲音為即時合成示意音(標注於圖例),不冒充任何作品原聲。
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let ctx = null;
let masterGain = null;
const channels = new Map(); // id -> { gain, analyser, voice, on, data }
let rafId = null;

const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];

function ensureCtx() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(ctx.destination);
  return ctx;
}

function makeNoiseBuffer(c) {
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // brown-ish
    d[i] = last * 3.5;
  }
  return buf;
}

function buildVoice(kind, chGain) {
  const c = ctx;
  const nodes = { stops: [] };
  if (kind === "xy") {
    const o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = PENTA[2];
    const o2 = c.createOscillator(); o2.type = "triangle"; o2.frequency.value = PENTA[2] * 2.003;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1200; f.Q.value = 4;
    const g = c.createGain(); g.gain.value = 0.5;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(chGain);
    o1.start(); o2.start();
    nodes.stops.push(o1, o2); nodes.osc = [o1, o2]; nodes.filter = f;
  } else if (kind === "pad") {
    const freqs = [110, 164.81];
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 640; f.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = 0.35;
    for (const fr of freqs) {
      const o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr;
      const o2 = c.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = fr * 1.006;
      o.connect(f); o2.connect(f); o.start(); o2.start();
      nodes.stops.push(o, o2);
    }
    const lfo = c.createOscillator(); lfo.frequency.value = 0.08;
    const lfoG = c.createGain(); lfoG.gain.value = 220;
    lfo.connect(lfoG); lfoG.connect(f.frequency); lfo.start();
    nodes.stops.push(lfo);
    f.connect(g); g.connect(chGain);
  } else { // field
    const src = c.createBufferSource(); src.buffer = makeNoiseBuffer(c); src.loop = true;
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 420; f.Q.value = 0.9;
    const g = c.createGain(); g.gain.value = 0.5;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = c.createGain(); lfoG.gain.value = 180;
    lfo.connect(lfoG); lfoG.connect(f.frequency);
    src.connect(f); f.connect(g); g.connect(chGain);
    src.start(); lfo.start();
    nodes.stops.push(src, lfo);
  }
  return nodes;
}

function stopVoice(ch) {
  if (!ch.voice) return;
  for (const n of ch.voice.stops) { try { n.stop(); } catch { /* already stopped */ } }
  ch.voice = null;
}

function setupChannel(strip) {
  const id = strip.dataset.voice;
  const gain = ctx.createGain();
  gain.gain.value = parseFloat(strip.dataset.gain ?? "0.7");
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  gain.connect(analyser); analyser.connect(masterGain);
  const ch = { gain, analyser, voice: null, on: false, strip, kind: id, buf: new Uint8Array(analyser.frequencyBinCount) };
  channels.set(strip, ch);
  return ch;
}

function meterLoop() {
  let any = false;
  for (const ch of channels.values()) {
    const meter = ch.strip.querySelector(".meter");
    if (!meter) continue;
    if (ch.on) {
      any = true;
      ch.analyser.getByteFrequencyData(ch.buf);
      let sum = 0;
      for (let i = 0; i < ch.buf.length; i++) sum += ch.buf[i];
      const lvl = Math.min(96, Math.round((sum / ch.buf.length) / 148 * 100 * (0.6 + ch.gain.gain.value * 0.6)));
      meter.style.setProperty("--level", lvl + "%");
    }
  }
  rafId = any ? requestAnimationFrame(meterLoop) : null;
}

function kickMeters() {
  if (rafId == null) rafId = requestAnimationFrame(meterLoop);
}

function powerOn() {
  ensureCtx();
  if (ctx.state === "suspended") ctx.resume();
  document.body.classList.add("powered");
  for (const b of document.querySelectorAll("[data-power]")) {
    b.setAttribute("aria-pressed", "true");
    const l = b.querySelector(".pw-label"); if (l) l.textContent = "POWER ON";
  }
}

function powerOff() {
  document.body.classList.remove("powered");
  for (const ch of channels.values()) { stopVoice(ch); ch.on = false; syncPlayBtn(ch); resetMeter(ch); }
  if (ctx && ctx.state === "running") ctx.suspend();
  for (const b of document.querySelectorAll("[data-power]")) {
    b.setAttribute("aria-pressed", "false");
    const l = b.querySelector(".pw-label"); if (l) l.textContent = "POWER";
  }
}

function resetMeter(ch) {
  const meter = ch.strip.querySelector(".meter");
  if (meter) meter.style.setProperty("--level", ch.strip.dataset.idle ?? "46%");
}

function syncPlayBtn(ch) {
  const btn = ch.strip.querySelector(".play-toggle");
  if (!btn) return;
  btn.setAttribute("aria-pressed", ch.on ? "true" : "false");
  btn.textContent = ch.on ? "■ 靜音" : "▶ 發聲";
}

function toggleChannel(strip) {
  if (!document.body.classList.contains("powered")) powerOn();
  let ch = channels.get(strip) ?? setupChannel(strip);
  if (ch.on) { stopVoice(ch); ch.on = false; resetMeter(ch); }
  else { ch.voice = buildVoice(ch.kind, ch.gain); ch.on = true; kickMeters(); }
  syncPlayBtn(ch);
}

function bindFader(strip) {
  const fader = strip.querySelector(".fader");
  if (!fader) return;
  const onMove = (e) => {
    const r = fader.getBoundingClientRect();
    const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
    const pos = y / r.height;
    fader.style.setProperty("--fpos", Math.round(pos * 86) + "%");
    const ch = channels.get(strip);
    if (ch) ch.gain.gain.setTargetAtTime(1 - pos, ctx.currentTime, 0.02);
  };
  fader.addEventListener("pointerdown", (e) => {
    fader.setPointerCapture(e.pointerId);
    onMove(e);
    const mv = (ev) => onMove(ev);
    const up = () => { fader.removeEventListener("pointermove", mv); fader.removeEventListener("pointerup", up); };
    fader.addEventListener("pointermove", mv);
    fader.addEventListener("pointerup", up);
  });
}

function bindXY(strip) {
  const pad = strip.querySelector(".xy-pad");
  if (!pad) return;
  const dot = pad.querySelector(".xy-dot");
  pad.addEventListener("pointermove", (e) => {
    const ch = channels.get(strip);
    const r = pad.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    if (dot) { dot.style.left = (x * 100) + "%"; dot.style.top = (y * 100) + "%"; }
    if (ch && ch.on && ch.voice && ch.voice.osc) {
      const f = PENTA[Math.min(PENTA.length - 1, Math.floor(x * PENTA.length))];
      ch.voice.osc[0].frequency.setTargetAtTime(f, ctx.currentTime, 0.03);
      ch.voice.osc[1].frequency.setTargetAtTime(f * 2.003, ctx.currentTime, 0.03);
      ch.voice.filter.frequency.setTargetAtTime(400 + (1 - y) * 2600, ctx.currentTime, 0.03);
    }
  });
}

function init() {
  for (const btn of document.querySelectorAll("[data-power]")) {
    btn.addEventListener("click", () => {
      const powered = document.body.classList.contains("powered");
      if (powered) powerOff(); else powerOn();
      if (btn.dataset.scroll) document.getElementById("console")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  for (const strip of document.querySelectorAll("[data-voice]")) {
    const btn = strip.querySelector(".play-toggle");
    if (btn) btn.addEventListener("click", () => toggleChannel(strip));
    bindFader(strip);
    bindXY(strip);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
