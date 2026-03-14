export interface StoredCredential {
  name: string;
  password: string;
}

const STORAGE_KEY = "ci_credentials";

export function getCredentials(): Record<string, StoredCredential> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCredential(email: string, cred: StoredCredential): void {
  const all = getCredentials();
  all[email.toLowerCase()] = cred;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function validateCredential(
  email: string,
  password: string,
): StoredCredential | null {
  const all = getCredentials();
  const cred = all[email.toLowerCase()];
  if (!cred) return null;
  return cred.password === password ? cred : null;
}

export function seedDemoAccount(): void {
  const all = getCredentials();
  const demoEmail = "demo@coreinventory.com";
  if (!all[demoEmail]) {
    saveCredential(demoEmail, { name: "Demo User", password: "demo123" });
  }
}
