// Screenshot the motion site at each beat, letting animations settle.
import { chromium } from 'playwright';

const OUT = process.env.OUT || '/tmp/claude-0/-home-claude-repo/d3d9fca9-161c-51c6-b8d1-e10d1802f999/scratchpad/shots';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
page.on('pageerror', e => console.log('PAGE EXC:', e.message));

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500); // boot + fonts + world build

// total scrollable
const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
console.log('scrollable px:', total);

// 12 sections (intro + 10 beats + outro): sample the middle of each
const beats = ['00-intro','01-branch','02-worktree','03-edit','04-commit','05-push','06-pr','07-checks','08-preview','09-merge','10-live','11-outro'];
const sections = await page.evaluate(() =>
  [...document.querySelectorAll('.beat')].map(s => {
    const r = s.getBoundingClientRect();
    return { top: r.top + scrollY, h: r.height };
  })
);

for (let i = 0; i < sections.length; i++) {
  const target = Math.min(sections[i].top + sections[i].h * 0.45 - 450, total);
  await page.evaluate(y => scrollTo(0, y), Math.max(0, target));
  // let lenis smooth-scroll catch up + beat animations play
  await page.waitForTimeout(i === 7 ? 6500 : 3500);
  await page.screenshot({ path: `${OUT}/${beats[i]}.png` });
  console.log('shot', beats[i]);
}
await browser.close();
