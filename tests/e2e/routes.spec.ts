import { expect, test } from '@playwright/test';

const ROUTES: [string, RegExp][] = [
  ['/', /neuromodulation: an atlas of exogenous drives/i],
  ['/read', /the review, in volumes/i],
  ['/read/v0', /volume 0 — foundations/i],
  ['/read/v1', /vagus and cranial nerve stimulation/i],
  ['/glossary', /^glossary$/i],
  ['/concepts', /concepts \(101s\)/i],
  ['/concepts/receptor-theory-occupancy', /receptor theory and occupancy/i],
  ['/concepts/graph-analytics-basics', /.+/],
  ['/figures', /^figures$/i],
  ['/figures/fig1', /the drive to outcome chain/i],
  ['/figures/fig3', /field strengths and thresholds/i],
  ['/figures/fig6', /the modality map/i],
  ['/graph', /the claims graph/i],
  ['/references', /^references$/i],
  ['/methods', /methods & provenance/i],
  ['/about', /^about$/i],
  ['/nope', /page not found/i],
];

for (const [route, h1] of ROUTES) {
  test(`route ${route} renders its h1 without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
    expect(errors).toEqual([]);
  });
}

test('every route is reachable from the header nav', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const label of ['Read', 'Glossary', 'Concepts', 'Figures', 'Graph', 'References', 'Methods', 'About']) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
});

test('the app never implies peer review, and says the sweep date on /, /read and /about', async ({ page }) => {
  for (const route of ['/', '/read', '/read/v0', '/about']) {
    await page.goto(route);
    await expect(page.getByText(/NOT PEER REVIEWED/i).first()).toBeVisible();
    await expect(page.getByText(/2026-09-15/).first()).toBeVisible();
  }
});

test('the volume index lists v0 as ready and v1 as coming', async ({ page }) => {
  await page.goto('/read');
  await expect(page.getByTestId('volume-card-v0')).toContainText(/ready/);
  await expect(page.getByTestId('volume-card-v0')).toContainText(/30,352 words/);
  const v1 = page.getByTestId('volume-card-v1');
  await expect(v1).toContainText(/coming/);
  await expect(v1.getByRole('link')).toHaveCount(0);
});

test('a deep link scrolls the reader to its section, and an old /read#section link redirects to the volume', async ({ page }) => {
  await page.goto('/read/v0#v0-3-dose');
  await expect(page.locator('#h-v0-3-dose')).toBeInViewport();
  await page.goto('/read#v0-12-methods-and-confounds');
  await expect(page).toHaveURL(/\/read\/v0#v0-12-methods-and-confounds$/);
  await expect(page.locator('#h-v0-12-methods-and-confounds')).toBeInViewport();
});

test('provenance.json and the graph exports ship with the build', async ({ page, request }) => {
  const res = await page.goto('/provenance.json');
  expect(res?.status()).toBe(200);
  const body = await res!.json();
  expect(body.blocks.uncited).toBe(0);
  expect(body.claims.total).toBe(458);
  expect(body.claims.null_results).toHaveLength(9);
  expect(body.references.unverified_but_cited).toEqual([]);
  for (const f of ['claims.cypher', 'nodes.csv', 'edges.csv', 'claims.graphml', 'claims.json']) {
    const r = await request.get(`/graph/${f}`);
    expect(r.status(), f).toBe(200);
  }
});

test('command-K search finds a section and navigates into its volume', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const box = page.getByRole('combobox');
  await expect(box).toBeFocused();
  await box.fill('coupling physics');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/read\/v0#v0-/);
});

test('dark mode toggle persists across reload', async ({ page }) => {
  await page.goto('/glossary');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('the public build carries no preview banner, and every page names the pack it was built from (H1)', async ({ page }) => {
  const prov = await (await page.request.get('/provenance.json')).json();
  expect(prov.pack_hash).toMatch(/^[0-9a-f]{64}$/);
  await page.goto('/');
  await expect(page.getByTestId('preview-banner')).toHaveCount(0);
  await expect(page.getByTestId('build-stamp')).toContainText(prov.pack_hash.slice(0, 12));
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('/about and the footer state the licences: content CC BY 4.0, code MIT (A3)', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByTestId('licence')).toContainText(/CC BY 4\.0/);
  await expect(page.getByTestId('licence')).toContainText(/App code: MIT/);
  await expect(page.locator('footer')).toContainText(/Content CC BY 4\.0, code MIT/);
  await expect(page.locator('footer')).toContainText(/Not peer reviewed/);
});

test('readers see "Neuromodulation Atlas" and Daniel Adamek as author; no page names Manuscript Interrogator or "Explorer" (A3)', async ({ page }) => {
  for (const [route] of ROUTES) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (route === '/graph') await expect(page.getByTestId('view-counts')).toBeVisible();
    const text = await page.locator('body').innerText();
    expect(text, route).not.toMatch(/Manuscript Interrogator/i);
    expect(text, route).not.toMatch(/Explorer/);
    await expect(page).toHaveTitle(/Neuromodulation Atlas/);
    await expect(page.locator('header.sticky')).toContainText('Neuromodulation Atlas');
  }
  await page.goto('/about');
  await expect(page.locator('main')).toContainText(/drafted with AI assistance under Daniel Adamek’s direction/);
  await expect(page.locator('main')).toContainText(/not peer reviewed/i);
  await page.goto('/methods');
  await expect(page.locator('main')).toContainText(/drafted with AI assistance under Daniel Adamek’s direction/);
});
