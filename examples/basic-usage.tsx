'use client';

import { useMemo, useState } from 'react';
import { CiteEditor, parseBibtex, resolveCitations } from 'latex-cite-editor';

const DEFAULT_BIB = `@article{silva2020,
  author = {Silva, João},
  title = {Um estudo sobre {LaTeX} no Brasil},
  journal = {Revista Brasileira de Computação},
  year = {2020},
  url = {https://example.com/silva2020}
}

@book{einstein1916,
  author = {Einstein, Albert},
  title = {Die Grundlage der allgemeinen Relativitätstheorie},
  year = {1916},
  publisher = {Annalen der Physik}
}

@book{sagan2006mundo,
  title={O mundo assombrado pelos dem{\\^o}nios: a ci{\\^e}ncia vista como uma vela no escuro},
  author={Sagan, Carl},
  year={2006},
  publisher={Editora Companhia das Letras},
  link=https://books.google.com.br/books?hl=pt-BR&lr=&id=8ePUBQAAQBAJ
}`;

const DEFAULT_CONTENT = `# Meu artigo

Como mostrado em \\cite{einstein1916}, a relatividade geral mudou a física \\cite{silva2020}.

"A ciência é mais que um corpo de conhecimento; é uma forma de pensar" \\cite{sagan2006mundo}.

Digite \\cite{ dentro do editor para ver o autocomplete puxando as chaves do .bib acima.`;

/**
 * Minimal end-to-end usage: a .bib textarea feeding a <CiteEditor /> (which gets
 * live \cite{} autocomplete from it) plus a preview pane rendering the numbered
 * citations and the generated bibliography section.
 *
 * The third entry (sagan2006mundo) is a real-world Google Scholar BibTeX export:
 * accented letters come out as LaTeX macros (`{\^o}`, `{\^e}`) and the export uses
 * a bare `link` field instead of `url`. `resolveCitations`/`formatEntry` handle
 * both automatically — `cleanLatexText` converts the macros back to "demônios"/
 * "ciência", and `resolveEntryUrl` checks `url`, then `link`, then `doi`.
 *
 * You bring your own Markdown renderer (marked, remark, ...) — resolveCitations()
 * only rewrites \cite{...} into HTML markers and returns the bibliography HTML;
 * run its output through your renderer same as you would the raw Markdown.
 */
export default function BasicUsageExample() {
  const [bib, setBib] = useState(DEFAULT_BIB);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  const bibEntries = useMemo(() => parseBibtex(bib), [bib]);

  const preview = useMemo(() => {
    const { text, bibliographyHtml } = resolveCitations(content, bibEntries);
    // In a real app, swap this next line for e.g. marked.parse(text) + your own
    // math/code-block handling, then append bibliographyHtml to the result.
    return text.replace(/\n/g, '<br/>') + bibliographyHtml;
  }, [content, bibEntries]);

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
          placeholder="Escreva em Markdown e cite com \cite{chave}..."
        />
      </div>

      <div>
        <label>Preview</label>
        <div
          style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8 }}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>
    </div>
  );
}
