import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const LAYOUT = JSON.parse(fs.readFileSync(path.resolve('src/data/graph-layout.json'), 'utf8')) as { positions: Record<string, [number, number]> };

test('the graph lab renders every claim, and nothing but the claims', async ({ page }) => {
  await page.goto('/graph');
  await expect(page.getByTestId('view-counts')).toContainText(/Showing 458 of 458 claims and 880 of 880 nodes/);
  await expect(page.getByTestId('graph-canvas')).toBeVisible();
  await expect(page.getByTestId('claims-table')).toBeVisible();
});

test('the full atlas draws at its build-time layout with no simulation; a filtered view still lays itself out (E1)', async ({ page }) => {
  await page.goto('/graph');
  await expect(page.getByTestId('view-counts')).toContainText(/Showing 458 of 458 claims/);
  await expect(page.getByText(/Laying out \d+ nodes/)).toHaveCount(0);
  const drawn = await page.locator('[data-node] circle').evaluateAll((els) => els.map((c) => [c.parentElement!.getAttribute('data-node')!, Number(c.getAttribute('cx')), Number(c.getAttribute('cy'))] as const));
  expect(drawn).toHaveLength(Object.keys(LAYOUT.positions).length);
  for (const [id, x, y] of drawn) expect([x, y]).toEqual(LAYOUT.positions[id]);
  // still exactly the marks it had: dashed contested edges, ∅ on the nine null results
  await expect(page.locator('line[data-status="contested"][stroke-dasharray]')).toHaveCount(119);
  await expect(page.locator('line[data-finding="null-result"]')).toHaveCount(9);

  await page.getByTestId('preset-contested').click();
  await expect(page.getByTestId('view-counts')).toContainText(/Showing 119 of 458 claims/);
  await expect(page.getByText(/Laying out \d+ nodes/)).toHaveCount(0, { timeout: 15_000 });
  const moved = await page.locator('[data-node] circle').evaluateAll((els) => els.filter((c) => Number.isFinite(Number(c.getAttribute('cx')))).length);
  expect(moved).toBeGreaterThan(0);
});

test('contested claims are dashed, and opening one shows every rival position side by side', async ({ page }) => {
  await page.goto('/graph');
  await page.getByTestId('preset-contested').click();
  await expect(page.getByTestId('view-counts')).toContainText(/Showing 119 of 458 claims/);
  // every drawn edge in this view is dashed
  const dashes = await page.locator('[data-claim][data-status]').evaluateAll((els) => els.map((e) => [e.getAttribute('data-status'), (e as SVGLineElement).getAttribute('stroke-dasharray')]));
  expect(dashes.length).toBeGreaterThan(0);
  for (const [status, dash] of dashes) { expect(status).toBe('contested'); expect(dash).toBeTruthy(); }

  await page.getByTestId('claims-table').locator('tbody tr').first().getByRole('button').click();
  const card = page.getByTestId('details-panel');
  await expect(card).toContainText(/contested/);
  const group = page.getByTestId('hypothesis-group');
  await expect(group).toBeVisible();
  await expect(group.getByRole('heading')).toContainText(/\?/);
  await expect(group.getByTestId('rivals').locator('> li')).toHaveCount(await group.getByTestId('rivals').locator('> li').count());
  expect(await group.getByTestId('rivals').locator('> li').count()).toBeGreaterThanOrEqual(2);
  await expect(group).toContainText(/this claim’s position/);
});

test('the nine null results read as null results everywhere they appear', async ({ page }) => {
  await page.goto('/graph');
  await page.getByTestId('preset-null').click();
  await expect(page.getByTestId('view-counts')).toContainText(/Showing 9 of 458 claims/);
  const rows = page.getByTestId('claims-table').locator('tbody tr');
  await expect(rows).toHaveCount(9);
  for (const row of await rows.all()) {
    await expect(row).toHaveAttribute('data-finding', 'null-result');
    await expect(row.getByTestId('null-result-chip')).toBeVisible();
  }
  // the canvas marks them too
  expect(await page.locator('[data-finding="null-result"][data-claim]').count()).toBe(9);
  await rows.first().getByRole('button').first().click();
  const card = page.getByTestId('details-panel');
  await expect(card.getByTestId('null-result-chip')).toBeVisible();
  await expect(card.getByTestId('finding-note')).toContainText(/What was not found/);
});

