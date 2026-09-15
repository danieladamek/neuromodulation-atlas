/**
 * The read-query box is read-only, twice over: the driver runs it in a READ transaction (the server rejects writes in
 * one), and this guard refuses to send anything that looks like a write in the first place. There is no write-query
 * control anywhere in the app; the only write it can make is the confirmed "Load this atlas" action.
 */
const WRITE_CLAUSES = [
  'CREATE', 'MERGE', 'DELETE', 'DETACH', 'SET', 'REMOVE', 'DROP', 'FOREACH', 'LOAD CSV',
  'CREATE OR REPLACE', 'START DATABASE', 'STOP DATABASE', 'GRANT', 'REVOKE', 'DENY', 'ALTER', 'RENAME', 'TERMINATE',
];
const WRITE_PROCEDURES = /\b(apoc\.(create|merge|refactor|periodic|trigger|import|load|atomic|do|cypher\.runWrite)|db\.create|dbms\.(security|setConfig)|gds\.(graph\.drop|graph\.project\.cypher|.*\.write))/i;

/** Strip comments, string literals and back-quoted names so keywords inside data are not mistaken for clauses. */
export function stripLiterals(q: string): string {
  let out = '';
  for (let i = 0; i < q.length; i++) {
    const c = q[i];
    if (c === '/' && q[i + 1] === '/') { while (i < q.length && q[i] !== '\n') i++; out += ' '; continue; }
    if (c === '/' && q[i + 1] === '*') { i += 2; while (i < q.length && !(q[i] === '*' && q[i + 1] === '/')) i++; i++; out += ' '; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      i++;
      while (i < q.length && q[i] !== quote) { if (q[i] === '\\') i++; i++; }
      out += ' ';
      continue;
    }
    out += c;
  }
  return out;
}

/** Returns the reason a query is refused, or null when it is safe to run as a read. */
export function readOnlyViolation(query: string): string | null {
  const q = stripLiterals(query);
  if (!q.trim()) return 'The query is empty.';
  for (const clause of WRITE_CLAUSES) {
    const re = new RegExp(`(^|[^\\w.])${clause.replace(' ', '\\s+')}\\b`, 'i');
    if (re.test(q)) return `This panel runs read queries only, and the query contains ${clause}. Use "Load this atlas" for the one write it can make, or run writes yourself in Neo4j Browser.`;
  }
  if (WRITE_PROCEDURES.test(q)) return 'This panel runs read queries only, and the query calls a procedure that can write.';
  if (/\bCALL\s*\{[\s\S]*\}\s*IN\s+TRANSACTIONS\b/i.test(q)) return 'This panel runs read queries only, and CALL { … } IN TRANSACTIONS is a write construct.';
  return null;
}
