import { supabase } from '@/lib/supabase';

export interface Brand {
  id: string;
  name: string;
  email: string;
  industry: string;
  description?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// Get all brands
export async function getAllBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Brand[];
}

// Get brand by ID
export async function getBrandById(id: string) {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Brand;
}

// Create brand
export async function createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('brands')
    .insert([brand])
    .select()
    .single();

  if (error) throw error;
  return data as Brand;
}

// Update brand
export async function updateBrand(id: string, updates: Partial<Brand>) {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Brand;
}

// Delete brand
export async function deleteBrand(id: string) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
