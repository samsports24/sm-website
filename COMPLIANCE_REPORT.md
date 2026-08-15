# SamSports Compliance Audit Report

**Date of audit:** August 1, 2026
**Scope:** `sm-website/src/` (user-facing pages, legal pages, marketing/product pages, components, i18n, routes, styles)
**Run type:** Automated scheduled audit (SamSports Compliance Agent)

## Overall result

| # | Category | Status |
|---|----------|--------|
| 1 | Legal Entity & Contact Info | **FAIL** |
| 2 | GDPR & EU Privacy | **PASS** |
| 3 | Trademarked League Names | **FAIL** |
| 4 | Product Naming | **PASS** |
| 5 | Branding Consistency | **FAIL** |
| 6 | Authentication & Access | **PASS** |

**Compliance score: 50% (3 of 6 categories passing).**

Note on duplicates: many files have a macOS `" 2"` duplicate copy (e.g. `Footer 2.js`, `constants 2.js`). These are not imported by `Routes.js` and are not live, but they carry the same issues. Fixing the live file only is enough for compliance; deleting the stale `" 2"` copies is recommended for hygiene. Line references below point to the live files.

---

## 1. Legal Entity & Contact Info — FAIL

**What passed**
- No prohibited legal-entity names ("SamSports, Inc.", "SamSports LLC", etc.) found anywhere.
- All user-facing contact emails use `hello@samsports.io` (Privacy, Terms, EU Privacy, Cookies, GDPR, Data Rights, Contact, FAQ). No `dpo@`, `privacy@`, or `.com` email variants.
- `admin@samsports.io` appears only in the admin panel/login placeholder text, which is exempt.

**Violations — website references use `samsports.com` instead of `samsports.io`**

| File | Line | Issue |
|------|------|-------|
| `src/components/SEO/index.js` | 16 | `const BASE_URL = 'https://samsports.com'` — drives canonical URLs, Open Graph, and structured data across the whole site. Highest impact. |
| `src/components/VictoryShareCard/index.js` | 84 | `const shareUrl = 'https://samsports.com'` — appears in shared/viral content. |
| `src/pages/Glossary/index.js` | 161 | `inDefinedTermSet: 'https://samsports.com/glossary'` — structured-data reference. |

(Same issues also present in the `" 2"` duplicate copies of these files.)

**Recommended fix:** Replace `https://samsports.com` with `https://samsports.io` in all three files (and their `" 2"` duplicates). Prioritize `SEO/index.js` since it propagates to every page's meta tags.

---

## 2. GDPR & EU Privacy — PASS

**What passed**
- `/eu-privacy` exists and lists all four required legal bases: **Consent**, **Contract Performance**, **Legitimate Interests**, **Legal Obligation** (`EUPrivacyRights.js` lines 43–46).
- `/cookies`, `/gdpr`, and `/data-rights` pages all exist and are routed.
- All legal pages have working footer links (`Footer.js` lines 105–127: Terms, Privacy, EU Privacy, Cookie Policy, GDPR, Data Rights, Contact).
- Legal pages are routed **outside** `PrivateWrapper` (`Routes.js` lines 374–382), so Privacy and Terms are reachable without authentication.
- Hosting provider is correctly disclosed as **DigitalOcean** (`GDPRCompliance.js` line 97). No "Amazon Web Services / AWS" hosting claim anywhere in legal or marketing copy.

**Minor note (not a failure)**
- `src/components/dratauction/index.js` (lines ~43–62) contains seed image URLs on `samsports.s3.amazonaws.com` / `...s3.us-west-1.amazonaws.com`. These are asset URLs in demo data, not a hosting-provider statement, so they don't breach the "hosting is DigitalOcean" rule. Recommend migrating these images to DigitalOcean Spaces (or the `samsports.io` CDN) to avoid any AWS-branding perception.

---

## 3. Trademarked League Names — FAIL

