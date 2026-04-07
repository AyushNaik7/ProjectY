// Types for Notification System

export type NotificationType =
  | "new_request"
  | "request_accepted"
  | "request_rejected"
  | "new_message"
  | "new_match"
  | "campaign_ending"
  | "payment_received"
  | "review_received"
  | "new_deliverable"
  | "deliverable_approved"
  | "revision_requested";

export interface Notification {
  id: string;
  user_clerk_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

export interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  new_request: "📩",
  request_accepted: "✅",
  request_rejected: "❌",
  new_message: "💬",
  new_match: "🎯",
  campaign_ending: "⏰",
  payment_received: "💰",
  review_received: "⭐",
  new_deliverable: "📤",
  deliverable_approved: "✅",
  revision_requested: "🔄",
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  new_request: "text-amber-500",
  request_accepted: "text-green-500",
  request_rejected: "text-red-500",
  new_message: "text-blue-500",
  new_match: "text-purple-500",
  campaign_ending: "text-orange-500",
  payment_received: "text-emerald-500",
  review_received: "text-yellow-500",
  new_deliverable: "text-blue-500",
  deliverable_approved: "text-green-500",
  revision_requested: "text-amber-500",
};
