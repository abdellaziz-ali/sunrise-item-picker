import { Dialog } from '../components/Dialog';
import type { PendingChange } from '../types';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  changes: PendingChange[];
  onApply: () => void;
  backupFilename: string;
  outputFilename: string;
}

export function PreviewDialog({
  open,
  onClose,
  changes,
  onApply,
  backupFilename,
  outputFilename,
}: PreviewDialogProps) {
  const sorted = changes
    .slice()
    .sort((a, b) =>
      a.characterIndex === b.characterIndex
        ? a.slotName.localeCompare(b.slotName)
        : a.characterIndex - b.characterIndex,
    );

  return (
    <Dialog open={open} onClose={onClose} title="Preview changes" wide>
      <div className="p-4">
        <div className="scrollbar-thin max-h-[50vh] overflow-auto rounded border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200">
          {sorted.length === 0 ? (
            <div className="text-slate-500">No pending changes.</div>
          ) : (
            sorted.map((c, i) => (
              <div key={i} className="mb-3">
                <div className="text-amber-400">
                  Character {c.characterIndex + 1}, {c.slotName}
                </div>
                <div className="ml-4 text-slate-400">
                  definition_hash: <span className="text-slate-500">{c.oldHash}</span> →{' '}
                  <span className="text-amber-300">{c.newHash}</span>
                  {c.newName ? <span className="ml-2 text-slate-500">({c.newName})</span> : null}
                </div>
                <div className="ml-4 text-slate-400">
                  {c.oldPlugsWasNull ? (
                    <span>plugs: <span className="text-slate-500">null (unchanged)</span></span>
                  ) : (
                    <span>plugs: <span className="text-slate-500">[array]</span> → <span className="text-amber-300">null</span></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 space-y-2 rounded border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-300">
          <div>
            When you click <span className="text-amber-300">Download</span>, two files will be
            saved:
          </div>
          <ul className="ml-4 list-disc text-slate-400">
            <li>
              <code className="font-mono text-slate-200">{backupFilename}</code> — a timestamped
              copy of the file you uploaded (backup).
            </li>
            <li>
              <code className="font-mono text-slate-200">{outputFilename}</code> — the modified
              file with your changes.
            </li>
          </ul>
          <div className="mt-2 rounded bg-amber-950/50 p-2 text-xs text-amber-200">
            Then: close Destiny 2 (if running), copy{' '}
            <code className="font-mono">{outputFilename}</code> into{' '}
            <code className="font-mono">D:\SunriseInstaller\D2\bin\x64\Sunrise\</code>, replacing
            the original.
          </div>
        </div>
      </div>
      <footer className="flex justify-end gap-2 border-t border-slate-800 bg-slate-900 p-3">
        <button
          onClick={onClose}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
        >
          Back
        </button>
        <button
          onClick={onApply}
          disabled={sorted.length === 0}
          className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-40"
        >
          Download
        </button>
      </footer>
    </Dialog>
  );
}