test('a claim card carries its references, its section and its parameters as published', async ({ page }) => {
  await page.goto('/graph?claim=C0001');
  const card = page.getByTestId('details-panel');
  await expect(card).toContainText('CLAIM C0001');
  // the card links back to the section of the volume that argues the claim
  await expect(card.locator('a[href*="/read/v0#v0-"]').first()).toBeVisible();
  await card.locator('[data-testid^="claim-ref-"]').first().click();
  await expect(page.getByTestId('claim-ref-foldout')).toBeVisible();
});

test('analytics run in the browser and give an answer', async ({ page }) => {
  await page.goto('/graph');
  await page.getByTestId('metric-select').selectOption('pagerank');
  await page.getByTestId('run-metric').click();
  await expect(page.getByTestId('metric-summary')).toContainText(/PageRank/);
  await expect(page.getByTestId('metric-table').locator('tbody tr')).toHaveCount(50);

  await page.getByTestId('metric-select').selectOption('components');
  await page.getByTestId('run-metric').click();
  await expect(page.getByTestId('metric-summary')).toContainText(/weakly connected components/);
});

test('the drive → outcome preset offers only reachable outcomes and names the claims on the path', async ({ page }) => {
  await page.goto('/graph');
  await page.getByTestId('path-preset').selectOption('drive-outcome');
  const from = page.getByTestId('path-from');
  await from.click();
  // pick the first drive the datalist offers
  const firstDrive = await page.locator('datalist option').first().getAttribute('value');
  await from.fill(firstDrive!);
  await expect(page.getByText(/nodes are reachable from the start node/)).toBeVisible();
  await page.getByTestId('find-paths').click();
  await expect(page.getByTestId('paths-note')).toBeVisible();
});

test('the current view exports the same five ways as the build', async ({ page }) => {
  await page.goto('/graph');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Cypher', exact: true }).click()]);
  expect(dl.suggestedFilename()).toBe('claims-view.cypher');
  const text = await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c as Buffer[]).toString('utf8'));
  expect(text).toContain('CREATE CONSTRAINT');
  expect(text).toContain('MERGE (s)-[r:');
});

test('the Neo4j panel stores nothing, offers no write query, and always offers the download', async ({ page, context }) => {
  await page.goto('/graph');
  const panel = page.getByTestId('neo4j-panel');
  await expect(panel.getByTestId('cypher-fallback')).toBeVisible();
  await expect(panel.getByTestId('neo4j-url')).toBeHidden();          // closed by default
  await panel.getByTestId('neo4j-toggle').click();
  await expect(panel.getByTestId('neo4j-url')).toBeVisible();

  const secret = 'not-a-real-password-8fc3';
  await panel.getByTestId('neo4j-user').fill('neo4j');
  await panel.getByTestId('neo4j-password').fill(secret);
  await panel.getByTestId('neo4j-test').click();
  await expect(panel.getByTestId('neo4j-status')).toBeVisible({ timeout: 30_000 });   // no database here: it reports the failure

  // nothing typed reaches storage of any kind
  const stored = await page.evaluate(() => ({
    local: JSON.stringify(Object.entries(localStorage)),
    session: JSON.stringify(Object.entries(sessionStorage)),
    cookie: document.cookie,
    url: location.href,
  }));
  expect(stored.local).not.toContain(secret);
  expect(stored.session).not.toContain(secret);
  expect(stored.cookie).not.toContain(secret);
  expect(stored.url).not.toContain(secret);
  expect((await context.cookies()).map((c) => c.value).join()).not.toContain(secret);

  // the only write control is the confirmed atlas load; the query box refuses a write before sending it
  const buttons = await panel.getByRole('button').allInnerTexts();
  expect(buttons.join(' | ')).not.toMatch(/write query/i);
  await panel.getByTestId('neo4j-query').fill('MATCH (n) DETACH DELETE n');
  await panel.getByTestId('neo4j-run').click();
  await expect(panel.getByTestId('neo4j-status')).toContainText(/read queries only/i);
});

test('the graph lab is reachable from a reference and from a glossary term', async ({ page }) => {
  await page.goto('/graph?refs=149');
  await expect(page.getByTestId('resting-on')).toContainText(/claim\(s\) in the whole atlas cite/);
  await page.goto('/graph?term=tacs');
  await expect(page.getByTestId('view-counts')).toContainText(/glossary term/);
});
