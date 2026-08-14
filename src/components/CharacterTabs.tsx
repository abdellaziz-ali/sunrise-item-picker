import type { CharacterInfo, PendingChange } from '../types';
import { SlotTable } from './SlotTable';

interface CharacterTabsProps {
  characters: CharacterInfo[];
  active: number;
  onSelect: (index: number) => void;
  pending: PendingChange[];
  onChange: (characterIndex: number, slotName: string) => void;
  onRevert: (characterIndex: number, slotName: string) => void;
}

export function CharacterTabs({
  characters,
  active,
  onSelect,
  pending,
  onChange,
  onRevert,
}: CharacterTabsProps) {
  if (characters.length === 0) return null;
  const character = characters[Math.min(active, characters.length - 1)];
  const pendingByCharacter = pending.filter((p) => p.characterIndex === character.index);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex gap-1 border-b border-slate-800 bg-slate-950 px-3 pt-2">
        {characters.map((c) => {
          const count = pending.filter((p) => p.characterIndex === c.index).length;
          const isActive = c.index === character.index;
          return (
            <button
              key={c.index}
              onClick={() => onSelect(c.index)}
              className={`relative rounded-t px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-t border-l border-r border-slate-700 bg-slate-900 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {c.displayName}
              {count > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 text-[11px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <SlotTable
        character={character}
        pending={pendingByCharacter}
        onChange={(slotName) => onChange(character.index, slotName)}
        onRevert={(slotName) => onRevert(character.index, slotName)}
      />
    </div>
  );
}
