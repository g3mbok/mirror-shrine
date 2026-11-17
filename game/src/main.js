// Bootstrap: canvas scaling, fixed-step loop and the render pass. Browser entrypoint.

import { FIELD, FONT, PALETTE, STEP } from './config.js';
import { createInput } from './input.js';
import { createGame, applyScenario } from './game.js';
import { drawShrine, drawVignette, drawEntities } from './render.js';
import { drawHud, drawTitle, drawInterlude, drawEndScreen, drawPauseHint } from './hud.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const context = canvas.getContext('2d', { alpha: false });
const game = createGame();
const view = { scale: 1, offsetX: 0, offsetY: 0 };

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  view.scale = Math.min(width / FIELD.width, height / FIELD.height) * ratio;
  view.offsetX = (canvas.width - FIELD.width * view.scale) / 2;
  view.offsetY = (canvas.height - FIELD.height * view.scale) / 2;
}

function toField(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) * (canvas.width / rect.width) - view.offsetX) / view.scale,
    y: ((clientY - rect.top) * (canvas.height / rect.height) - view.offsetY) / view.scale,
  };
}

const input = createInput(canvas, toField);
window.addEventListener('resize', resize);
resize();

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) applyScenario(game, shot);

window.addEventListener('keydown', () => game.audio.unlock(), { once: true });
canvas.addEventListener('pointerdown', () => game.audio.unlock(), { once: true });

let previous = performance.now();
let accumulator = 0;

function frame(now) {
  const elapsed = Math.min(0.1, (now - previous) / 1000);
  previous = now;
  accumulator += elapsed;
  const controls = input.sample();
  while (accumulator >= STEP) {
    game.step(STEP, controls);
    input.endStep();
    accumulator -= STEP;
  }
  render();
  requestAnimationFrame(frame);
}

function render() {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = '#03060e';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.setTransform(view.scale, 0, 0, view.scale, view.offsetX, view.offsetY);
  context.beginPath();
  context.rect(0, 0, FIELD.width, FIELD.height);
  context.clip();

  drawShrine(context, game.time);
  context.save();
  if (game.shake > 0) {
    context.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }
  drawEntities(context, game, game.time);
  context.restore();
  drawVignette(context);

  if (game.state === 'playing' || game.state === 'interlude') drawHud(context, game);
  if (game.state === 'title') drawTitle(context, game, game.time);
  if (game.state === 'interlude') drawInterlude(context, game, game.time);
  if (game.state === 'gameover' || game.state === 'victory') {
    drawHud(context, game);
    drawEndScreen(context, game, game.time, game.state === 'victory');
  }
  drawPauseHint(context, game);

  if (game.flash > 0) {
    context.fillStyle = `rgba(244, 251, 255, ${Math.min(0.6, game.flash).toFixed(3)})`;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  const text = game.state === 'playing'
    ? `Wave ${game.wave}, ${game.player.hearts} hearts, score ${game.score}`
    : game.state;
  if (status.textContent !== text) status.textContent = text;
}

requestAnimationFrame(frame);

window.mirrorShrine = {
  game,
  applyScenario(name) {
    applyScenario(game, name);
    render();
  },
  resume() {
    game.frozen = false;
  },
  inject: (code) => input.inject(code),
  info: { field: FIELD, font: FONT, palette: PALETTE },
};
