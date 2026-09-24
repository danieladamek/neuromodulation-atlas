# Changelog

Every version of the Neuromodulation Atlas, and what changed in it. The atlas is a commissioned review by Daniel
Adamek, drafted with AI assistance under the author's direction. It is **not peer reviewed**. Its literature sweep
closed on 15 September 2026.

Each release names the **pack hash** it was built from: sha256 over `content-pack/`. The same hash is shown in the
site footer and in `/provenance.json`, so you can tell exactly which content a version, a citation or a live page
carries.

## v0.1.1 — 2026-09-24

The first version archived by Zenodo, and the one to cite. The content is the same as v0.1.0, with the fixes below.
No claim, reference, figure, count or id changed.

- **v0.1.0 was not archived by Zenodo.** Zenodo could not load its citation metadata, so v0.1.0 has no Zenodo record
  and no DOI. It stays tagged on GitHub. v0.1.1 is the first archived version.
- **Zenodo metadata.** Added `.zenodo.json` so Zenodo no longer depends on parsing `CITATION.cff`. `CITATION.cff` now
  gives a single licence, `CC-BY-4.0`, to match the Zenodo record. The licences themselves are unchanged: code MIT
  (`LICENSE`), content CC BY 4.0 (`LICENSE-CONTENT.md`). The abstract still states both.
- **One byline on the home page.** The plain-language summary no longer ends with its own byline sentence. The home
  page printed the author, "not peer reviewed" and the sweep date twice. The app's line directly below the summary
  still states all three.
- **"The builder" removed from the review.** Section 15.6 now reads "the author's own judgement is marked as such"
  instead of "the builder's own judgement". This was the last reader-visible reference to the builder after the
  authorship decision in v0.1.0.
- **Content-pack spec v0.8.1** (`docs/CONTENT-PACK.md`). The pack's `authors` field may name the human author with an
  explicit AI-assistance disclosure, and apps render `authors`, not the builder's name, as the byline. Documentation
  only; the validator is unchanged.
- **Preview script.** `npm run preview:local` refused to start when any program held a *client* connection to port
  4180 (the Claude desktop app did). It now refuses only when a server is actually listening there.

Pack: `6dc2a3b4a6eb…` (full hash in the release notes and `/provenance.json`).

## v0.1.0 — 2026-09-24

First public release. It is tagged and was deployed to the live site, but it was **not archived by Zenodo** (see
v0.1.1).

- **Volume 0, *Foundations*,** of *Neuromodulation: an atlas of exogenous drives, from coupling to outcome*:
  16 sections, 30,352 words, 263 references (260 verified), 300 glossary terms, 18 levelled 101s, and nine figures
  (none of them reproduced published images).
- **The claims graph** (`/graph`): 458 cited claims between 880 nodes, of which 119 are contested and 9 are null
  results. It is exported as Cypher, CSV, GraphML and JSON in `public/graph/`.
- **Corpus profile corrected** on `/methods`: 263 references (36 seminal / 38 classic / 117 current /
  72 background), and three unverified references, not two.
- **Preview before public.** Pushes build a preview. The public site updates only on a release tag or a manual deploy
  that Daniel has approved, and every page shows the pack hash it was built from.
- **Faster `/graph`.** The layout is precomputed at build time, so the canvas draws with no simulation in the browser.
  Lighthouse mobile went from 74–77 to 97 on a local build.
- **Name and authorship.** The site is *Neuromodulation Atlas*, by Daniel Adamek, with AI assistance. `/about` and
  `/methods` say the content was drafted with AI assistance under the author's direction and is not peer reviewed.
- **Licences and citation.** Code MIT, content CC BY 4.0, `CITATION.cff`.
- **Fixed:** pressing Esc on a glossary popover no longer reopens it.

Pack: `30a992fce910…`.
