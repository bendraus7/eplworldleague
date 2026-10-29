# EPL World League — design direction

## Overview

An international sports editorial, rooted in Elite Pickleball's established identity. The October 2026 comparative audit in `COMPETITIVE-DESIGN-AUDIT.md` informs a refinement of this league site, not a dashboard or an event-sales redesign. The site serves players and spectators: find a country, explore a player, follow event dates, and understand championship seeding. The signature is **the country edition**: oversized condensed type, small numbered chapter labels, green court lines, and full-color country artwork framed by quiet surfaces. Expressive marketing leads into clear operational pages.

This contract is implemented in `public/design.css`, with shared markup in `public/index.html`, `public/app.js`, `public/season-view.mjs`, and `public/profiles.js`. It refines the existing Barlow Condensed / DM Sans pairing and BracketMesh organization palette. All league logic, real player data, and event dates remain authoritative in their existing modules.

## Colors

| Role | Value | Use |
| --- | --- | --- |
| Night | `#050806` | Homepage stage, navigation, data table headings |
| Forest | `#123e2c` | Page mastheads, footer, primary actions |
| Court | `#285a43` | Supporting emphasis and borders on dark surfaces |
| Signal | `#7ee23b` | Active navigation, chapter marks, key moments |
| Canvas | `#edf0eb` | Main reading surface |
| Surface | `#ffffff` | Cards, filters, tables |
| Ink | `#142019` | Main text |
| Muted | `#52665a` | Metadata on light backgrounds |
| Rule | `#c9d2cb` | Quiet dividing lines |
| Silver | `#c3cbc7` | Metadata on night / forest |

Use white on forest or night, forest on white, and night on lime. Lime is an emphasis color, never small text on a light surface. Success uses forest with white; loss uses a warm muted surface with dark brown text. Never imply fabricated live results.

## Typography

- Masthead wordmark: **Cinzel**, 800, fallback Georgia / serif. The supplied league banner inspires the silver, beveled serif capitals in “Elite Pickleball,” paired with a spaced green “World League” subtitle. Reserve this treatment for the shared top banner; interface and editorial type retain their established roles.
- Display: **Barlow Condensed**, 600–900, fallback `Arial Narrow`, Impact, sans-serif. Its narrow, athletic forms relate country posters to the interface. Uppercase for major chapter titles; sentence case for descriptive subheads.
- Body: **DM Sans**, 400–750, fallback sans-serif. Legible and restrained next to the artwork.
- Hero: fluid 80–152px, weight 800, line height .88. Page titles: fluid 60–100px. Section titles: 40–64px. Card titles: 24–32px. Body: 14–16px, line height 1.7. Metadata: 11–12px; labels 10–11px with modest tracking.
- Ratings and results use tabular numerals. Avoid tiny decorative copy, all-caps paragraphs, and oversized tracking.

## Layout

- Content width: 1320px maximum, fluid gutters from 20px mobile to 56px desktop. Spacing follows 8px increments, with 24/32px component gaps and 40–56px reading-section rhythm. Mastheads stay compact so league content and controls appear early.
- Homepage: dark split stage, white/lime headline, green globe behind rotating player cards; country links in visible rows; next-event rail; league introduction; two visual paths into teams and players, each featuring randomly selected artwork on every page load (excluding the previous selection in the same tab); format and PointBreak.
- Homepage reading sections use tighter 40–56px spacing. The league facts align near the top of the introduction. Above 1100px, the six regulation games form a two-column, three-row grid beside the format introduction, followed by a full-width PointBreak callout inside the list. Preserve reading order and stack on smaller screens.
- Schedule, Standings, Teams, Players, Stats: the same numbered forest masthead, then light controls and content. Operational pages prioritize readable data over imagery.
- Teams: four columns above 1100px, three above 800px, two on tablet/mobile, one below 360px. Artwork is contained in a portrait frame, never cropped. Player directories keep two columns on most phones, one below 360px.
- Team profiles: flag and title on a forest identity panel, four roster cards, then season stats and results. Player profiles: portrait beside identity and prominent DUPR rating; section navigation, main stats/history column, supporting bio column.
- At 650px and below, split layouts stack, player identity and DUPR appear before the portrait, page mastheads simplify, filters fill available width, and footer content stacks. Standings remain a compact six-column table at every width; abbreviate labels on phones without turning rows into cards. Team event totals become labeled record cards at 800px and below. Keep every statistic visible without horizontal scrolling; neither the page nor its panels should require sideways scrolling.

