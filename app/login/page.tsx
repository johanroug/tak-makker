"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setIsLoggingIn(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("E-mail eller adgangskode er forkert.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card card-stack w-full max-w-sm">
        <div>
          <h1 className="text-2xl font-semibold">Tak Makker</h1>
          <p>Log ind for at fortsætte</p>
        </div>

        <label className="card-stack gap-1 text-sm">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="card-stack gap-1 text-sm">
          <span>Adgangskode</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        {errorMessage !== null && (
          <p className="text-sm">{errorMessage}</p>
        )}

        <button
          type="button"
          onClick={() => {
            void handleLogin();
          }}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Logger ind..." : "Log ind"}
        </button>
      </div>
    </main>
  );
}