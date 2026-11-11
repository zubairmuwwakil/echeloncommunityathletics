/**
 * POST /api/inquiry: validates a website form and emails it to Echelon's inbox.
 *
 * Pure function of (request, env, send) so it can be tested in Node. `send(raw)`
 * delivers a raw RFC 5322 message; worker/index.js wires it to Cloudflare's
 * send_email binding, which can only deliver to addresses verified in Email Routing.
 */

const KINDS = new Set(["interest", "partner", "contact"]);
const EMAIL = /^[^\s@<>"',;:\\]+@[^\s@<>"',;:\\]+\.[a-z]{2,}$/i;
const MAX_BODY = 12_000;
const MIN_ELAPSED_MS = 2500;

const LIMITS = {
  name: 80,
  email: 160,
  program: 60,
  town: 60,
  for: 20,
  partnerType: 60,
  organization: 120,
  phone: 40,
  message: 3000,
};

const LABELS = {
  program: "Program",
  town: "Town",
  for: "For",
  partnerType: "About",
  organization: "Organization",
  phone: "Phone",
  message: "Message",
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

/** Strips control characters and line breaks so values can't inject headers. */
const oneLine = (v) => String(v ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
const multiLine = (v) => String(v ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim();

/** RFC 2047 encoded-word, so non-ASCII names survive in the Subject. */
const encodeHeader = (text) => {
  if (/^[\x20-\x7e]*$/.test(text)) return text;
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return `=?UTF-8?B?${btoa(bin)}?=`;
};

export function validate(input) {
  if (!input || typeof input !== "object") return { error: "invalid" };
  const kind = oneLine(input.kind);
  if (!KINDS.has(kind)) return { error: "invalid" };

  const v = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const raw = key === "message" ? multiLine(input[key]) : oneLine(input[key]);
    if (raw.length > max) return { error: "too_long", field: key };
    v[key] = raw;
  }

  const required = ["name", "email"];
  if (kind === "interest") required.push("program", "town");
  if (kind === "partner") required.push("partnerType", "organization", "message");
  if (kind === "contact") required.push("message");
  for (const key of required) if (!v[key]) return { error: "missing", field: key };

  if (!EMAIL.test(v.email)) return { error: "missing", field: "email" };
  if (input.consent !== "yes") return { error: "missing", field: "consent" };

  return { kind, values: v };
}

export function compose({ kind, values }, env, now = new Date()) {
  const subjects = {
    interest: `Waitlist: ${values.program} (${values.town})`,
    partner: `Partner inquiry: ${values.organization}`,
    contact: `Message from ${values.name}`,
  };
  const lines = [`Name: ${values.name}`, `Email: ${values.email}`];
  for (const [key, label] of Object.entries(LABELS)) {
    if (values[key] && key !== "message") lines.push(`${label}: ${values[key]}`);
  }
  if (values.message) lines.push("", values.message);
  lines.push("", `Consent: yes, via the ${kind} form on ${now.toISOString()}`, "Reply to this email to answer them directly.");

  const id = `${now.getTime()}.${Math.random().toString(36).slice(2)}@${env.MAIL_DOMAIN}`;
  const headers = [
    `From: Echelon website <${env.MAIL_FROM}>`,
    `To: <${env.MAIL_TO}>`,
    `Reply-To: <${values.email}>`,
    `Subject: ${encodeHeader(subjects[kind])}`,
    `Date: ${now.toUTCString()}`,
    `Message-ID: <${id}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${lines.join("\r\n")}\r\n`;
}

export async function handleInquiry(request, env, send) {
  if (request.method !== "POST") return json(405, { error: "method" });
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json(415, { error: "type" });

  const origin = request.headers.get("origin");
  if (origin && env.SITE_ORIGIN && origin !== env.SITE_ORIGIN) return json(403, { error: "origin" });

  const text = await request.text();
  if (text.length > MAX_BODY) return json(413, { error: "size" });

  let input;
  try {
    input = JSON.parse(text);
  } catch {
    return json(400, { error: "invalid" });
  }

  // Bots: a filled honeypot or an instant submit gets a quiet "ok" and no email.
  if (oneLine(input?.website) || Number(input?.elapsed) < MIN_ELAPSED_MS) return json(200, { ok: true });

  const result = validate(input);
  if (result.error) return json(422, result);

  if (!send || !env.MAIL_FROM || !env.MAIL_TO || !env.MAIL_DOMAIN) return json(503, { error: "not_configured" });

  try {
    await send(compose(result, env), env);
  } catch {
    return json(502, { error: "send_failed" });
  }
  return json(200, { ok: true });
}
