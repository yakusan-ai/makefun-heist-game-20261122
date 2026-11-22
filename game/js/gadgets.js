'use strict';
function useEmpPulse(state) {
  if (state.emp <= 0) { showMessage(state,'NO EMP CHARGES LEFT'); return; }
  state.emp--;
  // Room-wide electronic pulse; guards remain dangerous.
  for (const camera of state.cameras) { camera.disabled = 6; camera.cone = []; }
  state.pulses.push({x:state.player.x,y:state.player.y,life:1.2});
  showMessage(state,'EMP / CAMERAS DISABLED FOR 6 SECONDS');
}
function throwDecoyCoin(state) {
  if (state.coins <= 0) { showMessage(state,'NO DECOY COINS LEFT'); return; }
  state.coins--;
  const player = state.player;
  const landing = castSightRay(player,player.angle,110);
  const length = distance(player,landing);
  const amount = Math.max(0,length-15);
  state.decoy = {x:player.x+Math.cos(player.angle)*amount,y:player.y+Math.sin(player.angle)*amount,
    life:5,id:state.time};
  showMessage(state,'COIN / NEARBY GUARDS INVESTIGATE THE SOUND');
}
function updateGadgets(state, dt) {
  for (const pulse of state.pulses) pulse.life -= dt;
  state.pulses = state.pulses.filter(pulse => pulse.life > 0);
  if (state.decoy) { state.decoy.life -= dt; if (state.decoy.life <= 0) state.decoy = null; }
  for (const mark of state.footsteps) mark.life -= dt;
  state.footsteps = state.footsteps.filter(mark => mark.life > 0);
}
