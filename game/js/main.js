'use strict';
const canvas = document.getElementById('game');
const context = canvas.getContext('2d', {alpha:false});
let state = createHeistState();
let lastFrame = 0;
let accumulator = 0;
const STEP = 1/60;
function resetHeist(demo = false) {
  state = createHeistState();
  state.demo = demo;
  if (demo) state.demoPlan = createDemoPlan();
}
function createDemoPlan() {
  // Autopilot issues the same movement, interaction and gadget inputs as a human.
  return [
    {x:210,y:290,shot:'cover'}, {x:275,y:290,emp:true,shot:'tools'},
    {x:390,y:330}, {x:445,y:330}, {x:445,y:290,shot:'alarm',wait:1.1},
    {x:544,y:290,emp:true}, {x:599,y:290,collect:true},
    {x:546,y:330}, {x:390,y:330}, {x:275,y:340},
    {x:210,y:340,shot:'escape'}, {x:110,y:340}, {x:68,y:390},
  ];
}
function readDemoControls(dt) {
  const plan=state.demoPlan;
  if (!plan?.length) return {};
  const target=plan[0], player=state.player;
  if (!target.path) target.path=findWalkPath(player,target,player.radius);
  const waypoint=target.path[0] || target;
  if (distance(player,waypoint)<4) target.path.shift();
  const arrived=distance(player,target)<5;
  if (arrived) {
    if (target.emp && !target.used) {useEmpPulse(state);target.used=true;}
    if (target.collect) collectNearbyLoot(state);
    if (target.shot) state.demoScene=target.shot;
    target.elapsed=(target.elapsed || 0)+dt;
    if (target.elapsed>(target.wait || .35)) plan.shift();
    return {};
  }
  return {dx:waypoint.x-player.x,dy:waypoint.y-player.y};
}
function updateHeist(dt, controls) {
  if (state.status!=='playing') return;
  state.time+=dt;
  state.messageTimer=Math.max(0,state.messageTimer-dt);
  if (controls.emp) useEmpPulse(state);
  if (controls.coin) throwDecoyCoin(state);
  updatePlayer(state,dt,controls);
  for (const guard of state.guards) updateGuardPatrol(guard,state,dt);
  for (const camera of state.cameras) updateSecurityCamera(camera,state,dt);
  updateGadgets(state,dt);
  if (state.status==='playing') updateAlarm(state,dt);
}
function frame(timestamp) {
  const elapsed=lastFrame?Math.min(.1,(timestamp-lastFrame)/1000):STEP;
  lastFrame=timestamp;accumulator+=elapsed;
  if (pressedKeys.has('r')) resetHeist(state.demo);
  if (pressedKeys.has('d')) resetHeist(!state.demo);
  const keyboard=readKeyboardControls();
  let first=true;
  while(accumulator>=STEP) {
    const controls=state.demo?readDemoControls(STEP):first?keyboard:{dx:keyboard.dx,dy:keyboard.dy};
    updateHeist(STEP,controls);accumulator-=STEP;first=false;
  }
  pressedKeys.clear();
  renderHeist(context,state);
  requestAnimationFrame(frame);
}
const query = new URLSearchParams(location.search);
if (query.has('demo')) resetHeist(true);
// Capture mode advances the actual fixed-step simulation, then freezes an ordinary play frame.
if (query.has('capture')) {
  resetHeist(true);
  const requested=query.get('capture');
  for (let i=0;i<60*100;i++) {
    updateHeist(STEP,readDemoControls(STEP));
    if (state.demoScene===requested || state.status!=='playing') break;
  }
  renderHeist(context,state);
} else requestAnimationFrame(frame);
