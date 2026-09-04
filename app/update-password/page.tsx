"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleUpdatePassword() {
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Adgangskoden skal være mindst 8 tegn.");
      return;
    }

    if (password !== repeatPassword) {
      setErrorMessage("Adgangskoderne er ikke ens.");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage("Kunne ikke ændre adgangskoden.");
        return;
      }

      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card card-stack w-full max-w-sm">
        <div>
          <h1 className="text-2xl font-semibold">Ny adgangskode</h1>
          <p>Vælg en ny adgangskode til Tak Makker.</p>
        </div>

        <label className="card-stack gap-1 text-sm">
          <span>Ny adgangskode</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>

        <label className="card-stack gap-1 text-sm">
          <span>Gentag adgangskode</span>
          <input
            type="password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            autoComplete="new-password"
          />
        </label>

        {errorMessage !== null && <p className="text-sm text-red-700">{errorMessage}</p>}

        <button
          type="button"
          onClick={() => {
            void handleUpdatePassword();
          }}
          disabled={isSaving}
        >
          {isSaving ? "Gemmer..." : "Gem ny adgangskode"}
        </button>
      </div>
    </main>
  );
}
