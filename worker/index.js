import { EmailMessage } from "cloudflare:email";
import { handleInquiry } from "./handler.js";

/**
 * Serves the static site from ./dist and handles the one dynamic route.
 * Static files never reach this code: wrangler.jsonc runs the Worker first only for /api/*.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/inquiry") {
      const send = env.SEND_EMAIL
        ? (raw) => env.SEND_EMAIL.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, raw))
        : null;
      return handleInquiry(request, env, send);
    }
    if (url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
