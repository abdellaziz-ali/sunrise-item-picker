import { useCallback, useEffect, useMemo, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { CharacterTabs } from './components/CharacterTabs';
import { EmptyState } from './components/EmptyState';
import { PendingBar } from './components/PendingBar';
import { PickItemDialog } from './dialogs/PickItemDialog';
import { PreviewDialog } from './dialogs/PreviewDialog';
import { BungieApi } from './lib/bungieApi';
import { Catalog } from './lib/catalog';
import { downloadText, timestampSuffix } from './lib/downloads';
import { applyChanges, parseSettings } from './lib/settingsFile';
import type { CharacterInfo, PendingChange } from './types';

const catalog = new Catalog();
catalog.load();

export default function App() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pickTarget, setPickTarget] = useState<{ characterIndex: number; slotName: string } | null>(null);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const bungie = useMemo(() => new BungieApi(), []);

  useEffect(() => {
    void catalog.fetchRemote().then(() => setCatalogVersion((v) => v + 1));
  }, []);

  const loadFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const chars = parseSettings(text);
      setFileName(file.name);
      setRawText(text);
      setCharacters(chars);
      setParseError(chars.length === 0 ? 'No characters found under state.characters.' : null);
      setPending([]);
      setActiveTab(0);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
      setCharacters([]);
      setRawText('');
      setFileName(file.name);
    }
  }, []);

  useEffect(() => {
    function onDrop(e: DragEvent) {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) void loadFile(file);
    }
    function onDragOver(e: DragEvent) {
      e.preventDefault();
      setDragActive(true);
    }
    function onDragLeave(e: DragEvent) {
      if (e.relatedTarget === null) setDragActive(false);
    }
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    return () => {
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
    };
  }, [loadFile]);

  function handleChangeSlot(characterIndex: number, slotName: string) {
    setPickTarget({ characterIndex, slotName });
  }

  function handleRevertSlot(characterIndex: number, slotName: string) {
    setPending((prev) =>
      prev.filter((p) => !(p.characterIndex === characterIndex && p.slotName === slotName)),
    );
  }

  function handlePickResult(hash: string, name: string | undefined) {
    if (!pickTarget) return;
    const character = characters[pickTarget.characterIndex];
    const slot = character?.slots.find((s) => s.slotName === pickTarget.slotName);
    if (!slot) {
      setPickTarget(null);
      return;
    }
    if (hash.toLowerCase() === slot.definitionHash.toLowerCase()) {
      setPickTarget(null);
      return;
    }
    setPending((prev) => [
      ...prev.filter(
        (p) => !(p.characterIndex === pickTarget.characterIndex && p.slotName === pickTarget.slotName),
      ),
      {
        characterIndex: pickTarget.characterIndex,
        slotName: pickTarget.slotName,
        oldHash: slot.definitionHash,
        newHash: hash,
        newName: name,
        oldPlugsWasNull: slot.plugsIsNull,
      },
    ]);
    setPickTarget(null);
  }

  function handleApply() {
    if (!rawText || pending.length === 0) return;
    const modified = applyChanges(rawText, characters, pending);
    const ts = timestampSuffix();
    const originalBase = fileName?.replace(/\.json$/i, '') ?? 'settings';
    const backupName = `${originalBase}.${ts}.bak.json`;
    downloadText(backupName, rawText);
    setTimeout(() => downloadText('settings.json', modified), 300);
    const chars = parseSettings(modified);
    setRawText(modified);
    setCharacters(chars);
    setPending([]);
    setPreviewOpen(false);
  }

  function handleDownloadOriginal() {
    if (!rawText) return;
    const ts = timestampSuffix();
    const originalBase = fileName?.replace(/\.json$/i, '') ?? 'settings';
    downloadText(`${originalBase}.${ts}.bak.json`, rawText);
  }

  const activeCharacter = characters[Math.min(activeTab, characters.length - 1)];
  const pickCurrentSlot = pickTarget
    ? characters[pickTarget.characterIndex]?.slots.find((s) => s.slotName === pickTarget.slotName)
    : null;

  const ts = useMemo(() => timestampSuffix(), [previewOpen]);
  const backupPreview = fileName
    ? `${fileName.replace(/\.json$/i, '')}.${ts}.bak.json`
    : `settings.${ts}.bak.json`;

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        fileName={fileName}
        onOpen={(f) => void loadFile(f)}
        onDownloadOriginal={handleDownloadOriginal}
        canDownloadOriginal={rawText.length > 0}
      />

      {characters.length === 0 ? (
        parseError && fileName ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-lg rounded border border-red-800 bg-red-950/30 p-4 text-sm text-red-200">
              <div className="mb-2 font-semibold">Couldn't parse {fileName}.</div>
              <div className="text-red-300">{parseError}</div>
              <div className="mt-3 text-red-300/70">
                Make sure you selected the Sunrise <code className="font-mono">settings.json</code>{' '}
                (not something else).
              </div>
            </div>
          </div>
        ) : (
          <EmptyState onOpen={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()} />
        )
      ) : (
        <>
          <CharacterTabs
            characters={characters}
            active={activeTab}
            onSelect={setActiveTab}
            pending={pending}
            onChange={handleChangeSlot}
            onRevert={handleRevertSlot}
          />
          <PendingBar
            count={pending.length}
            onDiscard={() => setPending([])}
            onPreview={() => setPreviewOpen(true)}
          />
        </>
      )}

      {pickTarget && activeCharacter && pickCurrentSlot ? (
        <PickItemDialog
          open
          onClose={() => setPickTarget(null)}
          characterLabel={characters[pickTarget.characterIndex]?.displayName ?? 'Character'}
          slotName={pickTarget.slotName}
          currentHash={pickCurrentSlot.definitionHash}
          bungie={bungie}
          catalog={catalog}
          catalogVersion={catalogVersion}
          onCatalogChange={() => setCatalogVersion((v) => v + 1)}
          onSelect={handlePickResult}
        />
      ) : null}

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        changes={pending}
        onApply={handleApply}
        backupFilename={backupPreview}
        outputFilename="settings.json"
      />

      {dragActive ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center border-4 border-dashed border-amber-500 bg-amber-500/10 backdrop-blur-sm">
          <div className="text-3xl font-semibold text-amber-100">Drop settings.json to open</div>
        </div>
      ) : null}
    </div>
  );
}
