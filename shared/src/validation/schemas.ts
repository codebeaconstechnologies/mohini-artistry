import { z } from "zod";
import { CATEGORY_SLUGS } from "../constants/categories";
import { ORDER_STATUSES } from "../constants/order-status";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(200),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const addCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20).default(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(20),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address1: z.string().trim().min(5).max(200),
  address2: z.string().trim().max(200).optional(),
  state: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});
export type ShippingAddressInputSchema = z.infer<typeof shippingAddressSchema>;

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().trim().toUpperCase().max(40).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(1).max(60),
  email: z.string().trim().toLowerCase().email(),
});
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const validateCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(40),
});
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// ---- Admin ----

export const adminProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  categorySlug: z.enum(CATEGORY_SLUGS as [string, ...string[]]),
  description: z.string().trim().min(1).max(5000),
  pricePaise: z.number().int().positive(),
  compareAtPaise: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0),
  isNewArrival: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type AdminProductInput = z.infer<typeof adminProductSchema>;

export const adminProductUpdateSchema = adminProductSchema.partial();
export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;

export const adminOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
  note: z.string().trim().max(500).optional(),
});
export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;

export const adminCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(40),
  type: z.enum(["percent", "flat", "free_shipping"]),
  value: z.number().int().min(0).default(0),
  minOrderPaise: z.number().int().min(0).default(0),
  maxDiscountPaise: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.number().int().nullable().optional(),
  expiresAt: z.number().int().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().default(1),
});
export type AdminCouponInput = z.infer<typeof adminCouponSchema>;

export const adminCouponUpdateSchema = adminCouponSchema.partial();
export type AdminCouponUpdateInput = z.infer<typeof adminCouponUpdateSchema>;
