// Actors and their behaviour: the adept, the shrine's guardians, incoming bolts and reflected lances.

import { BOLT, ENEMY, FIELD, FOCUS, LANCE, MIRROR, PALETTE, PLAYER } from './config.js';

export function createPlayer(x = FIELD.width / 2, y = FIELD.height * 0.68) {
  return {
    x, y, radius: PLAYER.radius,
    vx: 0, vy: 0,
    hearts: PLAYER.maxHearts,
    invulnerability: 0,
    dashTime: 0,
    dashCooldown: 0,
    guardHeld: false,
    guardTime: 0,
    angle: -Math.PI / 2,
    flash: 0,
  };
}

export function updatePlayer(player, input, dt, game) {
  player.invulnerability = Math.max(0, player.invulnerability - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.flash = Math.max(0, player.flash - dt);

  const risingGuard = input.guard && !player.guardHeld;
  player.guardHeld = input.guard;
  player.guardTime = input.guard ? player.guardTime + dt : 0;

  if (input.dash && player.dashCooldown <= 0 && player.dashTime <= 0) {
    player.dashTime = PLAYER.dashDuration;
    player.dashCooldown = PLAYER.dashCooldown;
    let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    if (dx === 0 && dy === 0) {
      dx = Math.cos(player.angle);
      dy = Math.sin(player.angle);
    }
    const length = Math.hypot(dx, dy) || 1;
    player.vx = (dx / length) * PLAYER.dashSpeed;
    player.vy = (dy / length) * PLAYER.dashSpeed;
    game.effects.ring(player.x, player.y, PALETTE.violet, 12, 80, 0.3, 2);
    game.audio.dash();
  }

  if (player.dashTime > 0) {
    player.dashTime -= dt;
  } else {
    let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const length = Math.hypot(dx, dy) || 1;
    const speed = PLAYER.speed * (input.guard ? PLAYER.guardSpeedScale : 1);
    player.vx = (dx / length) * speed;
    player.vy = (dy / length) * speed;
  }

  player.x = clamp(player.x + player.vx * dt, 38, FIELD.width - 38);
  player.y = clamp(player.y + player.vy * dt, 92, FIELD.height - 40);
  player.angle = Math.atan2(input.pointer.y - player.y, input.pointer.x - player.x);

  if (risingGuard) {
    game.effects.ring(player.x, player.y, PALETTE.teal, MIRROR.radius - 8, MIRROR.radius + 6, 0.26, 2);
  }
}

export function spawnEnemy(type, x, y, wave, random) {
  const spec = ENEMY[type];
  return {
    type, x, y,
    vx: 0, vy: 0,
    hp: spec.hp + (type === 'warden' ? Math.floor(wave / 5) * 2 : 0),
    maxHp: spec.hp + (type === 'warden' ? Math.floor(wave / 5) * 2 : 0),
    radius: spec.radius,
    fireTimer: random.range(0.7, 1.9),
    charge: 0,
    hitFlash: 0,
    phase: random.range(0, Math.PI * 2),
    score: spec.score,
    spin: 0,
  };
}

export function updateEnemy(enemy, dt, game) {
  const spec = ENEMY[enemy.type];
  const player = game.player;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.hypot(dx, dy) || 1;
  enemy.phase += dt;
  enemy.spin += dt * (enemy.type === 'keeper' ? 0.7 : 1.6);
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

  switch (enemy.type) {
    case 'wisp': {
      const desired = distance > 330 ? 1 : distance < 240 ? -0.8 : 0;
      enemy.vx = (dx / distance) * spec.speed * desired + Math.cos(enemy.phase * 1.7) * 34;
      enemy.vy = (dy / distance) * spec.speed * desired + Math.sin(enemy.phase * 1.3) * 34;
      break;
    }
    case 'weaver': {
      const tangent = Math.sin(enemy.phase * 2.3) > 0 ? 1 : -1;
      enemy.vx = (dx / distance) * spec.speed * 0.55 + (-dy / distance) * spec.speed * tangent;
      enemy.vy = (dy / distance) * spec.speed * 0.55 + (dx / distance) * spec.speed * tangent;
      break;
    }
    case 'keeper':
      enemy.vx = Math.cos(enemy.phase * 0.8) * spec.speed;
      enemy.vy = Math.sin(enemy.phase * 0.6) * spec.speed * 0.6;
      break;
    case 'warden':
      enemy.vx = (dx / distance) * spec.speed + Math.cos(enemy.phase * 0.5) * 22;
      enemy.vy = (dy / distance) * spec.speed * 0.45;
      break;
    default:
      break;
  }

  enemy.x = clamp(enemy.x + enemy.vx * dt, 44, FIELD.width - 44);
  enemy.y = clamp(enemy.y + enemy.vy * dt, 110, FIELD.height - 50);

  enemy.fireTimer -= dt;
  if (enemy.fireTimer <= 0.46) enemy.charge = Math.min(1, (0.46 - enemy.fireTimer) / 0.46);
  if (enemy.fireTimer <= 0) {
    fireEnemy(enemy, game, dx / distance, dy / distance);
    enemy.fireTimer = spec.fireInterval * game.random.range(0.86, 1.14);
    enemy.charge = 0;
  }
}

function fireEnemy(enemy, game, aimX, aimY) {
  const colour = enemy.type === 'warden' ? PALETTE.violet
    : enemy.type === 'keeper' ? PALETTE.gold
      : enemy.type === 'weaver' ? PALETTE.coral : PALETTE.teal;
  const speed = BOLT.speed * (enemy.type === 'warden' ? 0.86 : 1);

  if (enemy.type === 'keeper') {
    const count = 8;
    for (let i = 0; i < count; i += 1) {
      const angle = enemy.spin + (i / count) * Math.PI * 2;
      game.bolts.push(createBolt(enemy.x, enemy.y, Math.cos(angle) * speed, Math.sin(angle) * speed, colour));
    }
  } else if (enemy.type === 'warden') {
    for (let i = 0; i < 12; i += 1) {
      const angle = enemy.spin * 1.7 + (i / 12) * Math.PI * 2;
      game.bolts.push(createBolt(enemy.x, enemy.y, Math.cos(angle) * speed * 0.8, Math.sin(angle) * speed * 0.8, colour));
    }
    for (const spread of [-0.16, 0, 0.16]) {
      const angle = Math.atan2(aimY, aimX) + spread;
      game.bolts.push(createBolt(enemy.x, enemy.y, Math.cos(angle) * speed * 1.2, Math.sin(angle) * speed * 1.2, PALETTE.coral));
    }
  } else if (enemy.type === 'weaver') {
    for (const spread of [-0.22, 0, 0.22]) {
      const angle = Math.atan2(aimY, aimX) + spread;
      game.bolts.push(createBolt(enemy.x, enemy.y, Math.cos(angle) * speed * 1.08, Math.sin(angle) * speed * 1.08, colour));
    }
  } else {
    game.bolts.push(createBolt(enemy.x, enemy.y, aimX * speed, aimY * speed, colour));
  }
  game.audio.shoot();
}

export function createBolt(x, y, vx, vy, colour) {
  return { x, y, vx, vy, colour, radius: BOLT.radius, life: BOLT.life, trail: [] };
}

export function updateBolt(bolt, dt) {
  bolt.trail.push({ x: bolt.x, y: bolt.y });
  if (bolt.trail.length > 6) bolt.trail.shift();
  bolt.x += bolt.vx * dt;
  bolt.y += bolt.vy * dt;
  bolt.life -= dt;
  return bolt.life > 0 && bolt.x > -40 && bolt.x < FIELD.width + 40 && bolt.y > -40 && bolt.y < FIELD.height + 40;
}

export function createLance(x, y, angle, combo, colour = PALETTE.teal) {
  return {
    x, y,
    vx: Math.cos(angle) * LANCE.speed,
    vy: Math.sin(angle) * LANCE.speed,
    radius: LANCE.radius,
    life: LANCE.life,
    colour,
    combo,
    trail: [],
  };
}

export function updateLance(lance, dt, enemies) {
  let target = null;
  let nearest = Infinity;
  for (const enemy of enemies) {
    const distance = (enemy.x - lance.x) ** 2 + (enemy.y - lance.y) ** 2;
    if (distance < nearest) {
      nearest = distance;
      target = enemy;
    }
  }
  if (target) {
    const desired = Math.atan2(target.y - lance.y, target.x - lance.x);
    const current = Math.atan2(lance.vy, lance.vx);
    const turn = wrapAngle(desired - current);
    const limited = clamp(turn, -LANCE.turnRate * dt, LANCE.turnRate * dt);
    const angle = current + limited;
    lance.vx = Math.cos(angle) * LANCE.speed;
    lance.vy = Math.sin(angle) * LANCE.speed;
  }
  lance.trail.push({ x: lance.x, y: lance.y });
  if (lance.trail.length > 9) lance.trail.shift();
  lance.x += lance.vx * dt;
  lance.y += lance.vy * dt;
  lance.life -= dt;
  return lance.life > 0 && lance.x > -60 && lance.x < FIELD.width + 60 && lance.y > -60 && lance.y < FIELD.height + 60;
}

export function nearestEnemy(enemies, x, y, maxDistance = Infinity) {
  let best = null;
  let nearest = maxDistance * maxDistance;
  for (const enemy of enemies) {
    const distance = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
    if (distance < nearest) {
      nearest = distance;
      best = enemy;
    }
  }
  return best;
}

export function applyBurst(game) {
  for (let i = game.bolts.length - 1; i >= 0; i -= 1) {
    const bolt = game.bolts[i];
    game.effects.burst(bolt.x, bolt.y, PALETTE.gold, 4, 130, 0.3);
  }
  game.bolts.length = 0;
  for (const enemy of [...game.enemies]) {
    damageEnemy(enemy, FOCUS.burstDamage, game, true);
  }
  game.effects.ring(game.player.x, game.player.y, PALETTE.gold, 20, FOCUS.burstRadius, 0.65, 7);
  game.effects.ring(game.player.x, game.player.y, PALETTE.white, 10, 340, 0.4, 3);
  game.shake = Math.max(game.shake, 16);
  game.flash = Math.max(game.flash, 0.28);
  game.audio.burst();
}

export function damageEnemy(enemy, amount, game, fromBurst = false) {
  enemy.hp -= amount;
  enemy.hitFlash = 0.18;
  game.effects.spray(enemy.x, enemy.y, enemy.vx, enemy.vy, PALETTE.gold, fromBurst ? 4 : 7);
  if (enemy.hp <= 0) {
    game.enemies.splice(game.enemies.indexOf(enemy), 1);
    game.addScore(enemy.score);
    game.effects.burst(enemy.x, enemy.y, enemy.type === 'warden' ? PALETTE.violet : PALETTE.gold, enemy.type === 'warden' ? 40 : 18, 230, 0.8);
    game.effects.ring(enemy.x, enemy.y, PALETTE.gold, 8, enemy.radius * 4, 0.5, 3);
    game.shake = Math.max(game.shake, enemy.type === 'warden' ? 14 : 5);
    game.audio.kill();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}
