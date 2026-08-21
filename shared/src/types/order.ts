import type { OrderStatus, PaymentStatus } from "../constants/order-status";
import type { ReturnRequestStatus, ReturnRequestType } from "../constants/return-status";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug?: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  imageUrl?: string | null;
  isRefundAllowed: boolean;
  isReplaceAllowed: boolean;
}

export interface ReturnRequest {
  id: number;
  orderId: number;
  orderItemId: number;
  userId: number;
  type: ReturnRequestType;
  status: ReturnRequestStatus;
  reason: string;
  adminNote: string | null;
  returnCourier: string | null;
  returnTrackingNumber: string | null;
  replacementCourier: string | null;
  replacementTrackingNumber: string | null;
  refundAmountPaise: number | null;
  createdAt: number;
  updatedAt: number;
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
  deliveredAt: number | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  returnRequests: ReturnRequest[];
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
