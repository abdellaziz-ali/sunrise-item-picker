import type { BungieItemInfo } from '../types';

const API_BASE = 'https://www.bungie.net/Platform';
const CDN_BASE = 'https://www.bungie.net';

// Baked-in default key so item lookup works with no setup. Users can override
// via Settings dialog — their key is preferred when non-empty.
export const DEFAULT_BUNGIE_API_KEY = 'e96ece71cb584589a53f4800433dffbe';

export class BungieApi {
  private readonly apiKey: string;

  constructor(userKey: string | undefined) {
    const trimmed = userKey?.trim();
    this.apiKey = trimmed && trimmed.length > 0 ? trimmed : DEFAULT_BUNGIE_API_KEY;
  }

  get hasApiKey(): boolean {
    return this.apiKey.length > 0;
  }

  async lookupItem(decimalHash: number, signal?: AbortSignal): Promise<BungieItemInfo | null> {
    try {
      const res = await fetch(
        `${API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${decimalHash}/`,
        { headers: { 'X-API-Key': this.apiKey }, signal },
      );
      if (!res.ok) return null;
      const json = await res.json();
      const response = json?.Response;
      if (!response) return null;
      const dp = response.displayProperties;
      if (!dp) return null;
      const rawName = typeof dp.name === 'string' ? dp.name : '';
      const name = rawName.length > 0 ? rawName : `Item ${decimalHash}`;
      const iconRaw = typeof dp.icon === 'string' ? dp.icon : undefined;
      const iconUrl = iconRaw
        ? iconRaw.startsWith('http')
          ? iconRaw
          : `${CDN_BASE}${iconRaw}`
        : undefined;
      const typeAndTier = typeof response.itemTypeAndTierDisplayName === 'string'
        ? response.itemTypeAndTierDisplayName
        : undefined;
      const hexHash = '0x' + decimalHash.toString(16).toUpperCase().padStart(8, '0');
      return { decimalHash, name, iconUrl, typeAndTier, hexHash };
    } catch {
      return null;
    }
  }
}
