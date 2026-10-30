# Naogaon Tourism Map

A responsive React + TypeScript tourism dashboard with an anonymous travel-progress map for Naogaon District, Bangladesh. The catalogue currently contains 29 user-supplied places. It is not claimed to be a complete district tourism inventory.

## Requirements

- Node.js 20.19+ or 22.12+ (required by the current Vite version)
- npm

## Install and run

```sh
npm ci
npm run dev
```

Vite prints a local development URL when ready.

## Checks and production build

```sh
npm test
npm run lint
npm run build
npm run preview
```

`npm run build` performs the TypeScript project checks before creating the static site in `dist/`.

## Features

- Select among Naogaon's 11 sourced upazila boundaries; search and filter the verified attraction list.
- Select attractions from the list or the interactive SVG map, which renders the sourced district/upazila boundaries and attraction-associated GIS regions.
- Click an attraction region on the map to select the attraction, update its details, and toggle its visited state.
- Track unique verified visits locally in browser `localStorage`; no sign-in or account is required.
- Customize the map theme and track progress without an account.
- Use browser-native sharing where supported, download-and-upload guidance for Facebook, and an explicit local-progress reset action.

The optional account button is intentionally disabled: account creation, cloud backup, sync, and public journey links are not implemented. No personal journey information is sent to a server.

## Geographic data and attribution

Administrative geometry is bundled as static GeoJSON at `src/data/naogaon/unions.geojson`: 99 unions and 3 paurashavas of Naogaon, each with a Bengali name matched to the official upazila-wise union list. The district (ADM2) and 11 upazila (ADM3) outlines are dissolved from these areas at runtime (`src/gis/boundaries.ts`), so territory borders and outlines always agree. Source notes and the stated CC BY 3.0 IGO license are in `src/data/naogaon/sources.ts`.

The 29 user-supplied records in `src/data/naogaon/attractions.ts` are included in district progress at the project owner's instruction. Their coordinates were supplied by the project owner; Google Maps Place IDs are recorded as cited sources. Review applicable Google Maps terms and data-use permissions before public deployment or redistribution of Google-derived coordinates on a non-Google map. Two earlier needs-verification suggestions (Porsha Musafirkhana and Nitpur Central Jame Mosque) were not included in the supplied 21-record JSON and are not in the catalogue.

