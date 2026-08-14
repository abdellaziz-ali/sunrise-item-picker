const HEX_ONLY = /^[0-9A-Fa-f]+$/;
const HAS_AF = /[A-Fa-f]/;

export interface ParsedHash {
  formatted: string;
  decimal: number;
}

export function tryParseHash(input: string): ParsedHash | null {
  if (!input) return null;
  const trimmed = input.trim().replace(/^"|"$/g, '').replaceAll('_', '').replaceAll(',', '');
  if (!trimmed) return null;

  if (/^0x/i.test(trimmed)) {
    const hex = trimmed.slice(2);
    if (!hex.length || hex.length > 16 || !HEX_ONLY.test(hex)) return null;
    const value = Number.parseInt(hex, 16);
    if (!Number.isFinite(value) || value < 0 || value > 0xffffffff) return null;
    return { formatted: '0x' + value.toString(16).toUpperCase().padStart(8, '0'), decimal: value };
  }

  if (HEX_ONLY.test(trimmed) && HAS_AF.test(trimmed) && trimmed.length <= 8) {
    const value = Number.parseInt(trimmed, 16);
    if (!Number.isFinite(value)) return null;
    return { formatted: '0x' + value.toString(16).toUpperCase().padStart(8, '0'), decimal: value };
  }

  if (/^-?\d+$/.test(trimmed)) {
    const asNumber = Number(trimmed);
    let unsigned: number;
    if (asNumber >= 0 && asNumber <= 0xffffffff) {
      unsigned = asNumber;
    } else if (asNumber < 0 && asNumber >= -0x80000000) {
      unsigned = asNumber >>> 0;
    } else {
      return null;
    }
    return { formatted: '0x' + unsigned.toString(16).toUpperCase().padStart(8, '0'), decimal: unsigned };
  }

  return null;
}

export function normalizeHash(input: string): string {
  const parsed = tryParseHash(input);
  return parsed?.formatted ?? input;
}
