interface EmptyStateProps {
  onOpen: () => void;
}

export function EmptyState({ onOpen }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-slate-800 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-10 w-10 text-amber-500">
            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5V9h5.5L13 3.5zM8 12h8v2H8v-2zm0 4h5v2H8v-2z" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-white">Open your Sunrise settings.json</h2>
        <p className="mb-6 text-slate-400">
          The file lives at{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">
            D:\SunriseInstaller\D2\bin\x64\Sunrise\settings.json
          </code>{' '}
          on a default install. Nothing leaves your browser.
        </p>
        <button
          onClick={onOpen}
          className="rounded bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-500"
        >
          Choose file…
        </button>
        <div className="mt-6 text-xs text-slate-500">
          Tip: drop the file anywhere on this page.
        </div>
        <div className="mt-6 rounded border border-amber-900/40 bg-amber-950/20 p-3 text-left text-xs text-amber-200/80">
          <div className="mb-1 font-semibold text-amber-300">Heads-up</div>
          Sunrise runs the August 2020 / Season 11 client. Only items that
          existed then will actually equip — modern hashes silently fail or
          leave the old item in place. Use the{' '}
          <a
            href="https://www.light.gg/db/all/weapons/?filter-fadv=season%3A11"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-100"
          >
            light.gg Season 11 filter
          </a>
          {' '}when picking custom hashes.
        </div>
      </div>
    </div>
  );
}
