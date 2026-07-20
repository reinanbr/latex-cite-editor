import type { BibEntry } from './bibtex';
import { cleanLatexText } from './latexText';
import { escapeHtml, resolveEntryUrl } from './entryUtils';
import { initials, isInstitutionalAuthor, splitAuthorField, splitNameParts } from './nameParsing';
import type { FormattedReference } from './referenceTypes';
import { stripTrailingConnector } from './citationClauses';

/** "F. M. Last" — the per-author IEEE form (initials before surname). */
function formatSingleAuthorIeee(name: string): string {
  const { last, given } = splitNameParts(name);
  if (!last) return '';
  const init = initials(given);
  return init ? `${init} ${last}` : last;
}

/**
 * Formats a BibTeX `author`/`editor` field per the IEEE reference style:
 * "F. Last" for one author, "F. Last and F. Last" for two, "F. Last, F. Last,
 * and F. Last" up to six, and "F. Last et al." past six.
 */
export function formatAuthorsIeee(rawAuthorField: string): string {
  const { names, hasEtAl } = splitAuthorField(rawAuthorField);
  const formatted = names.map((raw) =>
    isInstitutionalAuthor(raw) ? cleanLatexText(raw) : formatSingleAuthorIeee(cleanLatexText(raw))
  );

  if (formatted.length === 0) return '';
  if (formatted.length > 6 || hasEtAl) return `${formatted[0]} et al.`;
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
}

export type IeeeReference = FormattedReference;

/**
 * Formats a single BibTeX entry per the IEEE reference style: titles of
 * standalone works (books, journals, proceedings) in italics, titles of
 * works contained in something else (articles, chapters, papers, theses) in
 * quotes — matching the IEEE Editorial Style Manual's reference examples.
 */
export function formatEntryIeee(entry: BibEntry): IeeeReference {
  const f = entry.fields;
  const get = (name: string): string => (f[name] ? cleanLatexText(f[name]) : '');
  const esc = escapeHtml;

  const rawAuthorField = f.author || f.editor || '';
  const authors = formatAuthorsIeee(rawAuthorField);
  const title = get('title');
  const year = get('year') || 's.d.';
  const address = get('address');
  const publisher = get('publisher');
  const edition = get('edition');
  const journal = get('journal');
  const booktitle = get('booktitle');
  const volume = get('volume');
  const number = get('number');
  const pages = get('pages').replace(/-{2,}/g, '-');
  const school = get('school') || get('institution');
  const note = get('note');
  const urlAccess = get('urlaccessdate');
  const thesisType = get('type');
  const editorField = f.author && f.editor ? formatAuthorsIeee(f.editor) : '';

  const quotedTitle = title ? `&ldquo;${esc(title)},&rdquo;` : '';
  const italicTitle = title ? `<em>${esc(title)}</em>` : '';
  const type = entry.type.toLowerCase();
  const clauses: string[] = [];

  if (authors) clauses.push(esc(authors));

  if (type === 'book' || type === 'booklet') {
    let c = italicTitle;
    if (edition && edition !== '1') c += `, ${esc(edition)} ed`;
    if (c) clauses.push(c);
    const pub = [address, publisher].filter(Boolean).map(esc).join(': ');
    clauses.push([pub, esc(year)].filter(Boolean).join(', '));
  } else if (type === 'article') {
    if (quotedTitle) clauses.push(quotedTitle);
    const journalHtml = journal ? `<em>${esc(journal)}</em>` : '';
    const tail: string[] = [];
    if (volume) tail.push(`vol. ${esc(volume)}`);
    if (number) tail.push(`no. ${esc(number)}`);
    if (pages) tail.push(`pp. ${esc(pages)}`);
    tail.push(esc(year));
    clauses.push(journalHtml ? `${journalHtml}, ${tail.join(', ')}` : tail.join(', '));
  } else if (type === 'incollection' || type === 'inbook') {
    if (quotedTitle) clauses.push(quotedTitle);
    const bookTitleHtml = booktitle ? `<em>${esc(booktitle)}</em>` : italicTitle;
    clauses.push(`in ${editorField ? `${esc(editorField)}, Ed. ` : ''}${bookTitleHtml}`);
    const pub = [address, publisher].filter(Boolean).map(esc).join(': ');
    let last = [pub, esc(year)].filter(Boolean).join(', ');
    if (pages) last += `, pp. ${esc(pages)}`;
    clauses.push(last);
  } else if (type === 'inproceedings' || type === 'conference') {
    if (quotedTitle) clauses.push(quotedTitle);
    const bookHtml = booktitle ? `in <em>${esc(booktitle)}</em>` : '';
    const tail: string[] = [];
    if (address) tail.push(esc(address));
    tail.push(esc(year));
    if (pages) tail.push(`pp. ${esc(pages)}`);
    clauses.push(bookHtml ? `${bookHtml}, ${tail.join(', ')}` : tail.join(', '));
  } else if (type === 'mastersthesis' || type === 'phdthesis' || type === 'monografia' || type === 'monography') {
    if (quotedTitle) clauses.push(quotedTitle);
    const defaultLabel = type === 'phdthesis' ? 'Ph.D. dissertation' : 'M.S. thesis';
    let degree = esc(thesisType || defaultLabel);
    if (school) degree += `, ${esc(school)}`;
    if (address) degree += `, ${esc(address)}`;
    degree += `, ${esc(year)}`;
    clauses.push(degree);
  } else if (type === 'techreport') {
    if (quotedTitle) clauses.push(quotedTitle);
    const tail: string[] = [];
    if (school) tail.push(esc(school));
    if (address) tail.push(esc(address));
    tail.push(esc(year));
    clauses.push(tail.join(', '));
  } else {
    if (quotedTitle) clauses.push(quotedTitle);
    clauses.push(esc(year));
  }

  const resolvedUrl = resolveEntryUrl(entry);
  if (resolvedUrl) {
    let avail = `[Online]. Available: <a href="${esc(resolvedUrl)}" target="_blank" rel="noopener noreferrer">${esc(resolvedUrl)}</a>`;
    if (urlAccess) avail += `. Accessed: ${esc(urlAccess)}`;
    clauses.push(avail);
  }

  if (note) clauses.push(esc(note));

  let html = clauses
    .filter(Boolean)
    .map(stripTrailingConnector)
    .join(', ');
  if (html) html += '.';
  const firstAuthorSurname = authors ? splitNameParts(authors.split(/,| and /)[0]).last : '';
  const sortKey = (firstAuthorSurname || title || entry.key).toUpperCase();

  return { key: entry.key, html, sortKey };
}

/**
 * Formats every entry per the IEEE reference style, preserving the given
 * array order — IEEE numbers references by citation order (not
 * alphabetically), so pass entries already in the order you want them
 * numbered (e.g. wrap the result in an `<ol>`, which supplies the "[n]").
 */
export function formatBibliographyIeee(entries: BibEntry[]): IeeeReference[] {
  return entries.map(formatEntryIeee);
}
