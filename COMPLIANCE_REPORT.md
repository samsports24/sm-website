# SamSports Compliance Audit Report

**Date of audit:** 2026-05-01
**Auditor:** SamSports Compliance Agent (automated scheduled run)
**Scope:** `sm-website/src/` — user-facing pages, legal pages, marketing pages, product pages, components, footer, routes, styles, translations.

---

## Summary

| # | Category | Status |
|---|---|---|
| 1 | Legal Entity & Contact Info | FAIL (3 violations) |
| 2 | GDPR & EU Privacy Compliance | PASS (1 informational note) |
| 3 | Trademarked League Names | FAIL (multiple violations) |
| 4 | Product Naming | PASS (1 informational note) |
| 5 | Branding Consistency | PASS |
| 6 | Authentication & Access | FAIL (1 minor violation) |

**Overall compliance score:** 3 / 6 categories fully passing = **50%**.

If partial passes are counted at half weight, the weighted score is approximately **58%**.

---

## 1. Legal Entity & Contact Info — FAIL

### Violations

| File | Line | Issue | Recommended fix |
|---|---|---|---|
| `src/components/SEO/index.js` | 16 | `const BASE_URL = 'https://samsports.com'` — uses `.com` instead of `.io`. | Change to `'https://samsports.io'`. |
| `src/components/VictoryShareCard/index.js` | 84 | `const shareUrl = 'https://samsports.com'` — uses `.com` instead of `.io`. | Change to `'https://samsports.io'`. |
| `src/pages/Glossary/index.js` | 161 | `inDefinedTermSet: 'https://samsports.com/glossary'` — uses `.com` instead of `.io` (appears in JSON-LD schema). | Change to `'https://samsports.io/glossary'`. |

### Items that PASS

- Company name `Samsports.io` is used in `EUPrivacyRights.js:32`, `Footer.js:108`, and across legal pages.
- All contact emails on user-facing pages use `hello@samsports.io` — no `dpo@`, `privacy@`, `legal@`, or `support@` variants found.
- Admin panel uses `admin@samsports.io` (admin panel is exempt per the policy).
- 111 occurrences of the correct `samsports.io` domain across 41 files.

---

## 2. GDPR & EU Privacy Compliance — PASS

### Items verified

- `/eu-privacy` route exists (`src/pages/EUPrivacyRights.js`) and lists the four required legal bases verbatim: **Consent, Contract Performance, Legitimate Interests, Legal Obligation** (lines 43–46).
- `/cookies` route exists (`src/pages/CookiePolicy.js`).
- `/gdpr` route exists (`src/pages/GDPRCompliance.js`).
- `/data-rights` route exists (`src/pages/DataRights.js`).
- Footer (`src/pages/LandingPage/Footer.js:92–106`) links to all six legal pages: Terms, Privacy, EU Privacy Rights, Cookie Policy, GDPR Compliance, Data Rights, Contact.
- Privacy Policy, Terms of Service, and all other legal routes are mounted **outside** the `PrivateWrapper` (`src/config/Routes.js:320–328`) — accessible without authentication.
- GDPR page lists hosting sub-processor as **DigitalOcean**, not AWS (`src/pages/GDPRCompliance.js:97`). No prose references to "Amazon Web Services" or "AWS" in legal pages or marketing copy.

### Informational note (not flagged as a violation)

- `src/components/dratauction/index.js` lines 42–73 contain image URLs hosted on `samsports.s3.amazonaws.com` (e.g., `https://samsports.s3.amazonaws.com/...png`). These are media assets, not text references to AWS, but the bucket lives on AWS S3 even though the marketing copy claims DigitalOcean is the sole hosting provider. Recommendation: migrate the bucket to DigitalOcean Spaces or otherwise rehost these assets to keep infrastructure consistent with the legal sub-processor list.

---

## 3. Trademarked League Names — FAIL

The rule requires user-facing labels to use country-based names. Internal config files (REAL_LEAGUES, API constants) and the admin panel are exempt. The following user-facing strings still use trademarked league names:

