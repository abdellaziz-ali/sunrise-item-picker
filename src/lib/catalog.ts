import { normalizeHash } from './hashParser';
import type { PresetItem } from '../types';

const KEY = 'sunrise-item-picker/catalog';
const CATALOG_URL = `${import.meta.env.BASE_URL}season11-catalog.json`;

interface Stored {
  version: number;
  items: PresetItem[];
}

function readStored(): PresetItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.items) return [];
    return parsed.items.map((item) => ({
      ...item,
      hash: normalizeHash(item.hash),
      isUserAdded: true,
    }));
  } catch {
    return [];
  }
}

function writeStored(items: PresetItem[]): void {
  const data: Stored = { version: 1, items };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Ignore.
  }
}

export class Catalog {
  private userItems: PresetItem[] = [];
  private remoteItems: PresetItem[] = [];
  remoteLoading = false;
  remoteError: string | null = null;

  load(): void {
    this.userItems = readStored();
  }

  async fetchRemote(): Promise<void> {
    if (this.remoteItems.length > 0 || this.remoteLoading) return;
    this.remoteLoading = true;
    try {
      const res = await fetch(CATALOG_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PresetItem[];
      this.remoteItems = data.map((item) => ({ ...item, hash: normalizeHash(item.hash) }));
      this.remoteError = null;
    } catch (err) {
      this.remoteError = err instanceof Error ? err.message : String(err);
    } finally {
      this.remoteLoading = false;
    }
  }

  all(): PresetItem[] {
    const userHashes = new Set(this.userItems.map((i) => i.hash.toLowerCase()));
    const remote = this.remoteItems.filter((r) => !userHashes.has(r.hash.toLowerCase()));
    return [...this.userItems, ...remote];
  }

  findByHash(hash: string): PresetItem | undefined {
    const normalized = normalizeHash(hash).toLowerCase();
    return this.all().find((i) => i.hash.toLowerCase() === normalized);
  }

  addOrUpdate(item: PresetItem): void {
    const normalized: PresetItem = {
      ...item,
      hash: normalizeHash(item.hash),
      isUserAdded: true,
    };
    const idx = this.userItems.findIndex((i) => i.hash.toLowerCase() === normalized.hash.toLowerCase());
    if (idx >= 0) this.userItems[idx] = normalized;
    else this.userItems.push(normalized);
    writeStored(this.userItems);
  }

  remove(hash: string): void {
    const normalized = normalizeHash(hash);
    this.userItems = this.userItems.filter((i) => i.hash.toLowerCase() !== normalized.toLowerCase());
    writeStored(this.userItems);
  }
}
