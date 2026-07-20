# Changelog

## 0.4.0

- `resolveCitations(text, entries, options?)` now accepts `{ style: 'ieee' | 'mla' | 'apa' | 'abnt' }` to format each `\cite{}`-driven bibliography line per that citation style, while keeping the `[1][2][3]` numbering in citation order (as opposed to `formatBibliography`, which alphabetizes for a standalone reference list). `BibliographyItem` gains an optional `html` field carrying the styled line.
- Fixes default (no-`style`) bibliography output being hardcoded to Portuguese ("Referências", "Referência não encontrada no .bib") — an OSS library aimed at an international audience should default to English; ABNT's own Portuguese terminology (`Disponível em`, `SOBRENOME`, ...) is unaffected, since that's inherent to the standard itself.
- Translates `examples/basic-usage.tsx` and `examples/article-editor-with-toolbar.tsx` (previously partly in Portuguese) to English, and adds a citation-style picker to the basic-usage example demonstrating the new `resolveCitations` option live.

## 0.3.0

- Adds IEEE, MLA (9th ed.), and APA (7th ed.) bibliography formatting, alongside the existing ABNT support: `formatBibliographyIeee`/`formatBibliographyMla`/`formatBibliographyApa` (plus matching `formatEntry*`/`formatAuthors*` pairs) return the same `{ key, html, sortKey }` shape as `formatBibliographyAbnt`. IEEE preserves input order (it numbers by citation order, not alphabetically); MLA/APA alphabetize by author surname.
- Adds `formatBibliography(entries, style)`, a dispatcher over all four styles (`CitationStyle = 'abnt' | 'ieee' | 'mla' | 'apa'`). `AbntReference`/`IeeeReference`/`MlaReference`/`ApaReference` are now aliases of a shared exported `FormattedReference` type.
- Adds reference-manager export: `exportEndNote`/`exportRefMan`/`exportRefWorks(entries)` produce a single plain-text file in EndNote's tagged (`.enw`) format, RIS (`.ris`, "RefMan"), or RefWorks' tagged format, respectively — for importing into a reference manager rather than displaying on a page. `exportBibliography(entries, format)` dispatches over the three (`ExportFormat = 'endnote' | 'refman' | 'refworks'`).

## 0.2.0

- Adds ABNT NBR 6023 (Brazilian citation standard) formatting: `formatEntryAbnt(entry)` formats a single BibTeX entry — author(s) as "SOBRENOME, Nome" (`et al.` past 3 authors), title in bold, and a per-type layout for `book`, `article`, `incollection`/`inbook`, `inproceedings`/`conference`, `mastersthesis`/`phdthesis`/`monografia`/`monography`, and `techreport`, falling back to a generic layout otherwise. `formatBibliographyAbnt(entries)` formats and alphabetically sorts a whole bibliography (by first-author surname, or title if authorless), as the standard requires. `formatAuthorsAbnt(rawField)` is exposed separately for the author-list logic alone.
- Exports `escapeHtml`, previously internal to `resolveCitations`'s bibliography rendering, now reusable by the new ABNT formatter and any other consumer.
- Fixes `cleanLatexText` mishandling three real-world BibTeX macros it previously left broken in the output: `\'\i` / `\'\j` (accents over dotless i/j, e.g. `cient{\'\i}fica` → "científica", common in Google Scholar exports), `\url{...}` (previously left as literal `\urlhttps://...` text instead of the URL), and `\textordmasculine`/`\textordfeminine` (ordinal indicators, → "º"/"ª").

## 0.1.2

- **Breaking:** package renamed from `latex-cite-editor-react` to `latex-cite-editor`.
- **Breaking:** `<CiteEditor />` and `CiteEditorHandle` moved to a new `latex-cite-editor/react` subpath entry, which now carries a `'use client'` directive. The root entry (`parseBibtex`, `resolveCitations`, etc.) no longer bundles React/CodeMirror at all.
- Fixes a Next.js App Router build error ("You're importing a component that needs `useState`... only works in a Client Component") that happened whenever a Server Component imported any root export (e.g. `parseBibtex`) — the single previous bundle pulled in `CiteEditor`'s React code with no `'use client'` boundary, so the whole module was treated as server code.

## 0.1.0

- Initial release: `parseBibtex`, `resolveCitations` (+ `extractCiteKeys`/`formatEntry`/`resolveEntryUrl`), and the `<CiteEditor />` CodeMirror 6 component with `\cite{}`/LaTeX-command/math-symbol autocomplete and syntax highlighting.
- Bibliography entries with a `url`, `link`, or `doi` field render as a clickable link over the whole reference line.
- `cleanLatexText` converts LaTeX accent macros (as exported by Google Scholar/reference managers, e.g. `{\^o}`, `{\c c}`, `{\ss}`) into real Unicode characters; `formatEntry` applies it to author/title/journal automatically.
- Extracted from the article editor of [reinanbr_nextjs](https://github.com/reinanbr/reinanbr_nextjs).
