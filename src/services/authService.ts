import { supabase, isSupabaseConfigured, getUseSeedData, setUseSeedData } from './supabaseClient';
import { UserProfile, UserRole } from '../types';
import { DEFAULT_OFFICER_PROFILES, DEFAULT_INSTITUTION_PROFILES } from '../store/AppContext';

export interface AuthSessionResult {
  user: UserProfile | null;
  error?: string | null;
}

export const authService = {
  /**
   * Log in with email and password using Supabase Auth,
   * with automatic seamless fallback to local credentials if Supabase is unreachable.
   */
  async signIn(email: string, password: string): Promise<AuthSessionResult> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // If auth fails on Supabase, return the error
          return { user: null, error: error.message };
        }

        if (data.user) {
          // Fetch profile row
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!profileError && profileData) {
            const profile: UserProfile = {
              name: profileData.full_name || data.user.email?.split('@')[0] || 'User',
              email: profileData.email || data.user.email || '',
              role: profileData.role as UserRole,
              title: profileData.title || (profileData.role === 'officer' ? 'Scrutiny Officer' : 'Registrar'),
              avatar: profileData.avatar || (profileData.role === 'officer'
                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80'
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'),
              institutionId: profileData.institution_id || undefined,
            };
            return { user: profile, error: null };
          }

          // Fallback to metadata if profiles row isn't yet present
          const meta = data.user.user_metadata || {};
          const fallbackProfile: UserProfile = {
            name: meta.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: (meta.role as UserRole) || 'officer',
            title: meta.title || 'Scrutiny Officer',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
            institutionId: meta.institution_id || undefined,
          };
          return { user: fallbackProfile, error: null };
        }
      } catch (err: any) {
        console.warn('Supabase auth network error, using fallback:', err);
        setUseSeedData(true);
      }
    }

    // Seed Data Fallback Mode
    const officerMatch = DEFAULT_OFFICER_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (officerMatch) {
      return { user: officerMatch, error: null };
    }

    const instMatch = DEFAULT_INSTITUTION_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (instMatch) {
      return { user: instMatch, error: null };
    }

    // Default mock user if custom email entered
    const isOfficer = email.includes('aicte') || email.includes('gov');
    const customUser: UserProfile = {
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: isOfficer ? 'officer' : 'institution',
      title: isOfficer ? 'Regional Scrutiny Officer' : 'Authorized College Principal',
      avatar: isOfficer
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      institutionId: isOfficer ? undefined : 'inst-1',
      institutionName: isOfficer ? undefined : 'Sri Venkateswara Institute of Technology, Pune',
    };

    return { user: customUser, error: null };
  },

  /**
   * Register a new user in Supabase Auth
   */
  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    title?: string;
    institutionId?: string;
  }): Promise<AuthSessionResult> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email.trim(),
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              title: params.title || (params.role === 'officer' ? 'Scrutiny Officer' : 'Registrar'),
              institution_id: params.institutionId,
            },
          },
        });

        if (error) {
          return { user: null, error: error.message };
        }

        const newUser: UserProfile = {
          name: params.fullName,
          email: params.email,
          role: params.role,
          title: params.title || (params.role === 'officer' ? 'Scrutiny Officer' : 'Registrar'),
          avatar: params.role === 'officer'
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'
            : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
          institutionId: params.institutionId,
        };

        return { user: newUser, error: null };
      } catch (err: any) {
        return { user: null, error: err.message || 'Registration failed' };
      }
    }

    // Mock fallback registration
    const newUser: UserProfile = {
      name: params.fullName,
      email: params.email,
      role: params.role,
      title: params.title || (params.role === 'officer' ? 'Scrutiny Officer' : 'Registrar'),
      avatar: params.role === 'officer'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
      institutionId: params.institutionId,
    };

    return { user: newUser, error: null };
  },

  /**
   * Log out of current session
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('SignOut error:', err);
      }
    }
  },

  /**
   * Check active Supabase session
   */
  async getActiveSession(): Promise<UserProfile | null> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const user = data.session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            return {
              name: profile.full_name || user.email?.split('@')[0] || 'User',
              email: profile.email || user.email || '',
              role: profile.role as UserRole,
              title: profile.title || 'Official',
              avatar: profile.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
              institutionId: profile.institution_id || undefined,
            };
          }
        }
      } catch (err) {
        console.warn('Error fetching active session:', err);
      }
    }
    return null;
  },
};
