'use strict';
const heldKeys = new Set();
const pressedKeys = new Set();
addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(key)) event.preventDefault();
  if (!heldKeys.has(key)) pressedKeys.add(key);
  heldKeys.add(key);
});
addEventListener('keyup', event => heldKeys.delete(event.key.toLowerCase()));
addEventListener('blur', () => { heldKeys.clear(); pressedKeys.clear(); });
function showMessage(state, text, seconds = 3) {
  state.message = text;
  state.messageTimer = seconds;
}
function updatePlayer(state, dt, controls) {
  const player = state.player;
  let dx = controls.dx || 0, dy = controls.dy || 0;
  const magnitude = Math.hypot(dx, dy);
  if (magnitude) {
    dx /= magnitude; dy /= magnitude;
    player.angle = Math.atan2(dy, dx);
    const speed = player.carrying ? 107 : 132;
    moveWithWalls(player, dx * speed * dt, dy * speed * dt);
    if (Math.floor(state.time * 7) !== Math.floor((state.time - dt) * 7)) {
      state.footsteps.push({x:player.x,y:player.y,life:0.65});
    }
  }
  if (controls.collect) collectNearbyLoot(state);
  const exit = HEIST.exit;
  if (player.carrying && player.x > exit.x && player.x < exit.x + exit.w &&
      player.y > exit.y && player.y < exit.y + exit.h) {
    state.status = 'escaped';
    showMessage(state, 'THE STAR IS YOURS.', 99);
  }
}
function collectNearbyLoot(state) {
  const loot = state.loot.find(item => !item.taken && distance(item, state.player) < 32);
  if (!loot) return;
  loot.taken = true;
  state.recovered += loot.value;
  if (loot.major) {
    state.player.carrying = true;
    showMessage(state, 'STAR SECURED / EXIT UNLOCKED. MOVE QUIETLY.');
  } else showMessage(state, '+' + loot.value + ' / POCKET RELIC SECURED');
}
function readKeyboardControls() {
  return {
    dx: Number(heldKeys.has('d') || heldKeys.has('arrowright')) - Number(heldKeys.has('a') || heldKeys.has('arrowleft')),
    dy: Number(heldKeys.has('s') || heldKeys.has('arrowdown')) - Number(heldKeys.has('w') || heldKeys.has('arrowup')),
    collect: pressedKeys.has('e'), emp: pressedKeys.has('q'), coin: pressedKeys.has('f'),
  };
}
