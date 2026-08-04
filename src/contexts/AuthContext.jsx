import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Below this, a fresh page load doesn't count as a new "session" — avoids
// counting every route change/tab focus as separate app usage.
const ACTIVITY_THRESHOLD_MS = 30 * 60 * 1000;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const activityTrackedRef = useRef(false);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  // Passief gebruiksgedrag voor het admin dashboard — nergens zichtbaar in
  // de UI. Ref zorgt dat dit hooguit één keer per app-load vuurt; de
  // 30-min drempel op last_active_at zorgt dat een refresh/tab-wissel
  // binnen dezelfde sessie niet als nieuwe sessie meetelt.
  useEffect(() => {
    if (activityTrackedRef.current || !session || !profile) return;
    activityTrackedRef.current = true;

    const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null;
    const isStale = !lastActive || Date.now() - lastActive.getTime() > ACTIVITY_THRESHOLD_MS;
    if (!isStale) return;

    supabase
      .from('profiles')
      .update({
        last_active_at: new Date().toISOString(),
        total_sessions: (profile.total_sessions ?? 0) + 1,
      })
      .eq('id', profile.id);
  }, [session, profile]);

  async function signInWithMagicLink(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  }

  async function verifyEmailCode(email, token) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    if (session) await loadProfile(session.user.id);
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signInWithMagicLink,
    verifyEmailCode,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
