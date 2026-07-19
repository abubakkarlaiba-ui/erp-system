"use client"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { useUIStore } from "@/stores/uiStore"
import { useAuthStore } from "@/stores/authStore"
import { AnimatePresence, motion } from "framer-motion"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const [searchFocused, setSearchFocused] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        onClick={toggleSidebar}
        className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 transition-colors max-w-md",
          searchFocused
            ? "border-indigo-500 ring-1 ring-indigo-500"
            : "border-zinc-300 dark:border-zinc-700"
        )}
      >
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <kbd className="hidden rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 md:inline-block dark:border-zinc-700">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-80 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="p-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Notifications
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-700" />
                <div className="p-3 text-sm text-zinc-500">No new notifications</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                user ? getInitials(`${user.first_name || ""} ${user.last_name || ""}`) : "U"
              )}
            </div>
            <div className="hidden text-left md:block">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User" : "User"}
              </div>
              <div className="text-xs text-zinc-500">{user?.email || "User"}</div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-zinc-400 md:block" />
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="border-b border-zinc-200 p-3 dark:border-zinc-700">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User" : "User"}
                  </div>
                  <div className="text-xs text-zinc-500">{user?.email}</div>
                </div>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="border-t border-zinc-200 dark:border-zinc-700" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
export default Header
