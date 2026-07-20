import { useState } from 'react';
import BasicUsageExample from '../examples/basic-usage';
import ArticleEditorWithToolbar from '../examples/article-editor-with-toolbar';
import AbntBibliographyExample from '../examples/abnt-bibliography';
import CitationStylesExample from '../examples/citation-styles';

const REPO_URL = 'https://github.com/reinanbr/latex-cite-editor';
const NPM_URL = 'https://www.npmjs.com/package/latex-cite-editor';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'basic-usage', label: 'Basic usage' },
  { id: 'toolbar', label: 'Editor + toolbar' },
  { id: 'abnt', label: 'ABNT bibliography' },
  { id: 'styles', label: 'Citation styles & export' },
  { id: 'api', label: 'API reference' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="code-block">
      <code>{children.trim()}</code>
    </pre>
  );
}

function Overview() {
  return (
    <div className="prose">
      <h2>Why</h2>
      <p>
        Writing a technical/academic article in Markdown usually means citations degrade to a manually
        numbered plain-text list, with no autocomplete and no link between an in-text reference and its
        entry. <code>latex-cite-editor</code> borrows the one LaTeX/BibTeX convention worth keeping —{' '}
        <code>{'\\cite{key}'}</code> resolved against a <code>.bib</code> file — and wires it into a real
        editor: type <code>{'\\cite{'}</code> and get a live-filtered dropdown of your bibliography,
        sourced from whatever <code>.bib</code> text you feed it.
      </p>
      <p>
        It does <strong>not</strong> compile real LaTeX or produce PDFs — it's a Markdown editing
        experience (built on CodeMirror 6) borrowing LaTeX authoring conventions that a physics/CS/math
        author already knows. Bring your own Markdown renderer (<code>marked</code>, <code>remark</code>,
        ...); this package only resolves <code>{'\\cite{...}'}</code> into numbered, linked HTML markers
        and hands you back a ready-to-inject bibliography block.
      </p>

      <h2>Installation</h2>
      <CodeBlock>{'npm install latex-cite-editor'}</CodeBlock>
      <p>Requires React 18+.</p>

      <h2>Quickstart</h2>
      <CodeBlock>{`
import { useMemo, useState } from 'react';
import { parseBibtex, resolveCitations } from 'latex-cite-editor';
import { CiteEditor } from 'latex-cite-editor/react';

function Editor() {
  const [content, setContent] = useState('');
  const [bibText, setBibText] = useState('');
  const bibEntries = useMemo(() => parseBibtex(bibText), [bibText]);

  return <CiteEditor value={content} onChange={setContent} bibEntries={bibEntries} />;
}

// When rendering the article:
const { text, bibliographyHtml } = resolveCitations(markdownSource, bibEntries);
const html = renderMarkdown(text) + bibliographyHtml; // plug into your own Markdown renderer
      `}</CodeBlock>

      <h2>Recommended host CSS</h2>
      <p>
        The rendered bibliography/citation markers use plain classes so you can style them with your own
        design system:
      </p>
      <CodeBlock>{`
.citation-ref a { text-decoration: none; }
.citation-ref.citation-missing { color: #ef4444; }
.bibliography ol { list-style: decimal; padding-left: 1.5rem; }
.bibliography li { margin-bottom: 0.5rem; }
.bibliography .citation-link { text-decoration: underline; }
.citation-backref { text-decoration: none; opacity: 0.6; }
      `}</CodeBlock>
    </div>
  );
}

