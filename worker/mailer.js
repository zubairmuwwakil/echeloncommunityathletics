/** Send one validated website inquiry without exposing the provider key to browsers. */
export async function sendInquiry(email, apiKey, fetcher = fetch) {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(email),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}
