'use strict';
function createCameras() {
  return [
    {x:534,y:128,base:1.3,angle:1.3,spread:0.86,range:221,phase:0,disabled:0},
    {x:910,y:329,base:Math.PI,angle:Math.PI,spread:0.88,range:217,phase:2,disabled:0},
  ];
}
function updateSecurityCamera(camera, state, dt) {
  camera.disabled = Math.max(0,camera.disabled-dt);
  camera.angle = camera.base + Math.sin(state.time*0.65+camera.phase)*0.88;
  camera.cone = camera.disabled > 0 ? [] : castSightCone(camera);
}
