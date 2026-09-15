import { useRef, useState } from 'react';
// No <LabelList>: recharts 2.x renders it with a string ref, which React 18 StrictMode rejects in production.
// Every value it would draw is in the tooltip and in the "every value with its own source" table under each figure.
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NormalChart, Row } from '@/types';
import { CAT } from '@/lib/data';
import { downloadCsv, svgToPng } from './download';

interface Props { id: string; spec: NormalChart; rows: Row[]; fields: string[]; inline?: boolean }

const num = (v: unknown): number | null => (typeof v === 'number' ? v : v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null);
const SHAPES = ['■', '▲', '●', '◆', '▼', '★'];
const fmt = (v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(1) : String(Number(v.toPrecision(3))));

function Downloads({ png, csv }: { png: () => void; csv: () => void }) {
  return <div className="ml-auto inline-flex gap-1 no-print"><button type="button" className="bx-btn" onClick={png}>PNG</button><button type="button" className="bx-btn" onClick={csv}>CSV</button></div>;
}

function ToggleLegend({ label, items, hidden, onToggle }: { label: string; items: { key: string; colour: string; shape: string }[]; hidden: Set<string>; onToggle: (k: string) => void }) {
  return (
    <ul className="flex flex-wrap gap-2 text-xs" aria-label={`${label} (click to show or hide)`}>
      {items.map((it) => (
        <li key={it.key}>
          <button type="button" className={`bx-btn !py-0.5 ${hidden.has(it.key) ? 'opacity-50 line-through' : ''}`} aria-pressed={!hidden.has(it.key)} onClick={() => onToggle(it.key)}>
            <span aria-hidden="true" style={{ color: it.colour }}>{it.shape}</span> {it.key}
          </button>
        </li>
      ))}
    </ul>
  );
}

const toggle = (set: Set<string>, k: string) => { const n = new Set(set); if (n.has(k)) n.delete(k); else n.add(k); return n; };

/** A category tick that wraps long labels instead of cutting them off. */
function WrappedTick({ x, y, payload, width }: { x?: number; y?: number; payload?: { value: string }; width: number }) {
  const words = String(payload?.value ?? '').split(/\s+/);
  const max = Math.max(12, Math.floor(width / 6.4));
  const lines: string[] = [];
  let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = `${cur} ${w}`.trim(); }
  if (cur) lines.push(cur);
  const shown = lines.slice(0, 3);
  return (
    <text x={x} y={(y ?? 0) - ((shown.length - 1) * 12) / 2} textAnchor="end" fontSize={11} fill="var(--bx-ink)">
      {shown.map((l, i) => <tspan key={i} x={(x ?? 0) - 6} dy={i === 0 ? 4 : 12}>{i === 2 && lines.length > 3 ? `${l}…` : l}</tspan>)}
    </text>
  );
}

function logDomain(values: number[]): [number, number] {
  const positive = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!positive.length) return [0.1, 10];
  const lo = Math.pow(10, Math.floor(Math.log10(Math.min(...positive))));
  const hi = Math.pow(10, Math.ceil(Math.log10(Math.max(...positive))));
  return [lo, hi === lo ? lo * 10 : hi];
}

/**
 * Horizontal bars, one per row, spanning [y, y_high] where the source gives a range and drawn as a thin mark where it
 * gives one value. Optional log axis (computed from the data and snapped to powers of ten — never 'auto', which hangs
 * a log scale). Rows are grouped by `group_by` with a colour AND a shape, and the groups toggle.
 */
