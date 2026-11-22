'use strict';
function castSightRay(origin, angle, range) {
  const dx = Math.cos(angle), dy = Math.sin(angle);
  let nearest = range;
  for (const wall of HEIST.solids) {
    let near = 0, far = range;
    for (const [p, d, low, high] of [
      [origin.x, dx, wall.x, wall.x + wall.w],
      [origin.y, dy, wall.y, wall.y + wall.h],
    ]) {
      if (Math.abs(d) < 1e-9) {
        if (p < low || p > high) { near = range + 1; break; }
      } else {
        const a = (low - p) / d, b = (high - p) / d;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      }
    }
    if (near <= far && near >= 0) nearest = Math.min(nearest, near);
  }
  return {x:origin.x + dx * nearest,y:origin.y + dy * nearest};
}
function wrapAngle(angle) { return Math.atan2(Math.sin(angle), Math.cos(angle)); }
function castSightCone(source) {
  const angles = [];
  for (let i = 0; i <= 90; i++) angles.push(source.angle - source.spread / 2 + source.spread * i / 90);
  // Tiny rays either side of every corner preserve hard occlusion edges.
  for (const wall of HEIST.solids) {
    for (const x of [wall.x, wall.x + wall.w]) for (const y of [wall.y, wall.y + wall.h]) {
      const relative = wrapAngle(Math.atan2(y - source.y, x - source.x) - source.angle);
      if (Math.abs(relative) < source.spread / 2) {
        for (const epsilon of [-0.00001, 0, 0.00001]) angles.push(source.angle + relative + epsilon);
      }
    }
  }
  angles.sort((a,b) => a-b);
  return [{x:source.x,y:source.y}, ...angles.map(angle => castSightRay(source, angle, source.range))];
}
function isTargetVisible(source, target) {
  const polygon = source.cone || castSightCone(source);
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a.y > target.y) !== (b.y > target.y) &&
        target.x < (b.x-a.x) * (target.y-a.y) / (b.y-a.y) + a.x) inside = !inside;
  }
  return inside;
}
function findWalkPath(start, destination, radius = 10) {
  const cell = 16;
  const key = (x,y) => x + ',' + y;
  const sx = Math.round(start.x / cell), sy = Math.round(start.y / cell);
  const queue = [{x:sx,y:sy,parent:null}], visited = new Set([key(sx,sy)]);
  let last = null;
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (Math.hypot(current.x*cell-destination.x,current.y*cell-destination.y) < 20) { last = current; break; }
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x = current.x+dx, y = current.y+dy, label = key(x,y);
      if (visited.has(label) || x < 2 || x > 57 || y < 7 || y > 29) continue;
      if (!canOccupy(x*cell,y*cell,radius)) continue;
      visited.add(label); queue.push({x,y,parent:current});
    }
  }
  if (!last) return [];
  const path = [{x:destination.x,y:destination.y}];
  while (last.parent) { path.push({x:last.x*cell,y:last.y*cell}); last = last.parent; }
  return path.reverse();
}
