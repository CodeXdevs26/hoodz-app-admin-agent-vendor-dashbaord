# Hoodz Dashboard — Review & Changes

This document summarizes everything reviewed and changed: vendor-dashboard
translation (EN/AR), security hardening, and loading-state cleanup.

## 1. Vendor Dashboard Translation (EN/AR) — the main request

**No Google Translate / no external API.** All strings live in two local
JSON files and are swapped client-side.

- `src/locales/en.json`, `src/locales/ar.json` — 325 matching keys each,
  covering the sidebar, header, dashboard overview, products, orders, POS
  (sell + orders tab + cart + variant picker), voucher, transaction, and
  privacy/terms pages.
- `src/context/LanguageContext.jsx` — `LanguageProvider` + `useLanguage()`
  hook. Exposes `t(key, params)` (supports `{{placeholder}}`
  interpolation), `locale`, `setLocale`, `isRtl`. Persists the choice in
  `localStorage` under `hoodz_vendor_locale`.
- `src/components/LanguageSwitcher/LanguageSwitcher.jsx` — the EN/AR
  toggle, rendered in the header **only when the logged-in user's role is
  `vendor`**. Admin and agent never see it and always render in English/LTR.
- `src/app/admin/layout.js` — when (and only when) the role is `vendor`
  **and** Arabic is selected, the layout switches to `dir="rtl"`, antd's
  `ConfigProvider direction="rtl"` (so Table/Pagination/DatePicker etc. also
  flip and use antd's Arabic locale pack), and loads a Google-hosted Arabic
  font (`Tajawal`) on demand.
- Translated end-to-end: Sidebar, Header, Dashboard Overview (stats +
  charts), Orders (table + the full order-details modal, including the
  delivery/timeline steppers), Products (stats, filters, table, product
  details modal, description rendering), Voucher (table + statuses), POS
  (sell tab, cart panel, variant picker, product grid, category tabs,
  orders tab + its details modal), Transaction (list + details modal),
  Privacy Policy and Terms & Conditions.
- **Not yet translated** (flagged as a follow-up, same pattern applies):
  the multi-field Create/Edit Product form and the Add/Edit Voucher forms.
  These are long forms with many inputs; extending them just means adding
  keys to the two JSON files and swapping `label`/`placeholder` strings for
  `t("...")` calls the same way it's done elsewhere.

## 2. Security fixes

| Issue | Fix |
|---|---|
| `middleware.js` only checked *"is there a token cookie"*, not the user's **role** — any logged-in vendor/agent could type an admin URL and the page would render (an API call might then 403, but the route itself wasn't guarded) | Middleware now decodes the JWT and enforces per-role access: `/admin/vendor/*` → vendor only, `/admin/agent/*` → agent only, everything else under `/admin/*` → admin only (with a small shared allowlist for `/admin/profile`, `/admin/notification`, `/admin/order-details`). Invalid/expired tokens are treated as logged-out and the stale cookie is cleared. Also fixed dead code: the `x-pathname` header was built but never attached to the response. |
| `baseApi.js`: a leftover `forgetPasswordToken` in `localStorage` would **silently override the real `Authorization` header on every request**, for every logged-in user, for as long as it stayed in storage | Pre-auth tokens (`signupToken`, `guestToken`, `forgetPasswordToken`) are now only read when there is **no** authenticated session. A real logged-in token always wins. Also added `typeof window !== "undefined"` guards so this can't throw during SSR. |
| No security headers at all | Added CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and disabled `X-Powered-By` in `next.config.mjs`. |
| `images.remotePatterns.hostname: "**"` — the Next.js image optimizer would proxy-fetch **any** remote URL, which is an SSRF/abuse vector | Left functional but flagged with a `TODO` to scope it to your actual CDN/image host(s) once known — a wildcard should not ship to production. |
| Several `dangerouslySetInnerHTML` calls rendering rich-text straight from the API (privacy policy, terms, product descriptions) — a **stored-XSS** vector for any account that can edit that content | Added `src/components/SafeHtml/SafeHtml.jsx` (DOMPurify-based) and replaced every raw usage in the app (vendor + agent privacy/terms pages, product description) with it. |
| Auth cookie had no `SameSite`/`Secure` flags | `authSlice.js` now sets `sameSite: "strict"` and `secure` in production. Documented inline that the durable fix is for the backend to issue the session as an **httpOnly** cookie instead of a client-readable bearer token — that's a backend change, out of scope here, but flagged clearly in the code comment. |
| Leftover debug `console.log`s (including a stray `console.log("sdfsdf")`) scattered across the app | Removed. |
| Dead/unused duplicate `src/app/admin/vendor/SidebarContainer.js` (not imported anywhere, confusing to maintain alongside the real shared one) | Deleted. |
| No `.env.example` for onboarding | Added, listing the three env vars the app actually reads (`NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`). |

**New dependency:** `dompurify` (added to `package.json` — run `npm install`
before building).

## 3. Loading states → skeletons

Added reusable components in `src/components/Skeletons/`:
`StatCardsSkeleton`, `ChartCardSkeleton`, `TableSkeleton`, `PageSkeleton`.

Replaced bare `<Spin />` spinners with shaped skeletons (so the layout
doesn't jump once data arrives) in: the global route `loading.js`, Vendor
Dashboard Overview, Orders table + details modal, Products list, POS
product grid + orders tab + order-details modal, Voucher table,
Transaction list + details modal, and the Privacy Policy / Terms pages.

## 4. Verification

- Both locale JSON files are valid and have **identical key sets** (325
  keys each — verified programmatically).
- Every JavaScript/JSX file under `src/`, plus `next.config.mjs`, was
  parsed with Babel to confirm there are no syntax errors from these edits.
- `dompurify` was confirmed to resolve on the npm registry.

This wasn't run through a full `npm install && npm run build` in this
environment (no access to your backend/env values), so please do one
build/smoke-test pass before deploying — in particular click through the
vendor dashboard in both languages and confirm the CSP in
`next.config.mjs` doesn't block anything specific to your actual API/CDN
domains (loosen the `connect-src`/`img-src` list if needed).
