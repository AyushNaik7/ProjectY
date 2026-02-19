import { supabase } from '@/lib/supabase';

export interface CollaborationRequest {
  id: string;
  brand_id: string;
  creator_id: string;
  campaign_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

// Get all requests
export async function getAllRequests() {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CollaborationRequest[];
}

// Get requests by brand
export async function getRequestsByBrand(brandId: string) {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CollaborationRequest[];
}

// Get requests by creator
export async function getRequestsByCreator(creatorId: string) {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CollaborationRequest[];
}

// Get request by ID
export async function getRequestById(id: string) {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as CollaborationRequest;
}

// Create request
export async function createRequest(
  request: Omit<CollaborationRequest, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .insert([request])
    .select()
    .single();

  if (error) throw error;
  return data as CollaborationRequest;
}

// Update request status
export async function updateRequestStatus(
  id: string,
  status: 'pending' | 'accepted' | 'rejected'
) {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CollaborationRequest;
}

// Delete request
export async function deleteRequest(id: string) {
  const { error } = await supabase
    .from('collaboration_requests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Get pending requests for creator
export async function getPendingRequestsForCreator(creatorId: string) {
  const { data, error } = await supabase
    .from('collaboration_requests')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CollaborationRequest[];
}
