// Minimal ambient typing for the Razorpay Checkout.js script, which is
// loaded dynamically at runtime (see components/checkout/RazorpayButton.tsx)
// rather than installed as an npm package.
export {};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
