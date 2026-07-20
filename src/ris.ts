import type { BibEntry } from './bibtex';
import { extractExportFields, type ReferenceKind } from './referenceExport';

const RIS_TYPE: Record<ReferenceKind, string> = {
  journal: 'JOUR',
  book: 'BOOK',
  chapter: 'CHAP',
  conference: 'CONF',
  thesis: 'THES',
  report: 'RPRT',
  generic: 'GEN',
};

function tag(code: string, value: string): string {
  return `${code.padEnd(2, ' ')}  - ${value}`;
}

function formatEntryRis(entry: BibEntry): string {
  const f = extractExportFields(entry);
  const lines: string[] = [tag('TY', RIS_TYPE[f.kind])];

  for (const author of f.authors) lines.push(tag('AU', author));
  if (f.title) lines.push(tag('TI', f.title));
  if (f.container) lines.push(tag(f.kind === 'journal' ? 'JF' : 'T2', f.container));
  if (f.volume) lines.push(tag('VL', f.volume));
  if (f.issue) lines.push(tag('IS', f.issue));
  if (f.startPage) lines.push(tag('SP', f.startPage));
  if (f.endPage) lines.push(tag('EP', f.endPage));
  if (f.publisher) lines.push(tag('PB', f.publisher));
  if (f.address) lines.push(tag('CY', f.address));
  if (f.year) lines.push(tag('PY', f.year));
  if (f.doi) lines.push(tag('DO', f.doi));
  if (f.url) lines.push(tag('UR', f.url));
  if (f.abstract) lines.push(tag('AB', f.abstract));
  for (const keyword of f.keywords) lines.push(tag('KW', keyword));
  lines.push(tag('ER', ''));

  return lines.join('\n');
}

/**
 * Exports parsed BibTeX entries as RIS (`.ris`) — the tagged format used by
 * Reference Manager ("RefMan"), Zotero, Mendeley, and most other reference
 * managers as their generic import format.
 */
export function exportRefMan(entries: BibEntry[]): string {
  return entries.map(formatEntryRis).join('\n\n') + '\n';
}
