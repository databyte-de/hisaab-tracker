import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { supabase } from '../lib/supabase';
import type { Category } from '../types';
pdfjs.GlobalWorkerOptions.workerSrc = worker;
export type ExtractedEntry = { title: string | null; person: string | null; purpose: string | null; amount: number | null; date: string | null; note: string | null };

export function ImportEntry({ category, onImport }: { category: Category; onImport: (entry: ExtractedEntry) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [selection, setSelection] = useState<number[]>([]);
  const pdf = useRef<any>(null);
  const generation = useRef(0);
  const [preview, setPreview] = useState('');
  useEffect(() => { if (!file) { setPreview(''); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  useEffect(() => () => { generation.current++; pdf.current?.loadingTask?.destroy(); }, []);
  const clear = () => { generation.current++; pdf.current?.loadingTask?.destroy(); pdf.current = null; setFile(null); setPages(0); setSelection([]); };
  const choose = async (f?: File) => {
    clear(); setError(''); if (!f) return;
    const version = generation.current;
    try {
      if (f.size > 10 * 1024 * 1024) throw new Error('Choose a file smaller than 10 MB.');
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(f.type)) throw new Error('Choose a PDF, JPG, PNG or WebP file.');
      if (f.type === 'application/pdf') {
        const doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
        if (version !== generation.current) { await doc.loadingTask.destroy(); return; }
        pdf.current = doc; setPages(doc.numPages);
        setSelection(doc.numPages <= 3 ? Array.from({ length: doc.numPages }, (_, i) => i + 1) : []);
      }
      setFile(f);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open file.'); }
  };
  const extract = async () => {
    if (!file) return;
    const version = generation.current;
    setBusy(true); setError('');
    try {
      const images: string[] = [];
      if (pdf.current) {
        for (const n of selection) {
          const page = await pdf.current.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: Math.min(2, 1600 / Math.max(base.width, base.height)) });
          const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
          await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise;
          images.push(canvas.toDataURL('image/jpeg', .85)); canvas.width = canvas.height = 0;
        }
      } else {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width * scale; canvas.height = bitmap.height * scale;
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
        images.push(canvas.toDataURL('image/jpeg', .85)); canvas.width = canvas.height = 0;
      }
      const { data, error } = await supabase.functions.invoke('extract-entry', { body: { category, images } });
      if (error) throw new Error('Extraction unavailable. Check the function setup or try again later. You can still enter details manually.');
      if (data.error) throw new Error(data.error);
      if (version === generation.current) onImport(data); clear();
    } catch (e) { setError(e instanceof Error ? e.message : 'Extraction failed.'); clear(); }
    finally { setBusy(false); }
  };
  return <div className="rounded-2xl border border-hairline bg-app p-4 space-y-3">
    <p className="text-sm font-semibold">Import from photo or PDF</p>
    <p className="text-xs text-muted">Files are processed temporarily. Review the extracted details before saving.</p>
    <div className="flex gap-4 text-sm">
      <label className="cursor-pointer underline">Take photo<input className="sr-only" disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e => { void choose(e.target.files?.[0]); e.target.value = ''; }} /></label>
      <label className="cursor-pointer underline">Upload file<input className="sr-only" disabled={busy} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => { void choose(e.target.files?.[0]); e.target.value = ''; }} /></label>
    </div>
    {file && <div className="space-y-2 text-xs">{preview && (pages ? <iframe title="PDF preview" src={preview} className="w-full h-48" /> : <img alt="Selected document" src={preview} className="max-h-48 rounded-xl" />)}<p>{file.name}{pages ? ` · ${pages} pages` : ''}</p>
      {pages > 3 && <><p>Select up to 3 pages for this entry.</p><div className="flex flex-wrap gap-2">{Array.from({ length: pages }, (_, i) => i + 1).map(n => <label key={n}><input type="checkbox" disabled={busy || (!selection.includes(n) && selection.length >= 3)} checked={selection.includes(n)} onChange={() => setSelection(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n].sort((a,b) => a-b))} /> {n}</label>)}</div></>}
      <button type="button" disabled={busy || (pages > 0 && !selection.length)} onClick={extract} className="rounded-xl bg-brand-500 text-white px-4 py-2 disabled:opacity-50">{busy ? 'Extracting…' : 'Extract details'}</button>
      <button type="button" disabled={busy} onClick={clear} className="ml-3">Cancel</button></div>}
    {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
  </div>;
}
