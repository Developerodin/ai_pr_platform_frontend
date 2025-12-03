"use client";

import { useState, useEffect } from "react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { authApi } from "@/lib/api";
import { User } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await authApi.profile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      const localUser = localStorage.getItem('user_data');
      if (localUser) {
        setUser(JSON.parse(localUser));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Verification Banner - Now appears below navbar */}
      {user && user.email_verified !== true && (
        <EmailVerificationBanner 
          user={user}
          onVerified={loadUser}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your PR activities.
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}
