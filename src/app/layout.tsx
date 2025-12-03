import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI-Powered PR Platform",
  description: "Generate professional PR content with AI, manage journalist relationships, and track campaign performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        
                  <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster />
                  </ThemeProvider>
      </body>
    </html>
  );
}
