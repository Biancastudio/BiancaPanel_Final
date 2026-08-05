export type AdminRole = 'superadmin' | 'admin' | 'moderador';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string; // ISO string
  createdBy: string | null; // uid of creator, null for first superadmin
  active: boolean;
}

export interface AuthState {
  user: import('firebase/auth').User | null;
  adminProfile: AdminUser | null;
  loading: boolean;
  isSetupRequired: boolean; // true if no admins exist yet
}
