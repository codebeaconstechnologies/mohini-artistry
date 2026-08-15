export interface Env {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  FRONTEND_ORIGIN: string;
  /** Public base URL the R2 bucket is served from (r2.dev subdomain or custom domain), no trailing slash. */
  R2_PUBLIC_BASE_URL: string;
  RAZORPAY_KEY_ID: string;
  JWT_SECRET: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
}

export interface AuthUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

export type Variables = {
  user: AuthUser;
};
