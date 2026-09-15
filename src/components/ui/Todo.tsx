/**
 * Amber TODO(author) marker — a pending fact is shown, labelled, and never hidden or filled (APP-SPEC §6).
 * In this pack the amber markers are decisions, not oversights: 36 todo.yaml entries, three empty binding
 * tables, and a physchem block that is null nearly everywhere because PubChem was unreachable.
 */
export default function Todo({ children }: { children: React.ReactNode }) {
  return <span className="bx-todo" data-todo="author">TODO(author): {children}</span>;
}
