import { supabase } from '@/lib/supabase';

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  deliverable_type: string;
  budget: number;
  timeline: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

// Get all campaigns
export async function getAllCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Campaign[];
}

// Get campaigns by brand
export async function getCampaignsByBrand(brandId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Campaign[];
}

// Get campaign by ID
export async function getCampaignById(id: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Campaign;
}

// Get active campaigns
export async function getActiveCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Campaign[];
}

// Create campaign
export async function createCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
}

// Update campaign
export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
}

// Delete campaign
export async function deleteCampaign(id: string) {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
