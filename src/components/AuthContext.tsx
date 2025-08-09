import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  isEmployee: boolean;
  isAdmin: boolean;
  userProfile: any;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      setUserRole('user'); // Default to user role on error
      setUserProfile(null);
      return;
    }
    
    setUserRole(data?.role || 'user');
    setUserProfile(data);
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserRole(null);
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set loading to false after role is fetched
  useEffect(() => {
    if (userRole !== null || !user) {
      setLoading(false);
    }
  }, [userRole, user]);

  const signUp = async (email: string, password: string, fullName: string, role: string = 'user') => {
    // Client-side email validation
    const emailSchema = z.string().email("Please enter a valid email address");
    
    try {
      emailSchema.parse(email);
    } catch (error) {
      return { error: { message: "Please enter a valid email address" } };
    }

    // Validate role
    if (!['user', 'employee'].includes(role)) {
      return { error: { message: "Invalid role specified" } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any existing state
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Fetch user profile to determine role for redirect
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        
        const userRole = profileData?.role || 'user';
        
        // Redirect based on role
        if (userRole === 'employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signOut fails
      navigate('/auth');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Client-side email validation
      const emailSchema = z.string().email("Please enter a valid email address");
      emailSchema.parse(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { error: { message: "Please enter a valid email address" } };
      }
      return { error };
    }
  };

  const isEmployee = userRole === 'employee' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      userRole, 
      isEmployee,
      isAdmin,
      userProfile,
      signUp, 
      signIn, 
      signOut,
      resetPassword,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};