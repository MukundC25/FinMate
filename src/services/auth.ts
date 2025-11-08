import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@finmate_session';
const USER_KEY = '@finmate_user';

export interface Session {
  isLoggedIn: boolean;
  userId?: string;
  email?: string;
  loginMethod?: 'email' | 'google' | 'guest';
  loginTime?: string;
}

export const AuthService = {
  /**
   * Save session data
   */
  async saveSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session?.isLoggedIn || false;
    } catch (error) {
      return false;
    }
  },

  /**
   * Login with email
   */
  async loginWithEmail(email: string, password: string): Promise<Session> {
    // Simulate API call
    // In production, this would call your backend
    return {
      isLoggedIn: true,
      userId: 'user_' + Date.now(),
      email,
      loginMethod: 'email',
      loginTime: new Date().toISOString(),
    };
  },

  /**
   * Login as guest
   */
  async loginAsGuest(): Promise<Session> {
    return {
      isLoggedIn: true,
      userId: 'guest_' + Date.now(),
      loginMethod: 'guest',
      loginTime: new Date().toISOString(),
    };
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  /**
   * Clear all data (for testing)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
