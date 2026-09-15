import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { manifest } from './data';
import { loadNotepad, notepadReducer, saveNotepad, type NotepadAction, type NotepadState } from './notepad';

interface Ctx {
  state: NotepadState; dispatch: (a: NotepadAction) => void;
  open: boolean; setOpen: (o: boolean) => void; toggle: () => void;
}
const NotepadCtx = createContext<Ctx | null>(null);

export function NotepadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((s: NotepadState, a: NotepadAction) => notepadReducer(s, a), undefined, () => loadNotepad(manifest.slug));
  const [open, setOpen] = useState(false);
  useEffect(() => { saveNotepad(manifest.slug, state); }, [state]);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const value = useMemo(() => ({ state, dispatch, open, setOpen, toggle }), [state, open, toggle]);
  return <NotepadCtx.Provider value={value}>{children}</NotepadCtx.Provider>;
}

export function useNotepad(): Ctx {
  const c = useContext(NotepadCtx);
  if (!c) throw new Error('useNotepad outside NotepadProvider');
  return c;
}
