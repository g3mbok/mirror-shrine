// Keyboard and mouse state, collected once per frame and consumed by the simulation.

import { FIELD } from './config.js';

const MOVE_KEYS = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

export function createInput(canvas, toField) {
  const held = new Set();
  const pressed = new Set();
  const pointer = { x: FIELD.width / 2, y: FIELD.height / 2 };
  const state = {
    up: false, down: false, left: false, right: false,
    guard: false, dash: false, burst: false, pointer,
    restart: false, start: false, mute: false,
  };

  const onKeyDown = (event) => {
    if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
    if (held.has(event.code)) return;
    held.add(event.code);
    pressed.add(event.code);
  };
  const onKeyUp = (event) => held.delete(event.code);
  const onPointerMove = (event) => {
    const point = toField(event.clientX, event.clientY);
    pointer.x = point.x;
    pointer.y = point.y;
  };
  const onPointerDown = (event) => {
    event.preventDefault();
    if (event.button === 2) pressed.add('Space');
    else pressed.add('MouseLeft');
  };
  const onContextMenu = (event) => event.preventDefault();
  const onBlur = () => held.clear();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('contextmenu', onContextMenu);

  return {
    state,
    /** Called after each simulation step so one press fires one action. */
    endStep() {
      pressed.clear();
    },
    sample() {
      state.up = ['KeyW', 'ArrowUp'].some((code) => held.has(code));
      state.down = ['KeyS', 'ArrowDown'].some((code) => held.has(code));
      state.left = ['KeyA', 'ArrowLeft'].some((code) => held.has(code));
      state.right = ['KeyD', 'ArrowRight'].some((code) => held.has(code));
      state.guard = held.has('Space');
      state.dash = pressed.has('ShiftLeft') || pressed.has('ShiftRight');
      state.burst = pressed.has('KeyE') || pressed.has('MouseLeft');
      state.start = pressed.has('Enter') || pressed.has('MouseLeft');
      state.restart = pressed.has('Enter') || pressed.has('KeyR') || pressed.has('MouseLeft');
      state.mute = pressed.has('KeyM');
      return state;
    },
    /** Screenshot scenarios drive the game without a physical keyboard. */
    inject(code) {
      pressed.add(code);
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
    },
  };
}

export { MOVE_KEYS };