The mapped Somapura attraction footprint in `src/data/naogaon/attraction-geometries.geojson` is OpenStreetMap way 235843608. It is an OSM-mapped attraction footprint, not a cadastral or legal land boundary. Its coordinates and heritage status link to [OpenStreetMap](https://www.openstreetmap.org/way/235843608) and [UNESCO World Heritage Centre](https://whc.unesco.org/en/list/322/).

The center map uses the geographic SVG artwork shared with the poster renderer. Every attraction owns a territory made of whole union areas, so every internal border follows a real administrative boundary. `src/gis/territories.ts` grows territories outward from each attraction's pin through neighbouring unions: territories stay contiguous, never overlap, never cross an upazila border, and more important places (`importance` 1–3 in `attractions.ts`) receive proportionally more land. A place can carry extra pins (`territoryAnchors`) and extra upazilas (`alsoUpazilaIds`), which is how Ghuksir Beel is drawn in both Dhamoirhat and Patnitala while counting once. If two pins ever fall in one union, only that union is split along the midline between them. Territories are visual tracking areas, not site boundaries.

No map tiles or map library are used by the center map. The Somapura image is bundled locally and credited in the attraction details and poster renderer to Md. Ahsanul Haque Nayem under CC BY-SA 4.0, with its [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Aerial_view_of_Somapura_Mahavihara.jpg).

Do not add an attraction to the progress denominator without a stable ID, checked coordinates/upazila association, documented sources, and an explicit verification status. Do not present the schematic center-map polygons as actual site boundaries.

## Geographic data updates

No data download or environment setup is required to run the app: the current boundary and attraction files are bundled. To update them, review and record the source URL, source/update date, license, coordinate reference, feature IDs, and validation results. Keep the district and upazila GeoJSON in WGS84 longitude/latitude, preserve attraction IDs, and run `npm test` and `npm run build` after each update. Do not place private credentials or unverified records in the frontend bundle.

## Deployment: Vercel static hosting

The site is a static Vite application. `vercel.json` configures the Vite build and `dist/` output.

1. Push the project to a Git provider and import it into Vercel, or install/use the Vercel CLI.
2. For CLI deployment, run:

   ```sh
   npx vercel login
   npm ci
   npm test
   npm run lint
   npm run build
   npx vercel
   npx vercel --prod
   ```

3. In Vercel, confirm the project uses `npm ci` for install, `npm run build` for build, and `dist` as the output directory. These are also recorded in `vercel.json`.

There are currently **no required environment variables** and no database setup. Do not configure Supabase keys until an optional account/cloud-sync feature is implemented; any `VITE_*` value is public in a client bundle and is not a safe place for private secrets.

## Privacy and external services

Anonymous visited IDs and the selected map theme are saved in this browser's `localStorage`. Clearing browser storage removes them; use the dashboard reset action to clear visits. Local storage can be unavailable in private/restricted contexts, in which case the app warns and remains usable for the current session.

The Bengali web font is requested from Google Fonts, which receives normal network request metadata. No visit IDs are sent to that service.

## Current limitations

- The catalogue has 29 user-supplied verified places but is not a complete Naogaon tourism inventory. The data owner supplied the coordinates; confirm source permissions and visitor details before public launch.
- Union boundaries and verified union associations are not populated.
- Attraction polygons other than the mapped Somapura footprint are generated tracking territories, not verified physical site boundaries.
- Poster rendering/export code remains in the project, but its controls and preview are not presented in the dashboard.
- Account creation, cloud sync, public profiles, and shareable public journey links are not available.
- The Bengali web font requires internet access; the geographic SVG map does not rely on map tiles.
- Browser download and file-sharing behavior depends on browser permissions/capabilities; Web Share is best supported on secure origins.


## Place write-ups

Long-form history and location text for 28 places lives in `src/data/naogaon/place-details.json` (extracted from the project's Word document) and is loaded lazily by `src/components/PlaceDetails.tsx` when a place is selected. Kureghar Mango Resort and Paikbanda Sal Forest have no write-up yet.

## Known data issue

The bundled Somapura footprint (OpenStreetMap way 235843608) covers about 70 km2 and crosses into neighbouring upazilas, so it is not a true site outline. The territory generator skips mapped footprints that are not fully inside their upazila and logs a warning. Replace the polygon in `attraction-geometries.geojson` with the monastery outline to draw it on top of the territory.

## Explore Naogaon — site design and deployment

- **Brand, developer credit and Facebook link** live in `src/config/site.ts`. Put the page address in
  `facebookUrl` when the Facebook page exists; until then the footer shows "coming soon".
  The footer credit comes from `SITE.developer.name` ("Md Rayhan Ali").
- **Two languages (বাং / EN):** every piece of text is in `src/i18n/translations.ts`. The header switch changes the
  whole site, the map card and the downloaded poster. The choice is remembered in the browser.
  Add a new text as a new key there and use `t('key')`.
- **Page:** Hero (live district map) → Stats → Map studio → Footer. The map studio has the place list (rounded name
  chips coloured by the chosen theme), the theme row, photo, name and "place names" option, the poster-style map card,
  and the download button. The card on the page is the same poster that gets downloaded.
- Click a name or a map region to mark a place seen; click again to undo. Hovering a name highlights its region.
- "Place names" writes the name of every place you have marked, beside a red dot, without overlapping
  (`src/lib/labelLayout.ts`). The downloaded image is drawn by `rasterizeMapSvg` in `posterExport.ts`.
- The visitor's photo is resized in the browser and only used inside the poster; nothing is uploaded.
- Not shown right now but kept for later: the place write-ups (`place-details.json` and `PlaceDetails.tsx`).
- Deploy: `npm ci && npm run build`, then upload `dist/` (or connect the repo to Vercel; `vercel.json` is included).
