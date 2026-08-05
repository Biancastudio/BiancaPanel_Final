import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth as _getAuth } from 'firebase-admin/auth';
import { getFirestore as _getFirestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin/app';

// ---------------------------------------------------------------------------
// JSON sanitisation helpers
// ---------------------------------------------------------------------------

/**
 * When a service account JSON is pasted into a secrets manager, the private_key
 * field sometimes ends up with LITERAL newline characters (ASCII 10) inside the
 * JSON string value instead of the two-char escape sequence `\n`.
 * This function walks the raw text character-by-character, finds the
 * "private_key" value, and replaces any bare newlines with their JSON escapes.
 * All other content is left completely untouched.
 */
function fixPrivateKeyNewlines(raw: string): string {
  const keyMarker = '"private_key"';
  const keyIdx = raw.indexOf(keyMarker);
  if (keyIdx === -1) return raw;

  // Find the opening quote of the value (skip whitespace / colon)
  let i = keyIdx + keyMarker.length;
  while (i < raw.length && raw[i] !== '"') i++;
  if (i >= raw.length) return raw;

  const valueStart = i + 1; // skip the opening quote

  // Walk forward to the closing quote, honouring backslash escapes
  let j = valueStart;
  while (j < raw.length) {
    const ch = raw[j];
    if (ch === '\\') { j += 2; continue; }
    if (ch === '"') break;
    j++;
  }
  if (j >= raw.length) return raw;

  const rawValue = raw.slice(valueStart, j);
  const fixedValue = rawValue
    .replace(/\r\n/g, '\\n')
    .replace(/\r/g, '\\n')
    .replace(/\n/g, '\\n');

  return raw.slice(0, valueStart) + fixedValue + raw.slice(j);
}

/**
 * Robustly parse FIREBASE_SERVICE_ACCOUNT_JSON handling the common ways it
 * ends up malformed when pasted into a secrets manager:
 *
 *   1. Normal: { "type": "service_account", ... }
 *   2. Missing opening brace: "type": "service_account", ...}
 *      (happens when the { was accidentally omitted when copying)
 *   3. Double-encoded: "{ \"type\": \"service_account\", ... }"
 *      (the whole object was JSON.stringify'd before being stored)
 *   4. Combinations of the above with literal newlines in private_key
 */
function parseServiceAccountJson(raw: string): ServiceAccount | null {
  const candidates: string[] = [
    raw,                          // 1. as-is
    '{' + raw.trimEnd(),          // 2. missing opening brace
  ];

  // 3. double-encoded — try to unwrap the outer JSON string first
  try {
    const inner = JSON.parse(raw);
    if (typeof inner === 'string') {
      candidates.push(inner);
      candidates.push('{' + inner.trimEnd());
    }
  } catch { /* ignore */ }

  for (const candidate of candidates) {
    // Try direct parse
    try {
      const v = JSON.parse(candidate);
      if (v && typeof v === 'object') return v as ServiceAccount;
    } catch { /* fall through */ }

    // Try with literal newlines fixed in private_key
    try {
      const v = JSON.parse(fixPrivateKeyNewlines(candidate));
      if (v && typeof v === 'object') return v as ServiceAccount;
    } catch { /* fall through */ }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Firebase Admin singleton
// ---------------------------------------------------------------------------

let _app: ReturnType<typeof initializeApp> | undefined;

function getFirebaseApp() {
  if (_app) return _app;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  const serviceAccount = parseServiceAccountJson(serviceAccountJson);
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  // Re-use an already-initialised app if one exists (e.g. hot-reload)
  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }

  _app = initializeApp({ credential: cert(serviceAccount) });
  return _app;
}

export function getAuth(): Auth {
  return _getAuth(getFirebaseApp());
}

export function getFirestore(): Firestore {
  return _getFirestore(getFirebaseApp());
}

