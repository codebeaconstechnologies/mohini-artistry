export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MOH-${y}${m}${d}-${random}`;
}
