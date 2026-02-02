import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "XAF"): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("237")) {
    const local = cleaned.substring(3);
    return `+237 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-CM", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("fr-CM", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`.toLowerCase();
  const cleaned = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const random = Math.random().toString(36).substring(2, 6);
  return `${cleaned}-${random}`;
}

export function calculatePlatformFee(driverFee: number): number {
  const commissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT || "15");
  return Math.round((driverFee * commissionPercent) / 100);
}

export function calculateTotalAmount(driverFee: number): {
  driverFee: number;
  platformFee: number;
  totalAmount: number;
} {
  const platformFee = calculatePlatformFee(driverFee);
  return {
    driverFee,
    platformFee,
    totalAmount: driverFee + platformFee,
  };
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() || "";
  const l = lastName?.charAt(0)?.toUpperCase() || "";
  return f + l || "?";
}

export function detectMobileProvider(phone: string): "mtn" | "orange" | "unknown" {
  const cleaned = phone.replace(/\D/g, "");
  let local = cleaned;
  if (cleaned.startsWith("237")) local = cleaned.substring(3);

  if (/^6[78]|^65[0-4]/.test(local)) return "mtn";
  if (/^69|^65[5-9]/.test(local)) return "orange";
  return "unknown";
}
