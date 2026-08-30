import type { z } from "zod";

export const STORAGE_KEYS = {
  companyProfile: "tak-makker.company-profile",
  projectStore: "tak-makker.project-store",
  projectDraft: "tak-makker.project-draft",
  projectMessages: "tak-makker.project-messages",
  currentOffer: "tak-makker.current-offer",
} as const;

export function readStoredValue<T>(key: string, schema: z.ZodType<T>): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue === null) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    const result = schema.safeParse(parsedValue);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function writeStoredValue<T>(key: string, value: T, schema: z.ZodType<T>) {
  if (typeof window === "undefined") {
    return false;
  }

  const result = schema.safeParse(value);

  if (!result.success) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(result.data));
    return true;
  } catch {
    // Browser storage can be unavailable or full. In-memory state remains usable.
    return false;
  }
}

export function removeStoredValue(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Browser storage can be unavailable. In-memory state remains usable.
  }
}
