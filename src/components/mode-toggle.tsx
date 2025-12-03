"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-6 w-11 rounded-full bg-muted animate-pulse" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isDark
          ? "bg-primary shadow-inner"
          : "bg-muted hover:bg-muted/80"
      }`}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-background shadow-lg transition-transform ${
          isDark ? "translate-x-6" : "translate-x-1"
        }`}
      >
        <span className="flex size-full items-center justify-center">
          {isDark ? (
            <Moon className="size-2.5 text-primary" />
          ) : (
            <Sun className="size-2.5 text-amber-500" />
          )}
        </span>
      </span>
    </button>
  )
}
