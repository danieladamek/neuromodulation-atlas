import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Runtime Markdown — used only for the reader's own notes (the notepad preview and printed notes). Everything from
 * the content pack is rendered from build-time hast instead (see Hast.tsx). Raw HTML in notes is dropped.
 */
export default function Markdown({ md, components, className }: { md: string; components?: Components; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{md}</ReactMarkdown>
    </div>
  );
}
