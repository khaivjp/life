/* Web-layer smoke tests. These do not replace testing in iOS WKWebView. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const web = path.resolve(__dirname, '../Web');
const output = process.env.PREVIEW_DIR && path.resolve(process.env.PREVIEW_DIR);
const routes = ['home', 'tasks', 'schedule', 'aptis', 'gpa', 'brain', 'shopeefood', 'settings'];
const issues = [];
const tokenMarker = 'TEST_ONLY_DO_NOT_EXPORT_TOKEN';
const url = (section, hash = '') => pathToFileURL(path.join(web, section, 'index.html')).href + hash;

async function checkWidth(page, label) {
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  if (widths.document > widths.viewport + 1 || widths.body > widths.viewport + 1) issues.push(`${label}: horizontal overflow ${JSON.stringify(widths)}`);
}
async function lifeRoute(page, route) {
  await page.evaluate(route => { location.hash = route; }, route);
  await page.waitForFunction(route => document.title.endsWith('— KhaiLife') && location.hash === '#' + route && !!document.querySelector('#content h1'), route);
  await page.waitForTimeout(100);
  assert((await page.locator('#content').innerText()).length > 30, `Life ${route} empty`);
}
async function sharePayload(page, run, expectedApp) {
  await page.evaluate(() => { window.__nativeShares = []; });
  await run();
  await page.waitForFunction(() => window.__nativeShares.length === 1);
  const message = await page.evaluate(() => window.__nativeShares[0]);
  assert(message.name.endsWith('.json'));
  const json = Buffer.from(message.base64, 'base64').toString('utf8');
  assert(!json.includes(tokenMarker), 'Backup contains token');
  const data = JSON.parse(json);
  assert.equal(data.app, expectedApp);
  return data;
}

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'vi-VN' });
    await context.addInitScript(() => {
      window.__nativeShares = [];
      window.webkit = { messageHandlers: { nativeShare: { postMessage: message => window.__nativeShares.push(message) } } };
    });
    const page = await context.newPage();
    page.on('pageerror', error => issues.push(`JavaScript: ${error.message}`));
    page.on('requestfailed', request => issues.push(`Asset failed: ${request.url()} ${request.failure()?.errorText}`));
    page.on('dialog', dialog => dialog.accept());
    await page.goto(url('life', '#home'));
    await page.locator('#content h1').waitFor();
    assert(await page.evaluate(() => !!KhaiNative), 'Native share bridge missing');
    for (const width of [390, 375]) {
      await page.setViewportSize({ width, height: 760 });
      for (const route of routes) { await lifeRoute(page, route); await checkWidth(page, `Life ${route} ${width}`); }
    }
    await page.setViewportSize({ width: 390, height: 760 });
    await lifeRoute(page, 'gpa');
    await page.locator('input[data-field="process"]:visible').first().fill('7');
    await page.locator('input[data-field="process"]:visible').first().dispatchEvent('change');
    await page.locator('input[data-field="exam"]:visible').first().fill('9');
    await page.locator('input[data-field="exam"]:visible').first().dispatchEvent('change');
    await page.waitForFunction(() => KhaiLife.store.status() === 'Đã lưu trên thiết bị');
    await page.reload();
    await page.locator('input[data-field="exam"]:visible').first().waitFor();
    assert.equal(await page.locator('input[data-field="process"]:visible').first().inputValue(), '7');
    assert.equal(await page.locator('input[data-field="exam"]:visible').first().inputValue(), '9');
    await page.evaluate(marker => localStorage.setItem('khailife_git_token_device', marker), tokenMarker);
    await lifeRoute(page, 'settings');
    const backup = await sharePayload(page, () => page.locator('#backup-export').click(), 'KhaiLife');
    assert.equal(backup.data.gpa.semesters[0].courses[0].exam, '9');
    await page.locator('[data-theme="dark"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.waitForFunction(() => KhaiLife.store.status() === 'Đã lưu trên thiết bị');
    await page.reload();
    await page.locator('#content h1').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    for (const route of routes) { await lifeRoute(page, route); await checkWidth(page, `Life dark ${route} 390`); }
    await page.locator('[data-theme="light"]').click();
    await lifeRoute(page, 'home');
    if (output) { fs.mkdirSync(output, { recursive: true }); await page.screenshot({ path: path.join(output, 'life-preview.png'), fullPage: false }); }
    // Ensure lazy-loaded Excel library remains part of the offline bundle.
    await page.addScriptTag({ path: path.join(web, 'life/vendor/xlsx.full.min.js') });
    assert(await page.evaluate(() => typeof XLSX.read === 'function'));
    await page.goto(url('thuchi'));
    await page.locator('#currentMoneyValue').waitFor();
    assert(await page.evaluate(() => !!KhaiNative));
    await page.locator('.brandbar-actions button').last().click();
    await page.locator('#txName').fill('Ăn trưa kiểm tra');
    await page.locator('#txAmount').fill('35000');
    await page.locator('#txType').selectOption('expense');
    await page.locator('#transactionForm button[type="submit"]').click();
    await page.reload();
    await page.locator('#currentMoneyValue').waitFor();
    assert.equal(await page.evaluate(() => finances.transactions.at(-1).amount), 35000);
    assert.equal(await page.evaluate(() => finances.currentMoney), -35000);
    await page.evaluate(marker => localStorage.setItem('beerich_finance_git_config_v1', JSON.stringify({ token: marker, repo: '', autoSync: false })), tokenMarker);
    const financeBackup = await sharePayload(page, () => page.locator('footer button').first().click(), 'KhaiRich');
    assert.equal(financeBackup.finances.transactions.at(-1).name, 'Ăn trưa kiểm tra');
    for (const width of [390, 375]) {
      await page.setViewportSize({ width, height: 760 });
      for (const tab of ['overview', 'expense']) { await page.locator(`.nav-item[data-tab="${tab}"]`).click(); await checkWidth(page, `Thu chi ${tab} ${width}`); }
    }
    await page.setViewportSize({ width: 390, height: 760 });
    await page.locator('.nav-item[data-tab="overview"]').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    if (output) await page.screenshot({ path: path.join(output, 'thuchi-preview.png'), fullPage: false });
    assert.deepEqual(issues, [], issues.join('\n'));
    console.log('PASS: bundled file URLs; all Life routes at 375/390px; dark theme; GPA reload persistence; expense creation/reload; native JSON export with token exclusion; local assets and Excel library; no JS errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); if (issues.length) console.error(issues.join('\n')); process.exitCode = 1; });

