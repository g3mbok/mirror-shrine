// The game's state machine: title, waves, parry resolution, reflection burst and results.

import { BEST_KEY, FOCUS, MIRROR, PALETTE, TIMING, PLAYER } from './config.js';
import { createRandom } from './random.js';
import { createEffects } from './effects.js';
import { createAudio } from './audio.js';
import { createPlayer, updatePlayer, updateEnemy, updateBolt, createBolt, createLance, updateLance, applyBurst, damageEnemy } from './entities.js';
import { spawnWave, FINAL_WAVE } from './waves.js';

export function createGame() {
  const random = createRandom(20261117);
  const effects = createEffects();
  const audio = createAudio();
  effects.seedDust(random);

  const game = {
    random, effects, audio,
    state: 'title',
    player: createPlayer(),
    enemies: [],
    bolts: [],
    lances: [],
    score: 0,
    combo: 0,
    bestCombo: 0,
    focus: 0,
    wave: 1,
    best: readBest(),
    lastBonus: 0,
    shake: 0,
    flash: 0,
    hitstop: 0,
    slowmo: 0,
    time: 0,
    interludeTimer: 0,
    frozen: false,
    addScore(points) {
      game.score += points;
      if (game.score > game.best) {
        game.best = game.score;
        writeBest(game.best);
      }
    },
    startRun() {
      game.state = 'playing';
      game.player = createPlayer();
      game.enemies.length = 0;
      game.bolts.length = 0;
      game.lances.length = 0;
      effects.clear();
      game.score = 0;
      game.combo = 0;
      game.bestCombo = 0;
      game.focus = 0;
      game.wave = 1;
      game.shake = 0;
      game.flash = 0;
      spawnWave(1, game);
      audio.wave();
    },
    step(dt, input) {
      game.time += dt;
      if (game.frozen) return;
      game.shake = Math.max(0, game.shake - dt * 34);
      game.flash = Math.max(0, game.flash - dt * 2.4);

      if (game.state === 'title') {
        if (input.start) game.startRun();
        effects.update(dt);
        return;
      }
      if (game.state === 'gameover' || game.state === 'victory') {
        if (input.restart) game.startRun();
        effects.update(dt);
        return;
      }
      if (game.state === 'interlude') {
        game.interludeTimer -= dt;
        effects.update(dt);
        if (game.interludeTimer <= 0) {
          game.wave += 1;
          spawnWave(game.wave, game);
          game.state = 'playing';
          audio.wave();
        }
        return;
      }

      if (input.mute) {
        audio.setMuted(!audio.isMuted());
      }

      if (game.hitstop > 0) {
        game.hitstop -= dt;
        effects.update(dt * 0.25);
        return;
      }
      const scale = game.slowmo > 0 ? 0.38 : 1;
      game.slowmo = Math.max(0, game.slowmo - dt);
      const stepDt = dt * scale;

      updatePlayer(game.player, input, stepDt, game);

      if (input.burst && game.focus >= FOCUS.max) {
        applyBurst(game);
        game.focus = 0;
      }

      for (const enemy of [...game.enemies]) updateEnemy(enemy, stepDt, game);
      resolveCollisions(stepDt, game);
      effects.update(stepDt);

      if (game.state === 'playing' && game.enemies.length === 0) {
        game.lastBonus = game.wave * 50;
        game.addScore(game.lastBonus);
        game.focus = Math.min(FOCUS.max, game.focus + 12);
        game.interludeTimer = TIMING.interlude;
        if (game.wave >= FINAL_WAVE) {
          game.state = 'victory';
          audio.win();
          effects.ring(640, 360, PALETTE.gold, 20, 900, 1.1, 8);
        } else {
          game.state = 'interlude';
          audio.wave();
        }
      }
    },
  };

  return game;
}

