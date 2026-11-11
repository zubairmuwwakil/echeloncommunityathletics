// @ts-check
import { defineConfig } from "astro/config";

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
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
});
