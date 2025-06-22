"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useGetApiQuery, usePostApiMutation } from "@/hooks/useApiQuery";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for localStorage with SSR safety
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item === null) {
          setStoredValue(initialValue);
        } else if (
          typeof initialValue === "string" ||
          // Handle JWT tokens (they start with "eyJ" and are not valid JSON)
          (item.startsWith("eyJ") && item.includes("."))
        ) {
          setStoredValue(item as T);
        } else {
          setStoredValue(JSON.parse(item) as T);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        setStoredValue(initialValue);
      }
      setIsInitialized(true);
    }
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          if (typeof valueToStore === "string" || valueToStore === null) {
            window.localStorage.setItem(key, valueToStore as string);
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, isInitialized] as const;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken, isTokenInitialized] = useLocalStorage<
    string | null
  >("accessToken", null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query to fetch user data
  const {
    data: userData,
    isLoading,
    error,
  } = useGetApiQuery<{ user: User }>(["user", "me"], "/users/me", {
    enabled: !!accessToken && isTokenInitialized,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Use React Query mutations for auth operations
  const loginMutation = usePostApiMutation<
    { user: User; accessToken: string },
    { email: string; password: string }
  >("/auth/sign-in");

  const signupMutation = usePostApiMutation<
    { user: User },
    { name: string; email: string; password: string }
  >("/auth/sign-up");

  const logoutMutation = usePostApiMutation<
    { message: string },
    Record<string, never>
  >("/auth/sign-out");

  // Handle authentication errors and cross-tab synchronization
  useEffect(() => {
    if (!isTokenInitialized) return;

    const handleAuthError = () => {
      setAccessToken(null);
      queryClient.clear();
      router.push("/");
    };

    // Handle query errors (invalid token)
    if (error && accessToken) {
      handleAuthError();
      return;
    }

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        if (e.newValue === null) {
          handleAuthError();
        } else if (e.newValue && !accessToken) {
          // JWT is a plain string, not JSON, so set directly
          setAccessToken(e.newValue);
        }
      }
    };

    // Check token when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && accessToken) {
        const currentToken = localStorage.getItem("accessToken");
        if (!currentToken) {
          handleAuthError();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    error,
    accessToken,
    isTokenInitialized,
    setAccessToken,
    queryClient,
    router,
  ]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginMutation.mutateAsync({ email, password });
      const { accessToken: token } = response;

      setAccessToken(token);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
    [loginMutation, setAccessToken, queryClient]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      await signupMutation.mutateAsync({ name, email, password });
      // After signup, automatically sign in
      await login(email, password);
    },
    [signupMutation, login]
  );

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        try {
          await logoutMutation.mutateAsync({});
        } catch (error) {
          console.log("Logout endpoint failed:", error);
          // Continue with local logout even if backend call fails
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state regardless of backend response
      setAccessToken(null);
      queryClient.clear();
      router.push("/");
    }
  }, [accessToken, logoutMutation, setAccessToken, queryClient, router]);

  // Loading state: true when token is not initialized OR when checking auth and query is loading
  const loading = !isTokenInitialized || (!!accessToken && isLoading);

  // User is derived from query data
  const user = userData?.user || null;

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
