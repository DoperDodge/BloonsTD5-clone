// Projectile system
// Each projectile has: position, velocity, damage, pierce, lifetime, behavior, and pop rules
// Pop rules indicate which bloon types it can damage (can't pop lead unless explosive/sharp-piercing, etc.)

function makeProjectile(opts) {
  return Object.assign({
    x: 0, y: 0, vx: 0, vy: 0,
    damage: 1,
    pierce: 1,
    hits: [], // bloon ids hit by this projectile (prevent double-hits)
    lifetime: 2.0,
    age: 0,
    radius: 4,
    color: '#fff',
    type: 'dart',
    canPopLead: false,
    canPopBlack: true,
    canPopWhite: true,
    canPopFrozen: true,
    canDamageBlimp: true,
    canSeeCamo: false,
    explodes: false,
    explodeRadius: 0,
    explodeDamage: 0,
    freeze: 0,
    glue: 0,
    glueAmount: 0,
    slowAmount: 0,
    slowDuration: 0,
    stun: 0,
    behavior: null, // optional update function
    angle: 0,
    rotSpeed: 0,
    homing: false,
    target: null,
    speed: 400,
    dead: false,
    alpha: 1,
    trail: [],
    trailColor: null,
    bounces: 0, // for boomerangs
    bouncesLeft: 0,
    startX: 0, startY: 0,
    extraDamageBlimp: 0,
    extraDamageCeramic: 0,
    extraDamageMoab: 0,
    owner: null,
    onHit: null, // (projectile, bloon, game) => void
    onPop: null  // called when bloon layer is popped
  }, opts);
}

function updateProjectile(p, dt, game) {
  p.age += dt;
  if (p.age >= p.lifetime) { p.dead = true; return; }

  if (p.trailColor) {
    p.trail.push([p.x, p.y]);
    if (p.trail.length > 8) p.trail.shift();
  }

  if (p.behavior) {
    p.behavior(p, dt, game);
  } else {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }

  if (p.homing && (!p.target || !p.target.alive)) {
    // find new target
    let best = null, bestD = Infinity;
    for (const b of game.bloons) {
      if (!b.alive) continue;
      if (b.camo && !p.canSeeCamo) continue;
      const d = Util.dist2(p.x, p.y, b.x, b.y);
      if (d < bestD) { bestD = d; best = b; }
    }
    p.target = best;
  }

  if (p.homing && p.target && p.target.alive) {
    const ang = Math.atan2(p.target.y - p.y, p.target.x - p.x);
    const speed = Math.hypot(p.vx, p.vy);
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed;
  }

  if (p.rotSpeed) p.angle += p.rotSpeed * dt;

  // Out of bounds
  if (p.x < -50 || p.x > 950 || p.y < -50 || p.y > 750) p.dead = true;

  // Check collisions
  for (const b of game.bloons) {
    if (!b.alive) continue;
    if (p.hits.includes(b.id)) continue;
    if (b.camo && !p.canSeeCamo) continue;
    const dr = b.radius + p.radius;
    if (Util.dist2(p.x, p.y, b.x, b.y) < dr * dr) {
      hitBloon(p, b, game);
      if (p.pierce <= 0 || p.dead) return;
    }
  }
}

function canDamage(p, b) {
  if (b.type.props) {
    if (b.type.props.lead && !p.canPopLead) return false;
    if (b.type.props.black && !p.canPopBlack) return false;
    if (b.type.props.white && !p.canPopWhite) return false;
  }
  if (b.type.isBlimp && !p.canDamageBlimp) return false;
  if (b.freezeTimer > 0 && !p.canPopFrozen) return false;
  if (b.fortified && p.type === 'tack' && b.type.props && b.type.props.lead) return false;
  return true;
}

