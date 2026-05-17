const { chromium } = require('/opt/node22/lib/node_modules/playwright');

async function placeTower(page, canvasInfo, type, gx, gy) {
  await page.click(`.tower-card[data-type="${type}"]`);
  await page.waitForTimeout(40);
  const sx = canvasInfo.x + (gx / canvasInfo.iw) * canvasInfo.w;
  const sy = canvasInfo.y + (gy / canvasInfo.ih) * canvasInfo.h;
  await page.mouse.click(sx, sy);
  await page.waitForTimeout(50);
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

  // Test sandbox mode on river map (water for buccaneer)
  await page.click('[data-action="play"]');
  await page.waitForTimeout(150);
  await page.click('.map-tile[data-map="river"]');
  await page.waitForTimeout(50);
  await page.click('.mode-btn[data-mode="sandbox"]');
  await page.waitForTimeout(50);
  await page.click('[data-action="startGame"]');
  await page.waitForTimeout(400);

  const canvasInfo = await page.evaluate(() => {
    const c = document.getElementById('gameCanvas');
    const r = c.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, iw: c.width, ih: c.height };
  });

  // Place ALL tower types where they fit
  const placements = [
    ['dart', 80, 100], ['tack', 250, 100], ['sniper', 850, 100],
    ['boomerang', 80, 600], ['ninja', 480, 250],
    ['bomb', 250, 600], ['ice', 480, 600], ['glue', 850, 600],
    ['buccaneer', 200, 50],   // water top
    ['buccaneer', 700, 650],  // water bottom
    ['ace', 480, 350], ['superMonkey', 80, 350],
    ['wizard', 850, 350], ['farm', 650, 100],
    ['mortar', 250, 350], ['dartling', 650, 600],
    ['spike', 850, 250], ['heli', 480, 100],
    ['village', 250, 450], ['engineer', 650, 350]
  ];
  for (const [type, x, y] of placements) {
    await placeTower(page, canvasInfo, type, x, y);
  }

  const placed = await page.evaluate(() => Game.towers.map(t => t.typeKey));
  console.log('Placed', placed.length, '/', 20, ':', placed);

  // Run round 10
  await page.evaluate(() => { Game.round = 9; Game.startRound(); Game.speed = 5; });
  await page.waitForTimeout(8000);

  const r10 = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, money: Game.money,
    pops: Game.totalPops, projectiles: Game.projectiles.length
  }));
  console.log('R10 result:', r10);
  await page.screenshot({ path: '/tmp/final_test_r10.png' });

  // Run round 31 (first MOAB)
  await page.evaluate(() => { Game.round = 30; Game.bloons = []; Game.projectiles = []; Game.inRound = false; Game.startRound(); });
  await page.waitForTimeout(15000);

  const r31 = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, pops: Game.totalPops, bloons: Game.bloons.length
  }));
  console.log('R31 result:', r31);
  await page.screenshot({ path: '/tmp/final_test_r31.png' });

  // Test camo - round 23
  await page.evaluate(() => { Game.round = 22; Game.bloons = []; Game.projectiles = []; Game.inRound = false; Game.startRound(); });
  await page.waitForTimeout(15000);

  const camo = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, pops: Game.totalPops
  }));
  console.log('Camo round:', camo);

  // Run a ZOMG with maxed towers
  await page.evaluate(() => {
    Game.bloons = []; Game.projectiles = []; Game.inRound = false; Game.round = 49;
    Game.money = 99999999;
    for (const t of Game.towers) {
      try { Game.upgradeTower(t, 'top'); Game.upgradeTower(t, 'top'); Game.upgradeTower(t, 'top'); Game.upgradeTower(t, 'top'); } catch(e){}
    }
    Game.startRound();
  });
  await page.waitForTimeout(20000);
  const zomg = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, pops: Game.totalPops, bloons: Game.bloons.length, inRound: Game.inRound
  }));
  console.log('ZOMG round with maxed towers:', zomg);
  await page.screenshot({ path: '/tmp/final_test_zomg.png' });

  console.log('Errors:', errors);
  await browser.close();
})();
