'use strict';
function updateAlarm(state, dt) {
  state.seen = [...state.guards,...state.cameras.filter(camera => camera.disabled <= 0)]
    .some(source => isTargetVisible(source,state.player));
  state.alarm = Math.max(0,Math.min(100,state.alarm + (state.seen ? 38 : -21)*dt));
  state.peakAlarm = Math.max(state.peakAlarm,state.alarm);
  if (state.alarm >= 100) {
    state.status = 'caught';
    showMessage(state,'SIGNAL LOCKED. PRESS R FOR ANOTHER RUN.',99);
  }
}
