import { writeFile, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SUNDIAL_CATALOG_PATH = join(
  process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'),
  'Sundial',
  'catalog',
  'd2sk-86657.json',
);
const MANIFEST_INDEX_URL = 'https://www.bungie.net/Platform/Destiny2/Manifest/';

// Bungie inventory-bucket hash → Sunrise slot name.
const BUCKET_TO_SLOT: Record<string, string> = {
  '1498876634': 'kinetic',
  '2465295065': 'energy',
  '953998645':  'heavy',
  '3448274439': 'helmet',
  '3551918588': 'gauntlets',
  '14239492':   'chest',
  '20886954':   'legs',
  '1585787867': 'class_item',
  '4023194814': 'ghost',
  '2025709351': 'vehicle',
  '284967655':  'ship',
  '4274335291': 'emblem',
  '3683254069': 'finisher',
};

// class_type from Sundial's catalog (0=Titan, 1=Hunter, 2=Warlock, 3=any/weapon).
const CLASS_NAME: Record<number, string> = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };

interface SundialItem {
  hash: number;
  name: string;
  type_name: string;
  bucket_hash: number;
  class_type: number;
  default_plugs: (string | null)[];
  sockets: { socket_type: number; pool: number }[];
}

interface SundialCatalog {
  schema: number;
  sundial_version: string;
  items: SundialItem[];
}

interface OutItem {
  hash: string;
  slot: string;
  name: string;
  type?: string;
  rarity?: string;
  iconUrl?: string;
  charClass?: string;
}

console.log('Reading Sundial catalog...');
const sundialRaw = await readFile(SUNDIAL_CATALOG_PATH, 'utf8');
const sundial = JSON.parse(sundialRaw) as SundialCatalog;
console.log(`  schema ${sundial.schema}, sundial ${sundial.sundial_version}, ${sundial.items.length} items`);

console.log('Downloading Bungie manifest for icon/rarity enrichment...');
const manifest = await (await fetch(MANIFEST_INDEX_URL)).json() as any;
const itemsPath = manifest.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition;
const t0 = Date.now();
const bungieRaw = await (await fetch(`https://www.bungie.net${itemsPath}`)).text();
console.log(`  ${(bungieRaw.length / 1024 / 1024).toFixed(1)} MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
const bungieItems = JSON.parse(bungieRaw) as Record<string, any>;

const filtered: OutItem[] = [];
let notInSlot = 0;
let placeholder = 0;
let noBungieMatch = 0;
let noBungieIcon = 0;

for (const item of sundial.items) {
  const slot = BUCKET_TO_SLOT[String(item.bucket_hash)];
  if (!slot) { notInSlot++; continue; }

  // Sundial ships placeholder frames with generic names and no plug data.
  if (item.default_plugs.length === 0 && item.sockets.length === 0 && item.name.length < 20) {
    placeholder++;
    continue;
  }

  const hex = '0x' + item.hash.toString(16).toUpperCase().padStart(8, '0');
  const b = bungieItems[String(item.hash)];

  // Prefer Bungie's manifest for icon/rarity/full type; fall back to Sundial fields.
  let iconUrl: string | undefined;
  let rarity: string | undefined;
  let type: string | undefined = item.type_name;
  if (b) {
    const iconRaw = b.displayProperties?.icon;
    if (iconRaw) iconUrl = `https://www.bungie.net${iconRaw}`;
    else noBungieIcon++;
    rarity = b.inventory?.tierTypeName;
    if (typeof b.itemTypeAndTierDisplayName === 'string' && b.itemTypeAndTierDisplayName.length > 0) {
      type = b.itemTypeAndTierDisplayName;
    }
  } else {
    noBungieMatch++;
  }

  const charClass = CLASS_NAME[item.class_type];

  filtered.push({
    hash: hex,
    slot,
    name: item.name,
    type,
    rarity,
    iconUrl,
    charClass,
  });
}

// Stable sort: slot → rarity (Exotic first) → name.
const RARITY_ORDER = ['Exotic', 'Legendary', 'Rare', 'Uncommon', 'Common'];
filtered.sort((a, b) => {
  const s = a.slot.localeCompare(b.slot);
  if (s !== 0) return s;
  const ra = RARITY_ORDER.indexOf(a.rarity ?? 'z');
  const rb = RARITY_ORDER.indexOf(b.rarity ?? 'z');
  const r = (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
  if (r !== 0) return r;
  return a.name.localeCompare(b.name);
});

const bySlot: Record<string, number> = {};
for (const item of filtered) bySlot[item.slot] = (bySlot[item.slot] ?? 0) + 1;

const outPath = 'public/season11-catalog.json';
await writeFile(outPath, JSON.stringify(filtered));

console.log('');
console.log(`Wrote ${filtered.length} items to ${outPath}`);
console.log('  Size:', ((await import('node:fs')).statSync(outPath).size / 1024).toFixed(1), 'KB');
console.log('Slot counts:', bySlot);
console.log(`Skipped: ${notInSlot} unsupported slots, ${placeholder} placeholders`);
console.log(`Bungie enrichment: ${noBungieMatch} hashes not in current Bungie manifest, ${noBungieIcon} had no icon`);
