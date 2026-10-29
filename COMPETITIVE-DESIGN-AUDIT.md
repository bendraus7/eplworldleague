# EPL World League — comparative design audit

Reviewed October 28, 2026. This is a design and interaction review of rendered public pages, not a Lighthouse benchmark or a claim about the sites' entire codebases. Browser views were checked at 1440px and 390px. Some third-party menus and widgets loaded slowly; observations below identify the pages actually inspected.

## Direction agreed with the league owner

Refine the EPL site people already recognize. It is a **league website**, centered on countries, players, season standings and the championship. Retain the globe, original posters, forest-to-black navigation, lime rule, six top-level tabs, and the compact homepage. Do not introduce an operations desk, a dashboard homepage, or an event-sales landing page. New controls should make the existing experience easier to use.

## Reference observations

### Major League Pickleball

Sources: [homepage](https://majorleaguepickleball.co/), [statistics](https://majorleaguepickleball.co/stats/), [Nations Cup event](https://majorleaguepickleball.co/events-2026/mlp-nations-cup/).

The homepage combines a score strip, strong condensed sports typography, a main feature and secondary routes. Teams, players, standings and statistics remain first-class destinations. The stats page puts team/player and competition-scope controls above the table. The mobile event page uses a large competition identity and contextual tabs.

Useful principles: strong league identity; quick movement between related competition surfaces; explicit season/event scopes. Avoid importing the dense top score carousel, abundant promotional layers, or tickets-first hierarchy into EPL. Loading states were observed before the stats table resolved; no performance score was measured. EPL has a smaller content inventory and should expose it without carousel navigation or pretend live scores.

### ATP Tour

Sources: [homepage](https://www.atptour.com/en), [rankings](https://www.atptour.com/en/rankings/singles), [player profile inspected](https://www.atptour.com/en/players/jannik-sinner/s0ag/overview).

ATP's homepage places editorial content beside score context. Rankings have explicit country/date controls and a recognizable player column. The profile leads with an athlete identity and numerical summary, followed by Overview, Bio, Activity, Stats and Ranking. Season and career figures have distinct labels. On mobile the identity, summary and section navigation remain recognizable.

Useful principles: legible numerical hierarchy, clear data scope, consistent athlete navigation, secondary information that supports the current task. Avoid copying ATP's advertising footprint, crowded utility navigation, tennis statistics, or proprietary assets. EPL should use its verified DUPR figures and tournament log, while keeping those separate from World League performance.

### The Spread — Chicago Pickleball League

Sources: [league](https://spreadpickleball.com/chicago-league/), [standings](https://spreadpickleball.com/chicago-league/standings/major/), [team](https://spreadpickleball.com/chicago-league/team/old-town-blaze/), [player](https://spreadpickleball.com/chicago-league/player/cj-robertson/), [match](https://spreadpickleball.com/chicago-league/match/2/).

The league page provides a player finder, venue, dated scoreboard, category MVPs and team records. Standings rows expand to reveal fixtures and a team link. Team profiles combine rosters and schedules; player records show game-level results. The match page makes the tie, winner and Dreambreaker outcome explicit and links each athlete.

The connected player → team → match journey is the strongest competitive lesson. The sampled profile has limited visual athlete identity, an empty bio and large stacked containers. On the 390px views, the wide wordmark projects beyond its containing banner and the fixed Help control competes with content. Public subpages emphasize back links rather than persistent league-wide navigation. These are observed examples, not universal claims about every route.

## EPL opportunities and implementation

| Area | Existing friction | Refined EPL treatment | Reference principle |
| --- | --- | --- | --- |
| League identity | Risk of replacing the site with a generic dashboard | Preserve globe, country artwork, typography and the homepage sequence | MLP competition identity |
| Navigation | Search only available after opening a directory | Discrete global search button, available on every league page | Spread lookup + ATP player discoverability |
| Search results | Country and player searches live on different pages | One searchable index of 16 countries and 64 players, with type/country labels | Connected competition journeys |
| Search interaction | Pointer-dependent discovery | Native modal, keyboard focus, Enter to open, Escape to close, optional slash shortcut | Accessible task navigation |
| Page hierarchy | Large mastheads delay useful controls | More compact forest mastheads and aligned white filter bars | ATP data hierarchy |
| Schedule | Dates live in a vertically repeated list | All five season dates visible together; upcoming/past and calendar retained | MLP season overview |
| Matchups | Event details do not expose the known team fixtures | Country-linked matchup cards grouped by actual time/session/court | Spread match connectivity |
| Teams | A poster and names without season context | Clear record label and direct team route; pending record remains honest | Spread identity + record |
| Team profile | Summary and DUPR information are below the primary journey | Compact roster/record strip, conference link and DUPR in roster cards | ATP identity summary |
| Players | 64 large posters are slow to scan numerically | Card/list choice plus name, country and DUPR sorting | ATP ranking scanability |
| Player profile | Useful existing tournament record requires scrolling | Labeled prior-Elite snapshot with record, rate and game count | ATP season/career separation |
| Standings | A long explanation precedes the actual standings | Concise seeding context, conference summary and readable table/card treatment | Scope clarity |
| Stats | Preseason missing values can feel unfinished | Explain record, regulation points and championship context without filling missing scores | Honest sports statistics |
| Mobile | Wide structures can become sideways-scrolling panels | Responsive cards, wrapping controls and contained imagery | Owner's explicit no-horizontal-scroll requirement |
| Sponsors | Need legitimacy without promotional clutter | Retain original sponsor artwork below the league tagline | Consistent partner hierarchy |

## Visual contract

Barlow Condensed remains the display face: athletic, compact and related to the supplied country posters. DM Sans remains the reading face. Forest and near-black establish league authority; lime is reserved for navigation, major actions and the match decider. White surfaces separate controls and statistical rows. Fine rules and square geometry echo court markings without turning each section into a diagram.

Keep expressive identity in headers and imagery; keep numbers quiet, aligned and legible. Use one coherent scale across directories, team profiles and player profiles. Prefer actual athlete art over anonymous decorative shapes. Preserve complete poster artwork. Short hover movement is sufficient; motion is never required to access content.

## Boundaries

No copied assets, invented testimonials, media stories, player facts, results, seeds or event URLs. Existing fixtures remain authoritative. A DUPR rating is a rating, not an EPL standing. Prior Elite tournament results remain explicitly labeled. No public rules document or PointBreak poster. No sign-in requirement for public browsing. Organizer writes and existing BracketMesh integration remain protected.

## Validation record

Local verification: 26 automated checks pass. All eight page types were checked at 320, 390, 759 and 1440px: one visible h1 per page and no root horizontal overflow. Schedule and standings menus fit at 320, 759 and 1440px without inner sideways scrolling. Calendar/list switching, conference/event filters, DUPR sorting, global search, keyboard dismissal, and player navigation were exercised. A long-name player profile was checked on mobile. See final delivery notes for build and production verification. Automated coverage targets search reachability, rating ordering, source-faithful fixture rendering and safe event links. Visual QA covers the homepage, all five main league sections, team/player profiles, both hover menus, modal search and mobile overflow.
