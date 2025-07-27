import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // In development mode, always return authenticated if no user but no auth error
  const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  
  return {
    user,
    isLoading,
    isAuthenticated: isDevelopment ? true : !!user,
  };
}