function ApiReference() {
  return (
    <div className="prose">
      <h2>API</h2>
      <ul>
        <li>
          <code>parseBibtex(source: string): BibEntry[]</code> — parses <code>.bib</code> text (handles
          nested braces in field values, e.g. <code>{'title = {The {Higgs} Boson}'}</code>).
        </li>
        <li>
          <code>resolveCitations(text: string, entries: BibEntry[]): ResolvedCitations</code> — replaces
          every <code>{'\\cite{key[,key2]}'}</code> with numbered, linked markers (ordered by first
          appearance, like LaTeX + natbib's numeric style) and returns an HTML bibliography block. If an
          entry has a <code>url</code>, <code>link</code>, or <code>doi</code> field, its bibliography line
          is wrapped in a link to that address (checked in that order).
        </li>
        <li>
          <code>extractCiteKeys(text: string): string[]</code> / <code>formatEntry(entry: BibEntry): string</code>{' '}
          / <code>resolveEntryUrl(entry: BibEntry): string | undefined</code> — lower-level building
          blocks. <code>formatEntry</code> already runs author/title/journal through{' '}
          <code>cleanLatexText</code>.
        </li>
        <li>
          <code>formatBibliographyAbnt(entries: BibEntry[]): AbntReference[]</code> — formats every entry
          per <strong>ABNT NBR 6023</strong> and sorts the result alphabetically by author surname (or
          title, if authorless). Each <code>AbntReference</code> is{' '}
          <code>{'{ key, html, sortKey }'}</code>, where <code>html</code> is escaped and ready to inject
          (title wrapped in <code>&lt;strong&gt;</code>).
        </li>
        <li>
          <code>formatEntryAbnt(entry: BibEntry): AbntReference</code> — the single-entry version behind{' '}
          <code>formatBibliographyAbnt</code>, if you want to format/sort a list yourself.
        </li>
        <li>
          <code>formatAuthorsAbnt(rawAuthorField: string): string</code> — just the author-list logic:{' '}
          <code>and</code>-separated BibTeX names into <code>"SOBRENOME, Nome"</code>, joined with{' '}
          <code>"; "</code>, collapsing to <code>"PRIMEIRO SOBRENOME, Nome et al."</code> past three
          authors.
        </li>
        <li>
          <code>formatBibliographyIeee</code> / <code>formatBibliographyMla</code> /{' '}
          <code>formatBibliographyApa</code> (and matching <code>formatEntry*</code>/<code>formatAuthors*</code>{' '}
          pairs) — the same shape as the ABNT functions above, formatting every entry per IEEE, MLA (9th
          ed.), or APA (7th ed.) instead. IEEE preserves input order (it numbers by citation order, not
          alphabetically); MLA and APA alphabetize by author surname like ABNT does.
        </li>
        <li>
          <code>formatBibliography(entries: BibEntry[], style: CitationStyle): FormattedReference[]</code> —
          a single dispatcher over all four styles, where{' '}
          <code>CitationStyle = 'abnt' | 'ieee' | 'mla' | 'apa'</code>. Every style's per-entry result
          shares the same <code>FormattedReference</code> shape (<code>{'{ key, html, sortKey }'}</code>),
          which <code>AbntReference</code>/<code>IeeeReference</code>/<code>MlaReference</code>/
          <code>ApaReference</code> are aliases of.
        </li>
        <li>
          <code>exportEndNote</code> / <code>exportRefMan</code> / <code>exportRefWorks(entries: BibEntry[]): string</code>{' '}
          — export the whole bibliography as a single plain-text file in EndNote's tagged (<code>.enw</code>)
          format, RIS (<code>.ris</code>, used by Reference Manager/"RefMan" and most other reference
          managers), or RefWorks' tagged format — for a "import into your reference manager" action, as
          opposed to the display-ready styles above.
        </li>
        <li>
          <code>exportBibliography(entries: BibEntry[], format: ExportFormat): string</code> — dispatcher
          over the three export formats, where <code>ExportFormat = 'endnote' | 'refman' | 'refworks'</code>.
        </li>
        <li>
          <code>cleanLatexText(value: string): string</code> — converts LaTeX accent macros ({'{\\\'e}'},{' '}
          {'{\\^o}'}, {'{\\c c}'}, {'{\\v c}'}, {'{\\ss}'}, ...) and symbol macros ({'\\url{...}'},{' '}
          {'\\textordmasculine'}) into real Unicode, and strips leftover <code>{'{}'}</code> grouping
          braces.
        </li>
        <li>
          <code>escapeHtml(value: string): string</code> — escapes <code>&amp;</code>/<code>&lt;</code>/
          <code>&gt;</code>/<code>"</code>, used internally by <code>resolveCitations</code> and the ABNT
          formatter.
        </li>
        <li>
          <code>{'<CiteEditor />'}</code> (from <code>latex-cite-editor/react</code>) — the editor
          component. Props: <code>value</code>, <code>onChange</code>, <code>bibEntries</code>,{' '}
          <code>fontSize</code>, <code>placeholder</code>, <code>minHeight</code>, <code>className</code>.
        </li>
        <li>
          <code>CiteEditorHandle</code> (via <code>ref</code>) — imperative API for toolbars:{' '}
          <code>focus()</code>, <code>getSelection()</code>, <code>wrapSelection(before, after, placeholder?)</code>,{' '}
          <code>insertAtLineStart(prefix)</code>, <code>insertText(text)</code>,{' '}
          <code>duplicateCurrentLine()</code>, <code>openSearch()</code>, and the raw CodeMirror{' '}
          <code>view</code>.
        </li>
        <li>
          <code>citationCompletionSource</code>, <code>latexCommandCompletionSource</code>,{' '}
          <code>latexHighlightPlugin</code>, <code>latexHighlightTheme</code> — exported separately for
          composing your own CodeMirror extension list instead of using <code>{'<CiteEditor />'}</code>.
        </li>
      </ul>
      <p>
        <code>{'<CiteEditor />'}</code> lives on a separate <code>/react</code> subpath (with its own{' '}
        <code>'use client'</code> directive) so that the root entry — <code>parseBibtex</code>,{' '}
        <code>resolveCitations</code>, and friends — stays free of React/CodeMirror and safe to import
        from a React Server Component.
      </p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">
            latex-cite-editor <span className="brand-dim">docs</span>
          </span>
          <nav className="topnav">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={t.id === tab ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="topbar-links">
            <a href={NPM_URL} target="_blank" rel="noreferrer">
              npm
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="content">
        {tab === 'overview' && <Overview />}
        {tab === 'basic-usage' && (
          <section>
            <h2>Basic usage</h2>
            <p className="section-note">
              A <code>.bib</code> textarea feeding a <code>{'<CiteEditor />'}</code> (which gets live{' '}
              <code>{'\\cite{}'}</code> autocomplete from it) plus a preview pane rendering the numbered
              citations and generated bibliography. Source:{' '}
              <a href={`${REPO_URL}/blob/main/examples/basic-usage.tsx`} target="_blank" rel="noreferrer">
                examples/basic-usage.tsx
              </a>
              .
            </p>
            <BasicUsageExample />
          </section>
        )}
        {tab === 'toolbar' && (
          <section>
            <h2>Article editor with toolbar</h2>
            <p className="section-note">
              The fuller integration pattern: a title/bibliography/content form with a formatting toolbar
              built entirely on <code>CiteEditorHandle</code> (no raw textarea/DOM access). Source:{' '}
              <a
                href={`${REPO_URL}/blob/main/examples/article-editor-with-toolbar.tsx`}
                target="_blank"
                rel="noreferrer"
              >
                examples/article-editor-with-toolbar.tsx
              </a>
              .
            </p>
            <ArticleEditorWithToolbar />
          </section>
        )}
        {tab === 'abnt' && (
          <section>
            <h2>ABNT NBR 6023 bibliography</h2>
            <p className="section-note">
              Formats and sorts an entire <code>.bib</code> file per the Brazilian ABNT NBR 6023 standard,
              independently of any <code>{'\\cite{}'}</code> markers — works from plain functions, no{' '}
              <code>'use client'</code> needed. Source:{' '}
              <a href={`${REPO_URL}/blob/main/examples/abnt-bibliography.tsx`} target="_blank" rel="noreferrer">
                examples/abnt-bibliography.tsx
              </a>
              .
            </p>
            <AbntBibliographyExample />
          </section>
        )}
        {tab === 'styles' && (
          <section>
            <h2>Citation styles &amp; reference-manager export</h2>
            <p className="section-note">
              <code>formatBibliography(entries, style)</code> renders IEEE, MLA, APA, or ABNT reference
              lists; <code>exportBibliography(entries, format)</code> instead produces a plain-text file
              for EndNote, Reference Manager (RIS), or RefWorks — the same split Google Scholar's "Cite"
              dropdown uses (display styles vs. import formats). Source:{' '}
              <a href={`${REPO_URL}/blob/main/examples/citation-styles.tsx`} target="_blank" rel="noreferrer">
                examples/citation-styles.tsx
              </a>
              .
            </p>
            <CitationStylesExample />
          </section>
        )}
        {tab === 'api' && <ApiReference />}
      </main>

      <footer className="footer">
        MIT © Reinan Br —{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          github.com/reinanbr/latex-cite-editor
        </a>
      </footer>
    </div>
  );
}
