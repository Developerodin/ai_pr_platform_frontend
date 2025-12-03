"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { useAuth } from '@/contexts/auth-context';

// change from here 
export function Navbar() {
  const { user } = useAuth();

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
