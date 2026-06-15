"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup() {
    setMessage("Creating account...");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Account created! Check your Supabase dashboard.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-bold">Sign Up</h1>
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
      <Button onClick={handleSignup}>Create Account</Button>
      <p>{message}</p>
    </div>
  );
}