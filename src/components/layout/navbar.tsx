"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from '@/contexts/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();

  // Remove the loadUser function and useEffect entirely
  // The user data should come from the auth context, not fetched here

  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              AI PR Platform
            </h1>
          </div>
        </div>

        {/* Right Side - Credits & Plan */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          {user && (
            <>
              <Badge variant="secondary" className="flex items-center gap-1 font-medium">
                <span className="font-mono text-sm">{user.credits_remaining}</span>
                <span className="text-xs">credits</span>
              </Badge>
              
              <Badge variant={user.plan === 'pro' ? 'default' : 'outline'} className="font-medium">
                {user.plan.toUpperCase()}
              </Badge>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
