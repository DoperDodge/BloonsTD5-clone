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

  await page.evaluate(() => { Game.money = 999999; });

  // Place super monkey and dart, fully upgrade them to test visuals
  await placeTower(page, canvasInfo, 'superMonkey', 850, 100);
  await placeTower(page, canvasInfo, 'dart', 60, 80);
  await placeTower(page, canvasInfo, 'mortar', 60, 600);
  await placeTower(page, canvasInfo, 'dartling', 850, 600);

  // Max upgrade super and dart
  await page.evaluate(() => {
    const sm = Game.towers.find(t => t.typeKey === 'superMonkey');
    const d = Game.towers.find(t => t.typeKey === 'dart');
    for (let i = 0; i < 4; i++) Game.upgradeTower(sm, 'top');
    for (let i = 0; i < 4; i++) Game.upgradeTower(d, 'top');
  });
  await page.waitForTimeout(200);

  await page.evaluate(() => { Game.round = 30; Game.startRound(); Game.speed = 5; });
  console.log('Running 15s with maxed towers, round 31 (MOAB)...');
  await page.waitForTimeout(15000);

  let state = await page.evaluate(() => ({
    round: Game.round, lives: Game.lives, pops: Game.totalPops,
    bloons: Game.bloons.length, inRound: Game.inRound,
    towers: Game.towers.map(t => ({ type: t.typeKey, top: t.upgrades.top, bot: t.upgrades.bot }))
  }));
  console.log('Result:', state);
  await page.screenshot({ path: '/tmp/gametest_final.png' });
  console.log('Errors:', errors);
  await browser.close();
})();
