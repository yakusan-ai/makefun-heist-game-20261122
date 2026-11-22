'use strict';
function createGuards() {
  return [
    {x:404,y:294,radius:10,angle:0,heading:0,spread:0.94,range:174,speed:37,index:1,
      route:[{x:390,y:294},{x:445,y:294},{x:445,y:183},{x:390,y:183}],phase:0},
    {x:662,y:419,radius:10,angle:Math.PI,heading:Math.PI,spread:1.02,range:158,speed:33,index:1,
      route:[{x:662,y:419},{x:490,y:419},{x:490,y:451},{x:662,y:451}],phase:2},
    {x:850,y:398,radius:10,angle:-Math.PI/2,heading:-Math.PI/2,spread:0.9,range:165,speed:30,index:1,
      route:[{x:850,y:398},{x:850,y:246},{x:820,y:246},{x:820,y:398}],phase:4},
  ];
}
function updateGuardPatrol(guard, state, dt) {
  if (state.decoy && distance(guard, state.decoy) < 270 && guard.decoyId !== state.decoy.id) {
    guard.decoyId = state.decoy.id;
    guard.investigation = findWalkPath(guard, state.decoy);
    guard.wait = 0;
  }
  let target;
  if (guard.investigation && guard.investigation.length) {
    target = guard.investigation[0];
    if (distance(guard,target) < 5) {
      guard.investigation.shift();
      if (!guard.investigation.length) guard.wait = 2.5;
    }
  } else if (guard.wait > 0) guard.wait -= dt;
  else {
    target = guard.route[guard.index];
    if (distance(guard,target) < 5) guard.index = (guard.index+1) % guard.route.length;
    // Resume patrol by walking around cover rather than through it.
    if (guard.decoyId && (!state.decoy || state.decoy.id === guard.decoyId)) {
      guard.investigation = findWalkPath(guard, target);
      guard.decoyId = null;
    }
  }
  if (target && !(guard.wait > 0)) {
    guard.heading = Math.atan2(target.y-guard.y,target.x-guard.x);
    const amount = Math.min(distance(guard,target),guard.speed*dt);
    moveWithWalls(guard,Math.cos(guard.heading)*amount,Math.sin(guard.heading)*amount);
  }
  guard.angle = guard.heading + Math.sin(state.time*1.55+guard.phase)*0.48;
  guard.cone = castSightCone(guard);
}
