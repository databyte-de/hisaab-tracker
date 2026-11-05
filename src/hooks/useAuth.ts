import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(data.session);
      setError(error ? `Could not complete sign-in: ${error.message}` : null);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setError('Could not load your session. Please check your connection and try again.');
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession) { setLoading(false); setError(null); }
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) setError(`Could not start sign-in: ${error.message}`);
  };

  const signOut = () => supabase.auth.signOut();

  const user: User | null = session?.user ?? null;

  return { user, session, loading, error, signInWithGoogle, signOut };
}
