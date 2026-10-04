import { test, expect, type Page } from '@playwright/test';

const SETTLE = 2300; // > EXIT_LEAD + DUR + lock release
const idx = (page: Page) => page.locator('#em-idx').textContent();

/** A trackpad-like gesture: a burst of small deltas with inertia. */
async function gesture(page: Page, sign: 1 | -1) {
  for (const d of [8, 20, 40, 60, 50, 30, 18, 10, 6, 4, 2]) {
    await page.mouse.wheel(0, sign * d);
    await page.waitForTimeout(16);
  }
}

test.describe('canvas (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('./');
    await page.mouse.move(720, 450);
    await page.waitForTimeout(2200); // intro reveal
    expect(errors, 'no page or console errors').toEqual([]);
  });

  test('opens on composition 01 with the large card and the logotype', async ({ page }) => {
    expect(await idx(page)).toBe('01');
    await expect(page.locator('.canvas')).toHaveAttribute('data-l', '1');
    const large = page.locator('.item.large');
    await expect(large).toHaveAttribute('data-id', 'A');
    await expect(large.locator('.top-svg use')).toHaveAttribute('href', '#em-mark');
    // nine cards visible in 01
    expect(await page.locator('.item.on').count()).toBe(9);
  });

  test('wheel steps one composition per gesture and never scrolls the document', async ({ page }) => {
    await gesture(page, 1); await page.waitForTimeout(SETTLE);
    expect(await idx(page)).toBe('02');
    await gesture(page, 1); await page.waitForTimeout(SETTLE);
    expect(await idx(page)).toBe('03');
    await gesture(page, -1); await page.waitForTimeout(SETTLE);
    expect(await idx(page)).toBe('02');

    // a long continuous scroll across the transition lock advances exactly one step
    for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 30); await page.waitForTimeout(60); }
    await page.waitForTimeout(SETTLE);
    expect(await idx(page)).toBe('03');

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('scroll stops at the ends; buttons and keys wrap', async ({ page }) => {
    await page.mouse.wheel(0, -120); await page.waitForTimeout(SETTLE);
    expect(await idx(page), 'no wrap backwards from 01').toBe('01');

    await page.locator('[data-go="5"]').click(); await page.waitForTimeout(SETTLE);
    expect(await idx(page)).toBe('05');
    await expect(page.locator('.item.large')).toHaveAttribute('data-id', 'K');

    await page.mouse.wheel(0, 120); await page.waitForTimeout(SETTLE);
    expect(await idx(page), 'no wrap forwards from 05').toBe('05');

    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(SETTLE);
    expect(await idx(page), 'keys wrap').toBe('01');
  });

  test('text layer shows one block per composition', async ({ page }) => {
    await expect(page.locator('.trow.mid .vis.on .state')).toHaveCount(1);
    await expect(page.locator('.trow.mid .vis.on .state')).toContainText('Repeat without drift');
    await page.locator('[data-go="3"]').click(); await page.waitForTimeout(SETTLE);
    await expect(page.locator('.trow.mid .vis.on .state')).toContainText('One source');
    await expect(page.locator('.trow.top .vis.on .lbl')).toHaveText('Method');
  });

  test('cards and captions stay inside the canvas at 1440×900', async ({ page }) => {
    const canvas = await page.locator('.canvas').boundingBox();
    const boxes = await page.locator('.item.on').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    for (const b of boxes) {
      expect(b.left).toBeGreaterThanOrEqual(canvas!.x - 1);
      expect(b.right).toBeLessThanOrEqual(canvas!.x + canvas!.width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