| File | Line | Offending text | Recommended fix |
|---|---|---|---|
| `src/soccer/pages/Quiz/index.js` | 21 | `label: 'Premier League'` | Change label to `'England'`. |
| `src/soccer/pages/Quiz/index.js` | 22 | `label: 'La Liga'` | Change label to `'Spain'`. |
| `src/soccer/pages/Quiz/index.js` | 23 | `label: 'Serie A'` | Change label to `'Italy'`. |
| `src/soccer/pages/Quiz/index.js` | 24 | `label: 'Bundesliga'` | Change label to `'Germany'`. |
| `src/soccer/pages/Quiz/index.js` | 25 | `label: 'Ligue 1'` | Change label to `'France'`. |
| `src/soccer/pages/Quiz/index.js` | 26 | `label: 'NFL'` | Change label to `'American Football'`. |
| `src/pages/LandingPage/index.js` | 410 | `'Champions League': 'UCL'` — UCL is still a trademarked abbreviation displayed as a badge. | Change displayed value to `'Europe (CL)'`. |
| `src/pages/LandingPage/index.js` | 412 | `'Premier League': 'EPL'` — `EPL` displayed as user-facing badge. | Change displayed value to `'England'`. |
| `src/pages/LandingPage/index.js` | 413 | `'La Liga': 'La Liga'` — displayed as user-facing badge. | Change displayed value to `'Spain'`. |
| `src/pages/LandingPage/index.js` | 414 | `'Bundesliga': 'BuLi'` — displayed as user-facing badge. | Change displayed value to `'Germany'`. |
| `src/pages/LandingPage/index.js` | 415 | `'Serie A': 'Serie A'` — displayed as user-facing badge. | Change displayed value to `'Italy'`. |
| `src/pages/LandingPage/index.js` | 416 | `'Ligue 1': 'Ligue 1'` — displayed as user-facing badge. | Change displayed value to `'France'`. |
| `src/pages/LandingPage/CustomWidgets.js` | 618 | `<ZoneLegend color={T.accent} label="Champions League" />` — user-facing legend label. | Change `label` prop to `"Europe (CL)"`. |
| `src/pages/LandingPage/CustomWidgets.js` | 1693 | Inline span renders `Champions League`. | Replace with `Europe (CL)`. |
| `src/pages/LandingPage/NewsCarousel.js` | 5 | Fallback slide title `'Premier League 2025/26, Live Scores & Standings'`. | Replace with country-based phrasing such as `'England 2025/26, Live Scores & Standings'`. |
| `src/pages/Products/CLFantasyPage.js` | 26 | "Pick players from all 36 **Champions League** clubs within your €1B budget." Body copy on a product page. | Replace with `'all 36 CL clubs'` or `'all 36 Europe (CL) clubs'`. (The `eyebrow="CL Fantasy"` and `headline` "Champions League Fantasy. Real Knockouts, Real Stakes." are borderline because the product is named "CL Fantasy" — recommendation: rephrase headline to `"CL Fantasy. Real Knockouts, Real Stakes."` to remove the trademarked full name.) |
| `src/pages/Products/CLFantasyPage.js` | 8 | Headline: `"Champions League Fantasy. Real Knockouts, Real Stakes."` | Rephrase as `"CL Fantasy. Real Knockouts, Real Stakes."`. |

### Items that PASS (correctly exempted)

- `src/pages/LandingPage/hooks/useAPIFootball.js` (API constants, internal config) — exempt.
- `src/pages/LandingPage/constants.js` (REAL_LEAGUES) — exempt.
- `src/pages/LandingPage/ApiSportsWidgets.js` (API key map, internal) — exempt.
- `src/pages/Admin/AdminPanel.jsx` (admin panel) — exempt.
- Code comments referencing `// EPL, La Liga, ...` in `useAPIFootball.js`, `CommunitySection.js`, `CreateSoccerLeague/index.js` — comments only, exempt.
- Footer disclaimer `"SamSports is not affiliated with the NFL, UEFA, or any sports league."` (`Footer.js:108`) — non-affiliation disclaimer is acceptable use.

### Informational note

- `src/pages/LandingPage/hooks/useGNewsData.js:130–133` uses NFL/Premier League/Champions League as the *search query string* sent to GNews. The string is not rendered to the user, so it is treated as internal config (acceptable). No change recommended.
- `src/pages/LandingPage/CommunitySection.js:28` is a quoted user testimonial that mentions "NFL General Manager experience". A direct quote may be considered fair use, but if the legal team wants strict compliance the testimonial could be edited to "American Football General Manager experience".

---

## 4. Product Naming — PASS

### Items verified

- "Dynasty Fantasy" is used as the product label everywhere user-facing:
  - `src/pages/LandingPage/Footer.js:46` — `>Dynasty Fantasy</a>`
  - `src/pages/Products/DraftLeaguesPage.js:7` — `eyebrow="Dynasty Fantasy"`
  - `src/pages/Products/HowItWorksPage.js:162` — `name: 'Dynasty Fantasy'`
  - `src/pages/Products/SamPointsPage.js:25` — `'Earn SamPoints in SAM Rivals, Dynasty Fantasy, CL Fantasy, and the Predictor.'`
- All approved product names appear correctly: SAM Rivals, CL Fantasy, Dynasty Fantasy, Predictor, SAM Metric, SamPoints.
- No occurrences of the user-facing label `Draft Leagues`. The only "Draft League" reference is in the default prop value of `DraftChatWidget` (see informational note below).

### Informational note (no fix required)

