import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { FloatingPortal, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { getTerm } from '@/lib/data';
import TermCard from '@/components/ui/TermCard';

interface OpenState { el: HTMLElement; id: string; interactive: boolean }

const termButton = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>('button[data-term]') : null);

/**
 * One popover for every `<Term>` inside `container` (event delegation). Hover or focus previews the short definition;
 * click, Enter or Space opens it interactively (focus moves inside); Esc or an outside click closes it and returns
 * focus to the term. Never hover-only.
 */
export default function TermPopoverHost({ container }: { container: RefObject<HTMLElement> }) {
  const [open, setOpen] = useState<OpenState | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const overPanel = useRef(false);
  // The term that close() is handing focus back to: that focusin must not start a fresh preview, or Esc would
  // reopen the popover 120 ms after closing it.
  const refocusing = useRef<HTMLElement | null>(null);
  const timers = useRef<{ show?: number; hide?: number }>({});
  const { refs, floatingStyles } = useFloating({
    open: !!open,
    placement: 'bottom-start',
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    elements: { reference: open?.el ?? null },
  });

  const close = useCallback((returnFocus: boolean) => {
    setOpen((s) => {
      if (s) { s.el.setAttribute('aria-expanded', 'false'); if (returnFocus) { refocusing.current = s.el; s.el.focus(); } }
      return null;
    });
  }, []);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const t = timers.current;
    const preview = (el: HTMLElement) => {
      window.clearTimeout(t.hide);
      t.show = window.setTimeout(() => setOpen((s) => (s?.interactive ? s : { el, id: el.dataset.term!, interactive: false })), 120);
    };
    const leave = () => {
      window.clearTimeout(t.show);
      t.hide = window.setTimeout(() => setOpen((s) => (s && !s.interactive && !overPanel.current ? null : s)), 160);
    };
    const onOver = (e: MouseEvent) => { const el = termButton(e.target); if (el) preview(el); };
    const onOut = (e: MouseEvent) => { if (termButton(e.target)) leave(); };
    const onFocusIn = (e: FocusEvent) => {
      const el = termButton(e.target);
      if (el && el === refocusing.current) { refocusing.current = null; return; }
      refocusing.current = null;
      if (el) preview(el);
    };
    const onFocusOut = (e: FocusEvent) => { if (termButton(e.target)) leave(); };
    const onClick = (e: MouseEvent) => {
      const el = termButton(e.target);
      if (!el) return;
      e.preventDefault();
      window.clearTimeout(t.show);
      setOpen((s) => {
        if (s && s.el === el && s.interactive) { el.setAttribute('aria-expanded', 'false'); return null; }
        if (s && s.el !== el) s.el.setAttribute('aria-expanded', 'false');
        el.setAttribute('aria-expanded', 'true');
        return { el, id: el.dataset.term!, interactive: true };
      });
    };
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseout', onOut);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('mouseover', onOver);
      root.removeEventListener('mouseout', onOut);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('click', onClick);
      window.clearTimeout(t.show); window.clearTimeout(t.hide);
    };
  }, [container]);

  // interactive: focus the first link inside; Esc and outside clicks close
  useEffect(() => {
    if (!open?.interactive) return;
    const raf = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('a,button')?.focus());
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(true); } };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || open.el.contains(target)) return;
      close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open, close]);

  const term = open ? getTerm(open.id) : undefined;
  if (!open || !term) return null;
  return (
    <FloatingPortal>
      <div
        ref={(node) => { panelRef.current = node; refs.setFloating(node); }}
        style={{ ...floatingStyles, zIndex: 60 }}
        role="dialog"
        aria-label={`Glossary: ${term.term}`}
        className="bx-card p-3 max-w-sm w-max text-sm shadow-lg bg-paper dark:bg-night"
        data-testid={`term-${term.id}-popover`}
        onMouseEnter={() => { overPanel.current = true; window.clearTimeout(timers.current.hide); }}
        onMouseLeave={() => { overPanel.current = false; if (!open.interactive) close(false); }}
      >
        <TermCard term={term} onNavigate={() => close(false)} />
      </div>
    </FloatingPortal>
  );
}
