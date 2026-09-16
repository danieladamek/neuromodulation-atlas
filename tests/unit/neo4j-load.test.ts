import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Driver } from 'neo4j-driver';
import type { ClaimsModel } from '../../src/lib/claims-model';
import { splitCypher } from '../../src/lib/graph-export';

/**
 * APP-SPEC §8: "a test loads claims.cypher into a throwaway Neo4j when one is available, and otherwise parses it."
 * The parse half lives in graph-export.test.ts and always runs. This half runs only against a database named by
 * NEO4J_TEST_URL — never a default endpoint, so it can never touch a reader's own Neo4j by accident. It writes, so
 * point it at a throwaway instance; it deletes what it created afterwards.
 *
 *   NEO4J_TEST_URL=bolt://localhost:7699 npx vitest run tests/unit/neo4j-load.test.ts
 */
const URL = process.env.NEO4J_TEST_URL;
const ROOT = path.resolve(__dirname, '../..');
const suite = URL ? describe : describe.skip;

suite('claims.cypher loads into a throwaway Neo4j', () => {
  let driver: Driver;
  const run = async (cypher: string) => {
    const session = driver.session();
    try { return await session.run(cypher); } finally { await session.close(); }
  };
  const count = async (cypher: string) => Number((await run(cypher)).records[0].get('c'));

  beforeAll(async () => {
    const neo4j = (await import('neo4j-driver')).default;
    driver = neo4j.driver(URL!, neo4j.auth.basic(process.env.NEO4J_TEST_USER ?? 'neo4j', process.env.NEO4J_TEST_PASSWORD ?? 'neo4j'), { disableLosslessIntegers: true });
    await driver.getServerInfo();
    await run('MATCH (n:Entity) DETACH DELETE n');
  }, 120_000);

  afterAll(async () => {
    if (!driver) return;
    await run('MATCH (n:Entity) DETACH DELETE n');
    await driver.close();
  }, 120_000);

  it('runs every statement, lands the counts the model declares, and is idempotent', async () => {
    const model = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/claims.json'), 'utf8')) as ClaimsModel;
    const { schema, data } = splitCypher(fs.readFileSync(path.join(ROOT, 'public/graph/claims.cypher'), 'utf8'));

    // Constraints first: Neo4j refuses schema and data changes in one transaction, which is why the panel splits them.
    for (const s of schema) await run(s);
    const load = async () => {
      const session = driver.session({ defaultAccessMode: 'WRITE' });
      try { await session.executeWrite(async (tx) => { for (const s of data) await tx.run(s); }); } finally { await session.close(); }
    };
    await load();

    expect(await count('MATCH (n:Entity) RETURN count(n) AS c')).toBe(model.nodes.length);
    expect(await count('MATCH (:Entity)-[r]->(:Entity) RETURN count(r) AS c')).toBe(model.claims.length);
    expect(await count('MATCH ()-[r]->() WHERE r.claim_id IS NOT NULL RETURN count(DISTINCT r.claim_id) AS c')).toBe(model.claims.length);

    // the properties APP-SPEC §4.1 requires every relationship to carry
    expect(await count("MATCH ()-[r]->() WHERE r.refs IS NULL OR r.status IS NULL OR r.evidence IS NULL OR r.level IS NULL OR r.section IS NULL RETURN count(r) AS c")).toBe(0);

    // a null result survives the round trip as the literal string, not as NULL or false
    const nulls = model.claims.filter((c) => c.finding === 'null-result');
    expect(await count("MATCH ()-[r]->() WHERE r.finding = 'null-result' RETURN count(r) AS c")).toBe(nulls.length);
    const one = (await run(`MATCH ()-[r]->() WHERE r.claim_id = '${nulls[0].id}' RETURN r.finding_note AS c`)).records[0].get('c');
    expect(one).toBe(nulls[0].finding_note);

    // contested claims keep the rival they take, so the hypothesis group is reachable from the graph
    expect(await count("MATCH ()-[r]->() WHERE r.status = 'contested' AND r.hypothesis IS NOT NULL RETURN count(r) AS c"))
      .toBe(model.claims.filter((c) => c.status === 'contested').length);

    // running it again changes nothing
    await load();
    expect(await count('MATCH (n:Entity) RETURN count(n) AS c')).toBe(model.nodes.length);
    expect(await count('MATCH (:Entity)-[r]->(:Entity) RETURN count(r) AS c')).toBe(model.claims.length);
  }, 600_000);
});
