# Echelon Community Athletics — website

Public website for **Echelon Community Athletics Inc.**, a federally incorporated Canadian not-for-profit (corporation no. 1832701-7). Not a registered charity. Domain: **echeloncommunity.ca**.

Built with [Astro](https://astro.build) as a static site, plus one small Cloudflare Worker route for form submissions.

## Run locally

```bash
npm install
npm run dev        # http://127.0.0.1:4321, live reload (forms show the email fallback)
npm run preview    # builds, then runs the real Worker locally on :8787
npm test           # form handler tests
```

## Where things live

| What | Where |
| --- | --- |
| Programs, prices, towns, contact email, registration link | `src/data/site.ts` (edit this for a new season) |
| Pages | `src/pages/` |
| Design tokens, every style | `src/styles/global.css` |
| Brand mark and program pictograms | `src/components/BrandMark.astro`, `Glyph.astro` |
| Form handler (`POST /api/inquiry`) | `worker/handler.js`, tested in `worker/handler.test.js` |
| Security headers | `public/_headers` + the CSP in `astro.config.mjs` |

## Review mode

`review: true` in `src/data/site.ts` shows a "Review draft" panel listing every statement that still needs confirming, outlines each one on the page, and adds `noindex`. Resolve every note, then set `review: false`.

## Before publishing

- [ ] Every review note resolved (including the founder story on /about/, written in your own words)
- [ ] Real photos of real programs, with permission from the people in them
- [ ] `hello@echeloncommunity.ca` exists (Cloudflare Email Routing, free)
- [ ] Registration links point to a **separate Echelon organization** on PB Social
- [ ] Play Fund set up as its own line in Echelon's books before asking anyone to give to it
- [ ] Statistics on the homepage re-checked against their sources
- [ ] Privacy notice reviewed and dated
- [ ] Domain and Cloudflare account owned by Echelon, not a personal or Zemi account

## Hosting (recommended: Cloudflare Workers, free tier)

1. Create a Cloudflare account under an Echelon email, and add `echeloncommunity.ca` to it.
2. `npx wrangler login`, then `npm run deploy`. Or connect this GitHub repo in the Cloudflare dashboard (Workers → Import a repository, build command `npm run build`) so every push to `main` deploys.
3. Add `echeloncommunity.ca` and `www.echeloncommunity.ca` as custom domains on the Worker.

## Forms

The waitlist, partner and contact forms post to `/api/inquiry`, which emails the submission to Echelon's inbox through Cloudflare's `send_email` binding. Nothing is stored in a database.

Until email is configured, the endpoint answers `503` and the page offers a mailto link instead, so nothing is lost. To turn it on:

1. Enable **Email Routing** on `echeloncommunity.ca` and verify the inbox that should receive submissions.
2. In `wrangler.jsonc`, set `MAIL_FROM` (e.g. `website@echeloncommunity.ca`) and `MAIL_TO` (the verified inbox), and add the `send_email` binding shown in the comments.
3. Deploy, then send a test from each form.

Spam protection is a honeypot field plus a minimum fill time. Add Cloudflare Turnstile if spam gets through.

## Boundaries

- Echelon owns this site and brand. PB Social is a separate company's software used for registration.
- Don't publish participant counts, impact figures, sponsors, grants or testimonials unless they are verified.
- Don't use nonprofit discounts or credits for any commercial product.
- Internal and governance documents never go in this repository; it is public. `private/` is git-ignored.
