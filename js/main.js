// Main entry point - sets up rendering and game loop
window.addEventListener('load', () => {
  Audio.init();
  UI.init();
  const canvas = document.getElementById('gameCanvas');
  Render.init(canvas);

  let lastTime = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    if (Game.state === 'playing') {
      Game.update(dt);
      drawGame();
    } else if (Game.state === 'victory' || Game.state === 'defeat') {
      drawGame();
    }

    requestAnimationFrame(frame);
  }

  function drawGame() {
    if (!Game.map) return;
    Render.clear();
    Render.drawMap(Game.map);

    // Spike piles
    for (const s of Game.spikePiles) Render.drawSpikePile(s);
    // Sentries
    for (const s of Game.sentries) Render.drawSentry(s);

    // Towers (ground-based first)
    for (const t of Game.towers) {
      if (!t.isAircraft) Render.drawTower(t, { showRange: Game.selectedTower === t });
    }

    // Bloons (top-down sorted by pathDist so further-along bloons render on top)
    const sortedBloons = Game.bloons.slice().sort((a, b) => a.pathDist - b.pathDist);
    for (const b of sortedBloons) Render.drawBloon(b);

    // Projectiles
    for (const p of Game.projectiles) Render.drawProjectile(p);

    // Aircraft (render above bloons)
    for (const t of Game.towers) {
      if (t.isAircraft) {
        const drawT = Object.assign({}, t);
        drawT.x = t.aircraftX || t.x;
        drawT.y = t.aircraftY || t.y;
        Render.drawTower(drawT, { showRange: Game.selectedTower === t });
      }
    }

    // Effects on top
    for (const e of Game.effects) Render.drawEffect(e);

    // Placement preview
    if (Game.selectedShopTower) {
      const def = TowerTypes[Game.selectedShopTower];
      const valid = Game.canPlaceTower(Game.selectedShopTower, Game.hoverX, Game.hoverY);
      const preview = makeTower(Game.selectedShopTower, Game.hoverX, Game.hoverY);
      preview.upgrades = { top: 0, bot: 0 };
      Render.drawTower(preview, { placement: true, showRange: true, valid });
    }

    // Mortar aim indicator if selected
    if (Game.selectedTower && Game.selectedTower.isMortar && Game.selectedTower.aimX !== undefined) {
      const ctx = Render.ctx;
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(Game.selectedTower.aimX, Game.selectedTower.aimY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(Game.selectedTower.aimX - 20, Game.selectedTower.aimY);
      ctx.lineTo(Game.selectedTower.aimX + 20, Game.selectedTower.aimY);
      ctx.moveTo(Game.selectedTower.aimX, Game.selectedTower.aimY - 20);
      ctx.lineTo(Game.selectedTower.aimX, Game.selectedTower.aimY + 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Heli target indicator
    if (Game.selectedTower && Game.selectedTower.isHeli) {
      const ctx = Render.ctx;
      ctx.save();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(Game.selectedTower.heliTargetX, Game.selectedTower.heliTargetY, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Pause overlay
    if (Game.paused) {
      const ctx = Render.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, 900, 700);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', 450, 350);
      ctx.restore();
    }
  }

  requestAnimationFrame(frame);
});
