<div align='center'>

<h1>latex-cite-editor</h1>

[![npm version](https://img.shields.io/npm/v/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![npm downloads](https://img.shields.io/npm/dm/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![node](https://img.shields.io/node/v/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![types](https://img.shields.io/npm/types/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![license](https://img.shields.io/npm/l/latex-cite-editor.svg)](LICENSE)

**[Live docs & examples →](https://reinanbr.github.io/latex-cite-editor/)**

<p>A CodeMirror 6 based React editor for Markdown articles with LaTeX-flavored extras: <code>\cite&#123;key&#125;</code> citations resolved against a BibTeX (<code>.bib</code>) file, autocomplete for citation keys, LaTeX-like commands (<code>\textbf</code>, <code>\section</code>, <code>\footnote</code>, ...), math symbols inside <code>$...$</code>/<code>$$...$$</code>, and ABNT NBR 6023 (Brazilian standard) bibliography formatting.</p>

</div>

<hr>

## Table of contents

- [Why](#why)
- [Installation](#installation)
- [Quickstart](#quickstart)
- [ABNT bibliography formatting](#abnt-bibliography-formatting)
- [More citation styles & reference-manager export](#more-citation-styles--reference-manager-export)
- [API](#api)
- [Recommended host CSS](#recommended-host-css)
- [Docs site & live examples](#docs-site--live-examples)
- [License](#license)

<hr>

## Why

Writing a technical/academic article in Markdown usually means citations degrade to a manually
numbered plain-text list, with no autocomplete and no link between an in-text reference and its
entry. `latex-cite-editor` borrows the one LaTeX/BibTeX convention worth keeping — `\cite{key}`
resolved against a `.bib` file — and wires it into a real editor: type `\cite{` and get a
live-filtered dropdown of your bibliography, sourced from whatever `.bib` text you feed it.

It does **not** compile real LaTeX or produce PDFs — it's a Markdown editing experience (built on
CodeMirror 6) borrowing LaTeX authoring conventions that a physics/CS/math author already knows.
Bring your own Markdown renderer (`marked`, `remark`, ...); this package only resolves
`\cite{...}` into numbered, linked HTML markers and hands you back a ready-to-inject bibliography
block.

## Installation

```bash
npm install latex-cite-editor
```

Requires React 18+.

## Quickstart

```tsx
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
```

See [`examples/basic-usage.tsx`](examples/basic-usage.tsx) for a minimal editor + live preview,
[`examples/article-editor-with-toolbar.tsx`](examples/article-editor-with-toolbar.tsx) for the
fuller pattern — a title/bibliography/content form with a formatting toolbar built entirely on
`CiteEditorHandle` (no raw textarea/DOM access) — and
[`examples/abnt-bibliography.tsx`](examples/abnt-bibliography.tsx) for rendering a whole `.bib`
file as an ABNT-formatted reference list (see below).

## ABNT bibliography formatting

Besides the `\cite{}`-driven numeric bibliography from `resolveCitations`, the package can format
and sort an entire `.bib` file per **ABNT NBR 6023** — the reference-list standard used across
Brazilian academic work — independently of any `\cite{}` markers in your text:

```tsx
import { parseBibtex, formatBibliographyAbnt } from 'latex-cite-editor';

const entries = parseBibtex(bibText);
const references = formatBibliographyAbnt(entries); // sorted alphabetically by author surname

function Bibliography() {
  return (
    <ol>
      {references.map((ref) => (
        <li key={ref.key} dangerouslySetInnerHTML={{ __html: ref.html }} />
      ))}
    </ol>
  );
}
```

Each reference comes out as `SOBRENOME, Nome. **Título em negrito**. Local: Editora, Ano.` (or the
`et al.` form past three authors), with a layout matched to the entry's BibTeX type — `book`,
`article`, `incollection`/`inbook`, `inproceedings`/`conference`, `mastersthesis`/`phdthesis`/
`monografia`/`monography`, and `techreport` each get their own clause order; anything else falls
back to a generic title/place/year layout. Entries with a `url`/`link`/`doi` field (or a
`howpublished` field, common on `@misc`) get a "Disponível em: ..." line, plus "Acesso em: ..."
when an `urlaccessdate` field is present.

Since `parseBibtex`/`formatBibliographyAbnt` are plain functions with no React/CodeMirror
dependency, this works the same in a React Server Component — see
[`examples/abnt-bibliography.tsx`](examples/abnt-bibliography.tsx), which resolves the
bibliography at render time on the server, no `'use client'` needed.

## More citation styles & reference-manager export

Besides ABNT, the same `.bib` file can be formatted per **IEEE**, **MLA** (9th ed.), or **APA**
(7th ed.) — or exported wholesale as a plain-text file for importing into **EndNote**, **Reference
Manager** ("RefMan", RIS format), or **RefWorks**. This mirrors the split Google Scholar's own
"Cite" dropdown uses: display styles vs. import formats.

```tsx
import { parseBibtex, formatBibliography, exportBibliography } from 'latex-cite-editor';

const entries = parseBibtex(bibText);

// Display styles — each returns FormattedReference[] ({ key, html, sortKey }):
const ieee = formatBibliography(entries, 'ieee'); // preserves input order (numbered by citation order)
const mla = formatBibliography(entries, 'mla'); // alphabetized by author surname
const apa = formatBibliography(entries, 'apa'); // alphabetized by author surname

// Reference-manager export — each returns a single ready-to-download file string:
const endnoteFile = exportBibliography(entries, 'endnote'); // .enw tagged format
const risFile = exportBibliography(entries, 'refman'); // .ris format
const refworksFile = exportBibliography(entries, 'refworks'); // RefWorks tagged format
```

Per-style functions (`formatBibliographyIeee`, `formatEntryMla`, `formatAuthorsApa`, ...) and
per-format functions (`exportEndNote`, `exportRefMan`, `exportRefWorks`) are also exported directly
if you don't need the `style`/`format` dispatcher. See
[`examples/citation-styles.tsx`](examples/citation-styles.tsx) for a live style-switcher + export
picker, or the [docs site](#docs-site--live-examples).

## API

- `parseBibtex(source: string): BibEntry[]` — parses `.bib` text (handles nested braces in field values, e.g. `title = {The {Higgs} Boson}`).
- `resolveCitations(text: string, entries: BibEntry[]): ResolvedCitations` — replaces every `\cite{key[,key2]}` with numbered, linked markers (ordered by first appearance, like LaTeX + natbib's numeric style) and returns an HTML bibliography block. If an entry has a `url`, `link`, or `doi` field, its bibliography line is wrapped in a link to that address (checked in that order).
- `extractCiteKeys(text: string): string[]` / `formatEntry(entry: BibEntry): string` / `resolveEntryUrl(entry: BibEntry): string | undefined` — lower-level building blocks. `formatEntry` already runs author/title/journal through `cleanLatexText`.
- `formatBibliographyAbnt(entries: BibEntry[]): AbntReference[]` — formats every entry per **ABNT NBR 6023** (see [above](#abnt-bibliography-formatting)) and sorts the result alphabetically by author surname (or title, if authorless). Each `AbntReference` is `{ key, html, sortKey }`, where `html` is escaped and ready to inject (title wrapped in `<strong>`).
- `formatEntryAbnt(entry: BibEntry): AbntReference` — the single-entry version behind `formatBibliographyAbnt`, if you want to format/sort a list yourself.
- `formatAuthorsAbnt(rawAuthorField: string): string` — just the author-list logic: `and`-separated BibTeX names into `"SOBRENOME, Nome"`, joined with `; `, collapsing to `"PRIMEIRO SOBRENOME, Nome et al."` past three authors (or when the field contains a bare `others`).
- `formatBibliographyIeee` / `formatBibliographyMla` / `formatBibliographyApa(entries: BibEntry[]): FormattedReference[]` (plus matching `formatEntryIeee`/`formatEntryMla`/`formatEntryApa` and `formatAuthorsIeee`/`formatAuthorsMla`/`formatAuthorsApa`) — same shape as the ABNT functions, formatting per IEEE, MLA (9th ed.), or APA (7th ed.) instead (see [above](#more-citation-styles--reference-manager-export)). IEEE preserves input order (it numbers by citation order, not alphabetically); MLA and APA alphabetize by author surname like ABNT.
- `formatBibliography(entries: BibEntry[], style: CitationStyle): FormattedReference[]` — dispatcher over all four styles, where `CitationStyle = 'abnt' | 'ieee' | 'mla' | 'apa'`. `AbntReference`/`IeeeReference`/`MlaReference`/`ApaReference` are all aliases of the shared `FormattedReference` shape (`{ key, html, sortKey }`).
- `exportEndNote` / `exportRefMan` / `exportRefWorks(entries: BibEntry[]): string` — export the whole bibliography as a single plain-text file: EndNote's tagged (`.enw`) format, RIS (`.ris`, "RefMan"), or RefWorks' tagged format, for importing into a reference manager rather than displaying on a page.
- `exportBibliography(entries: BibEntry[], format: ExportFormat): string` — dispatcher over the three export formats, where `ExportFormat = 'endnote' | 'refman' | 'refworks'`.
- `cleanLatexText(value: string): string` — converts LaTeX accent macros (`{\'e}`, `{\^o}`, `{\c c}`, `{\v c}`, `{\ss}`, `{\'\i}`, ...) and symbol macros (`\url{...}`, `\textordmasculine`) as exported by Google Scholar/reference managers into real Unicode (`é`, `ô`, `ç`, `č`, `ß`, `í`, ...), and strips leftover `{}` grouping braces.
- `escapeHtml(value: string): string` — escapes `&`/`<`/`>`/`"`, used internally by `resolveCitations` and the ABNT formatter; exported for building your own HTML output from `BibEntry` fields.
- `<CiteEditor />` (from `latex-cite-editor/react`, a `'use client'` module) — the editor component. Props: `value`, `onChange`, `bibEntries`, `fontSize`, `placeholder`, `minHeight`, `className`.
- `CiteEditorHandle` (from `latex-cite-editor/react`, via `ref`) — imperative API for toolbars: `focus()`, `getSelection()`, `wrapSelection(before, after, placeholder?)`, `insertAtLineStart(prefix)`, `insertText(text)`, `duplicateCurrentLine()`, `openSearch()`, and the raw CodeMirror `view`.

> `<CiteEditor />` lives on a separate `/react` subpath (with its own `'use client'` directive) so that the root entry — `parseBibtex`, `resolveCitations`, and friends — stays free of React/CodeMirror and safe to import from a React Server Component (e.g. to resolve citations at render time on the server).
- `citationCompletionSource`, `latexCommandCompletionSource`, `latexHighlightPlugin`, `latexHighlightTheme` — exported separately in case you're composing your own CodeMirror extension list instead of using `<CiteEditor />`.

## Recommended host CSS

The rendered bibliography/citation markers use plain classes so you can style them with your own
design system:

```css
.citation-ref a { text-decoration: none; }
.citation-ref.citation-missing { color: #ef4444; }
.bibliography ol { list-style: decimal; padding-left: 1.5rem; }
.bibliography li { margin-bottom: 0.5rem; }
.bibliography .citation-link { text-decoration: underline; }
.citation-backref { text-decoration: none; opacity: 0.6; }
```

## Docs site & live examples

**https://reinanbr.github.io/latex-cite-editor/**

A static site (source in [`docs-src/`](docs-src)) renders the three files in [`examples/`](examples)
as real, interactive `<CiteEditor />` instances — not screenshots — plus the API reference above. It's
built with Vite, aliasing the `latex-cite-editor`/`latex-cite-editor/react` imports in the example
files straight to [`src/`](src), so the demo always reflects the current code.

```bash
npm run docs:dev    # serve the docs site locally with hot reload
npm run docs:build  # build to ./docs (the GitHub Pages source for this repo)
```

After changing `src/` or `examples/`, run `npm run docs:build` and commit the updated `docs/` folder
so the published site stays in sync. (One-time repo setup: Settings → Pages → Deploy from a branch →
`main` / `docs`.)

## License

MIT © [Reinan Br](LICENSE)