- `src/components/DraftChatWidget/index.js:11` declares `const DraftChatWidget = ({ leagueName = 'Draft League', ... })`. This default value is never rendered because all three call sites (`Postseason/SupplementalDraft.js:826`, `Postseason/RookieDraft.js:829`, `Draft/index.js:213`) pass an explicit `leagueName` prop. Recommendation: change the default to `'Dynasty Fantasy'` or `'Draft Chat'` for forward-safe consistency.

---

## 5. Branding Consistency — PASS

### Items verified

- **Old NFL branding (SelectGameLeft / "SAM Ultimate Football")**: no occurrences of `SAM Ultimate Football` anywhere in `src/`. The `SelectGameLeft` component still exists in `src/pages/SelectGame/SelectGameLeft.js` but is **not imported by any active page** (`SelectGame/index.js` uses its own `sg-logo-bar`; `CreateOrJoinLeague/index.js` redirects to `/onboarding` and explicitly notes "Old SelectGameLeft/Right branding removed"). Dead-code only — not user-visible. Optional cleanup: delete the unused component.
- **Footer logo "SPORTS" color**: `src/styles/pages/landing.css:3052–3058` defines `.ls-footer-logo-sports { color: #22C55E; }` — green, as required.
- **"Discover SAMSports" standalone button**: removed from the landing page. Only a code comment remains at `src/pages/LandingPage/index.js:669` (`{/* Discover SAMSports button removed — footer now handles About links */}`).
- **Arrow symbols (→) in CTA button text**: a regex sweep across `src/components/` and `src/pages/` for CTA-style strings followed by `→` returned **zero matches**. All 60+ uses of `→` are in code comments, data-flow descriptions (e.g., `'Thu → Mon scoring'` in `NFLRivals/Rulesbook.js:82`), bracket/status indicators (`Predictions.js:411`), or admin-panel documentation — all explicitly acceptable per the policy.
- **Translations**: `src/i18n/translations.js` was scanned for `→` and returned no matches.

---

## 6. Authentication & Access — PARTIAL FAIL

### Items verified

- Legal routes `/terms`, `/privacy`, `/eu-privacy`, `/cookies`, `/gdpr`, `/data-rights`, `/contact`, `/faq`, `/glossary` are mounted **outside** `<PrivateWrapper />` (`src/config/Routes.js:320–328`). Confirmed accessible without authentication. PASS.
- Product marketing routes `/products/rivals`, `/products/cl-fantasy`, `/products/draft-leagues`, `/products/predictor`, `/products/sam-metric`, `/products/sampoints`, `/products/how-it-works` are also outside `PrivateWrapper` (`src/config/Routes.js:310–316`). PASS.
- `PrivateWrapper` only wraps the in-product authenticated routes (lines 215–273).

### Violation

| File | Line | Issue | Recommended fix |
|---|---|---|---|
| `src/config/Routes.js` | 306 | `<Route path='/sign-up' element={<Navigate to='/select-game' replace />} />` — the old `/sign-up` route redirects directly to `/select-game` rather than to `/signup`. The compliance rule is `Old /sign-up route must redirect to /signup`. | Change line 306 to `<Route path='/sign-up' element={<Navigate to='/signup' replace />} />`. (The `/signup` route at line 332 already chains to `/select-game`, so end-user behaviour is preserved.) |

### Informational note (duplicate legal-page modules)

- The repository contains both `src/pages/PrivacyPolicy.js` and `src/pages/PrivacyPolicy/index.js`, and both `src/pages/TermsOfService.js` and `src/pages/TermsOfService/index.js`. Both folders and standalone files exist; Node module resolution will prefer the folder + `index.js`, leaving the standalone files dead. Not a compliance violation, but recommended cleanup to avoid future drift between two copies of the same legal content.

---

## Recommended Action Items (priority order)

1. **High (Cat 1)** — Replace three `samsports.com` URLs in `SEO/index.js`, `VictoryShareCard/index.js`, and `Glossary/index.js` with `samsports.io`.
2. **High (Cat 3)** — Update soccer Quiz league labels, landing page `shortTag` map, NewsCarousel fallback titles, CustomWidgets zone legend labels, and CL Fantasy product page body copy to use country-based names per policy.
3. **Medium (Cat 6)** — Change the `/sign-up` redirect target from `/select-game` to `/signup` in `Routes.js:306`.
4. **Medium (Cat 2 informational)** — Migrate S3-hosted draft auction images off `samsports.s3.amazonaws.com` so all hosting matches the DigitalOcean claim.
5. **Low (Cat 4 informational)** — Change `DraftChatWidget`'s default `leagueName` from `'Draft League'` to `'Dynasty Fantasy'` or `'Draft Chat'`.
6. **Low (Cat 5 housekeeping)** — Delete the orphaned `SelectGameLeft.js` and `SelectGameRight.js` components and reconcile duplicate `PrivacyPolicy.js`/`PrivacyPolicy/index.js` and `TermsOfService.js`/`TermsOfService/index.js` files.

---

*End of report — generated 2026-05-01.*
