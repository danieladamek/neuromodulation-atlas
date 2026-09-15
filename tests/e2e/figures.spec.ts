import { expect, test } from '@playwright/test';

test('fig3: the log-scale chart shows a tooltip with the exact value, unit and source on hover', async ({ page }) => {
  await page.goto('/figures/fig3');
  await expect(page.getByTestId('chart-fig3')).toBeVisible();
  await page.locator('.recharts-bar-rectangle').first().hover({ force: true });
  const tip = page.getByTestId('chart-tooltip');
  await expect(tip).toBeVisible();
  await expect(tip).toContainText(/V\/m/);
  await expect(tip).toContainText(/source: \[\d+\]/);
});

test('fig3: a legend toggle hides a group of bars', async ({ page }) => {
  await page.goto('/figures/fig3');
  const bars = page.locator('.recharts-bar-rectangle');
  const before = await bars.count();
  await page.getByRole('button', { name: /measured/i }).first().click();
  await expect(bars).not.toHaveCount(before);
});

test('fig6: the modality map sorts, filters, and links the citations inside its cells', async ({ page }) => {
  await page.goto('/figures/fig6');
  const table = page.getByTestId('table-fig6');
  await expect(table.locator('tbody tr')).toHaveCount(36);
  await page.getByLabel('Filter rows').first().fill('ultrasound');
  const rows = await table.locator('tbody tr').count();
  expect(rows).toBeGreaterThan(0);
  expect(rows).toBeLessThan(36);
  await expect(table.getByRole('link', { name: /Reference \d+/ }).first()).toBeVisible();
  await page.getByRole('button', { name: /Sort by Family/i }).click();
  await expect(table.locator('tbody tr').first()).toBeVisible();
});

test('fig6: a cell the pack leaves empty says so, rather than showing a filled-in value', async ({ page }) => {
  await page.goto('/figures/fig6');
  await expect(page.getByText('not reported in this corpus').first()).toBeAttached();
});

test('a diagram is keyboard reachable, shows every edge property, and is readable as text', async ({ page }) => {
  await page.goto('/figures/fig4');
  const svg = page.getByTestId('pathway-fig4');
  await expect(svg).toBeVisible();
  await svg.locator('g[role="button"]').first().focus();
  await expect(page.getByRole('status').first()).toBeVisible();
  await page.getByText(/All \d+ connections as text/).click();
  await expect(page.getByText(/proposed primary/i).first()).toBeVisible();
});

test('every figure page names the references it was built from and whether it is data or conceptual', async ({ page }) => {
  for (const id of ['fig1', 'fig3', 'fig8']) {
    await page.goto(`/figures/${id}`);
    await expect(page.getByText(/BUILT FROM \(\d+ REFERENCES\)/)).toBeVisible();
    await expect(page.getByText(/no published figure image is reproduced anywhere in this app/i)).toBeVisible();
    await expect(page.getByText(/^Source: /)).toBeVisible();
  }
});

test('a figure page at 375 px does not overflow horizontally', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto('/figures/fig6');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('a 101 offers L1–L4, the choice persists to the next 101, and the maths is typeset', async ({ page }) => {
  await page.goto('/concepts/receptor-theory-occupancy');
  const tabs = page.getByTestId('level-switch');
  await expect(tabs.getByRole('tab')).toHaveCount(4);
  await expect(tabs.getByRole('tab', { name: /L1/ })).toHaveAttribute('aria-selected', 'true');
  await tabs.getByRole('tab', { name: /L3/ }).click();
  await expect(page.getByTestId('level-panel')).toContainText(/Graduate/);
  await expect(page.locator('.katex').first()).toBeVisible();
  // the choice follows the reader to another 101, and survives a reload
  await page.goto('/concepts/ltp-ltd-plasticity');
  await expect(page.getByTestId('level-switch').getByRole('tab', { name: /L3/ })).toHaveAttribute('aria-selected', 'true');
  await page.reload();
  await expect(page.getByTestId('level-switch').getByRole('tab', { name: /L3/ })).toHaveAttribute('aria-selected', 'true');
});

test('a 101 self-check reveals its explanation, and its citations open the reference', async ({ page }) => {
  await page.goto('/concepts/receptor-theory-occupancy');
  await page.getByRole('button', { name: /^A\./ }).first().click();
  await expect(page.getByRole('status').first()).toBeVisible();
  await page.getByTestId('cite-91').first().click();
  await expect(page.getByTestId('citation-foldout').first()).toBeVisible();
});

test('/methods publishes the scope, the interview, every query and the corpus profile', async ({ page }) => {
  await page.goto('/methods');
  await expect(page.getByText('This is a scope-bounded commissioned review, not a systematic review.')).toBeVisible();
  await expect(page.getByText(/OUT OF SCOPE/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /the scoping interview/i })).toBeVisible();
  await page.getByRole('button', { name: /show all 400/i }).click();
  await expect(page.getByTestId('query-log-v0').locator('tbody tr')).toHaveCount(400);
  await expect(page.getByText(/no multi-laboratory registered-report replication/i)).toBeVisible();
  await expect(page.getByText(/curie/i).first()).toBeVisible();
});
