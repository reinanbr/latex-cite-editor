import type { BibEntry } from './bibtex';
import { extractExportFields, type ReferenceKind } from './referenceExport';

const REFWORKS_TYPE: Record<ReferenceKind, string> = {
  journal: 'Journal Article',
  book: 'Book, Whole',
  chapter: 'Book, Section',
  conference: 'Conference Proceedings',
  thesis: 'Thesis/Dissertation',
  report: 'Report',
  generic: 'Generic',
};

function formatEntryRefWorks(entry: BibEntry): string {
  const f = extractExportFields(entry);
  const lines: string[] = [`RT ${REFWORKS_TYPE[f.kind]}`];

  for (const author of f.authors) lines.push(`A1 ${author}`);
  if (f.title) lines.push(`T1 ${f.title}`);
  if (f.container) lines.push(`${f.kind === 'journal' ? 'JF' : 'BT'} ${f.container}`);
  if (f.year) lines.push(`YR ${f.year}`);
  if (f.volume) lines.push(`VO ${f.volume}`);
  if (f.issue) lines.push(`IS ${f.issue}`);
  if (f.startPage) lines.push(`SP ${f.startPage}`);
  if (f.endPage) lines.push(`OP ${f.endPage}`);
  if (f.publisher) lines.push(`PB ${f.publisher}`);
  if (f.address) lines.push(`PP ${f.address}`);
  if (f.doi) lines.push(`DO ${f.doi}`);
  if (f.url) lines.push(`UL ${f.url}`);
  if (f.abstract) lines.push(`AB ${f.abstract}`);
  for (const keyword of f.keywords) lines.push(`K1 ${keyword}`);

  return lines.join('\n');
}

/**
 * Exports parsed BibTeX entries as the RefWorks tagged format (two-letter
 * tags: `RT`/`A1`/`T1`/...) — the plain-text file RefWorks' "Tagged Format"
 * importer accepts.
 */
export function exportRefWorks(entries: BibEntry[]): string {
  return entries.map(formatEntryRefWorks).join('\n\n') + '\n';
}
