# Deldiet platform upgrade — 10 September 2026

## Delivered

- Coffee-led editorial homepage with the existing cinematic desktop/mobile film, product photography, interactive coffee moods, Brew Studio introduction, coffeehouse and Passport sections.
- Shared forest/cream/copper visual system, readable typography, responsive navigation, touch controls and reduced-motion support across the main destinations, Origin Bar, Origin Exchange, Passport and policy pages.
- Searchable tool directory on every route, with category filters and keyboard shortcut.
- Brew Studio with five method calculators, per-extraction handling, deadline-based persistent timer, guided steps, taste adjustments, ratings, saved brew history, repeat/delete and CSV export. The Passport Brew tab uses the same implementation.
- Personal collection with saved catalogue products, editable Brewprints, origin records, public request references, exports and manual private status lookup.
- Shop sorting and favourites filtering; homepage product quick views; Tasteprint preferences connected to Passport.
- Six full Field Journal articles with category filtering, reading panels, bookmarks, learning tables and source links.
- Designed recovery and missing-page screens.

## Defects addressed

- Passport no longer overwrites saved preferences during hydration or deletes other collection fields when taste/brewer changes.
- Main, Passport and Exchange cart hydration rejects malformed data; storage failures remain recoverable.
- Machine Match labels map to recognized Passport equipment.
- Brewprint save action persists a real recipe instead of only displaying a toast.
- Business action buttons open functional tools.
- Reservation validation rejects impossible and past dates in the St. John's timezone.
- Exchange quantities align with request validation; restored image/category keys cannot resolve inherited object properties.
- Request receipts preserve public history and offer explicit private receipt download. Lookup tokens are sent in a header by the UI.
- Unconfirmed network outcomes retain original retry keys in explicit recovery downloads, without asserting that the request definitely failed before saving.
- Private recovery data clears on navigation, after 60 seconds and on Origin Bar privacy resets; intentional aborts do not create recovery notices.
- Existing Cloudflare binding remains supported; a server-side D1 HTTP adapter is available for Vercel deployment.

## Verification

- TypeScript compilation passed.
- Production Next.js build passed for all routes.
- 16 automated behavioral checks passed, covering payload validation, mobile film availability, storage handling, date validity and the D1 adapter with real SQLite-backed query tests.
- Referenced local image/video existence and Git whitespace checks passed.
- No interactive desktop/mobile browser test was performed in this turn; responsive layouts were reviewed in source and compiled output.

## Remaining operational setup

The Vercel request database is not configured or verified live in this turn. See `request-service-setup.md` for the required server environment and database schema setup. The adapter is tested, but that is not proof of live persistence. The production API must continue returning an honest unavailable response until a durable database is connected.

Payment processing, account authentication/sync, automated email, staff request management, actual stock, confirmed event schedules and commercial fulfilment remain unconnected. This upgrade does not mark those concept services as production operations. Local collections and brew notes remain device-local, with export controls.

Existing assets and the original Sites metadata are preserved. Changes are published to the feature branch and Vercel preview through PR #5; production remains pending review.

## 11 September design revision

- Deleted the `/origins` route, its data and view state, and every link in navigation, footer, search, discovery and the journal. Origin Bar and Origin Exchange remain available.
- Rebuilt the homepage around a full-bleed coffee film, oversized headline, warm cream/copper/butter palette, asymmetrical photography, and the original Deldiet logo.
- Added a three-mood Daily Edit that changes the coffee, flavour notes and imagery; product actions open the existing variant picker and shared bag.
- Added a four-product everyday essentials collection with quick views, a Brew Studio feature, arched coffeehouse imagery, Passport and Journal destinations.
- Refined shared navigation, destination introductions and footer; provided responsive layouts and reduced-motion behaviour.
- Updated the optional Sites route expectations for the removed page and new homepage.
- Revision verification: production build and TypeScript passed with `/origins` absent from the route manifest; all 16 existing tests passed. Browser interaction testing has not been performed.
