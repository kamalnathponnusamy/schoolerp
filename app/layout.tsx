'use client'

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School ERP System",
  description: "Complete school management system"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only show sidebar if not on login page (/)
  const showSidebar = usePathname() !== "/"

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          {showSidebar && <Sidebar />}
          <main className={`flex-1 overflow-auto ${showSidebar ? 'md:ml-64' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}