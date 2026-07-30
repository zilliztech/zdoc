import {expect, test} from '@playwright/test';

const en = process.env.PLAYWRIGHT_EN_BASE_URL ?? 'http://localhost:18080';
const zh = process.env.PLAYWRIGHT_ZH_BASE_URL ?? 'http://localhost:18081';

test.use({viewport: {width: 1440, height: 900}});

test('Japanese Reference keeps the locale and full Python tree', async ({page}) => {
  await page.goto(`${en}/ja-JP/reference/python`);

  await expect(page.getByRole('link', {name: 'Zilliz Logo'})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Documentation sections'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Python SDK Reference'}).first()).toBeVisible();
  await expect(page.getByRole('link', {name: 'Back to Client Libraries'})).toHaveAttribute(
    'href',
    /\/ja-JP\/docs\/install-sdks$/,
  );
});

test('Chinese Python Reference does not expose sibling SDK trees', async ({page}) => {
  await page.goto(`${zh}/reference/python`);

  await expect(page.getByRole('link', {name: 'Zilliz Logo'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Back to 客户端参考'})).toBeVisible();
  const pages = page.getByRole('region', {name: 'Documentation pages'});
  await expect(pages.locator('a[href^="/reference/python"]')).not.toHaveCount(0);
  await expect(pages.locator('a[href^="/reference/java"]')).toHaveCount(0);
  await expect(pages.locator('a[href^="/reference/go"]')).toHaveCount(0);
});

test('English Java Reference keeps the expected SDK tree', async ({page}) => {
  await page.goto(`${en}/reference/java`);

  await expect(page.getByRole('navigation', {name: 'Documentation sections'})).toBeVisible();
  const pages = page.getByRole('region', {name: 'Documentation pages'});
  await expect(pages.locator('a[href^="/reference/java"]')).not.toHaveCount(0);
});

test('Japanese Node.js Reference keeps Japanese routes', async ({page}) => {
  await page.goto(`${en}/ja-JP/reference/nodejs`);

  const pages = page.getByRole('region', {name: 'Documentation pages'});
  await expect(pages.locator('a[href^="/ja-JP/reference/node"]')).not.toHaveCount(0);
  await expect(pages.locator('a[href^="/reference/node"]')).toHaveCount(0);
});

test('Chinese REST and CLI sidebars stay isolated', async ({page}) => {
  await page.goto(`${zh}/reference/restful`);

  let pages = page.getByRole('region', {name: 'Documentation pages'});
  await expect(pages.locator('a[href^="/reference/restful"]')).not.toHaveCount(0);
  await expect(pages.locator('a[href^="/reference/python"]')).toHaveCount(0);

  await page.goto(`${zh}/reference/cli/cli/overview`);

  pages = page.getByRole('region', {name: 'Documentation pages'});
  await expect(pages.locator('a[href^="/reference/cli"]')).not.toHaveCount(0);
  await expect(pages.locator('a[href^="/reference/restful"]')).toHaveCount(0);
});
