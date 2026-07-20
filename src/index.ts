export { parseBibtex } from './bibtex';
export type { BibEntry } from './bibtex';

export { extractCiteKeys, formatEntry, resolveEntryUrl, resolveCitations, escapeHtml, CITE_COMMAND_RE } from './citations';
export type { BibliographyItem, ResolvedCitations } from './citations';

export { formatAuthorsAbnt, formatEntryAbnt, formatBibliographyAbnt } from './abnt';
export type { AbntReference } from './abnt';

export { formatAuthorsIeee, formatEntryIeee, formatBibliographyIeee } from './ieee';
export type { IeeeReference } from './ieee';

export { formatAuthorsMla, formatEntryMla, formatBibliographyMla } from './mla';
export type { MlaReference } from './mla';

export { formatAuthorsApa, formatEntryApa, formatBibliographyApa } from './apa';
export type { ApaReference } from './apa';

export type { FormattedReference } from './referenceTypes';

export { formatBibliography, exportBibliography } from './styles';
export type { CitationStyle, ExportFormat } from './styles';

export { exportEndNote } from './endnote';
export { exportRefMan } from './ris';
export { exportRefWorks } from './refworks';

export { cleanLatexText } from './latexText';

export { citationCompletionSource, latexCommandCompletionSource } from './autocomplete';
export { latexHighlightPlugin, latexHighlightTheme } from './latexDecorations';

// The CiteEditor React component lives in a separate './react' entry (see
// react.ts) so that server-safe consumers of this module (parseBibtex,
// resolveCitations, etc.) never pull React/CodeMirror into a server bundle.
