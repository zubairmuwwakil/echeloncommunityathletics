// @ts-check
import { defineConfig } from "astro/config";

const analytics = Boolean(process.env.PUBLIC_GA4_MEASUREMENT_ID);
if (analytics && !/^G-[A-Z0-9]+$/.test(process.env.PUBLIC_GA4_MEASUREMENT_ID ?? "")) {
  throw new Error("PUBLIC_GA4_MEASUREMENT_ID must be a GA4 web stream ID starting with G-.");
}

export default defineConfig({
  site: "https://echeloncommunity.ca",
  trailingSlash: "always",
  build: {
    format: "directory",
    // Keep CSS and JS in files so the Content-Security-Policy can forbid inline code.
    inlineStylesheets: "never",
  },
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
  // Astro hashes its own inline scripts and styles into a CSP <meta> tag.
  // Directives that a <meta> tag can't carry (frame-ancestors) live in public/_headers.
  security: {
    csp: {
      algorithm: "SHA-256",
      ...(analytics && {
        scriptDirective: { resources: ["'self'", "https://www.googletagmanager.com"] },
      }),
      directives: [
        "default-src 'self'",
        `img-src 'self' data:${analytics ? " https://*.google-analytics.com" : ""}`,
        "font-src 'self'",
        `connect-src 'self'${analytics ? " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com" : ""}`,
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
});
