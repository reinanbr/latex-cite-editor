<div align='center'>

<h1>latex-cite-editor</h1>

[![npm version](https://img.shields.io/npm/v/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![npm downloads](https://img.shields.io/npm/dm/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![node](https://img.shields.io/node/v/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![types](https://img.shields.io/npm/types/latex-cite-editor.svg)](https://www.npmjs.com/package/latex-cite-editor)
[![license](https://img.shields.io/npm/l/latex-cite-editor.svg)](LICENSE)

<p>A CodeMirror 6 based React editor for Markdown articles with LaTeX-flavored extras: <code>\cite&#123;key&#125;</code> citations resolved against a BibTeX (<code>.bib</code>) file, autocomplete for citation keys, LaTeX-like commands (<code>\textbf</code>, <code>\section</code>, <code>\footnote</code>, ...), and math symbols inside <code>$...$</code>/<code>$$...$$</code>.</p>

</div>

<hr>

## Table of contents

- [Why](#why)
- [Installation](#installation)
- [Quickstart](#quickstart)
- [API](#api)
- [Recommended host CSS](#recommended-host-css)
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
import { CiteEditor, parseBibtex, resolveCitations } from 'latex-cite-editor';

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

See [`examples/basic-usage.tsx`](examples/basic-usage.tsx) for a minimal editor + live preview, and
[`examples/article-editor-with-toolbar.tsx`](examples/article-editor-with-toolbar.tsx) for the
fuller pattern — a title/bibliography/content form with a formatting toolbar built entirely on
`CiteEditorHandle` (no raw textarea/DOM access).

## API

- `parseBibtex(source: string): BibEntry[]` — parses `.bib` text (handles nested braces in field values, e.g. `title = {The {Higgs} Boson}`).
- `resolveCitations(text: string, entries: BibEntry[]): ResolvedCitations` — replaces every `\cite{key[,key2]}` with numbered, linked markers (ordered by first appearance, like LaTeX + natbib's numeric style) and returns an HTML bibliography block. If an entry has a `url`, `link`, or `doi` field, its bibliography line is wrapped in a link to that address (checked in that order).
- `extractCiteKeys(text: string): string[]` / `formatEntry(entry: BibEntry): string` / `resolveEntryUrl(entry: BibEntry): string | undefined` — lower-level building blocks. `formatEntry` already runs author/title/journal through `cleanLatexText`.
- `cleanLatexText(value: string): string` — converts LaTeX accent macros (`{\'e}`, `{\^o}`, `{\c c}`, `{\v c}`, `{\ss}`, ...) as exported by Google Scholar/reference managers into real Unicode (`é`, `ô`, `ç`, `č`, `ß`, ...), and strips leftover `{}` grouping braces.
- `<CiteEditor />` — the editor component. Props: `value`, `onChange`, `bibEntries`, `fontSize`, `placeholder`, `minHeight`, `className`.
- `CiteEditorHandle` (via `ref`) — imperative API for toolbars: `focus()`, `getSelection()`, `wrapSelection(before, after, placeholder?)`, `insertAtLineStart(prefix)`, `insertText(text)`, `duplicateCurrentLine()`, `openSearch()`, and the raw CodeMirror `view`.
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

## License

MIT © [Reinan Br](LICENSE)
