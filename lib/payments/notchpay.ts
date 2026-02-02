// ===========================================
// Notch Pay Integration - MTN MoMo & Orange Money
// ===========================================

import crypto from "crypto";

const NOTCHPAY_BASE_URL = "https://api.notchpay.co";

function getHeaders() {
  return {
    Authorization: process.env.NOTCHPAY_SECRET_KEY!,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export interface PaymentParams {
  amount: number;
  phone: string;
  reference: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  status: string;
  message: string;
  transaction: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    fee: number;
  };
}

/**
 * Initialize a Mobile Money payment
 */
export async function initializePayment(params: PaymentParams): Promise<PaymentResponse> {
  const { amount, phone, reference, description, customerName, customerEmail, metadata } = params;

  const formattedPhone = formatPhoneNumber(phone);

  const payload = {
    amount,
    currency: "XAF",
    phone: formattedPhone,
    reference,
    description,
    email: customerEmail,
    name: customerName,
    callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    metadata,
  };

  const response = await fetch(`${NOTCHPAY_BASE_URL}/payments/initialize`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Payment initialization failed");
  }

  return response.json();
}

/**
 * Verify a payment status
 */
export async function verifyPayment(reference: string): Promise<PaymentResponse> {
  const response = await fetch(`${NOTCHPAY_BASE_URL}/payments/${reference}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Payment verification failed");
  }

  return response.json();
}

/**
 * Transfer money to a driver's Mobile Money account
 */
export async function createTransfer(params: {
  amount: number;
  recipient: string;
  reference: string;
  description?: string;
}): Promise<PaymentResponse> {
  const { amount, recipient, reference, description } = params;

  const formattedRecipient = formatPhoneNumber(recipient);
  const provider = detectProvider(formattedRecipient);

  const payload = {
    amount,
    currency: "XAF",
    recipient: formattedRecipient,
    reference,
    description: description || "Alpha-Drivers Payout",
    channel: provider === "mtn" ? "cm.mtn" : "cm.orange",
  };

  const response = await fetch(`${NOTCHPAY_BASE_URL}/transfers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Transfer failed");
  }

  return response.json();
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.NOTCHPAY_WEBHOOK_SECRET!)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Format phone to Cameroon format
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  cleaned = cleaned.replace(/^0+/, "");
  if (cleaned.startsWith("237")) return `+${cleaned}`;
  return `+237${cleaned}`;
}

/**
 * Detect mobile provider from phone number
 */
export function detectProvider(phone: string): "mtn" | "orange" | "unknown" {
  const cleaned = phone.replace(/\D/g, "");
  let local = cleaned;
  if (cleaned.startsWith("237")) local = cleaned.substring(3);

  if (/^6[78]|^65[0-4]/.test(local)) return "mtn";
  if (/^69|^65[5-9]/.test(local)) return "orange";
  return "unknown";
}

/**
 * Generate unique transaction reference
 */
export function generateReference(type: "booking" | "registration" | "payout"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${timestamp}_${random}`.toUpperCase();
}
