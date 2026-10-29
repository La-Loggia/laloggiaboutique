import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { loginAddress, staffPermissions } from '@/lib/staffAccess';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSubmissionsReader: boolean;
  canViewSubmissions: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmissionsReader, setIsSubmissionsReader] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let version = 0;
    const hydrate = async () => {
      const current = ++version;
      setLoading(true);
      const { data: { user: verifiedUser } } = await supabase.auth.getUser();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data: roles } = verifiedUser
        ? await supabase.from('user_roles').select('role').eq('user_id', verifiedUser.id)
        : { data: [] };
      if (!active || current !== version) return;
      const permissions = staffPermissions((roles ?? []).map((r) => r.role));
      setUser(verifiedUser);
      setSession(verifiedUser ? currentSession : null);
      setIsAdmin(permissions.isAdmin);
      setIsSubmissionsReader(permissions.isSubmissionsReader);
      setLoading(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      setTimeout(() => { if (active) void hydrate(); }, 0);
    });
    void hydrate();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: loginAddress(email), password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsSubmissionsReader(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isSubmissionsReader, canViewSubmissions: isAdmin || isSubmissionsReader, loading, signIn, signUp, signOut }}>
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
