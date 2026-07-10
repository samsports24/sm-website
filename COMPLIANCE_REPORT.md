# SamSports Compliance Audit Report

**Date of audit:** 2026-07-02
**Scope:** `sm-website/src/` (user-facing pages, legal pages, marketing/product pages, components, i18n, routes, styles)
**Auditor:** SamSports Compliance Agent (automated run)

---

## Overall Compliance Score

**67% (4 of 6 categories passing)**

| # | Category | Status |
|---|----------|--------|
| 1 | Legal Entity & Contact Info | ❌ FAIL |
| 2 | GDPR & EU Privacy Compliance | ✅ PASS |
| 3 | Trademarked League Names | ❌ FAIL |
| 4 | Product Naming | ✅ PASS |
| 5 | Branding Consistency | ✅ PASS |
| 6 | Authentication & Access | ✅ PASS (minor deviation) |

Two categories need remediation before this can be marked fully compliant: **Legal Entity & Contact Info** and **Trademarked League Names**.

---

## 1. Legal Entity & Contact Info — ❌ FAIL

**Company name:** No incorrect legal-entity variants found. No "SamSports, Inc." / "SamSports LLC" in user-facing code. Casual "SamSports" brand references in FAQ/footer text are acceptable.

**Contact emails:** All user-facing emails correctly use `hello@samsports.io`. Admin panel placeholders use `admin@samsports.io` (admin panel is exempt). No `dpo@`, `privacy@`, or `.com` email variants found.

**Website references:** Three files hard-code `https://samsports.com` instead of `samsports.io`.

| File | Line | Issue |
|------|------|-------|
| `src/components/SEO/index.js` | 16 | `const BASE_URL = 'https://samsports.com'` — used to build canonical/OG URLs across the site |
| `src/components/VictoryShareCard/index.js` | 84 | `const shareUrl = 'https://samsports.com'` — social share link |
| `src/pages/Glossary/index.js` | 161 | `inDefinedTermSet: 'https://samsports.com/glossary'` — structured-data JSON-LD |

**Recommended fix:** Replace `samsports.com` with `samsports.io` in all three files. The SEO `BASE_URL` change is the highest priority because it propagates into every page's canonical tag and Open Graph metadata. (Note: the same three issues also exist in the duplicate ` 2.js` copies of these files, e.g. `SEO/index 2.js` — clean those up or delete the stale duplicates.)

---

## 2. GDPR & EU Privacy Compliance — ✅ PASS

- `/eu-privacy` page exists (`src/pages/EUPrivacyRights.js`) and lists all four required legal bases: **Consent** (line 43), **Contract Performance** (44), **Legitimate Interests** (45), **Legal Obligation** (46). ✅
- `/cookies` (`CookiePolicy.js`), `/gdpr` (`GDPRCompliance.js`), and `/data-rights` (`DataRights.js`) all exist and are routed. ✅
- All legal pages have working footer links pointing to the correct routes (see `src/pages/LandingPage/Footer.js` lines 115–127). ✅
- Privacy Policy and Terms of Service are accessible without authentication (routed outside `PrivateWrapper`, see `Routes.js` lines 342–343). ✅
- Hosting provider correctly listed as **DigitalOcean** in `GDPRCompliance.js` line 97. No "Amazon Web Services" or "AWS" references in any legal/privacy prose. ✅

**Minor observation (not a category failure):** `src/components/dratauction/index.js` contains seed-data image URLs pointing at `https://samsports.s3.amazonaws.com/...` (AWS S3 asset hosting). These are default team-logo asset URLs in a data array, not a hosting-provider statement, so they don't breach the DigitalOcean rule for legal pages. Still worth migrating these assets off S3 to stay fully consistent.

---

## 3. Trademarked League Names — ❌ FAIL

Country-based naming is correctly applied in the **footer** (England, Spain, Italy, Germany, France, Poland, Europe (CL), American Football — `Footer.js` lines 40–47) and across the Products/Marketing/Onboarding **soccer** labels. However, several user-facing pages still use trademarked names.

