# Changelog

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
