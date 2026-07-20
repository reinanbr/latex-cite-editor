import { useMemo, useState } from 'react';
import {
  parseBibtex,
  formatBibliography,
  exportBibliography,
  type CitationStyle,
  type ExportFormat,
} from 'latex-cite-editor';

const BIB = `@book{sagan1980,
  author    = {Sagan, Carl},
  title     = {Cosmos},
  publisher = {Random House},
  address   = {New York},
  year      = {1980}
}

@article{deterding2011,
  author  = {Sebastian Deterding and Dan Dixon and Rilla Khaled and Lennart Nacke},
  title   = {From Game Design Elements to Gamefulness: Defining Gamification},
  journal = {Proceedings of the 15th International Academic MindTrek Conference},
  year    = {2011},
  volume  = {11},
  number  = {2},
  pages   = {9--15},
  address = {New York},
  doi     = {10.1145/2181037.2181040}
}`;

const STYLES: { id: CitationStyle; label: string }[] = [
  { id: 'abnt', label: 'ABNT (NBR 6023)' },
  { id: 'ieee', label: 'IEEE' },
  { id: 'mla', label: 'MLA' },
  { id: 'apa', label: 'APA' },
];

const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'endnote', label: 'EndNote' },
  { id: 'refman', label: 'RefMan (RIS)' },
  { id: 'refworks', label: 'RefWorks' },
];

/**
 * `formatBibliography(entries, style)` renders every entry as a formatted,
 * ready-to-inject HTML reference list per the chosen style; `exportBibliography
 * (entries, format)` instead produces a single plain-text file string for
 * importing into a reference manager (EndNote, Reference Manager/RefMan, or
 * RefWorks) — same shape as the "Cite" dropdown on Google Scholar.
 *
 * No 'use client' needed: both functions are plain, server-safe exports from
 * the root entry, same as formatBibliographyAbnt.
 */
export default function CitationStylesExample() {
  const [style, setStyle] = useState<CitationStyle>('ieee');
  const [format, setFormat] = useState<ExportFormat>('endnote');

  const entries = useMemo(() => parseBibtex(BIB), []);
  const references = useMemo(() => formatBibliography(entries, style), [entries, style]);
  const exported = useMemo(() => exportBibliography(entries, format), [entries, format]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h3>Formatted styles</h3>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {STYLES.map((s) => (
            <button key={s.id} onClick={() => setStyle(s.id)} aria-pressed={s.id === style}>
              {s.label}
            </button>
          ))}
        </div>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {references.map((ref) => (
            <li key={ref.key} style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: ref.html }} />
          ))}
        </ol>
      </div>

      <div>
        <h3>Reference-manager export</h3>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {EXPORT_FORMATS.map((f) => (
            <button key={f.id} onClick={() => setFormat(f.id)} aria-pressed={f.id === format}>
              {f.label}
            </button>
          ))}
        </div>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
          {exported}
        </pre>
      </div>
    </div>
  );
}
