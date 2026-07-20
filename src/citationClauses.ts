/**
 * Strips a trailing "." or "," from a formatted clause before it's rejoined
 * with the next one — including when that punctuation sits just inside a
 * closing curly-quote entity (`&rdquo;`), as in `&ldquo;Title,&rdquo;` — so
 * joining clauses with their own separator never doubles up the punctuation
 * at the seam (quoted-title styles like IEEE/MLA embed the connector
 * punctuation inside the closing quote on purpose; the join must not add a
 * second one right after it).
 */
export function stripTrailingConnector(clause: string): string {
  return clause.replace(/([.,])(&rdquo;)?$/, (_match, _punct: string, quote?: string) => quote ?? '');
}
