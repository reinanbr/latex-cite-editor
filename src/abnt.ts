import type { BibEntry } from './bibtex';
import { cleanLatexText } from './latexText';
import { escapeHtml, resolveEntryUrl } from './entryUtils';
import { isInstitutionalAuthor, splitAuthorField, splitNameParts } from './nameParsing';
import type { FormattedReference } from './referenceTypes';

/** SOBRENOME, Nome do Meio — the per-author ABNT NBR 6023 form. */
function formatSingleAuthorAbnt(name: string): string {
  const { last, given } = splitNameParts(name);
  if (!last) return '';
  return given ? `${last.toUpperCase()}, ${given}` : last.toUpperCase();
}

/**
 * Formats a BibTeX `author`/`editor` field per ABNT NBR 6023: each author as
 * "SOBRENOME, Nome", multiple authors joined with "; ", and more than three
 * collapsed to "PRIMEIRO SOBRENOME, Nome et al."
 */
export function formatAuthorsAbnt(rawAuthorField: string): string {
  const { names, hasEtAl } = splitAuthorField(rawAuthorField);
  const formatted = names.map((raw) =>
    isInstitutionalAuthor(raw) ? cleanLatexText(raw).toUpperCase() : formatSingleAuthorAbnt(cleanLatexText(raw))
  );

  if (formatted.length === 0) return '';
  if (formatted.length > 3 || hasEtAl) return `${formatted[0]} et al.`;
  return formatted.join('; ');
}

export type AbntReference = FormattedReference;

/** Formats a single BibTeX entry as an ABNT NBR 6023 reference-list entry. */
export function formatEntryAbnt(entry: BibEntry): AbntReference {
  const f = entry.fields;
  const get = (name: string): string => (f[name] ? cleanLatexText(f[name]) : '');
  const esc = escapeHtml;

  const rawAuthorField = f.author || f.editor || '';
  const authors = formatAuthorsAbnt(rawAuthorField);
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
  const howpublished = get('howpublished');
  const urlAccess = get('urlaccessdate');
  const thesisType = get('type');
  // Only treat `editor` as a separate "In: ... (Org.)" clause when an `author`
  // is also present (incollection) — otherwise it's already the primary author.
  const editorField = f.author && f.editor ? formatAuthorsAbnt(f.editor) : '';

  const strongTitle = title ? `<strong>${esc(title)}</strong>` : '';
  const type = entry.type.toLowerCase();
  const clauses: string[] = [];

  if (authors) clauses.push(esc(authors));

  if (type === 'book' || type === 'booklet') {
    let c = strongTitle;
    if (edition && edition !== '1') c += `. ${esc(edition)}. ed`;
    if (c) clauses.push(c);
    const pub = [address, publisher].filter(Boolean).map(esc).join(': ');
    clauses.push([pub, esc(year)].filter(Boolean).join(', '));
  } else if (type === 'article') {
    if (title) clauses.push(esc(title));
    const venueParts: string[] = [];
    if (address) venueParts.push(esc(address));
    if (volume) venueParts.push(`v. ${esc(volume)}`);
    if (number) venueParts.push(`n. ${esc(number)}`);
    if (pages) venueParts.push(`p. ${esc(pages)}`);
    venueParts.push(esc(year));
    const journalHtml = journal ? `<strong>${esc(journal)}</strong>` : '';
    clauses.push(journalHtml ? `${journalHtml}, ${venueParts.join(', ')}` : venueParts.join(', '));
  } else if (type === 'incollection' || type === 'inbook') {
    if (title) clauses.push(esc(title));
    const bookTitleHtml = booktitle ? `<strong>${esc(booktitle)}</strong>` : strongTitle;
    clauses.push(`In: ${editorField ? `${esc(editorField)} (Org.). ` : ''}${bookTitleHtml}`);
    const pub = [address, publisher].filter(Boolean).map(esc).join(': ');
    let last = [pub, esc(year)].filter(Boolean).join(', ');
    if (pages) last += `. p. ${esc(pages)}`;
    clauses.push(last);
  } else if (type === 'inproceedings' || type === 'conference') {
    if (title) clauses.push(esc(title));
    const tail: string[] = [];
    if (address) tail.push(esc(address));
    tail.push(esc(year));
    if (volume) tail.push(`v. ${esc(volume)}`);
    if (number) tail.push(`n. ${esc(number)}`);
    if (pages) tail.push(`p. ${esc(pages)}`);
    const bookHtml = booktitle ? `In: <strong>${esc(booktitle)}</strong>` : '';
    clauses.push(bookHtml ? `${bookHtml}, ${tail.join(', ')}` : tail.join(', '));
  } else if (type === 'mastersthesis' || type === 'phdthesis' || type === 'monografia' || type === 'monography') {
    if (strongTitle) clauses.push(strongTitle);
    clauses.push(esc(year));
    const defaultLabel =
      type === 'phdthesis' ? 'Tese (Doutorado)' : type === 'mastersthesis' ? 'Dissertação (Mestrado)' : 'Trabalho de Conclusão de Curso';
    let degree = esc(thesisType || defaultLabel);
    if (school) degree += ` – ${esc(school)}`;
    if (address) degree += `, ${esc(address)}`;
    degree += `, ${esc(year)}`;
    clauses.push(degree);
  } else if (type === 'techreport') {
    if (strongTitle) clauses.push(strongTitle);
    const tail: string[] = [];
    if (address) tail.push(esc(address));
    tail.push(esc(year));
    clauses.push(school ? `${esc(school)}, ${tail.join(', ')}` : tail.join(', '));
  } else {
    // misc / online / anything else not covered above
    if (strongTitle) clauses.push(strongTitle);
    const tail: string[] = [];
    if (address) tail.push(esc(address));
    tail.push(esc(year));
    clauses.push(tail.join(', '));
  }

  const resolvedUrl = resolveEntryUrl(entry);
  if (resolvedUrl) {
    let avail = `Disponível em: <a href="${esc(resolvedUrl)}" target="_blank" rel="noopener noreferrer">${esc(resolvedUrl)}</a>`;
    if (urlAccess) avail += `. Acesso em: ${esc(urlAccess)}`;
    clauses.push(avail);
  } else if (howpublished) {
    const hasLabel = /^dispon[ií]vel\s+em/i.test(howpublished.trim());
    clauses.push(esc(hasLabel ? howpublished : `Disponível em: ${howpublished}`));
    if (urlAccess && !howpublished.toLowerCase().includes('acesso em')) {
      clauses.push(`Acesso em: ${esc(urlAccess)}`);
    }
  }

  if (note && !howpublished.includes(note)) clauses.push(esc(note));

  // Each clause is composed independently and may already end with its own
  // period (e.g. "et al.", an abbreviation) — strip it before rejoining so
  // clauses never produce a doubled ".." at the seam, then add exactly one
  // closing period for the whole reference.
  let html = clauses
    .filter(Boolean)
    .map((c) => c.replace(/\.$/, ''))
    .join('. ');
  if (html) html += '.';
  const firstAuthorSurname = authors ? authors.split(/[,;]/)[0].trim() : '';
  const sortKey = (firstAuthorSurname || title || entry.key).toUpperCase();

  return { key: entry.key, html, sortKey };
}

/**
 * Formats every entry per ABNT NBR 6023 and orders them alphabetically by
 * author surname (falling back to title), as the standard requires.
 */
export function formatBibliographyAbnt(entries: BibEntry[]): AbntReference[] {
  return entries
    .map(formatEntryAbnt)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'pt-BR'));
}
