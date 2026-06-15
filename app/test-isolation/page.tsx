"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function TestIsolation() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [plans, setPlans] = useState<{ name: string }[]>([]);

  async function loginAndCheck() {
    setMessage("Logging in...");
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setMessage("Login failed: " + loginError.message);
      return;
    }

    const { data, error } = await supabase
      .from("membership_plans")
      .select("name");

    if (error) {
      setMessage("Query error: " + error.message);
    } else {
      setPlans(data || []);
      setMessage("Logged in. Plans this user can see:");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Isolation Test</h1>
      <input
        className="border rounded px-3 py-2 w-64"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2 w-64"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={loginAndCheck}>Login & Check Plans</Button>
      <p>{message}</p>
      <ul>
        {plans.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}