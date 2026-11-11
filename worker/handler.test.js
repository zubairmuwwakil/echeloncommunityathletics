import { test } from "node:test";
import assert from "node:assert/strict";
import { handleInquiry, validate } from "./handler.js";

const env = {
  MAIL_FROM: "website@echeloncommunity.ca",
  MAIL_TO: "inbox@example.org",
  MAIL_DOMAIN: "echeloncommunity.ca",
  SITE_ORIGIN: "https://echeloncommunity.ca",
};

const interest = {
  kind: "interest",
  program: "youth-camps",
  name: "Ama",
  email: "ama@example.com",
  town: "Whitby",
  for: "My child",
  consent: "yes",
  elapsed: 9000,
};

const post = (body, headers = {}) =>
  new Request("https://echeloncommunity.ca/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", origin: env.SITE_ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const capture = () => {
  const sent = [];
  return { sent, send: async (raw) => void sent.push(raw) };
};

test("sends a valid waitlist signup with the visitor as Reply-To", async () => {
  const { sent, send } = capture();
  const res = await handleInquiry(post(interest), env, send);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1);
  assert.match(sent[0], /^From: Echelon website <website@echeloncommunity\.ca>\r\n/);
  assert.match(sent[0], /\r\nReply-To: <ama@example\.com>\r\n/);
  assert.match(sent[0], /Subject: Waitlist: youth-camps \(Whitby\)/);
  assert.match(sent[0], /For: My child/);
});

test("a header injection attempt cannot add headers", async () => {
  const { sent, send } = capture();
  const res = await handleInquiry(post({ ...interest, name: "Eve\r\nBcc: victim@example.com", town: "Ajax\nX: y" }), env, send);
  assert.equal(res.status, 200);
  const headerBlock = sent[0].split("\r\n\r\n")[0];
  assert.doesNotMatch(headerBlock, /^Bcc:/m);
  assert.doesNotMatch(headerBlock, /^X: y/m);
});

test("rejects an email address carrying a newline", () => {
  assert.equal(validate({ ...interest, email: "a@b.com\r\nBcc: x@y.com" }).error, "missing");
});

test("requires consent", async () => {
  const res = await handleInquiry(post({ ...interest, consent: undefined }), env, capture().send);
  assert.equal(res.status, 422);
  assert.deepEqual(await res.json(), { error: "missing", field: "consent" });
});

test("partner inquiries need an organization and a message", () => {
  const base = { kind: "partner", name: "Sam", email: "sam@example.com", consent: "yes", partnerType: "Workplace or team event" };
  assert.equal(validate(base).field, "organization");
  assert.equal(validate({ ...base, organization: "Acme" }).field, "message");
  assert.equal(validate({ ...base, organization: "Acme", message: "Team day in June" }).kind, "partner");
});

test("bots get a quiet ok and nothing is sent", async () => {
  for (const body of [{ ...interest, website: "spam.example" }, { ...interest, elapsed: 300 }]) {
    const { sent, send } = capture();
    const res = await handleInquiry(post(body), env, send);
    assert.equal(res.status, 200);
    assert.equal(sent.length, 0);
  }
});

test("other origins, wrong methods and bad JSON are refused", async () => {
  const send = capture().send;
  assert.equal((await handleInquiry(post(interest, { origin: "https://evil.example" }), env, send)).status, 403);
  assert.equal((await handleInquiry(new Request("https://echeloncommunity.ca/api/inquiry"), env, send)).status, 405);
  assert.equal((await handleInquiry(post("{not json"), env, send)).status, 400);
  assert.equal((await handleInquiry(post("x".repeat(20_000)), env, send)).status, 413);
});

test("answers 503 until email is configured, so the page offers the mailto fallback", async () => {
  const res = await handleInquiry(post(interest), { SITE_ORIGIN: env.SITE_ORIGIN }, null);
  assert.equal(res.status, 503);
});

test("encodes non-ASCII subjects", async () => {
  const { sent, send } = capture();
  await handleInquiry(post({ ...interest, town: "Port Perry — Scugog" }), env, send);
  assert.match(sent[0], /Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/);
});
