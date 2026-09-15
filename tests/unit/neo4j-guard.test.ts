import { describe, expect, it } from 'vitest';
import { readOnlyViolation, stripLiterals } from '../../src/lib/neo4j-guard';

describe('the read-query guard', () => {
  it('allows reads', () => {
    for (const q of [
      'MATCH (d:ExogenousDrive)-[r]->(o) RETURN d.label, type(r) LIMIT 10',
      'MATCH p = (a)-[*..3]->(b) WHERE a.id = $id RETURN p',
      'CALL db.labels() YIELD label RETURN label',
      'MATCH (n) RETURN n.created AS created ORDER BY created DESC',
      "MATCH (n) WHERE n.label CONTAINS 'CREATE' RETURN n",
      'MATCH (n) RETURN n // CREATE would be a write, but this is a comment',
    ]) expect(readOnlyViolation(q), q).toBeNull();
  });

  it('refuses every write clause before anything is sent', () => {
    for (const q of [
      'CREATE (n:Thing)',
      'MATCH (n) SET n.x = 1',
      'MERGE (n:Thing {id: 1})',
      'MATCH (n) DELETE n',
      'MATCH (n) DETACH DELETE n',
      'MATCH (n) REMOVE n:Label',
      'DROP CONSTRAINT x',
      "LOAD CSV FROM 'file:///x.csv' AS row RETURN row",
      'MATCH (n) FOREACH (x IN [1] | SET n.y = x)',
      'CALL { MATCH (n) DELETE n } IN TRANSACTIONS',
      'CALL apoc.create.node(["X"], {})',
      'GRANT ROLE reader TO alice',
    ]) expect(readOnlyViolation(q), q).toMatch(/read queries only/i);
  });

  it('refuses an empty query', () => {
    expect(readOnlyViolation('   ')).toMatch(/empty/);
  });

  it('strips comments, strings and back-quoted names before looking for clauses', () => {
    expect(stripLiterals("RETURN 'a CREATE b'")).not.toContain('CREATE');
    expect(stripLiterals('RETURN `CREATE`')).not.toContain('CREATE');
    expect(stripLiterals('RETURN 1 /* CREATE */ + 2')).not.toContain('CREATE');
    expect(stripLiterals("RETURN 'it\\'s fine'")).toBe('RETURN  ');
  });
});
