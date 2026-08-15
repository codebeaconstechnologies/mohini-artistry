// All money in the API is an integer number of paise (₹1 = 100 paise).
// Never do float math on money client-side — only format for display, and
// only convert rupee form-inputs to paise with rupeesToPaise below.

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
