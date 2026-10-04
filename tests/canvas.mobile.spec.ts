import { test, expect } from '@playwright/test';

test.describe('canvas (mobile, 390×844)', () => {
  test('folds to a two-column page that scrolls, with no horizontal overflow', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('./');
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);

    // every card is laid out statically and visible
    const count = await page.locator('.item').count();
    expect(count).toBe(10);
    const visible = await page.locator('.item').evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
    expect(visible).toBe(10);

    // the statement for 01 is shown, the others hidden
    await expect(page.locator('.trow.mid .vis[data-for="1"] .state')).toBeVisible();
    await expect(page.locator('.trow.mid .vis[data-for="2"]')).toBeHidden();

    // page scrolls vertically and never horizontally
    const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, sh: document.documentElement.scrollHeight, ih: window.innerHeight }));
    expect(dims.sw).toBeLessThanOrEqual(dims.iw);
    expect(dims.sh).toBeGreaterThan(dims.ih);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});
