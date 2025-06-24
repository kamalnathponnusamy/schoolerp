"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { metadata } from "./metadata"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only show sidebar if not on login page (/)
  const showSidebar = usePathname() !== "/"

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
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