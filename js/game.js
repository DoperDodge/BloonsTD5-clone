// Core game state and game loop
const Game = {
  state: 'menu', // menu, playing, paused, victory, defeat
  map: null,
  difficulty: 'easy',
  mode: 'standard',
  towers: [],
  bloons: [],
  projectiles: [],
  effects: [],
  spikePiles: [],
  sentries: [],
  money: 650,
  lives: 100,
  startingLives: 100,
  startingMoney: 650,
  round: 0,
  maxRound: TOTAL_ROUNDS,
  inRound: false,
  selectedTower: null,
  selectedShopTower: null,
  hoverX: 0, hoverY: 0,
  speed: 1,
  paused: false,
  pathLen: 0,
  spawnQueue: [],
  roundElapsed: 0,
  roundComplete: false,
  popsThisRound: 0,
  totalPops: 0,
  freeplay: false,

  init(mapKey, difficulty, mode) {
    this.map = Maps[mapKey];
    this.difficulty = difficulty;
    this.mode = mode;
    this.towers = [];
    this.bloons = [];
    this.projectiles = [];
    this.effects = [];
    this.spikePiles = [];
    this.sentries = [];
    this.selectedTower = null;
    this.selectedShopTower = null;
    this.round = 0;
    this.popsThisRound = 0;
    this.totalPops = 0;
    this.spawnQueue = [];
    this.roundElapsed = 0;
    this.roundComplete = false;
    this.inRound = false;
    this.speed = 1;
    this.paused = false;
    this.freeplay = false;
    this.state = 'playing';
    this.pathLen = Util.pathLength(this.map.path);
    this.applyDifficulty();
    if (mode === 'apopalypse') {
      // Apopalypse: no pause between rounds
      this.startRound();
    }
    if (mode === 'sandbox') {
      this.money = 9999999;
      this.lives = 9999;
    }
  },

  applyDifficulty() {
    const diff = this.difficulty;
    const mode = this.mode;
    if (mode === 'deflation') {
      this.money = 20000;
      this.lives = 200;
    } else {
      if (diff === 'easy') { this.money = 650; this.lives = 200; }
      else if (diff === 'medium') { this.money = 650; this.lives = 150; }
      else if (diff === 'hard') { this.money = 650; this.lives = 100; }
      else if (diff === 'impoppable') { this.money = 650; this.lives = 1; }
    }
    this.startingLives = this.lives;
    this.startingMoney = this.money;
  },

  costMultiplier() {
    switch (this.difficulty) {
      case 'easy': return 0.85;
      case 'medium': return 1.0;
      case 'hard': return 1.08;
      case 'impoppable': return 1.2;
      default: return 1.0;
    }
  },

  hpMultiplier() {
    // Bloon HP scaling by difficulty
    switch (this.difficulty) {
      case 'easy': return 1.0;
      case 'medium': return 1.0;
      case 'hard': return 1.15;
      case 'impoppable': return 1.5;
      default: return 1.0;
    }
  },

  speedMultiplier() {
    switch (this.difficulty) {
      case 'easy': return 1.0;
      case 'medium': return 1.0;
      case 'hard': return 1.05;
      case 'impoppable': return 1.1;
      default: return 1.0;
    }
  },

  towerCost(typeKey) {
    return Math.floor(TowerTypes[typeKey].cost * this.costMultiplier());
  },

  canPlaceTower(typeKey, x, y) {
    const def = TowerTypes[typeKey];
    if (!def) return false;
    // Check path distance
    const minDist = def.placeable === 'water' ? 0 : (this.map.pathWidth / 2 + def.radius - 5);
    if (def.placeable === 'land' && Util.distToPath(x, y, this.map.path) < minDist) return false;
    // Water placement
    if (def.placeable === 'water') {
      const water = this.map.water;
      if (!water) return false;
      let inWater = false;
      for (const w of water) {
        if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) inWater = true;
      }
      if (!inWater) return false;
    } else {
      // Land - not in water
      if (this.map.water) {
        for (const w of this.map.water) {
          if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return false;
        }
      }
    }
    // Check boundaries
    if (x < def.radius || x > 900 - def.radius || y < def.radius || y > 700 - def.radius) return false;
    // Check overlap with other towers
    for (const t of this.towers) {
      if (Util.dist2(t.x, t.y, x, y) < (t.radius + def.radius) ** 2) return false;
    }
    // Check decorations - flowers are tiny, trees/rocks bigger
    if (this.map.decorations) {
      for (const d of this.map.decorations) {
        const decR = (d.type === 'flower') ? 6 : (d.type === 'bush' ? 12 : 16);
        if (Util.dist2(d.x, d.y, x, y) < (decR + def.radius - 6) ** 2) return false;
      }
    }
    return true;
  },

  placeTower(typeKey, x, y) {
    const cost = this.towerCost(typeKey);
    if (this.money < cost) return null;
    if (!this.canPlaceTower(typeKey, x, y)) return null;
    const t = makeTower(typeKey, x, y);
    t.investedCost = cost;
    t.sellRefund = Math.floor(cost * 0.7);
    this.money -= cost;
    this.towers.push(t);
    if (t.isHeli) {
      t.heliTargetX = x;
      t.heliTargetY = y;
      t.aircraftX = x;
      t.aircraftY = y;
    }
    if (t.isAircraft && !t.isHeli) {
      t.aircraftX = x + Math.cos(t.flightAngle) * t.flightRadius;
      t.aircraftY = y + Math.sin(t.flightAngle) * t.flightRadius;
    }
    Audio.build();
    this.recalculateBuffs();
    return t;
  },

  sellTower(t) {
    this.money += t.sellRefund;
    if (this.selectedTower === t) this.selectedTower = null;
    this.towers = this.towers.filter(x => x !== t);
    Audio.sell();
    this.recalculateBuffs();
  },

  upgradeTower(t, path) {
    if (!canUpgrade(t, path)) return;
    const upg = nextUpgrade(t, path);
    const cost = Math.floor(upg.cost * this.costMultiplier());
    let discount = 0;
    for (const v of this.towers) {
      if (v.isVillage && v.discountNearby) {
        if (Util.dist2(v.x, v.y, t.x, t.y) < v.range * v.range) {
          discount = Math.max(discount, v.discountNearby);
        }
      }
    }
    const finalCost = Math.floor(cost * (1 - discount));
    if (this.money < finalCost) return;
    this.money -= finalCost;
    upgradeTower(t, path);
    Audio.upgrade();
    this.recalculateBuffs();
    // Re-update aircraft path
    if (t.isAircraft && !t.isHeli) {
      t.flightRadius = t.type.flightRadius || 180;
    }
  },

  recalculateBuffs() {
    // Reset each tower's effective stats then apply village buffs
    for (const t of this.towers) {
      // Reset to base + upgrade-modified stats (towers store their own state, so we use t.range, t.fireRate directly)
      t.effRange = t.range;
      t.effFireRate = t.fireRate;
      t.effCanSeeCamo = t.canSeeCamo;
      t.boostedBy = {};
    }
    for (const v of this.towers) {
      if (!v.isVillage) continue;
      for (const t of this.towers) {
        if (t === v) continue;
        if (Util.dist2(v.x, v.y, t.x, t.y) < v.range * v.range) {
          if (v.buffs.range) t.effRange *= v.buffs.range;
          if (v.buffs.fireRate) t.effFireRate *= v.buffs.fireRate;
          if (v.buffs.canSeeCamo) t.effCanSeeCamo = true;
          t.boostedBy[v.x + ',' + v.y] = true;
        }
      }
    }
  },

  startRound() {
    if (this.inRound) return;
    if (this.round >= this.maxRound && !this.freeplay) {
      this.victory();
      return;
    }
    this.inRound = true;
    this.roundElapsed = 0;
    this.popsThisRound = 0;
    this.roundComplete = false;
    this.spawnQueue = [];
    const groups = getRound(this.round);
    for (const g of groups) {
      for (let i = 0; i < g.count; i++) {
        this.spawnQueue.push({
          time: g.delay + i * g.spacing,
          type: g.type,
          camo: g.camo || false,
          regrow: g.regrow || false,
          fortified: g.fortified || false
        });
      }
    }
    this.spawnQueue.sort((a, b) => a.time - b.time);
    Audio.roundStart();
  },

  endRound() {
    this.inRound = false;
    this.roundComplete = true;
    this.round++;
    if (this.round >= this.maxRound && !this.freeplay) {
      this.victory();
      return;
    }
    // Cash reward
    const reward = roundReward(this.round - 1, this.mode);
    this.money += reward;
    this.effects.push({ type: 'cash', x: 450, y: 80, amount: reward, age: 0, lifetime: 1.5 });
    // Farm income
    for (const t of this.towers) {
      if (t.isFarm && t.cashPerRound > 0) {
        let mult = 1;
        // Banana Central buff
        for (const v of this.towers) {
          if (v.boostsFarms && v !== t && Util.dist2(v.x, v.y, t.x, t.y) < v.range * v.range) mult = 1.25;
        }
        this.money += Math.floor(t.cashPerRound * mult);
        this.effects.push({ type: 'cash', x: t.x, y: t.y, amount: Math.floor(t.cashPerRound * mult), age: 0, lifetime: 1.2 });
      }
      // Bank interest
      if (t.isBank) {
        t.bankBalance = Math.min(t.bankMax, Math.floor(t.bankBalance * (1 + t.bankInterest) + 30));
      }
    }
    Audio.cash();
    // Auto-start in apopalypse
    if (this.mode === 'apopalypse') setTimeout(() => this.startRound(), 100);
  },

  victory() {
    this.state = 'victory';
    Audio.victory();
    this.saveStats(true);
    UI.showOverlay('VICTORY!', `You popped ${this.totalPops} balloons across ${this.round} rounds.`);
  },

  defeat() {
    this.state = 'defeat';
    Audio.defeat();
    this.saveStats(false);
    UI.showOverlay('DEFEAT!', `The balloons won. You made it to round ${this.round + 1}.`);
  },

  // Main update loop
  update(dt) {
    if (this.state !== 'playing' || this.paused) return;
    dt *= this.speed;

    // Spawn bloons from queue
    if (this.inRound) {
      this.roundElapsed += dt;
      while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.roundElapsed) {
        const s = this.spawnQueue.shift();
        this.spawnBloon(s.type, s.camo, s.regrow, s.fortified);
      }
      // Check round complete
      if (this.spawnQueue.length === 0 && this.bloons.length === 0) {
        this.endRound();
      }
    }

    // Update bloons
    for (const b of this.bloons) this.updateBloon(b, dt);
    this.bloons = this.bloons.filter(b => b.alive);

    // Update towers
    for (const t of this.towers) this.updateTower(t, dt);

    // Update projectiles
    for (const p of this.projectiles) updateProjectile(p, dt, this);
    this.projectiles = this.projectiles.filter(p => !p.dead);

    // Update spike piles
    for (const s of this.spikePiles) this.updateSpike(s, dt);
    this.spikePiles = this.spikePiles.filter(s => s.charges > 0 && s.lifetime > 0);

    // Update sentries
    for (const s of this.sentries) this.updateSentry(s, dt);
    this.sentries = this.sentries.filter(s => s.lifetime > 0);

    // Update effects
    for (const e of this.effects) e.age += dt;
    this.effects = this.effects.filter(e => e.age < e.lifetime);

    // Update UI
    UI.updateHUD();
  },

  spawnBloon(typeKey, camo, regrow, fortified) {
    const b = makeBloon(typeKey, 0, { camo, regrow, fortified });
    b.maxHp = b.maxHp * this.hpMultiplier();
    b.hp = b.maxHp;
    this.bloons.push(b);
  },

  updateBloon(b, dt) {
    if (!b.alive) return;
    // Speed calculation
    let speed = b.type.speed * 50 * this.speedMultiplier();
    if (b.glueTimer > 0) speed *= 1 - (0.15 * (b.glueStacks || 1));
    if (b.freezeTimer > 0) speed *= b.type.props && b.type.props.white ? 0.7 : 0;
    if (b.stunTimer > 0) speed *= 0;
    if (b.statuses.slow && b.statuses.slow.timer > 0) speed *= b.statuses.slow.mult;
    if (b.type.isBlimp && b.glueTimer > 0) speed *= 0.85; // less effect on blimps

    b.pathDist += speed * dt;

    // Regrow logic
    if (b.regrow && !b.type.isBlimp) {
      b.regrowTimer -= dt;
      if (b.regrowTimer <= 0) {
        b.regrowTimer = 3.0;
        // Try to regrow a layer
        const order = ['red', 'blue', 'green', 'yellow', 'pink'];
        const idx = order.indexOf(b.typeKey);
        if (idx >= 0 && idx < order.length - 1) {
          b.typeKey = order[idx + 1];
          b.type = BloonTypes[b.typeKey];
          b.radius = b.type.radius * (b.fortified ? 1.1 : 1);
          b.hp = b.type.hp || 1;
          b.maxHp = b.hp * this.hpMultiplier();
          b.hp = b.maxHp;
        }
      }
    }

    // Decrement timers
    if (b.freezeTimer > 0) b.freezeTimer -= dt;
    if (b.glueTimer > 0) b.glueTimer -= dt;
    if (b.stunTimer > 0) b.stunTimer -= dt;
    if (b.statuses.slow) {
      b.statuses.slow.timer -= dt;
      if (b.statuses.slow.timer <= 0) delete b.statuses.slow;
    }

    // Check spike collisions
    for (const s of this.spikePiles) {
      if (s.charges <= 0) continue;
      const dr = b.radius + 8;
      if (Util.dist2(b.x, b.y, s.x, s.y) < dr * dr && !(b.camo && !s.canSeeCamo)) {
        const fake = {
          canPopLead: s.canPopLead || false,
          canPopBlack: true,
          canPopWhite: true,
          canPopFrozen: s.canPopFrozen || false,
          canDamageBlimp: true,
          type: 'spike'
        };
        if (canDamage(fake, b)) {
          let dmg = s.damage;
          if (b.type.isBlimp) dmg += s.extraDamageMoab || 0;
          applyDamage(b, dmg, this, s.owner);
          s.charges--;
          if (s.explodes) {
            explode(s.x, s.y, 40, 2, this, { canPopLead: true, owner: s.owner });
          }
          if (!b.alive) break;
        }
      }
    }

    // Position
    const pos = Util.positionOnPath(this.map.path, b.pathDist);
    b.x = pos.x;
    b.y = pos.y;
    b.angle = pos.angle;

    // Reached end
    if (pos.done) {
      const lives = bloonRBE(b) * (b.type.isBlimp ? 1 : 1);
      this.lives -= Math.min(lives, 50);
      b.alive = false;
      Audio.hit();
      if (this.lives <= 0 && this.mode !== 'sandbox') {
        this.lives = 0;
        this.defeat();
      }
    }
  },

  updateTower(t, dt) {
    t.age = (t.age || 0) + dt;
    if (t.cooldown > 0) t.cooldown -= dt;
    if (t.abilityCooldown > 0 && !t.abilityReady) {
      t.abilityCooldown -= dt;
      if (t.abilityCooldown <= 0) {
        t.abilityCooldown = 0;
        t.abilityReady = true;
      }
    }
    if (t.flashTimer > 0) t.flashTimer -= dt;

    // Aircraft pathing
    if (t.isAircraft && !t.isHeli) {
      t.flightAngle += t.flightSpeed * dt;
      const cx = t.x;
      const cy = t.y;
      const ax = cx + Math.cos(t.flightAngle) * t.flightRadius;
      const ay = cy + Math.sin(t.flightAngle) * t.flightRadius;
      t.aircraftX = ax;
      t.aircraftY = ay;
      t.angle = t.flightAngle + Math.PI / 2;
    }

    // Heli pathing
    if (t.isHeli) {
      const dx = t.heliTargetX - t.aircraftX || (t.heliTargetX - t.x);
      const dy = t.heliTargetY - t.aircraftY || (t.heliTargetY - t.y);
      if (!t.aircraftX) { t.aircraftX = t.x; t.aircraftY = t.y; }
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        const sp = 200 * (t.heliSpeed || 1) * dt;
        t.aircraftX += (dx / dist) * sp;
        t.aircraftY += (dy / dist) * sp;
        t.angle = Math.atan2(dy, dx);
      }
    }

    if (t.isFarm || t.isVillage) {
      if (t.isBank) {
        // Bank generates passively
      }
      return;
    }

    // Compute firing position for aircraft
    const fx = (t.isAircraft) ? (t.aircraftX || t.x) : t.x;
    const fy = (t.isAircraft) ? (t.aircraftY || t.y) : t.y;

    // Ice tower aura
    if (t.type.id === 'ice') {
      if (t.cooldown <= 0) {
        let hitAny = false;
        for (const b of this.bloons) {
          if (!b.alive) continue;
          if (b.camo && !t.effCanSeeCamo) continue;
          if (b.type.props && b.type.props.white) continue;
          if (b.type.isBlimp) continue;
          if (Util.dist2(fx, fy, b.x, b.y) < t.effRange * t.effRange) {
            b.freezeTimer = Math.max(b.freezeTimer, t.freezeDuration);
            if (t.iceShards) applyDamage(b, 1, this, t);
            if (t.proj.canPopLead && b.type.props && b.type.props.lead) {
              applyDamage(b, 1, this, t);
            }
            if (t.viralFrost) {
              // Spread to nearby bloons
              for (const b2 of this.bloons) {
                if (b2 === b || !b2.alive) continue;
                if (Util.dist2(b.x, b.y, b2.x, b2.y) < 60 * 60) {
                  if (!(b2.type.props && b2.type.props.white) && !b2.type.isBlimp) {
                    b2.freezeTimer = Math.max(b2.freezeTimer, t.freezeDuration * 0.5);
                  }
                }
              }
            }
            hitAny = true;
          }
        }
        if (hitAny) {
          t.cooldown = 1 / t.effFireRate;
          this.effects.push({ type: 'iceaura', x: fx, y: fy, r: t.effRange, age: 0, lifetime: 0.4 });
          Audio.freeze();
        }
      }
      return;
    }

    // Spike factory
    if (t.isSpikeFactory) {
      if (t.cooldown <= 0) {
        const place = this.findRandomPathPoint();
        if (place) {
          this.spikePiles.push({
            x: place.x, y: place.y,
            charges: t.spikesPerPile,
            maxCharges: t.spikesPerPile,
            damage: t.spikeDamage,
            pierce: t.spikePierce,
            canPopLead: t.spikeCanPopLead,
            canPopFrozen: t.spikeCanPopFrozen,
            extraDamageMoab: t.spikeExtraDamageMoab,
            explodes: t.spikeExplodes,
            owner: t,
            lifetime: 60
          });
        }
        t.cooldown = 1 / t.effFireRate;
      }
      return;
    }

    // Engineer sentries
    if (t.canBuildSentry) {
      t.sentryCooldownTimer = (t.sentryCooldownTimer || 0) - dt;
      if (t.sentryCooldownTimer <= 0) {
        const sentryCount = this.sentries.filter(s => s.owner === t).length;
        if (sentryCount < 3) {
          // Place sentry near tower at valid spot
          for (let tries = 0; tries < 12; tries++) {
            const ang = Math.random() * Math.PI * 2;
            const r = 30 + Math.random() * 50;
            const sx = t.x + Math.cos(ang) * r;
            const sy = t.y + Math.sin(ang) * r;
            if (sx > 20 && sx < 880 && sy > 20 && sy < 680 && Util.distToPath(sx, sy, this.map.path) > this.map.pathWidth / 2 + 5) {
              this.sentries.push({
                x: sx, y: sy, owner: t, range: 100,
                fireRate: t.sentryRate, cooldown: 0,
                damage: 1, pierce: 2, angle: 0,
                lifetime: 15, maxLifetime: 15,
                canSeeCamo: t.effCanSeeCamo
              });
              break;
            }
          }
          t.sentryCooldownTimer = t.sentryCooldown || 12;
        }
      }
    }

    // Mortar fires on cooldown regardless of target (lobs at aim point)
    if (t.isMortar) {
      if (t.cooldown <= 0 && this.bloons.length > 0) {
        this.fireMortar(t, fx, fy);
        t.cooldown = 1 / t.effFireRate;
        t.flashTimer = 0.1;
      }
      return;
    }

    // Dartling fires at cursor direction whenever any bloons exist
    if (t.isDartling) {
      const dx = this.hoverX - fx;
      const dy = this.hoverY - fy;
      t.angle = Math.atan2(dy, dx);
      if (t.cooldown <= 0 && this.bloons.length > 0) {
        this.spawnProjectileFromTower(t, fx, fy, t.angle);
        t.cooldown = 1 / t.effFireRate;
        t.flashTimer = 0.1;
      }
      return;
    }

    // Find target
    const target = this.findTarget(t, fx, fy);
    if (target) {
      const dx = target.x - fx;
      const dy = target.y - fy;
      // Aim
      if (!t.isAircraft) {
        t.angle = Math.atan2(dy, dx);
      }
      if (t.cooldown <= 0) {
        this.fireTower(t, target, fx, fy);
        t.cooldown = 1 / t.effFireRate;
        t.flashTimer = 0.1;
      }
    } else if (t.type.id === 'tack' && t.cooldown <= 0) {
      // Tack shooter fires in all directions when bloons in range
      let any = false;
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (b.camo && !t.effCanSeeCamo) continue;
        if (Util.dist2(fx, fy, b.x, b.y) < t.effRange * t.effRange) { any = true; break; }
      }
      if (any) {
        this.fireTacks(t, fx, fy);
        t.cooldown = 1 / t.effFireRate;
        t.flashTimer = 0.1;
      }
    }
  },

  findTarget(t, fx, fy) {
    if (t.isMortar) {
      // Mortar uses a designated aim point
      if (!t.aimX) { t.aimX = 450; t.aimY = 350; }
      // Lob shells toward aim point
      return null; // Mortar fires differently
    }
    if (t.isDartling) {
      // Use cursor direction
      return null; // Dartling fires based on cursor
    }
    let candidates = [];
    for (const b of this.bloons) {
      if (!b.alive) continue;
      if (b.camo && !t.effCanSeeCamo) continue;
      if (Util.dist2(fx, fy, b.x, b.y) < t.effRange * t.effRange) {
        candidates.push(b);
      }
    }
    if (candidates.length === 0) return null;
    const mode = t.targetMode;
    if (mode === 0) {
      // First (furthest along path)
      candidates.sort((a, b) => b.pathDist - a.pathDist);
    } else if (mode === 1) {
      // Last (least far)
      candidates.sort((a, b) => a.pathDist - b.pathDist);
    } else if (mode === 2) {
      // Strong (highest RBE)
      candidates.sort((a, b) => bloonRBE(b) - bloonRBE(a));
    } else if (mode === 3) {
      // Close
      candidates.sort((a, b) => Util.dist2(fx, fy, a.x, a.y) - Util.dist2(fx, fy, b.x, b.y));
    }
    return candidates[0];
  },

  fireTower(t, target, fx, fy) {
    Audio.shoot();
    if (t.isMortar) {
      this.fireMortar(t, fx, fy);
      return;
    }
    if (t.type.id === 'tack') {
      this.fireTacks(t, fx, fy);
      return;
    }
    if (t.type.id === 'glue') {
      // Glue fires multi-shot if upgraded
      const n = t.multiShot || 1;
      const spread = t.spreadAngle || 0;
      const baseAng = t.angle;
      for (let i = 0; i < n; i++) {
        const offset = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread;
        this.spawnProjectileFromTower(t, fx, fy, baseAng + offset);
      }
      return;
    }
    // Boomerang
    if (t.type.id === 'boomerang') {
      this.fireBoomerang(t, target, fx, fy);
      return;
    }
    // Wizard fireball
    if (t.type.id === 'wizard' && t.fireball) {
      this.fireWizard(t, target, fx, fy);
      return;
    }
    // Standard
    const n = t.multiShot || 1;
    const spread = t.spreadAngle || 0;
    const baseAng = t.angle;
    for (let i = 0; i < n; i++) {
      const offset = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread;
      this.spawnProjectileFromTower(t, fx, fy, baseAng + offset);
    }
    // Pineapples
    if (t.pineapples && t.type.id === 'ace' && Math.random() < 0.3) {
      const p = makeProjectile({
        x: fx, y: fy, vx: 0, vy: 80, lifetime: 1.5,
        damage: 3, pierce: 99, radius: 6,
        type: 'bomb', color: '#fbbf24',
        explodes: true, explodeRadius: 50, explodeDamage: 3,
        canPopLead: true, canPopBlack: true,
        owner: t
      });
      this.projectiles.push(p);
    }
    // Bomber Ace bomb
    if (t.bomberAce && t.type.id === 'ace') {
      const p = makeProjectile({
        x: fx, y: fy, vx: Math.cos(t.angle) * 200, vy: Math.sin(t.angle) * 200,
        lifetime: 1.5,
        damage: t.proj.damage, pierce: 99, radius: 8,
        type: 'bomb', color: '#1f2937',
        explodes: true, explodeRadius: 60, explodeDamage: 3,
        canPopLead: true, canPopBlack: false,
        owner: t
      });
      this.projectiles.push(p);
    }
  },

  spawnProjectileFromTower(t, fx, fy, ang) {
    const speed = t.proj.speed || 500;
    const p = makeProjectile({
      x: fx, y: fy,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      angle: ang,
      damage: t.proj.damage,
      pierce: t.proj.pierce,
      lifetime: t.proj.lifetime,
      radius: t.proj.radius,
      color: t.proj.color,
      type: t.proj.type,
      canPopLead: t.proj.canPopLead || false,
      canPopBlack: t.proj.canPopBlack !== false,
      canPopWhite: t.proj.canPopWhite !== false,
      canPopFrozen: t.proj.canPopFrozen || false,
      canSeeCamo: t.effCanSeeCamo,
      explodes: t.proj.explodes,
      explodeRadius: t.proj.explodeRadius,
      explodeDamage: t.proj.explodeDamage,
      explodeStun: t.proj.explodeStun,
      freeze: t.proj.freeze,
      glue: t.proj.glue,
      glueAmount: t.proj.glueAmount,
      stun: t.proj.stun,
      slowAmount: t.proj.slowAmount,
      slowDuration: t.proj.slowDuration,
      extraDamageMoab: t.proj.extraDamageMoab,
      extraDamageBlimp: t.proj.extraDamageBlimp,
      extraDamageCeramic: t.proj.extraDamageCeramic,
      homing: t.proj.homing || t.homing,
      target: null,
      owner: t
    });
    this.projectiles.push(p);
  },

  fireTacks(t, fx, fy) {
    const count = t.tackCount || 8;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      this.spawnProjectileFromTower(t, fx, fy, ang);
    }
    if (t.ringOfFire) {
      // Add ring of fire effect
      this.effects.push({ type: 'wallfire', x: fx, y: fy, r: t.effRange * 0.8, age: 0, lifetime: 0.6 });
      explode(fx, fy, t.effRange * 0.8, 1, this, { canPopLead: true, canSeeCamo: t.effCanSeeCamo, owner: t });
    }
  },

  fireMortar(t, fx, fy) {
    if (!t.aimX) { t.aimX = 450; t.aimY = 350; }
    // Slight inaccuracy
    const acc = t.accuracy || 25;
    const tx = t.aimX + Util.rand(-acc, acc);
    const ty = t.aimY + Util.rand(-acc, acc);
    const lifetime = 1.3;
    const p = makeProjectile({
      x: fx, y: fy,
      vx: (tx - fx) / lifetime,
      vy: (ty - fy) / lifetime,
      damage: t.proj.damage,
      pierce: t.proj.pierce,
      lifetime: lifetime,
      radius: t.proj.radius,
      color: t.proj.color,
      type: 'shell',
      canPopLead: t.proj.canPopLead,
      canPopBlack: t.proj.canPopBlack !== false,
      canSeeCamo: true,
      explodes: true,
      explodeRadius: t.proj.explodeRadius,
      explodeDamage: t.proj.explodeDamage,
      explodeStun: t.proj.explodeStun || t.proj.stun,
      extraDamageMoab: t.proj.extraDamageMoab,
      owner: t,
      behavior: function(p, dt, game) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // No collisions for mortar in flight - it always explodes at target
        if (p.age >= p.lifetime - dt) {
          if (p.explodes) {
            explode(p.x, p.y, p.explodeRadius, p.explodeDamage, game, {
              canPopLead: p.canPopLead,
              canPopBlack: p.canPopBlack,
              canSeeCamo: true,
              owner: p.owner,
              stun: p.explodeStun
            });
          }
          p.dead = true;
        }
      }
    });
    // Make sure projectile doesn't trigger collisions in flight
    p.pierce = 0; // no hits in flight
    this.projectiles.push(p);
  },

  fireBoomerang(t, target, fx, fy) {
    const p = makeProjectile({
      x: fx, y: fy,
      damage: t.proj.damage,
      pierce: t.proj.pierce,
      lifetime: 1.8,
      radius: t.proj.radius,
      color: t.proj.color,
      type: 'boomerang',
      canPopLead: t.proj.canPopLead,
      canSeeCamo: t.effCanSeeCamo,
      owner: t,
      rotSpeed: 18,
      // Throw curve - boomerang goes out and comes back
      startX: fx, startY: fy,
      angle0: t.angle,
      behavior: function(p, dt, game) {
        const dur = 1.8;
        const t01 = p.age / dur;
        const dist = Math.sin(t01 * Math.PI) * 200;
        const curveOffset = Math.sin(t01 * Math.PI) * 60;
        p.x = p.startX + Math.cos(p.angle0) * dist + Math.cos(p.angle0 + Math.PI / 2) * curveOffset;
        p.y = p.startY + Math.sin(p.angle0) * dist + Math.sin(p.angle0 + Math.PI / 2) * curveOffset;
      }
    });
    this.projectiles.push(p);
  },

  fireWizard(t, target, fx, fy) {
    if (t.fireball) {
      const ang = t.angle;
      const speed = 500;
      const p = makeProjectile({
        x: fx, y: fy,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        damage: t.proj.damage,
        pierce: 99,
        lifetime: 0.9,
        radius: 10,
        color: '#f97316',
        type: 'magic',
        canPopLead: true,
        canSeeCamo: t.effCanSeeCamo,
        explodes: true,
        explodeRadius: 50,
        explodeDamage: t.proj.damage,
        owner: t,
        trailColor: '#fb923c'
      });
      this.projectiles.push(p);
      return;
    }
    this.spawnProjectileFromTower(t, fx, fy, t.angle);
  },

  updateSpike(s, dt) {
    s.lifetime -= dt;
  },

  updateSentry(s, dt) {
    s.lifetime -= dt;
    s.cooldown -= dt;
    let target = null;
    let bestPath = -1;
    for (const b of this.bloons) {
      if (!b.alive) continue;
      if (b.camo && !s.canSeeCamo) continue;
      if (Util.dist2(s.x, s.y, b.x, b.y) < s.range * s.range) {
        if (b.pathDist > bestPath) {
          bestPath = b.pathDist;
          target = b;
        }
      }
    }
    if (target) {
      const ang = Math.atan2(target.y - s.y, target.x - s.x);
      s.angle = ang;
      if (s.cooldown <= 0) {
        const p = makeProjectile({
          x: s.x, y: s.y,
          vx: Math.cos(ang) * 600, vy: Math.sin(ang) * 600,
          angle: ang,
          damage: s.damage, pierce: s.pierce,
          lifetime: 0.4, radius: 3, color: '#fde047',
          type: 'nail', canSeeCamo: s.canSeeCamo,
          owner: s.owner
        });
        this.projectiles.push(p);
        s.cooldown = 1 / s.fireRate;
      }
    }
  },

  findRandomPathPoint() {
    const d = Math.random() * this.pathLen;
    const pos = Util.positionOnPath(this.map.path, d);
    return pos;
  },

  triggerAbility(t) {
    if (!t.abilityReady) return;
    t.abilityReady = false;
    t.abilityCooldown = t.type.abilityCooldown || 60;
    const ability = t.activeAbility;
    Audio.upgrade();
    if (ability === 'maelstrom') {
      // Throws lots of blades in all directions
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2;
        this.spawnProjectileFromTower(t, t.x, t.y, ang);
      }
    } else if (ability === 'azero') {
      // Absolute zero - freezes everything for 5s
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (b.type.props && b.type.props.white) continue;
        if (b.type.isBlimp) continue;
        b.freezeTimer = 5;
      }
      this.effects.push({ type: 'flash', x: 450, y: 350, r: 0, maxR: 600, age: 0, lifetime: 0.6 });
      Audio.freeze();
    } else if (ability === 'supply') {
      this.money += 1200;
      this.effects.push({ type: 'cash', x: t.x, y: t.y, amount: 1200, age: 0, lifetime: 1.5 });
    } else if (ability === 'fanclub') {
      // Permanent boost for short duration - just rapid fire for 12 sec
      t._fanclubTimer = 12;
    } else if (ability === 'turbo') {
      t._turboTimer = 30;
    } else if (ability === 'sabotage') {
      // Half all bloon speed
      for (const b of this.bloons) b.statuses.slow = { mult: 0.5, timer: 15 };
    } else if (ability === 'antibloon') {
      // Big damage to all bloons in range
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (Util.dist2(t.x, t.y, b.x, b.y) < t.effRange * t.effRange) {
          applyDamage(b, b.type.isBlimp ? 1000 : 50, this, t);
        }
      }
      this.effects.push({ type: 'flash', x: t.x, y: t.y, r: 0, maxR: t.effRange, age: 0, lifetime: 0.5 });
    } else if (ability === 'techterror') {
      // Quick damage burst
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (Util.dist2(t.x, t.y, b.x, b.y) < t.effRange * t.effRange) {
          applyDamage(b, 20, this, t);
        }
      }
      this.effects.push({ type: 'flash', x: t.x, y: t.y, r: 0, maxR: t.effRange, age: 0, lifetime: 0.4 });
    } else if (ability === 'mad') {
      // M.A.D. fires huge missile
      const target = this.findFurthestBloon();
      if (target) {
        const tx = target.x;
        const ty = target.y;
        const p = makeProjectile({
          x: t.x, y: t.y, vx: (tx - t.x) / 1.0, vy: (ty - t.y) / 1.0,
          damage: 1000, pierce: 999, lifetime: 1.0, radius: 12,
          color: '#ef4444', type: 'shell',
          canPopLead: true, canPopBlack: true, canSeeCamo: true,
          explodes: true, explodeRadius: 200, explodeDamage: 300,
          extraDamageMoab: 1000, owner: t,
          behavior: function(p, dt, game) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.age >= p.lifetime - dt) {
              explode(p.x, p.y, p.explodeRadius, p.explodeDamage, game, {
                canPopLead: true, canPopBlack: true, canSeeCamo: true, owner: p.owner
              });
              p.dead = true;
            }
          }
        });
        p.pierce = 0;
        this.projectiles.push(p);
      }
    } else if (ability === 'spikestorm') {
      // Cover the path with spikes
      for (let i = 0; i < 30; i++) {
        const d = (i / 30) * this.pathLen;
        const pos = Util.positionOnPath(this.map.path, d);
        this.spikePiles.push({
          x: pos.x, y: pos.y,
          charges: 5, maxCharges: 5,
          damage: 2, pierce: 4,
          canPopLead: true, canPopFrozen: true,
          extraDamageMoab: 6,
          owner: t, lifetime: 30
        });
      }
    } else if (ability === 'bloontrap') {
      // Place a trap that catches bloons
      const place = this.findRandomPathPoint();
      this.spikePiles.push({
        x: place.x, y: place.y, charges: 80, maxCharges: 80,
        damage: 5, pierce: 1, canPopLead: true, canPopFrozen: true,
        extraDamageMoab: 5, owner: t, lifetime: 60
      });
    } else if (ability === 'xxxltrap') {
      const place = this.findRandomPathPoint();
      this.spikePiles.push({
        x: place.x, y: place.y, charges: 6000, maxCharges: 6000,
        damage: 10, pierce: 1, canPopLead: true, canPopFrozen: true,
        extraDamageMoab: 100, owner: t, lifetime: 90
      });
    } else if (ability === 'popawe') {
      // Stun all bloons
      for (const b of this.bloons) {
        if (!b.alive) continue;
        b.stunTimer = Math.max(b.stunTimer, 6);
        applyDamage(b, 100, this, t);
      }
    } else if (ability === 'groundzero') {
      // Massive bomb at airplane location
      const fx = t.aircraftX || t.x;
      const fy = t.aircraftY || t.y;
      explode(fx, fy, 200, 200, this, { canPopLead: true, canPopBlack: true, canSeeCamo: true, owner: t });
    } else if (ability === 'liquefy') {
      // Damages all glued bloons
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (b.glueTimer > 0) {
          applyDamage(b, 30, this, t);
        }
      }
    } else if (ability === 'assassin') {
      // Targets strongest MOAB
      let best = null;
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (b.type.isBlimp && (!best || b.maxHp > best.maxHp)) best = b;
      }
      if (best) {
        const p = makeProjectile({
          x: t.x, y: t.y, vx: (best.x - t.x) * 4, vy: (best.y - t.y) * 4,
          damage: 1500, pierce: 1, lifetime: 1.0, radius: 8,
          color: '#dc2626', type: 'bomb',
          canPopLead: true, canPopBlack: true, canSeeCamo: true,
          explodes: true, explodeRadius: 50, explodeDamage: 500,
          extraDamageMoab: 5000, owner: t, homing: true, target: best
        });
        this.projectiles.push(p);
      }
    } else if (ability === 'undead') {
      // Necromancer - just damages bloons in range
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (Util.dist2(t.x, t.y, b.x, b.y) < t.effRange * t.effRange) {
          applyDamage(b, 10, this, t);
        }
      }
    } else if (ability === 'pirate') {
      // Calls in destroyer hit
      for (const b of this.bloons) {
        if (!b.alive) continue;
        if (Util.dist2(t.x, t.y, b.x, b.y) < t.effRange * 1.5 * t.effRange * 1.5) {
          applyDamage(b, b.type.isBlimp ? 200 : 20, this, t);
        }
      }
    }
  },

  findFurthestBloon() {
    let best = null, bestD = -1;
    for (const b of this.bloons) {
      if (!b.alive) continue;
      if (b.pathDist > bestD) { bestD = b.pathDist; best = b; }
    }
    return best;
  },

  saveStats(won) {
    try {
      const key = 'monkeyDefenseStats';
      const stats = JSON.parse(localStorage.getItem(key) || '{}');
      const mapKey = Object.keys(Maps).find(k => Maps[k] === this.map);
      stats[mapKey] = stats[mapKey] || {};
      stats[mapKey][this.difficulty] = stats[mapKey][this.difficulty] || {};
      const entry = stats[mapKey][this.difficulty];
      if (won) {
        entry.wins = (entry.wins || 0) + 1;
        entry.bestRound = Math.max(entry.bestRound || 0, this.round);
      } else {
        entry.losses = (entry.losses || 0) + 1;
        entry.bestRound = Math.max(entry.bestRound || 0, this.round);
      }
      entry.totalPops = (entry.totalPops || 0) + this.totalPops;
      localStorage.setItem(key, JSON.stringify(stats));
    } catch (e) {}
  },

  loadStats() {
    try {
      return JSON.parse(localStorage.getItem('monkeyDefenseStats') || '{}');
    } catch (e) { return {}; }
  }
};
