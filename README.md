# Sunrise Item Picker

Browser-based editor for the [Sunrise](https://github.com/stanuwu/SunriseInstaller)
Destiny 2 mod's `settings.json`, so you can swap equipped items per character
without hand-editing JSON. Everything runs in your browser — no server, no
upload, no tracking.

**Live:** deployed to GitHub Pages from `main` — see the URL under
**Settings → Pages** once the first deploy finishes, or in the
**Actions → Deploy Sunrise Item Picker to GitHub Pages** run summary.

## What it does

- Open your local `settings.json` (drag-drop or file picker).
- Tabbed view of every character, with each equipment slot listed.
- Change any slot: paste a hash or pick from your saved catalog.
- Optional Bungie API lookup fills in the item name + icon.
- Preview all pending changes before you commit.
- On apply: downloads a **timestamped backup** of the original file plus a
  **modified `settings.json`** for you to drop back into the Sunrise folder.
- Preserves the file byte-for-byte outside the two touched values
  (`definition_hash` and `plugs`) — same guarantee as the desktop tool.
- Sets `"plugs": null` automatically so the new item uses its default sockets.

## Why a webapp

Same feature set as a WinForms desktop version, minus filesystem access.
It's ideal if you can't or don't want to install .NET, if you're on Mac/Linux
running Destiny 2 via emulator, or if you want to share the tool with friends.

## Local development

```powershell
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

## Production build

```powershell
npm run build
npm run preview  # to test the built version locally
```

Output goes to `dist/`.

## Deploy to GitHub Pages

Included: [.github/workflows/deploy-web.yml](.github/workflows/deploy-web.yml).

1. Push to `main`.
2. In your repo's **Settings → Pages**, set **Source** to *GitHub Actions*.
3. The workflow builds and deploys automatically on every push to `main`.

The site uses relative URLs (`base: './'` in `vite.config.ts`), so it works from
any Pages subpath without configuration.

## Bungie API key (optional)

Custom-hash icons and names need a free Bungie API key. Grab one at
<https://www.bungie.net/en/Application>:

1. Create a new app.
2. Any name works. Set OAuth redirect URL to `https://localhost`.
3. Copy the **API Key**.
4. Paste it in the tool via **Settings…**.

The key stays in your browser's `localStorage`. It's never sent anywhere except
`bungie.net`.

## Safety rails

- **Nothing is uploaded.** All parsing and editing happens client-side.
- Every apply produces two downloads: a timestamped **backup** copy of what you
  loaded, plus the **modified** file.
- `plugs` is set to `null` automatically — safest choice per the mod's docs.
- Byte-level surgical edit: only the specific `definition_hash` and `plugs`
  spans are touched. All other whitespace, ordering, and formatting is
  preserved exactly.
- Bad hashes are rejected before they can reach the file.

## Data storage

Everything in-browser via `localStorage`:

| Key                            | Contents                                     |
| ------------------------------ | -------------------------------------------- |
| `sunrise-item-picker/config`   | Bungie API key                               |
| `sunrise-item-picker/catalog`  | Items you've saved via *Add to catalog*      |

Clear it via the browser's dev tools → Application → Local Storage.

## Workflow

1. Open the web app.
2. Drag `settings.json` onto the page (or click **Open settings.json…**).
3. Pick a character tab.
4. Click **Change…** on a slot. Paste a hash (decimal from light.gg or hex like
   `0x1234ABCD`) and hit **Look up**, or pick from your catalog.
5. Click **Use this hash**. The row goes amber.
6. Repeat for other slots.
7. Close Destiny 2.
8. Click **Preview &amp; download…** → **Download**.
9. Two files download: a `.bak.json` backup and the new `settings.json`.
10. Copy the new `settings.json` into your Sunrise folder
    (e.g. `D:\SunriseInstaller\D2\bin\x64\Sunrise\`), replacing the original.
11. Launch the mod + game.

## No `destiny2.exe` check

Unlike a desktop version, a browser can't detect whether Destiny 2 is running.
The tool shows a persistent reminder banner at the top instead. Just close the
game before overwriting the file.

## Tech stack

- React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- Vite 6
- No backend. No filesystem dependencies.

## License

MIT.
