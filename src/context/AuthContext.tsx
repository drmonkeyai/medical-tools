import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  title: string;
  role: string;
  displayName: string;
};

type SignupInput = {
  email: string;
  username: string;
  fullName?: string;
  phone?: string;
  title?: string;
  password: string;
};

type UpdateProfileInput = {
  username: string;
  fullName: string;
  phone?: string;
  title?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: UpdateProfileInput) => Promise<void>;
};

type ProfileRow = {
  username?: string | null;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  title?: string | null;
  role?: string | null;
  display_name?: string | null;
} | null;

const AuthContext = createContext<AuthContextType | null>(null);

function mapUserWithProfile(
  authUser: { id: string; email?: string | null },
  profile?: ProfileRow
): AuthUser {
  const email = profile?.email ?? authUser.email ?? "";
  const username = profile?.username?.trim() || email;
  const fullName =
    profile?.full_name?.trim() ||
    profile?.display_name?.trim() ||
    "";
  const phone = profile?.phone?.trim() || "";
  const title = profile?.title?.trim() || "";
  const role = profile?.role?.trim() || "doctor";
  const displayName = fullName || username || email;

  return {
    id: authUser.id,
    email,
    username,
    fullName,
    phone,
    title,
    role,
    displayName,
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
    .select("username, email, full_name, phone, title, role, display_name")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error("FETCH PROFILE ERROR:", profileError);

    return mapUserWithProfile(authUser, {
      username: authUser.email,
      email: authUser.email,
      full_name: "",
      phone: "",
      title: "",
      role: "doctor",
      display_name: authUser.email,
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

    void init();

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
                email: session.user.email,
                full_name: "",
                phone: "",
                title: "",
                role: "doctor",
                display_name: session.user.email,
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

  async function refreshUser() {
    const currentUser = await fetchAuthUser();
    setUser(currentUser);
  }

  async function login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase().replace(/\s+/g, "");

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    await refreshUser();
  }

  async function signup(payload: SignupInput) {
    const email = payload.email.trim().toLowerCase().replace(/\s+/g, "");
    const username = payload.username.trim();

    if (!email) {
      throw new Error("Email là bắt buộc.");
    }

    if (!username) {
      throw new Error("Tên đăng nhập là bắt buộc.");
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          username,
          full_name: payload.fullName?.trim() || "",
          phone: payload.phone?.trim() || "",
          title: payload.title?.trim() || "",
          role: "doctor",
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function updateProfile(payload: UpdateProfileInput) {
    if (!user) {
      throw new Error("Bạn chưa đăng nhập.");
    }

    const nextUsername = payload.username.trim();
    if (!nextUsername) {
      throw new Error("Tên đăng nhập là bắt buộc.");
    }

    const updateData = {
      username: nextUsername,
      full_name: payload.fullName.trim() || null,
      display_name: payload.fullName.trim() || nextUsername,
      phone: payload.phone?.trim() || null,
      title: payload.title?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    await refreshUser();
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
      signup,
      logout,
      refreshUser,
      updateProfile,
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