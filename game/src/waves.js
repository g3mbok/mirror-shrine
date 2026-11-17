// Wave composition and spawn placement. guardians never appear on top of the adept.

import { ENEMY, FIELD, WAVES } from './config.js';
import { spawnEnemy } from './entities.js';

export const FINAL_WAVE = WAVES.length;

export function spawnWave(waveNumber, game) {
  const plan = WAVES[Math.min(waveNumber - 1, WAVES.length - 1)];
  const types = [];
  for (const [type, count] of Object.entries(plan)) {
    for (let i = 0; i < count; i += 1) types.push(type);
  }

  for (let index = 0; index < types.length; index += 1) {
    const type = types[index];
    const radius = ENEMY[type].radius;
    let x = 0;
    let y = 0;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      x = game.random.range(90, FIELD.width - 90);
      y = game.random.range(140, FIELD.height * 0.62);
      if (Math.hypot(x - game.player.x, y - game.player.y) > 240) break;
    }
    game.enemies.push(spawnEnemy(type, x, y, waveNumber, game.random));
  }

  const extra = Math.max(0, waveNumber - WAVES.length) * 2;
  for (let i = 0; i < extra; i += 1) {
    game.enemies.push(spawnEnemy('weaver', game.random.range(90, FIELD.width - 90), game.random.range(140, 420), waveNumber, game.random));
  }
}

export function waveLabel(waveNumber) {
  return waveNumber === FINAL_WAVE ? 'FINAL WAVE' : `WAVE ${String(waveNumber).padStart(2, '0')}`;
}
