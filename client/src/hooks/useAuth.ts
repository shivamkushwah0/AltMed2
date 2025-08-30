import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const localUserId = typeof window !== 'undefined' ? localStorage.getItem('altmed_user_id') : null;
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !localUserId,
  });
  console.log(user, localUserId);
  return {
    user: user || (localUserId ? ({ id: localUserId } as unknown as User) : undefined),
    isLoading: isLoading && !localUserId,
    isAuthenticated: !!localUserId || !!user,
  };
}
