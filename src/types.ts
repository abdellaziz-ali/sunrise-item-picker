export type Span = { start: number; end: number };

export interface EquipmentSlot {
  slotName: string;
  definitionHash: string;
  plugsIsNull: boolean;
  hasPlugsRange: boolean;
  definitionHashSpan: Span;
  plugsSpan: Span;
}

export interface CharacterInfo {
  index: number;
  displayName: string;
  slots: EquipmentSlot[];
}

export interface PresetItem {
  name: string;
  hash: string;
  slot?: string;
  type?: string;
  iconUrl?: string;
  isUserAdded?: boolean;
}

export interface PresetCatalogFile {
  version: number;
  items: PresetItem[];
}

export interface PendingChange {
  characterIndex: number;
  slotName: string;
  oldHash: string;
  newHash: string;
  newName?: string;
  oldPlugsWasNull: boolean;
}

export interface BungieItemInfo {
  decimalHash: number;
  name: string;
  iconUrl?: string;
  typeAndTier?: string;
  hexHash: string;
}
