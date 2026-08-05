import {
  collection, doc, updateDoc, deleteDoc, query,
  orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Inscription, InscriptionStatus } from '@/types/inscription';

const COLLECTION = 'magicland_iv_inscriptions';

/** Converts a Firebase Timestamp or raw value to ISO string. */
function toISO(val: any): string | undefined {
  if (!val) return undefined;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return val;
  return undefined;
}

export function subscribeToInscriptions(
  callback: (inscriptions: Inscription[]) => void
) {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => {
      const raw = d.data();
      return {
        ...raw,
        id: d.id,
        timestamp: toISO(raw.timestamp),
        updatedAt: toISO(raw.updatedAt),
      } as Inscription;
    });
    callback(data);
  });
}

export async function deleteInscription(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function updateInscriptionStatus(
  id: string,
  status: InscriptionStatus
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    estado: status,
    updatedAt: serverTimestamp(),
  });
}


