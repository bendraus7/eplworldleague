# EPL World League

Portable static league website for Elite Pickleball. The deployable site is entirely in `dist/`; no server, database, API keys, or build step is required. It can be hosted on ChatGPT Sites today and moved to any static host or custom domain later.

## Preview

From this directory run `python -m http.server 4173 --directory dist --bind 127.0.0.1` and open `http://127.0.0.1:4173`.

## Content

- `dist/data.js`: 16 countries, divisions, 64 player names and artwork. Names are transcribed from the supplied reveal artwork; confirm spelling with the organizer before public launch.
- `dist/app.js`: Home/Schedule/Standings/Teams/Players/Stats routing, Event 1 matchups, directory search and filters, roster and artwork viewers, featured-player rotation with manual controls and pause. Reduced-motion preferences disable autoplay by default; rotation also stops on other views and while the page is hidden.
- `dist/index.html`: page copy, event details, navigation, match rules.
- `dist/styles.css`: responsive visual design.
- `dist/league-views.css`: separate page views, top navigation, flags, player directory, stats layout and footer credit.
- `dist/assets/flags/`: local SVG flags from flag-icons 7.6.0 (MIT); license included. These replace country abbreviations across the site.
- The Home country directory wraps into eight, four, or two columns as the viewport narrows. Each flag and country name is one link to a dedicated `#team/<country>` page with the four players and team matchups.
- `dist/elite-brand.css`: Elite Pickleball's BracketMesh brand colors, used across headers, panels, buttons, text, and backgrounds. Primary `#123e2c`, secondary `#050806`, highlight `#7ee23b`, support `#285a43`, silver `#c3cbc7`, background `#e7ece9`. Verified October 26, 2026 using the live public organization response and the current GitHub `app/organizationBranding.ts` source. The public organization returned no custom branding override, so the Elite defaults apply.
- `dist/assets/event-01.ics`: calendar entry, 1–6 PM Central, November 21, 2026.
- `dist/assets/epl-logo.png`: organizer-supplied main EPL logo, used in the header, footer, roster dialog and browser icon.
- `dist/assets/bracketmesh-footer.png`: the official transparent BracketMesh footer logo from the BracketMesh site, shown beside “Powered by” on the footer's dark green background.
- `tools/prepare-assets.py`: converts the original local artwork into optimized WebP assets. Original files remain in the parent directory.

## Confirmed inputs

The supplied Event 1 schedule poster provides November 21, 2026, 1–6 PM Central; Pickled Batavia, 301 N. Randall Road, Batavia, IL 60510; two sessions; all 16 matches and court pairs; games to 11, win by two. The organizer confirmed use of the poster's EPL Point Break instead of the initial singles DreamBreaker description. At 2–2, the poster specifies two mixed players to 11, win by two; further procedural rules have not been added.

Divisions come from the supplied Atlantic/Pacific poster. Colombia is spelled correctly in site navigation while the original source folder named `Columbia` is preserved. Jersey numbers and rating-based seeds are not used as match standings.

BracketMesh is credited only in the footer as the event engine. Outbound BracketMesh calls to action have been removed at the organizer's request. This site does not yet import results from BracketMesh. Do not claim a live data connection until one has been implemented and verified.

Standings intentionally contain no fabricated rankings or scores. Future season dates, registration links, live results integration, and additional league policies can be added when confirmed.

## Migration

Upload the contents of `dist/` to the new host. All page routes are hash links and all runtime files use relative paths, so no rewrite rules are needed. Update the absolute Open Graph image origin in `dist/index.html` and this file's Site URL when the final domain is chosen. Google Fonts are loaded with system fallbacks; all league artwork is served locally.

Site project: `appgprj_6adf543dadd48191bb34ae0d9a3cb68a`

Expected origin: `https://epl-world-league.bendraus.chatgpt.site`

## Inspiration

Major League Pickleball (`https://majorleaguepickleball.co/`) for team-first sports presentation. The Spread Chicago League (`https://spreadpickleball.com/chicago-league/`) for practical player discovery, schedule and standings navigation. All league and player images are supplied EPL assets.