The country-based naming convention is largely in place (e.g. `HowItWorksPage.js` uses England/Spain/Italy/Germany/France/Poland/Europe (CL); the footer uses American Football, England…Europe (CL)). But several user-facing surfaces still show official trademarked names.

**Violations — product marketing pages**

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/pages/Products/CLFantasyPage.js` | 8 | Headline: `"Champions League Fantasy. Real Knockouts, Real Stakes."` spells out the trademarked league. | Use the product name "CL Fantasy" (or "Europe (CL) Fantasy"), e.g. "CL Fantasy. Real Knockouts, Real Stakes." |
| `src/pages/Products/DraftLeaguesPage.js` | 9, 11, 18 | Uses "NFL" as a sport label: "real NFL and soccer contracts", "NFL Players", "NFL front office". | Replace label uses of "NFL" with "American Football". |
| `src/pages/Products/PredictorPage.js` | 9 | "across NFL and soccer fixtures". | "across American Football and soccer fixtures". |
| `src/pages/Products/SAMMetricPage.js` | 64, 120 | "across NFL and Soccer", "NFL scoring covers…". | "American Football". (Line 4 is a code comment — exempt.) |
| `src/pages/Products/RivalsPage.js` | 20 | "American Football (NFL)" still includes the trademarked term. | Drop the "(NFL)" — use "American Football". |

**Violations — landing page display labels (live scores / standings / news / articles)**

| File | Line(s) | Issue |
|------|---------|-------|
| `src/pages/LandingPage/constants.js` | 22–32 (`SOCCER_LEAGUES` names), 60–96 (`STANDINGS_CONFIGS` labels) | Renders "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Ekstraklasa", "Champions League" as user-facing chip/tab labels. |
| `src/pages/LandingPage/CustomWidgets.js` | ~618, ~1704 | `ZoneLegend label="Champions League"` shown in the standings widget. |
| `src/pages/LandingPage/NewsCarousel.js` | 5 | Hardcoded marketing title "Premier League 2025/26, Live Scores & Standings". |
| `src/pages/LandingPage/ArticlesWidget.js` | 6–9 | Display-label map outputs "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Ekstraklasa", "Champions League". |

**Fix:** Convert these display labels to the country-based scheme (Premier League→England, La Liga→Spain, Serie A→Italy, Bundesliga→Germany, Ligue 1→France, Ekstraklasa→Poland, Champions League→"Europe (CL)"). Where the widgets show real live match/standings data, either map to country names for the label or keep the affiliation disclaimer prominent.

**Borderline / likely exempt**
- `src/pages/LandingPage/hooks/useAPIFootball.js` (lines 51–66, 552–558) maps API-Football league IDs to names. This reads as an API/backend mapping (exempt). It already carries a `country` field per league, so if any of its `name` values are used for on-screen labels, switch those specific usages to `country`.

---

## 4. Product Naming — PASS

**What passed**
- "Draft Leagues" is presented as **Dynasty Fantasy** everywhere user-facing: `DraftLeaguesPage.js` eyebrow (line 7), footer link text (`Footer.js` line 56), and `HowItWorksPage.js` (line 162).
- Product names are correct and consistent: **SAM Rivals**, **CL Fantasy**, **Dynasty Fantasy**, **Predictor**, **SAM Metric**, **SamPoints** (verified in footer lines 54–68 and across product pages).

**Minor notes (not failures)**
- `src/components/DraftChatWidget/index.js` line 11 has a default prop `leagueName = 'Draft League'`. It's a fallback default rather than a displayed product label, but consider changing to "Dynasty Fantasy" for consistency.
- The URL slug `/products/draft-leagues` and component name `DraftLeaguesPage` retain the old name internally. URL slugs aren't user-facing labels, so this passes; renaming to `/products/dynasty-fantasy` (with a redirect) would be a nice-to-have.

---

## 5. Branding Consistency — FAIL

**What passed**
- **Old NFL branding:** the `SelectGameLeft` component (`pages/SelectGame/SelectGameLeft.js`) is **not imported or rendered anywhere** (confirmed no import in `SelectGame/index.js` or elsewhere), and it contains no "SAM Ultimate Football" text. `CreateOrJoinLeague/index.js` notes the old branding was removed. Recommend deleting the dead file, but there is no live violation.
- **Footer logo "SPORTS" color:** `.ls-footer-logo-sports` is `color: #22C55E` (green) in `styles/pages/landing.css` line 3198. Correct.
- **"Discover SAMSports" button:** removed; only a code comment remains (`LandingPage/index.js` line 755).

