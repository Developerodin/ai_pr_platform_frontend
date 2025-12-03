"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <h1 className="text-lg font-semibold">AI-Powered PR Platform</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {user.credits_remaining} credits
            </Badge>
            <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
              {user.plan.toUpperCase()}
            </Badge>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.first_name[0]}{user.last_name[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
