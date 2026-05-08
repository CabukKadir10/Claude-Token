import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const FIXED_NOW_ISO = '2026-05-07T12:00:00.000Z';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ nowIso }) => {
    const fixedNow = new Date(nowIso).valueOf();
    const RealDate = Date;

    class MockDate extends RealDate {
      constructor(...args: Array<string | number | Date>) {
        if (args.length === 0) {
          super(fixedNow);
          return;
        }
        const value = args[0];
        if (value === undefined) {
          super(fixedNow);
          return;
        }
        super(value);
      }

      static override now() {
        return fixedNow;
      }
    }

    Object.setPrototypeOf(MockDate, RealDate);
    Object.defineProperty(MockDate, 'UTC', { value: RealDate.UTC });
    Object.defineProperty(MockDate, 'parse', { value: RealDate.parse });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Date = MockDate;
  }, { nowIso: FIXED_NOW_ISO });
});

test('fixture drop loads dashboard and KPI values become non-zero', async ({ page }) => {
  await page.goto('/');
  await loadFixture(page);

  const totalCostValue = await getKpiValue(page, /Toplam maliyet|Total cost/i);
  const totalTokenValue = await getKpiValue(page, /Toplam token|Total tokens/i);

  expect(totalCostValue).toMatch(/[1-9]/);
  expect(totalTokenValue).toMatch(/[1-9]/);
});

test('timeline 7-day preset reduces daily x-axis to 7 labels', async ({ page }) => {
  await page.goto('/');
  await loadFixture(page);

  await page.getByRole('button', { name: /Zaman Çizgisi|Timeline/i }).click();
  await page.getByRole('button', { name: /^7g$|^7d$/i }).click();

  const timelineCard = page
    .locator('div')
    .filter({ has: page.getByRole('heading', { name: /Günlük etkinlik|Daily activity/i }) })
    .first();
  await expect(timelineCard).toBeVisible();

  const dayLabels = await timelineCard.getByText(/^\d{2}-\d{2}$/).allTextContents();
  const uniqueLabels = [...new Set(dayLabels.map((value) => value.trim()))];
  expect(uniqueLabels).toHaveLength(7);
});

test('language switch updates visible strings', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Özet' })).toBeVisible();
  await page.getByRole('button', { name: /Dil değiştir|Change language/i }).click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();

  await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Özet' })).toHaveCount(0);
});

async function loadFixture(page: Page): Promise<void> {
  const fixturePath = path.resolve(__dirname, '../fixtures/sample-e2e.jsonl');

  await page
    .locator('input[type="file"][accept*=".jsonl"]')
    .setInputFiles(fixturePath);

  await expect(page.getByText(/files|dosya/i).first()).toBeVisible();
}

async function getKpiValue(page: Page, labelPattern: RegExp): Promise<string> {
  const card = page
    .locator('div')
    .filter({ hasText: labelPattern })
    .filter({ has: page.locator('div.font-mono') })
    .first();
  await expect(card).toBeVisible();
  return (await card.locator('div.font-mono').first().innerText()).trim();
}
