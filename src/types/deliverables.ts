// Types for Content Delivery & Approval System

export type ContentType = 'video' | 'image' | 'reel' | 'story' | 'carousel';
export type DeliverableStatus = 'submitted' | 'revision_requested' | 'approved';

export interface Deliverable {
  id: string;
  collaboration_request_id: string;
  submission_number: number;
  content_url: string;
  content_type: ContentType;
  caption?: string;
  hashtags?: string[];
  submission_notes?: string;
  status: DeliverableStatus;
  revision_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitDeliverablePayload {
  collaboration_request_id: string;
  content_url: string;
  content_type: ContentType;
  caption?: string;
  hashtags?: string[];
  submission_notes?: string;
}

export interface ApproveDeliverablePayload {
  deliverable_id: string;
}

export interface RequestRevisionPayload {
  deliverable_id: string;
  revision_notes: string;
}

export const DELIVERABLE_STATUS_LABELS: Record<DeliverableStatus, string> = {
  submitted: 'Submitted',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
};

export const DELIVERABLE_STATUS_COLORS: Record<DeliverableStatus, string> = {
  submitted: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  revision_requested: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: 'Video',
  image: 'Image',
  reel: 'Reel',
  story: 'Story',
  carousel: 'Carousel',
};
