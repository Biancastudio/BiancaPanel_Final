import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { collection, getDocs, doc, onSnapshot, query, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AdminUser, AuthState } from '@/types/admin';

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshAdminProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    adminProfile: null,
    loading: true,
    isSetupRequired: false,
  });

  useEffect(() => {
    // First: check if any admins exist (setup required check)
    const checkSetup = async () => {
      try {
        const adminsSnap = await getDocs(query(collection(db, 'admins'), limit(1)));
        return adminsSnap.empty;
      } catch (err) {
        console.error("Error checking setup status:", err);
        return false;
      }
    };

    let unsubAdmin: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubAdmin) { unsubAdmin(); unsubAdmin = null; }

      if (!user) {
        const isSetupRequired = await checkSetup();
        setState({ user: null, adminProfile: null, loading: false, isSetupRequired });
        return;
      }

      // Subscribe to admin profile in Firestore
      unsubAdmin = onSnapshot(doc(db, 'admins', user.uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setState({
            user,
            adminProfile: {
              uid: user.uid,
              email: user.email ?? '',
              name: data.name,
              role: data.role,
              createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? '',
              createdBy: data.createdBy ?? null,
              active: data.active ?? true,
            },
            loading: false,
            isSetupRequired: false,
          });
        } else {
          // User exists in Auth but not in Firestore admins — sign them out
          firebaseSignOut(auth);
        }
      });
    });

    return () => {
      unsubAuth();
      if (unsubAdmin) unsubAdmin();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const refreshAdminProfile = () => {
    // onSnapshot handles this automatically
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, refreshAdminProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

