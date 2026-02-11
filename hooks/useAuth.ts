'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  user: User;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/auth/me');
        return response.data.user as User | null;
      } catch (error) {
        // Always return null on error, never throw
        return null;
      }
    },
    retry: false,
    staleTime: 0, // Always refetch on mount
    gcTime: 1000 * 60 * 5, // 5 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Remove the auto-refresh interval - let the interceptor handle it
  // This was causing issues with navigation

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await axios.post('/api/auth/login', credentials);
      return response.data as AuthResponse;
    },
    onSuccess: () => {
      // Immediately refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.refetchQueries({ queryKey: ['auth', 'user'] });
      
      // Small delay to ensure cookies are set
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.error || 'Login failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout');
    },
    onSuccess: () => {
      // Clear all queries immediately
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; currentPassword?: string; password?: string }) => {
      const response = await axios.put('/api/auth/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.error || 'Update failed');
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    refetchUser: refetch,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}