import { useRef } from 'react';

interface ToolbarProps {
  fileName: string | null;
  onOpen: (file: File) => void;
  onDownloadOriginal: () => void;
  canDownloadOriginal: boolean;
}

export function Toolbar({
  fileName,
  onOpen,
  onDownloadOriginal,
  canDownloadOriginal,
}: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-amber-500" fill="currentColor">
            <circle cx="12" cy="15" r="7" />
            <path d="M2 17h20" stroke="#0b0f1a" strokeWidth="1.5" />
          </svg>
          <h1 className="text-lg font-semibold text-white">Sunrise Item Picker</h1>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="mr-2 text-sm text-slate-400">
            {fileName ? (
              <span>
                <span className="text-slate-500">Loaded:</span>{' '}
                <span className="font-mono text-slate-200">{fileName}</span>
              </span>
            ) : (
              <span className="text-slate-500">No file loaded</span>
            )}
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
          >
            Open settings.json…
          </button>
          <button
            onClick={onDownloadOriginal}
            disabled={!canDownloadOriginal}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800"
            title="Download a timestamped copy of the file as it was uploaded"
          >
            Download backup
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onOpen(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-amber-300/80">
        ⚠ Close Destiny 2 before applying changes. This tool runs entirely in your browser — nothing is uploaded anywhere.
      </div>
    </div>
  );
}
