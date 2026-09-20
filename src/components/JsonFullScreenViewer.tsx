import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Search,
  WrapText,
  AlignLeft,
  X,
  FileCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface JsonFullScreenViewerProps {
  data: unknown;
  fileName?: string;
  onClose?: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const JsonFullScreenViewer: React.FC<JsonFullScreenViewerProps> = ({
  data,
  fileName = 'ai-personal-assistant-task-automation.json',
  onClose,
  isFullScreen = true,
  onToggleFullScreen,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wrapLines, setWrapLines] = useState(true);
  const [fontSize, setFontSize] = useState<13 | 14 | 16>(14);

  const formattedJson = useMemo(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const lines = useMemo(() => {
    return formattedJson.split('\n');
  }, [formattedJson]);

  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return lines.filter((line) => line.toLowerCase().includes(q)).length;
  }, [lines, searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderJsonLine = (line: string, index: number) => {
    const isMatch =
      searchQuery.trim() !== '' &&
      line.toLowerCase().includes(searchQuery.toLowerCase());

    // Check for key-value: ^(\s*)("(?:[^"\\]|\\.)*")\s*:\s*(.*)$
    const kvMatch = line.match(/^(\s*)("(?:[^"\\]|\\.)*")\s*:\s*(.*)$/);
    if (kvMatch) {
      const [, indent, key, val] = kvMatch;
      return (
        <div
          key={index}
          className={`flex hover:bg-slate-800/60 leading-relaxed px-1 sm:px-2 py-0.5 rounded transition-colors min-w-0 max-w-full ${
            isMatch ? 'bg-amber-500/20 ring-1 ring-amber-400/40' : ''
          }`}
        >
          <span className="select-none text-slate-500 font-mono text-right w-8 sm:w-12 shrink-0 pr-1.5 sm:pr-4 text-[10px] sm:text-xs opacity-60">
            {index + 1}
          </span>
          <div className={wrapLines ? 'break-all whitespace-pre-wrap flex-1 min-w-0' : 'whitespace-pre flex-1 min-w-0'}>
            <span>{indent}</span>
            <span className="text-sky-300 font-semibold">{key}</span>
            <span className="text-slate-400">: </span>
            {renderValue(val)}
          </div>
        </div>
      );
    }

    // Single string value in array
    const strMatch = line.match(/^(\s*)("(?:[^"\\]|\\.)*")(,?)$/);
    if (strMatch) {
      const [, indent, val, comma] = strMatch;
      return (
        <div
          key={index}
          className={`flex hover:bg-slate-800/60 leading-relaxed px-1 sm:px-2 py-0.5 rounded transition-colors min-w-0 max-w-full ${
            isMatch ? 'bg-amber-500/20 ring-1 ring-amber-400/40' : ''
          }`}
        >
          <span className="select-none text-slate-500 font-mono text-right w-8 sm:w-12 shrink-0 pr-1.5 sm:pr-4 text-[10px] sm:text-xs opacity-60">
            {index + 1}
          </span>
          <div className={wrapLines ? 'break-all whitespace-pre-wrap flex-1 min-w-0' : 'whitespace-pre flex-1 min-w-0'}>
            <span>{indent}</span>
            <span className="text-emerald-300">{val}</span>
            {comma && <span className="text-slate-400">{comma}</span>}
          </div>
        </div>
      );
    }

    // Default line (brackets, empty arrays, etc)
    return (
      <div
        key={index}
        className={`flex hover:bg-slate-800/60 leading-relaxed px-1 sm:px-2 py-0.5 rounded transition-colors min-w-0 max-w-full ${
          isMatch ? 'bg-amber-500/20 ring-1 ring-amber-400/40' : ''
        }`}
      >
        <span className="select-none text-slate-500 font-mono text-right w-8 sm:w-12 shrink-0 pr-1.5 sm:pr-4 text-[10px] sm:text-xs opacity-60">
          {index + 1}
        </span>
        <div className={wrapLines ? 'break-all whitespace-pre-wrap flex-1 min-w-0' : 'whitespace-pre flex-1 min-w-0'}>
          <span className="text-slate-300">{line}</span>
        </div>
      </div>
    );
  };

  const renderValue = (val: string) => {
    const comma = val.endsWith(',') ? ',' : '';
    const raw = comma ? val.slice(0, -1).trim() : val.trim();

    let node: React.ReactNode;
    if (raw.startsWith('"') && raw.endsWith('"')) {
      node = <span className="text-emerald-300">{raw}</span>;
    } else if (raw === 'true' || raw === 'false') {
      node = <span className="text-amber-400 font-semibold">{raw}</span>;
    } else if (raw === 'null') {
      node = <span className="text-rose-400 italic">{raw}</span>;
    } else if (!isNaN(Number(raw))) {
      node = <span className="text-amber-300">{raw}</span>;
    } else {
      node = <span className="text-slate-200">{raw}</span>;
    }

    return (
      <>
        {node}
        {comma && <span className="text-slate-400">{comma}</span>}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900 border-b border-slate-800 text-xs shrink-0 max-w-full min-w-0">
        {/* File details */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="font-semibold text-slate-200 font-mono truncate text-xs">{fileName}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-sans font-semibold shrink-0">
                JSON Spec
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-sans block">
              {lines.length} lines • {(formattedJson.length / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 w-full sm:w-64 min-w-0 order-last sm:order-none">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search JSON keys or values..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none w-full min-w-0"
          />
          {searchQuery && (
            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
              {matchCount} match{matchCount === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        {/* View & Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {/* Line Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWrapLines((prev) => !prev)}
            title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
            className={`p-1.5 rounded border transition-colors flex items-center gap-1 text-[11px] font-sans ${
              wrapLines
                ? 'bg-blue-600/30 border-blue-500/40 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            {wrapLines ? <WrapText className="w-3.5 h-3.5" /> : <AlignLeft className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{wrapLines ? 'Wrap On' : 'Wrap Off'}</span>
          </button>

          {/* Font Size Adjusters */}
          <button
            type="button"
            onClick={() => setFontSize((prev) => (prev === 16 ? 14 : prev === 14 ? 13 : 13))}
            disabled={fontSize === 13}
            title="Decrease font size"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFontSize((prev) => (prev === 13 ? 14 : prev === 14 ? 16 : 16))}
            disabled={fontSize === 16}
            title="Increase font size"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors font-sans"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors font-sans"
            title="Download JSON file to your device"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Toggle Full Screen */}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 border border-slate-700 transition-colors ml-1"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Code Area */}
      <div
        className={`flex-1 overflow-auto p-2 sm:p-4 select-text bg-slate-950 font-mono min-w-0 max-w-full ${
          fontSize === 13 ? 'text-xs' : fontSize === 14 ? 'text-sm' : 'text-base'
        }`}
        style={{ tabSize: 2 }}
      >
        <div className="max-w-7xl mx-auto space-y-0.5 min-w-0">
          {lines.map((line, idx) => renderJsonLine(line, idx))}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-sans shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span>UTF-8 JSON</span>
          <span>•</span>
          <span>Tab Size: 2</span>
          <span>•</span>
          <span>Lines: {lines.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden xs:inline">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
