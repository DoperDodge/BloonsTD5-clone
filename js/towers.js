// Tower definitions
// Each tower has: id, name, cost, range, fire rate, projectile config
// Upgrade trees: top path and bottom path, each with 4 tiers
// Towers create projectiles via fire() function

const TowerTypes = {
  dart: {
    id: 'dart', name: 'Dart Slinger', cost: 200, color: '#8b4513', baseColor: '#fbbf24',
    radius: 18, range: 100, fireRate: 0.95, // shots per second
    description: 'Throws a single dart. Cheap and reliable.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Long Range Darts', cost: 90, effect: t => { t.range *= 1.25; } },
        { name: 'Enhanced Eyesight', cost: 180, effect: t => { t.range *= 1.15; t.canSeeCamo = true; } },
        { name: 'Spike-O-Pult', cost: 400, effect: t => { t.fireRate = 0.5; t.proj.damage = 4; t.proj.pierce = 12; t.proj.canPopLead = true; t.proj.speed = 500; t.proj.radius = 8; t.proj.color = '#94a3b8'; } },
        { name: 'Juggernaut', cost: 1900, effect: t => { t.fireRate = 0.7; t.proj.damage = 7; t.proj.pierce = 30; t.proj.radius = 12; t.proj.bounces = 2; } }
      ],
      bot: [
        { name: 'Sharp Shots', cost: 140, effect: t => { t.proj.pierce = 3; } },
        { name: 'Razor Sharp Shots', cost: 220, effect: t => { t.proj.pierce = 5; } },
        { name: 'Triple Darts', cost: 400, effect: t => { t.multiShot = 3; t.spreadAngle = 0.25; } },
        { name: 'Super Monkey Fan Club', cost: 9000, effect: t => { t.fireRate = 0.05; t.multiShot = 1; t.proj.damage = 1; t.proj.pierce = 3; t.activeAbility = 'fanclub'; t.abilityCooldown = 60; } }
      ]
    },
    proj: { damage: 1, pierce: 2, speed: 500, radius: 4, color: '#f1f5f9', lifetime: 0.4, type: 'dart' }
  },

  tack: {
    id: 'tack', name: 'Tack Burster', cost: 280, color: '#475569', baseColor: '#94a3b8',
    radius: 22, range: 80, fireRate: 0.7,
    description: 'Shoots 8 tacks outward in all directions.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Faster Shooting', cost: 180, effect: t => { t.fireRate *= 1.4; } },
        { name: 'Even Faster Shooting', cost: 280, effect: t => { t.fireRate *= 1.4; } },
        { name: 'Tack Sprayer', cost: 480, effect: t => { t.tackCount = 10; t.range *= 1.15; } },
        { name: 'Ring of Fire', cost: 3500, effect: t => { t.proj.damage = 2; t.proj.pierce = 14; t.fireRate = 0.7; t.ringOfFire = true; t.proj.canPopLead = true; } }
      ],
      bot: [
        { name: 'Extra Range Tacks', cost: 100, effect: t => { t.proj.lifetime *= 1.3; t.range *= 1.15; } },
        { name: 'More Tacks', cost: 200, effect: t => { t.tackCount = 10; } },
        { name: 'Blade Shooter', cost: 1300, effect: t => { t.tackCount = 8; t.proj.damage = 2; t.proj.pierce = 4; t.proj.canPopFrozen = true; t.proj.color = '#cbd5e1'; t.bladeShooter = true; } },
        { name: 'Blade Maelstrom', cost: 4800, effect: t => { t.proj.damage = 2; t.proj.pierce = 6; t.tackCount = 12; t.fireRate = 1.6; t.activeAbility = 'maelstrom'; t.abilityCooldown = 60; } }
      ]
    },
    tackCount: 8,
    proj: { damage: 1, pierce: 1, speed: 350, radius: 3, color: '#cbd5e1', lifetime: 0.3, type: 'tack' }
  },

  sniper: {
    id: 'sniper', name: 'Sharpshooter', cost: 350, color: '#166534', baseColor: '#1f2937',
    radius: 18, range: 9999, fireRate: 0.7,
    description: 'Hits any balloon anywhere on the map.',
    canSeeCamo: false,
    placeable: 'land',
    globalRange: true,
    upgrades: {
      top: [
        { name: 'Full Metal Jacket', cost: 350, effect: t => { t.proj.damage = 2; t.proj.canPopLead = true; t.proj.canPopFrozen = true; } },
        { name: 'Large Caliber', cost: 1000, effect: t => { t.proj.damage = 4; t.proj.pierce = 2; } },
        { name: 'Deadly Precision', cost: 3500, effect: t => { t.proj.damage = 12; t.proj.extraDamageMoab = 12; t.proj.canPopFrozen = true; } },
        { name: 'Cripple MOAB', cost: 18000, effect: t => { t.proj.damage = 20; t.proj.extraDamageMoab = 80; t.proj.stun = 3; t.fireRate = 0.5; } }
      ],
      bot: [
        { name: 'Night Vision', cost: 300, effect: t => { t.canSeeCamo = true; } },
        { name: 'Semi-Automatic', cost: 1700, effect: t => { t.fireRate = 1.4; } },
        { name: 'Bouncing Bullet', cost: 2500, effect: t => { t.proj.pierce = 8; t.bouncing = true; t.proj.damage = 3; } },
        { name: 'Supply Drop', cost: 7500, effect: t => { t.activeAbility = 'supply'; t.abilityCooldown = 90; t.proj.damage = 5; } }
      ]
    },
    proj: { damage: 1, pierce: 1, speed: 2000, radius: 3, color: '#fbbf24', lifetime: 0.3, type: 'bullet' }
  },

  boomerang: {
    id: 'boomerang', name: 'Boomeranger', cost: 325, color: '#8b4513', baseColor: '#fde68a',
    radius: 18, range: 110, fireRate: 0.9,
    description: 'Throws boomerangs that curve back.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Faster Throwing', cost: 175, effect: t => { t.fireRate *= 1.3; } },
        { name: 'Glaives', cost: 250, effect: t => { t.proj.pierce = 6; t.proj.color = '#cbd5e1'; t.proj.damage = 2; } },
        { name: 'Glaive Ricochet', cost: 1500, effect: t => { t.proj.pierce = 14; t.ricochet = true; } },
        { name: 'M.O.A.R. Glaives', cost: 6500, effect: t => { t.proj.damage = 3; t.proj.pierce = 30; t.ricochet = true; t.proj.extraDamageMoab = 6; } }
      ],
      bot: [
        { name: 'Improved Rangs', cost: 250, effect: t => { t.range *= 1.2; t.proj.pierce = 4; } },
        { name: 'Red Hot Rangs', cost: 350, effect: t => { t.proj.canPopLead = true; t.proj.canPopFrozen = true; } },
        { name: 'Bionic Boomerang', cost: 2400, effect: t => { t.fireRate *= 2.5; t.proj.pierce = 8; } },
        { name: 'Turbo Charge', cost: 6000, effect: t => { t.activeAbility = 'turbo'; t.abilityCooldown = 60; t.proj.damage = 2; } }
      ]
    },
    proj: { damage: 1, pierce: 3, speed: 380, radius: 8, color: '#f59e0b', lifetime: 1.8, type: 'boomerang' }
  },

  ninja: {
    id: 'ninja', name: 'Shadow Striker', cost: 500, color: '#1e293b', baseColor: '#475569',
    radius: 18, range: 120, fireRate: 1.7,
    description: 'Fast shuriken attacks. Sees camo balloons.',
    canSeeCamo: true,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Ninja Discipline', cost: 350, effect: t => { t.fireRate *= 1.25; t.range *= 1.1; } },
        { name: 'Sharp Shurikens', cost: 300, effect: t => { t.proj.pierce = 4; } },
        { name: 'Double Shot', cost: 750, effect: t => { t.multiShot = 2; t.spreadAngle = 0.15; } },
        { name: 'Bloonjitsu', cost: 2500, effect: t => { t.multiShot = 5; t.spreadAngle = 0.6; t.proj.pierce = 5; } }
      ],
      bot: [
        { name: 'Distraction', cost: 250, effect: t => { t.distract = 0.5; } },
        { name: 'Flash Bomb', cost: 800, effect: t => { t.proj.stun = 1.2; t.proj.canPopFrozen = true; } },
        { name: 'Sabotage Supply Lines', cost: 5000, effect: t => { t.activeAbility = 'sabotage'; t.abilityCooldown = 90; t.proj.damage = 2; } },
        { name: 'Grand Saboteur', cost: 22000, effect: t => { t.activeAbility = 'sabotage'; t.abilityCooldown = 50; t.proj.damage = 4; t.proj.extraDamageMoab = 50; } }
      ]
    },
    proj: { damage: 1, pierce: 2, speed: 600, radius: 5, color: '#0f172a', lifetime: 0.4, type: 'shuriken' }
  },

  bomb: {
    id: 'bomb', name: 'Boomer Cannon', cost: 600, color: '#1f2937', baseColor: '#374151',
    radius: 22, range: 105, fireRate: 0.7,
    description: 'Explosive shots that damage groups. Cannot pop black balloons.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Bigger Bombs', cost: 350, effect: t => { t.proj.explodeRadius = 50; t.proj.damage = 2; } },
        { name: 'Heavy Bombs', cost: 700, effect: t => { t.proj.damage = 3; t.proj.explodeDamage = 3; t.proj.canPopFrozen = true; } },
        { name: 'Really Big Bombs', cost: 1500, effect: t => { t.proj.explodeRadius = 75; t.proj.damage = 4; t.proj.explodeDamage = 4; } },
        { name: 'Bloon Impact', cost: 4500, effect: t => { t.proj.explodeStun = 1.5; t.proj.damage = 5; } }
      ],
      bot: [
        { name: 'Faster Reload', cost: 350, effect: t => { t.fireRate *= 1.4; } },
        { name: 'Missile Launcher', cost: 600, effect: t => { t.range *= 1.4; t.proj.speed = 600; } },
        { name: 'MOAB Mauler', cost: 1800, effect: t => { t.proj.extraDamageMoab = 18; t.proj.damage = 3; t.proj.canPopBlack = true; } },
        { name: 'MOAB Assassin', cost: 9500, effect: t => { t.proj.extraDamageMoab = 250; t.proj.damage = 4; t.proj.canPopBlack = true; t.activeAbility = 'assassin'; t.abilityCooldown = 35; } }
      ]
    },
    proj: { damage: 1, pierce: 99, speed: 450, radius: 8, color: '#1f2937', lifetime: 0.6, type: 'bomb',
            canPopBlack: false, explodes: true, explodeRadius: 35, explodeDamage: 1, canPopLead: true }
  },

  ice: {
    id: 'ice', name: 'Frost Wizard', cost: 425, color: '#0e7490', baseColor: '#67e8f9',
    radius: 22, range: 60, fireRate: 0.4,
    description: 'Freezes nearby balloons in place.',
    canSeeCamo: false,
    placeable: 'land',
    isAura: true,
    upgrades: {
      top: [
        { name: 'Enhanced Freeze', cost: 200, effect: t => { t.freezeDuration *= 1.6; t.range *= 1.15; } },
        { name: 'Permafrost', cost: 250, effect: t => { t.slowEffect = 0.5; t.slowDuration = 3; } },
        { name: 'Ice Shards', cost: 1500, effect: t => { t.iceShards = true; t.proj.damage = 1; t.proj.pierce = 4; } },
        { name: 'Absolute Zero', cost: 8000, effect: t => { t.range *= 1.2; t.freezeDuration *= 1.5; t.activeAbility = 'azero'; t.abilityCooldown = 60; t.proj.canPopFrozen = true; } }
      ],
      bot: [
        { name: 'Bigger Radius', cost: 175, effect: t => { t.range *= 1.3; } },
        { name: 'Re-Freeze', cost: 350, effect: t => { t.fireRate *= 1.6; } },
        { name: 'Cold Snap', cost: 1300, effect: t => { t.proj.canPopLead = true; t.proj.canPopFrozen = true; t.freezeDuration *= 1.2; } },
        { name: 'Viral Frost', cost: 5000, effect: t => { t.viralFrost = true; t.freezeDuration *= 1.5; t.proj.damage = 2; } }
      ]
    },
    freezeDuration: 1.5,
    slowEffect: 0,
    slowDuration: 0,
    proj: { damage: 0, pierce: 99, speed: 0, radius: 0, color: '#e0f2fe', lifetime: 0.1, type: 'ice', canPopWhite: false, canPopFrozen: false, freeze: 1.5 }
  },

  glue: {
    id: 'glue', name: 'Goo Slinger', cost: 280, color: '#15803d', baseColor: '#84cc16',
    radius: 20, range: 110, fireRate: 0.8,
    description: 'Slows balloons with sticky glue.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Corrosive Glue', cost: 350, effect: t => { t.proj.damage = 1; t.proj.canDmgOverTime = true; } },
        { name: 'Bigger Globs', cost: 200, effect: t => { t.proj.pierce = 4; } },
        { name: 'Glue Splatter', cost: 2400, effect: t => { t.proj.pierce = 8; t.multiShot = 6; t.spreadAngle = 1.0; } },
        { name: 'Glue Hose', cost: 11000, effect: t => { t.fireRate = 3.0; t.proj.glue = 12; t.proj.glueAmount = 2; t.proj.damage = 2; } }
      ],
      bot: [
        { name: 'Stickier Glue', cost: 250, effect: t => { t.proj.glue *= 1.5; t.proj.glueAmount = 2; } },
        { name: 'Glue Soak', cost: 800, effect: t => { t.proj.canPopLead = true; t.proj.glue *= 1.4; } },
        { name: 'MOAB Glue', cost: 3500, effect: t => { t.proj.affectBlimps = true; t.proj.glueAmount = 3; } },
        { name: 'Bloon Liquefier', cost: 15000, effect: t => { t.proj.glue = 18; t.proj.damage = 8; t.proj.glueAmount = 4; t.activeAbility = 'liquefy'; t.abilityCooldown = 40; } }
      ]
    },
    proj: { damage: 0, pierce: 1, speed: 350, radius: 6, color: '#84cc16', lifetime: 0.6, type: 'glue', glue: 5, glueAmount: 1 }
  },

  buccaneer: {
    id: 'buccaneer', name: 'Pirate Ship', cost: 550, color: '#7c2d12', baseColor: '#fcd34d',
    radius: 24, range: 130, fireRate: 0.7,
    description: 'Floats on water. Shoots in two directions.',
    canSeeCamo: false,
    placeable: 'water',
    upgrades: {
      top: [
        { name: 'Faster Shooting', cost: 250, effect: t => { t.fireRate *= 1.4; } },
        { name: 'Grape Shot', cost: 300, effect: t => { t.grapeShot = true; } },
        { name: 'Cannon Ship', cost: 700, effect: t => { t.proj.explodes = true; t.proj.explodeRadius = 30; t.proj.explodeDamage = 2; t.proj.canPopLead = true; } },
        { name: 'Aircraft Carrier', cost: 5500, effect: t => { t.aircraftCarrier = true; t.fireRate *= 1.3; t.proj.damage = 2; } }
      ],
      bot: [
        { name: 'Crow\'s Nest', cost: 350, effect: t => { t.canSeeCamo = true; t.range *= 1.15; } },
        { name: 'Monkey Pirates', cost: 1200, effect: t => { t.proj.damage = 2; t.proj.extraDamageMoab = 5; } },
        { name: 'Pirate Lord', cost: 8500, effect: t => { t.activeAbility = 'pirate'; t.abilityCooldown = 60; t.proj.extraDamageMoab = 20; } }
      ]
    },
    multiShot: 2,
    spreadAngle: Math.PI,
    proj: { damage: 1, pierce: 3, speed: 450, radius: 5, color: '#1f2937', lifetime: 0.5, type: 'cannonball' }
  },

  ace: {
    id: 'ace', name: 'Sky Pilot', cost: 800, color: '#dc2626', baseColor: '#f87171',
    radius: 22, range: 150, fireRate: 1.6,
    description: 'Flies in a pattern around its launch point.',
    canSeeCamo: false,
    placeable: 'land',
    isAircraft: true,
    flightRadius: 180,
    upgrades: {
      top: [
        { name: 'Rapid Fire', cost: 400, effect: t => { t.fireRate *= 1.4; } },
        { name: 'Lots More Darts', cost: 700, effect: t => { t.multiShot = 8; t.spreadAngle = Math.PI * 2; t.proj.pierce = 2; } },
        { name: 'Fighter Plane', cost: 1500, effect: t => { t.proj.damage = 2; t.proj.pierce = 4; t.fireRate *= 1.2; } },
        { name: 'Operation Dart Storm', cost: 4500, effect: t => { t.multiShot = 8; t.proj.damage = 2; t.proj.pierce = 5; t.fireRate *= 1.4; } }
      ],
      bot: [
        { name: 'Exploding Pineapple', cost: 250, effect: t => { t.pineapples = true; } },
        { name: 'Spy Plane', cost: 500, effect: t => { t.canSeeCamo = true; } },
        { name: 'Bomber Ace', cost: 3500, effect: t => { t.bomberAce = true; t.fireRate = 1.0; t.proj.explodes = true; t.proj.explodeRadius = 60; t.proj.explodeDamage = 3; t.proj.canPopLead = true; } },
        { name: 'Ground Zero', cost: 18000, effect: t => { t.activeAbility = 'groundzero'; t.abilityCooldown = 60; t.proj.damage = 3; t.proj.explodes = true; t.proj.explodeRadius = 90; t.proj.explodeDamage = 5; } }
      ]
    },
    proj: { damage: 1, pierce: 2, speed: 700, radius: 4, color: '#fff', lifetime: 0.4, type: 'dart' }
  },

  superMonkey: {
    id: 'superMonkey', name: 'Champion', cost: 3000, color: '#dc2626', baseColor: '#fbbf24',
    radius: 22, range: 120, fireRate: 22,
    description: 'Extremely fast attacks. Very expensive.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Laser Vision', cost: 1800, effect: t => { t.proj.damage = 2; t.proj.canPopLead = true; t.proj.canPopFrozen = true; t.proj.color = '#dc2626'; t.proj.type = 'laser'; } },
        { name: 'Plasma Vision', cost: 5000, effect: t => { t.proj.damage = 3; t.proj.pierce = 3; t.proj.color = '#fbbf24'; t.proj.type = 'plasma'; t.fireRate = 28; } },
        { name: 'Sun God', cost: 27000, effect: t => { t.proj.damage = 7; t.proj.pierce = 7; t.fireRate = 50; t.multiShot = 3; t.spreadAngle = 0.5; t.proj.color = '#fde047'; t.proj.type = 'sun'; t.range *= 1.15; t.proj.canPopLead = true; t.proj.canPopFrozen = true; } },
        { name: 'Sun Temple', cost: 90000, effect: t => { t.proj.damage = 15; t.proj.pierce = 15; t.fireRate = 65; t.multiShot = 5; t.proj.extraDamageMoab = 15; t.range *= 1.4; t.radius = 30; } }
      ],
      bot: [
        { name: 'Epic Range', cost: 2500, effect: t => { t.range *= 1.3; t.canSeeCamo = true; } },
        { name: 'Robo Monkey', cost: 7500, effect: t => { t.multiShot = 2; t.proj.damage = 2; t.proj.pierce = 2; } },
        { name: 'Tech Terror', cost: 12000, effect: t => { t.activeAbility = 'techterror'; t.abilityCooldown = 35; t.proj.damage = 3; t.fireRate *= 1.2; } },
        { name: 'The Anti-Bloon', cost: 50000, effect: t => { t.fireRate = 60; t.proj.damage = 10; t.proj.pierce = 8; t.proj.extraDamageMoab = 50; t.activeAbility = 'antibloon'; t.abilityCooldown = 45; } }
      ]
    },
    proj: { damage: 1, pierce: 1, speed: 1200, radius: 4, color: '#ef4444', lifetime: 0.25, type: 'dart' }
  },

  wizard: {
    id: 'wizard', name: 'Sorcerer', cost: 400, color: '#581c87', baseColor: '#a855f7',
    radius: 20, range: 105, fireRate: 1.1,
    description: 'Casts magic missiles. Can do many things with upgrades.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Guided Magic', cost: 250, effect: t => { t.proj.homing = true; t.range *= 1.15; } },
        { name: 'Arcane Blast', cost: 400, effect: t => { t.proj.damage = 2; t.proj.pierce = 3; } },
        { name: 'Arcane Mastery', cost: 1300, effect: t => { t.proj.damage = 3; t.proj.pierce = 6; t.fireRate *= 1.3; t.proj.canPopLead = true; } },
        { name: 'Arcane Spike', cost: 7500, effect: t => { t.proj.damage = 6; t.proj.pierce = 25; t.fireRate *= 1.5; t.proj.extraDamageMoab = 8; t.proj.canPopFrozen = true; } }
      ],
      bot: [
        { name: 'Fireball', cost: 350, effect: t => { t.fireball = true; } },
        { name: 'Wall of Fire', cost: 750, effect: t => { t.wallOfFire = true; t.fireRate *= 0.8; } },
        { name: 'Summon Whirlwind', cost: 2500, effect: t => { t.whirlwind = true; t.proj.stun = 0.5; t.fireRate *= 1.2; } },
        { name: 'Necromancer', cost: 8500, effect: t => { t.necromancer = true; t.proj.damage = 4; t.activeAbility = 'undead'; t.abilityCooldown = 50; } }
      ]
    },
    proj: { damage: 1, pierce: 2, speed: 500, radius: 6, color: '#c084fc', lifetime: 1.0, type: 'magic' }
  },

  farm: {
    id: 'farm', name: 'Fruit Farm', cost: 1000, color: '#a3e635', baseColor: '#fde68a',
    radius: 26, range: 0, fireRate: 0,
    description: 'Generates cash each round.',
    canSeeCamo: false,
    placeable: 'land',
    isFarm: true,
    cashPerRound: 200,
    upgrades: {
      top: [
        { name: 'Better Sorting', cost: 500, effect: t => { t.cashPerRound = 300; } },
        { name: 'More Boxes', cost: 800, effect: t => { t.cashPerRound = 500; } },
        { name: 'Monkey Bank', cost: 4000, effect: t => { t.isBank = true; t.bankInterest = 0.07; t.bankMax = 7000; t.cashPerRound = 0; } },
        { name: 'Monkey Wall Street', cost: 35000, effect: t => { t.isBank = true; t.bankInterest = 0.15; t.bankMax = 30000; t.cashPerRound = 0; } }
      ],
      bot: [
        { name: 'EZ Pickings', cost: 350, effect: t => { t.cashPerRound = 260; } },
        { name: 'Banana Plantation', cost: 1100, effect: t => { t.cashPerRound = 450; } },
        { name: 'Banana Research Facility', cost: 3500, effect: t => { t.cashPerRound = 1300; } },
        { name: 'Banana Central', cost: 25000, effect: t => { t.cashPerRound = 4000; t.boostsFarms = true; } }
      ]
    }
  },

  mortar: {
    id: 'mortar', name: 'Mortar', cost: 750, color: '#1f2937', baseColor: '#475569',
    radius: 22, range: 9999, fireRate: 0.35,
    description: 'Shoots at a fixed point. Long range, splash damage.',
    canSeeCamo: false,
    placeable: 'land',
    globalRange: true,
    isMortar: true,
    upgrades: {
      top: [
        { name: 'Bigger Blast', cost: 400, effect: t => { t.proj.explodeRadius = 60; t.proj.damage = 2; } },
        { name: 'Bloon Buster', cost: 600, effect: t => { t.proj.damage = 3; t.proj.canPopLead = true; t.proj.canPopBlack = true; } },
        { name: 'Shattering Shells', cost: 2400, effect: t => { t.proj.canPopFrozen = true; t.proj.stun = 1.5; t.proj.damage = 5; } },
        { name: 'The Big One', cost: 25000, effect: t => { t.proj.explodeRadius = 120; t.proj.damage = 30; t.proj.extraDamageMoab = 200; } }
      ],
      bot: [
        { name: 'Increased Accuracy', cost: 200, effect: t => { t.accuracy = 5; } },
        { name: 'Rapid Reload', cost: 850, effect: t => { t.fireRate *= 1.8; } },
        { name: 'Artillery Battery', cost: 5000, effect: t => { t.fireRate *= 1.6; t.proj.damage = 2; t.proj.pierce = 99; } },
        { name: 'Pop and Awe', cost: 18000, effect: t => { t.activeAbility = 'popawe'; t.abilityCooldown = 60; t.proj.stun = 6; } }
      ]
    },
    accuracy: 25,
    proj: { damage: 1, pierce: 99, speed: 0, radius: 12, color: '#1f2937', lifetime: 1.6, type: 'shell',
            canPopBlack: false, explodes: true, explodeRadius: 40, explodeDamage: 1 }
  },

  dartling: {
    id: 'dartling', name: 'Dartling Cannon', cost: 1200, color: '#7c2d12', baseColor: '#fbbf24',
    radius: 22, range: 220, fireRate: 8,
    description: 'Rapid-fire darts aimed at cursor.',
    canSeeCamo: false,
    placeable: 'land',
    isDartling: true,
    upgrades: {
      top: [
        { name: 'Powerful Darts', cost: 500, effect: t => { t.proj.damage = 2; t.proj.pierce = 3; } },
        { name: 'Laser Cannon', cost: 1500, effect: t => { t.proj.damage = 3; t.proj.canPopLead = true; t.proj.canPopFrozen = true; t.proj.type = 'laser'; t.proj.color = '#dc2626'; } },
        { name: 'Plasma Accelerator', cost: 4500, effect: t => { t.proj.damage = 5; t.proj.pierce = 6; t.proj.color = '#fbbf24'; t.proj.type = 'plasma'; t.fireRate *= 1.4; } },
        { name: 'Ray of Doom', cost: 35000, effect: t => { t.rayOfDoom = true; t.proj.damage = 25; t.proj.pierce = 100; t.proj.color = '#fbbf24'; } }
      ],
      bot: [
        { name: 'Faster Barrel Spin', cost: 400, effect: t => { t.fireRate *= 1.3; } },
        { name: 'Depleted Bloontonium', cost: 800, effect: t => { t.proj.damage = 2; } },
        { name: 'Hydra Rocket Pods', cost: 3500, effect: t => { t.proj.explodes = true; t.proj.explodeRadius = 35; t.proj.explodeDamage = 2; t.proj.canPopLead = true; } },
        { name: 'M.A.D.', cost: 18000, effect: t => { t.activeAbility = 'mad'; t.abilityCooldown = 60; t.proj.explodeRadius = 100; t.proj.explodeDamage = 50; } }
      ]
    },
    proj: { damage: 1, pierce: 1, speed: 1000, radius: 3, color: '#fde047', lifetime: 0.3, type: 'dart' }
  },

  spike: {
    id: 'spike', name: 'Spike Maker', cost: 900, color: '#374151', baseColor: '#9ca3af',
    radius: 22, range: 0, fireRate: 0.7,
    description: 'Places piles of spikes along the path.',
    canSeeCamo: false,
    placeable: 'land',
    isSpikeFactory: true,
    spikesPerPile: 5,
    spikeDamage: 1,
    spikePierce: 1,
    upgrades: {
      top: [
        { name: 'Bigger Stacks', cost: 350, effect: t => { t.spikesPerPile = 10; } },
        { name: 'White Hot Spikes', cost: 600, effect: t => { t.spikeCanPopLead = true; t.spikeCanPopFrozen = true; } },
        { name: 'Spiked Mines', cost: 1800, effect: t => { t.spikesMines = true; t.spikeDamage = 3; t.spikeExplodes = true; } },
        { name: 'Spike Storm', cost: 7500, effect: t => { t.activeAbility = 'spikestorm'; t.abilityCooldown = 60; t.spikesPerPile = 15; t.spikeDamage = 2; } }
      ],
      bot: [
        { name: 'Faster Production', cost: 350, effect: t => { t.fireRate *= 1.4; } },
        { name: 'Even Faster Production', cost: 650, effect: t => { t.fireRate *= 1.4; } },
        { name: 'MOAB SHREDR Spikes', cost: 3500, effect: t => { t.spikeExtraDamageMoab = 6; t.spikeDamage = 2; t.spikePierce = 4; } },
        { name: 'Carpet of Spikes', cost: 10000, effect: t => { t.spikesPerPile = 25; t.spikeDamage = 3; t.spikePierce = 6; t.spikeExtraDamageMoab = 12; } }
      ]
    }
  },

  heli: {
    id: 'heli', name: 'Chopper', cost: 1600, color: '#374151', baseColor: '#84cc16',
    radius: 22, range: 130, fireRate: 4,
    description: 'Player-controlled flying gunner.',
    canSeeCamo: false,
    placeable: 'land',
    isAircraft: true,
    isHeli: true,
    flightRadius: 0,
    upgrades: {
      top: [
        { name: 'Quad Darts', cost: 400, effect: t => { t.multiShot = 4; t.spreadAngle = 0.4; } },
        { name: 'Pursuit', cost: 800, effect: t => { t.pursuit = true; t.canSeeCamo = true; } },
        { name: 'Razor Rotors', cost: 1700, effect: t => { t.razorRotors = true; t.proj.damage = 2; } },
        { name: 'Apache Dartship', cost: 22000, effect: t => { t.multiShot = 6; t.proj.damage = 2; t.proj.pierce = 3; t.fireRate *= 1.5; t.proj.explodes = true; t.proj.explodeRadius = 25; t.proj.explodeDamage = 2; } }
      ],
      bot: [
        { name: 'Bigger Jets', cost: 250, effect: t => { t.heliSpeed = 1.5; } },
        { name: 'IFR', cost: 600, effect: t => { t.canSeeCamo = true; } },
        { name: 'Downdraft', cost: 2200, effect: t => { t.downdraft = true; t.proj.slowAmount = 0.6; t.proj.slowDuration = 1.5; } },
        { name: 'Support Chinook', cost: 16000, effect: t => { t.chinook = true; t.proj.damage = 3; t.fireRate *= 1.2; } }
      ]
    },
    proj: { damage: 1, pierce: 1, speed: 800, radius: 4, color: '#fff', lifetime: 0.4, type: 'dart' }
  },

  village: {
    id: 'village', name: 'Outpost', cost: 1100, color: '#7c2d12', baseColor: '#fde68a',
    radius: 26, range: 80, fireRate: 0,
    description: 'Boosts nearby towers. Larger range with upgrades.',
    canSeeCamo: false,
    placeable: 'land',
    isVillage: true,
    buffs: { range: 1.1, fireRate: 1.1 },
    upgrades: {
      top: [
        { name: 'Bigger Radius', cost: 350, effect: t => { t.range *= 1.4; } },
        { name: 'Jungle Drums', cost: 1300, effect: t => { t.buffs.fireRate = 1.15; } },
        { name: 'High Energy Beacon', cost: 3000, effect: t => { t.buffs.fireRate = 1.25; t.buffs.range = 1.15; } },
        { name: 'Monkeyopolis', cost: 25000, effect: t => { t.buffs.fireRate = 1.4; t.buffs.range = 1.3; t.cashPerRound = 1000; t.isFarm = true; } }
      ],
      bot: [
        { name: 'Monkey Business', cost: 600, effect: t => { t.discountNearby = 0.1; } },
        { name: 'Radar Scanner', cost: 1500, effect: t => { t.buffs.canSeeCamo = true; } },
        { name: 'Monkey Town', cost: 4000, effect: t => { t.discountNearby = 0.15; t.buffs.canSeeCamo = true; t.range *= 1.2; } },
        { name: 'Monkey City', cost: 22000, effect: t => { t.discountNearby = 0.2; t.buffs.canSeeCamo = true; t.range *= 1.3; t.cashPerRound = 800; t.isFarm = true; } }
      ]
    }
  },

  engineer: {
    id: 'engineer', name: 'Builder', cost: 450, color: '#7c2d12', baseColor: '#facc15',
    radius: 20, range: 90, fireRate: 1.3,
    description: 'Shoots nails. Can build sentry turrets.',
    canSeeCamo: false,
    placeable: 'land',
    upgrades: {
      top: [
        { name: 'Sentry Gun', cost: 750, effect: t => { t.canBuildSentry = true; t.sentryRate = 1.2; t.sentryCooldown = 12; } },
        { name: 'Faster Engineering', cost: 700, effect: t => { t.fireRate *= 1.3; t.sentryCooldown = 8; } },
        { name: 'Sprockets', cost: 1500, effect: t => { t.proj.damage = 2; t.fireRate *= 1.2; } },
        { name: 'Bloon Trap', cost: 6000, effect: t => { t.activeAbility = 'bloontrap'; t.abilityCooldown = 70; } }
      ],
      bot: [
        { name: 'Larger Service Area', cost: 200, effect: t => { t.range *= 1.4; } },
        { name: 'Pin', cost: 800, effect: t => { t.proj.stun = 0.5; } },
        { name: 'Cleansing Foam', cost: 2200, effect: t => { t.proj.removeRegrow = true; t.proj.removeCamo = true; t.proj.removeFortified = true; } },
        { name: 'XXXL Trap', cost: 28000, effect: t => { t.activeAbility = 'xxxltrap'; t.abilityCooldown = 60; t.proj.damage = 3; } }
      ]
    },
    proj: { damage: 1, pierce: 2, speed: 700, radius: 3, color: '#fde047', lifetime: 0.3, type: 'nail' }
  }
};

