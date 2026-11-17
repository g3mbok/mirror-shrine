// Particles, expanding rings and floating dust. Everything is drawn from this one list.

import { PALETTE } from './config.js';

export function createEffects() {
  const sparks = [];
  const rings = [];
  const motes = [];

  function seedDust(random, count = 70) {
    motes.length = 0;
    for (let i = 0; i < count; i += 1) {
      motes.push({
        x: random.range(0, 1280),
        y: random.range(0, 720),
        size: random.range(0.6, 2.1),
        phase: random.range(0, Math.PI * 2),
        speed: random.range(4, 16),
        alpha: random.range(0.12, 0.42),
      });
    }
  }

  function burst(x, y, colour, count, speed, life = 0.6) {
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const velocity = speed * (0.45 + Math.random() * 0.8);
      sparks.push({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: life * (0.6 + Math.random() * 0.7),
        maxLife: life,
        colour,
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  function spray(x, y, vx, vy, colour, count = 5) {
    for (let i = 0; i < count; i += 1) {
      sparks.push({
        x, y,
        vx: vx * 0.25 + (Math.random() - 0.5) * 220,
        vy: vy * 0.25 + (Math.random() - 0.5) * 220,
        life: 0.28 + Math.random() * 0.32,
        maxLife: 0.6,
        colour,
        size: 1.2 + Math.random() * 2,
      });
    }
  }

  function ring(x, y, colour, from, to, life, width = 3) {
    rings.push({ x, y, colour, from, to, life, maxLife: life, width });
  }

  function update(dt) {
    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= 1 - 2.2 * dt;
      spark.vy *= 1 - 2.2 * dt;
      spark.life -= dt;
      if (spark.life <= 0) sparks.splice(i, 1);
    }
    for (let i = rings.length - 1; i >= 0; i -= 1) {
      rings[i].life -= dt;
      if (rings[i].life <= 0) rings.splice(i, 1);
    }
    for (const mote of motes) {
      mote.y -= mote.speed * dt;
      if (mote.y < -4) {
        mote.y = 724;
        mote.x = Math.random() * 1280;
      }
    }
  }

  function draw(context, time) {
    context.save();
    context.globalCompositeOperation = 'lighter';
    for (const mote of motes) {
      const alpha = mote.alpha * (0.6 + 0.4 * Math.sin(time * 1.6 + mote.phase));
      context.fillStyle = `rgba(103, 242, 220, ${alpha.toFixed(3)})`;
      context.fillRect(mote.x, mote.y, mote.size, mote.size);
    }
    for (const spark of sparks) {
      const fade = Math.max(0, spark.life / spark.maxLife);
      context.globalAlpha = fade;
      context.fillStyle = spark.colour;
      context.shadowColor = spark.colour;
      context.shadowBlur = 10;
      context.beginPath();
      context.arc(spark.x, spark.y, spark.size * (0.4 + fade * 0.6), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    for (const ripple of rings) {
      const progress = 1 - ripple.life / ripple.maxLife;
      const radius = ripple.from + (ripple.to - ripple.from) * progress;
      context.globalAlpha = 1 - progress;
      context.strokeStyle = ripple.colour;
      context.lineWidth = ripple.width * (1 - progress * 0.6);
      context.shadowColor = ripple.colour;
      context.shadowBlur = 16;
      context.beginPath();
      context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }

  function clear() {
    sparks.length = 0;
    rings.length = 0;
  }

  return {
    seedDust, burst, spray, ring, update, draw, clear,
    sparkCount: () => sparks.length,
    ringCount: () => rings.length,
  };
}

export { PALETTE };
