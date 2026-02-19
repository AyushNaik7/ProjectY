import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'creator' | 'brand';
}

// Sign up
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Get current session
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Create user profile (creator or brand)
export async function createUserProfile(
  userId: string,
  role: 'creator' | 'brand',
  profileData: any
) {
  const table = role === 'creator' ? 'creators' : 'brands';

  const { data, error } = await supabase
    .from(table)
    .insert([
      {
        id: userId,
        ...profileData,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user profile
export async function getUserProfile(userId: string, role: 'creator' | 'brand') {
  const table = role === 'creator' ? 'creators' : 'brands';

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  role: 'creator' | 'brand',
  updates: any
) {
  const table = role === 'creator' ? 'creators' : 'brands';

  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Listen to auth changes
export function onAuthStateChange(callback: (user: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  return data.subscription;
}
