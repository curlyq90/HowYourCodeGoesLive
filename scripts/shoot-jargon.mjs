import { chromium } from 'playwright';
const OUT = process.env.OUT || '.';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.click('#btn-jargon');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/12-jargon.png` });
// also grab a beat with expander open
await page.click('#btn-jargon-close');
await page.evaluate(() => { const s = document.getElementById('beat-commit'); scrollTo(0, s.offsetTop + s.offsetHeight*0.45 - 450); });
await page.waitForTimeout(3500);
await page.click('#beat-commit .xp-head');
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/13-expander.png` });
await browser.close();
