"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase.auth.getSession();
      if (error) {
        setStatus("Connection failed: " + error.message);
      } else {
        setStatus("Supabase connected!");
      }
    }
    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Button>Hello FitCore</Button>
      <p>{status}</p>
    </div>
  );
}