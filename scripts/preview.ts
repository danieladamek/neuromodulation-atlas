/**
 * preview.ts — `npm run preview:local` (H1). Builds exactly what the public deploy would build, from the committed
 * pack, but as a PREVIEW (banner with pack hash and commit, noindex) into dist-preview/, and serves it on :4180 at the
 * same /neuromodulation-atlas/ sub-path as GitHub Pages. Nothing leaves this machine.
 *
 * Daniel clicks through the checklist it prints; the public site updates only when he approves and a release tag or a
 * manual dispatch of deploy.yml runs. The pack hash in the banner is the one to quote when approving, and it must
 * match `pack_hash` in the live /provenance.json afterwards.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4180;
const BASE = '/neuromodulation-atlas/';
const OUT = 'dist-preview';

const run = (cmd: string, args: string[], env: Record<string, string> = {}) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) { console.error(`\npreview: \`${cmd} ${args.join(' ')}\` failed — no preview.`); process.exit(r.status ?? 1); }
};

// Only a listening server blocks the preview. A browser (or the Claude desktop app) holding a client socket to :4180
// is not a server, and used to make this check refuse to start (A5).
const busy = spawnSync('lsof', ['-nP', `-iTCP:${PORT}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' }).stdout.trim();
if (busy) { console.error(`preview: something is already listening on :${PORT} (pid ${busy.split('\n').join(', ')}). Stop it first.`); process.exit(1); }

run('npm', ['run', 'build:content']);
run('npm', ['run', 'build'], { PREVIEW: '1', BASE_PATH: BASE, OUT_DIR: OUT });

const prov = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/provenance.json'), 'utf8')) as { pack_hash: string; as_of: string };
const commit = spawnSync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
const dirty = spawnSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
const url = `http://localhost:${PORT}${BASE}`;

console.log(`
──────────────────────────────── PREVIEW ────────────────────────────────
  ${url}
  pack ${prov.pack_hash.slice(0, 12)}  (full: ${prov.pack_hash})
  commit ${commit}${dirty ? '  ⚠ uncommitted changes — this is NOT what a deploy would publish' : ''}
  sweep date ${prov.as_of}

  Click through before approving:
   [ ] /              banner reads PREVIEW; "not peer reviewed" and the sweep date show
   [ ] /read          volume index; open V0 and a section
   [ ] /methods       corpus profile, known gaps, TODO(author) list, build errors (should be none)
   [ ] /figures       each figure renders; open one
   [ ] /graph         canvas draws; contested dashed, ∅ null results, ◆ synthesis marks
   [ ] /references    count and tiers match /methods
   [ ] /about         "not peer reviewed", sweep date, licence
   [ ] /provenance.json   pack_hash is the one above

  Approve by quoting the pack hash (e.g. "approve ${prov.pack_hash.slice(0, 12)}").
  Ctrl-C to stop.
─────────────────────────────────────────────────────────────────────────
`);

const server = spawn('npx', ['vite', 'preview', '--outDir', OUT, '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'inherit', env: { ...process.env, BASE_PATH: BASE } });
server.on('exit', (code) => process.exit(code ?? 0));
