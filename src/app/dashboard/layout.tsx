"use client";


import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AIAssistantProvider from "@/components/ai-assistant/AIAssistantProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <AIAssistantProvider>
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-16 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full bg-card border-r border-border">
            <Sidebar />
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 bg-background">
            <div className="max-w-full">
              {children}

            </div>
          </main>
        </div>
      </div>
    </div>
    </AIAssistantProvider>
    </ProtectedRoute>
  );
}
