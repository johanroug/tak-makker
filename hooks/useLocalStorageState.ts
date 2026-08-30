import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { z } from "zod";
import {
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from "@/lib/storage/browser-storage";

type UseLocalStorageStateOptions<T> = {
  key: string;
  schema: z.ZodType<T>;
  initialValue: T;
  removeWhenNull?: boolean;
};

export function useLocalStorageState<T>({
  key,
  schema,
  initialValue,
  removeWhenNull = false,
}: UseLocalStorageStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedValue = readStoredValue(key, schema);
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (storedValue !== null) {
        setValue(storedValue);
      }

      setHasHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [key, schema]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (removeWhenNull && value === null) {
      removeStoredValue(key);
      return;
    }

    writeStoredValue(key, value, schema);
  }, [hasHydrated, key, removeWhenNull, schema, value]);

  return [value, setValue];
}
