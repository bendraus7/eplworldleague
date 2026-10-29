# EPL World League — design direction

## Overview

An international sports editorial, rooted in Elite Pickleball's established identity. The site serves players and spectators: find a country, explore a player, follow event dates, and understand championship seeding. The signature is **the country edition**: oversized condensed type, small numbered chapter labels, green court lines, and full-color country artwork framed by quiet surfaces. Expressive marketing leads into clear operational pages.

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

- Display: **Barlow Condensed**, 600–900, fallback `Arial Narrow`, Impact, sans-serif. Its narrow, athletic forms relate country posters to the interface. Uppercase for major chapter titles; sentence case for descriptive subheads.
- Body: **DM Sans**, 400–750, fallback sans-serif. Legible and restrained next to the artwork.
- Hero: fluid 80–152px, weight 800, line height .88. Page titles: fluid 60–100px. Section titles: 40–64px. Card titles: 24–32px. Body: 14–16px, line height 1.7. Metadata: 11–12px; labels 10–11px with modest tracking.
- Ratings and results use tabular numerals. Avoid tiny decorative copy, all-caps paragraphs, and oversized tracking.

## Layout

- Content width: 1320px maximum, fluid gutters from 20px mobile to 56px desktop. Spacing follows 8px increments, with 24/32px component gaps and 64/88px section rhythm.
- Homepage: dark split stage, white/lime headline, green globe behind rotating player cards; country links in visible rows; next-event rail; league introduction; two visual paths into teams and players, each featuring randomly selected artwork on every page load (excluding the previous selection in the same tab); format and PointBreak.
- Homepage reading sections use tighter 40–56px spacing. The league facts align near the top of the introduction. Above 1100px, the six regulation games form a two-column, three-row grid beside the format introduction, followed by a full-width PointBreak callout inside the list. Preserve reading order and stack on smaller screens.
- Schedule, Standings, Teams, Players, Stats: the same numbered forest masthead, then light controls and content. Operational pages prioritize readable data over imagery.
- Teams: four columns above 1100px, three above 800px, two on tablet/mobile, one below 360px. Artwork is contained in a portrait frame, never cropped. Player directories keep two columns on most phones, one below 360px.
- Team profiles: flag and title on a forest identity panel, four roster cards, then season stats and results. Player profiles: portrait beside identity and prominent DUPR rating; section navigation, main stats/history column, supporting bio column.
- At 650px and below, split layouts stack, player identity and DUPR appear before the portrait, page mastheads simplify, filters fill available width, and footer content stacks. Standings and team event totals become labeled record cards at 800px and below. Keep every statistic visible without horizontal scrolling; neither the page nor its panels should require sideways scrolling.

## Elevation & Depth

Mostly flat, with 1px borders and strong color blocks. Player artwork uses a restrained shadow in the homepage collage. Cards lift by 3px on hover with a subtle shadow. Menus float above content with a soft shadow. Avoid glass panels, repeated glows, and ornamental gradients.

## Shapes

Square panels and buttons; small 2px corners allowed for controls. Fine green dividing lines suggest a court without painting court diagrams on every surface. Direction arrows form a consistent link cue. No oversized rounded dashboard tiles.

## Components

- Header: official EPL logo and compact wordmark at left; six equal-width desktop tabs fill the remaining header width, with a lime active underline. The season strip and navigation use a forest-to-black gradient, starting green at the top edge; the homepage stage below the lime rule stays dark. Mobile tabs span the full row below the logo. Schedule dropdown retains all real event dates. Standings previews both conferences using the same regular-season model as the full page. Both menus support hover, arrow toggles, keyboard entry, Escape dismissal, and mutual exclusion; country rows link to their teams.
- Page masthead: chapter number, eyebrow, display title, concise supporting copy. Decorative chapter number is CSS-generated and nonessential.
- Filters: light surface, 44px minimum controls, forest selected segments, visible keyboard focus. Counts remain text, not decorative badges.
- Event rows: distinct date block, event name, phase/location/time, honest pending-link state. Championship has a forest edge; calendar uses the same palette.
- Team/player cards: complete supplied artwork, legible name, country flag, conference, roster or DUPR data. Preserve original imagery and names.
- Tables: night header, white rows, tabular numbers, subtle row hover, clear country links. Preserve real missing-value dashes and seed status.
- Empty states: explain what will appear and when; offer a useful route to upcoming events or standings. Stats includes a data-derived season timeline. Do not fill missing results with demo data.
- Player profile: forest identity panel, lime DUPR number, distinct World League history badge, quiet regular-tournament results. Bio editing stays organizer-only.
- Footer: EPL branding and tagline, sponsors underneath, then a full-width forest copyright / BracketMesh bar. BracketMesh logo links to its homepage. Sponsors retain their actual artwork.
- Motion: short opacity/position entrance and subtle hover feedback. Player rotation remains pausable. Honor `prefers-reduced-motion`; no hidden content depends on an animation.
- Focus: 3px forest outline on light surfaces; lime on dark, with 4px offset. Keep 44px touch targets, labeled inputs, a skip link, and one visible page h1.

## Do's and Don'ts

- Keep the official EPL logo, green globe, country flags, and player posters. Artwork supplies the visual richness.
- Apply the same type scale, mastheads, filter treatment, spacing, and empty-state language across every route.
- Preserve full artwork; do not use cover cropping for team or player posters.
- Keep overall season results separate from championship outcomes and ordinary Elite tournament history.
- Keep the site public without GPT sign-in. Protect existing organizer writes.
- Keep source, assets, and this contract portable. Do not add a public rules document or an artwork gallery.
