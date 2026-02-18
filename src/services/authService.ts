import { supabase } from '../config/supabase';
import { generateId } from '../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  loginMethod: 'email' | 'google' | 'apple' | 'guest';
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */
export const AuthService = {
  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthSession> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name,
          login_method: 'email',
        });

      if (profileError) throw profileError;

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || null,
          name,
          avatarUrl: null,
          loginMethod: 'email',
        },
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
      };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthSession> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signin');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || null,
          name: profile.name,
          avatarUrl: profile.avatar_url,
          loginMethod: profile.login_method as any,
        },
        accessToken: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
      };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  },

  /**
   * Continue as guest (creates anonymous user)
   */
  async continueAsGuest(name: string = 'Guest User'): Promise<AuthSession> {
    try {
      const guestId = `guest_${generateId()}`;
      
      await AsyncStorage.setItem('guest_user', JSON.stringify({
        id: guestId,
        name,
        loginMethod: 'guest',
      }));

      return {
        user: {
          id: guestId,
          email: null,
          name,
          avatarUrl: null,
          loginMethod: 'guest',
        },
        accessToken: '',
        refreshToken: '',
      };
    } catch (error) {
      console.error('❌ Guest login error:', error);
      throw error;
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await AsyncStorage.removeItem('guest_user');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          return {
            user: {
              id: session.user.id,
              email: session.user.email || null,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              loginMethod: profile.login_method as any,
            },
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          };
        }
      }

      const guestData = await AsyncStorage.getItem('guest_user');
      if (guestData) {
        return {
          user: JSON.parse(guestData),
          accessToken: '',
          refreshToken: '',
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'finmate://auth/reset-password',
      });
      if (error) throw error;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (error) {
      console.error('❌ Update password error:', error);
      throw error;
    }
  },
};
