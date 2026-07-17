import { parseBibtex, formatBibliographyAbnt } from 'latex-cite-editor';

const BIB = `@book{sagan1980,
  author    = {Sagan, Carl},
  title     = {Cosmos},
  publisher = {Random House},
  address   = {New York},
  year      = {1980}
}

@article{deterding2011,
  author  = {Sebastian Deterding and Dan Dixon and Rilla Khaled and Lennart Nacke},
  title   = {From Game Design Elements to Gamefulness: Defining \`\`Gamification''},
  journal = {Proceedings of the 15th International Academic MindTrek Conference},
  year    = {2011},
  pages   = {9--15},
  address = {New York},
  doi     = {10.1145/2181037.2181040}
}

@mastersthesis{bretones1999,
  author  = {Paulo Sergio Bretones},
  title   = {Disciplinas introdut{\\'o}rias de astronomia nos cursos superiores do {Brasil}},
  school  = {Universidade Estadual de Campinas},
  address = {Campinas},
  year    = {1999}
}`;

/**
 * Renders a full reference list per ABNT NBR 6023 — the citation style used
 * throughout Brazilian academic work. Unlike <CiteEditor />, this doesn't
 * need 'use client': parseBibtex/formatBibliographyAbnt are plain functions
 * from the root entry, so this whole component can be a React Server
 * Component that resolves the bibliography at render time on the server.
 *
 * formatBibliographyAbnt() formats every entry — author(s) as "SOBRENOME,
 * Nome" (or "... et al." past three authors), title in bold, and a layout
 * matched to the entry's BibTeX type (book, article, mastersthesis, ...) —
 * and alphabetically sorts the result by author surname, exactly as the
 * standard requires. No \cite{} markers needed; it works off the .bib alone.
 */
export default function AbntBibliographyExample() {
  const entries = parseBibtex(BIB);
  const references = formatBibliographyAbnt(entries);

  return (
    <div>
      <h2>Referências</h2>
      <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {references.map((ref) => (
          <li key={ref.key} style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: ref.html }} />
        ))}
      </ol>
    </div>
  );
}
