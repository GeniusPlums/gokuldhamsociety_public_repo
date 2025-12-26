import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  referral_code: string;
    endorsement_count: number;
    referred_by: string | null;
    role: string | null;
  }


interface Flat {
  id: string;
  building: string;
  flat_number: string;
  owner_id: string | null;
  trust_score: number;
  chaos_score: number;
  contribution_score: number;
  is_claimed: boolean;
  tier: string;
  endorsements_required: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  flat: Flat | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, referredBy?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [flat, setFlat] = useState<Flat | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData as Profile);
      
      const { data: flatData } = await supabase
        .from('flats')
        .select('*')
        .eq('owner_id', profileData.id)
        .maybeSingle();
      
      setFlat(flatData as Flat);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

    useEffect(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 0);
          } else {
            setProfile(null);
            setFlat(null);
          }
        }
      );
  
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });

      // Realtime subscription for the current user's profile and flat
      let profileSubscription: any = null;
      let flatSubscription: any = null;

      if (user) {
        profileSubscription = supabase
          .channel(`public:profiles:user_id=eq.${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles',
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchProfile(user.id);
            }
          )
          .subscribe();

        // We don't have a direct user_id on flats, but we have owner_id which matches profile.id
        // However, we can just listen to all flats changes if needed, or if we have the profile id already.
      }
  
      return () => {
        subscription.unsubscribe();
        if (profileSubscription) supabase.removeChannel(profileSubscription);
      };
    }, [user?.id]);

  const signUp = async (email: string, password: string, displayName: string, referredBy?: string) => {
    const redirectUrl = "https://gokuldhamsociety.com/";
    
    let referredById = null;
    if (referredBy) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referredBy)
        .maybeSingle();
      if (referrer) referredById = referrer.id;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
          referred_by: referredById
        },
      },
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setFlat(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      flat,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
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
