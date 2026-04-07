// Types for Escrow Payment System

export type PaymentStatus =
  | "pending"
  | "escrowed"
  | "released"
  | "refunded"
  | "disputed";

export interface Payment {
  id: string;
  collaboration_request_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  platform_fee: number;
  creator_payout: number;
  brand_clerk_id: string;
  creator_clerk_id: string;
  escrowed_at?: string;
  released_at?: string;
  refunded_at?: string;
  disputed_at?: string;
  dispute_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentOrderPayload {
  collaboration_request_id: string;
  amount: number;
}

export interface VerifyPaymentPayload {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ReleasePaymentPayload {
  payment_id: string;
}

export interface DisputePaymentPayload {
  payment_id: string;
  reason: string;
}

export interface PaymentHistory {
  id: string;
  payment_id: string;
  status: PaymentStatus;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  escrowed: "Escrowed",
  released: "Released",
  refunded: "Refunded",
  disputed: "Disputed",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  escrowed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  released: "bg-green-500/10 text-green-600 border-green-500/20",
  refunded: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  disputed: "bg-red-500/10 text-red-600 border-red-500/20",
};
