import { supabase } from '@/lib/supabase';

export interface Creator {
  id: string;
  name: string;
  email: string;
  niche: string;
  bio?: string;
  instagram_handle?: string;
  instagram_followers?: number;
  youtube_followers?: number;
  tiktok_followers?: number;
  instagram_engagement?: number;
  youtube_engagement?: number;
  tiktok_engagement?: number;
  avg_views?: number;
  created_at: string;
  updated_at: string;
}

// Get all creators
export async function getAllCreators() {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Creator[];
}

// Get creator by ID
export async function getCreatorById(id: string) {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Creator;
}

// Get creators by niche
export async function getCreatorsByNiche(niche: string) {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('niche', niche)
    .order('instagram_followers', { ascending: false });

  if (error) throw error;
  return data as Creator[];
}

// Create creator
export async function createCreator(creator: Omit<Creator, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('creators')
    .insert([creator])
    .select()
    .single();

  if (error) throw error;
  return data as Creator;
}

// Update creator
export async function updateCreator(id: string, updates: Partial<Creator>) {
  const { data, error } = await supabase
    .from('creators')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Creator;
}

// Delete creator
export async function deleteCreator(id: string) {
  const { error } = await supabase
    .from('creators')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Search creators
export async function searchCreators(query: string) {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .or(`name.ilike.%${query}%,niche.ilike.%${query}%`)
    .order('instagram_followers', { ascending: false });

  if (error) throw error;
  return data as Creator[];
}
