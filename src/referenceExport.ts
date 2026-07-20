import type { BibEntry } from './bibtex';
import { cleanLatexText } from './latexText';
import { resolveEntryUrl } from './citations';
import { splitAuthorField, splitNameParts } from './nameParsing';

/**
 * Coarse bucket a BibTeX entry type falls into for reference-manager export
 * formats (EndNote, RIS/RefMan, RefWorks), which all key their type tag off
 * a small fixed vocabulary rather than raw BibTeX types.
 */
export type ReferenceKind = 'journal' | 'book' | 'chapter' | 'conference' | 'thesis' | 'report' | 'generic';

export function classifyReferenceKind(bibType: string): ReferenceKind {
  switch (bibType.toLowerCase()) {
    case 'article':
      return 'journal';
    case 'book':
    case 'booklet':
      return 'book';
    case 'incollection':
    case 'inbook':
      return 'chapter';
    case 'inproceedings':
    case 'conference':
      return 'conference';
    case 'mastersthesis':
    case 'phdthesis':
    case 'monografia':
    case 'monography':
      return 'thesis';
    case 'techreport':
      return 'report';
    default:
      return 'generic';
  }
}

export interface ExportFields {
  kind: ReferenceKind;
  /** Each author as "Last, First Middle" (or the raw institutional name, unchanged). */
  authors: string[];
  title: string;
  /** Journal name for articles, book/proceedings title for chapters and conference papers. */
  container: string;
  volume: string;
  issue: string;
  startPage: string;
  endPage: string;
  publisher: string;
  address: string;
  year: string;
  url: string;
  doi: string;
  abstract: string;
  keywords: string[];
}

/** Extracts the fields every export format needs, in one place, from a parsed BibTeX entry. */
export function extractExportFields(entry: BibEntry): ExportFields {
  const f = entry.fields;
  const get = (name: string): string => (f[name] ? cleanLatexText(f[name]) : '');
  const kind = classifyReferenceKind(entry.type);

  const { names } = splitAuthorField(f.author || f.editor || '');
  const authors = names.map((raw) => {
    const cleaned = cleanLatexText(raw);
    const { last, given } = splitNameParts(cleaned);
    if (!last) return cleaned;
    return given ? `${last}, ${given}` : last;
  });

  const pages = get('pages').replace(/-{2,}/g, '-');
  const [startPage = '', endPage = ''] = pages.split('-').map((s) => s.trim());
  const container = kind === 'journal' ? get('journal') : get('booktitle');
  const keywords = (get('keywords') || get('keyword'))
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    kind,
    authors,
    title: get('title'),
    container,
    volume: get('volume'),
    issue: get('number'),
    startPage,
    endPage,
    publisher: get('publisher'),
    address: get('address'),
    year: get('year'),
    url: resolveEntryUrl(entry) || '',
    doi: get('doi'),
    abstract: get('abstract'),
    keywords,
  };
}
