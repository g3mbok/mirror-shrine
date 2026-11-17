// All drawing: the shrine floor, the adept and mirror, guardians, bolts and reflected lances.

import { ENEMY, FIELD, MIRROR, PALETTE, PLAYER } from './config.js';

export function drawShrine(context, time) {
  const background = context.createRadialGradient(640, 360, 60, 640, 360, 820);
  background.addColorStop(0, '#142346');
  background.addColorStop(0.6, PALETTE.backdrop);
  background.addColorStop(1, '#04060f');
  context.fillStyle = background;
  context.fillRect(0, 0, FIELD.width, FIELD.height);

  context.save();
  context.translate(640, 372);
  context.strokeStyle = PALETTE.ring;
  context.lineWidth = 1.5;
  for (const radius of [120, 210, 300, 392]) {
    context.globalAlpha = radius === 300 ? 0.7 : 0.38;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 0.42;
  context.strokeStyle = PALETTE.rune;
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2 + time * 0.045;
    context.save();
    context.rotate(angle);
    context.beginPath();
    context.moveTo(304, 0);
    context.lineTo(330, 0);
    context.moveTo(316, -12);
    context.lineTo(316, 12);
    context.stroke();
    context.restore();
  }
  context.globalAlpha = 0.22;
  context.beginPath();
  context.arc(0, 0, 62 + Math.sin(time * 1.1) * 4, 0, Math.PI * 2);
  context.stroke();
  context.restore();
  context.globalAlpha = 1;
}

