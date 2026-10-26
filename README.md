# EPL World League

Elite Pickleball's 2026–2027 league website, with 16 country teams and 64 player profiles. Hosted on ChatGPT Sites; source is mirrored to bendraus7/eplworldleague.

## Development

Use Node 22.13+ and npm. Run `npm ci`, then `npm run build`. Apply the schema locally with `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_bent_puck.sql`. Run `npm run dev -- --host 127.0.0.1 --port 4173`.

For local organizer testing, set `EPL_EDITOR_EMAILS=seedy@sites.test` in ignored `.dev.vars` and visit `/signin-with-chatgpt?return_to=/`. This is the supplied Sites loopback-only mock sign-in, absent from production. Never configure that mock email as a production organizer.

`npm test` covers identity matching, authorization, validation and history extraction. `node node_modules/typescript/bin/tsc --noEmit` checks types. Build and package with the installed Sites helpers.

## Source

- `public/`: authored presentation and optimized local artwork. `dist/` is generated output.
- `public/app.js`: league and team views, schedule, filters, flags and rotating hero.
- `public/profiles.js`: directory ratings, profiles, match logs, stats and organizer tools.
- `data/roster.json` and `public/data.js`: matching stable player IDs, rosters and artwork. Keep IDs consistent.
- `data/identities.json`: 46 initial exact name/alias matches from BracketMesh, verified October 26, 2026. Both code and numeric profile ID must agree. Ratings are retrieved from BracketMesh.
- `lib/player-api.ts`: API, BracketMesh cache, shared bios and organizer identity mappings.
- `lib/player-core.mjs`: authorization, validation and completed game extraction.
- `db/schema.ts`, `drizzle/`: schema-only D1 migrations. Never create tables from request handlers.
- `tools/prepare-assets.py`: optimizes originals into public/assets; originals remain in the parent folder.

## Player data

Directory ratings come from BracketMesh's published `/api/players`, cached ten minutes. Singles uses its profile snapshot API, cached one hour, with the original snapshot date displayed. These are BracketMesh's stored DUPR ratings, not a direct DUPR refresh.

Identity requires an exact DUPR code and numeric profile ID. Unresolved players stay unlinked. Organizers can search BracketMesh and select the correct account from a player's bio panel. Similar names are never silently assigned. This integration makes no BracketMesh database writes or backend changes.

Prior Elite history comes from released, non-practice tournaments in the Elite feed and their public snapshots. Completed games are matched by DUPR code; pool and bracket games are included. Best-of-three series expand from individual scores; byes, ties, unfinished records and duplicate match IDs are excluded. Only games with recorded identities and scores can be shown. Cache failures retain prior data with a notice. Stats describe this log, not a complete DUPR career record.

EPL results are separate. The inaugural event has not been played, so league standings and season stats remain pending. Country fixtures appear on profiles; individual doubles pairings are unassigned. Connect the future EPL tournament specifically before populating league stats. Elite public event 7 is Octoberfest Part 2, not the November EPL event.

## Shared bios and access

Bios and selected identities persist in D1 across browsers and deployments. Bios are escaped plain text, limited to 2,000 characters. Version checks prevent overwriting concurrent edits. Clearing a bio saves an empty value.

Production organizer access requires trusted Sites identity headers and an email in server-side `EPL_EDITOR_EMAILS`. The owner is configured through Sites; no credentials or owner email are stored in source. Missing identity, non-organizers, cross-origin writes and non-JSON requests are rejected. Read responses never expose audit IDs. Preserve the site's existing audience when deploying.

## League content

Event 1: Saturday, November 21, 2026, 1–6 PM Central; Pickled Batavia, 301 N. Randall Road, Batavia, IL 60510. The supplied poster defines all sessions, matches and court pairs. Each team has two men and two women. Matches include men's doubles, women's doubles and two mixed games, to 11, win by two. A 2–2 tie uses the confirmed EPL Point Break: two mixed players to 11, win by two.

Elite BracketMesh colors: primary #123e2c, secondary #050806, highlight #7ee23b, support #285a43, silver #c3cbc7, background #e7ece9. The supplied EPL logo is primary; the official BracketMesh logo is credited in the footer. Country SVGs are flag-icons assets (MIT license included).

## Domain migration

This version needs a Worker/server and D1 for player data and shared edits. A static-only upload cannot power ratings, profiles or bios. On Cloudflare, retain DB and ASSETS bindings and the Worker routes from the build; apply migrations and export/import all three D1 tables when moving. Configure authentication and organizer allowlists on the destination before enabling writes. Never trust browser-supplied oai-authenticated-user-* headers on an unprotected custom host: a trusted identity proxy must strip/replace them. Another backend can implement the same API routes.

Hash routes include #players, #player/robin-lee and #team/argentina. Update the Open Graph origin in public/index.html when selecting a domain.

Site: appgprj_6adf543dadd48191bb34ae0d9a3cb68a

Published origin: https://epl-world-league.bendraus.chatgpt.site
