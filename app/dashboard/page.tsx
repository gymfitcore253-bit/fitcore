"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Browser client — session is stored in a cookie so the server can read it
const supabase = createClient();
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  Dumbbell,
  LogOut,
  Activity,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string;
  role: string;
  gym_id: string | null;
}

interface Gym {
  name: string;
  address: string | null;
}

// ── Static data ───────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Members",   href: "/members",   icon: Users },
  { label: "Plans",     href: "/plans",     icon: ClipboardList },
  { label: "Sessions",  href: "/sessions",  icon: Calendar },
  { label: "Payments",  href: "/payments",  icon: CreditCard },
];

const statCards = [
  {
    label: "Total Members",
    icon: Users,
    description: "Registered gym members",
  },
  {
    label: "Active Today",
    icon: Activity,
    description: "Check-ins recorded today",
  },
  {
    label: "Revenue This Month",
    icon: DollarSign,
    description: "Payments collected",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      // Auth guard: getUser() makes a network call to verify the token with Supabase.
      // If there's no valid session, we immediately redirect to login.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Fetch the user's profile row (created during signup)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role, gym_id")
        .eq("id", user.id)
        .single();

      if (profileData) {
        // If the user hasn't created a gym yet, send them to onboarding.
        // This handles the case where someone navigates to /dashboard directly
        // after signing up but before completing gym setup.
        if (!profileData.gym_id) {
          router.replace("/onboarding");
          return;
        }

        setProfile(profileData);

        // Profile is linked to a gym — fetch the gym's details for the top bar
        if (profileData.gym_id) {
          const { data: gymData } = await supabase
            .from("gyms")
            .select("name, address")
            .eq("id", profileData.gym_id)
            .single();

          if (gymData) setGym(gymData);
        }
      }

      setLoading(false);
    }

    loadUserData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    // signOut clears the local session; redirect enforces the UI change
    router.push("/login");
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-gray-300 animate-pulse mx-auto" />
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Dashboard layout ───────────────────────────────────────────────────────

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sidebar (desktop) ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-gray-950 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 text-gray-950" />
          </div>
          <span className="text-lg font-bold tracking-tight">FitCore</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = label === "Dashboard";
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {profile && (
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{profile.role}</p>
          </div>
        )}
      </aside>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          {/* Mobile logo (only shown when sidebar is hidden) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 bg-gray-950 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                {gym?.name ?? "FitCore"}
              </h1>
              {gym?.address && (
                <p className="text-xs text-gray-500 mt-0.5">{gym.address}</p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>

        {/* Page body */}
        <main className="flex-1 p-6 space-y-6">

          {/* Greeting */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {firstName ? `Good to see you, ${firstName}!` : "Welcome to your dashboard"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Here&apos;s a snapshot of your gym today.
            </p>
          </div>

          {/* Stat cards — numbers are placeholders until real queries are wired up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map(({ label, icon: Icon, description }) => (
              <Card key={label} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {label}
                  </CardTitle>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900">—</p>
                    <span className="text-xs text-gray-400">(placeholder)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming-soon placeholder */}
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <TrendingUp className="w-9 h-9 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">More features coming soon</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Members, sessions, plans, and payments will live here once each
                section is built out.
              </p>
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
