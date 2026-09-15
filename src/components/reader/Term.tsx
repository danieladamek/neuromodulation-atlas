import type { ReactNode } from 'react';
import { getTerm } from '@/lib/data';

/**
 * A glossary term in the reader: a visually quiet dotted-underline button. It carries no hooks of its own — one
 * TermPopoverHost per page listens for hover, focus and clicks on every term, so a 30,000-word volume does not mount
 * a floating-ui instance per linked word.
 */
export default function Term({ id, children }: { id: string; children: ReactNode }) {
  const t = getTerm(id);
  if (!t) return <>{children}</>;
  return (
    <button type="button" className="bx-term" data-term={id} data-testid={`term-${id}`} aria-haspopup="dialog" aria-expanded="false">
      {children}
    </button>
  );
}
