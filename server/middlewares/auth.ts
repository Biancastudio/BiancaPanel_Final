import type { Request, Response, NextFunction } from 'express';
import { getAuth, getFirestore } from '../lib/firebase-admin.js';

export interface AuthenticatedRequest extends Request {
  adminUid?: string;
  adminRole?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado: falta token' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.adminUid = decoded.uid;

    // Verify the user exists in Firestore admins collection
    const adminDoc = await getFirestore().collection('admins').doc(decoded.uid).get();
    if (!adminDoc.exists) {
      res.status(403).json({ error: 'Acceso denegado: usuario no es administrador' });
      return;
    }

    req.adminRole = adminDoc.data()?.role as string;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireSuperadmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.adminRole !== 'superadmin') {
    res.status(403).json({ error: 'Se requiere rol de superadmin' });
    return;
  }
  next();
}

