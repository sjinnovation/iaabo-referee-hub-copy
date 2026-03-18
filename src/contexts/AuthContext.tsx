import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isApproved: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error?: string; userId?: string }>;
  signOut: () => Promise<void>;
  sendPasswordResetOtp: (email: string) => Promise<{ error?: string }>;
  verifyOtpAndResetPassword: (email: string, otp: string, newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  hasRole: (role: AppRole) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  }, []);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    return (data || []).map(r => r.role as AppRole);
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    const [userProfile, userRoles] = await Promise.all([
      fetchProfile(userId),
      fetchRoles(userId),
    ]);
    setProfile(userProfile);
    setRoles(userRoles);
  }, [fetchProfile, fetchRoles]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_OUT' || !newSession?.user) {
          setProfile(null);
          setRoles([]);
          setLoading(false);
          return;
        }

        if (newSession?.user) {
          setLoading(true);
          setTimeout(async () => {
            await loadUserData(newSession.user.id);
            setLoading(false);
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) {
      return { error: error.message };
    }

    return { userId: data.user?.id };
  };

  const sendPasswordResetOtp = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const verifyOtpAndResetPassword = async (email: string, otp: string, newPassword: string) => {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });
    if (verifyError) {
      return { error: verifyError.message };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return { error: updateError.message };
    }

    await supabase.auth.signOut();
    return {};
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    const nullableKeys = new Set(['street_address', 'city', 'state', 'zip_code', 'date_of_birth']);
    const allowedKeys = [
      'first_name', 'last_name', 'phone', 'street_address', 'city', 'state', 'zip_code',
      'date_of_birth', 'is_over_18',
    ] as const;
    const payload: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        const val = updates[key];
        payload[key] = (val === '' && nullableKeys.has(key)) ? null : val;
      }
    }
    if (Object.keys(payload).length === 0) return {};

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    await loadUserData(user.id);
    return {};
  };

  const hasRole = (role: AppRole) => {
    if (roles.includes('super_admin')) return true;
    return roles.includes(role);
  };

  const isApproved = roles.length > 0 && !roles.every(r => r === 'public_user');

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        roles,
        loading,
        isApproved,
        signIn,
        signUp,
        signOut,
        sendPasswordResetOtp,
        verifyOtpAndResetPassword,
        updateProfile,
        hasRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
