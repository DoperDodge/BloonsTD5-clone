const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8000/');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/showcase_menu.png' });

  await page.click('[data-action="play"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/tmp/showcase_mapselect.png' });

  await page.click('.map-tile[data-map="meadow"]');
  await page.waitForTimeout(50);
  await page.click('[data-action="startGame"]');
  await page.waitForTimeout(500);

  // Place a variety of towers including upgrades
  await page.evaluate(() => { Game.money = 9999999; });
  const canvasInfo = await page.evaluate(() => {
    const c = document.getElementById('gameCanvas');
    const r = c.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, iw: c.width, ih: c.height };
  });

  async function place(type, gx, gy, upgrades = []) {
    await page.click(`.tower-card[data-type="${type}"]`);
    await page.waitForTimeout(30);
    const sx = canvasInfo.x + (gx / canvasInfo.iw) * canvasInfo.w;
    const sy = canvasInfo.y + (gy / canvasInfo.ih) * canvasInfo.h;
    await page.mouse.click(sx, sy);
    await page.waitForTimeout(30);
    if (upgrades.length) {
      await page.evaluate(({type, upgrades}) => {
        const t = Game.towers.filter(t => t.typeKey === type).pop();
        if (t) for (const path of upgrades) Game.upgradeTower(t, path);
      }, {type, upgrades});
    }
  }

  await place('dart', 60, 80, ['top', 'top', 'top', 'top']);  // Juggernaut
  await place('superMonkey', 850, 100, ['top', 'top', 'top', 'top']);  // Sun Temple
  await place('tack', 280, 290, ['bot', 'bot']);
  await place('ninja', 600, 280, ['top', 'top']);
  await place('bomb', 380, 600, ['top', 'top']);
  await place('ice', 100, 600, ['bot']);
  await place('wizard', 60, 280, ['bot', 'bot']);
  await place('village', 350, 350);
  await place('farm', 750, 480);
  await place('sniper', 850, 280, ['bot', 'top']);
  await place('mortar', 60, 480);
  await place('ace', 480, 100);
  await place('engineer', 750, 130);

  await page.evaluate(() => { Game.round = 25; Game.startRound(); Game.speed = 3; });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: '/tmp/showcase_gameplay.png' });
  console.log('Screenshots saved');

  await browser.close();
})();
