export { parseBibtex } from './bibtex';
export type { BibEntry } from './bibtex';

export { extractCiteKeys, formatEntry, resolveEntryUrl, resolveCitations, CITE_COMMAND_RE } from './citations';
export type { BibliographyItem, ResolvedCitations } from './citations';

export { cleanLatexText } from './latexText';

export { citationCompletionSource, latexCommandCompletionSource } from './autocomplete';
export { latexHighlightPlugin, latexHighlightTheme } from './latexDecorations';

// The CiteEditor React component lives in a separate './react' entry (see
// react.ts) so that server-safe consumers of this module (parseBibtex,
// resolveCitations, etc.) never pull React/CodeMirror into a server bundle.
