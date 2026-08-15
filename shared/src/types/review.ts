export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: number;
}
