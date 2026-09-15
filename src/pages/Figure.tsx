import { Link, useParams } from 'react-router-dom';
import { figuresIndex, getFigure } from '@/lib/data';
import { loadFigures, useAsync } from '@/lib/heavy';
import FigureFrame from '@/components/figures/FigureFrame';
import NotFound from './NotFound';

export default function Figure() {
  const { id } = useParams();
  const meta = getFigure(id);
  const figures = useAsync(loadFigures);
  if (!meta) return <NotFound />;
  const f = figures?.find((x) => x.id === meta.id);
  const idx = figuresIndex.findIndex((x) => x.id === meta.id);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {f ? <FigureFrame figure={f} /> : (
        <div className="bx-card p-4 sm:p-6 min-h-[70vh]">
          <p className="text-[11px] font-semibold tracking-[0.15em] bx-muted">{meta.label.toUpperCase()} · {meta.kind.toUpperCase()}</p>
          <h1 className="text-2xl sm:text-3xl mt-1">{meta.title}</h1>
          <p className="mt-4 bx-muted" role="status">Loading figure…</p>
        </div>
      )}
      <p className="mt-6 flex flex-wrap gap-2 text-sm">
        {idx > 0 && <Link className="bx-btn" to={`/figures/${figuresIndex[idx - 1].id}`}>← {figuresIndex[idx - 1].label}</Link>}
        {idx < figuresIndex.length - 1 && <Link className="bx-btn" to={`/figures/${figuresIndex[idx + 1].id}`}>{figuresIndex[idx + 1].label} →</Link>}
        <Link className="bx-btn ml-auto" to="/figures">All figures</Link>
      </p>
    </div>
  );
}
