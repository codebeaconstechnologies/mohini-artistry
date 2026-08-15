const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export async function createRazorpayOrder(
  keyId: string,
  keySecret: string,
  params: { amountPaise: number; receipt: string; notes?: Record<string, string> }
): Promise<RazorpayOrder> {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      payment_capture: 1,
      notes: params.notes ?? {},
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${body}`);
  }

  return (await res.json()) as RazorpayOrder;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

/** Verifies the signature returned to the browser after a successful Checkout.js payment. */
export async function verifyPaymentSignature(
  keySecret: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  const expected = await hmacSha256Hex(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`);
  return timingSafeEqualHex(expected, razorpaySignature);
}

/** Verifies the X-Razorpay-Signature header on incoming webhook requests against the raw body. */
export async function verifyWebhookSignature(
  webhookSecret: string,
  rawBody: string,
  signatureHeader: string
): Promise<boolean> {
  const expected = await hmacSha256Hex(webhookSecret, rawBody);
  return timingSafeEqualHex(expected, signatureHeader);
}
