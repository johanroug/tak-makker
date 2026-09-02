"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function SupabaseTest() {
  useEffect(() => {
    async function loadCompany() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("companies")
        .select("*");

      console.log("companies", data);
      console.log("error", error);
    }

    loadCompany();
  }, []);

  return <div>Supabase test</div>;
}