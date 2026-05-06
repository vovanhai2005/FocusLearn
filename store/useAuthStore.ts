// filepath: store/useAuthStore.ts
import { create } from "zustand";
import type { User, Role } from "@/types";
import { supabase, type Database } from "@/lib/supabase";
import { AvatarEmojis } from "@/constants/theme";

type UsersRow = Database["public"]["Tables"]["users"]["Row"];

// ─────────────────────────────────────────────────────────────
// STATE INTERFACE
// ─────────────────────────────────────────────────────────────

interface AuthState {
  // State
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setRole: (role: Role) => void;
  loginWithCode: (name: string, accessCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Convert Supabase DB row → app User type */
function rowToUser(row: {
  id: string;
  name: string;
  role: "student" | "teacher" | "parent";
  avatar_emoji: string;
  access_code: string;
  created_at: string;
  updated_at: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatarEmoji: row.avatar_emoji,
    accessCode: row.access_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Pick a random avatar emoji for new users */
function randomAvatar(): string {
  return AvatarEmojis[Math.floor(Math.random() * AvatarEmojis.length)];
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────
  user: null,
  role: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // ── Actions ────────────────────────────────────────────────

  /** Called on onboarding screen: pre-select role before login */
  setRole: (role: Role) => {
    set({ role });
  },

  /**
   * Login with student/teacher name + 6-digit access code.
   *
   * Flow:
   * 1. Look up user by access_code in `users` table
   * 2. Verify role matches what was selected on onboarding
   * 3. Sign in via Supabase Auth using a magic-link / custom token
   *    (For MVP we use email magic-link with code as password)
   * 4. Set user in state
   *
   * Returns `true` on success, `false` on failure (error is set in state).
   */
  loginWithCode: async (name: string, accessCode: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const selectedRole = get().role;

      // Query users table for matching access code
      const { data: rows, error: queryError } = await supabase
        .from("users")
        .select("*")
        .eq("access_code", accessCode.trim())
        .limit(1) as { data: UsersRow[] | null; error: { message: string } | null };

      if (queryError) throw new Error(queryError.message);

      if (!rows || rows.length === 0) {
        set({ error: "Mã số không đúng. Hãy kiểm tra lại!", isLoading: false });
        return false;
      }

      const userRow = rows[0];

      // Validate role matches selection
      if (selectedRole && userRow.role !== selectedRole) {
        set({
          error: `Mã số này thuộc về ${
            userRow.role === "teacher" ? "giáo viên" : "học sinh"
          }, không phải ${selectedRole === "teacher" ? "giáo viên" : "học sinh"}.`,
          isLoading: false,
        });
        return false;
      }

      // Validate name (case-insensitive, trimmed)
      const nameMatches =
        userRow.name.toLowerCase().trim() === name.toLowerCase().trim();
      if (!nameMatches) {
        set({ error: "Tên không khớp với mã số. Kiểm tra lại nhé!", isLoading: false });
        return false;
      }

      // Sign in anonymously via Supabase Auth, tagging the user ID
      // In a real app, the teacher creates accounts and assigns codes.
      // For MVP, we sign in with Supabase anonymous auth.
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw new Error(authError.message);

      const appUser = rowToUser(userRow);
      set({
        user: appUser,
        role: appUser.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Đã xảy ra lỗi. Thử lại nhé!";
      set({ error: message, isLoading: false });
      return false;
    }
  },

  /** Sign out and clear state */
  logout: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Hydrate store from persisted Supabase session.
   * Called once on app startup in app/_layout.tsx.
   */
  hydrate: async () => {
    set({ isLoading: true });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Fetch user profile from DB
      const { data: rows } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .limit(1) as { data: UsersRow[] | null; error: unknown };

      if (rows && rows.length > 0) {
        const appUser = rowToUser(rows[0]);
        set({
          user: appUser,
          role: appUser.role,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// ─────────────────────────────────────────────────────────────
// SELECTORS (for convenience in components)
// ─────────────────────────────────────────────────────────────

export const selectUser = (s: AuthState) => s.user;
export const selectRole = (s: AuthState) => s.role;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsLoading = (s: AuthState) => s.isLoading;
export const selectAuthError = (s: AuthState) => s.error;

// ─────────────────────────────────────────────────────────────
// AUTH STATE LISTENER (call once at app root)
// ─────────────────────────────────────────────────────────────

/**
 * Subscribe to Supabase auth state changes.
 * Call this in app/_layout.tsx useEffect.
 * Returns the unsubscribe function.
 */
export function subscribeToAuthChanges(): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        user: null,
        role: null,
        isAuthenticated: false,
      });
    }
  });
  return () => data.subscription.unsubscribe();
}

export { randomAvatar };
