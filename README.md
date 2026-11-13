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

`review: false` in `src/data/site.ts` permits indexing and hides the draft review panel. The layout outputs a `robots=index,follow` tag. `public/robots.txt` allows crawling and points to `public/sitemap.xml`. To pause indexing again while reviewing copy, set `review: true`.

## Before publishing

- [x] Replace placeholder founder content with a factual public introduction; a personal first-person story can still be added later
- [ ] Real photos of real programs, with permission from the people in them
- [ ] `hello@echeloncommunity.ca` exists (Cloudflare Email Routing, free)
- [ ] Configure a **separate Echelon organization** on PB Social and replace the current contact-based inquiry links with that organization’s real registration URLs
- [ ] Play Fund set up as its own line in Echelon's books before asking anyone to give to it
- [x] Remove unverified numeric impact statements until reliable sources and dates are ready
- [ ] Review the public privacy notice, confirm an actual data-retention policy, and record a formal policy effective date
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

## Search indexing and connected identity

- Indexable pages have canonical URLs under `https://echeloncommunity.ca` and `robots=index,follow` when `review: false`.
- The sitemap is at `https://echeloncommunity.ca/sitemap.xml`; `robots.txt` references it.
- The About page and footer identify **Zubair Muwwakil** and link to the personal engineering portfolio.
- Links to **Zemi Echelon** and **PB Social** clarify connected people and software; neither is owned by this nonprofit, and the nonprofit is not a commercial subsidiary.
- Submit this sitemap to Google Search Console **only after the custom domain is serving the current build**; indexing is permitted, not guaranteed.
- Confirm Cloudflare deployment, the `hello@echeloncommunity.ca` mailbox, and the separate PB Social registration organization before promoting active registration links.
