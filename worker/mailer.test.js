import { test } from "node:test";
import assert from "node:assert/strict";
import { sendInquiry } from "./mailer.js";

test("sends only the intended inquiry to the email provider", async () => {
  const email = { from: "Echelon <website@echeloncommunity.ca>", to: ["zubair@echeloncommunity.ca"], subject: "Test", text: "Hello" };
  let request;
  await sendInquiry(email, "test-key", async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify({ id: "message-id" }), { status: 200 });
  });
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers.authorization, "Bearer test-key");
  assert.deepEqual(JSON.parse(request.init.body), email);
});

test("does not report success when the provider rejects an inquiry", async () => {
  await assert.rejects(
    sendInquiry({ subject: "Test" }, "test-key", async () => new Response("rejected", { status: 403 })),
    /Email provider returned 403/,
  );
});
