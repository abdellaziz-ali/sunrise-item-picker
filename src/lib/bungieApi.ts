import type { BungieItemInfo } from '../types';

const API_BASE = 'https://www.bungie.net/Platform';
const CDN_BASE = 'https://www.bungie.net';

export class BungieApi {
  constructor(private readonly apiKey: string | undefined) {}

  get hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async lookupItem(decimalHash: number, signal?: AbortSignal): Promise<BungieItemInfo | null> {
    if (!this.hasApiKey) return null;
    try {
      const res = await fetch(
        `${API_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/${decimalHash}/`,
        { headers: { 'X-API-Key': this.apiKey! }, signal },
      );
      if (!res.ok) return null;
      const json = await res.json();
      const response = json?.Response;
      if (!response) return null;
      const dp = response.displayProperties;
      if (!dp) return null;
      const name = typeof dp.name === 'string' ? dp.name : `Item ${decimalHash}`;
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
