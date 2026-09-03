"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function SupabaseTest() {
  useEffect(() => {
    async function loadCompany() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", "4eb2b39d-f7ea-492a-9952-f68c86918c0d")
        .single();

      console.log("companies", data);
      console.log("error", error);
    }

    loadCompany();
  }, []);

  return <div>Supabase test</div>;
}