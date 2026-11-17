export const CUSTOMER_CREDENTIALS_KEY = "pjtb_portal_credentials_v1";

export const PREVIEW_LOGIN = {
  username: "testrun",
  password: "Pinnacle123!",
} as const;

export interface CustomerCredential {
  username: string;
  passwordHash: string;
}

export type CustomerCredentialStore = Record<string, CustomerCredential>;

export interface LoginCustomer {
  id?: string;
  customerId?: string;
  email?: string;
  accountNumber?: string;
  username?: string;
}

export function normalizeLoginIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function isPreviewCustomer(customer: LoginCustomer): boolean {
  return customer.id === "cust-testrun-1" || customer.customerId === "PJ-89201";
}

export function findCustomerForLogin<T extends LoginCustomer>(
  customers: T[],
  login: string,
  credentials: CustomerCredentialStore = {}
): T | null {
  const identifier = normalizeLoginIdentifier(login);
  if (!identifier) return null;

  const directMatch = customers.find((customer) =>
    [customer.username, customer.email, customer.customerId, customer.accountNumber].some(
      (value) => typeof value === "string" && normalizeLoginIdentifier(value) === identifier
    ) || (identifier === PREVIEW_LOGIN.username && isPreviewCustomer(customer))
  );
  if (directMatch) return directMatch;

  const credentialEntry = Object.entries(credentials).find(
    ([, credential]) => normalizeLoginIdentifier(credential.username) === identifier
  );
  if (!credentialEntry) return null;

  const [customerKey] = credentialEntry;
  return customers.find((customer) => customer.id === customerKey || customer.customerId === customerKey) || null;
}

export async function hashCustomerPassword(password: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Secure password hashing is unavailable in this browser.");
  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyCustomerPassword(
  customer: LoginCustomer,
  password: string,
  credentials: CustomerCredentialStore = {}
): Promise<boolean> {
  const credential = [customer.id, customer.customerId]
    .filter((key): key is string => Boolean(key))
    .map((key) => credentials[key])
    .find(Boolean);

  if (credential) return (await hashCustomerPassword(password)) === credential.passwordHash;
  if (isPreviewCustomer(customer)) return password === PREVIEW_LOGIN.password;
  return false;
}

export function readCustomerCredentials(): CustomerCredentialStore {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOMER_CREDENTIALS_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => {
        if (!value || typeof value !== "object") return false;
        const credential = value as Partial<CustomerCredential>;
        return typeof credential.username === "string" && typeof credential.passwordHash === "string";
      })
    ) as CustomerCredentialStore;
  } catch {
    return {};
  }
}

export async function saveCustomerCredentials(
  customer: LoginCustomer,
  username: string,
  password: string
): Promise<void> {
  const keys = [customer.id, customer.customerId].filter((key): key is string => Boolean(key));
  if (keys.length === 0) throw new Error("A customer ID is required to save login credentials.");

  const credentials = readCustomerCredentials();
  const credential: CustomerCredential = {
    username: username.trim(),
    passwordHash: await hashCustomerPassword(password),
  };
  keys.forEach((key) => {
    credentials[key] = credential;
  });
  localStorage.setItem(CUSTOMER_CREDENTIALS_KEY, JSON.stringify(credentials));
}
