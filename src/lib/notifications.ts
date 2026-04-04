import { supabaseAdmin } from './supabase-admin';

export type NotificationType =
  | 'new_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'status_update'
  | 'new_message'
  | 'campaign_deadline'
  | 'payment_received';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
    });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

// Helper functions for common notifications

export async function notifyNewRequest(creatorId: string, brandName: string, campaignTitle: string, requestId: string) {
  return createNotification({
    userId: creatorId,
    type: 'new_request',
    title: 'New Collaboration Request',
    message: `${brandName} sent you a request for "${campaignTitle}"`,
    link: `/requests`,
  });
}

export async function notifyRequestAccepted(brandId: string, creatorName: string, campaignTitle: string) {
  return createNotification({
    userId: brandId,
    type: 'request_accepted',
    title: 'Request Accepted!',
    message: `${creatorName} accepted your request for "${campaignTitle}"`,
    link: `/requests`,
  });
}

export async function notifyRequestRejected(brandId: string, creatorName: string, campaignTitle: string) {
  return createNotification({
    userId: brandId,
    type: 'request_rejected',
    title: 'Request Declined',
    message: `${creatorName} declined your request for "${campaignTitle}"`,
    link: `/requests`,
  });
}

export async function notifyStatusUpdate(userId: string, status: string, campaignTitle: string) {
  return createNotification({
    userId,
    type: 'status_update',
    title: 'Status Updated',
    message: `Campaign "${campaignTitle}" status changed to ${status}`,
    link: `/requests`,
  });
}

export async function notifyNewMessage(userId: string, senderName: string, conversationId: string) {
  return createNotification({
    userId,
    type: 'new_message',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    link: `/messages`,
  });
}
