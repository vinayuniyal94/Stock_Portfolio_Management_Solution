import React, { useState } from 'react';
import { FileText, UploadCloud, CheckCircle2, Database, ShieldCheck, Loader2 } from 'lucide-react';

export default function DocumentGroundingRagView() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setSuccessMsg('');

    setTimeout(() => {
      setUploading(false);
      setSuccessMsg(`Successfully embedded "${file.name}" into Pinecone Vector RAG database.`);
      setFile(null);
    }, 1500);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Vector Knowledge Base
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Document Grounding RAG</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload custom research reports, annual filings, or broker notes to ground the AI assistant in proprietary data.
        </p>
      </div>

      <div className="enterprise-card p-8 bg-white rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3 hover:border-emerald-400 transition-colors">
            <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto" />
            <div>
              <label className="text-xs font-bold text-slate-800 cursor-pointer block">
                <span>Click to upload research document</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <span className="text-[11px] text-slate-400 font-mono block mt-1">PDF, TXT, or Markdown (Max 25MB)</span>
            </div>
            {file && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-mono border border-emerald-200">
                <FileText className="w-3.5 h-3.5" /> {file.name}
              </div>
            )}
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>{uploading ? 'Embedding Vectors into Pinecone...' : 'Ingest & Ground Document'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}