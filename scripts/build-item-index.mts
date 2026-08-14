// One-off script: read the Bungie manifest InventoryItem file, filter to
// equippable items with valid display data, and emit a compact JSON asset
// bundled with the app. Run manually after Bungie ships a manifest update.

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const SRC = process.env.MANIFEST_FILE ?? 'C:/Users/Admin/AppData/Local/Temp/bungie-items.json';
const OUT = 'D:/SunriseInstaller/SunriseItemPickerWeb/public/items-index.json';

// Bungie equipmentSlotHash -> our slot name (matches Sunrise settings.json)
const SLOT_MAP: Record<number, string> = {
  1498876634: 'kinetic',
  2465295065: 'energy',
  953998645: 'heavy',
  3448274439: 'helmet',
  3551918588: 'gauntlets',
  14239492: 'chest',
  20886954: 'legs',
  1585787867: 'class_item',
  4023194814: 'ghost',
  2025709351: 'vehicle',
  284967655: 'ship',
  3284755031: 'subclass',
  4292445962: 'clan_banner',
  4274335291: 'emblem',
  3054419239: 'emote',
  3683254069: 'finisher',
};

const CDN = 'https://www.bungie.net';

interface CompactItem {
  h: string;   // hash in 0xUPPERCASE format
  n: string;   // name
  s: string;   // slot
  t?: string;  // type (e.g. "Exotic Hand Cannon")
  i?: string;  // icon URL (path only, prepend CDN at display)
  x?: 1;       // exotic flag (tier=6)
}

console.log(`Reading ${SRC}...`);
const t0 = Date.now();
const raw = readFileSync(SRC, 'utf8');
console.log(`  read ${(raw.length / 1_000_000).toFixed(1)} MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const t1 = Date.now();
const manifest = JSON.parse(raw) as Record<string, any>;
const total = Object.keys(manifest).length;
console.log(`  parsed ${total.toLocaleString()} items in ${((Date.now() - t1) / 1000).toFixed(1)}s`);

const items: CompactItem[] = [];
const slotCounts: Record<string, number> = {};
let skippedNoName = 0;
let skippedRedacted = 0;
let skippedNoSlot = 0;
let skippedUnknownSlot = 0;

for (const key of Object.keys(manifest)) {
  const item = manifest[key];
  if (item.redacted) { skippedRedacted++; continue; }
  const dp = item.displayProperties;
  const name = typeof dp?.name === 'string' ? dp.name : '';
  if (!name) { skippedNoName++; continue; }
  const eb = item.equippingBlock;
  const slotHash = eb?.equipmentSlotHash;
  if (!slotHash) { skippedNoSlot++; continue; }
  const slot = SLOT_MAP[slotHash];
  if (!slot) { skippedUnknownSlot++; continue; }

  const decimal = BigInt(key);
  const hex = '0x' + decimal.toString(16).toUpperCase().padStart(8, '0');

  const compact: CompactItem = { h: hex, n: name, s: slot };
  const type = item.itemTypeAndTierDisplayName;
  if (typeof type === 'string' && type.length > 0) compact.t = type;
  const icon = dp.icon;
  if (typeof icon === 'string' && icon.length > 0) compact.i = icon;
  if (item.inventory?.tierType === 6) compact.x = 1;

  items.push(compact);
  slotCounts[slot] = (slotCounts[slot] ?? 0) + 1;
}

console.log('\n--- Filter results ---');
console.log(`  total input:          ${total.toLocaleString()}`);
console.log(`  skipped redacted:     ${skippedRedacted.toLocaleString()}`);
console.log(`  skipped no name:      ${skippedNoName.toLocaleString()}`);
console.log(`  skipped no slot:      ${skippedNoSlot.toLocaleString()}`);
console.log(`  skipped unknown slot: ${skippedUnknownSlot.toLocaleString()}`);
console.log(`  kept:                 ${items.length.toLocaleString()}`);

console.log('\n--- Kept by slot ---');
const sortedSlots = Object.entries(slotCounts).sort((a, b) => b[1] - a[1]);
for (const [slot, n] of sortedSlots) {
  console.log(`  ${slot.padEnd(14)} ${n.toLocaleString()}`);
}

const exotics = items.filter((i) => i.x === 1).length;
console.log(`\n  exotics only:         ${exotics.toLocaleString()}`);

const json = JSON.stringify(items);
writeFileSync(OUT, json, 'utf8');
const raw2 = statSync(OUT).size;
const gz = gzipSync(json).length;
console.log(`\n--- Output ---`);
console.log(`  file:      ${OUT}`);
console.log(`  raw size:  ${(raw2 / 1024).toFixed(1)} KB (${(raw2 / 1_000_000).toFixed(2)} MB)`);
console.log(`  gzipped:   ${(gz / 1024).toFixed(1)} KB (${(gz / 1_000_000).toFixed(2)} MB)`);
