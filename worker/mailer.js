/** Send a validated inquiry to Echelon's Google Apps Script. */
export async function sendInquiry(email, scriptUrl, signingKey, fetcher = fetch, now = Date.now()) {
  const payload = { timestamp: now, email };
  const signed = JSON.stringify(payload);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed)));
  const signature = btoa(String.fromCharCode(...bytes));
  const response = await fetcher(scriptUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, signature }),
  });
  if (!response.ok) throw new Error(`Google script returned ${response.status}`);
  const result = await response.json();
  if (result?.ok !== true) throw new Error("Google script did not accept the inquiry");
}