## Elevation & Depth

Mostly flat, with 1px borders and strong color blocks. Player artwork uses a restrained shadow in the homepage collage. Cards lift by 3px on hover with a subtle shadow. Menus float above content with a soft shadow. Avoid glass panels, repeated glows, and ornamental gradients.

## Shapes

Square panels and buttons; small 2px corners allowed for controls. Fine green dividing lines suggest a court without painting court diagrams on every surface. Direction arrows form a consistent link cue. No oversized rounded dashboard tiles.

## Components

- Header: official EPL shield and full “Elite Pickleball / World League” silver-and-green wordmark at left, with “Powered by” and the existing Proton logo beneath. The supplied MLP screenshot informs a centered 1320px desktop masthead: sponsor branding, seven Barlow Condensed uppercase tabs including About, and search at right, with a lime active underline. Tabs have equal width on desktop; phones allocate more width to the three disclosure labels. The full-width background remains forest-to-black. The Proton mark uses a white treatment on the dark header; its original colors remain in the sponsor section. The wordmark scales to fit without truncating its name. The season strip and navigation use a forest-to-black gradient, starting green at the top edge; the homepage stage below the lime rule stays dark. At 1000px and below, tabs span the full row below the logo so the full name and navigation remain legible. Schedule dropdown retains all real event dates. Standings previews both conferences using the same regular-season model as the full page. The Teams preview lists all 16 country links alphabetically within Atlantic and Pacific conferences. All three menus support hover, arrow toggles, keyboard entry, Escape dismissal, and mutual exclusion; country rows link to their teams. Teams uses two columns on wider screens and a vertically scrollable single column on small phones, without horizontal overflow.
- League search: one discrete header button on every route opens a native modal indexing all 16 countries and 64 players. Results name the type and country; Enter opens the first result, Tab browses links, and Escape closes. Slash is an optional shortcut. Search is a utility, never a dashboard homepage.
- Page masthead: chapter number, eyebrow, display title, concise supporting copy. Decorative chapter number is CSS-generated and nonessential.
- About: chapter 07 uses the supplied `About/Elite_Pickleball_About_Us_Updated.docx` for organizational story, competition, World League, leadership, partnerships, community, and vision. Keep projected 2026 prizes clearly labeled as projected. Show Billy Kinney, Founder, first and Jen Limjoco, Executive Director, second in DOM and visual order. Use the supplied photographs unchanged, with face-aware CSS crops in matching photo panels; stack in that order on phones. A four-fact rail and a forest World League panel break up the reading. Preserve document roles and claims without inventing founder biographies or accomplishments.
- Navigation on very narrow phones: below 360px, the seven tabs wrap into two full-width rows (four then three) to preserve readable labels and disclosure controls. All wider phones retain one row; no horizontal scrolling.
- Filters: light surface, 44px minimum controls, forest selected segments, visible keyboard focus. Counts remain text, not decorative badges.
- Schedule season strip: show all five source dates together; wrap into rows on mobile, with the World Championship distinguished in forest. Real BracketMesh destinations are used when available; otherwise open local details. No horizontal carousel.
- Event rows: distinct date block, event name, phase/location/time, honest pending-link state. Championship has a forest edge; calendar uses the same palette. Known team matchups appear in event details as paired country links, grouped by their actual court, session and time. Preserve unassigned future fixtures.
- Team/player cards: complete supplied artwork, legible name, country flag, conference, roster or DUPR data. Team cards label the regular-season record. Player directories offer cards or compact rows and sorting by name, country or verified DUPR, with unknown ratings last. Preserve original imagery and names.
- Standings: a cumulative regular-season table is the primary view, with conference tabs and columns for projected seed, country, played, wins, losses, and regulation point differential. Every regular-season event adds to the same record. Use the championship seeding model for row order; retain pending values and unresolved ties honestly. Individual event results live in Schedule. Keep the masthead compact and avoid summary cards above the table. Team profiles add a compact roster/season-record strip and a conference link.
- Tables: forest header, white rows, tabular numbers, subtle row hover, clear country links. Preserve real missing-value dashes and seed status.
- Empty states: explain what will appear and when; offer a useful route to upcoming events or standings. Stats includes a data-derived season timeline. Do not fill missing results with demo data.
- Player profile: forest identity panel, lime DUPR number, distinct World League history badge, quiet regular-tournament results. A clearly labeled prior-Elite snapshot makes the available tournament record visible before the detailed sections. It never represents World League performance. Bio editing stays organizer-only.
- League partners: prominence follows Platinum > Gold > Silver > Bronze, with equal exposure inside each tier. Proton retains the header endorsement, a dedicated oversized homepage feature, the largest full-width footer placement, and the Partners page feature. The three Gold partners share the homepage alongside Proton and have larger footer cards. All nine Silver and three Bronze partners appear in progressively smaller footer grids on every route. The dedicated #partners page uses one Platinum feature, three Gold cards, four-column Silver cards, and a narrower Bronze row on desktop. Tier bands and card name panels use prominent platinum, gold, silver, and bronze colors while the surrounding page retains EPL green and white surfaces. Supplied logos are contained and optically balanced; white marks use dark panels. All partner websites open in a labeled new tab. Tier jump links and grids wrap on phones; no carousel or horizontal scrolling. Reach the page from the homepage, desktop season strip, and footer without crowding the seven primary navigation tabs. The previous three-logo event strip is replaced by this shared, data-driven league partner display.
- Footer: EPL branding and tagline, sponsors underneath, then a full-width forest copyright / BracketMesh bar. BracketMesh logo links to its homepage. Sponsors retain their actual artwork.
- Partner tier colors: make levels visible through metallic heading bands, 5px card tops, tinted name panels, and a dark circular external-link arrow. Platinum uses cool blue-gray (#77939f accent, #e4edf1 name panel, #263e49 ink); Gold uses rich gold (#bd8b24, #f6e9c5, #3f2b09); Silver uses steel gray (#7b8998, #e1e6ed, #293642); Bronze uses warm copper (#b66d3e, #f0d9c7, #31180c). Metallic gradients are reserved for tier bands, the tier jump links, and Platinum features. Preserve white or black logo areas so sponsor artwork keeps its own colors. Apply the same treatment on the homepage, Partners page, and shared footer. Hover/focus sharpens the border and lifts the card; reduced motion removes movement. Keep all sponsor destinations and the existing tier size hierarchy.
- Motion: short opacity/position entrance and subtle hover feedback. Player rotation remains pausable. Honor `prefers-reduced-motion`; no hidden content depends on an animation.
- Focus: 3px forest outline on light surfaces; lime on dark, with 4px offset. Keep 44px touch targets, labeled inputs, a skip link, and one visible page h1.

## Do's and Don'ts

- Refine the established league presentation; do not turn the homepage into an event promotion, operations desk or generic dashboard.
- Keep the official EPL logo, green globe, country flags, and player posters. Artwork supplies the visual richness.
- Apply the same type scale, mastheads, filter treatment, spacing, and empty-state language across every route.
- Preserve full artwork; do not use cover cropping for team or player posters.
- Keep overall season results separate from championship outcomes and ordinary Elite tournament history.
- Keep the site public without GPT sign-in. Protect existing organizer writes.
- Keep source, assets, and this contract portable. Do not add a public rules document or an artwork gallery.
