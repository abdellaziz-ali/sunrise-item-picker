import type { CharacterInfo, EquipmentSlot, PendingChange, Span } from '../types';

class Scanner {
  pos = 0;
  constructor(readonly text: string) {}

  private isWs(c: string): boolean {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
  }

  private skipWs(): void {
    while (this.pos < this.text.length && this.isWs(this.text[this.pos])) this.pos++;
  }

  private skipWsAndComma(): void {
    while (this.pos < this.text.length) {
      const c = this.text[this.pos];
      if (this.isWs(c) || c === ',') this.pos++;
      else break;
    }
  }

  peekNonWs(): string {
    let p = this.pos;
    while (p < this.text.length && this.isWs(this.text[p])) p++;
    return p < this.text.length ? this.text[p] : '';
  }

  expect(c: string): void {
    this.skipWs();
    if (this.text[this.pos] !== c) {
      throw new Error(`Expected '${c}' at ${this.pos}, got '${this.text[this.pos] ?? 'EOF'}'`);
    }
    this.pos++;
  }

  atObjectEnd(): boolean {
    this.skipWsAndComma();
    return this.text[this.pos] === '}';
  }

  atArrayEnd(): boolean {
    this.skipWsAndComma();
    return this.text[this.pos] === ']';
  }

  readPropertyName(): string {
    this.skipWsAndComma();
    if (this.text[this.pos] !== '"') {
      throw new Error(`Expected property name at ${this.pos}, got '${this.text[this.pos] ?? 'EOF'}'`);
    }
    this.pos++;
    const start = this.pos;
    while (this.pos < this.text.length && this.text[this.pos] !== '"') {
      if (this.text[this.pos] === '\\') this.pos += 2;
      else this.pos++;
    }
    const name = this.text.slice(start, this.pos);
    this.pos++;
    this.skipWs();
    this.expect(':');
    return name;
  }

  readValueSpan(): Span {
    this.skipWsAndComma();
    const start = this.pos;
    const c = this.text[this.pos];
    if (c === '"') this.consumeString();
    else if (c === '{') this.consumeCompound('{', '}');
    else if (c === '[') this.consumeCompound('[', ']');
    else if (c === 't') this.pos += 4;
    else if (c === 'f') this.pos += 5;
    else if (c === 'n') this.pos += 4;
    else this.consumeNumber();
    return { start, end: this.pos };
  }

  skipValue(): void {
    this.readValueSpan();
  }

  private consumeString(): void {
    this.pos++;
    while (this.pos < this.text.length && this.text[this.pos] !== '"') {
      if (this.text[this.pos] === '\\') this.pos += 2;
      else this.pos++;
    }
    this.pos++;
  }

  private consumeCompound(open: string, close: string): void {
    let depth = 0;
    let inString = false;
    while (this.pos < this.text.length) {
      const c = this.text[this.pos];
      if (inString) {
        if (c === '\\') { this.pos += 2; continue; }
        if (c === '"') inString = false;
        this.pos++;
      } else {
        if (c === '"') { inString = true; this.pos++; continue; }
        if (c === open) depth++;
        else if (c === close) {
          depth--;
          if (depth === 0) { this.pos++; return; }
        }
        this.pos++;
      }
    }
    throw new Error(`Unbalanced ${open}${close}`);
  }

  private consumeNumber(): void {
    while (this.pos < this.text.length) {
      const c = this.text[this.pos];
      if (c === ',' || c === '}' || c === ']' || this.isWs(c)) return;
      this.pos++;
    }
  }

  seekProperty(name: string): boolean {
    while (!this.atObjectEnd()) {
      const prop = this.readPropertyName();
      if (prop === name) return true;
      this.skipValue();
    }
    return false;
  }
}

export function parseSettings(text: string): CharacterInfo[] {
  const s = new Scanner(text);
  s.expect('{');
  if (!s.seekProperty('state')) return [];
  s.expect('{');
  if (!s.seekProperty('characters')) return [];
  s.expect('[');

  const characters: CharacterInfo[] = [];
  let idx = 0;
  while (!s.atArrayEnd()) {
    s.expect('{');
    const info: CharacterInfo = { index: idx, displayName: `Character ${idx + 1}`, slots: [] };
    idx++;

    while (!s.atObjectEnd()) {
      const prop = s.readPropertyName();
      if (prop === 'equipment') {
        s.expect('{');
        while (!s.atObjectEnd()) {
          const slotName = s.readPropertyName();
          s.expect('{');
          const slot = parseSlot(s, slotName);
          s.expect('}');
          info.slots.push(slot);
        }
        s.expect('}');
      } else {
        s.skipValue();
      }
    }
    s.expect('}');
    characters.push(info);
  }
  return characters;
}

function parseSlot(s: Scanner, slotName: string): EquipmentSlot {
  const slot: EquipmentSlot = {
    slotName,
    definitionHash: '',
    plugsIsNull: false,
    hasPlugsRange: false,
    definitionHashSpan: { start: 0, end: 0 },
    plugsSpan: { start: 0, end: 0 },
  };
  while (!s.atObjectEnd()) {
    const prop = s.readPropertyName();
    if (prop === 'definition_hash') {
      const span = s.readValueSpan();
      slot.definitionHashSpan = span;
      slot.definitionHash = s.text.slice(span.start + 1, span.end - 1);
    } else if (prop === 'plugs') {
      const span = s.readValueSpan();
      slot.plugsSpan = span;
      slot.hasPlugsRange = true;
      slot.plugsIsNull = s.text.slice(span.start, span.end).trim() === 'null';
    } else {
      s.skipValue();
    }
  }
  return slot;
}

export function applyChanges(
  original: string,
  characters: CharacterInfo[],
  changes: PendingChange[],
): string {
  type Edit = { start: number; end: number; replacement: string };
  const edits: Edit[] = [];
  for (const change of changes) {
    const character = characters[change.characterIndex];
    if (!character) continue;
    const slot = character.slots.find((s) => s.slotName === change.slotName);
    if (!slot) continue;
    if (slot.definitionHashSpan.end > slot.definitionHashSpan.start) {
      edits.push({
        start: slot.definitionHashSpan.start,
        end: slot.definitionHashSpan.end,
        replacement: `"${change.newHash}"`,
      });
    }
    if (slot.hasPlugsRange && !slot.plugsIsNull) {
      edits.push({
        start: slot.plugsSpan.start,
        end: slot.plugsSpan.end,
        replacement: 'null',
      });
    }
  }
  edits.sort((a, b) => b.start - a.start);

  let out = original;
  for (const edit of edits) {
    out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
  }
  return out;
}
