interface PendingBarProps {
  count: number;
  onDiscard: () => void;
  onPreview: () => void;
}

export function PendingBar({ count, onDiscard, onPreview }: PendingBarProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-4 py-3">
      <span className="text-sm text-slate-300">
        {count === 0
          ? 'No pending changes.'
          : count === 1
            ? '1 pending change.'
            : `${count} pending changes.`}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onDiscard}
          disabled={count === 0}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800"
        >
          Discard
        </button>
        <button
          onClick={onPreview}
          disabled={count === 0}
          className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600"
        >
          Preview &amp; download…
        </button>
      </div>
    </div>
  );
}
