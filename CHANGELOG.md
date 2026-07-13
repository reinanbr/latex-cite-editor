# Changelog

## 0.1.2

- **Breaking:** package renamed from `latex-cite-editor-react` to `latex-cite-editor`.
- **Breaking:** `<CiteEditor />` and `CiteEditorHandle` moved to a new `latex-cite-editor/react` subpath entry, which now carries a `'use client'` directive. The root entry (`parseBibtex`, `resolveCitations`, etc.) no longer bundles React/CodeMirror at all.
- Fixes a Next.js App Router build error ("You're importing a component that needs `useState`... only works in a Client Component") that happened whenever a Server Component imported any root export (e.g. `parseBibtex`) — the single previous bundle pulled in `CiteEditor`'s React code with no `'use client'` boundary, so the whole module was treated as server code.

## 0.1.0

- Initial release: `parseBibtex`, `resolveCitations` (+ `extractCiteKeys`/`formatEntry`/`resolveEntryUrl`), and the `<CiteEditor />` CodeMirror 6 component with `\cite{}`/LaTeX-command/math-symbol autocomplete and syntax highlighting.
- Bibliography entries with a `url`, `link`, or `doi` field render as a clickable link over the whole reference line.
- `cleanLatexText` converts LaTeX accent macros (as exported by Google Scholar/reference managers, e.g. `{\^o}`, `{\c c}`, `{\ss}`) into real Unicode characters; `formatEntry` applies it to author/title/journal automatically.
- Extracted from the article editor of [reinanbr_nextjs](https://github.com/reinanbr/reinanbr_nextjs).
