// Enemy ("Bloon") definitions
// Each tier has: health on hit, base speed (relative), child to spawn on pop, color, layer count, properties
// Properties: camo, regrow, lead (immune to sharp), black (immune to explosion), white (immune to ice/cold)

const BloonTypes = {
  red:    { name: 'Red',    speed: 1.0,  rbe: 1,   color: '#ef4444', stroke: '#7f1d1d', child: null,    radius: 14, value: 1 },
  blue:   { name: 'Blue',   speed: 1.4,  rbe: 2,   color: '#3b82f6', stroke: '#1e3a8a', child: 'red',   radius: 15, value: 1 },
  green:  { name: 'Green',  speed: 1.8,  rbe: 3,   color: '#22c55e', stroke: '#14532d', child: 'blue',  radius: 16, value: 1 },
  yellow: { name: 'Yellow', speed: 3.2,  rbe: 4,   color: '#fbbf24', stroke: '#78350f', child: 'green', radius: 17, value: 1 },
  pink:   { name: 'Pink',   speed: 3.5,  rbe: 5,   color: '#ec4899', stroke: '#831843', child: 'yellow',radius: 18, value: 1 },
  black:  { name: 'Black',  speed: 1.8,  rbe: 11,  color: '#1f2937', stroke: '#000',    child: 'pink',  radius: 20, value: 2, props: {black: true}, spawnCount: 2 },
  white:  { name: 'White',  speed: 2.0,  rbe: 11,  color: '#f1f5f9', stroke: '#94a3b8', child: 'pink',  radius: 20, value: 2, props: {white: true}, spawnCount: 2 },
  lead:   { name: 'Lead',   speed: 1.0,  rbe: 23,  color: '#475569', stroke: '#1e293b', child: 'black', radius: 20, value: 4, props: {lead: true},  spawnCount: 2 },
  zebra:  { name: 'Zebra',  speed: 1.8,  rbe: 23,  color: '#f1f5f9', stroke: '#000',    child: 'black', radius: 21, value: 4, props: {black: true, white: true}, spawnCount: 2 },
  rainbow:{ name: 'Rainbow',speed: 2.2,  rbe: 47,  color: '#a855f7', stroke: '#581c87', child: 'zebra', radius: 22, value: 8, spawnCount: 2 },
  ceramic:{ name: 'Ceramic',speed: 2.5,  hp: 10,   rbe: 104, color: '#b45309', stroke: '#451a03', child: 'rainbow', radius: 24, value: 25, spawnCount: 2 },
  // MOAB-class blimps
  moab:   { name: 'Blimp',  speed: 1.0,  hp: 200,  rbe: 616, color: '#3b82f6', stroke: '#1e3a8a', child: 'ceramic', radius: 38, value: 200, isBlimp: true, spawnCount: 4 },
  bfb:    { name: 'BigBlimp',speed: 0.8, hp: 700,  rbe: 3164, color: '#ef4444', stroke: '#7f1d1d', child: 'moab', radius: 50, value: 500, isBlimp: true, spawnCount: 4 },
  zomg:   { name: 'MegaBlimp',speed: 0.6, hp: 4000, rbe: 16656, color: '#15803d', stroke: '#052e16', child: 'bfb', radius: 64, value: 1500, isBlimp: true, spawnCount: 4 }
};

// Spawn a bloon entity from a type key
function makeBloon(typeKey, pathDist = 0, opts = {}) {
  const t = BloonTypes[typeKey];
  return {
    typeKey,
    type: t,
    pathDist,
    hp: t.hp || 1, // hits until popped at this layer
    maxHp: t.hp || 1,
    camo: opts.camo || false,
    regrow: opts.regrow || false,
    regrowTimer: 0,
    regrowStack: typeKey === 'red' ? 0 : (opts.regrowStack || 0),
    fortified: opts.fortified || false,
    radius: t.radius * (opts.fortified ? 1.1 : 1),
    speedMult: 1,
    glueStacks: 0,
    glueTimer: 0,
    freezeTimer: 0,
    stunTimer: 0,
    statuses: {},
    id: Math.random(),
    children: [],
    poppedThisLayer: false,
    // Visual
    bobPhase: Math.random() * Math.PI * 2,
    x: 0, y: 0, angle: 0,
    alive: true,
    onScreen: false,
    distMul: 1,
  };
}

// Get total RBE (red bloon equivalent) of a bloon
function bloonRBE(bloon) {
  return bloon.type.rbe;
}

// What does this bloon "spawn" when popped? array of typeKeys (with options)
function popChildren(bloon) {
  const t = bloon.type;
  if (!t.child) return [];
  const count = t.spawnCount || 1;
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      typeKey: t.child,
      camo: bloon.camo && !['lead', 'ceramic', 'moab', 'bfb', 'zomg'].includes(t.child),
      regrow: bloon.regrow,
      regrowStack: bloon.regrowStack,
      fortified: bloon.fortified && (t.child === 'lead' || ['moab','bfb','zomg','ceramic'].includes(t.child))
    });
  }
  return result;
}
