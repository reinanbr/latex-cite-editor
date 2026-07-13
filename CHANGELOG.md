# Changelog

## 0.1.0

- Initial release: `parseBibtex`, `resolveCitations` (+ `extractCiteKeys`/`formatEntry`/`resolveEntryUrl`), and the `<CiteEditor />` CodeMirror 6 component with `\cite{}`/LaTeX-command/math-symbol autocomplete and syntax highlighting.
- Bibliography entries with a `url`, `link`, or `doi` field render as a clickable link over the whole reference line.
- `cleanLatexText` converts LaTeX accent macros (as exported by Google Scholar/reference managers, e.g. `{\^o}`, `{\c c}`, `{\ss}`) into real Unicode characters; `formatEntry` applies it to author/title/journal automatically.
- Extracted from the article editor of [reinanbr_nextjs](https://github.com/reinanbr/reinanbr_nextjs).
