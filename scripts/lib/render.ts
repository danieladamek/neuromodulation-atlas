/**
 * Markdown → hast at build time. The reader and the 101 pages ship pre-parsed trees (maths already typeset by
 * KaTeX), so the browser neither parses markdown nor runs KaTeX for ~30,000 words of review and 18 levelled 101s.
 * The text is untouched: this is the same remark-gfm + remark-math + rehype-katex pipeline the app would run, moved
 * to the build. Raw HTML from the pack is dropped except <sup>/<sub>, exactly as the runtime renderer did.
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import { toHtml } from 'hast-util-to-html';
import type { Element, Nodes, Root } from 'hast';
import { rehypeSupSub } from '../../src/components/reader/rehype-supsub';

function stripRawAndPositions() {
  const walk = (node: Nodes) => {
    delete (node as { position?: unknown }).position;
    delete (node as { data?: unknown }).data;
    if ('children' in node) {
      (node as { children: Nodes[] }).children = (node.children as Nodes[]).filter((c) => c.type !== 'raw' && c.type !== 'comment');
      for (const c of node.children as Nodes[]) walk(c);
    }
  };
  return (tree: Root) => { walk(tree); };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSupSub)
  // KaTeX renders both HTML (for sighted readers) and MathML (for screen readers); a bad formula becomes a
  // katex-error span, which katexErrors() turns into a build error rather than a silent red blob.
  .use(rehypeKatex, { output: 'htmlAndMathml', strict: 'ignore' } as Parameters<typeof rehypeKatex>[0])
  .use(stripRawAndPositions);

const classesOf = (n: Nodes): string[] => (n.type === 'element' && Array.isArray(n.properties?.className) ? (n.properties.className as string[]) : []);

/** KaTeX renders a parse failure as a red error span rather than throwing; the build treats that as an error. */
function katexErrors(tree: Root): string[] {
  const out: string[] = [];
  const walk = (n: Nodes) => {
    if (classesOf(n).includes('katex-error')) out.push(String((n as Element).properties.title ?? 'KaTeX error'));
    if ('children' in n) for (const c of n.children as Nodes[]) walk(c);
  };
  walk(tree);
  return out;
}

/**
 * A typeset formula is hundreds of nested spans; as hast JSON it dwarfs the prose around it. So each KaTeX span's
 * children are serialised once, here, into a `data-katex` string that the app injects as HTML. The string is
 * KaTeX's own output generated at build time (MathML for screen readers plus HTML for display) — pack raw HTML never
 * takes this path; it was already dropped above.
 */
function compactKatex(node: Nodes) {
  if (!('children' in node)) return;
  node.children = (node.children as Nodes[]).map((c) => {
    const cls = classesOf(c);
    if (cls.includes('katex-display') || cls.includes('katex')) {
      return { type: 'element', tagName: (c as Element).tagName, properties: { className: cls, dataKatex: toHtml({ type: 'root', children: (c as Element).children }) }, children: [] } as Element;
    }
    compactKatex(c);
    return c;
  }) as typeof node.children;
}

export function mdToHast(md: string): { hast: Root; katexErrors: string[] } {
  const hast = processor.runSync(processor.parse(md)) as Root;
  const errs = katexErrors(hast);
  compactKatex(hast);
  return { hast, katexErrors: errs };
}
