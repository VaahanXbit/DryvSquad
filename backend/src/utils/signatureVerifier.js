/*
================================================================================
File: backend/src/utils/signatureVerifier.js
Responsibility: Cryptographic signature verification, isolated from the
                provider SDK wrapper so it can be unit-tested with plain
                strings and reused if another provider uses the same
                HMAC-SHA256(orderId|paymentId) scheme.
================================================================================
*/

const crypto = require('crypto');

function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (err) {
    // Buffers of mismatched length -> timingSafeEqual throws instead of returning false
    return false;
  }
}

module.exports = { verifyRazorpaySignature };