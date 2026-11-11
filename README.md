# Echelon Community Athletics — website

Public website for **Echelon Community Athletics Inc.**, a federally incorporated Canadian not-for-profit (corporation no. 1832701-7). Not a registered charity.

The site is plain HTML and CSS in [`site/`](site/). There is no build step and no framework.

## Run locally

```bash
python3 -m http.server 4173 --directory site --bind 127.0.0.1
```

Then open http://localhost:4173.

## Review mode

`site/index.html` and `site/privacy.html` start with `<html class="review">`. That shows a banner and outlines every statement that still needs confirmation, with a note explaining what to check. Before publishing, resolve each note and remove `class="review"`.

## Before publishing

- [ ] Every review note resolved
- [ ] Contact mailbox exists on an Echelon-owned domain
- [ ] Registration links point to an Echelon-named organization on PB Social
- [ ] Domain registered to Echelon Community Athletics Inc., in an account Echelon controls
- [ ] Canonical URL, `robots.txt` and `sitemap.xml` match the final domain
- [ ] Privacy notice reviewed and dated
- [ ] Checked on a phone

## Deploy (when approved)

Any static host works. Recommended: **Cloudflare Pages** (free, no build command, output directory `site`). `site/_headers` sets security headers there. Point the domain at the Pages project and confirm HTTPS.

## Boundaries

- Echelon owns this site and brand. PB Social is a separate software service used for registration.
- Don't publish participant counts, impact figures, sponsors or testimonials unless they are verified.
- Don't use nonprofit discounts or credits for any commercial product.
- Internal and governance documents never go in this repository; it is public. `private/` is git-ignored.