// Order in which towers appear in shop
const TOWER_ORDER = [
  'dart', 'tack', 'sniper', 'boomerang', 'ninja',
  'bomb', 'ice', 'glue', 'buccaneer', 'ace',
  'superMonkey', 'wizard', 'farm', 'mortar', 'dartling',
  'spike', 'heli', 'village', 'engineer'
];

// Create a tower instance
function makeTower(typeKey, x, y) {
  const t = TowerTypes[typeKey];
  return {
    typeKey,
    type: t,
    x, y,
    range: t.range,
    fireRate: t.fireRate,
    radius: t.radius,
    canSeeCamo: t.canSeeCamo,
    multiShot: t.multiShot || 1,
    spreadAngle: t.spreadAngle || 0,
    tackCount: t.tackCount,
    freezeDuration: t.freezeDuration,
    slowEffect: t.slowEffect,
    slowDuration: t.slowDuration,
    cashPerRound: t.cashPerRound,
    spikesPerPile: t.spikesPerPile,
    spikeDamage: t.spikeDamage,
    spikePierce: t.spikePierce,
    spikeCanPopLead: false,
    spikeCanPopFrozen: false,
    spikeExtraDamageMoab: 0,
    spikeExplodes: false,
    accuracy: t.accuracy || 25,
    buffs: t.buffs ? Object.assign({}, t.buffs) : null,
    discountNearby: 0,
    isFarm: t.isFarm,
    isVillage: t.isVillage,
    isBank: false,
    isMortar: t.isMortar,
    isDartling: t.isDartling,
    isAircraft: t.isAircraft,
    isHeli: t.isHeli,
    isSpikeFactory: t.isSpikeFactory,
    bankInterest: 0,
    bankMax: 0,
    bankBalance: 0,
    flightRadius: t.flightRadius || 0,
    flightAngle: Math.random() * Math.PI * 2,
    flightSpeed: 1.5,
    heliTargetX: x, heliTargetY: y,
    cooldown: 0,
    angle: 0,
    targetMode: 0, // 0 first, 1 last, 2 strong, 3 close
    upgrades: { top: 0, bot: 0 },
    locked: { top: false, bot: false },
    activeAbility: null,
    abilityCooldown: 0,
    abilityReady: false,
    abilityTimer: 0,
    proj: deepClone(t.proj || {}),
    target: null,
    totalCash: 0,
    boostedBy: {},
    placedAt: 0,
    sellRefund: TowerTypes[typeKey].cost * 0.7,
    investedCost: TowerTypes[typeKey].cost,
    homing: false,
    pursuit: false,
    razorRotors: false,
    downdraft: false,
    grapeShot: false,
    aircraftCarrier: false,
    pineapples: false,
    bomberAce: false,
    ringOfFire: false,
    bladeShooter: false,
    fireball: false,
    wallOfFire: false,
    whirlwind: false,
    necromancer: false,
    sentryCooldown: 0,
    canBuildSentry: false,
    sentryRate: 1.2,
    sentryCooldownTimer: 0,
    viralFrost: false,
    iceShards: false,
    distract: 0,
    bouncing: false,
    ricochet: false,
    chinook: false,
    rayOfDoom: false,
    spikesMines: false,
    boostsFarms: false,
    age: 0,
    // visuals
    flashTimer: 0
  };
}

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// Upgrade a tower
function upgradeTower(t, path) {
  const def = t.type.upgrades[path];
  const tier = t.upgrades[path];
  if (tier >= def.length) return false;
  // Lock rule: if you've gotten tier 3+ on the other path, you cannot continue this path beyond tier 2
  const other = path === 'top' ? 'bot' : 'top';
  if (t.upgrades[other] >= 3 && tier >= 2) return false;
  const upg = def[tier];
  const cost = Math.floor(upg.cost * (1 + t.investedCost * 0));
  upg.effect(t);
  t.upgrades[path]++;
  t.investedCost += cost;
  t.sellRefund = Math.floor(t.investedCost * 0.7);
  // Locking
  if (t.upgrades[path] >= 3) {
    t.locked[other] = true;
  }
  return cost;
}

function canUpgrade(t, path) {
  const def = t.type.upgrades[path];
  const tier = t.upgrades[path];
  if (tier >= def.length) return false;
  const other = path === 'top' ? 'bot' : 'top';
  if (t.upgrades[other] >= 3 && tier >= 2) return false;
  return true;
}

function nextUpgrade(t, path) {
  const def = t.type.upgrades[path];
  const tier = t.upgrades[path];
  if (tier >= def.length) return null;
  return def[tier];
}
