import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { toJsxRuntime, type Components } from 'hast-util-to-jsx-runtime';
import type { ComponentProps } from 'react';
import type { Root } from 'hast';
import Term from './Term';
import Cite, { Paragraph } from './Cite';

/**
 * Renders a hast tree produced at build time (scripts/lib/render.ts). Links the build added are the only
 * interactive parts: `#term:id` → glossary popover, `#cite:n,…` → citation fold-out. Typeset maths arrives as a
 * `data-katex` string of KaTeX's own build-time output and is injected as HTML; the pack's raw HTML never reaches here.
 */
function Anchor({ href, children }: ComponentProps<'a'>) {
  if (href?.startsWith('#term:')) return <Term id={href.slice(6)}>{children}</Term>;
  if (href?.startsWith('#cite:')) return <Cite ns={href.slice(6).split(',').map(Number)} label={textOf(children)} />;
  const external = !!href && /^https?:/.test(href);
  return <a href={href} className="underline" target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>;
}

function textOf(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(textOf).join('');
  return '';
}

function Span({ className, children, ...rest }: ComponentProps<'span'> & { 'data-katex'?: string }) {
  const html = rest['data-katex'];
  if (html !== undefined) return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  return <span className={className} {...rest}>{children}</span>;
}

function Table(props: ComponentProps<'table'>) {
  return <div className="bx-table-scroll relative overflow-x-auto" tabIndex={0} role="region" aria-label="Table (scrolls sideways)"><table {...props} /></div>;
}

export const readerComponents: Partial<Components> = {
  a: Anchor as Components['a'],
  p: (({ children }: ComponentProps<'p'>) => <Paragraph>{children}</Paragraph>) as Components['p'],
  span: Span as Components['span'],
  table: Table as Components['table'],
};

/** Plain rendering: citation tokens and terms still work, but without paragraph fold-outs. */
export const plainComponents: Partial<Components> = { a: Anchor as Components['a'], span: Span as Components['span'], table: Table as Components['table'] };

export default function Hast({ tree, components = readerComponents }: { tree: Root; components?: Partial<Components> }) {
  return toJsxRuntime(tree, { Fragment, jsx, jsxs, components, passKeys: true });
}
