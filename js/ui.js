// UI handling - menu, shop, tower info, overlays
const UI = {
  selectedMap: 'meadow',
  selectedDifficulty: 'easy',
  selectedMode: 'standard',

  init() {
    // Menu buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => this.handleAction(e.target.dataset.action));
    });
    // Map select
    this.buildMapGrid();
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDifficulty = btn.dataset.diff;
        Audio.click();
      });
    });
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMode = btn.dataset.mode;
        Audio.click();
      });
    });

    // Build tower shop
    this.buildTowerShop();

    // Canvas interaction
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('mousemove', e => this.onCanvasMove(e));
    canvas.addEventListener('mousedown', e => this.onCanvasClick(e));
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Game buttons
    document.getElementById('startRoundBtn').addEventListener('click', () => {
      if (!Game.inRound && Game.state === 'playing') {
        Game.startRound();
      }
    });
    document.getElementById('speedBtn').addEventListener('click', () => {
      Game.speed = Game.speed === 1 ? 3 : (Game.speed === 3 ? 5 : 1);
      document.getElementById('speedBtn').innerHTML = Game.speed === 1 ? '&#9654;' : (Game.speed === 3 ? '&#9654;&#9654;' : '&#9654;&#9654;&#9654;');
      Audio.click();
    });
    document.getElementById('pauseBtn').addEventListener('click', () => {
      Game.paused = !Game.paused;
      document.getElementById('pauseBtn').innerHTML = Game.paused ? '&#9654;' : '&#10073;&#10073;';
      Audio.click();
    });
    document.getElementById('menuBtn').addEventListener('click', () => {
      Game.state = 'menu';
      this.showScreen('menu');
      Audio.click();
    });
    document.getElementById('ti_sell').addEventListener('click', () => {
      if (Game.selectedTower) Game.sellTower(Game.selectedTower);
      this.hideTowerInfo();
    });
    document.getElementById('ti_target').addEventListener('click', () => {
      if (Game.selectedTower) {
        Game.selectedTower.targetMode = (Game.selectedTower.targetMode + 1) % 4;
        this.updateTowerInfo();
        Audio.click();
      }
    });
    document.getElementById('overlayContinue').addEventListener('click', () => {
      document.getElementById('overlay').classList.add('hidden');
      Game.freeplay = true;
      Game.state = 'playing';
    });
    document.getElementById('overlayMenu').addEventListener('click', () => {
      document.getElementById('overlay').classList.add('hidden');
      Game.state = 'menu';
      this.showScreen('menu');
    });

    // Keyboard
    document.addEventListener('keydown', e => this.onKeyDown(e));
  },

  handleAction(action) {
    Audio.click();
    Audio.resume();
    if (action === 'play') this.showScreen('mapSelect');
    else if (action === 'howto') this.showScreen('howto');
    else if (action === 'credits') this.showScreen('credits');
    else if (action === 'backToMenu') this.showScreen('menu');
    else if (action === 'startGame') this.startGame();
  },

  startGame() {
    Game.init(this.selectedMap, this.selectedDifficulty, this.selectedMode);
    this.showScreen('game');
    this.buildTowerShop();
    this.updateHUD();
  },

  showScreen(name) {
    ['menu', 'mapSelect', 'howto', 'credits', 'game'].forEach(s => {
      document.getElementById(s).classList.toggle('hidden', s !== name);
    });
  },

  buildMapGrid() {
    const grid = document.getElementById('mapGrid');
    grid.innerHTML = '';
    for (const key of Maps._list) {
      const map = Maps[key];
      const tile = document.createElement('div');
      tile.className = 'map-tile' + (key === this.selectedMap ? ' selected' : '');
      tile.dataset.map = key;
      const canvas = document.createElement('canvas');
      canvas.width = 180; canvas.height = 140;
      tile.appendChild(canvas);
      const label = document.createElement('div');
      label.className = 'map-name';
      label.textContent = map.name + ' • ' + map.difficulty;
      tile.appendChild(label);
      grid.appendChild(tile);
      tile.addEventListener('click', () => {
        document.querySelectorAll('.map-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        this.selectedMap = key;
        Audio.click();
      });
      // Draw preview
      this.drawMapPreview(canvas, map);
    }
  },

  drawMapPreview(canvas, map) {
    const ctx = canvas.getContext('2d');
    const sx = canvas.width / 900;
    const sy = canvas.height / 700;
    ctx.fillStyle = map.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (map.water) {
      ctx.fillStyle = '#1d4ed8';
      for (const w of map.water) ctx.fillRect(w.x * sx, w.y * sy, w.w * sx, w.h * sy);
    }
    ctx.strokeStyle = map.pathBorder;
    ctx.lineWidth = map.pathWidth * Math.min(sx, sy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(map.path[0][0] * sx, map.path[0][1] * sy);
    for (let i = 1; i < map.path.length; i++) ctx.lineTo(map.path[i][0] * sx, map.path[i][1] * sy);
    ctx.stroke();
    ctx.strokeStyle = map.pathColor;
    ctx.lineWidth = (map.pathWidth - 6) * Math.min(sx, sy);
    ctx.beginPath();
    ctx.moveTo(map.path[0][0] * sx, map.path[0][1] * sy);
    for (let i = 1; i < map.path.length; i++) ctx.lineTo(map.path[i][0] * sx, map.path[i][1] * sy);
    ctx.stroke();
  },

  buildTowerShop() {
    const grid = document.getElementById('towerGrid');
    grid.innerHTML = '';
    for (const key of TOWER_ORDER) {
      const def = TowerTypes[key];
      if (!def) continue;
      const card = document.createElement('div');
      card.className = 'tower-card';
      card.dataset.type = key;

      const canvas = document.createElement('canvas');
      canvas.width = 56; canvas.height = 56;
      card.appendChild(canvas);

      const nameEl = document.createElement('div');
      nameEl.className = 'tc-name';
      nameEl.textContent = def.name;
      card.appendChild(nameEl);

      const costEl = document.createElement('div');
      costEl.className = 'tc-cost';
      costEl.textContent = '$' + (Game.towerCost ? Game.towerCost(key) : def.cost);
      card.appendChild(costEl);

      grid.appendChild(card);

      // Tooltip on hover
      card.title = `${def.name}\n${def.description || ''}\nCost: $${Game.towerCost ? Game.towerCost(key) : def.cost}\n${def.placeable === 'water' ? 'Place on water' : 'Place on land'}`;

      // Draw the tower into the canvas
      this.drawTowerPreview(canvas, key);

      card.addEventListener('click', () => {
        if (Game.money < (Game.towerCost ? Game.towerCost(key) : def.cost)) {
          Audio.click();
          return;
        }
        if (Game.selectedShopTower === key) {
          Game.selectedShopTower = null;
        } else {
          Game.selectedShopTower = key;
          Game.selectedTower = null;
        }
        this.hideTowerInfo();
        document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
        if (Game.selectedShopTower) card.classList.add('selected');
        Audio.click();
      });
    }
  },

  drawTowerPreview(canvas, key) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1a2c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Temporarily redirect Render's ctx
    const origCtx = Render.ctx;
    Render.ctx = ctx;
    const fakeT = makeTower(key, 0, 0);
    fakeT.angle = -Math.PI / 6;
    fakeT.upgrades = { top: 0, bot: 0 };
    Render.drawTowerByType(key, fakeT, 0);
    Render.ctx = origCtx;
    ctx.restore();
  },

  updateHUD() {
    document.getElementById('livesVal').textContent = Math.max(0, Math.floor(Game.lives));
    document.getElementById('moneyVal').textContent = Util.fmt(Game.money);
    document.getElementById('roundVal').textContent = (Math.min(Game.round + 1, Game.maxRound)) + '/' + Game.maxRound + (Game.freeplay ? '+' : '');
    // Tower shop affordability
    document.querySelectorAll('.tower-card').forEach(card => {
      const key = card.dataset.type;
      const cost = Game.towerCost ? Game.towerCost(key) : TowerTypes[key].cost;
      card.classList.toggle('unaffordable', Game.money < cost);
      card.querySelector('.tc-cost').textContent = '$' + cost;
    });
    const startBtn = document.getElementById('startRoundBtn');
    if (Game.inRound) {
      startBtn.textContent = 'IN ROUND';
      startBtn.style.opacity = 0.5;
    } else {
      startBtn.textContent = 'START R' + (Game.round + 1);
      startBtn.style.opacity = 1;
    }
    if (Game.selectedTower) this.updateTowerInfo();
  },

  onCanvasMove(e) {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (e.target.width / rect.width);
    const y = (e.clientY - rect.top) * (e.target.height / rect.height);
    Game.hoverX = x;
    Game.hoverY = y;
  },

  onCanvasClick(e) {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (e.target.width / rect.width);
    const y = (e.clientY - rect.top) * (e.target.height / rect.height);
    Audio.resume();

    if (e.button === 2) {
      // Right click - cancel selection
      Game.selectedShopTower = null;
      Game.selectedTower = null;
      document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
      this.hideTowerInfo();
      return;
    }

    if (Game.selectedShopTower) {
      // Place tower
      const placed = Game.placeTower(Game.selectedShopTower, x, y);
      if (placed) {
        // Heli can have target set
        if (placed.isHeli) {
          placed.heliTargetX = x;
          placed.heliTargetY = y;
        }
        // If shift held, keep selecting; else deselect
        if (!e.shiftKey) {
          Game.selectedShopTower = null;
          document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
        }
        this.updateHUD();
      } else {
        Audio.click();
      }
      return;
    }

    // Heli pilot - reposition flight target if a heli is selected
    if (Game.selectedTower && Game.selectedTower.isHeli) {
      Game.selectedTower.heliTargetX = x;
      Game.selectedTower.heliTargetY = y;
      return;
    }

    // Mortar - set aim
    if (Game.selectedTower && Game.selectedTower.isMortar) {
      Game.selectedTower.aimX = x;
      Game.selectedTower.aimY = y;
      return;
    }

    // Dartling cannon - aim follows cursor automatically. Click to fire-and-forget? not used.

    // Select existing tower
    for (const t of Game.towers) {
      const tx = t.isAircraft ? (t.aircraftX || t.x) : t.x;
      const ty = t.isAircraft ? (t.aircraftY || t.y) : t.y;
      if (Util.dist2(t.x, t.y, x, y) < t.radius * t.radius || Util.dist2(tx, ty, x, y) < t.radius * t.radius) {
        Game.selectedTower = t;
        this.showTowerInfo(t);
        return;
      }
    }
    // Otherwise deselect
    Game.selectedTower = null;
    this.hideTowerInfo();
  },

  showTowerInfo(t) {
    const panel = document.getElementById('towerInfo');
    panel.classList.remove('hidden');
    this.updateTowerInfo();
  },

  hideTowerInfo() {
    document.getElementById('towerInfo').classList.add('hidden');
  },

  updateTowerInfo() {
    const t = Game.selectedTower;
    if (!t) return;
    document.getElementById('ti_name').textContent = t.type.name;

    // Stats
    const stats = document.getElementById('ti_stats');
    const targets = ['First', 'Last', 'Strong', 'Close'];
    stats.innerHTML = `
      <div><span class="label">Damage:</span><span class="val">${t.proj.damage || '-'}</span></div>
      <div><span class="label">Pierce:</span><span class="val">${t.proj.pierce || '-'}</span></div>
      <div><span class="label">Range:</span><span class="val">${Math.floor(t.effRange || t.range)}</span></div>
      <div><span class="label">Rate:</span><span class="val">${(t.effFireRate || t.fireRate).toFixed(1)}/s</span></div>
      <div><span class="label">Camo:</span><span class="val">${(t.effCanSeeCamo || t.canSeeCamo) ? 'Yes' : 'No'}</span></div>
      <div><span class="label">Pops:</span><span class="val">${Math.floor(t.totalCash || 0)}</span></div>
      <div><span class="label">Sell:</span><span class="val">$${t.sellRefund}</span></div>
    `;

    // Upgrades
    const upgrades = document.getElementById('ti_upgrades');
    upgrades.innerHTML = '';
    for (const path of ['top', 'bot']) {
      const def = t.type.upgrades[path];
      const tier = t.upgrades[path];
      const wrap = document.createElement('div');
      wrap.className = 'upgrade-path';
      const title = document.createElement('div');
      title.className = 'path-title';
      title.textContent = path === 'top' ? 'PATH A' : 'PATH B';
      wrap.appendChild(title);

      const next = nextUpgrade(t, path);
      if (next) {
        const row = document.createElement('div');
        row.className = 'upgrade-row';
        const nm = document.createElement('div');
        nm.className = 'upgrade-name';
        nm.textContent = next.name;
        row.appendChild(nm);
        const btn = document.createElement('button');
        btn.className = 'upgrade-buy-btn';
        const cost = Math.floor(next.cost * Game.costMultiplier());
        let discount = 0;
        for (const v of Game.towers) {
          if (v.isVillage && v.discountNearby && Util.dist2(v.x, v.y, t.x, t.y) < v.range * v.range) {
            discount = Math.max(discount, v.discountNearby);
          }
        }
        const final = Math.floor(cost * (1 - discount));
        btn.textContent = '$' + final;
        if (!canUpgrade(t, path)) {
          btn.classList.add('locked');
          btn.textContent = 'LOCKED';
        } else if (Game.money < final) {
          btn.classList.add('disabled');
        }
        btn.addEventListener('click', () => {
          if (canUpgrade(t, path) && Game.money >= final) {
            Game.upgradeTower(t, path);
            this.updateTowerInfo();
            this.updateHUD();
          }
        });
        row.appendChild(btn);
        wrap.appendChild(row);
      } else {
        const row = document.createElement('div');
        row.className = 'upgrade-row';
        const nm = document.createElement('div');
        nm.className = 'upgrade-name';
        nm.textContent = 'MAXED OUT';
        nm.style.color = '#fbbf24';
        row.appendChild(nm);
        wrap.appendChild(row);
      }

      // Pips
      const pips = document.createElement('div');
      pips.className = 'upgrade-pips';
      for (let i = 0; i < 4; i++) {
        const pip = document.createElement('div');
        pip.className = 'upgrade-pip' + (i < tier ? ' filled' : '');
        pips.appendChild(pip);
      }
      wrap.appendChild(pips);

      upgrades.appendChild(wrap);
    }

    // Ability button
    if (t.activeAbility) {
      const ab = document.createElement('div');
      ab.style.textAlign = 'center';
      ab.style.marginTop = '6px';
      const btn = document.createElement('button');
      btn.className = 'upgrade-buy-btn';
      btn.style.padding = '6px 12px';
      btn.style.background = t.abilityReady ? '#dc2626' : '#475569';
      btn.textContent = t.abilityReady ? 'ACTIVATE!' : `READY IN ${Math.ceil(t.abilityCooldown)}s`;
      btn.addEventListener('click', () => {
        if (t.abilityReady) {
          Game.triggerAbility(t);
          this.updateTowerInfo();
        }
      });
      ab.appendChild(btn);
      upgrades.appendChild(ab);
    } else if (t.upgrades.top + t.upgrades.bot >= 4) {
      // Trigger ability initial state
      if (!t.abilityReady && t.abilityCooldown === 0 && t.type.upgrades.top.some(u => u.name && t.activeAbility)) {
        t.abilityReady = true;
      }
    }

    // Mark abilities ready if they just got upgraded
    if (t.activeAbility && !t.abilityReady && t.abilityCooldown === 0) {
      t.abilityReady = true;
    }

    document.getElementById('ti_target').textContent = 'Target: ' + targets[t.targetMode];
  },

  showOverlay(title, text) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayText').textContent = text;
    document.getElementById('overlay').classList.remove('hidden');
  },

  onKeyDown(e) {
    if (Game.state !== 'playing') return;
    if (e.key === ' ') {
      if (!Game.inRound) {
        Game.startRound();
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      Game.selectedShopTower = null;
      Game.selectedTower = null;
      document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
      this.hideTowerInfo();
    } else if (e.key === 'p' || e.key === 'P') {
      Game.paused = !Game.paused;
    } else if (e.key === 'f' || e.key === 'F' || e.key === 'Tab') {
      Game.speed = Game.speed === 1 ? 3 : 1;
      e.preventDefault();
    } else if (e.key === 's' || e.key === 'S') {
      if (Game.selectedTower) Game.sellTower(Game.selectedTower);
    }
    // Hotkeys for towers 1-9 0
    const towerHotkeys = { '1': 'dart', '2': 'tack', '3': 'sniper', '4': 'boomerang', '5': 'ninja',
                           '6': 'bomb', '7': 'ice', '8': 'glue', '9': 'wizard', '0': 'superMonkey' };
    if (towerHotkeys[e.key]) {
      const key = towerHotkeys[e.key];
      if (Game.money >= Game.towerCost(key)) {
        Game.selectedShopTower = key;
        document.querySelectorAll('.tower-card').forEach(c => {
          c.classList.toggle('selected', c.dataset.type === key);
        });
      }
    }
  }
};
