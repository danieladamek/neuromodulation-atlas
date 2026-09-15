/** Figure data loading + declared-field validation (CSV via papaparse, JSON graphs via zod). */
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { GraphSchema, type BuildError, type FigureDef, type Graph } from './schemas';

export type Row = Record<string, string | number | null>;

/**
 * CSV cells stay as written. A cell is turned into a number only when it is entirely a plain decimal, so "0.8" is
 * plotted while "9;10;14" (a list of reference numbers) and "about 1 mV/mm" stay text. Empty cells are null — drawn
 * as gaps, never as zeros.
 */
export function parseCsv(text: string): { rows: Row[]; fields: string[] } {
  const res = Papa.parse<Record<string, string>>(text.trim(), { header: true, skipEmptyLines: true });
  const fields = res.meta.fields ?? [];
  const rows: Row[] = res.data.map((r) => {
    const o: Row = {};
    for (const f of fields) {
      const v = r[f] ?? '';
      o[f] = v === '' ? null : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    }
    return o;
  });
  return { rows, fields };
}

export interface ChartAxis { field: string; label: string; unit?: string; scale: 'linear' | 'log' }
export interface NormalChart {
  type: string;
  orientation: 'horizontal' | 'vertical';
  /** the category (or x) field */
  x: ChartAxis;
  /** the value field; with `y_high` the bar spans [y, y_high] */
  y: ChartAxis;
  y_high?: string;
  group_by?: string;
  facet_by?: string;
  series?: string;
}

const labelFor = (fig: FigureDef, field: string) => fig.columns?.find((c) => c.field === field)?.label ?? field;

/** Both spellings of a chart spec (CONTENT-PACK's axis objects and this pack's shorthand) → one shape. */
export function normaliseChart(fig: FigureDef): NormalChart | undefined {
  const c = fig.chart;
  if (!c) return undefined;
  const axis = (a: string | { field?: string; label?: string; unit?: string; scale?: 'linear' | 'log' } | undefined, fallback: string, value: boolean): ChartAxis => {
    const field = typeof a === 'string' ? a : a?.field ?? fallback;
    const obj = typeof a === 'string' ? {} : a ?? {};
    return {
      field,
      label: obj.label ?? labelFor(fig, field),
      unit: obj.unit ?? (value ? c.unit : undefined),
      scale: obj.scale ?? (value && c.log_scale ? 'log' : 'linear'),
    };
  };
  return {
    type: c.type,
    orientation: c.orientation ?? 'vertical',
    x: axis(c.x, '', false),
    y: axis(c.y, '', true),
    ...(c.y_high ? { y_high: c.y_high } : {}),
    ...(c.group_by ? { group_by: c.group_by } : {}),
    ...(c.facet_by ? { facet_by: c.facet_by } : {}),
    ...(c.series ? { series: c.series } : {}),
  };
}

export interface LoadedFigure {
  table?: { rows: Row[]; fields: string[] };
  graph?: Graph;
  chart?: NormalChart;
}

export function loadFigureData(fig: FigureDef, packDir: string, termIds: Set<string>, errors: BuildError[], topic = false): LoadedFigure {
  const out: LoadedFigure = {};
  const where = `figures/${fig.id}`;
  const E = (message: string) => errors.push({ where, message });
  if (['chart', 'table', 'network', 'pathway'].includes(fig.kind)) {
    if (!fig.data) E(`${fig.kind} needs data`);
    else {
      const p = path.join(packDir, fig.data);
      if (!fs.existsSync(p)) E(`data file missing ${fig.data}`);
      else if (fig.data.endsWith('.csv')) {
        const t = parseCsv(fs.readFileSync(p, 'utf8'));
        if (!t.rows.length) E('empty csv');
        for (const col of fig.columns ?? []) if (!t.fields.includes(col.field)) E(`column field ${col.field} not in csv`);
        // topic mode: every point in a synthesised data figure must be traceable to its own source
        if (topic && fig.synthesis === 'data' && !t.fields.includes('ref')) {
          E(`synthesis: data csv needs a 'ref' column so every row is traceable (cols: ${t.fields.join(', ')})`);
        }
        out.table = t;
      } else if (fig.data.endsWith('.json')) {
        let json: unknown;
        try { json = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { E(`${fig.data}: JSON parse error ${(e as Error).message}`); }
        const parsed = GraphSchema.safeParse(json);
        if (!parsed.success) { for (const i of parsed.error.issues) E(`${fig.data}: ${i.path.join('/')} ${i.message}`); }
        else {
          const g = parsed.data;
          const ids = new Set(g.nodes.map((n) => n.id));
          const dup = g.nodes.map((n) => n.id).filter((id, i, a) => a.indexOf(id) !== i);
          if (dup.length) E(`duplicate node ids ${[...new Set(dup)].join(', ')}`);
          for (const e of g.edges) {
            for (const end of ['from', 'to'] as const) if (!ids.has(e[end])) E(`edge endpoint ${e[end]} unknown`);
            if (e.via && !ids.has(e.via)) E(`via ${e.via} unknown`);
          }
          for (const n of g.nodes) {
            if (n.term && !termIds.has(n.term)) E(`node term ${n.term} unknown`);
            if (g.layout === 'fixed' && (n.x === undefined || n.y === undefined)) E(`fixed layout but node ${n.id} has no x/y`);
          }
          out.graph = g;
        }
      } else E(`unsupported data format ${fig.data}`);
    }
    const chart = normaliseChart(fig);
    if (chart) {
      if (!out.table) E('a chart needs a CSV data file');
      else {
        const fields = [chart.x.field, chart.y.field, chart.y_high, chart.group_by, chart.facet_by, chart.series].filter((f): f is string => !!f);
        for (const f of fields) if (!out.table.fields.includes(f)) E(`chart field ${f || '(empty)'} not in ${fig.data}`);
      }
      out.chart = chart;
    }
  }
  if (fig.kind === 'image') {
    if (!fig.image || !fs.existsSync(path.join(packDir, fig.image))) E('image missing');
    if (!fig.hotspots.length) E('image needs ≥1 hotspot');
    for (const h of fig.hotspots) for (const k of ['x', 'y', 'w', 'h'] as const) if (h[k] < 0 || h[k] > 100) E(`hotspot ${k} out of 0–100 range`);
  }
  if (fig.image && !fs.existsSync(path.join(packDir, fig.image))) E(`image path missing ${fig.image}`);
  return out;
}
