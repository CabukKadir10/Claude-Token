import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3100';
const fixturePath = path.resolve('tests/fixtures/sample-e2e.jsonl');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.locator('input[type="file"][accept*=".jsonl"]').setInputFiles(fixturePath);
  await page.getByText(/files|dosya/i).first().waitFor({ state: 'visible' });

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/screenshots/overview.png', fullPage: true });

  await page.getByRole('button', { name: /Zaman Çizgisi|Timeline/i }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'docs/screenshots/timeline.png', fullPage: true });

  await page.getByRole('button', { name: /Oturumlar|Sessions/i }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'docs/screenshots/sessions.png', fullPage: true });

  await browser.close();
  // eslint-disable-next-line no-console
  console.log('README screenshots created in docs/screenshots');
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
