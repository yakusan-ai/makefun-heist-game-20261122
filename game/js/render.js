'use strict';
const PALETTE = {ink:'#080f21',muted:'#8c9fb5',white:'#e8f2f7',gold:'#ffd477',green:'#78e2ad',cyan:'#63e8ed'};
function roundedBox(ctx,x,y,w,h,r,fill,stroke) {
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
  if (fill) { ctx.fillStyle=fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); }
}
function label(ctx,text,x,y,size=12,color=PALETTE.white,weight=600,align='left') {
  ctx.font=weight+' '+size+'px system-ui, sans-serif';
  ctx.textAlign=align; ctx.textBaseline='alphabetic'; ctx.fillStyle=color; ctx.fillText(text,x,y);
}
function diamond(ctx,x,y,size,fill) {
  ctx.beginPath(); ctx.moveTo(x,y-size); ctx.lineTo(x+size,y-2);
  ctx.lineTo(x,y+size); ctx.lineTo(x-size,y-2); ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
}
function drawSightCone(ctx,source,camera,time) {
  if (!source.cone || !source.cone.length) return;
  const path = () => {
    ctx.beginPath(); source.cone.forEach((point,index) => index ? ctx.lineTo(point.x,point.y) : ctx.moveTo(point.x,point.y)); ctx.closePath();
  };
  ctx.save();
  const gradient=ctx.createRadialGradient(source.x,source.y,0,source.x,source.y,source.range);
  gradient.addColorStop(0,camera?'rgba(60,225,241,.32)':'rgba(255,104,73,.38)');
  gradient.addColorStop(1,camera?'rgba(60,225,241,.06)':'rgba(255,155,69,.07)');
  path(); ctx.fillStyle=gradient; ctx.fill();
  ctx.strokeStyle=camera?'rgba(99,232,237,.5)':'rgba(255,141,88,.55)'; ctx.lineWidth=1; ctx.stroke();
  if (camera) {
    path(); ctx.clip();
    ctx.strokeStyle='rgba(99,232,237,.16)';
    for (let y=100+(time*18%9);y<480;y+=9) { ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(940,y);ctx.stroke(); }
    const angle=source.angle+Math.sin(time*3)*source.spread*.4;
    ctx.beginPath();ctx.moveTo(source.x,source.y);ctx.lineTo(source.x+Math.cos(angle)*source.range,source.y+Math.sin(angle)*source.range);
    ctx.strokeStyle='rgba(170,255,255,.65)';ctx.stroke();
  }
  ctx.restore();
}
function drawFloor(ctx,state) {
  ctx.fillStyle=PALETTE.ink;ctx.fillRect(0,0,960,540);
  for (const room of HEIST.rooms) {
    roundedBox(ctx,room.x,room.y,room.w,room.h,3,'#111e32','#20334a');
    ctx.save();ctx.beginPath();ctx.rect(room.x,room.y,room.w,room.h);ctx.clip();
    ctx.strokeStyle='#19293e';ctx.lineWidth=1;
    for (let x=32;x<940;x+=28) {ctx.beginPath();ctx.moveTo(x,114);ctx.lineTo(x,476);ctx.stroke();}
    for (let y=112;y<480;y+=28) {ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(940,y);ctx.stroke();}
    ctx.restore();
    label(ctx,room.name,room.x+12,room.y+19,9,'#60768e',700);
  }
  // The two routes remain legible as architectural markings.
  ctx.setLineDash([3,7]);ctx.strokeStyle='#385165';ctx.lineWidth=1;
  for (const y of [182,448]) {
    ctx.beginPath();ctx.moveTo(205,y);ctx.lineTo(660,y);ctx.stroke();
  }
  ctx.setLineDash([]);
  label(ctx,'NORTH / SHORT + WATCHED',271,204,9,'#68849a');
  label(ctx,'SOUTH / LONG + SHELTERED',271,469,9,'#68849a');
  // A concentric inlay gives the star a clear destination without borrowed art.
  ctx.strokeStyle='#6b5835';
  for (const radius of [29,38,46]) {ctx.beginPath();ctx.arc(599,290,radius,0,Math.PI*2);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(539,290);ctx.lineTo(659,290);ctx.moveTo(599,237);ctx.lineTo(599,343);ctx.stroke();
  const exit=HEIST.exit;
  roundedBox(ctx,exit.x,exit.y,exit.w,exit.h,4,state.player.carrying?'#1e634b':'#163c36',state.player.carrying?'#99ffd0':'#477461');
  for (let y=exit.y+9;y<exit.y+exit.h-4;y+=12) {
    ctx.strokeStyle='#477461';ctx.beginPath();ctx.moveTo(exit.x+5,y);ctx.lineTo(exit.x+exit.w-5,y);ctx.stroke();
  }
  label(ctx,'EXIT',66,391,17,'#c1ffda',800,'center');
  label(ctx,state.player.carrying?'OPEN':'LOCKED',66,410,10,'#b3d3bd',700,'center');
}
function drawArchitecture(ctx) {
  for (const wall of HEIST.walls) {
    ctx.fillStyle='#060c18';ctx.fillRect(wall.x+3,wall.y+5,wall.w,wall.h);
    ctx.fillStyle='#314258';ctx.fillRect(wall.x,wall.y,wall.w,wall.h);
    ctx.fillStyle='#506079';ctx.fillRect(wall.x,wall.y,wall.w,2);
  }
  for (const cover of HEIST.cover) {
    roundedBox(ctx,cover.x+3,cover.y+5,cover.w,cover.h,4,'#070e18');
    roundedBox(ctx,cover.x,cover.y,cover.w,cover.h,4,'#1e4c43','#578e73');
    roundedBox(ctx,cover.x+5,cover.y+5,cover.w-10,cover.h-10,2,'#285d4b','#3e7960');
    ctx.strokeStyle='#77a27e';ctx.beginPath();
    ctx.moveTo(cover.x+10,cover.y+10);ctx.lineTo(cover.x+cover.w-10,cover.y+10);ctx.stroke();
    ctx.fillStyle='#8bb596';ctx.fillRect(cover.x+cover.w/2-6,cover.y+cover.h-9,12,2);
  }
}
function drawLoot(ctx,state) {
  for (const loot of state.loot) {
    if (loot.taken) continue;
    const bob=Math.sin(state.time*2.6+loot.x)*2;
    ctx.save();ctx.shadowColor=PALETTE.gold;ctx.shadowBlur=loot.major?20:9;
    if (loot.major) {
      roundedBox(ctx,loot.x-19,loot.y+15,38,9,2,'#5b4b35','#bd9858');
      diamond(ctx,loot.x,loot.y+bob,18,PALETTE.gold);
      ctx.shadowBlur=0;ctx.strokeStyle='#fff6cf';ctx.lineWidth=1.3;
      ctx.beginPath();ctx.moveTo(loot.x-18,loot.y-2+bob);ctx.lineTo(loot.x+18,loot.y-2+bob);
      ctx.moveTo(loot.x,loot.y-18+bob);ctx.lineTo(loot.x-7,loot.y-2+bob);ctx.lineTo(loot.x,loot.y+18+bob);
      ctx.lineTo(loot.x+7,loot.y-2+bob);ctx.closePath();ctx.stroke();
      label(ctx,'THE FALLEN STAR',loot.x,loot.y+43,10,PALETTE.gold,800,'center');
    } else {
      roundedBox(ctx,loot.x-8,loot.y-8+bob,16,16,3,'#e9bb65','#ffedb3');
      ctx.shadowBlur=0;label(ctx,'+',loot.x,loot.y+5+bob,15,'#67512b',700,'center');
    }
    ctx.restore();
  }
}
function drawGuard(ctx,guard,state) {
  ctx.save();ctx.translate(guard.x,guard.y);
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(2,6,13,9,0,0,Math.PI*2);ctx.fill();
  ctx.rotate(guard.angle);
  // Angular armor and a cap distinguish guards from the hooded thief.
  roundedBox(ctx,-10,-9,19,18,4,'#c86e59','#ffb18a');
  ctx.fillStyle='#3a2530';ctx.fillRect(-4,-7,11,14);
  ctx.fillStyle='#f6a281';ctx.fillRect(6,-7,7,14);
  ctx.fillStyle='#251f2d';ctx.fillRect(9,-6,3,12);
  ctx.fillStyle='#ffd9a2';ctx.fillRect(13,-3,5,6);
  ctx.restore();
  if (guard.investigation?.length || guard.wait>0) label(ctx,'?',guard.x,guard.y-18,16,PALETTE.gold,800,'center');
  if (state.seen && isTargetVisible(guard,state.player)) label(ctx,'!',guard.x,guard.y-21,21,'#ff9b79',900,'center');
}
function drawCamera(ctx,camera) {
  const disabled=camera.disabled>0,color=disabled?'#8994a4':PALETTE.cyan;
  ctx.save();ctx.translate(camera.x,camera.y);
  ctx.fillStyle='#36475d';
  ctx.strokeStyle='#91abbf';ctx.lineWidth=4;ctx.beginPath();
  if (camera.x>800) {ctx.fillRect(18,-13,10,26);ctx.moveTo(20,0);}
  else {ctx.fillRect(-13,-18,26,10);ctx.moveTo(0,-10);}
  ctx.lineTo(0,0);ctx.stroke();
  ctx.rotate(camera.angle);
  roundedBox(ctx,-12,-9,27,18,4,disabled?'#354354':'#b3d8de','#e0f3f4');
  ctx.fillStyle='#0d2437';ctx.fillRect(8,-7,9,14);
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(16,0,4,0,Math.PI*2);ctx.fill();
  ctx.restore();
  roundedBox(ctx,camera.x-43,camera.y+19,86,17,3,'#0b1726',disabled?'#637386':'#2d6972');
  label(ctx,disabled?'DISABLED '+Math.ceil(camera.disabled)+'s':'CAM / ONLINE',camera.x,camera.y+31,9,color,800,'center');
}
function drawThief(ctx,state) {
  const player=state.player;
  for (const mark of state.footsteps) {
    ctx.globalAlpha=mark.life*.25;ctx.fillStyle='#d9e7ed';ctx.beginPath();ctx.arc(mark.x,mark.y,3,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.save();ctx.translate(player.x,player.y);
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(1,7,13,8,0,0,Math.PI*2);ctx.fill();
  ctx.rotate(player.angle);
  ctx.fillStyle='#b9c9e1';ctx.beginPath();ctx.moveTo(-12,-7);ctx.lineTo(-16,10);ctx.lineTo(-1,7);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e1eaf5';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#15253a';ctx.beginPath();ctx.arc(2,0,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#9ceaf2';ctx.fillRect(4,-5,3,10);
  ctx.fillStyle='#f0f6ff';ctx.fillRect(-3,-13,9,5);ctx.fillRect(-3,8,9,5);
  ctx.restore();
  if (player.carrying) {diamond(ctx,player.x-11,player.y-14,9,PALETTE.gold);}
  ctx.strokeStyle=state.seen?'#ff8d6e':'#d9f4ff';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(player.x,player.y,17,-.6,1);ctx.stroke();
}
function drawGadgets(ctx,state) {
  for (const pulse of state.pulses) {
    ctx.globalAlpha=pulse.life/1.2;ctx.strokeStyle=PALETTE.cyan;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(pulse.x,pulse.y,22+(1.2-pulse.life)*170,0,Math.PI*2);ctx.stroke();
  }
  ctx.globalAlpha=1;
  if (state.decoy) {
    const coin=state.decoy;
    for (let i=0;i<3;i++) {ctx.globalAlpha=.5-i*.12;ctx.strokeStyle=PALETTE.gold;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(coin.x,coin.y,8+(state.time*22+i*15)%48,0,Math.PI*2);ctx.stroke();}
    ctx.globalAlpha=1;ctx.fillStyle=PALETTE.gold;ctx.beginPath();ctx.arc(coin.x,coin.y,4,0,Math.PI*2);ctx.fill();
    label(ctx,'DECOY',coin.x,coin.y-19,9,PALETTE.gold,800,'center');
  }
}
function drawHud(ctx,state) {
  ctx.fillStyle='#080f21';ctx.fillRect(0,0,960,99);
  label(ctx,'NIGHTGLASS',25,35,29,'#edf2fa',900);
  label(ctx,'A FALLEN STAR. ONE WAY OUT.',27,55,10,'#9aaac0',700);
  label(ctx,'01',270,35,24,PALETTE.gold,300);
  label(ctx,'THE OBSERVATORY JOB',307,29,12,PALETTE.gold,800);
  label(ctx,state.player.carrying?'RETURN TO THE GREEN EXIT':'RECOVER THE FALLEN STAR',307,48,10,'#9aaac0');
  const alarmColor=state.alarm>66?'#ff675d':state.alarm>25?'#ffc46e':'#77d9b2';
  label(ctx,state.seen?'EXPOSED / BREAK LINE OF SIGHT':'ALARM / '+(state.alarm>0?'COOLING':'UNDETECTED'),586,26,11,alarmColor,800);
  roundedBox(ctx,586,35,220,13,4,'#1e2b3e');
  if (state.alarm>0) roundedBox(ctx,587,36,218*state.alarm/100,11,3,alarmColor);
  label(ctx,Math.ceil(state.alarm)+'%',827,47,24,alarmColor,800);
  label(ctx,'Q  EMP',28,84,13,PALETTE.cyan,800);label(ctx,'●'.repeat(state.emp)+'○'.repeat(3-state.emp),92,84,13,PALETTE.cyan);
  label(ctx,'F  COIN',174,84,13,PALETTE.gold,800);label(ctx,'●'.repeat(state.coins)+'○'.repeat(3-state.coins),242,84,13,PALETTE.gold);
  label(ctx,'LOOT  '+state.loot.filter(item=>item.taken).length+'/4',345,84,13,'#e8f2f7',800);
  label(ctx,'$'+state.recovered.toLocaleString('en-US'),446,84,13,PALETTE.gold,800);
  label(ctx,'STAR '+(state.player.carrying?'SECURED':'PENDING'),586,84,12,state.player.carrying?PALETTE.gold:'#9aaac0',800);
  label(ctx,Math.floor(state.time/60).toString().padStart(2,'0')+':'+Math.floor(state.time%60).toString().padStart(2,'0'),900,83,15,'#afbed0',700,'right');
  ctx.strokeStyle='#344154';ctx.beginPath();ctx.moveTo(24,98);ctx.lineTo(936,98);ctx.stroke();
  ctx.fillStyle='#080f21';ctx.fillRect(0,489,960,51);
  label(ctx,'WASD / ↑↓←→  MOVE',26,512,11,'#c3d2e3',800);
  label(ctx,'E  TAKE',205,512,11,PALETTE.gold,800);
  label(ctx,'Q  EMP',291,512,11,PALETTE.cyan,800);
  label(ctx,'F  DECOY',375,512,11,PALETTE.gold,800);
  label(ctx,'R  RETRY',478,512,11,'#c3d2e3',800);
  label(ctx,'D  DEMO',571,512,11,'#c3d2e3',800);
  label(ctx,state.demo?'AUTOPILOT / REAL GAME LOGIC':'COVER BLOCKS ALL SIGHT',929,512,10,'#7ca58e',700,'right');
  label(ctx,state.messageTimer>0?state.message:'READ THE SWEEP. CROSS IN THE DARK.',26,531,10,'#8fa5bb',600);
}
function drawInteraction(ctx,state) {
  const nearby=state.loot.find(loot=>!loot.taken && distance(loot,state.player)<32);
  if (nearby) {
    roundedBox(ctx,nearby.x-38,nearby.y-49,76,23,4,'#f3d696');
    label(ctx,'E  TAKE',nearby.x,nearby.y-33,12,'#202534',900,'center');
  }
}
function drawEndCard(ctx,state) {
  if (state.status==='playing') return;
  ctx.fillStyle='rgba(4,10,23,.76)';ctx.fillRect(0,99,960,390);
  roundedBox(ctx,250,175,460,217,12,'#102035',state.status==='escaped'?'#d7b368':'#e37867');
  const won=state.status==='escaped';
  label(ctx,won?'A CLEAN GETAWAY':'SIGNAL LOCKED',480,229,30,won?PALETTE.gold:'#ff9887',900,'center');
  label(ctx,won?'The city gets its night back. You keep the star.':'The alarm found your signature. Try a different route.',480,263,13,'#b9cadd',500,'center');
  label(ctx,'$'+state.recovered+'   /   '+Math.floor(state.time)+'s   /   PEAK ALARM '+Math.ceil(state.peakAlarm)+'%',480,301,15,'#e7eff8',800,'center');
  roundedBox(ctx,365,326,230,39,5,won?'#e6c27d':'#c97564');
  label(ctx,'R  /  RUN IT AGAIN',480,351,14,'#0a1323',900,'center');
}
function renderHeist(ctx,state) {
  drawFloor(ctx,state);
  for (const guard of state.guards) drawSightCone(ctx,guard,false,state.time);
  for (const camera of state.cameras) drawSightCone(ctx,camera,true,state.time);
  drawArchitecture(ctx);drawLoot(ctx,state);drawGadgets(ctx,state);
  for (const guard of state.guards) drawGuard(ctx,guard,state);
  for (const camera of state.cameras) drawCamera(ctx,camera);
  drawThief(ctx,state);drawInteraction(ctx,state);drawHud(ctx,state);drawEndCard(ctx,state);
}
