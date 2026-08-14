import { readFileSync } from 'node:fs';
import { parseSettings, applyChanges } from '../src/lib/settingsFile.js';

const settingsPath = 'D:/SunriseInstaller/D2/bin/x64/Sunrise/settings.json';
const raw = readFileSync(settingsPath, 'utf8');
console.log(`File size: ${raw.length} chars`);

const characters = parseSettings(raw);
console.log(`Characters found: ${characters.length}`);
for (const c of characters) {
  console.log(`\n${c.displayName} (${c.slots.length} slots):`);
  for (const slot of c.slots) {
    console.log(
      `  ${slot.slotName.padEnd(12)} ${slot.definitionHash}  plugs=${slot.plugsIsNull ? 'null' : 'array'}  ` +
      `hashSpan=[${slot.definitionHashSpan.start},${slot.definitionHashSpan.end})  ` +
      `plugsSpan=[${slot.plugsSpan.start},${slot.plugsSpan.end})`,
    );
  }
}

if (characters.length > 0 && characters[0].slots.length > 0) {
  const slot = characters[0].slots[0];
  console.log(`\nSample: character 1 ${slot.slotName} original span content:`);
  console.log(
    `  raw definition_hash slice: '${raw.slice(slot.definitionHashSpan.start, slot.definitionHashSpan.end)}'`,
  );
  const plugsSample = raw.slice(slot.plugsSpan.start, Math.min(slot.plugsSpan.end, slot.plugsSpan.start + 40));
  console.log(`  raw plugs first 40 chars: '${plugsSample.replace(/\n/g, '\\n')}'...`);

  console.log(`\nDry-run edit (character 1 ${slot.slotName} → 0xDEADBEEF, plugs → null):`);
  const modified = applyChanges(raw, characters, [
    {
      characterIndex: 0,
      slotName: slot.slotName,
      oldHash: slot.definitionHash,
      newHash: '0xDEADBEEF',
      oldPlugsWasNull: slot.plugsIsNull,
    },
  ]);
  console.log(`  new size: ${modified.length}, delta: ${modified.length - raw.length}`);
  const idx = modified.indexOf('0xDEADBEEF');
  console.log(`  '0xDEADBEEF' found at char ${idx}`);
  console.log(`  new file parses again: ${parseSettings(modified).length} characters`);
}
