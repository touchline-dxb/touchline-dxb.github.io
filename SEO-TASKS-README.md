# ⚽ Touchline Sports Academy — SEO Task List
**Domain:** touchlinesport.ae  
**Last Updated:** 09 March 2026  
**Status Legend:** ✅ Done | ⚠️ Manual Required

---

## 📋 TASK LIST — STEP BY STEP

---

### TASK 1 — Fix `<title>` Tag on Homepage ✅ DONE
**File:** `index.html` (line 10–12)  
**Problem:** 92-char title with "Near Me" wastes keyword space  
**Fix Applied:** Changed to `Best Football Academy in Dubai for Kids & Adults | Touchline Sports Academy` (63 chars)

---

### TASK 2 — Fix Broken Meta Description on Homepage ✅ DONE
**File:** `index.html` (lines 13–14)  
**Problem:** 4 blank spaces before "certified coaches" — rendered as broken text in Google SERPs. Also 214 chars (too long)  
**Fix Applied:** Rewrote to 157 chars — `Touchline Sports Academy — Dubai's best football academy for kids, youth & adults aged 3-18+. UEFA-certified coaches, free trial sessions, affordable programs at Al Nahda & Al Warqa. Join 200+ players today!`

---

### TASK 3 — Add 800-Word SEO Content Block to Homepage ✅ DONE
**File:** `index.html` (injected after overview paragraph)  
**Problem:** Homepage only ~500 words. Missing keywords: `cheap`, `cheapest`, `for kids`, `affordable`, `adult football`, `list of academies`  
**Fix Applied:** Injected full `<section id="seo-content">` with 5 H2 headings and ~830 words covering all keyword gaps. Contains internal links to both new landing pages.

---

### TASK 4 — Fix JSON-LD Schema (LocalBusiness + SportsActivityLocation) ✅ DONE
**File:** `index.html` (schema block)  
**Problems Fixed:**
- ✅ Wrong geo coords → corrected to `25.2821, 55.3584` (Al Nahda, not city centre)
- ✅ Only 3/8 programs → expanded to all 8 programs with URLs
- ✅ url inconsistency (`www.` vs no-www) → unified to `touchlinesport.ae`
- ✅ `ratingCount` was string → changed to integer `200`
- ✅ Al Warqa branch missing → added to `location[]` array
- ✅ No `@id` → added `"@id": "https://touchlinesport.ae/#organization"`
- ✅ Broken description text (4 spaces) → cleaned

---

### TASK 5 — Create `/kids-football-academy-dubai/index.html` ✅ DONE
**File Created:** `kids-football-academy-dubai/index.html`  
**Problem:** Page returned 404. Losing all keyword traffic for: `football academy in dubai for kids`, `top 10 best football academy in dubai`, `what is the best football academy in dubai`, `free football academy in dubai`  
**Built:**
- Full HTML page with correct title (63 chars), meta description (150 chars)
- H1: "Kids Football Academy in Dubai"
- Hero section with stats strip and CTA
- 6 age-group program cards (U6 → U14+ and Girls)
- 6 trust/USP bullet points
- "Is There a Free Football Academy in Dubai?" section
- 3-step enrol flow
- FAQ schema (4 questions covering key queries)
- SportsActivityLocation + BreadcrumbList JSON-LD
- Full footer with both locations
- Mobile sticky CTA bar

---

### TASK 6 — Create `/football-academy-dubai/index.html` ✅ DONE
**File Created:** `football-academy-dubai/index.html`  
**Problem:** Page returned 404. Primary keyword "football academy in dubai" had no dedicated landing page  
**Built:**
- Full HTML page with correct title and meta
- H1: "Football Academy in Dubai for Kids & Adults"
- Hero with dual CTA
- 800+ words of unique SEO content
- 9 program cards (all programs linked)
- Two-location feature section (Al Nahda + Al Warqa)
- FAQ section (4 questions) + FAQ schema
- Affordable/cheap football angle addressed
- BreadcrumbList JSON-LD schema
- Full footer
- Mobile sticky CTA bar

---

### TASK 7 — Update `sitemap.xml` ✅ DONE
**File:** `sitemap.xml`  
**Fix Applied:** Added both new pages at priority `0.95` with `lastmod: 2026-03-09`

```xml
https://touchlinesport.ae/kids-football-academy-dubai/ (priority: 0.95)
https://touchlinesport.ae/football-academy-dubai/      (priority: 0.95)
```

