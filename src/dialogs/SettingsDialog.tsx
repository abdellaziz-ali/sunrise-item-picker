import { useState } from 'react';
import { Dialog } from '../components/Dialog';
import type { AppConfig } from '../types';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export function SettingsDialog({ open, onClose, config, onSave }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState(config.bungieApiKey ?? '');
  const [visible, setVisible] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} title="Settings">
      <div className="space-y-6 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">
            Bungie API key (optional)
          </label>
          <div className="flex gap-2">
            <input
              type={visible ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Bungie API key here"
              className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-amber-500"
            />
            <button
              onClick={() => setVisible((v) => !v)}
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Used only to look up item names and icons for custom hashes. Stored in your browser's
            localStorage. Never sent anywhere except <code className="font-mono">bungie.net</code>.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Get one for free at{' '}
            <a
              href="https://www.bungie.net/en/Application"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              bungie.net/en/Application
            </a>
            . Any name works; set redirect URL to <code className="font-mono">https://localhost</code>.
          </p>
        </div>

        <div className="rounded border border-slate-700 bg-slate-950 p-3 text-xs text-slate-400">
          Without a key: custom-hash items still work — you just need to know the hash and won't see
          a name or icon. Catalog items you've saved keep their name and icon regardless.
        </div>
      </div>
      <footer className="flex justify-end gap-2 border-t border-slate-800 bg-slate-900 p-3">
        <button
          onClick={onClose}
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onSave({ ...config, bungieApiKey: apiKey.trim() || undefined });
            onClose();
          }}
          className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
        >
          Save
        </button>
      </footer>
    </Dialog>
  );
}
