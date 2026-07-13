'use client';

import { useMemo, useRef, useState } from 'react';
import { parseBibtex, resolveCitations } from 'latex-cite-editor';
import { CiteEditor, type CiteEditorHandle } from 'latex-cite-editor/react';

/**
 * Fuller integration pattern — this is the shape actually used to wire
 * latex-cite-editor into an article/blog CMS: a title + bibliography (.bib)
 * + Markdown content form, a formatting toolbar built on CiteEditorHandle
 * (no raw DOM/textarea access needed), and a live preview.
 *
 * The toolbar buttons below (bold/italic/citation/duplicate line/search) show
 * every method on CiteEditorHandle — copy this file as a starting point for
 * your own toolbar.
 */
export default function ArticleEditorWithToolbar() {
  const [title, setTitle] = useState('');
  const [bibliography, setBibliography] = useState('');
  const [content, setContent] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const editorRef = useRef<CiteEditorHandle | null>(null);

  const bibEntries = useMemo(() => parseBibtex(bibliography), [bibliography]);

  const preview = useMemo(() => {
    const { text, bibliographyHtml } = resolveCitations(content, bibEntries);
    return text.replace(/\n/g, '<br/>') + bibliographyHtml;
  }, [content, bibEntries]);

  const btn: React.CSSProperties = { padding: '4px 10px', cursor: 'pointer' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do artigo..."
        style={{ fontSize: 20, fontWeight: 600, padding: 8 }}
      />

      <div>
        <label>Bibliography (.bib)</label>
        <textarea
          value={bibliography}
          onChange={(e) => setBibliography(e.target.value)}
          rows={6}
          placeholder={'@article{key,\n  author = {...},\n  title = {...},\n  year = {2024}\n}'}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
        />
        {bibEntries.length > 0 && <p style={{ fontSize: 12, opacity: 0.7 }}>{bibEntries.length} referência(s) carregada(s)</p>}
      </div>

      {/* Toolbar driven entirely by CiteEditorHandle — no textarea DOM access */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={btn} onClick={() => editorRef.current?.wrapSelection('**', '**', 'negrito')}>B</button>
        <button style={{ ...btn, fontStyle: 'italic' }} onClick={() => editorRef.current?.wrapSelection('*', '*', 'itálico')}>I</button>
        <button style={btn} onClick={() => editorRef.current?.insertAtLineStart('## ')}>H2</button>
        <button style={btn} onClick={() => editorRef.current?.wrapSelection('\\cite{', '}', 'chave-do-bib')}>[1] Citar</button>
        <button style={btn} onClick={() => editorRef.current?.duplicateCurrentLine()}>⧉ Duplicar linha</button>
        <button style={btn} onClick={() => editorRef.current?.openSearch()}>🔍 Buscar</button>
        <button style={btn} onClick={() => setPreviewOpen((v) => !v)}>{previewOpen ? '✎ Editar' : '👁 Preview'}</button>
      </div>

      {!previewOpen ? (
        <CiteEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          bibEntries={bibEntries}
          minHeight="400px"
          placeholder={'# ' + (title || 'Título') + '\n\nEscreva em Markdown. Use \\cite{chave} para citar — o autocomplete puxa do .bib acima.'}
        />
      ) : (
        <div
          className="citation-ref bibliography"
          style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minHeight: 400 }}
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      )}
    </div>
  );
}
