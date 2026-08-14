import { writeFile } from 'node:fs/promises';

const MANIFEST_INDEX_URL = 'https://www.bungie.net/Platform/Destiny2/Manifest/';

// Pre-Beyond-Light season watermarks (S1 base game .. S11 Arrivals). Items
// with these watermarks were in the game as of August 2020 and are safe to
// equip in the Sunrise (S11) client. Anything with a newer watermark
// (Beyond Light onward) will silently fail.
const PRE_BL_WATERMARKS = new Set<string | null>([
  null, // untagged base-game items
  '/common/destiny2_content/icons/4f28dc0f39238fe25d298a894ea71389.png', // base D2 Y1/Y2 gear
  '/common/destiny2_content/icons/e78fd9419f99464816ac8f628bc3c4af.png', // Shadowkeep / Dreaming City
  '/common/destiny2_content/icons/aeb95eb1abe8e45e1fe2573d6b3ab3c5.png', // Forsaken
  '/common/destiny2_content/icons/2c022e452f395db7b1daec1cb44631fc.png', // Season of the Dawn / Guardian Games
  '/common/destiny2_content/icons/50c3ebe414c6946429934d79504922fa.png', // Undying / Solstice 2020
  '/common/destiny2_content/icons/d105aa342f2d0c53a90a28477552f61f.png', // Arrivals (S11) itself
  '/common/destiny2_content/icons/da5f961ef97b78293cc498978c10e178.png', // Warmind / Leviathan
  '/common/destiny2_content/icons/58d3ec8338cc9746a2e0cf901fbcec0e.png', // Opulence / Drifter
  '/common/destiny2_content/icons/7ba9d804508dd083ec20fcdb8ba0869d.png', // Curse of Osiris / Y1 exotics
]);

// Sunrise-visible equipment slot names, mapped from Bungie inventory-bucket hashes.
// Subclass is intentionally excluded — Aug 2020 used element-tree hashes; modern
// hashes are all Void/Solar/Arc/Stasis/Strand/Prismatic 3.0 and won't equip.
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

interface OutItem {
  hash: string;
  slot: string;
  name: string;
  type?: string;
  iconUrl?: string;
}

console.log('Looking up manifest URL...');
const manifest = await (await fetch(MANIFEST_INDEX_URL)).json() as any;
const itemsPath = manifest.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition;
const manifestUrl = `https://www.bungie.net${itemsPath}`;

console.log(`Downloading ${manifestUrl.split('/').pop()}...`);
const t0 = Date.now();
const raw = await (await fetch(manifestUrl)).text();
const sizeMb = (raw.length / 1024 / 1024).toFixed(1);
console.log(`  ${sizeMb} MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

console.log('Parsing...');
const items = JSON.parse(raw) as Record<string, any>;
console.log(`  ${Object.keys(items).length} total items`);

const filtered: OutItem[] = [];
let notPreBl = 0;
let notEquipable = 0;
let noName = 0;
let noIcon = 0;

for (const [hash, item] of Object.entries(items)) {
  const wm = item.iconWatermark ?? null;
  if (!PRE_BL_WATERMARKS.has(wm)) { notPreBl++; continue; }
  const bucketHash = item.inventory?.bucketTypeHash;
  const slot = BUCKET_TO_SLOT[String(bucketHash)];
  if (!slot) { notEquipable++; continue; }
  const name: string | undefined = item.displayProperties?.name;
  if (!name || name.length === 0) { noName++; continue; }
  const iconRaw: string | undefined = item.displayProperties?.icon;
  if (!iconRaw) { noIcon++; continue; }
  const iconUrl = `https://www.bungie.net${iconRaw}`;
  const decimalHash = Number(hash);
  const hexHash = '0x' + decimalHash.toString(16).toUpperCase().padStart(8, '0');
  filtered.push({
    hash: hexHash,
    slot,
    name,
    type: item.itemTypeAndTierDisplayName,
    iconUrl,
  });
}

filtered.sort((a, b) => a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));

const bySlot: Record<string, number> = {};
for (const item of filtered) bySlot[item.slot] = (bySlot[item.slot] ?? 0) + 1;

const outPath = 'public/season11-catalog.json';
await writeFile(outPath, JSON.stringify(filtered));

console.log('');
console.log(`Wrote ${filtered.length} items to ${outPath}`);
console.log('  Size:', ((await import('node:fs')).statSync(outPath).size / 1024).toFixed(1), 'KB');
console.log('Slot counts:', bySlot);
console.log(`Skipped: ${notPreBl} post-BL, ${notEquipable} non-equipable, ${noName} nameless, ${noIcon} iconless`);