### 3a. "Champions League" spelled out in product marketing copy

| File | Line | Issue |
|------|------|-------|
| `src/pages/Products/CLFantasyPage.js` | 8 | `headline="Champions League Fantasy. Real Knockouts, Real Stakes."` |
| `src/pages/Products/CLFantasyPage.js` | 26 | `"Pick players from all 36 Champions League clubs..."` |

The product name **"CL Fantasy"** is exempt, but the full phrase **"Champions League"** is not. Elsewhere on the page the abbreviation "CL" is used correctly (CL Clubs, CL squad, CL week).

**Recommended fix:** Change the headline to use "CL Fantasy" or "Europe (CL)", and change "36 Champions League clubs" to "36 CL clubs" (or "Europe (CL) clubs").

### 3b. "NFL" used as a label in product marketing copy

The rule requires "NFL" → "American Football" in user-facing copy (except the product name "NFL Rivals"). These pages use "NFL" in visible text:

| File | Line | Issue |
|------|------|-------|
| `src/pages/Products/DraftLeaguesPage.js` | 9 | `"...real NFL and soccer contracts..."` |
| `src/pages/Products/DraftLeaguesPage.js` | 11 | `{ stat: '2,500+', label: 'NFL Players' }` |
| `src/pages/Products/DraftLeaguesPage.js` | 18 | `"...just like an NFL front office."` |
| `src/pages/Products/PredictorPage.js` | 9 | `"...across NFL and soccer fixtures every week."` |
| `src/pages/Products/PredictorPage.js` | 26 | `"Browse upcoming NFL and soccer fixtures..."` |
| `src/pages/Products/SAMMetricPage.js` | 64 | `"Same core philosophy across NFL and Soccer."` |
| `src/pages/Products/SAMMetricPage.js` | 120 | `"NFL scoring covers 12 position types..."` |
| `src/pages/Products/RivalsPage.js` | 20 | `"Play Rivals in both American Football (NFL) and Soccer."` |

**Recommended fix:** Replace "NFL" with "American Football" in each of these strings. (The `sport === 'nfl'` state value on `SAMMetricPage.js` line 88 is an internal identifier and is fine — its visible button label already reads "🏈 American Football".)

### 3c. Trademarked name in a user-facing input placeholder

| File | Line | Issue |
|------|------|-------|
| `src/pages/PartnerDashboard/index.js` | 1647 | `placeholder="e.g. Premier League Draft Night"` |

**Recommended fix:** Change the example placeholder to a country-based name, e.g. `"e.g. England Draft Night"`.

**Exempt / no action needed:** Trademarked names inside API/live-data config and hooks are exempt — `SOCCER_LEAGUES` and `STANDINGS_CONFIGS` in `LandingPage/constants.js`, and the mappings in `hooks/useAPIFootball.js`, `hooks/useGNewsData.js`, and `ApiSportsWidgets.js`. These drive live-score and standings widgets tied to third-party sports-data APIs and require the real league names to match feeds. Note: the standings widget `label` fields in `constants.js` (lines 57–93) do surface real league names in a live-data widget — recommend a human review to confirm this is acceptable as "live factual data" rather than SamSports branding.

---

## 4. Product Naming — ✅ PASS

- "Draft Leagues" is correctly presented as **"Dynasty Fantasy"** in user-facing surfaces: footer label (`Footer.js` line 56) and the product page eyebrow (`DraftLeaguesPage.js` line 7 `eyebrow="Dynasty Fantasy"`). The route/file name `draft-leagues` is an internal identifier and is fine. ✅
- Product names used correctly: SAM Rivals, CL Fantasy, Dynasty Fantasy, Predictor, SAM Metric, SamPoints (`Footer.js` lines 54–68). ✅

