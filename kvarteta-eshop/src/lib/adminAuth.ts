import { useAuth } from '../context/AuthContext';

export type AdminAuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | { status: 'admin' };

export function useAdminAuth(): AdminAuthState {
  const { user, loading } = useAuth();

  if (loading) return { status: 'loading' };
  if (!user) return { status: 'unauthenticated' };

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== 'admin') return { status: 'forbidden' };

  return { status: 'admin' };
}
