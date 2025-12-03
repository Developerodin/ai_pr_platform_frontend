"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  Users, 
  FileText, 
  Send, 
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Building2,
  MessageCircleIcon
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Journalists",
    href: "/dashboard/journalists",
    icon: Users,
  },
  {
    title: "AI Pitches",
    href: "/dashboard/pitches",
    icon: FileText,
  },
  {
    title: "Campaigns",
    href: "/dashboard/campaigns", 
    icon: Send,
  },
  {
  title: "Digital Newsroom",
  href: "/dashboard/newsroom",
  icon: Building2,
  },
    {
  title: "PR Agent",
  href: "/dashboard/pragent",
  icon: MessageCircleIcon,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    toast.success("Logged out successfully");
    router.push('/login');
  };

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            PR Platform
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