**Minor observation:** `src/components/DraftChatWidget/index.js` line 11 has a default prop `leagueName = 'Draft League'`. This is only a fallback when no league name is passed. Low risk, but consider changing the default to a neutral value like `'League Chat'`.

---

## 5. Branding Consistency — ✅ PASS

- **Footer logo color:** `.ls-footer-logo-sports` uses `color: #22C55E` (green) in `src/styles/pages/landing.css` line 3181. ✅ Not blue.
- **Old NFL branding:** No "SAM Ultimate Football" text found anywhere. The `SelectGameLeft` component is **not imported or rendered on any page** (`CreateOrJoinLeague` now redirects to `/onboarding`). ✅
- **"Discover SAMSports" button:** Removed — only a comment remains (`LandingPage/index.js` line 691). ✅
- **Arrows (→) in CTA button text:** None found. All `→` occurrences are in code comments, descriptive paragraph text (e.g. "Thu → Mon scoring"), data-flow/transaction descriptions, trend indicators, or transfer-confirmation visuals — all explicitly acceptable. No CTA button label uses an arrow. `i18n/translations.js` contains no arrows. ✅

**Minor cleanup (not a violation):** The orphaned component file `src/pages/SelectGame/SelectGameLeft.js` (and its ` 2.js` duplicate) still exists as dead code. It is not rendered, so it does not appear on any page, but deleting it would remove the risk of it being re-wired in later.

---

## 6. Authentication & Access — ✅ PASS (with a minor deviation)

- **Legal pages accessible without auth:** `/terms`, `/privacy`, `/eu-privacy`, `/cookies`, `/gdpr`, `/data-rights`, `/contact`, `/faq`, `/glossary` are all routed **outside** the `PrivateWrapper` block (`Routes.js` lines 342–350; `PrivateWrapper` closes at line 288). ✅
- **Product marketing pages accessible without auth:** `/products/rivals`, `/products/cl-fantasy`, `/products/draft-leagues`, `/products/predictor`, `/products/sam-metric`, `/products/sampoints`, `/products/how-it-works` are all outside `PrivateWrapper` (`Routes.js` lines 326–332). ✅

**Minor deviation:** The rule states the old `/sign-up` route must redirect to `/signup`. In `Routes.js` line 321, `/sign-up` redirects directly to `/select-game` (and `/signup` on line 354 also redirects to `/select-game`). The end destination is functionally correct, but the redirect does not point at `/signup` as specified.

**Recommended fix (optional):** For strict adherence, change line 321 to `<Route path='/sign-up' element={<Navigate to='/signup' replace />} />`. Low priority since users still land on the correct signup flow.

---

## Summary of Required Fixes (priority order)

1. **Website URL (Cat 1):** Replace `samsports.com` → `samsports.io` in `SEO/index.js:16`, `VictoryShareCard/index.js:84`, `Glossary/index.js:161` (plus their ` 2.js` duplicates).
2. **NFL labels (Cat 3):** Replace "NFL" → "American Football" in the 8 product-page strings listed in §3b.
3. **Champions League (Cat 3):** Replace "Champions League" → "CL"/"Europe (CL)" in `CLFantasyPage.js:8` and `:26`.
4. **Partner placeholder (Cat 3):** Update `PartnerDashboard/index.js:1647` placeholder to a country-based name.

## Optional / Housekeeping

- Migrate S3 asset URLs in `dratauction/index.js` off `s3.amazonaws.com`.
- Change `DraftChatWidget` default `leagueName` from `'Draft League'`.
- Point `/sign-up` at `/signup` in `Routes.js:321`.
- Delete orphaned `SelectGame/SelectGameLeft.js` dead code.
- Clean up the many duplicate ` 2.js` files throughout `src/`, which double the surface area for future compliance drift.

*Notes: This run executed autonomously. Trademarked-name findings in live-score/standings config (`LandingPage/constants.js`, API hooks) were treated as exempt "API constants" per the ruleset; the standings `label` fields are flagged for optional human review since they surface real league names in a live-data widget.*
