import type { PresetItem } from '../types';

// Curated set of well-known items to seed the picker so users always have
// something to pick from without hunting for hashes. Validated live against the
// Bungie manifest at commit time. Users can still add/override via the picker.
export const STARTER_CATALOG: PresetItem[] = [
  { hash: '0x14B465B2', slot: 'kinetic',  name: 'Ace of Spades',       type: 'Exotic Hand Cannon',           iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/cdfbfd3f098329a367294f191070f8c4.jpg' },
  { hash: '0x0C3630EB', slot: 'kinetic',  name: 'Malfeasance',         type: 'Exotic Hand Cannon',           iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/5564a17ddf52e36f56e7256ad9946a17.jpg' },
  { hash: '0xBF704917', slot: 'kinetic',  name: "Izanagi's Burden",    type: 'Exotic Sniper Rifle',          iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/8763caf9bfb147a41f3e34ec7eaf876b.jpg' },
  { hash: '0xE5296126', slot: 'kinetic',  name: 'The Jade Rabbit',     type: 'Exotic Scout Rifle',           iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/f513e68c68d76392cffd52d94cc1410a.jpg' },
  { hash: '0xCCE7D927', slot: 'kinetic',  name: 'Crimson',             type: 'Exotic Hand Cannon',           iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/5a7cb122bf2e8968a68cee59ef93b23d.jpg' },
  { hash: '0xAD4746D5', slot: 'energy',   name: 'Sunshot',             type: 'Exotic Hand Cannon',           iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/f45a7d8e52bf0d88bbd43d4354878313.jpg' },
  { hash: '0xCB6F6266', slot: 'energy',   name: 'Polaris Lance',       type: 'Exotic Scout Rifle',           iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/a22adf5ee0096e1cb9a6e212ee591b70.jpg' },
  { hash: '0xFFEB594E', slot: 'energy',   name: 'Quicksilver Storm',   type: 'Exotic Auto Rifle',            iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/06ec3d22c69944f6755bf75f07cd83bd.jpg' },
  { hash: '0x514B4081', slot: 'heavy',    name: 'Gjallarhorn',         type: 'Exotic Rocket Launcher',       iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/b62083eed6a4708e581fc9a061bcc8e9.jpg' },
  { hash: '0x70BEF156', slot: 'heavy',    name: 'Whisper of the Worm', type: 'Exotic Sniper Rifle',          iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/e47c31826843f6fd0aa863eac6fd093e.jpg' },
  { hash: '0x8DA63B0E', slot: 'heavy',    name: 'Anarchy',             type: 'Exotic Grenade Launcher',      iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/f24e3336a1142847d6bf47b56b492eea.jpg' },
  { hash: '0x79DC9B1A', slot: 'heavy',    name: 'The Queenbreaker',    type: 'Exotic Linear Fusion Rifle',   iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/cc919daae4f005e9da7f2065fe8e29c4.jpg' },
  { hash: '0xAEC8B880', slot: 'subclass', name: 'Striker',             type: 'Titan Subclass',               iconUrl: 'https://www.bungie.net/common/destiny2_content/icons/949af7a61d60a8e6071282daafa9e6e9.png' },
];
