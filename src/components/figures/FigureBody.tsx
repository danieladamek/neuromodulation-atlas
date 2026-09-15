import { lazy, Suspense } from 'react';
import type { Figure } from '@/types';
import PathwayDiagram from './PathwayDiagram';
import DataTable from './DataTable';
import Todo from '@/components/ui/Todo';

const Charts = lazy(() => import('./Charts'));

/** One component per figure kind (APP-SPEC §4). `inline` = the compact variant embedded in the reader. */
export default function FigureBody({ figure, inline }: { figure: Figure; inline?: boolean }) {
  switch (figure.kind) {
    case 'pathway':
    case 'network':
      return figure.graph ? <PathwayDiagram figure={figure} graph={figure.graph} inline={inline} /> : <Todo>no node/edge data for {figure.id}</Todo>;
    case 'table':
      return <DataTable figure={figure} rows={figure.table?.rows ?? []} inline={inline} />;
    case 'chart':
      return (
        <div>
          {figure.chart && figure.table ? (
            <Suspense fallback={<div className="bx-muted text-sm" style={{ minHeight: inline ? 320 : 460 }} role="status">Loading chart…</div>}>
              <Charts id={figure.id} spec={figure.chart} rows={figure.table.rows} fields={figure.table.fields} inline={inline} />
            </Suspense>
          ) : <Todo>chart specification or data missing for {figure.id}</Todo>}
          {figure.table && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer bx-muted">Every value in this figure, with its own source ({figure.table.rows.length} rows)</summary>
              <div className="mt-2"><DataTable figure={figure} rows={figure.table.rows} inline={inline} /></div>
            </details>
          )}
        </div>
      );
    case 'image':
      return <Todo>this pack reproduces no published figure images; nothing to show for {figure.id}</Todo>;
  }
}
