// Procedural sound effects using Web Audio API
const Audio = {
  ctx: null,
  enabled: true,
  masterGain: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) { this.enabled = false; }
  },

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

  playTone(freq, duration, type = 'sine', vol = 0.5, slide = 0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq + slide), t + duration);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration);
  },

  playNoise(duration, vol = 0.5, filterFreq = 1000) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    src.connect(filter).connect(gain).connect(this.masterGain);
    src.start(t);
  },

  pop() { this.playTone(800 + Math.random()*400, 0.06, 'triangle', 0.3, -300); },
  bigPop() { this.playTone(200, 0.2, 'square', 0.5, -100); this.playNoise(0.15, 0.3, 2000); },
  boom() { this.playNoise(0.4, 0.6, 600); this.playTone(80, 0.3, 'sine', 0.4, -40); },
  shoot() { this.playTone(1200, 0.04, 'square', 0.15, -800); },
  laser() { this.playTone(2000, 0.08, 'sawtooth', 0.2, -1500); },
  freeze() { this.playTone(400, 0.3, 'sine', 0.3, 800); },
  build() { this.playTone(440, 0.08, 'sine', 0.3); setTimeout(() => this.playTone(660, 0.1, 'sine', 0.3), 80); },
  sell() { this.playTone(660, 0.08, 'sine', 0.3); setTimeout(() => this.playTone(330, 0.1, 'sine', 0.3), 80); },
  click() { this.playTone(880, 0.03, 'square', 0.1); },
  upgrade() {
    this.playTone(440, 0.08, 'sine', 0.3);
    setTimeout(() => this.playTone(550, 0.08, 'sine', 0.3), 60);
    setTimeout(() => this.playTone(660, 0.12, 'sine', 0.3), 120);
  },
  victory() {
    [440, 550, 660, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 0.2, 'triangle', 0.4), i * 120));
  },
  defeat() {
    [440, 370, 311, 220].forEach((f, i) => setTimeout(() => this.playTone(f, 0.3, 'sawtooth', 0.4), i * 150));
  },
  hit() { this.playTone(150, 0.05, 'sawtooth', 0.2); },
  cash() { this.playTone(1000, 0.05, 'sine', 0.2); setTimeout(() => this.playTone(1500, 0.05, 'sine', 0.2), 40); },
  roundStart() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => this.playTone(f, 0.15, 'triangle', 0.3), i * 80));
  }
};
