// Synthesised sound: no audio files, no network, just WebAudio voices created on demand.

const NOTES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

export function createAudio() {
  let context = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (context || muted) return context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0.24;
    master.connect(context.destination);
    return context;
  }

  function tone(frequency, duration, type, volume, delay = 0, endFrequency = null) {
    const ctx = ensure();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function noise(duration, volume, delay = 0) {
    const ctx = ensure();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(gain).connect(master);
    source.start(start);
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    setMuted(value) {
      muted = value;
      if (master) master.gain.value = value ? 0 : 0.24;
    },
    isMuted: () => muted,
    parry(combo) {
      const step = NOTES[Math.min(combo, NOTES.length - 1)];
      const base = 523.25 * Math.pow(2, step / 12);
      tone(base, 0.22, 'triangle', 0.34);
      tone(base * 1.5, 0.3, 'sine', 0.18, 0.015);
      tone(base * 2, 0.16, 'sine', 0.08, 0.03);
    },
    block() {
      tone(180, 0.13, 'sine', 0.16, 0, 120);
      noise(0.07, 0.05);
    },
    hurt() {
      tone(140, 0.34, 'sawtooth', 0.2, 0, 60);
      noise(0.24, 0.2);
    },
    shoot() {
      tone(410, 0.09, 'triangle', 0.045, 0, 260);
    },
    kill() {
      tone(320, 0.18, 'square', 0.07, 0, 140);
      noise(0.12, 0.07);
    },
    burst() {
      tone(160, 0.55, 'sawtooth', 0.22, 0, 880);
      tone(240, 0.7, 'sine', 0.14, 0.04, 1200);
      noise(0.45, 0.14, 0.02);
    },
    wave() {
      [0, 4, 7].forEach((step, index) => tone(392 * Math.pow(2, step / 12), 0.34, 'sine', 0.16, index * 0.08));
    },
    win() {
      [0, 4, 7, 12, 16].forEach((step, index) => tone(523.25 * Math.pow(2, step / 12), 0.6, 'triangle', 0.18, index * 0.13));
    },
    lose() {
      [0, -3, -7, -12].forEach((step, index) => tone(330 * Math.pow(2, step / 12), 0.5, 'sine', 0.16, index * 0.16));
    },
    dash() {
      noise(0.14, 0.07);
      tone(520, 0.12, 'sine', 0.06, 0, 900);
    },
  };
}
