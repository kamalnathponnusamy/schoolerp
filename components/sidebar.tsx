"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Bus,
  Package,
  FileText,
  Calendar,
  Settings,
  Menu,
  X,
  Clock,
  Star,
  Shield,
} from "lucide-react"

const navigation = [
  // STUDENT & TEACHER SHARED: Dashboard
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Overview & Analytics",
    roles: ["admin", "teacher", "student"],
  },
  // STUDENT ONLY
  {
    name: "Timetable",
    href: "/timetable",
    icon: Clock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Schedule & Timing",
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Assignments",
    href: "/assignments",
    icon: FileText,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    description: "Assignments",
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Attendance",
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    description: "Analytics & Reports",
    roles: ["admin", "teacher", "student"],
  },
  // TEACHER ONLY
  {
    name: "Mark Attendance",
    href: "/attendance",
    icon: Clock,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Mark Attendance",
    roles: ["teacher"],
  },
  {
    name: "Assign Homework",
    href: "/homework",
    icon: BookOpen,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Assign Homework",
    roles: ["teacher"],
  },
  // ADMIN/STAFF ONLY
  {
    name: "Students",
    href: "/students",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Student Management",
    roles: ["admin"],
  },
  {
    name: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Staff Directory",
    roles: ["admin"],
  },
  {
    name: "Classes",
    href: "/classes",
    icon: BookOpen,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Class Management",
    roles: ["admin"],
  },
  {
    name: "Transport",
    href: "/transport",
    icon: Bus,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    description: "Route Management",
    roles: ["admin"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "Stock & Assets",
    roles: ["admin"],
  },
  {
    name: "Exams",
    href: "/exams",
    icon: Calendar,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "Examination System",
    roles: ["admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    description: "System Configuration",
    roles: ["admin"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [])

  // Strict role-based filtering
  let filteredNavigation: typeof navigation = []
  if (user) {
    if (user.role === "student") {
      filteredNavigation = navigation.filter(
        (item) =>
          ["Dashboard", "Timetable", "Assignments", "Attendance", "Reports"].includes(item.name) &&
          item.roles.includes("student")
      )
    } else if (user.role === "teacher") {
      filteredNavigation = navigation.filter(
        (item) =>
          ["Dashboard", "Mark Attendance", "Assign Homework", "Timetable"].includes(item.name) &&
          item.roles.includes("teacher")
      )
    } else if (user.role === "admin") {
      filteredNavigation = navigation.filter((item) => item.roles.includes("admin"))
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-lg hover:shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="h-2.5 w-2.5 text-yellow-900" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                EduPro
              </h1>
              <p className="text-xs text-gray-600">School Management</p>
            </div>
          </div>

          {/* User Profile */}
          {user && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name || "User"}</p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs bg-white border-purple-200 text-purple-700">
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation (scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-6 space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105",
                      isActive
                        ? `${item.bgColor} ${item.color} shadow-md border border-opacity-20`
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                        isActive ? "bg-white shadow-sm" : "group-hover:bg-white group-hover:shadow-sm",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-all duration-200",
                          isActive ? item.color : "text-gray-500 group-hover:text-gray-700",
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Logout Button (fixed above footer) */}
          <div className="px-6 pb-4">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                localStorage.removeItem("user");
                document.cookie = "session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
          </div>

          {/* Footer (always at bottom) */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-600">Secure Connection</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Online</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">© 2024 EduPro. All rights reserved.</div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
