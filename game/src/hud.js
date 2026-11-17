// HUD and full-screen states. Large, high-contrast type so the screenshots read when small.

import { BEST_KEY, FIELD, FOCUS, FONT, PALETTE, PLAYER, TIMING } from './config.js';
import { FINAL_WAVE, waveLabel } from './waves.js';

export function drawHud(context, game) {
  const { player } = game;

  context.save();
  context.fillStyle = PALETTE.panel;
  context.fillRect(0, 0, FIELD.width, 66);
  context.fillStyle = 'rgba(103, 242, 220, 0.5)';
  context.fillRect(0, 64, FIELD.width, 2);

  context.font = `700 15px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.fillText('SHRINE LIGHT', 32, 26);
  for (let i = 0; i < PLAYER.maxHearts; i += 1) {
    const x = 34 + i * 30;
    const alive = i < player.hearts;
    context.strokeStyle = alive ? PALETTE.coral : 'rgba(143, 165, 189, 0.35)';
    context.fillStyle = alive ? PALETTE.coral : 'transparent';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x + 9, 36);
    context.lineTo(x + 18, 45);
    context.lineTo(x + 9, 56);
    context.lineTo(x, 45);
    context.closePath();
    context.fill();
    context.stroke();
  }

  context.textAlign = 'center';
  context.font = `800 30px ${FONT}`;
  context.fillStyle = PALETTE.white;
  context.fillText(String(game.score).padStart(6, '0'), FIELD.width / 2, 43);
  context.font = `600 12px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.fillText('SCORE', FIELD.width / 2, 59);

  context.textAlign = 'right';
  context.font = `700 15px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.fillText(waveLabel(game.wave), FIELD.width - 32, 27);
  context.font = `700 13px ${FONT}`;
  context.fillStyle = PALETTE.gold;
  context.fillText(`GUARDIANS ${game.enemies.length}`, FIELD.width - 32, 48);
  context.textAlign = 'left';

  if (game.combo > 1) {
    context.textAlign = 'center';
    context.font = `900 ${Math.min(46, 26 + game.combo * 2)}px ${FONT}`;
    context.fillStyle = game.combo >= 8 ? PALETTE.gold : PALETTE.teal;
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 20;
    context.fillText(`PARRY ×${game.combo}`, FIELD.width / 2, 118);
    context.shadowBlur = 0;
    context.textAlign = 'left';
  }

  const barWidth = 320;
  const barX = (FIELD.width - barWidth) / 2;
  const barY = FIELD.height - 58;
  context.fillStyle = 'rgba(4, 10, 22, 0.85)';
  context.fillRect(barX - 12, barY - 20, barWidth + 24, 52);
  context.strokeStyle = 'rgba(103, 242, 220, 0.35)';
  context.lineWidth = 1;
  context.strokeRect(barX - 12, barY - 20, barWidth + 24, 52);
  context.fillStyle = PALETTE.muted;
  context.font = `700 12px ${FONT}`;
  context.fillText('REFLECTION', barX, barY - 5);
  context.textAlign = 'right';
  context.fillText(game.focus >= FOCUS.max ? 'READY — E / CLICK' : `${Math.floor(game.focus)}%`, barX + barWidth, barY - 5);
  context.textAlign = 'left';
  context.fillStyle = 'rgba(103, 242, 220, 0.14)';
  context.fillRect(barX, barY + 4, barWidth, 12);
  context.fillStyle = game.focus >= FOCUS.max ? PALETTE.gold : PALETTE.teal;
  context.shadowColor = context.fillStyle;
  context.shadowBlur = game.focus >= FOCUS.max ? 18 : 6;
  context.fillRect(barX, barY + 4, barWidth * (game.focus / FOCUS.max), 12);
  context.shadowBlur = 0;

  context.fillStyle = 'rgba(143, 165, 189, 0.8)';
  context.font = `600 12px ${FONT}`;
  context.fillText('WASD move   SPACE / RMB raise mirror   SHIFT dash   E release', 30, FIELD.height - 18);
  context.restore();
}

export function drawTitle(context, game, time) {
  context.save();
  context.textAlign = 'center';
  const pulse = 0.65 + 0.35 * Math.sin(time * 2.2);

  context.font = `800 18px ${FONT}`;
  context.fillStyle = PALETTE.teal;
  context.fillText('A PARRY ARENA BY AN AI AGENT', FIELD.width / 2, 148);

  context.font = `900 96px ${FONT}`;
  context.fillStyle = PALETTE.white;
  context.shadowColor = PALETTE.teal;
  context.shadowBlur = 36;
  context.fillText('MIRROR SHRINE', FIELD.width / 2, 256);
  context.shadowBlur = 0;

  context.font = `600 24px ${FONT}`;
  context.fillStyle = PALETTE.gold;
  context.fillText('Parry the light. Restore the shrine.', FIELD.width / 2, 306);

  const panelY = 356;
  context.fillStyle = 'rgba(6, 13, 28, 0.9)';
  context.fillRect(340, panelY, 600, 188);
  context.strokeStyle = 'rgba(103, 242, 220, 0.32)';
  context.lineWidth = 2;
  context.strokeRect(340, panelY, 600, 188);

  context.font = `600 18px ${FONT}`;
  context.fillStyle = PALETTE.white;
  context.fillText('Raise your mirror just before a bolt lands.', FIELD.width / 2, panelY + 42);
  context.fillStyle = PALETTE.muted;
  context.font = `500 16px ${FONT}`;
  context.fillText('A perfect parry sends back a homing lance.', FIELD.width / 2, panelY + 76);
  context.fillText('Hold too early and you only block. Fill REFLECTION', FIELD.width / 2, panelY + 104);
  context.fillText('then press E to shatter every bolt on screen.', FIELD.width / 2, panelY + 130);
  context.fillStyle = PALETTE.violet;
  context.fillText('Ten waves. Two wardens. Three hearts.', FIELD.width / 2, panelY + 158);

  context.globalAlpha = pulse;
  context.font = `800 26px ${FONT}`;
  context.fillStyle = PALETTE.teal;
  context.fillText('PRESS ENTER TO BEGIN', FIELD.width / 2, 616);
  context.globalAlpha = 1;

  context.font = `600 14px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.fillText(`BEST  ${String(game.best).padStart(6, '0')}`, FIELD.width / 2, 670);
  context.restore();
}

