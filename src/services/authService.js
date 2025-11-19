import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up with profile data
  async signUp(email, password, fullName, companyName = '') {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            role: 'user'
          }
        }
      });
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Sign in
  async signIn(email, password) {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase?.auth?.signOut();
      return { error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase?.auth?.getUser();
      return { user, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return { error: { message: 'Not authenticated' } };

      const { data, error } = await supabase?.from('user_profiles')?.update({
          full_name: updates?.fullName,
          company_name: updates?.companyName,
          avatar_url: updates?.avatarUrl,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id)?.select()?.single();

      return { data, error };
    } catch (error) {
      return { error: { message: 'Network error. Please try again.' } };
    }
  }
};