import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function OwnerAccess({ children }: { children: ReactNode }) {
  const { loading, isSubmissionsReader } = useAuth();
  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando…</div>;
  if (isSubmissionsReader) return <Navigate to="/admin/subidas" replace />;
  return <>{children}</>;
}