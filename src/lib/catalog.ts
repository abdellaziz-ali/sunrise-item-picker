import { normalizeHash } from './hashParser';
import type { PresetItem } from '../types';

const KEY = 'sunrise-item-picker/catalog';

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
  private items: PresetItem[] = [];

  load(): void {
    this.items = readStored();
  }

  all(): PresetItem[] {
    return this.items.slice();
  }

  findByHash(hash: string): PresetItem | undefined {
    const normalized = normalizeHash(hash);
    return this.items.find((i) => i.hash.toLowerCase() === normalized.toLowerCase());
  }

  addOrUpdate(item: PresetItem): void {
    const normalized: PresetItem = {
      ...item,
      hash: normalizeHash(item.hash),
      isUserAdded: true,
    };
    const idx = this.items.findIndex((i) => i.hash.toLowerCase() === normalized.hash.toLowerCase());
    if (idx >= 0) this.items[idx] = normalized;
    else this.items.push(normalized);
    writeStored(this.items);
  }

  remove(hash: string): void {
    const normalized = normalizeHash(hash);
    this.items = this.items.filter((i) => i.hash.toLowerCase() !== normalized.toLowerCase());
    writeStored(this.items);
  }
}
