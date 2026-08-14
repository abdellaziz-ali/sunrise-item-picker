import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog } from '../components/Dialog';
import { IconImage } from '../components/IconImage';
import { BungieApi } from '../lib/bungieApi';
import { Catalog } from '../lib/catalog';
import { tryParseHash } from '../lib/hashParser';
import type { BungieItemInfo, PresetItem } from '../types';

interface PickItemDialogProps {
  open: boolean;
  onClose: () => void;
  characterLabel: string;
  slotName: string;
  currentHash: string;
  bungie: BungieApi;
  catalog: Catalog;
  catalogVersion: number;
  onCatalogChange: () => void;
  onSelect: (hash: string, name?: string) => void;
}

interface LookupState {
  hash: string;
  info: BungieItemInfo | null;
  loading: boolean;
  error: string | null;
}

export function PickItemDialog({
  open,
  onClose,
  characterLabel,
  slotName,
  currentHash,
  bungie,
  catalog,
  catalogVersion,
  onCatalogChange,
  onSelect,
}: PickItemDialogProps) {
  const [customHash, setCustomHash] = useState('');
  const [customName, setCustomName] = useState('');
  const [search, setSearch] = useState('');
  const [lookup, setLookup] = useState<LookupState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      setCustomHash('');
      setCustomName('');
      setSearch('');
      setLookup(null);
      abortRef.current?.abort();
    }
  }, [open]);

  const catalogItems = useMemo(() => {
    void catalogVersion;
    const all = catalog.all();
    return all.filter(
      (item) => !item.slot || item.slot.toLowerCase() === slotName.toLowerCase(),
    );
  }, [catalog, slotName, catalogVersion]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalogItems;
    return catalogItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.hash.toLowerCase().includes(q) ||
        (item.type ?? '').toLowerCase().includes(q),
    );
  }, [catalogItems, search]);

  const parsedCustom = tryParseHash(customHash);
  const canUseCustom = parsedCustom !== null;

  async function runLookup() {
    if (!parsedCustom) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const cataloged = catalog.findByHash(parsedCustom.formatted);
    if (cataloged) {
      setLookup({
        hash: parsedCustom.formatted,
        loading: false,
        error: null,
        info: {
          decimalHash: parsedCustom.decimal,
          hexHash: parsedCustom.formatted,
          name: cataloged.name,
          iconUrl: cataloged.iconUrl,
          typeAndTier: cataloged.type,
        },
      });
      return;
    }

    setLookup({ hash: parsedCustom.formatted, loading: true, error: null, info: null });
    try {
      const info = await bungie.lookupItem(parsedCustom.decimal, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (!info) {
        setLookup({
          hash: parsedCustom.formatted,
          loading: false,
          error: 'Bungie returned no data for this hash (may be redacted or invalid).',
          info: null,
        });
        return;
      }
      setLookup({ hash: parsedCustom.formatted, loading: false, error: null, info });
      if (!customName.trim()) setCustomName(info.name);
    } catch {
      if (!ctrl.signal.aborted) {
        setLookup({
          hash: parsedCustom.formatted,
          loading: false,
          error: 'Lookup failed. Check your network connection.',
          info: null,
        });
      }
    }
  }

  function pickPreset(item: PresetItem) {
    onSelect(item.hash, item.name);
  }

  function useCustom() {
    if (!parsedCustom) return;
    const name = customName.trim() || lookup?.info?.name;
    onSelect(parsedCustom.formatted, name || undefined);
  }

  function addCurrentToCatalog() {
    if (!parsedCustom) return;
    const name = customName.trim() || lookup?.info?.name || parsedCustom.formatted;
    const iconUrl = lookup?.info?.iconUrl;
    catalog.addOrUpdate({
      name,
      hash: parsedCustom.formatted,
      slot: slotName,
      type: lookup?.info?.typeAndTier,
      iconUrl,
    });
    onCatalogChange();
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Change ${slotName} — ${characterLabel}`} wide>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        <section className="border-b border-slate-800 md:border-b-0 md:border-r">
          <div className="border-b border-slate-800 p-3">
            <div className="mb-1 text-xs uppercase text-slate-500">Current</div>
            <div className="font-mono text-sm text-slate-300">{currentHash}</div>
          </div>
          <div className="border-b border-slate-800 p-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog…"
              className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-amber-500"
            />
          </div>
          <div className="scrollbar-thin max-h-[420px] overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">
                Your catalog is empty for this slot. Look up an item on the right and click{' '}
                <span className="text-amber-400">Add to catalog</span> to save it.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {filtered.map((item) => (
                  <li key={item.hash}>
                    <button
                      onClick={() => pickPreset(item)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-800/50"
                    >
                      <IconImage src={item.iconUrl} alt={item.name} size={48} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-100">{item.name}</div>
                        <div className="truncate text-xs text-slate-400">
                          <span className="font-mono">{item.hash}</span>
                          {item.type ? <span className="ml-2">{item.type}</span> : null}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="p-4">
          <div className="mb-3 text-xs uppercase text-slate-500">Custom hash</div>
          <label className="mb-1 block text-xs text-slate-400">Hash</label>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={customHash}
              onChange={(e) => setCustomHash(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void runLookup();
                }
              }}
              placeholder="0x1234ABCD or 305419896"
              className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-amber-500"
            />
            <button
              onClick={() => void runLookup()}
              disabled={!canUseCustom}
              className="rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-40"
            >
              Look up
            </button>
          </div>

          <label className="mb-1 block text-xs text-slate-400">Name (for your catalog)</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Optional"
            className="mb-4 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
          />

          <div className="mb-4 min-h-[80px] rounded border border-slate-800 bg-slate-950 p-3">
            {lookup === null ? (
              <div className="text-sm text-slate-500">
                {parsedCustom
                  ? `Ready: ${parsedCustom.formatted}`
                  : 'Enter a hash to preview.'}
              </div>
            ) : lookup.loading ? (
              <div className="text-sm text-slate-400">Looking up…</div>
            ) : lookup.info ? (
              <div className="flex items-start gap-3">
                <IconImage src={lookup.info.iconUrl} alt={lookup.info.name} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-100">
                    {lookup.info.name}
                  </div>
                  <div className="truncate font-mono text-xs text-slate-400">
                    {lookup.info.hexHash}
                  </div>
                  {lookup.info.typeAndTier ? (
                    <div className="truncate text-xs text-slate-500">{lookup.info.typeAndTier}</div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-sm text-amber-300">
                {lookup.error ?? `${lookup.hash} — no display data returned.`}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={addCurrentToCatalog}
              disabled={!canUseCustom}
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              Add to catalog
            </button>
            <button
              onClick={useCustom}
              disabled={!canUseCustom}
              className="rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-40"
            >
              Use this hash
            </button>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
