import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapUserWithProfile(
  authUser: { id: string; email?: string | null },
  profile?: {
    username?: string | null;
    display_name?: string | null;
    role?: string | null;
  } | null
): AuthUser {
  const email = authUser.email ?? "";

  return {
    id: authUser.id,
    email,
    username: profile?.username ?? email,
    displayName: profile?.display_name ?? email,
    role: profile?.role ?? "doctor",
  };
}

async function fetchAuthUser(): Promise<AuthUser | null> {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, display_name, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error("FETCH PROFILE ERROR:", profileError);

    return mapUserWithProfile(authUser, {
      username: authUser.email,
      display_name: authUser.email,
      role: "doctor",
    });
  }

  return mapUserWithProfile(authUser, profile);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const currentUser = await fetchAuthUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("INIT AUTH ERROR:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      fetchAuthUser()
        .then((nextUser) => {
          if (isMounted) {
            setUser(nextUser);
          }
        })
        .catch((error) => {
          console.error("AUTH STATE CHANGE ERROR:", error);
          if (isMounted) {
            setUser(
              mapUserWithProfile(session.user, {
                username: session.user.email,
                display_name: session.user.email,
                role: "doctor",
              })
            );
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const currentUser = await fetchAuthUser();
    setUser(currentUser);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUser(null);
  }

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthProvider chưa được dùng");
  }
  return ctx;
}