**Violations — arrow symbols (→) in CTA button/link text**

| File | Line | CTA text |
|------|------|----------|
| `src/pages/LandingPage/RightSidebar.js` | 338 | "Start drafting →" (landing-page CTA) |
| `src/pages/Fantasy/index.js` | 140, 167, 202, 315 | "Play now →", "Open →", "Enter Rivals →", "Mock this →" (public /fantasy page) |
| `src/pages/SportHub/index.js` | 265 | `{p.cta} →` inside a `<button>` |
| `src/pages/PlayerValues/KeepTradeCut.js` | 284 | `<button>Next three →</button>` |
| `src/pages/TeamTrade/NewTrade.js` | 1532, 1567, 1681 | "View all tips →", "View All Rules →", "View All →" |

**Fix:** Remove the trailing "→" from these CTA labels (use a CSS/icon arrow if a visual cue is wanted).

**Not violations (allowed uses of →):** code comments throughout (e.g. `InjuryReport/index.js`), data-flow/scoring windows ("Thu → Mon"), bracket visualizations ("WINNER → SAM BOWL"), and trend indicators (`WarRoom/Predictions.js` returns "→" for a flat trend).

---

## 6. Authentication & Access — PASS

**What passed**
- Legal pages (`/terms`, `/privacy`, `/eu-privacy`, `/cookies`, `/gdpr`, `/data-rights`, `/contact`, `/faq`, `/glossary`) are all routed **outside** `PrivateWrapper` (`Routes.js` lines 374–382) — accessible without authentication.
- Product marketing pages (`/products/rivals`, `/cl-fantasy`, `/draft-leagues`, `/predictor`, `/sam-metric`, `/sampoints`, `/how-it-works`) are routed outside `PrivateWrapper` (lines 350–356) — public.
- `/signup` redirects to `/select-game` (line 396).

**Minor note (not a failure)**
- The rule states the old `/sign-up` route "must redirect to `/signup`". Currently `/sign-up` redirects directly to `/select-game` (`Routes.js` line 345). The end destination is the same as `/signup` (which also points to `/select-game`), so the user experience is compliant, but the redirect target differs from the literal rule. If strict adherence is required, change line 345 to `<Navigate to='/signup' replace />`.

---

## Recommended remediation priority

1. **Website URL (`samsports.com` → `samsports.io`)** in `SEO/index.js`, `VictoryShareCard/index.js`, `Glossary/index.js`. Quick fix, high SEO/branding impact.
2. **"NFL" → "American Football"** and **"Champions League" → "CL Fantasy"/"Europe (CL)"** in the product pages (`CLFantasyPage`, `DraftLeaguesPage`, `PredictorPage`, `SAMMetricPage`, `RivalsPage`).
3. **Trademarked labels on the landing page** (`constants.js`, `CustomWidgets.js`, `NewsCarousel.js`, `ArticlesWidget.js`) → country-based names.
4. **Remove "→" from CTA labels** across `RightSidebar`, `Fantasy`, `SportHub`, `KeepTradeCut`, `NewTrade`.
5. **Hygiene:** delete the unused `SelectGameLeft.js`, align `/sign-up` redirect target, and remove stale `" 2"` duplicate files.

*No files were modified by this audit. This is a report of findings only.*
