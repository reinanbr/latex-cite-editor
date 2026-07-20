import type { BibEntry } from './bibtex';
import { extractExportFields, type ReferenceKind } from './referenceExport';

const ENDNOTE_TYPE: Record<ReferenceKind, string> = {
  journal: 'Journal Article',
  book: 'Book',
  chapter: 'Book Section',
  conference: 'Conference Proceedings',
  thesis: 'Thesis',
  report: 'Report',
  generic: 'Generic',
};

function formatEntryEndNote(entry: BibEntry): string {
  const f = extractExportFields(entry);
  const lines: string[] = [`%0 ${ENDNOTE_TYPE[f.kind]}`];

  for (const author of f.authors) lines.push(`%A ${author}`);
  if (f.title) lines.push(`%T ${f.title}`);
  if (f.kind === 'journal') {
    if (f.container) lines.push(`%J ${f.container}`);
  } else if (f.kind === 'chapter' || f.kind === 'conference') {
    if (f.container) lines.push(`%B ${f.container}`);
  }
  if (f.volume) lines.push(`%V ${f.volume}`);
  if (f.issue) lines.push(`%N ${f.issue}`);
  const pages = [f.startPage, f.endPage].filter(Boolean).join('-');
  if (pages) lines.push(`%P ${pages}`);
  if (f.publisher) lines.push(`%I ${f.publisher}`);
  if (f.address) lines.push(`%C ${f.address}`);
  if (f.year) lines.push(`%D ${f.year}`);
  if (f.doi) lines.push(`%R ${f.doi}`);
  if (f.url) lines.push(`%U ${f.url}`);
  if (f.abstract) lines.push(`%X ${f.abstract}`);
  for (const keyword of f.keywords) lines.push(`%K ${keyword}`);

  return lines.join('\n');
}

/**
 * Exports parsed BibTeX entries as EndNote's tagged import format (`.enw`) —
 * the same `%0`/`%A`/`%T`/... field format EndNote, Zotero, and Mendeley all
 * accept as an "EndNote Import" file.
 */
export function exportEndNote(entries: BibEntry[]): string {
  return entries.map(formatEntryEndNote).join('\n\n') + '\n';
}
