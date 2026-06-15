"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Browser client — session is stored in a cookie so the server can read it
const supabase = createClient();
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, AlertCircle, Building2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  // Form fields
  const [gymName, setGymName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // Auth guard: verify the session is valid before showing the form
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // If this user already has a gym linked to their profile, they don't
      // need onboarding — send them straight to the dashboard
      const { data: profile } = await supabase
        .from("profiles")
        .select("gym_id")
        .eq("id", user.id)
        .single();

      if (profile?.gym_id) {
        router.replace("/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    checkAuth();
  }, [router]);

  async function handleCreateGym(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // We need the current user's id to update their profile after creating the gym
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    // ── Step 1: Insert the new gym row ────────────────────────────────────────
    // This creates the gym and returns its generated UUID, which we need next.
    const { data: newGym, error: gymError } = await supabase
      .from("gyms")
      .insert({
        name: gymName,
        address: address || null,   // store null if left blank
        phone: phone || null,
      })
      .select("id")                 // ask Supabase to return the new row's id
      .single();

    if (gymError || !newGym) {
      setError("Could not create gym: " + (gymError?.message ?? "unknown error"));
      setLoading(false);
      return;
    }

    // ── Step 2: Link the profile to the new gym and promote role to 'admin' ──
    // The person who creates the gym becomes its admin automatically.
    // We update (not insert) because the profile row already exists from signup.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        gym_id: newGym.id,
        role: "admin",
      })
      .eq("id", user.id);

    if (profileError) {
      setError("Gym created but profile update failed: " + profileError.message);
      setLoading(false);
      return;
    }

    // Both steps succeeded — the dashboard will now show real gym data
    router.push("/dashboard");
  }

  // Show nothing while we verify the session (avoids a flash of the form)
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Dumbbell className="w-8 h-8 text-gray-300 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-gray-950" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FitCore</span>
        </div>

        <div className="space-y-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Set up your gym<br />in seconds.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Give your gym a name and we&apos;ll get everything ready for you.
            You can update these details any time from your settings.
          </p>
        </div>

        <p className="text-gray-600 text-sm">© 2025 FitCore. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FitCore</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">1</div>
              <span className="text-xs text-gray-400">Account</span>
            </div>
            <div className="h-px w-6 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-950 flex items-center justify-center text-xs font-semibold text-white">2</div>
              <span className="text-xs font-medium text-gray-900">Your Gym</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your gym</h2>
            <p className="text-gray-500 mt-1">You&apos;ll be set as the admin automatically</p>
          </div>

          <form onSubmit={handleCreateGym} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="gymName">Gym name <span className="text-red-500">*</span></Label>
              <Input
                id="gymName"
                type="text"
                placeholder="Iron & Oak Fitness"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
                autoComplete="organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating your gym…" : "Create gym & go to dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
