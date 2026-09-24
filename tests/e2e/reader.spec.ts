import { expect, test } from '@playwright/test';

/** The reader mounts sections progressively; the end-of-volume nav appears once every section is in the DOM. */
async function readAll(page: import('@playwright/test').Page) {
  await expect(page.getByRole('navigation', { name: 'Volumes' })).toBeAttached({ timeout: 30_000 });
}

test('the commissioned-review banner is shown, and dismissing it never hides the sweep date', async ({ page }) => {
  await page.goto('/read/v0');
  const banner = page.getByTestId('review-banner');
  await expect(banner).toContainText(/not peer reviewed/i);
  await expect(banner).toContainText(/current as of 15 September 2026/i);
  await banner.getByRole('button', { name: /dismiss/i }).click();
  await expect(banner).toBeHidden();
  await expect(page.getByText('Current as of 2026-09-15').first()).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('review-banner')).toBeHidden();
  await expect(page.getByText('Current as of 2026-09-15').first()).toBeVisible();
});

test('every synthesis passage is visibly marked in the reader and linked from /methods', async ({ page }) => {
  await page.goto('/read/v0');
  await readAll(page);
  const blocks = page.getByTestId('synthesis-block');
  await expect(blocks).toHaveCount(101);
  await expect(blocks.first()).toContainText(/synthesis — a conclusion the cited works do not individually state/i);

  await page.goto('/methods');
  const links = page.locator('a[href*="/read/v0#syn-"]');
  await expect(links).toHaveCount(101);
  const href = await links.first().getAttribute('href');
  await page.goto(href!.replace(/^.*\/read/, '/read'));
  await expect(page.locator(`#${href!.split('#')[1]}`)).toBeInViewport();
});

test('a term popover opens by keyboard and closes with Esc, returning focus', async ({ page }) => {
  await page.goto('/read/v0');
  const term = page.locator('[data-testid^="term-"]').first();
  const id = await term.getAttribute('data-testid');
  await term.focus();
  await page.keyboard.press('Enter');
  const pop = page.getByTestId(`${id}-popover`);
  await expect(pop).toBeVisible();
  await expect(pop.getByRole('link', { name: /full entry/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  await expect(term).toBeFocused();
  // Returning focus to the term must not start a hover-style preview that reopens the popover.
  await page.waitForTimeout(400);
  await expect(pop).toBeHidden();
});

test('a citation opens a fold-out carrying the reference summary', async ({ page }) => {
  await page.goto('/read/v0');
  await page.getByTestId('cite-1').first().click();
  const fold = page.getByTestId('citation-foldout').first();
  await expect(fold).toBeVisible();
  await expect(fold).toContainText(/Glossary of Neurostimulation Terminology/i);
  await expect(fold.getByRole('link', { name: /open in references/i })).toHaveAttribute('href', /\/references#ref-1$/);
  await fold.getByRole('button', { name: /close reference 1/i }).click();
  await expect(fold).toBeHidden();
});

test('an unverified reference is marked as supporting no claim', async ({ page }) => {
  await page.goto('/references#ref-7');
  await expect(page.locator('#ref-7')).toContainText(/not verified — supports no claim/i);
});

test('the reader embeds interactive figures, building each one as the reader reaches it', async ({ page }) => {
  await page.goto('/read/v0');
  const fig = page.getByTestId('reader-figure-fig1');
  await expect(fig).toContainText(/synthesised: conceptual diagram/i);
  await fig.scrollIntoViewIfNeeded();
  await expect(fig.getByTestId('pathway-fig1')).toBeVisible({ timeout: 20_000 });
});

test('the section rail follows the reader and jumps to a subsection', async ({ page }) => {
  await page.viewportSize();
  await page.goto('/read/v0#v0-3-dose');
  const rail = page.getByRole('navigation', { name: 'Sections in this volume' });
  await expect(rail.getByRole('link', { name: /Dose/ }).first()).toBeVisible();
  // the rail re-renders as the active section changes, so assert on where the click actually landed
  await rail.locator('ol ol a').first().click();
  const hash = new URL(page.url()).hash;
  expect(hash).toMatch(/^#v0-[a-z0-9-]+--[a-z0-9-]+$/);
  await expect(page.locator(`[id="${hash.slice(1)}"]`)).toBeInViewport();
});

test('notepad: write → reload → persists → export downloads .md', async ({ page }) => {
  await page.goto('/read/v0');
  await page.getByRole('button', { name: /toggle notepad/i }).click();
  const ta = page.getByTestId('notepad-textarea').first();
  await ta.fill('# My notes\n\nDose is not intensity.');
  await expect(page.getByTestId('notepad').first()).toContainText(/saved/);
  await page.reload();
  await page.getByRole('button', { name: /toggle notepad/i }).click();
  await expect(page.getByTestId('notepad-textarea').first()).toHaveValue('# My notes\n\nDose is not intensity.');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('notepad-export').first().click()]);
  expect(dl.suggestedFilename()).toBe('neuromodulation-atlas-notes.md');
  const text = await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c as Buffer[]).toString('utf8'));
  expect(text).toContain('# Notes — Neuromodulation: an atlas of exogenous drives');
  expect(text).toContain('Dose is not intensity.');
});

test('the reader works as a drawer at 375 px without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto('/read/v0');
  await page.getByTestId('notepad-fab').click();
  const dialog = page.getByRole('dialog', { name: 'Notepad' });
  await expect(dialog).toBeVisible();
  await dialog.getByTestId('notepad-textarea').fill('mobile note');
  await dialog.getByRole('button', { name: 'Close notepad' }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
