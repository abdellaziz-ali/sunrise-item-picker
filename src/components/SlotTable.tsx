import type { CharacterInfo, PendingChange } from '../types';

interface SlotTableProps {
  character: CharacterInfo;
  pending: PendingChange[];
  onChange: (slotName: string) => void;
  onRevert: (slotName: string) => void;
}

const SLOT_ORDER: Record<string, number> = {
  kinetic: 0,
  energy: 1,
  heavy: 2,
  helmet: 10,
  gauntlets: 11,
  chest: 12,
  legs: 13,
  class_item: 14,
  subclass: 20,
  ghost: 30,
  vehicle: 31,
  ship: 32,
};

const SLOT_LABELS: Record<string, string> = {
  kinetic: 'Kinetic',
  energy: 'Energy',
  heavy: 'Heavy',
  helmet: 'Helmet',
  gauntlets: 'Gauntlets',
  chest: 'Chest',
  legs: 'Legs',
  class_item: 'Class Item',
  subclass: 'Subclass',
  ghost: 'Ghost',
  vehicle: 'Vehicle',
  ship: 'Ship',
};

function slotLabel(name: string): string {
  return SLOT_LABELS[name] ?? name.replace(/_/g, ' ');
}

function slotSort(a: string, b: string): number {
  const ao = SLOT_ORDER[a] ?? 100;
  const bo = SLOT_ORDER[b] ?? 100;
  return ao - bo;
}

export function SlotTable({ character, pending, onChange, onRevert }: SlotTableProps) {
  const sorted = character.slots.slice().sort((a, b) => slotSort(a.slotName, b.slotName));

  return (
    <div className="scrollbar-thin overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-800 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Slot</th>
            <th className="px-3 py-2 text-left font-semibold">Current hash</th>
            <th className="px-3 py-2 text-left font-semibold">Plugs</th>
            <th className="px-3 py-2 text-left font-semibold">Pending change</th>
            <th className="px-3 py-2 text-right font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((slot) => {
            const change = pending.find(
              (c) => c.characterIndex === character.index && c.slotName === slot.slotName,
            );
            return (
              <tr
                key={slot.slotName}
                className={`border-t border-slate-800 ${change ? 'bg-amber-950/40' : 'hover:bg-slate-800/50'}`}
              >
                <td className="px-3 py-2 font-medium text-slate-200">{slotLabel(slot.slotName)}</td>
                <td className="px-3 py-2 font-mono text-slate-300">{slot.definitionHash}</td>
                <td className="px-3 py-2 text-slate-400">
                  {slot.plugsIsNull ? 'null' : slot.hasPlugsRange ? 'array' : '—'}
                </td>
                <td className="px-3 py-2">
                  {change ? (
                    <span className="text-amber-300">
                      → <span className="font-mono">{change.newHash}</span>
                      {change.newName ? <span className="ml-2 text-amber-200/70">({change.newName})</span> : null}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => onChange(slot.slotName)}
                    className="rounded bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-500"
                  >
                    Change…
                  </button>
                  {change ? (
                    <button
                      onClick={() => onRevert(slot.slotName)}
                      className="ml-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                    >
                      Revert
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
