import { Router, type IRouter } from 'express';
import { getAuth, getFirestore } from '../lib/firebase-admin.js';
import { requireAuth, requireSuperadmin, type AuthenticatedRequest } from '../middlewares/auth.js';

const router: IRouter = Router();

// ─── POST /admins/setup ─────────────────────────────────────────────────────
// Creates the FIRST superadmin. Only works when no admins exist in Firestore.
router.post('/setup', async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: 'name, email y password son requeridos' });
    return;
  }

  try {
    const db = getFirestore();
    const adminsSnap = await db.collection('admins').limit(1).get();
    if (!adminsSnap.empty) {
      res.status(409).json({ error: 'Ya existe un administrador. Usa el login.' });
      return;
    }

    const userRecord = await getAuth().createUser({ email, password, displayName: name });
    await db.collection('admins').doc(userRecord.uid).set({
      name,
      email,
      role: 'superadmin',
      createdAt: new Date(),
      createdBy: null,
      active: true,
    });

    res.status(201).json({ uid: userRecord.uid });
  } catch (err: any) {
    if (err?.code === 'auth/email-already-exists') {
      res.status(409).json({ error: 'El correo ya está en uso' });
      return;
    }
    res.status(500).json({ error: err?.message ?? 'Error al crear el superadmin' });
  }
});

// ─── GET /admins/users ──────────────────────────────────────────────────────
// Lists all admins from Firestore.
router.get('/users', requireAuth, requireSuperadmin, async (_req, res) => {
  try {
    const db = getFirestore();
    const snap = await db.collection('admins').get();
    const admins = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
        createdBy: data.createdBy ?? null,
        active: data.active ?? true,
      };
    });
    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Error al listar administradores' });
  }
});

// ─── POST /admins/users ─────────────────────────────────────────────────────
// Creates a new admin or moderator in Firebase Auth + Firestore.
router.post('/users', requireAuth, requireSuperadmin, async (req: AuthenticatedRequest, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'name, email, password y role son requeridos' });
    return;
  }

  if (!['admin', 'moderador'].includes(role)) {
    res.status(400).json({ error: 'role debe ser "admin" o "moderador"' });
    return;
  }

  try {
    const userRecord = await getAuth().createUser({ email, password, displayName: name });
    const db = getFirestore();
    const now = new Date();

    await db.collection('admins').doc(userRecord.uid).set({
      name,
      email,
      role,
      createdAt: now,
      createdBy: req.adminUid ?? null,
      active: true,
    });

    res.status(201).json({
      uid: userRecord.uid,
      email,
      name,
      role,
      createdAt: now.toISOString(),
      createdBy: req.adminUid ?? null,
      active: true,
    });
  } catch (err: any) {
    if (err?.code === 'auth/email-already-exists') {
      res.status(409).json({ error: 'El correo ya está registrado' });
      return;
    }
    res.status(500).json({ error: err?.message ?? 'Error al crear administrador' });
  }
});

// ─── PATCH /admins/users/:uid ───────────────────────────────────────────────
// Updates name and/or role of an existing admin in Firestore.
router.patch('/users/:uid', requireAuth, requireSuperadmin, async (req: AuthenticatedRequest, res) => {
  const { uid } = req.params;
  const { name, role } = req.body as { name?: string; role?: string };

  if (!uid) {
    res.status(400).json({ error: 'uid es requerido' });
    return;
  }

  if (role && !['superadmin', 'admin', 'moderador'].includes(role)) {
    res.status(400).json({ error: 'role inválido' });
    return;
  }

  try {
    const db = getFirestore();
    const docRef = db.collection('admins').doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      res.status(404).json({ error: 'Administrador no encontrado' });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (role) updates.role = role;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    await docRef.update(updates);

    if (name) {
      await getAuth().updateUser(uid, { displayName: name });
    }

    const updated = await docRef.get();
    const data = updated.data()!;
    res.json({
      uid,
      email: data.email,
      name: data.name,
      role: data.role,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      createdBy: data.createdBy ?? null,
      active: data.active ?? true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Error al actualizar administrador' });
  }
});

// ─── PATCH /admins/users/:uid/password ──────────────────────────────────────
// Changes the password of a Firebase Auth user.
router.patch('/users/:uid/password', requireAuth, requireSuperadmin, async (req, res) => {
  const { uid } = req.params;
  const { password } = req.body as { password?: string };

  if (!password || password.length < 8) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    return;
  }

  try {
    await getAuth().updateUser(uid, { password });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Error al cambiar contraseña' });
  }
});

// ─── DELETE /admins/users/:uid ───────────────────────────────────────────────
// Deletes an admin from Firebase Auth and Firestore.
router.delete('/users/:uid', requireAuth, requireSuperadmin, async (req: AuthenticatedRequest, res) => {
  const { uid } = req.params;

  // Prevent self-deletion
  if (uid === req.adminUid) {
    res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    return;
  }

  try {
    const db = getFirestore();
    const docSnap = await db.collection('admins').doc(uid).get();

    if (!docSnap.exists) {
      res.status(404).json({ error: 'Administrador no encontrado' });
      return;
    }

    if (docSnap.data()?.role === 'superadmin') {
      res.status(403).json({ error: 'No se puede eliminar al superadmin' });
      return;
    }

    await getAuth().deleteUser(uid);
    await db.collection('admins').doc(uid).delete();

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Error al eliminar administrador' });
  }
});

export default router;

