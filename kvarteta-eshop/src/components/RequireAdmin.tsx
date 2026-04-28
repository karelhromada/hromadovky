import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../lib/adminAuth';

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const auth = useAdminAuth();

  if (auth.status === 'loading') {
    return (
      <div className="admin-loading-state">
        <p>Ověřuji oprávnění…</p>
      </div>
    );
  }

  if (auth.status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (auth.status === 'forbidden') {
    return (
      <div className="admin-forbidden glass-panel">
        <h2>Přístup odepřen</h2>
        <p>Tato stránka je dostupná pouze pro administrátory.</p>
      </div>
    );
  }

  return <>{children}</>;
}
