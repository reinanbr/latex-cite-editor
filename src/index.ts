export { parseBibtex } from './bibtex';
export type { BibEntry } from './bibtex';

export { extractCiteKeys, formatEntry, resolveEntryUrl, resolveCitations, CITE_COMMAND_RE } from './citations';
export type { BibliographyItem, ResolvedCitations } from './citations';

export { cleanLatexText } from './latexText';

export { citationCompletionSource, latexCommandCompletionSource } from './autocomplete';
export { latexHighlightPlugin, latexHighlightTheme } from './latexDecorations';

export { default as CiteEditor } from './CiteEditor';
export type { CiteEditorProps, CiteEditorHandle } from './CiteEditor';
