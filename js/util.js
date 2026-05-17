// Utility functions
const Util = {
  rand(a, b) { return a + Math.random() * (b - a); },
  randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); },
  dist2(x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return dx*dx + dy*dy; },
  angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); },
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  lerp(a, b, t) { return a + (b - a) * t; },
  fmt(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'k';
    return Math.floor(n).toString();
  },
  pointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },
  distToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    if (dx === 0 && dy === 0) return Util.dist(px, py, ax, ay);
    const t = Util.clamp(((px - ax) * dx + (py - ay) * dy) / (dx*dx + dy*dy), 0, 1);
    return Util.dist(px, py, ax + dx*t, ay + dy*t);
  },
  // For tower placement - check distance to path
  distToPath(x, y, path) {
    let min = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const d = Util.distToSegment(x, y, path[i][0], path[i][1], path[i+1][0], path[i+1][1]);
      if (d < min) min = d;
    }
    return min;
  },
  // Get position at given path distance
  positionOnPath(path, dist) {
    let traveled = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const segLen = Util.dist(path[i][0], path[i][1], path[i+1][0], path[i+1][1]);
      if (traveled + segLen >= dist) {
        const t = (dist - traveled) / segLen;
        return {
          x: Util.lerp(path[i][0], path[i+1][0], t),
          y: Util.lerp(path[i][1], path[i+1][1], t),
          angle: Math.atan2(path[i+1][1] - path[i][1], path[i+1][0] - path[i][0]),
          segment: i,
          done: false
        };
      }
      traveled += segLen;
    }
    const last = path[path.length - 1];
    const prev = path[path.length - 2];
    return {
      x: last[0], y: last[1],
      angle: Math.atan2(last[1] - prev[1], last[0] - prev[0]),
      segment: path.length - 2,
      done: true
    };
  },
  pathLength(path) {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      total += Util.dist(path[i][0], path[i][1], path[i+1][0], path[i+1][1]);
    }
    return total;
  }
};