function hitBloon(p, b, game) {
  if (!canDamage(p, b)) { return; }
  p.hits.push(b.id);
  p.pierce--;

  let dmg = p.damage;
  if (b.type.isBlimp && p.extraDamageBlimp) dmg += p.extraDamageBlimp;
  if (b.typeKey === 'ceramic' && p.extraDamageCeramic) dmg += p.extraDamageCeramic;
  if ((b.typeKey === 'moab' || b.typeKey === 'bfb' || b.typeKey === 'zomg') && p.extraDamageMoab) dmg += p.extraDamageMoab;
  if (b.fortified) dmg = Math.max(1, Math.floor(dmg * 0.85));

  applyDamage(b, dmg, game, p.owner);
  if (p.onHit) p.onHit(p, b, game);

  // Status effects
  if (p.freeze > 0 && !(b.type.props && b.type.props.white) && !b.type.isBlimp) {
    b.freezeTimer = Math.max(b.freezeTimer, p.freeze);
  }
  if (p.glue > 0 && !b.type.isBlimp) {
    b.glueTimer = Math.max(b.glueTimer, p.glue);
    b.glueStacks = Math.max(b.glueStacks, p.glueAmount || 1);
  }
  if (p.slowAmount > 0) {
    b.statuses.slow = { mult: p.slowAmount, timer: p.slowDuration };
  }
  if (p.stun > 0) {
    b.stunTimer = Math.max(b.stunTimer, p.stun);
  }

  // Explosion
  if (p.explodes) {
    explode(p.x, p.y, p.explodeRadius, p.explodeDamage, game, {
      canPopLead: p.canPopLead,
      canPopBlack: p.canPopBlack,
      canSeeCamo: p.canSeeCamo,
      owner: p.owner,
      sourceProj: p,
      stun: p.explodeStun
    });
  }

  if (p.pierce <= 0) p.dead = true;
}

function explode(x, y, radius, damage, game, opts) {
  opts = opts || {};
  game.effects.push({ type: 'explosion', x, y, r: 0, maxR: radius, age: 0, lifetime: 0.4 });
  Audio.boom();
  for (const b of game.bloons) {
    if (!b.alive) continue;
    if (b.camo && !opts.canSeeCamo) continue;
    const d = Util.dist(x, y, b.x, b.y);
    if (d < radius + b.radius) {
      // Mock projectile-like rules
      const fake = {
        canPopLead: opts.canPopLead || false,
        canPopBlack: opts.canPopBlack === undefined ? true : opts.canPopBlack,
        canPopWhite: true,
        canPopFrozen: true,
        canDamageBlimp: true,
        type: 'explosion'
      };
      if (!canDamage(fake, b)) continue;
      const falloff = 1 - d / (radius + b.radius);
      applyDamage(b, Math.max(1, Math.floor(damage * (0.5 + falloff * 0.5))), game, opts.owner);
      if (opts.stun) b.stunTimer = Math.max(b.stunTimer, opts.stun);
    }
  }
}

function applyDamage(b, dmg, game, owner) {
  if (!b.alive) return;
  b.hp -= dmg;
  // Damage popup
  game.effects.push({ type: 'dmg', x: b.x, y: b.y, dmg: Math.floor(dmg), age: 0, lifetime: 0.6 });

  if (b.hp <= 0) {
    popLayer(b, game, owner);
  }
}

function popLayer(b, game, owner) {
  if (!b.alive) return;
  // Money
  const reward = b.type.value || 1;
  game.money += reward;
  if (owner) owner.totalCash = (owner.totalCash || 0) + reward;

  // Pop sound and effect
  if (b.type.isBlimp) {
    Audio.bigPop();
    game.effects.push({ type: 'bigpop', x: b.x, y: b.y, r: 0, maxR: b.radius * 2, age: 0, lifetime: 0.5 });
  } else {
    Audio.pop();
    game.effects.push({ type: 'pop', x: b.x, y: b.y, r: 0, maxR: b.radius * 1.5, age: 0, lifetime: 0.25, color: b.type.color });
  }

  // Spawn children
  const children = popChildren(b);
  b.alive = false;
  for (const c of children) {
    const child = makeBloon(c.typeKey, b.pathDist + Util.rand(-3, 3), {
      camo: c.camo, regrow: c.regrow, regrowStack: c.regrowStack, fortified: c.fortified
    });
    // Slight offset so they spread
    child.pathDist = Math.max(0, b.pathDist + Util.rand(-8, 8));
    game.bloons.push(child);
  }

  game.popsThisRound = (game.popsThisRound || 0) + 1;
  game.totalPops = (game.totalPops || 0) + 1;
}