function resolveCollisions(dt, game) {
  const player = game.player;

  for (let i = game.bolts.length - 1; i >= 0; i -= 1) {
    const bolt = game.bolts[i];
    if (!updateBolt(bolt, dt)) {
      game.bolts.splice(i, 1);
      continue;
    }
    const distance = Math.hypot(bolt.x - player.x, bolt.y - player.y);

    if (player.guardHeld && distance < MIRROR.radius + bolt.radius) {
      game.bolts.splice(i, 1);
      if (player.guardTime <= MIRROR.perfectWindow) {
        parryBolt(bolt, game);
      } else {
        game.focus = Math.min(FOCUS.max, game.focus + MIRROR.blockFocus);
        game.combo = 0;
        game.effects.ring(bolt.x, bolt.y, PALETTE.teal, 4, 42, 0.3, 2);
        game.audio.block();
      }
      continue;
    }

    if (distance < player.radius + bolt.radius && player.invulnerability <= 0 && player.dashTime <= 0) {
      game.bolts.splice(i, 1);
      player.hearts -= 1;
      player.invulnerability = PLAYER.invulnerability;
      player.flash = 0.4;
      player.x -= (bolt.vx / Math.hypot(bolt.vx, bolt.vy)) * 26;
      player.y -= (bolt.vy / Math.hypot(bolt.vx, bolt.vy)) * 26;
      game.combo = 0;
      game.shake = Math.max(game.shake, 13);
      game.flash = Math.max(game.flash, 0.42);
      game.hitstop = TIMING.hitstopHit;
      game.effects.burst(bolt.x, bolt.y, PALETTE.coral, 22, 260, 0.7);
      game.effects.ring(player.x, player.y, PALETTE.coral, 8, 120, 0.5, 4);
      game.audio.hurt();
      if (player.hearts <= 0) {
        game.state = 'gameover';
        game.audio.lose();
      }
    }
  }

  for (let i = game.lances.length - 1; i >= 0; i -= 1) {
    const lance = game.lances[i];
    if (!updateLance(lance, dt, game.enemies)) {
      game.lances.splice(i, 1);
      continue;
    }
    for (const enemy of [...game.enemies]) {
      if (Math.hypot(lance.x - enemy.x, lance.y - enemy.y) < enemy.radius + lance.radius) {
        damageEnemy(enemy, 1, game);
        game.lances.splice(i, 1);
        game.effects.ring(lance.x, lance.y, lance.colour, 4, 60, 0.35, 3);
        break;
      }
    }
  }
}

function parryBolt(bolt, game) {
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  const multiplier = 1 + Math.floor(game.combo / 5);
  game.addScore(MIRROR.parryScore * multiplier);
  game.focus = Math.min(FOCUS.max, game.focus + MIRROR.parryFocus);
  game.hitstop = TIMING.hitstopParry;
  game.slowmo = TIMING.slowmoParry;
  game.shake = Math.max(game.shake, 7);
  game.flash = Math.max(game.flash, 0.14);
  const angle = Math.atan2(bolt.vy, bolt.vx) + Math.PI;
  game.lances.push(createLance(bolt.x, bolt.y, angle, game.combo, bolt.colour));
  game.effects.burst(bolt.x, bolt.y, PALETTE.white, 16, 300, 0.5);
  game.effects.ring(bolt.x, bolt.y, PALETTE.gold, 6, 96, 0.42, 4);
  game.audio.parry(game.combo);
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private browsing: the run still plays, the best score just isn't kept.
  }
}

/** Deterministic states used only for taking the entry's screenshots. */
export function applyScenario(game, name) {
  game.frozen = true;
  game.time = 3.4;
  game.best = Math.max(game.best, 4820);
  if (name === 'title') {
    game.state = 'title';
    return;
  }
  if (name === 'over') {
    game.state = 'gameover';
    game.wave = 7;
    game.score = 4820;
    game.bestCombo = 14;
    game.player.hearts = 0;
    return;
  }

  game.state = 'playing';
  game.wave = 4;
  game.player = createPlayer(640, 510);
  game.player.angle = -Math.PI / 2;
  game.score = 3180;
  game.combo = name === 'parry' ? 12 : 6;
  game.bestCombo = 14;
  game.focus = name === 'parry' ? 100 : 72;
  game.enemies.length = 0;
  game.bolts.length = 0;
  game.lances.length = 0;
  spawnWave(4, game);
  game.enemies = game.enemies.slice(0, 4);
  game.enemies[0].x = 420;
  game.enemies[0].y = 250;
  game.enemies[1].x = 880;
  game.enemies[1].y = 270;
  if (game.enemies[2]) {
    game.enemies[2].x = 250;
    game.enemies[2].y = 400;
  }
  if (game.enemies[3]) {
    game.enemies[3].x = 1020;
    game.enemies[3].y = 420;
  }

  if (name === 'parry') {
    game.player.guardHeld = true;
    game.player.guardTime = 0.1;
    game.bolts.push(createBolt(640, 452, 0, 240, PALETTE.gold));
    game.lances.push(createLance(600, 400, -0.6, 12, PALETTE.teal));
    game.lances.push(createLance(690, 390, 0.7, 12, PALETTE.coral));
    game.effects.burst(640, 450, PALETTE.white, 26, 260, 0.8);
    game.effects.ring(640, 450, PALETTE.gold, 8, 140, 0.7, 5);
    game.effects.ring(640, 510, PALETTE.teal, 10, 190, 0.7, 3);
    game.shake = 4;
    game.flash = 0.12;
  } else {
    game.bolts.push(createBolt(470, 330, 120, 170, PALETTE.teal));
    game.bolts.push(createBolt(830, 340, -130, 160, PALETTE.gold));
    game.bolts.push(createBolt(640, 190, 40, 190, PALETTE.coral));
    game.lances.push(createLance(560, 350, -0.7, 6, PALETTE.teal));
    game.effects.burst(880, 270, PALETTE.gold, 12, 160, 0.7);
  }
}
