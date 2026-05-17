const { chromium } = require('/opt/node22/lib/node_modules/playwright');

async function placeTower(page, canvasInfo, type, gx, gy) {
  await page.click(`.tower-card[data-type="${type}"]`);
  await page.waitForTimeout(40);
  const sx = canvasInfo.x + (gx / canvasInfo.iw) * canvasInfo.w;
  const sy = canvasInfo.y + (gy / canvasInfo.ih) * canvasInfo.h;
  await page.mouse.click(sx, sy);
  await page.waitForTimeout(60);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE:', msg.text()); });

  await page.goto('http://localhost:8000/');
  await page.waitForTimeout(400);
  await page.click('[data-action="play"]');
  await page.waitForTimeout(150);
  await page.click('[data-action="startGame"]');
  await page.waitForTimeout(400);

  const canvasInfo = await page.evaluate(() => {
    const c = document.getElementById('gameCanvas');
    const r = c.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, iw: c.width, ih: c.height };
  });

  // God mode for testing
  await page.evaluate(() => { Game.money = 200000; });

  // Place a variety of towers including super monkey and ace
  const placements = [
    ['dart', 60, 80], ['tack', 280, 290], ['sniper', 850, 100],
    ['ninja', 600, 280], ['bomb', 380, 600], ['ice', 750, 400],
    ['wizard', 60, 280], ['glue', 850, 500], ['ace', 450, 350],
    ['superMonkey', 100, 600], ['village', 350, 350],
    ['mortar', 60, 600], ['spike', 850, 280]
  ];
  for (const [type, x, y] of placements) {
    await placeTower(page, canvasInfo, type, x, y);
  }
  const stats0 = await page.evaluate(() => ({
    towers: Game.towers.map(t => t.typeKey),
    money: Game.money
  }));
  console.log('Placed:', stats0.towers.length, 'types:', stats0.towers.join(','));

  // Upgrade dart twice top path
  await page.evaluate(() => {
    const dart = Game.towers.find(t => t.typeKey === 'dart');
    if (dart) {
      Game.upgradeTower(dart, 'top');
      Game.upgradeTower(dart, 'top');
    }
    const ninja = Game.towers.find(t => t.typeKey === 'ninja');
    if (ninja) {
      Game.upgradeTower(ninja, 'top');
      Game.upgradeTower(ninja, 'top');
    }
    const ace = Game.towers.find(t => t.typeKey === 'ace');
    if (ace) {
      ace.canSeeCamo = true;
    }
  });
  const dartUpgrade = await page.evaluate(() => {
    const d = Game.towers.find(t => t.typeKey === 'dart');
    return { upgrades: d.upgrades, range: d.range, canSeeCamo: d.canSeeCamo };
  });
  console.log('Dart upgrades:', dartUpgrade);

  // Start round and speed up
  await page.click('#startRoundBtn');
  await page.click('#speedBtn');
  await page.click('#speedBtn');

  // Skip to a higher round programmatically
  await page.evaluate(() => { Game.round = 15; });
  console.log('Set to round 16, running 30s...');
  await page.waitForTimeout(30000);

  const stats = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, money: Game.money,
    pops: Game.totalPops, towers: Game.towers.length,
    bloons: Game.bloons.length, inRound: Game.inRound
  }));
  console.log('After 30s (skipped to R16):', stats);
  await page.screenshot({ path: '/tmp/gametest_mid.png' });

  // Jump to MOAB round
  await page.evaluate(() => {
    Game.bloons = []; Game.projectiles = []; Game.spawnQueue = []; Game.inRound = false;
    Game.round = 30; Game.money = 200000;
  });
  await page.click('#startRoundBtn');
  console.log('Starting round 31 (MOAB)...');
  await page.waitForTimeout(20000);

  const stats2 = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, pops: Game.totalPops,
    bloons: Game.bloons.length
  }));
  console.log('After MOAB round:', stats2);
  await page.screenshot({ path: '/tmp/gametest_moab.png' });

  console.log('Errors:', errors);
  await browser.close();
})();
