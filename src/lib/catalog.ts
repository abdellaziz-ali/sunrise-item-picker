import { normalizeHash } from './hashParser';
import { STARTER_CATALOG } from './starterCatalog';
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
  private userItems: PresetItem[] = [];

  load(): void {
    this.userItems = readStored();
  }

  all(): PresetItem[] {
    const userHashes = new Set(this.userItems.map((i) => i.hash.toLowerCase()));
    const seeded = STARTER_CATALOG.filter((s) => !userHashes.has(s.hash.toLowerCase()));
    return [...this.userItems, ...seeded];
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