export function drawInterlude(context, game, time) {
  context.save();
  context.textAlign = 'center';
  context.fillStyle = 'rgba(4, 10, 22, 0.72)';
  context.fillRect(0, 240, FIELD.width, 230);
  context.font = `900 68px ${FONT}`;
  context.fillStyle = PALETTE.gold;
  context.shadowColor = PALETTE.gold;
  context.shadowBlur = 30;
  context.fillText('WAVE CLEAR', FIELD.width / 2, 330);
  context.shadowBlur = 0;
  context.font = `700 22px ${FONT}`;
  context.fillStyle = PALETTE.white;
  context.fillText(`${waveLabel(game.wave)}  ·  BONUS +${game.lastBonus}`, FIELD.width / 2, 380);
  context.globalAlpha = 0.6 + 0.4 * Math.sin(time * 5);
  context.fillStyle = PALETTE.teal;
  context.fillText(game.wave === FINAL_WAVE ? 'THE SHRINE IS QUIET…' : 'STEADY YOUR MIRROR', FIELD.width / 2, 424);
  context.restore();
}

export function drawEndScreen(context, game, time, won) {
  context.save();
  context.textAlign = 'center';
  context.fillStyle = 'rgba(3, 7, 18, 0.86)';
  context.fillRect(0, 0, FIELD.width, FIELD.height);

  context.font = `800 17px ${FONT}`;
  context.fillStyle = won ? PALETTE.gold : PALETTE.coral;
  context.fillText(won ? 'THE SHRINE ANSWERS' : 'THE LIGHT FADES', FIELD.width / 2, 146);

  context.font = `900 78px ${FONT}`;
  context.fillStyle = PALETTE.white;
  context.shadowColor = won ? PALETTE.gold : PALETTE.coral;
  context.shadowBlur = 32;
  context.fillText(won ? 'SHRINE RESTORED' : 'MIRROR SHATTERED', FIELD.width / 2, 236);
  context.shadowBlur = 0;

  context.font = `700 20px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.fillText(won ? 'You turned every bolt back into dawn.' : `You fell on ${waveLabel(game.wave)}.`, FIELD.width / 2, 282);

  context.fillStyle = 'rgba(8, 16, 32, 0.92)';
  context.fillRect(370, 324, 540, 170);
  context.strokeStyle = won ? 'rgba(255, 212, 121, 0.5)' : 'rgba(255, 125, 137, 0.4)';
  context.lineWidth = 2;
  context.strokeRect(370, 324, 540, 170);

  context.font = `600 17px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.fillText('SCORE', 500, 366);
  context.fillText('WAVE', 640, 366);
  context.fillText('BEST PARRY', 790, 366);
  context.font = `800 40px ${FONT}`;
  context.fillStyle = PALETTE.white;
  context.fillText(String(game.score), 500, 420);
  context.fillText(String(game.wave).padStart(2, '0'), 640, 420);
  context.fillText(`×${game.bestCombo}`, 790, 420);
  context.font = `700 16px ${FONT}`;
  context.fillStyle = game.score >= game.best ? PALETTE.gold : PALETTE.muted;
  context.fillText(game.score >= game.best ? 'NEW PERSONAL BEST' : `BEST ${game.best}`, FIELD.width / 2, 466);

  context.globalAlpha = 0.6 + 0.4 * Math.sin(time * 3);
  context.font = `800 24px ${FONT}`;
  context.fillStyle = PALETTE.teal;
  context.fillText('PRESS ENTER TO PLAY AGAIN', FIELD.width / 2, 560);
  context.restore();
}

export function drawPauseHint(context, game) {
  if (!game.audio.isMuted()) return;
  context.save();
  context.font = `600 13px ${FONT}`;
  context.fillStyle = PALETTE.muted;
  context.textAlign = 'right';
  context.fillText('MUTED — M to restore sound', FIELD.width - 26, FIELD.height - 18);
  context.restore();
}

export { TIMING, BEST_KEY };
