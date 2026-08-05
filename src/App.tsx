import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, SetupGuard, LoginGuard } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import SetupPage from '@/pages/SetupPage';
import DashboardPage from '@/pages/DashboardPage';
import InscriptionsPage from '@/pages/InscriptionsPage';
import AdminsPage from '@/pages/AdminsPage';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      {/* /login — only accessible when logged out */}
      <Route path="/login">
        <LoginGuard>
          <LoginPage />
        </LoginGuard>
      </Route>

      {/* /setup — only accessible when no admins exist */}
      <Route path="/setup">
        <SetupGuard>
          <SetupPage />
        </SetupGuard>
      </Route>

      {/* All other routes require authentication */}
      <Route>
        <ProtectedRoute>
          <AdminLayout>
            <Switch>
              <Route path="/" component={DashboardPage} />
              <Route path="/inscripciones" component={InscriptionsPage} />
              <Route path="/administradores">
                <ProtectedRoute requiredRole="superadmin">
                  <AdminsPage />
                </ProtectedRoute>
              </Route>
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster theme="dark" position="bottom-right" className="!font-sans" />
    </AuthProvider>
  );
}

export default App;

