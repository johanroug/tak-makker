"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("login data", data);
    console.log("login error", error);
  }

  async function getCurrentUser() {
    const supabase = createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log("current user", user);
    console.log("current user error", error);
  }

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="button" onClick={login}>
        Log ind
      </button>

      <button type="button" onClick={getCurrentUser}>
        Hent nuværende bruger
      </button>
    </div>
  );
}
