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

## ⚠️ Important: Sunrise runs the August 2020 client

Sunrise ships with the **Season of Arrivals / Season 11** version of
Destiny 2. Only items that existed in the game **as of August 2020** will
actually equip. Newer items (anything from Beyond Light, Witch Queen,
Lightfall, Final Shape, seasonal exotics from 2021 onward, Stasis / Strand /
Prismatic subclasses, reissued weapons with new hashes, etc.) will silently
fail, display wrong, or leave the old item in place.

**Find valid hashes** by browsing light.gg with the Season 11 filter:

- [Season 11 weapons on light.gg](https://www.light.gg/db/all/weapons/?filter-fadv=season%3A11)

The Season 11 filter is a useful starting point but not perfect — it can
surface items introduced *later* in Season 11's runtime that don't exist in
the frozen Aug 2020 build. When in doubt, prefer items from earlier seasons
(Forsaken, Black Armory, Warmind, base game).

The built-in catalog only contains **10 well-known pre-Aug-2020 exotic weapons
with stable hashes** — no armor, no subclasses, no cosmetics, because those
went through major hash-changing reworks after Aug 2020.

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

## Bungie API key

A shared API key is bundled with the app so item lookup and icons work out of
the box — no setup, no dialog, nothing to configure.
The lookup queries Bungie's **current** manifest, not the frozen Aug 2020
one. That means a hash may resolve to a name/icon here that doesn't actually
exist in the Sunrise client. Cross-check via the light.gg Season 11 filter
before committing changes.
If you fork this repo and want your own key (for rate-limit isolation or
privacy), grab one at <https://www.bungie.net/en/Application> and swap the
single constant in [src/lib/bungieApi.ts](src/lib/bungieApi.ts):

```ts
export const DEFAULT_BUNGIE_API_KEY = 'YOUR_KEY_HERE';
```

Any redirect URL works for API-key-only use — the OAuth flow isn't used.

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
| `sunrise-item-picker/catalog`  | Items you've saved via *Add to catalog*      |

Clear it via the browser's dev tools → Application → Local Storage.

## Workflow

1. **Close Destiny 2** (this tool can't detect whether it's running, so
   remember to shut it down before overwriting `settings.json`).
2. Open the web app.
3. Drag `settings.json` onto the page (or click **Open settings.json…**).
   This auto-downloads a backup.
4. Pick a character tab and find the slot you want to change (`kinetic`,
   `energy`, `heavy`, `helmet`, `gauntlets`, `chest`, `legs`, `class_item`,
   `subclass`, etc.).
5. Click **Change…** on the slot.
6. Either pick from the starter catalog on the left, or paste a hash from
   [light.gg Season 11 weapons](https://www.light.gg/db/all/weapons/?filter-fadv=season%3A11)
   into the **Custom hash** field on the right.
   - Accepts either decimal (light.gg's default) or hex (`0x1234ABCD`).
   - Click **Look up** to fetch the name + icon.
7. Click **Use this hash**. The slot row goes amber.
8. Repeat for other slots.
9. Click **Preview & download…** → **Download**. Two files download: a
   `.bak.json` backup and the new `settings.json`.
10. Copy the new `settings.json` into your Sunrise folder
    (e.g. `D:\SunriseInstaller\D2\bin\x64\Sunrise\`), replacing the original.
11. Restart Sunrise, then launch Destiny 2.

Under the hood, each edit is a byte-level splice on just `definition_hash` and
`plugs`. `instance_soid`, `level`, and `quantity` are left untouched, exactly
as the FAQ recommends. `plugs` is set to `null` so the new item uses its
default sockets — the safest option per the mod's docs.

## Tech stack

- React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- Vite 6
- No backend. No filesystem dependencies.

## License

MIT.
