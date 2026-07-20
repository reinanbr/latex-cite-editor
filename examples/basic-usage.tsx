'use client';

import { useMemo, useState } from 'react';
import { parseBibtex, resolveCitations, type CitationStyle } from 'latex-cite-editor';
import { CiteEditor } from 'latex-cite-editor/react';

const DEFAULT_BIB = `@article{silva2020,
  author = {Silva, John},
  title = {A Study on {LaTeX} Adoption in Academic Writing},
  journal = {Journal of Computational Typesetting},
  year = {2020},
  url = {https://example.com/silva2020}
}

@book{einstein1916,
  author = {Einstein, Albert},
  title = {Die Grundlage der allgemeinen Relativitätstheorie},
  year = {1916},
  publisher = {Annalen der Physik}
}

@book{sagan2006,
  title={The Demon-Haunted World: Science as a Candle in the Dark},
  author={Sagan, Carl},
  year={2006},
  publisher={Ballantine Books},
  link=https://books.google.com/books?id=8ePUBQAAQBAJ
}`;

const DEFAULT_CONTENT = `# My article

As shown in \\cite{einstein1916}, general relativity changed physics \\cite{silva2020}.

"Science is more than a body of knowledge; it is a way of thinking" \\cite{sagan2006}.

Type \\cite{ inside the editor to see autocomplete pulling keys from the .bib above.`;

const STYLES: { id: CitationStyle | undefined; label: string }[] = [
  { id: undefined, label: 'Plain (default)' },
  { id: 'ieee', label: 'IEEE' },
  { id: 'mla', label: 'MLA' },
  { id: 'apa', label: 'APA' },
  { id: 'abnt', label: 'ABNT' },
];

/**
 * Minimal end-to-end usage: a .bib textarea feeding a <CiteEditor /> (which gets
 * live \cite{} autocomplete from it) plus a preview pane rendering the numbered
 * citations and the generated bibliography section — with a style switcher
 * showing resolveCitations()'s optional `{ style }` argument, which reformats
 * each bibliography line per IEEE/MLA/APA/ABNT while keeping the [1][2][3]
 * numbering in citation order (as opposed to formatBibliography(entries, style),
 * which sorts alphabetically for a standalone reference list — see the
 * "Citation styles & export" example for that).
 *
 * The third entry (sagan2006) mimics a real-world reference-manager export:
 * it uses a bare `link` field instead of `url` — resolveEntryUrl checks `url`,
 * then `link`, then `doi`, so it's picked up automatically.
 *
 * You bring your own Markdown renderer (marked, remark, ...) — resolveCitations()
 * only rewrites \cite{...} into HTML markers and returns the bibliography HTML;
 * run its output through your renderer same as you would the raw Markdown.
 */
export default function BasicUsageExample() {
  const [bib, setBib] = useState(DEFAULT_BIB);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [style, setStyle] = useState<CitationStyle | undefined>(undefined);

  const bibEntries = useMemo(() => parseBibtex(bib), [bib]);

  const preview = useMemo(() => {
    const { text, bibliographyHtml } = resolveCitations(content, bibEntries, style ? { style } : undefined);
    // In a real app, swap this next line for e.g. marked.parse(text) + your own
    // math/code-block handling, then append bibliographyHtml to the result.
    return text.replace(/\n/g, '<br/>') + bibliographyHtml;
  }, [content, bibEntries, style]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Minimal version of the "Recommended host CSS" from the README, inlined
          here so this example renders correctly on its own. */}
      <style>{`
        .citation-ref a { text-decoration: none; font-weight: 600; }
        .citation-ref.citation-missing { color: #ef4444; }
        .bibliography { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ccc; }
        .bibliography ol { list-style: decimal; padding-left: 1.5rem; }
        .bibliography li { margin-bottom: 0.5rem; }
        .bibliography .citation-link { text-decoration: underline; }
        .citation-backref { text-decoration: none; opacity: 0.6; }
      `}</style>

      <div>
        <label>Bibliography (.bib)</label>
        <textarea
          value={bib}
          onChange={(e) => setBib(e.target.value)}
          rows={16}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
        />

        <label>Content</label>
        <CiteEditor
          value={content}
          onChange={setContent}
          bibEntries={bibEntries}
          minHeight="240px"
          placeholder="Write in Markdown and cite with \cite{key}..."
        />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ margin: 0 }}>Preview</label>
          <select value={style ?? ''} onChange={(e) => setStyle((e.target.value || undefined) as CitationStyle)}>
            {STYLES.map((s) => (
              <option key={s.label} value={s.id ?? ''}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8, marginTop: 4 }}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>
    </div>
  );
}