export function drawVignette(context) {
  const vignette = context.createRadialGradient(640, 360, 300, 640, 360, 830);
  vignette.addColorStop(0, 'rgba(4, 8, 18, 0)');
  vignette.addColorStop(1, 'rgba(2, 4, 12, 0.82)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, FIELD.width, FIELD.height);
  context.fillStyle = 'rgba(103, 242, 220, 0.05)';
  for (let y = 0; y < FIELD.height; y += 4) context.fillRect(0, y, FIELD.width, 1);
}

export function drawPlayer(context, player, time) {
  if (player.invulnerability > 0 && Math.floor(time * 18) % 2 === 0) return;

  if (player.guardHeld) {
    const perfect = player.guardTime <= MIRROR.perfectWindow;
    context.save();
    context.translate(player.x, player.y);
    context.rotate(player.angle);
    context.strokeStyle = perfect ? PALETTE.gold : PALETTE.teal;
    context.shadowColor = context.strokeStyle;
    context.shadowBlur = perfect ? 26 : 14;
    context.lineWidth = perfect ? 5 : 3;
    context.globalAlpha = perfect ? 0.95 : 0.6;
    context.beginPath();
    context.arc(0, 0, MIRROR.radius, -0.95, 0.95);
    context.stroke();
    context.globalAlpha = 0.3;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, MIRROR.radius + 9, -0.7, 0.7);
    context.stroke();
    if (perfect) {
      const sweep = 1 - player.guardTime / MIRROR.perfectWindow;
      context.globalAlpha = 0.9;
      context.strokeStyle = PALETTE.white;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0, 0, MIRROR.radius + 16, -0.95, -0.95 + sweep * 1.9);
      context.stroke();
    }
    context.restore();
  }

  if (player.dashTime > 0) {
    for (let i = 1; i <= 3; i += 1) {
      context.globalAlpha = 0.18 / i;
      context.fillStyle = PALETTE.violet;
      context.beginPath();
      context.arc(player.x - player.vx * 0.014 * i, player.y - player.vy * 0.014 * i, PLAYER.radius + i * 2, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  context.save();
  context.translate(player.x, player.y);
  context.rotate(player.angle + Math.PI / 2);
  context.shadowColor = PALETTE.teal;
  context.shadowBlur = 22;
  context.fillStyle = PALETTE.teal;
  context.beginPath();
  context.moveTo(0, -22);
  context.lineTo(17, 14);
  context.lineTo(0, 8);
  context.lineTo(-17, 14);
  context.closePath();
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = PALETTE.white;
  context.globalAlpha = 0.9;
  context.beginPath();
  context.arc(0, -4, 5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export function drawEnemy(context, enemy, time) {
  const colour = enemy.type === 'warden' ? PALETTE.violet
    : enemy.type === 'keeper' ? PALETTE.gold
      : enemy.type === 'weaver' ? PALETTE.coral : PALETTE.teal;
  const r = enemy.radius;

  context.save();
  context.translate(enemy.x, enemy.y);
  context.globalAlpha = 0.35;
  context.strokeStyle = colour;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, r + 8 + Math.sin(time * 3 + enemy.phase) * 2, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;
  context.rotate(enemy.spin);
  context.strokeStyle = enemy.hitFlash > 0 ? PALETTE.white : colour;
  context.fillStyle = enemy.hitFlash > 0 ? PALETTE.white : colour;
  context.shadowColor = colour;
  context.shadowBlur = 18 + enemy.charge * 30;
  context.lineWidth = 3;

  if (enemy.type === 'wisp') {
    diamond(context, r);
    context.fill();
  } else if (enemy.type === 'weaver') {
    triangle(context, r);
    context.stroke();
    context.rotate(-enemy.spin * 2.4);
    triangle(context, r * 0.55);
    context.fill();
  } else if (enemy.type === 'keeper') {
    context.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2;
      context.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    context.closePath();
    context.stroke();
    context.beginPath();
    context.arc(0, 0, r * 0.38, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = i % 2 === 0 ? r : r * 0.68;
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    context.closePath();
    context.stroke();
    context.beginPath();
    context.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    context.fill();
  }

  if (enemy.charge > 0) {
    context.globalAlpha = enemy.charge;
    context.strokeStyle = PALETTE.white;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(0, 0, r + 13, -Math.PI / 2, -Math.PI / 2 + enemy.charge * Math.PI * 2);
    context.stroke();
  }
  context.restore();

  if (enemy.type === 'warden') {
    context.save();
    context.fillStyle = 'rgba(5, 10, 22, 0.8)';
    context.fillRect(enemy.x - 52, enemy.y - r - 22, 104, 8);
    context.fillStyle = PALETTE.violet;
    context.fillRect(enemy.x - 50, enemy.y - r - 20, 100 * Math.max(0, enemy.hp / enemy.maxHp), 4);
    context.restore();
  }
}

export function drawBolt(context, bolt) {
  context.save();
  context.globalCompositeOperation = 'lighter';
  for (let i = 0; i < bolt.trail.length; i += 1) {
    const point = bolt.trail[i];
    context.globalAlpha = ((i + 1) / bolt.trail.length) * 0.36;
    context.fillStyle = bolt.colour;
    context.beginPath();
    context.arc(point.x, point.y, bolt.radius * (i / bolt.trail.length) * 0.9, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  context.shadowColor = bolt.colour;
  context.shadowBlur = 22;
  context.fillStyle = bolt.colour;
  context.beginPath();
  context.arc(bolt.x, bolt.y, bolt.radius, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = PALETTE.white;
  context.beginPath();
  context.arc(bolt.x - 2, bolt.y - 2, 2.4, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export function drawLance(context, lance) {
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.strokeStyle = lance.colour;
  context.shadowColor = lance.colour;
  context.shadowBlur = 24;
  for (let i = 1; i < lance.trail.length; i += 1) {
    const from = lance.trail[i - 1];
    const to = lance.trail[i];
    context.globalAlpha = (i / lance.trail.length) * 0.7;
    context.lineWidth = 2 + (i / lance.trail.length) * 8;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }
  context.globalAlpha = 1;
  context.translate(lance.x, lance.y);
  context.rotate(Math.atan2(lance.vy, lance.vx));
  context.fillStyle = PALETTE.white;
  context.beginPath();
  context.moveTo(20, 0);
  context.lineTo(-12, 7);
  context.lineTo(-6, 0);
  context.lineTo(-12, -7);
  context.closePath();
  context.fill();
  context.restore();
}

export function drawEntities(context, game, time) {
  for (const enemy of game.enemies) drawEnemy(context, enemy, time);
  for (const bolt of game.bolts) drawBolt(context, bolt);
  for (const lance of game.lances) drawLance(context, lance);
  drawPlayer(context, game.player, time);
  game.effects.draw(context, time);
}

function diamond(context, r) {
  context.beginPath();
  context.moveTo(0, -r);
  context.lineTo(r, 0);
  context.lineTo(0, r);
  context.lineTo(-r, 0);
  context.closePath();
}

function triangle(context, r) {
  context.beginPath();
  context.moveTo(0, -r);
  context.lineTo(r, r * 0.8);
  context.lineTo(-r, r * 0.8);
  context.closePath();
}

export { ENEMY, PALETTE };
