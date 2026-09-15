import { useRef, useState } from 'react';
import type { AtlasClaim, ClaimsModel } from '@/types';
import { assetUrl } from '@/lib/data';
import { splitCypher, toCypher } from '@/lib/graph-export';
import { readOnlyViolation } from '@/lib/neo4j-guard';

/**
 * "Connect to my Neo4j" — closed by default, opened deliberately (APP-SPEC §4.1).
 *
 * The connection is made from the reader's browser to an endpoint they type. Credentials live in component state for
 * this tab only: they are never written to localStorage, sessionStorage, cookies or a URL, never logged, and never
 * sent anywhere but the endpoint the reader typed. There are three actions and no write-query box; the only write is
 * the confirmed atlas load, which runs the generated Cypher (constraints first, then every MERGE in one transaction).
 * The driver itself is imported only when the reader uses it, so /read never downloads it.
 */
type Row = Record<string, unknown>;
interface Result { columns: string[]; rows: Row[] }

const DEFAULT_URL = 'neo4j://localhost:7687';

export default function Neo4jPanel({ model, claims }: { model: ClaimsModel; claims: AtlasClaim[] }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [user, setUser] = useState('neo4j');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error' | 'info'; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [query, setQuery] = useState('MATCH (d:ExogenousDrive)-[r]->(o) RETURN d.label AS drive, type(r) AS predicate, o.label AS object, r.status AS status LIMIT 25');
  const [result, setResult] = useState<Result | null>(null);
  const driverRef = useRef<{ close: () => Promise<void>; session: (o?: object) => never } | null>(null);

  const withDriver = async <T,>(fn: (driver: Awaited<ReturnType<typeof makeDriver>>) => Promise<T>): Promise<T | undefined> => {
    try {
      const driver = await makeDriver(url, user, password);
      try { return await fn(driver); } finally { await driver.close(); }
    } catch (e) {
      // The message is the driver's own; it never contains the password.
      setStatus({ kind: 'error', text: (e as Error).message });
      return undefined;
    }
  };

  const makeDriver = async (u: string, name: string, pass: string) => {
    const neo4j = (await import('neo4j-driver')).default;
    return neo4j.driver(u, neo4j.auth.basic(name, pass), { disableLosslessIntegers: true, userAgent: 'neuromodulation-atlas/0.1' });
  };
  void driverRef;

  const test = async () => {
    setBusy('test'); setStatus(null);
    await withDriver(async (driver) => {
      const info = await driver.getServerInfo({ database: database || undefined });
      setStatus({ kind: 'ok', text: `Connected to ${info.address} (${info.protocolVersion ? `Bolt ${info.protocolVersion}` : 'Bolt'}). Nothing was written, and nothing you typed was stored.` });
    });
    setBusy(null);
  };

  const load = async () => {
    setBusy('load'); setStatus(null); setConfirming(false);
    const cypher = toCypher(model, claims, { label: claims.length === model.claims.length ? 'the full atlas' : 'a filtered view' });
    const { schema, data } = splitCypher(cypher);
    await withDriver(async (driver) => {
      const session = driver.session({ database: database || undefined, defaultAccessMode: 'WRITE' });
      try {
        for (const s of schema) await session.run(s);             // schema statements cannot share a transaction with writes
        const written = await session.executeWrite(async (tx) => { // every MERGE in one transaction
          for (const s of data) await tx.run(s);
          return data.length;
        });
        setStatus({ kind: 'ok', text: `Loaded: ${schema.length} constraints, then ${written} MERGE statements in one transaction. Re-running changes nothing — the statements are idempotent.` });
      } finally { await session.close(); }
    });
    setBusy(null);
  };

  const run = async () => {
    const refusal = readOnlyViolation(query);
    if (refusal) { setStatus({ kind: 'error', text: refusal }); return; }
    setBusy('query'); setStatus(null); setResult(null);
    await withDriver(async (driver) => {
      const session = driver.session({ database: database || undefined, defaultAccessMode: 'READ' });
      try {
        const res = await session.executeRead((tx) => tx.run(query));
        const columns = res.records[0]?.keys.map(String) ?? [];
        const rows = res.records.slice(0, 200).map((r) => Object.fromEntries(columns.map((c) => [c, r.get(c)])) as Row);
        setResult({ columns, rows });
        setStatus({ kind: 'ok', text: `${res.records.length} row(s) returned; the session was opened in read mode, so the server would refuse a write.` });
      } finally { await session.close(); }
    });
    setBusy(null);
  };

  const nodeCount = new Set(claims.flatMap((c) => [c.source, c.target])).size;

  return (
    <section className="bx-card p-4" aria-labelledby="neo4j-h" data-testid="neo4j-panel">
      <div className="flex flex-wrap items-center gap-3">
        <h3 id="neo4j-h" className="text-xl">Connect to my Neo4j</h3>
        <button type="button" className="bx-btn" aria-expanded={open} aria-controls="neo4j-body" onClick={() => setOpen((o) => !o)} data-testid="neo4j-toggle">{open ? 'Close the panel' : 'Open the panel'}</button>
        <a className="bx-btn" href={assetUrl('graph/claims.cypher')} download data-testid="cypher-fallback">Download claims.cypher instead</a>
      </div>
      <p className="mt-2 text-sm bx-muted">
        Optional and closed by default. It connects from your browser to a database you name — this site has no server and never contacts a database on its own.
        Some browsers block a page served over HTTPS from reaching a database on your own machine; if that happens, the download above loads the same atlas through
        Neo4j Browser or <code className="font-mono text-xs">cypher-shell</code>.
      </p>
      {open && (
        <div id="neo4j-body" className="mt-4 grid gap-3">
          <p className="text-sm">
            <strong>What this panel does with what you type:</strong> nothing but send it to the endpoint you name. Credentials stay in memory for this tab, are never written to
            localStorage, sessionStorage, cookies or the URL, and are gone when you close the tab. There is no write-query box: the only write is <em>Load this atlas</em>, below, and it asks first.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm">Endpoint<input className="bx-input mt-1" value={url} onChange={(e) => setUrl(e.target.value)} autoComplete="off" spellCheck={false} data-testid="neo4j-url" /></label>
            <label className="text-sm">Database <span className="bx-muted">(optional)</span><input className="bx-input mt-1" value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="neo4j" autoComplete="off" spellCheck={false} /></label>
            <label className="text-sm">Username<input className="bx-input mt-1" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" spellCheck={false} data-testid="neo4j-user" /></label>
            <label className="text-sm">Password<input className="bx-input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" data-testid="neo4j-password" /></label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="bx-btn" onClick={test} disabled={!!busy} data-testid="neo4j-test">{busy === 'test' ? 'Testing…' : 'Test connection'}</button>
            <button type="button" className="bx-btn" onClick={() => setConfirming(true)} disabled={!!busy} data-testid="neo4j-load">Load this atlas…</button>
          </div>
          {confirming && (
            <div className="bx-card p-3 border-l-4 border-l-[color:var(--bx-accent)]" data-testid="neo4j-confirm">
              <p className="text-sm">
                This will write <strong>{nodeCount} nodes</strong> and <strong>{claims.length} relationships</strong> into <code className="font-mono text-xs">{url}</code>
                {database ? <> (database <code className="font-mono text-xs">{database}</code>)</> : null}, plus uniqueness constraints. The statements are idempotent <code className="font-mono text-xs">MERGE</code>s,
                so running them twice changes nothing — but they do write. Nothing else in this app ever writes to your database.
              </p>
              <p className="mt-2 flex gap-2">
                <button type="button" className="bx-btn-primary" onClick={load} data-testid="neo4j-confirm-yes">{busy === 'load' ? 'Loading…' : 'Confirm — load it'}</button>
                <button type="button" className="bx-btn" onClick={() => setConfirming(false)}>Cancel</button>
              </p>
            </div>
          )}
          <div>
            <label className="text-sm" htmlFor="neo4j-query">Run a read query <span className="bx-muted">— read-only: the session is opened in read mode and a write clause is refused before it is sent</span></label>
            <textarea id="neo4j-query" className="bx-input mt-1 font-mono text-[13px] min-h-[5rem]" value={query} onChange={(e) => setQuery(e.target.value)} spellCheck={false} data-testid="neo4j-query" />
            <button type="button" className="bx-btn mt-2" onClick={run} disabled={!!busy} data-testid="neo4j-run">{busy === 'query' ? 'Running…' : 'Run read query'}</button>
          </div>
          {status && (
            <p className={`text-sm ${status.kind === 'error' ? 'bx-todo !inline-block !px-2' : ''}`} role="status" data-testid="neo4j-status">{status.text}</p>
          )}
          {result && (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm border-collapse" data-testid="neo4j-result">
                <caption className="sr-only">Query result</caption>
                <thead><tr>{result.columns.map((c) => <th key={c} scope="col" className="border-b-2 border-[color:var(--bx-line)] px-2 py-1 text-left font-semibold">{c}</th>)}</tr></thead>
                <tbody>{result.rows.map((r, i) => <tr key={i}>{result.columns.map((c) => <td key={c} className="border-b border-[color:var(--bx-line)] px-2 py-1">{typeof r[c] === 'object' ? JSON.stringify(r[c]) : String(r[c])}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
