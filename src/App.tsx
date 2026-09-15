import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ThemeProvider } from '@/lib/theme';
import { NotepadProvider } from '@/lib/notepad-context';
import { TermDrawerProvider } from '@/components/ui/TermDrawer';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Route-level code splitting: the reader never loads the charts, the graph libraries or neo4j-driver.
const ReadIndex = lazy(() => import('@/pages/ReadIndex'));
const ReadVolume = lazy(() => import('@/pages/ReadVolume'));
const Glossary = lazy(() => import('@/pages/Glossary'));
const Concepts = lazy(() => import('@/pages/Concepts'));
const Concept = lazy(() => import('@/pages/Concept'));
const Figures = lazy(() => import('@/pages/Figures'));
const Figure = lazy(() => import('@/pages/Figure'));
const GraphLab = lazy(() => import('@/pages/Graph'));
const References = lazy(() => import('@/pages/References'));
const Methods = lazy(() => import('@/pages/Methods'));
const About = lazy(() => import('@/pages/About'));

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <ThemeProvider>
      <NotepadProvider>
        <BrowserRouter basename={basename}>
          <TermDrawerProvider>
            <Layout>
              <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-12 bx-muted min-h-[80vh]" role="status">Loading…</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/read" element={<ReadIndex />} />
                  <Route path="/read/:volume" element={<ReadVolume />} />
                  <Route path="/glossary" element={<Glossary />} />
                  <Route path="/concepts" element={<Concepts />} />
                  <Route path="/concepts/:id" element={<Concept />} />
                  <Route path="/figures" element={<Figures />} />
                  <Route path="/figures/:id" element={<Figure />} />
                  <Route path="/graph" element={<GraphLab />} />
                  <Route path="/references" element={<References />} />
                  <Route path="/methods" element={<Methods />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </TermDrawerProvider>
        </BrowserRouter>
      </NotepadProvider>
    </ThemeProvider>
  );
}
