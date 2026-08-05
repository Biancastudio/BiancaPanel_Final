import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminRole } from '@/types/admin';

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0D0B14]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] animate-pulse overflow-hidden">
          <img src="/bs-logo.png" alt="Bianca Studio" className="w-full h-full object-contain mix-blend-screen" />
        </div>
        <p className="text-muted-foreground text-sm">Verificando acceso...</p>
      </div>
    </div>
  );
}

interface ProtectedProps {
  children: React.ReactNode;
  requiredRole?: AdminRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedProps) {
  const { user, adminProfile, loading, isSetupRequired } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isSetupRequired) return <Redirect to="/setup" />;
  if (!user || !adminProfile) return <Redirect to="/login" />;

  const roleOrder: Record<AdminRole, number> = { superadmin: 3, admin: 2, moderador: 1 };
  if (requiredRole && roleOrder[adminProfile.role] < roleOrder[requiredRole]) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const { loading, isSetupRequired } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isSetupRequired) return <Redirect to="/login" />;
  return <>{children}</>;
}

export function LoginGuard({ children }: { children: React.ReactNode }) {
  const { loading, user, adminProfile, isSetupRequired } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isSetupRequired) return <Redirect to="/setup" />;
  if (user && adminProfile) return <Redirect to="/" />;
  return <>{children}</>;
}


