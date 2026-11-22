const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const scripts=['level','vision','player','guard','camera','gadgets','alarm','render','main'];
function game() {
  const context=vm.createContext({
    console,URLSearchParams,location:{search:''},addEventListener(){},requestAnimationFrame(){},
    document:{getElementById(){return {getContext(){return {};}};}},
  });
  vm.runInContext(scripts.map(name=>fs.readFileSync('game/js/'+name+'.js','utf8')).join('\n'),context);
  return code=>vm.runInContext(code,context);
}
test('cover clips visible cone and prevents seeing through it',()=>{
  const run=game();
  assert.equal(run(`(()=>{const s={x:100,y:280,angle:0,spread:1,range:200};s.cone=castSightCone(s);return isTargetVisible(s,{x:210,y:280});})()`),false);
  assert.equal(run(`(()=>{const s={x:100,y:230,angle:0,spread:1,range:120};s.cone=castSightCone(s);return isTargetVisible(s,{x:210,y:230});})()`),true);
});
test('wall movement never tunnels and diagonal speed is normalized',()=>{
  const run=game();
  assert.equal(run(`(()=>{const s=createHeistState();moveWithWalls(s.player,150,0);return s.player.x<114;})()`),true);
  assert.ok(Math.abs(run(`(()=>{const s=createHeistState();s.player.x=190;s.player.y=340;const p={...s.player};updatePlayer(s,.1,{dx:1,dy:1});return distance(p,s.player);})()`)-13.2)<.01);
});
test('EMP affects cameras but leaves guards active, and charges are finite',()=>{
  const run=game();
  assert.equal(run(`(()=>{const s=createHeistState();for(let i=0;i<5;i++)useEmpPulse(s);return s.emp===0 && s.cameras.every(c=>c.disabled===6) && s.guards.length===3;})()`),true);
});
test('alarm warns, catches, cools and retry resets all resources',()=>{
  const run=game();
  assert.equal(run(`(()=>{const s=createHeistState();s.player={x:100,y:200};s.cameras=[];s.guards=[{x:60,y:200,angle:0,spread:1,range:100}];updateAlarm(s,1);return s.alarm===38 && s.status==='playing';})()`),true);
  assert.equal(run(`(()=>{const s=createHeistState();s.player={x:100,y:200};s.cameras=[];s.guards=[{x:60,y:200,angle:0,spread:1,range:100}];updateAlarm(s,3);return s.status;})()`),'caught');
  assert.equal(run(`(()=>{resetHeist();return state.emp===3 && state.alarm===0 && state.status==='playing';})()`),true);
});
test('demo completes real movement, loot interaction and escape without teleporting',()=>{
  const run=game();
  const result=run(`(()=>{resetHeist(true);let maxStep=0;const scenes={};for(let i=0;i<60*100;i++){const p={...state.player};updateHeist(STEP,readDemoControls(STEP));maxStep=Math.max(maxStep,distance(p,state.player));if(state.demoScene)scenes[state.demoScene]={time:state.time,alarm:state.alarm,x:state.player.x,y:state.player.y,carrying:state.player.carrying};if(state.status!=='playing')break;}return JSON.stringify({status:state.status,time:state.time,loot:state.recovered,maxStep,scenes,plan:state.demoPlan});})()`);
  console.log(result);
  assert.equal(JSON.parse(result).status,'escaped');
  assert.ok(JSON.parse(result).maxStep<2.21);
});
test('every room and every treasure has a walkable route from the entrance',()=>{
  const run=game();
  assert.equal(run(`(()=>{const s=createHeistState();return [...s.loot,{x:840,y:440},{x:320,y:440}].every(target=>findWalkPath(s.player,target,9).length>0);})()`),true);
});
test('coins attract guards through a collision-free path and cannot go through walls',()=>{
  const run=game();
  assert.equal(run(`(()=>{const s=createHeistState();s.player.x=275;s.player.y=330;s.player.angle=0;throwDecoyCoin(s);const g=s.guards[0];updateGuardPatrol(g,s,1/60);return s.coins===2 && g.investigating && g.investigation.length>0 && canOccupy(s.decoy.x,s.decoy.y,9);})()`),true);
});