export function RangeBars({ id, spec, rows, fields, inline }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const g = spec.group_by;
  const groups = g ? [...new Set(rows.map((r) => String(r[g])))] : ['all'];
  const style = (key: string) => { const i = Math.max(0, groups.indexOf(key)); return { colour: CAT[i % CAT.length], shape: SHAPES[i % SHAPES.length] }; };
  const data = rows
    .filter((r) => !g || !hidden.has(String(r[g])))
    .map((r) => {
      const lo = num(r[spec.y.field]);
      const hi = spec.y_high ? num(r[spec.y_high]) ?? lo : lo;
      const key = g ? String(r[g]) : 'all';
      return { row: r, key, lo, hi, label: `${g ? style(key).shape + ' ' : ''}${String(r[spec.x.field])}`, range: lo === null ? null : [lo, hi ?? lo] };
    });
  const log = spec.y.scale === 'log';
  const values = rows.flatMap((r) => [num(r[spec.y.field]), spec.y_high ? num(r[spec.y_high]) : null]).filter((v): v is number => v !== null);
  const domain: [number, number] = log ? logDomain(values) : [0, Math.max(...values, 0) * 1.05 || 1];
  const tickWidth = inline ? 170 : 250;
  const unit = spec.y.unit ? ` ${spec.y.unit}` : '';
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {g && <ToggleLegend label={spec.x.label} items={groups.map((k) => ({ key: k, ...style(k) }))} hidden={hidden} onToggle={(k) => setHidden((h) => toggle(h, k))} />}
        {!inline && <Downloads png={() => { const svg = ref.current?.querySelector('svg.recharts-surface'); if (svg) svgToPng(svg as SVGSVGElement, `${id}-chart.png`); }} csv={() => downloadCsv(rows, fields, `${id}-data.csv`)} />}
      </div>
      <div ref={ref} className="mt-2" style={{ width: '100%', height: data.length * 46 + 70 }} role="img" aria-label={`Horizontal bar chart of ${spec.y.label}${unit ? ` in${unit}` : ''}${log ? ' on a logarithmic axis' : ''}, one bar per ${spec.x.label.toLowerCase()}${g ? `, grouped by ${g}` : ''}. Every value is listed with its source in the table below.`} data-testid={`chart-${id}`}>
        <ResponsiveContainer>
          <BarChart layout="vertical" data={data} margin={{ top: 8, right: 24, left: 8, bottom: 28 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--bx-line)" />
            <XAxis type="number" scale={log ? 'log' : 'linear'} domain={domain} allowDataOverflow tickFormatter={fmt} tick={{ fill: 'var(--bx-muted)', fontSize: 12 }}
              label={{ value: `${spec.y.label.replace(/\s*\(.*\)$/, '')}${unit ? ` (${spec.y.unit})` : ''}${log ? ' — log scale' : ''}`, position: 'insideBottom', offset: -16, fill: 'var(--bx-muted)', fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={tickWidth} interval={0} tick={(p: object) => <WrappedTick {...(p as { x: number; y: number; payload: { value: string } })} width={tickWidth} />} />
            <Tooltip
              cursor={{ fill: 'var(--bx-bg-2)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as (typeof data)[number];
                return (
                  <div className="bx-card p-2 text-xs max-w-[22rem] bg-paper dark:bg-night" data-testid="chart-tooltip">
                    <p className="font-semibold">{String(d.row[spec.x.field])}</p>
                    <p className="mt-0.5">{d.lo === null ? 'no value' : d.hi !== null && d.hi !== d.lo ? `${d.lo}–${d.hi}${unit}` : `${d.lo}${unit}`}{d.hi !== null && d.hi !== d.lo ? ' (range as reported)' : ''}</p>
                    {fields.filter((f) => ![spec.x.field, spec.y.field, spec.y_high, 'unit', 'ref'].includes(f)).map((f) => d.row[f] !== null && <p key={f} className="mt-0.5 bx-muted">{f}: {String(d.row[f])}</p>)}
                    {d.row.ref !== undefined && <p className="mt-0.5 bx-muted">source: [{String(d.row.ref)}]</p>}
                  </div>
                );
              }}
            />
            <Bar dataKey="range" minPointSize={4} isAnimationActive={false} radius={2}>
              {data.map((d, i) => <Cell key={i} fill={style(d.key).colour} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs bx-muted">Hover or focus a bar for its exact value, preparation and source. A range is drawn from the low to the high value as the source reports it; a single value is a thin mark. Nothing is pooled.</p>
    </div>
  );
}

/** Small multiples: one horizontal bar chart per facet (fig8's four ways of counting the reference base). */
export function FacetBars({ id, spec, rows, fields, inline }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const facet = spec.facet_by!;
  const facets = [...new Set(rows.map((r) => String(r[facet])))];
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const tickWidth = inline ? 150 : 220;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <ToggleLegend label="Panels" items={facets.map((f, i) => ({ key: f, colour: CAT[i % CAT.length], shape: SHAPES[i % SHAPES.length] }))} hidden={hidden} onToggle={(k) => setHidden((h) => toggle(h, k))} />
        {!inline && <Downloads png={() => ref.current?.querySelectorAll('svg.recharts-surface').forEach((svg, i) => svgToPng(svg as SVGSVGElement, `${id}-${facets.filter((f) => !hidden.has(f))[i] ?? i}.png`))} csv={() => downloadCsv(rows, fields, `${id}-data.csv`)} />}
      </div>
      <div ref={ref} className="mt-2 grid gap-4 lg:grid-cols-2" data-testid={`chart-${id}`}>
        {facets.filter((f) => !hidden.has(f)).map((f) => {
          const i = facets.indexOf(f);
          const data = rows.filter((r) => String(r[facet]) === f).map((r) => ({ row: r, label: String(r[spec.x.field]), value: num(r[spec.y.field]) }));
          return (
            <section key={f} className="rounded-lg border border-[color:var(--bx-line)] p-2" aria-label={`Panel: ${f}`}>
              <h3 className="text-sm font-semibold font-body"><span aria-hidden="true" style={{ color: CAT[i % CAT.length] }}>{SHAPES[i % SHAPES.length]}</span> {f}</h3>
              <div style={{ width: '100%', height: data.length * 32 + 50 }} role="img" aria-label={`${spec.y.label} by ${spec.x.label.toLowerCase()} for ${f}. Exact values are in the table below.`}>
                <ResponsiveContainer>
                  <BarChart layout="vertical" data={data} margin={{ top: 4, right: 24, left: 4, bottom: 16 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--bx-line)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--bx-muted)', fontSize: 11 }} />
                    <YAxis type="category" dataKey="label" width={tickWidth} interval={0} tick={(p: object) => <WrappedTick {...(p as { x: number; y: number; payload: { value: string } })} width={tickWidth} />} />
                    <Tooltip
                      cursor={{ fill: 'var(--bx-bg-2)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as (typeof data)[number];
                        return (
                          <div className="bx-card p-2 text-xs max-w-[20rem] bg-paper dark:bg-night" data-testid="chart-tooltip">
                            <p className="font-semibold">{d.label}</p>
                            <p className="mt-0.5">{spec.y.label}: {d.value ?? 'no value'}</p>
                            {d.row.note && <p className="mt-0.5 bx-muted">{String(d.row.note)}</p>}
                            {d.row.ref !== undefined && <p className="mt-0.5 bx-muted">source: {String(d.row.ref)}</p>}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" fill={CAT[i % CAT.length]} isAnimationActive={false} radius={2} minPointSize={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-1 text-xs bx-muted">Hover or focus a bar for the exact count and its note. Toggle a panel to hide it.</p>
    </div>
  );
}

/** Entry used by FigureBody's lazy import: picks the chart by its normalised spec. */
export default function Charts(props: Props) {
  if (props.spec.facet_by) return <FacetBars {...props} />;
  if (props.spec.type === 'bar' || props.spec.type === 'grouped-bar' || props.spec.type === 'stacked-bar') return <RangeBars {...props} />;
  return <p className="bx-todo">TODO(author): chart type “{props.spec.type}” has no renderer in this build; every value is in the table below</p>;
}
