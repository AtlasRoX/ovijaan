/**
 * OBHIJAAN Server-Side Firebase REST Service
 * Fully isolated on the Next.js Server.
 * ZERO API keys, secrets, or endpoints are exposed to the client bundle.
 */

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "";
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || "";

export const isServerFirebaseConfigured = Boolean(
  FIREBASE_API_KEY &&
  FIREBASE_PROJECT_ID &&
  FIREBASE_API_KEY !== "your_api_key_here"
);

// ==========================================
// 1. FIRESTORE REST VALUE SERIALIZATION
// ==========================================

export function encodeFirestoreValue(val: any): any {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === "boolean") {
    return { booleanValue: val };
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (typeof val === "string") {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map((item) => encodeFirestoreValue(item)),
      },
    };
  }
  if (typeof val === "object") {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = encodeFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

export function decodeFirestoreValue(val: any): any {
  if (!val || typeof val !== "object") return val;
  if ("nullValue" in val) return null;
  if ("booleanValue" in val) return Boolean(val.booleanValue);
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return parseFloat(val.doubleValue);
  if ("stringValue" in val) return String(val.stringValue);
  if ("timestampValue" in val) return String(val.timestampValue);
  if ("arrayValue" in val) {
    return (val.arrayValue?.values || []).map((item: any) =>
      decodeFirestoreValue(item)
    );
  }
  if ("mapValue" in val) {
    const obj: Record<string, any> = {};
    const fields = val.mapValue?.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      obj[k] = decodeFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

export function encodeFirestoreDoc(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = encodeFirestoreValue(value);
  }
  return { fields };
}

export function decodeFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    result[key] = decodeFirestoreValue(val);
  }
  return result;
}

// ==========================================
// 2. SERVER-SIDE AUTHENTICATION (REST)
// ==========================================

export async function serverSignInWithEmail(email: string, pass: string) {
  if (!isServerFirebaseConfigured) {
    throw new Error("Server Firebase credentials not configured in .env.local");
  }

  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(4000),
    body: JSON.stringify({
      email,
      password: pass,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || "Authentication failed";
    throw new Error(errorMsg);
  }

  return {
    uid: data.localId,
    email: data.email,
    displayName: data.displayName || data.email?.split("@")[0] || "Competitor",
    photoURL: null,
  };
}

export async function serverSignUpWithEmail(
  email: string,
  pass: string,
  displayName?: string
) {
  if (!isServerFirebaseConfigured) {
    throw new Error("Server Firebase credentials not configured in .env.local");
  }

  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(4000),
    body: JSON.stringify({
      email,
      password: pass,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || "Sign up failed";
    throw new Error(errorMsg);
  }

  const user = {
    uid: data.localId,
    email: data.email,
    displayName: displayName?.trim() || data.email?.split("@")[0] || "Competitor",
    photoURL: null,
  };

  // Update profile name if provided
  if (displayName?.trim() && data.idToken) {
    try {
      const updateEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`;
      await fetch(updateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: data.idToken,
          displayName: displayName.trim(),
          returnSecureToken: false,
        }),
      });
    } catch (err) {
      console.warn("Could not set displayName on Firebase Auth account:", err);
    }
  }

  return user;
}

export async function serverSendPasswordReset(email: string) {
  if (!isServerFirebaseConfigured) {
    throw new Error("Server Firebase credentials not configured");
  }

  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestType: "PASSWORD_RESET",
      email,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to send reset email");
  }
  return { ok: true };
}

// ==========================================
// 3. SERVER-SIDE FIRESTORE PROXY (REST)
// ==========================================

export async function serverSaveFirestoreDoc(
  collection: string,
  docId: string,
  data: Record<string, any>
) {
  if (!isServerFirebaseConfigured) return;

  const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(3000),
    body: JSON.stringify(encodeFirestoreDoc(data)),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(`[Server Firestore] Save failed for ${collection}/${docId}:`, errorText);
  }
}

export async function serverDeleteFirestoreDoc(
  collection: string,
  docId: string
) {
  if (!isServerFirebaseConfigured) return;

  const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn(`[Server Firestore] Delete failed for ${collection}/${docId}:`, errorText);
  }
}

export async function serverFetchUserDocs<T = any>(
  collection: string,
  userId: string
): Promise<T[]> {
  if (!isServerFirebaseConfigured || !userId) return [];

  const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
  const queryPayload = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: "userId" },
          op: "EQUAL",
          value: { stringValue: userId },
        },
      },
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
      body: JSON.stringify(queryPayload),
    });

    if (!res.ok) {
      console.warn(`[Server Firestore] Query failed for ${collection}:`, await res.text());
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    const results: T[] = [];
    for (const item of items) {
      if (item.document) {
        const decoded = decodeFirestoreDoc(item.document);
        if (decoded) results.push(decoded as T);
      }
    }
    return results;
  } catch (err) {
    console.warn(`[Server Firestore] Error querying ${collection}:`, err);
    return [];
  }
}

// ==========================================
// 4. SERVER-SIDE CLOUD STORAGE UPLOAD (REST)
// ==========================================

export async function serverUploadFileToStorage(
  buffer: Buffer | Uint8Array,
  filename: string,
  mimeType: string,
  folder: string = "vault"
): Promise<{ url: string; name: string; size: number; type: string }> {
  if (!isServerFirebaseConfigured || !FIREBASE_STORAGE_BUCKET) {
    throw new Error("Server Firebase Storage is not configured");
  }

  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${folder}/${Date.now()}_${cleanName}`;
  const encodedPath = encodeURIComponent(storagePath);

  const endpoint = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o?uploadType=media&name=${encodedPath}&key=${FIREBASE_API_KEY}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
    },
    body: buffer as any,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firebase Storage server upload failed: ${errText}`);
  }

  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media`;

  return {
    url: downloadUrl,
    name: filename,
    size: buffer.length,
    type: mimeType,
  };
}
