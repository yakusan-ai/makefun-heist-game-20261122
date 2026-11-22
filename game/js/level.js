'use strict';
const HEIST = {
  width: 960, height: 540,
  rooms: [
    { x: 28, y: 114, w: 214, h: 320, name: '01 / ARRIVAL' },
    { x: 254, y: 114, w: 438, h: 102, name: '02 / NORTH GALLERY' },
    { x: 254, y: 226, w: 438, h: 128, name: '03 / STAR CHAMBER' },
    { x: 254, y: 364, w: 438, h: 112, name: '04 / SERVICE WALK' },
    { x: 704, y: 114, w: 228, h: 362, name: '05 / ARCHIVE' },
  ],
  walls: [
    {x:20,y:102,w:920,h:12}, {x:20,y:476,w:920,h:12},
    {x:20,y:102,w:12,h:386}, {x:928,y:102,w:12,h:386},
    {x:242,y:114,w:12,h:40}, {x:242,y:204,w:12,h:64},
    {x:242,y:316,w:12,h:110},
    {x:254,y:216,w:104,h:10}, {x:420,y:216,w:272,h:10},
    {x:254,y:354,w:262,h:10}, {x:580,y:354,w:112,h:10},
    {x:692,y:114,w:12,h:62}, {x:692,y:234,w:12,h:170},
    {x:692,y:454,w:12,h:22},
  ],
  cover: [
    {x:122,y:246,w:68,h:68}, {x:295,y:254,w:70,h:60},
    {x:464,y:256,w:48,h:46}, {x:554,y:145,w:72,h:28},
    {x:358,y:400,w:90,h:28}, {x:748,y:272,w:46,h:90},
    {x:832,y:158,w:52,h:46},
  ],
  exit: {x:33,y:356,w:66,h:91},
};
HEIST.solids = [...HEIST.walls, ...HEIST.cover];
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function circleHitsRectangle(x, y, radius, rectangle) {
  const nearX = Math.max(rectangle.x, Math.min(x, rectangle.x + rectangle.w));
  const nearY = Math.max(rectangle.y, Math.min(y, rectangle.y + rectangle.h));
  return Math.hypot(x - nearX, y - nearY) < radius;
}
function canOccupy(x, y, radius = 10) {
  return !HEIST.solids.some(wall => circleHitsRectangle(x, y, radius, wall));
}
function moveWithWalls(entity, dx, dy) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 4));
  for (let i = 0; i < steps; i++) {
    if (canOccupy(entity.x + dx / steps, entity.y, entity.radius)) entity.x += dx / steps;
    if (canOccupy(entity.x, entity.y + dy / steps, entity.radius)) entity.y += dy / steps;
  }
}
function createHeistState() {
  return {
    time: 0, status: 'playing', alarm: 0, peakAlarm: 0, seen: false,
    player: {x:88,y:290,radius:9,angle:0,carrying:false},
    loot: [
      {x:386,y:163,value:250,taken:false},
      {x:780,y:207,value:350,taken:false},
      {x:630,y:425,value:400,taken:false},
      {x:599,y:290,value:2000,taken:false,major:true},
    ],
    guards: createGuards(), cameras: createCameras(),
    emp: 3, coins: 3, pulses: [], decoy: null,
    message: 'STEAL THE FALLEN STAR. GET BACK TO THE GREEN DOOR.',
    messageTimer: 5, recovered: 0, demo: false, footsteps: [],
  };
}
