// Deploy this as a web app owned by zubair@echeloncommunity.ca, executing as
// that account. Store INQUIRY_SIGNING_KEY in Project Settings > Script properties.
// The public endpoint accepts only recent requests signed by Echelon's Worker.
const INQUIRY_RECIPIENT = 'zubair@echeloncommunity.ca';
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function answer_(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok }))
    .setMimeType(ContentService.MimeType.JSON);
}

function equalSignature_(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  let difference = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    difference |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return difference === 0;
}

function doPost(e) {
  try {
    const key = PropertiesService.getScriptProperties().getProperty('INQUIRY_SIGNING_KEY');
    if (!key || !e || !e.postData || !e.postData.contents) return answer_(false);
    const request = JSON.parse(e.postData.contents);
    if (!Number.isSafeInteger(request.timestamp) ||
        Math.abs(Date.now() - request.timestamp) > MAX_CLOCK_SKEW_MS) return answer_(false);

    const signed = JSON.stringify({ timestamp: request.timestamp, email: request.email });
    const expected = Utilities.base64Encode(
      Utilities.computeHmacSha256Signature(signed, key, Utilities.Charset.UTF_8));
    if (!equalSignature_(expected, request.signature)) return answer_(false);

    const email = request.email;
    if (!email || typeof email !== 'object' ||
        typeof email.replyTo !== 'string' ||
        !/^[^\s@<>"',;:\\]+@[^\s@<>"',;:\\]+\.[a-z]{2,}$/i.test(email.replyTo) ||
        typeof email.subject !== 'string' || email.subject.length > 220 ||
        /[\r\n]/.test(email.subject) ||
        typeof email.body !== 'string' || email.body.length > 5000) return answer_(false);

    MailApp.sendEmail({
      to: INQUIRY_RECIPIENT,
      replyTo: email.replyTo,
      subject: email.subject,
      body: email.body,
      name: 'Echelon website',
    });
    return answer_(true);
  } catch (error) {
    // Do not echo form content or configuration to the public response.
    return answer_(false);
  }
}
