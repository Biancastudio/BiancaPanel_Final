import { auth } from '@/lib/firebase';
import type { AdminUser, AdminRole } from '@/types/admin';

async function getAuthHeader() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const BASE = '/api/admins';

export async function setupFirstAdmin(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ uid: string }> {
  const res = await fetch(`${BASE}/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error ?? 'Error al crear el Super Administrador');
  }
  return res.json();
}

export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<AdminUser> {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: await getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error ?? 'Error al crear administrador');
  }
  return res.json();
}

export async function listAdmins(): Promise<AdminUser[]> {
  const res = await fetch(`${BASE}/users`, {
    headers: await getAuthHeader(),
  });
  if (!res.ok) throw new Error('Error al cargar administradores');
  return res.json();
}

export async function updateAdmin(
  uid: string,
  data: { name?: string; role?: AdminRole }
): Promise<AdminUser> {
  const res = await fetch(`${BASE}/users/${uid}`, {
    method: 'PATCH',
    headers: await getAuthHeader(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error ?? 'Error al actualizar');
  }
  return res.json();
}

export async function changeAdminPassword(uid: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BASE}/users/${uid}/password`, {
    method: 'PATCH',
    headers: await getAuthHeader(),
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error ?? 'Error al cambiar contraseña');
  }
}

export async function deleteAdmin(uid: string): Promise<void> {
  const res = await fetch(`${BASE}/users/${uid}`, {
    method: 'DELETE',
    headers: await getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(err.error ?? 'Error al eliminar');
  }
}