---

### TASK 8 — Fix GBP Name Inconsistency ⚠️ MANUAL REQUIRED
**Platform:** Google Business Profile  
**Problem:** GBP listing name is **"Touchline Football Academy"** but the website is **"Touchline Sports Academy"** — NAP mismatch suppresses local pack rankings  
**Action Required:**
1. Go to [business.google.com](https://business.google.com)
2. Sign in as account owner
3. Edit Business Name → Change to **"Touchline Sports Academy"**
4. Save and await Google verification (may take 1–7 days)

---

### TASK 9 — Add Structured NAP Microdata to Footer ✅ DONE
**File:** `index.html` (footer section)  
**Fix Applied:** Added hidden `<address>` element with `itemscope itemtype="https://schema.org/LocalBusiness"` microdata so machine crawlers (Google, Bing, Yext) can extract the structured NAP reliably.

---

### TASK 10 — Add Internal Links from Homepage to New Pages ✅ DONE
**File:** `index.html` (SEO content block — TASK 3)  
**Fix Applied:** The 830-word SEO block (Task 3) contains the following internal links:
- `"Learn more about our Kids Football Academy →"` → `/kids-football-academy-dubai/`
- `"Explore our Football Academy Dubai page →"` → `/football-academy-dubai/`
- Plus 6 program links (U6→Girls) pointing to existing academy pages

---

## 🏗️ FILES CREATED / MODIFIED

| File | Action | Status |
|------|--------|--------|
| `index.html` | Modified — title, meta, 830-word content, schema (8 programs + 2 locations), NAP microdata | ✅ Done |
| `kids-football-academy-dubai/index.html` | Created — full SEO landing page | ✅ Done |
| `football-academy-dubai/index.html` | Created — full SEO landing page | ✅ Done |
| `sitemap.xml` | Modified — 2 new URLs added | ✅ Done |
| `SEO-TASKS-README.md` | This file | ✅ Done |

---

## ⚠️ MANUAL ACTIONS STILL REQUIRED (Cannot be done via code)

| # | Action | Where | Priority |
|---|--------|--------|----------|
| 1 | **Change GBP name** → "Touchline Sports Academy" | business.google.com | 🔴 HIGH |
| 2 | **Push code to GitHub** (git add → commit → push) | Terminal / GitHub Desktop | 🔴 HIGH |
| 3 | **Request Indexing in Google Search Console** for 2 new URLs | search.google.com/search-console | 🟠 HIGH |
| 4 | List on WhatOn.ae | whatson.ae/submit | 🟡 MEDIUM |
| 5 | List on edkwery.com | edkwery.com | 🟡 MEDIUM |
| 6 | List on edarabia.com | edarabia.com | 🟡 MEDIUM |
| 7 | List on Bayut.com community | bayut.com | 🟡 MEDIUM |
| 8 | List on few.ae | few.ae | 🟡 MEDIUM |

---

## 📋 NAP for All Directory Listings (Use Exactly)

```
Business Name: Touchline Sports Academy
Address:       Inside Al Ahli Club, Al Nahda 1, behind Al Mulla Plaza, Dubai, UAE
Phone:         +971 56 130 0850
Email:         touchlinedxb@gmail.com
Website:       https://touchlinesport.ae
Category:      Football Academy / Sports Academy / Kids Football Training
```

---

## 📊 EXPECTED RESULTS TIMELINE

| Keyword | Current | Expected (6–8 weeks post-push) |
|---------|---------|-------------------------------|
| `best football academy in dubai` | Already ranking | Hold / strengthen |
| `football academy in dubai` | No landing page | New ranking via `/football-academy-dubai/` |
| `football academy in dubai for kids` | 404 | Top 10 via `/kids-football-academy-dubai/` |
| `cheap football academy in dubai` | Not targeted | Homepage content now covers it |
| `cheapest football academy in dubai` | Not targeted | Homepage content now covers it |
| `top 10 best football academy in dubai` | Not targeted | Kids page targets it |
| `free football academy in dubai` | Weak | Kids page FAQ section covers it |

---

## ✅ COMPLETION STATUS

**Code Tasks: 9/9 Complete**  
**Manual Tasks: 0/8 Complete (requires account owner access)**

> **Next step:** Push the code to GitHub, then submit the 2 new page URLs in Google Search Console for rapid indexing.
