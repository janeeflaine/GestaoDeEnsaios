import React from 'react';
import { X, Download } from 'lucide-react';

interface PdfPreviewModalProps {
  dataUrl: string;
  title: string;
  fileName: string;
  onClose: () => void;
}

export default function PdfPreviewModal({ dataUrl, title, fileName, onClose }: PdfPreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-sm font-bold text-slate-800 truncate">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all"
            >
              <Download size={14} /> Baixar PDF
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {/* Preview */}
        <iframe
          src={dataUrl}
          className="flex-1 w-full border-0"
          title={title}
        />
      </div>
    </div>
  );
}
