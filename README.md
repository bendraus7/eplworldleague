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
- `data/identities.json`: 64 confirmed name/alias or organizer-approved exact-code matches from BracketMesh, verified October 26, 2026. Both code and numeric profile ID must agree. Ratings are retrieved from BracketMesh.
- `lib/player-api.ts`: API, BracketMesh cache, shared bios and organizer identity mappings.
- `lib/player-core.mjs`: authorization, validation and completed game extraction.
- `db/schema.ts`, `drizzle/`: schema-only D1 migrations. Never create tables from request handlers.
- `tools/prepare-assets.py`: optimizes originals into public/assets; originals remain in the parent folder.

## Player data

Directory ratings come from BracketMesh's published `/api/players`, cached ten minutes. Singles uses its profile snapshot API, refreshed when a player page is opened, with the original snapshot date displayed. Cached data is retained if BracketMesh is temporarily unavailable. These are BracketMesh's stored DUPR ratings, not a direct DUPR refresh.

Identity requires an exact DUPR code and numeric profile ID. The seven previously pending organizer-supplied codes were verified in the signed-in DUPR search by exact code, then imported into BracketMesh on October 26, 2026. All 64 roster accounts now have numeric DUPR profile IDs. Future unresolved organizer codes can be listed in data/pending-identities.json; a sync links only unique exact-code directory matches with valid, unused numeric profile IDs. William Bennett uses code 1N20Z3, profile 8060422295, verified age 55. Corrected roster names retain stable IDs to preserve profile links and bios. Organizers can search BracketMesh and select the correct account from a player's bio panel. Similar names are never silently assigned. The site reads BracketMesh ratings; its organizer-only Sync DUPR ratings button refreshes the complete league directory and safely links any newly available confirmed codes. It reports synced and pending counts. Same-origin JSON and an allowlisted organizer session are required; cached upstream failures do not report a successful refresh. The button syncs saved BracketMesh data, not DUPR sign-in. Fresh DUPR values were imported through BracketMesh’s owner-protected snapshot API; no BracketMesh source changes were required.

Prior Elite history comes from released, non-practice tournaments in the Elite feed and their public snapshots. Completed games are matched by DUPR code; pool and bracket games are included. Best-of-three series expand from individual scores; byes, ties, unfinished records and duplicate match IDs are excluded. Only games with recorded identities and scores can be shown. Cache failures retain prior data with a notice. Stats describe this log, not a complete DUPR career record.

Match logs label regular games as Elite tournament. World League games use an EPL badge, dark green card and lime edge. Competition filters combine with the event dropdown. Add each confirmed EPL event path to data/world-league-events.json when its BracketMesh event exists; classification uses exact event identity, never name guesses. This list is currently empty because no EPL event is connected. Other Elite player statistics exclude World League games.

EPL results are separate. The inaugural event has not been played, so league standings and season stats remain pending. Country fixtures appear on profiles; individual doubles pairings are unassigned. Connect the future EPL tournament specifically before populating league stats. Elite public event 7 is Octoberfest Part 2, not the November EPL event.

## League schedule and country results

`public/league-data.json` is the shared source for season events, country fixtures and country-match results. Schedule offers Upcoming/Past lists and a month calendar with accessible date controls. All times and the today marker use America/Chicago. Events move to Past after their end time. Event 1 has no BracketMesh URL yet; its confirmed date, venue, poster and calendar download remain available without a fabricated tournament link. Once created, set its `bracketMeshUrl` to the actual Elite event URL. List and calendar links then open that event; the player-history classifier also treats that exact path as World League.

Team pages retain their four-player rosters and show country-match statistics, result cards and upcoming matchups below. `results` is currently empty. A completed country result needs `id`, `eventId`, `teamAId`, `teamBId`, `status: completed`, `gamesA`, and `gamesB` totaling four doubles games. A 2–2 tie also needs `pointBreakWinnerId`. Optional `pointsA`/`pointsB` support point differential; missing point totals stay unavailable. Duplicate, incomplete or unresolved results are excluded. These are country team matches, not individual doubles tournament teams. Connect the actual EPL event/results from BracketMesh when available before filling this source; no past Elite doubles games are substituted as country results.

`public/season-model.mjs` contains date/calendar, fixture and result calculations; `public/season-view.mjs` renders the schedule and team panels. Player upcoming fixtures use the same source. The homepage globe uses a 140% background scale; the top caption sits directly over a shaded background.

The Schedule navigation dropdown (`public/schedule-nav.mjs`) uses that same event list. Mouse hover opens it; its toggle supports touch and keyboard, Escape and outside clicks close it. Each date links to its verified BracketMesh event URL when present, or `#schedule/<event-id>` to open the local event details. All announced events appear in date order; the full Schedule page retains upcoming/past and calendar views.

The shared sponsor band follows BracketMesh's Elite event layout. Proton, Fox Valley Orthopedics, and Nature’s Path Organic were verified against the Elite organization (`/api/organizations?slug=elite`) and BracketMesh organization branding on October 26, 2026. The original logos are copied unaltered from BracketMesh's `/elite/` assets into `public/assets/sponsors/`. No sponsor links are configured by the organization. This is a saved branding snapshot; refresh it when the organization changes sponsors.

## Shared bios and access

Bios and selected identities persist in D1 across browsers and deployments. Bios are escaped plain text, limited to 2,000 characters. Version checks prevent overwriting concurrent edits. Clearing a bio saves an empty value.

Production organizer access requires trusted Sites identity headers and an email in server-side `EPL_EDITOR_EMAILS`. The owner is configured through Sites; no credentials or owner email are stored in source. Missing identity, non-organizers, cross-origin writes and non-JSON requests are rejected. Read responses never expose audit IDs. Preserve the site's existing audience when deploying.

## League content

Event 1: Saturday, November 21, 2026, 1–6 PM Central; Pickled Batavia, 301 N. Randall Road, Batavia, IL 60510. The supplied poster defines all sessions, matches and court pairs. Each team has two men and two women. Matches include men's doubles, women's doubles and two mixed games, to 11, win by two. A 2–2 tie uses the confirmed EPL Point Break: both mixed pairs per team play one continuous game. The first pairs play until one team reaches 6; both second pairs then take over at that score and finish to 11, win by two. All four players participate.

Elite BracketMesh colors: primary #123e2c, secondary #050806, highlight #7ee23b, support #285a43, silver #c3cbc7, background #e7ece9. The supplied EPL logo is primary; the official BracketMesh logo is credited in the footer. Country SVGs are flag-icons assets (MIT license included).

## Domain migration

This version needs a Worker/server and D1 for player data and shared edits. A static-only upload cannot power ratings, profiles or bios. On Cloudflare, retain DB and ASSETS bindings and the Worker routes from the build; apply migrations and export/import all three D1 tables when moving. Configure authentication and organizer allowlists on the destination before enabling writes. Never trust browser-supplied oai-authenticated-user-* headers on an unprotected custom host: a trusted identity proxy must strip/replace them. Another backend can implement the same API routes.

Hash routes include #players, #player/robin-lee and #team/argentina. Update the Open Graph origin in public/index.html when selecting a domain.

Site: appgprj_6adf543dadd48191bb34ae0d9a3cb68a

Published origin: https://epl-world-league.bendraus.chatgpt.site
