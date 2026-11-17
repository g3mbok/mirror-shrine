// Every tuning number, colour and label for Mirror Shrine lives here.
// The simulation uses a fixed 1280x720 logical field; the renderer scales it to the window.

export const FIELD = { width: 1280, height: 720 };

/** Fixed simulation step: 60 updates per second, independent of the display's refresh rate. */
export const STEP = 1 / 60;

export const PLAYER = {
  radius: 17,
  speed: 330,
  guardSpeedScale: 0.42,
  maxHearts: 3,
  invulnerability: 1.15,
  dashSpeed: 940,
  dashDuration: 0.16,
  dashCooldown: 1.25,
};

export const MIRROR = {
  radius: 66,
  perfectWindow: 0.24,
  blockFocus: 6,
  parryFocus: 18,
  parryScore: 25,
};

export const FOCUS = {
  max: 100,
  burstDamage: 2,
  burstRadius: 640,
};

export const BOLT = { radius: 8, speed: 235, life: 9 };
export const LANCE = { radius: 9, speed: 810, life: 3.2, turnRate: 5.6, damage: 1 };

export const ENEMY = {
  wisp: { hp: 2, radius: 18, speed: 74, fireInterval: 2.35, score: 100 },
  weaver: { hp: 2, radius: 16, speed: 158, fireInterval: 2.8, score: 130 },
  keeper: { hp: 3, radius: 25, speed: 44, fireInterval: 3.5, score: 170 },
  warden: { hp: 18, radius: 46, speed: 36, fireInterval: 2.5, score: 1200 },
};

/** Waves 1..10; wave 5 and wave 10 bring the shrine warden. */
export const WAVES = [
  { wisp: 2 },
  { wisp: 2, weaver: 1 },
  { wisp: 2, keeper: 1 },
  { wisp: 2, weaver: 2 },
  { warden: 1, wisp: 1 },
  { wisp: 2, weaver: 2, keeper: 1 },
  { weaver: 3, keeper: 2 },
  { wisp: 3, weaver: 2, keeper: 2 },
  { weaver: 4, keeper: 3 },
  { warden: 1, weaver: 3, keeper: 2 },
];

export const TIMING = {
  interlude: 2.1,
  titlePulse: 1.6,
  hitstopParry: 0.075,
  hitstopHit: 0.11,
  slowmoParry: 0.14,
};

export const PALETTE = {
  backdrop: '#080d1b',
  floor: '#101a30',
  ring: '#1c3050',
  rune: '#2d5a7a',
  teal: '#67f2dc',
  gold: '#ffd479',
  coral: '#ff7d89',
  violet: '#b39bff',
  white: '#f4fbff',
  muted: '#8fa5bd',
  panel: 'rgba(9, 16, 32, 0.82)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'mirror-shrine.best';
