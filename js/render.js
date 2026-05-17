// Rendering system - draws everything on the canvas using primitives
const Render = {
  ctx: null,
  canvas: null,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  },

  clear() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  drawMap(map) {
    const ctx = this.ctx;
    // Background
    ctx.fillStyle = map.bg;
    ctx.fillRect(0, 0, 900, 700);

    // Pattern overlay for texture
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = map.accentBg;
    for (let x = 0; x < 900; x += 40) {
      for (let y = 0; y < 700; y += 40) {
        if (((x + y) / 40) % 2 === 0) ctx.fillRect(x, y, 40, 40);
      }
    }
    ctx.restore();

    // Water if any
    if (map.water) {
      for (const w of map.water) {
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.fillStyle = '#3b82f6';
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          const wx = w.x + Math.random() * w.w;
          const wy = w.y + Math.random() * w.h;
          ctx.ellipse(wx, wy, 15, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    // Path border
    ctx.strokeStyle = map.pathBorder;
    ctx.lineWidth = map.pathWidth + 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(map.path[0][0], map.path[0][1]);
    for (let i = 1; i < map.path.length; i++) ctx.lineTo(map.path[i][0], map.path[i][1]);
    ctx.stroke();

    // Path fill
    ctx.strokeStyle = map.pathColor;
    ctx.lineWidth = map.pathWidth;
    ctx.beginPath();
    ctx.moveTo(map.path[0][0], map.path[0][1]);
    for (let i = 1; i < map.path.length; i++) ctx.lineTo(map.path[i][0], map.path[i][1]);
    ctx.stroke();

    // Path texture stripes
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(map.path[0][0], map.path[0][1]);
    for (let i = 1; i < map.path.length; i++) ctx.lineTo(map.path[i][0], map.path[i][1]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Decorations
    if (map.decorations) {
      for (const d of map.decorations) {
        this.drawDecoration(d.type, d.x, d.y);
      }
    }
  },

  drawDecoration(type, x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    if (type === 'tree') {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(-5, 5, 10, 20);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, -5, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-7, -10, 10, 0, Math.PI * 2);
      ctx.arc(7, -10, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'snowtree') {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(-4, 8, 8, 16);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(-15, 10);
      ctx.lineTo(15, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'bush') {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.arc(-9, 4, 10, 0, Math.PI * 2);
      ctx.arc(9, 4, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'rock') {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(-15, 8);
      ctx.lineTo(-10, -10);
      ctx.lineTo(10, -10);
      ctx.lineTo(15, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(0, -2);
      ctx.lineTo(8, -8);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'lavarock') {
      ctx.fillStyle = '#1c0701';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(0, 0);
      ctx.lineTo(-5, 5);
      ctx.lineTo(8, 8);
      ctx.lineTo(0, -8);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'cactus') {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-5, -20, 10, 30);
      ctx.fillRect(-15, -10, 8, 15);
      ctx.fillRect(7, -5, 8, 12);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-3 + i, -15 + i*5, 1, 3);
      }
    } else if (type === 'flower') {
      const petalColors = ['#fbbf24', '#ec4899', '#a855f7', '#ef4444'];
      ctx.fillStyle = petalColors[Math.floor(x + y) % petalColors.length];
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 4, Math.sin(ang) * 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawTower(t, opts) {
    const ctx = this.ctx;
    opts = opts || {};
    const isPlacement = opts.placement;
    const showRange = opts.showRange;
    const valid = opts.valid !== false;

    if (showRange) {
      ctx.save();
      ctx.fillStyle = valid ? 'rgba(255,255,255,0.18)' : 'rgba(255,0,0,0.18)';
      ctx.strokeStyle = valid ? 'rgba(255,255,255,0.5)' : 'rgba(255,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (isPlacement && !valid) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const type = t.type;
    ctx.save();
    ctx.translate(t.x, t.y);

    if (isPlacement) ctx.globalAlpha = 0.7;

    // Tower base shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(2, t.radius * 0.5 + 2, t.radius * 0.9, t.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw specific tower type
    const tier = (t.upgrades ? (t.upgrades.top + t.upgrades.bot) : 0);
    this.drawTowerByType(type.id, t, tier);

    ctx.restore();
  },

  drawTowerByType(typeId, t, tier) {
    const ctx = this.ctx;
    const ang = t.angle || 0;
    switch (typeId) {
      case 'dart':       this.drawDart(t, tier, ang); break;
      case 'tack':       this.drawTack(t, tier, ang); break;
      case 'sniper':     this.drawSniper(t, tier, ang); break;
      case 'boomerang':  this.drawBoomerang(t, tier, ang); break;
      case 'ninja':      this.drawNinja(t, tier, ang); break;
      case 'bomb':       this.drawBomb(t, tier, ang); break;
      case 'ice':        this.drawIce(t, tier, ang); break;
      case 'glue':       this.drawGlue(t, tier, ang); break;
      case 'buccaneer':  this.drawBuccaneer(t, tier, ang); break;
      case 'ace':        this.drawAce(t, tier, ang); break;
      case 'superMonkey':this.drawSuperMonkey(t, tier, ang); break;
      case 'wizard':     this.drawWizard(t, tier, ang); break;
      case 'farm':       this.drawFarm(t, tier); break;
      case 'mortar':     this.drawMortar(t, tier, ang); break;
      case 'dartling':   this.drawDartling(t, tier, ang); break;
      case 'spike':      this.drawSpikeFactory(t, tier); break;
      case 'heli':       this.drawHeli(t, tier, ang); break;
      case 'village':    this.drawVillage(t, tier); break;
      case 'engineer':   this.drawEngineer(t, tier, ang); break;
      default:
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
    }
  },

  // Monkey body helper - draws a brown furry circle with face
  drawMonkey(r, bodyColor = '#8b4513', faceColor = '#d4a574') {
    const ctx = this.ctx;
    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.arc(-r * 0.85, -r * 0.5, r * 0.3, 0, Math.PI * 2);
    ctx.arc(r * 0.85, -r * 0.5, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Face
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.13, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.32, -r * 0.13, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, r * 0.3, r * 0.15, 0, Math.PI);
    ctx.stroke();
  },

  drawDart(t, tier, ang) {
    const ctx = this.ctx;
    this.drawMonkey(16);
    // Dart in hand
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = '#374151';
    ctx.fillRect(8, -1.5, 18, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(26, 0);
    ctx.lineTo(20, -4);
    ctx.lineTo(20, 4);
    ctx.closePath();
    ctx.fill();
    // Fletching
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(8, -3, 3, 6);
    ctx.restore();
    // Upgrade indicators
    this.drawUpgradePips(t);
  },

  drawTack(t, tier, ang) {
    const ctx = this.ctx;
    // Hub
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Spikes pointing out
    const spikes = t.tackCount || 8;
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(16, -3);
      ctx.lineTo(24, 0);
      ctx.lineTo(16, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Center dot
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawSniper(t, tier, ang) {
    const ctx = this.ctx;
    this.drawMonkey(16, '#166534');
    // Helmet / hat
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, -12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Rifle
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, -2, 30, 4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -3, 10, 6);
    // Scope
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, -5, 8, 3);
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawBoomerang(t, tier, ang) {
    const ctx = this.ctx;
    this.drawMonkey(16);
    // Boomerang in hand
    ctx.save();
    ctx.rotate(ang);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(15, 0, 8, Math.PI * 0.3, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawNinja(t, tier, ang) {
    const ctx = this.ctx;
    // Ninja body
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    // Headband
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-14, -8, 28, 4);
    // Eyes only visible
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-5, -2, 3, 0, Math.PI * 2);
    ctx.arc(5, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -2, 1.5, 0, Math.PI * 2);
    ctx.arc(5, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Shuriken
    ctx.save();
    ctx.rotate(ang);
    ctx.translate(14, 0);
    ctx.fillStyle = '#475569';
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i / 4) * Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(6, -2);
      ctx.lineTo(8, 0);
      ctx.lineTo(6, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawBomb(t, tier, ang) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(ang);
    // Cannon base
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Barrel
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, -7, 24, 14);
    ctx.strokeRect(0, -7, 24, 14);
    // Barrel rim
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(22, 0, 5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    // Wheels
    ctx.restore();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-10, 12, 5, 0, Math.PI * 2);
    ctx.arc(10, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    this.drawUpgradePips(t);
  },

  drawIce(t, tier, ang) {
    const ctx = this.ctx;
    // Snowman body
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(0, 4, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Head
    ctx.beginPath();
    ctx.arc(0, -10, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-3, -12, 1.5, 0, Math.PI * 2);
    ctx.arc(3, -12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Carrot nose
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, -8);
    ctx.lineTo(0, -7);
    ctx.closePath();
    ctx.fill();
    // Hat
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -22, 16, 4);
    ctx.fillRect(-6, -28, 12, 6);
    // Buttons
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.arc(0, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Cold aura
    if (t.cooldown < 0.2) {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    this.drawUpgradePips(t);
  },

  drawGlue(t, tier, ang) {
    const ctx = this.ctx;
    this.drawMonkey(16, '#15803d');
    // Glue gun
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(5, -4, 16, 8);
    ctx.fillStyle = '#365314';
    ctx.fillRect(20, -2, 4, 4);
    // Tank
    ctx.fillStyle = '#a3e635';
    ctx.beginPath();
    ctx.arc(8, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawBuccaneer(t, tier, ang) {
    const ctx = this.ctx;
    ctx.save();
    // Hull
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(-22, -2);
    ctx.lineTo(22, -2);
    ctx.lineTo(18, 10);
    ctx.lineTo(-18, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Mast
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-1, -22, 2, 22);
    // Sail
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(1, -22);
    ctx.lineTo(14, -18);
    ctx.lineTo(14, -4);
    ctx.lineTo(1, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Flag
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(-1, -24);
    ctx.lineTo(6, -22);
    ctx.lineTo(-1, -20);
    ctx.closePath();
    ctx.fill();
    // Monkey on deck
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(-10, -2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawAce(t, tier, ang) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(ang);
    // Body
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(18, 0);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Wings
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.lineTo(-2, -14);
    ctx.lineTo(6, -14);
    ctx.lineTo(8, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(-2, 14);
    ctx.lineTo(6, 14);
    ctx.lineTo(8, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-16, -8);
    ctx.lineTo(-10, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Propeller
    const propAng = performance.now() * 0.05;
    ctx.save();
    ctx.translate(18, 0);
    ctx.rotate(propAng);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-1, -8, 2, 16);
    ctx.fillRect(-8, -1, 16, 2);
    ctx.restore();
    // Cockpit
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.ellipse(4, 0, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawSuperMonkey(t, tier, ang) {
    const ctx = this.ctx;
    // Cape
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-22, 16);
    ctx.lineTo(0, 12);
    ctx.lineTo(22, 16);
    ctx.lineTo(14, 0);
    ctx.closePath();
    ctx.fill();
    this.drawMonkey(16, '#dc2626', '#d4a574');
    // Mask
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12, -6, 24, 6);
    // Eye holes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    // Glowing eyes if upgraded
    if (tier >= 2) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-5, -3, 1.5, 0, Math.PI * 2);
      ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // S emblem
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', 0, 9);
    this.drawUpgradePips(t);
  },

  drawWizard(t, tier, ang) {
    const ctx = this.ctx;
    // Cloak
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.lineTo(-18, 16);
    ctx.lineTo(18, 16);
    ctx.lineTo(14, 4);
    ctx.closePath();
    ctx.fill();
    this.drawMonkey(14, '#a855f7');
    // Wizard hat
    ctx.fillStyle = '#581c87';
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(12, -8);
    ctx.lineTo(0, -28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3b0764';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Stars on hat
    ctx.fillStyle = '#fbbf24';
    this.drawStar(0, -18, 2, 5);
    this.drawStar(-3, -12, 1.5, 5);
    // Staff
    ctx.save();
    ctx.rotate(ang);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 5);
    ctx.lineTo(22, -8);
    ctx.stroke();
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(22, -8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(22, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawFarm(t, tier) {
    const ctx = this.ctx;
    // Barn body
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-20, -12, 40, 28);
    // Roof
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-22, -12);
    ctx.lineTo(0, -26);
    ctx.lineTo(22, -12);
    ctx.closePath();
    ctx.fill();
    // Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-6, -2, 12, 18);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(6, 16);
    ctx.moveTo(6, -2);
    ctx.lineTo(-6, 16);
    ctx.stroke();
    // Windows
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-16, -8, 6, 6);
    ctx.fillRect(10, -8, 6, 6);
    // Banana symbol
    if (tier >= 1) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(0, 26, 8, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    this.drawUpgradePips(t);
  },

  drawMortar(t, tier, ang) {
    const ctx = this.ctx;
    // Base
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Mortar tube
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(6, -2);
    ctx.lineTo(4, -22);
    ctx.lineTo(-4, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Top of tube
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, -22, 4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Target indicator
    if (t.aimX !== undefined) {
      ctx.save();
      ctx.translate(t.aimX - t.x, t.aimY - t.y);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
      ctx.moveTo(0, -15); ctx.lineTo(0, 15);
      ctx.stroke();
      ctx.restore();
    }
    this.drawUpgradePips(t);
  },

  drawDartling(t, tier, ang) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(ang);
    // Base
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Barrels (multiple)
    ctx.fillStyle = '#1f2937';
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(0, i * 5 - 1.5, 26, 3);
    }
    // Cap
    ctx.fillStyle = '#000';
    ctx.fillRect(24, -6, 4, 12);
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawSpikeFactory(t, tier) {
    const ctx = this.ctx;
    // Building
    ctx.fillStyle = '#374151';
    ctx.fillRect(-20, -16, 40, 32);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-20, -16, 40, 32);
    // Roof
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-22, -20, 44, 6);
    // Smokestack
    ctx.fillRect(-12, -28, 6, 12);
    // Conveyor
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-18, 14, 36, 4);
    // Spikes coming out
    const phase = (performance.now() / 200) % 1;
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 5; i++) {
      const sx = -18 + i * 9 + phase * 9;
      ctx.beginPath();
      ctx.moveTo(sx, 18);
      ctx.lineTo(sx + 3, 22);
      ctx.lineTo(sx + 6, 18);
      ctx.closePath();
      ctx.fill();
    }
    // Window
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-12, -10, 24, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(-10, -8, 6, 4);
    ctx.fillRect(4, -8, 6, 4);
    this.drawUpgradePips(t);
  },

  drawHeli(t, tier, ang) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(ang);
    // Body
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#365314';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Tail
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(-22, -2, 8, 4);
    ctx.fillStyle = '#365314';
    ctx.fillRect(-22, -5, 3, 10);
    // Cockpit
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.ellipse(6, 0, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Top blade
    const blade = performance.now() * 0.04;
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(blade);
    ctx.fillStyle = 'rgba(50,50,50,0.5)';
    ctx.fillRect(-22, -1, 44, 2);
    ctx.fillRect(-1, -22, 2, 44);
    ctx.restore();
    // Skids
    ctx.fillStyle = '#374151';
    ctx.fillRect(-8, 7, 16, 1);
    ctx.fillRect(-8, -8, 16, 1);
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawVillage(t, tier) {
    const ctx = this.ctx;
    // Hut
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(0, -22);
    ctx.lineTo(20, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Body
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-16, -4, 32, 20);
    ctx.strokeRect(-16, -4, 32, 20);
    // Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, 4, 8, 12);
    // Window
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(-12, 2, 6, 6);
    ctx.fillRect(6, 2, 6, 6);
    // Totem / flag
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, -28, 2, 8);
    ctx.beginPath();
    ctx.moveTo(2, -28);
    ctx.lineTo(10, -25);
    ctx.lineTo(2, -22);
    ctx.closePath();
    ctx.fill();
    this.drawUpgradePips(t);
  },

  drawEngineer(t, tier, ang) {
    const ctx = this.ctx;
    this.drawMonkey(16, '#facc15', '#d4a574');
    // Hard hat
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -10, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-13, -10, 26, 3);
    // Wrench
    ctx.save();
    ctx.rotate(ang);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(22, 0);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(22, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawUpgradePips(t);
  },

  drawStar(x, y, r, points) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const ang = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.4;
      const px = x + Math.cos(ang) * rr;
      const py = y + Math.sin(ang) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  },

  drawUpgradePips(t) {
    if (!t.upgrades) return;
    const ctx = this.ctx;
    const totalT = t.upgrades.top;
    const totalB = t.upgrades.bot;
    // Top tier indicator on top right
    if (totalT > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(14, -14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(totalT, 14, -14);
    }
    if (totalB > 0) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(14, 14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(totalB, 14, 14);
    }
  },

  drawBloon(b) {
    const ctx = this.ctx;
    if (b.type.isBlimp) return this.drawBlimp(b);

    ctx.save();
    const bob = Math.sin(performance.now() / 200 + b.bobPhase) * 1.5;
    ctx.translate(b.x, b.y + bob);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(2, b.radius + 4, b.radius * 0.8, b.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Balloon body
    const r = b.radius;
    ctx.fillStyle = b.type.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = b.type.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.4, r * 0.25, r * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Knot
    ctx.fillStyle = b.type.stroke;
    ctx.beginPath();
    ctx.moveTo(-3, r);
    ctx.lineTo(3, r);
    ctx.lineTo(0, r + 4);
    ctx.closePath();
    ctx.fill();

    // String
    ctx.strokeStyle = b.type.stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, r + 4);
    ctx.quadraticCurveTo(2, r + 8, 0, r + 12);
    ctx.stroke();

    // Special markings
    if (b.typeKey === 'zebra') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, i * r * 0.3);
        ctx.lineTo(r * 0.8, i * r * 0.3);
        ctx.stroke();
      }
    } else if (b.typeKey === 'rainbow') {
      const colors = ['#ef4444', '#fb923c', '#fbbf24', '#22c55e', '#3b82f6'];
      for (let i = 0; i < colors.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.ellipse(0, -r + i * (r * 0.4), r * 0.9, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (b.typeKey === 'ceramic') {
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Health cracks
      const hpPct = b.hp / b.maxHp;
      if (hpPct < 0.7) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.5); ctx.lineTo(r * 0.3, 0);
        ctx.stroke();
      }
      if (hpPct < 0.4) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.3, r * 0.5); ctx.lineTo(r * 0.5, -r * 0.2);
        ctx.stroke();
      }
    } else if (b.typeKey === 'lead') {
      // Metallic sheen
      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.5, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
    }

    // Camo overlay
    if (b.camo) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < 4; i++) {
        const cx = Util.rand(-r * 0.6, r * 0.6);
        const cy = Util.rand(-r * 0.6, r * 0.6);
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.3, r * 0.2, Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Regrow indicator
    if (b.regrow) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Fortified
    if (b.fortified) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Frozen indicator
    if (b.freezeTimer > 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
        ctx.lineTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1);
      }
      ctx.stroke();
    }

    // Glue indicator
    if (b.glueTimer > 0) {
      ctx.fillStyle = 'rgba(132, 204, 22, 0.5)';
      ctx.beginPath();
      ctx.arc(0, r * 0.5, r * 0.7, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore();
  },

  drawBlimp(b) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle * 0.3);
    const r = b.radius;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(4, r + 6, r * 1.4, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.fillStyle = b.type.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.5, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = b.type.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.4, -r * 0.4, r * 0.6, r * 0.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Fin (back)
    ctx.fillStyle = b.type.stroke;
    ctx.beginPath();
    ctx.moveTo(-r * 1.4, 0);
    ctx.lineTo(-r * 1.7, -r * 0.5);
    ctx.lineTo(-r * 1.2, -r * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 1.4, 0);
    ctx.lineTo(-r * 1.7, r * 0.5);
    ctx.lineTo(-r * 1.2, r * 0.2);
    ctx.closePath();
    ctx.fill();

    // Cabin
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-r * 0.3, r * 0.6, r * 0.6, r * 0.3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-r * 0.2, r * 0.65, r * 0.4, r * 0.15);

    // Type label
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.floor(r * 0.45)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labels = { moab: 'M', bfb: 'B', zomg: 'Z' };
    ctx.fillText(labels[b.typeKey] || '?', 0, 0);

    // Health bar
    const hpPct = b.hp / b.maxHp;
    if (hpPct < 1) {
      ctx.fillStyle = '#000';
      ctx.fillRect(-r, -r - 12, r * 2, 6);
      ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(-r, -r - 12, r * 2 * hpPct, 6);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-r, -r - 12, r * 2, 6);
    }

    // Fortified
    if (b.fortified) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.6, r * 1.0, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawProjectile(p) {
    const ctx = this.ctx;
    // Trail
    if (p.trailColor && p.trail.length > 1) {
      ctx.strokeStyle = p.trailColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(p.trail[0][0], p.trail[0][1]);
      for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i][0], p.trail[i][1]);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    switch (p.type) {
      case 'dart':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -2);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-6, -2, 2, 4);
        break;
      case 'tack':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.radius, 0);
        ctx.lineTo(-2, -1);
        ctx.lineTo(-2, 1);
        ctx.closePath();
        ctx.fill();
        break;
      case 'bullet':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'boomerang':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 8, Math.PI * 0.3, Math.PI * 1.7);
        ctx.stroke();
        break;
      case 'shuriken':
        ctx.fillStyle = p.color;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i / 4) * Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(5, -2);
          ctx.lineTo(7, 0);
          ctx.lineTo(5, 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        break;
      case 'bomb':
      case 'shell':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius || 6, 0, Math.PI * 2);
        ctx.fill();
        // Fuse
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -p.radius);
        ctx.lineTo(2, -p.radius - 5);
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(2 + Math.random(), -p.radius - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'ice':
        // Ice doesn't draw - it's an aura effect
        break;
      case 'glue':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(-2, -2, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'cannonball':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'magic':
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius * 2);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'laser':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        break;
      case 'plasma':
        const grad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius * 2);
        grad2.addColorStop(0, '#fff');
        grad2.addColorStop(0.5, p.color);
        grad2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'sun':
        const grad3 = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius * 3);
        grad3.addColorStop(0, '#fff');
        grad3.addColorStop(0.3, '#fde047');
        grad3.addColorStop(0.7, '#f97316');
        grad3.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad3;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'nail':
        ctx.fillStyle = p.color;
        ctx.fillRect(-4, -1, 8, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(-4, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius || 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  },

  drawSpikePile(s) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(s.x, s.y);
    const pct = s.charges / s.maxCharges;
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < Math.max(2, Math.floor(pct * 5)); i++) {
      const a = (i / 5) * Math.PI * 2;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a + 0.3) * r * 1.6, Math.sin(a + 0.3) * r * 1.6);
      ctx.lineTo(Math.cos(a + 0.6) * r, Math.sin(a + 0.6) * r);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawEffect(e) {
    const ctx = this.ctx;
    const pct = e.age / e.lifetime;
    switch (e.type) {
      case 'explosion':
        ctx.save();
        const er = e.maxR * pct;
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, er);
        grad.addColorStop(0, 'rgba(255,255,255,0.8)');
        grad.addColorStop(0.3, 'rgba(255,200,0,0.7)');
        grad.addColorStop(0.7, 'rgba(255,80,0,0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.globalAlpha = 1 - pct;
        ctx.beginPath();
        ctx.arc(e.x, e.y, er, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      case 'pop':
        ctx.save();
        ctx.strokeStyle = e.color || '#fff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - pct;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.maxR * pct, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const r1 = e.maxR * pct * 0.7;
          const r2 = e.maxR * pct;
          ctx.beginPath();
          ctx.moveTo(e.x + Math.cos(a) * r1, e.y + Math.sin(a) * r1);
          ctx.lineTo(e.x + Math.cos(a) * r2, e.y + Math.sin(a) * r2);
          ctx.stroke();
        }
        ctx.restore();
        break;
      case 'bigpop':
        ctx.save();
        ctx.globalAlpha = 1 - pct;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('POP!', e.x, e.y);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.maxR * pct, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      case 'dmg':
        ctx.save();
        ctx.globalAlpha = 1 - pct;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        const y = e.y - 20 - pct * 20;
        ctx.strokeText(e.dmg, e.x, y);
        ctx.fillText(e.dmg, e.x, y);
        ctx.restore();
        break;
      case 'cash':
        ctx.save();
        ctx.globalAlpha = 1 - pct;
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 2;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        const cy = e.y - 20 - pct * 30;
        ctx.strokeText('+$' + e.amount, e.x, cy);
        ctx.fillText('+$' + e.amount, e.x, cy);
        ctx.restore();
        break;
      case 'iceaura':
        ctx.save();
        ctx.globalAlpha = (1 - pct) * 0.5;
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0ea5e9';
        ctx.stroke();
        ctx.restore();
        break;
      case 'flash':
        ctx.save();
        ctx.globalAlpha = 1 - pct;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.maxR * (1 - pct), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      case 'wallfire':
        ctx.save();
        ctx.globalAlpha = (1 - pct) * 0.8;
        const fg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
        fg.addColorStop(0, '#fff');
        fg.addColorStop(0.4, '#f97316');
        fg.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
    }
  },

  drawSentry(s) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.rotate(s.angle || 0);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, -2, 12, 4);
    // Lifetime indicator
    if (s.lifetime > 0) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + (s.lifetime / s.maxLifetime) * Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
};
