import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { sendInquiry } from "./mailer.js";

const script = readFileSync(new URL("../google-apps-script/Code.gs", import.meta.url), "utf8");
const key = "a-test-key-that-would-be-random-in-production";
const now = 1_794_967_900_000;
const email = { replyTo: "visitor@example.com", subject: "Message from Visitor", body: "Hello Echelon\n" };

function googleScript() {
  const sent = [];
  const context = {
    Date: { now: () => now },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => key }) },
    Utilities: {
      Charset: { UTF_8: "UTF_8" },
      computeHmacSha256Signature: (value, secret) => [...createHmac("sha256", secret).update(value, "utf8").digest()],
      base64Encode: (bytes) => Buffer.from(bytes).toString("base64"),
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (value) => ({ value, setMimeType() { return this; } }),
    },
    MailApp: { sendEmail: (message) => sent.push(message) },
  };
  runInNewContext(script, context);
  const post = (body) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(body) } }).value);
  return { post, sent };
}

test("Worker signature is accepted by the Google script and mail goes only to Echelon", async () => {
  const google = googleScript();
  await sendInquiry(email, "https://script.google.com/macros/s/test/exec", key, async (url, init) => {
    assert.equal(url, "https://script.google.com/macros/s/test/exec");
    assert.equal(init.method, "POST");
    const result = google.post(JSON.parse(init.body));
    return new Response(JSON.stringify(result), { status: 200 });
  }, now);
  assert.equal(google.sent.length, 1);
  assert.equal(google.sent[0].to, "zubair@echeloncommunity.ca");
  assert.equal(google.sent[0].replyTo, email.replyTo);
  assert.equal(google.sent[0].body, email.body);
});

test("Google script rejects forged and stale requests without sending", () => {
  const google = googleScript();
  const payload = { timestamp: now, email };
  const signature = createHmac("sha256", key).update(JSON.stringify(payload)).digest("base64");
  assert.equal(google.post({ ...payload, signature: "forged" }).ok, false);
  assert.equal(google.post({ ...payload, timestamp: now - 600_000, signature }).ok, false);
  assert.equal(google.sent.length, 0);
});

test("Worker reports an error when Google does not accept or deliver the inquiry", async () => {
  await assert.rejects(
    sendInquiry(email, "https://script.google.com/macros/s/test/exec", key,
      async () => new Response('{"ok":false}', { status: 200 }), now),
    /did not accept/,
  );
  await assert.rejects(
    sendInquiry(email, "https://script.google.com/macros/s/test/exec", key,
      async () => new Response("error", { status: 403 }), now),
    /returned 403/,
  );
});
