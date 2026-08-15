import type { OrderStatus, PaymentStatus } from "../constants/order-status";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  imageUrl?: string | null;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note: string | null;
  createdAt: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  couponCode: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingState: string;
  shippingCity: string;
  shippingPincode: string;
  contactEmail: string;
  paymentStatus: PaymentStatus;
  createdAt: number;
  updatedAt: number;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
}

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  address1: string;
  address2?: string;
  state: string;
  city: string;
  pincode: string;
}
