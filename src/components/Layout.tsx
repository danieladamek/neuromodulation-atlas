import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/theme';
import { useNotepad } from '@/lib/notepad-context';
import { LATEST_AS_OF, manifest, provenance, readyVolumes } from '@/lib/data';
const SearchModal = lazy(() => import('./SearchModal'));

const NAV = [
  { to: '/read', label: 'Read' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/concepts', label: 'Concepts' },
  { to: '/figures', label: 'Figures' },
  { to: '/graph', label: 'Graph' },
  { to: '/references', label: 'References' },
  { to: '/methods', label: 'Methods' },
  { to: '/about', label: 'About' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const notepad = useNotepad();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const inReader = /^\/read\/v\d+/.test(loc.pathname);
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    // Move focus to main on route change for keyboard/screen-reader users; keep hash navigation intact.
    const main = document.getElementById('main');
    if (main && loc.key !== 'default' && !loc.hash) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  }, [loc.pathname, loc.key, loc.hash]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const onNotepad = () => {
    if (!inReader) { navigate(`/read/${readyVolumes[0]?.id ?? 'v0'}`); notepad.setOpen(true); } else notepad.toggle();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only-focusable fixed left-2 top-2 z-[80] rounded bg-ink px-3 py-2 text-paper">Skip to content</a>
      {__PREVIEW__ && (
        <div role="note" aria-label="Preview build" data-testid="preview-banner" className="bg-amber-400 text-black text-sm font-medium">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2">
            <strong>PREVIEW — not the public site.</strong> Awaiting Daniel's approval.
            {' '}Pack <code className="font-mono" title={provenance.pack_hash}>{provenance.pack_hash.slice(0, 12)}</code>
            {' '}· commit <code className="font-mono">{__BUILD_COMMIT__}</code>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-[color:var(--bx-line)] bg-paper/90 dark:bg-night/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 sm:px-4 py-2.5">
          <Link to="/" className="font-display text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap">{manifest.short_title} <span className="bx-muted font-normal">Explorer</span></Link>
          <nav aria-label="Primary" className="ml-auto hidden xl:flex items-center gap-0.5 text-sm">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `rounded-md px-2 py-1.5 hover:bg-paper-2 dark:hover:bg-night-2 ${isActive ? 'font-semibold underline underline-offset-4' : ''}`}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="ml-auto xl:ml-1 flex items-center gap-1">
            <button type="button" className="bx-btn !px-2 sm:!px-2.5" onClick={() => setSearchOpen(true)} aria-label="Search (Command K)" title="Search ⌘K"><span aria-hidden="true">⌕</span><span className="hidden sm:inline">Search</span><kbd className="bx-kbd hidden md:inline" aria-hidden="true">⌘K</kbd></button>
            <button type="button" onClick={toggle} className="bx-btn !px-2 sm:!px-2.5" aria-pressed={theme === 'dark'} aria-label={`${theme === 'dark' ? 'Dark' : 'Light'} theme — switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle light/dark theme">
              <span aria-hidden="true">{theme === 'dark' ? '☾' : '☼'}</span><span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
            <button type="button" className={`bx-btn !px-2 sm:!px-2.5 ${notepad.open && inReader ? 'bx-btn-on' : ''}`} onClick={onNotepad} aria-pressed={notepad.open && inReader} aria-label="Notes — toggle notepad" title="Notepad"><span aria-hidden="true">✎</span><span className="hidden sm:inline">Notes</span></button>
            <button type="button" className="bx-btn !px-2 xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu" onClick={() => setOpen((o) => !o)}><span aria-hidden="true">☰</span><span className="hidden sm:inline">Menu</span></button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Primary mobile" className="xl:hidden border-t border-[color:var(--bx-line)] px-4 py-2 grid grid-cols-2 gap-1 text-sm">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `rounded-md px-2.5 py-2 ${isActive ? 'font-semibold underline underline-offset-4' : ''}`}>{n.label}</NavLink>
            ))}
          </nav>
        )}
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      {searchOpen && <Suspense fallback={null}><SearchModal open onClose={() => setSearchOpen(false)} /></Suspense>}
      <footer className="border-t border-[color:var(--bx-line)] mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm bx-muted">
          {manifest.short_title} Explorer — a <strong>commissioned review</strong> in volumes, written by the {manifest.builder.name}, with a graph lab over its claims.
          {' '}<strong>Not peer reviewed.</strong> Current as of {LATEST_AS_OF}. Scientific content comes only from the content pack; see <Link className="underline" to="/methods">Methods</Link> and <Link className="underline" to="/about">About</Link>.
          {' '}<span data-testid="build-stamp">Pack <code className="font-mono" title={provenance.pack_hash}>{provenance.pack_hash.slice(0, 12)}</code> · build <code className="font-mono">{__BUILD_COMMIT__}</code>.</span>
        </div>
      </footer>
    </div>
  );
}
