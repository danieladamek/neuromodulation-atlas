import { expect, test } from '@playwright/test';

const PREVIEW = `http://localhost:${process.env.PREVIEW_PORT ?? 4173}`;
const FIXTURE = `http://localhost:${process.env.FIXTURE_PORT ?? 4174}`;

/**
 * APP-SPEC §1.2: "Notes keyed to prefixed section ids survive a rebuild that adds a volume."
 *
 * :4173 is the real build (v0 ready, v1 planned). :4174 is a second build of the same app from a fixture pack in
 * which v1 is ready. The note is written against the first, and the same browser storage is then presented to the
 * second — which is what actually happens to a reader when a volume is added.
 */
test('a note written in V0 survives a rebuild that adds a volume', async ({ browser }) => {
  const note = '# My notes\n\nDose is not intensity — check this against V1 when it lands.';
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${PREVIEW}/read/v0`);
  await page.getByRole('button', { name: /toggle notepad/i }).click();
  await page.getByTestId('notepad-textarea').first().fill(note);
  await expect(page.getByTestId('notepad').first()).toContainText(/saved/);

  // an anchored quote, so the note also carries a link into the volume
  await page.getByRole('heading', { level: 1 }).click();
  const state = await ctx.storageState();
  await ctx.close();

  const moved = { ...state, origins: state.origins.map((o) => ({ ...o, origin: o.origin.replace(new URL(PREVIEW).port, new URL(FIXTURE).port) })) };
  const after = await browser.newContext({ storageState: moved });
  const page2 = await after.newPage();

  // the rebuild really did add a volume
  await page2.goto(`${FIXTURE}/read`);
  await expect(page2.getByTestId('volume-card-v1')).toContainText(/ready/);
  await expect(page2.getByTestId('volume-card-v0')).toContainText(/ready/);

  // the note is still there, unchanged
  await page2.goto(`${FIXTURE}/read/v0`);
  await page2.getByRole('button', { name: /toggle notepad/i }).click();
  await expect(page2.getByTestId('notepad-textarea').first()).toHaveValue(note);

  // and the section ids it anchors to still resolve
  await page2.goto(`${FIXTURE}/read/v0#v0-3-dose`);
  await expect(page2.locator('#h-v0-3-dose')).toBeInViewport();

  // the new volume reads, and the shared numbering is untouched: [1] is still the same reference
  await page2.goto(`${FIXTURE}/read/v1`);
  await expect(page2.getByRole('heading', { level: 1 })).toContainText(/Volume 1/);
  await page2.getByTestId('cite-1').first().click();
  await expect(page2.getByTestId('citation-foldout').first()).toContainText(/Glossary of Neurostimulation Terminology/i);
  await after.close();
});

test('the graph in the rebuilt app still holds V0’s claims, with the same ids', async ({ page }) => {
  await page.goto(`${FIXTURE}/graph?claim=C0001`);
  await expect(page.getByTestId('details-panel')).toContainText('CLAIM C0001');
  await expect(page.getByTestId('view-counts')).toContainText(/of 458 claims/);
});
