import { useEffect, useState } from 'react';
import type { ClaimsModel, Concept, Figure, GlossaryEntry, Reference, ScopeJson, Section } from '@/types';

/** Full data files as separate chunks in dist/ (loaded from the app's own bundle — never a runtime content fetch). */
const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

const volumeModules = import.meta.glob<{ default: Section[] }>('@/data/volumes/*.json');
const conceptModules = import.meta.glob<{ default: Concept }>('@/data/concepts/*.json');
const moduleFor = <T,>(mods: Record<string, () => Promise<T>>, id: string) => Object.entries(mods).find(([p]) => p.endsWith(`/${id}.json`))?.[1];

export const loadVolume = (id: string) => once(`volume:${id}`, async () => {
  const m = moduleFor(volumeModules, id);
  return m ? (await m()).default : null;
});
export const loadConcept = (id: string) => once(`concept:${id}`, async () => {
  const m = moduleFor(conceptModules, id);
  return m ? (await m()).default : null;
});
export const loadGlossary = () => once('glossary', () => import('@/data/glossary.json').then((m) => m.default as unknown as GlossaryEntry[]));
export const loadFigures = () => once('figures', () => import('@/data/figures.json').then((m) => m.default as unknown as Figure[]));
export const loadReferences = () => once('references', () => import('@/data/references.json').then((m) => m.default as unknown as Reference[]));
export const loadScope = () => once('scope', () => import('@/data/scope.json').then((m) => m.default as unknown as ScopeJson));
export const loadClaims = () => once('claims', () => import('@/data/claims.json').then((m) => m.default as unknown as ClaimsModel));
export const loadKatexCss = () => once('katex-css', () => import('katex/dist/katex.min.css'));

/** Resolve a loader into state; `undefined` while loading. */
export function useAsync<T>(load: () => Promise<T>): T | undefined {
  const [v, setV] = useState<T | undefined>(undefined);
  useEffect(() => { let live = true; load().then((x) => { if (live) setV(x); }); return () => { live = false; }; }, [load]);
  return v;
}
