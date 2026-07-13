export interface BibEntry {
  key: string;
  type: string;
  fields: Record<string, string>;
}

/**
 * Hand-rolled parser instead of a regex split: BibTeX field values commonly
 * contain nested braces (e.g. `title = {The {Higgs} Boson}`), which a single
 * regex cannot balance correctly.
 */
export function parseBibtex(source: string): BibEntry[] {
  const entries: BibEntry[] = [];
  const n = source.length;
  let i = 0;

  const isSpace = (ch: string) => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
  const skipWhitespace = () => {
    while (i < n && isSpace(source[i])) i++;
  };

  while (i < n) {
    if (source[i] !== '@') {
      i++;
      continue;
    }
    i++;
    const typeStart = i;
    while (i < n && /[a-zA-Z]/.test(source[i])) i++;
    const type = source.slice(typeStart, i).toLowerCase();
    skipWhitespace();

    if (source[i] !== '{' && source[i] !== '(') continue;
    const closer = source[i] === '{' ? '}' : ')';
    i++;
    skipWhitespace();

    const keyStart = i;
    while (i < n && source[i] !== ',' && source[i] !== closer) i++;
    const key = source.slice(keyStart, i).trim();

    if (source[i] === closer) {
      entries.push({ key, type, fields: {} });
      i++;
      continue;
    }
    i++; // skip comma after key

    const fields: Record<string, string> = {};
    while (i < n) {
      skipWhitespace();
      if (source[i] === closer) {
        i++;
        break;
      }

      const nameStart = i;
      while (i < n && /[a-zA-Z0-9_-]/.test(source[i])) i++;
      const name = source.slice(nameStart, i).toLowerCase();
      if (!name) {
        // malformed entry; bail out of this field loop to avoid an infinite loop
        i++;
        continue;
      }
      skipWhitespace();
      if (source[i] === '=') i++;
      skipWhitespace();

      let value = '';
      if (source[i] === '{') {
        let depth = 0;
        const valStart = i;
        do {
          if (source[i] === '{') depth++;
          else if (source[i] === '}') depth--;
          i++;
        } while (i < n && depth > 0);
        value = source.slice(valStart + 1, i - 1);
      } else if (source[i] === '"') {
        i++;
        const valStart = i;
        while (i < n && source[i] !== '"') i++;
        value = source.slice(valStart, i);
        i++;
      } else {
        const valStart = i;
        while (i < n && source[i] !== ',' && source[i] !== closer) i++;
        value = source.slice(valStart, i).trim();
      }

      fields[name] = value.replace(/\s+/g, ' ').trim();
      skipWhitespace();
      if (source[i] === ',') {
        i++;
      } else if (source[i] === closer) {
        i++;
        break;
      }
    }

    entries.push({ key, type, fields });
  }

  return entries.filter((e) => e.type !== 'comment' && e.type !== 'string' && e.type !== 'preamble' && e.key);
}
