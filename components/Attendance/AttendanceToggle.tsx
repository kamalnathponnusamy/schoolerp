"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceToggleProps {
  studentId: string
  status: "present" | "absent"
  onStatusChange: (studentId: string, status: "present" | "absent") => void
}

export default function AttendanceToggle({ studentId, status, onStatusChange }: AttendanceToggleProps) {
  const handleToggle = (newStatus: "present" | "absent") => {
    onStatusChange(studentId, newStatus)
  }

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant={status === "present" ? "default" : "outline"}
        onClick={() => handleToggle("present")}
        className={cn(
          "flex items-center gap-1",
          status === "present" 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "border-green-300 text-green-600 hover:bg-green-50"
        )}
      >
        <Check className="h-4 w-4" />
        Present
      </Button>
      
      <Button
        size="sm"
        variant={status === "absent" ? "destructive" : "outline"}
        onClick={() => handleToggle("absent")}
        className={cn(
          "flex items-center gap-1",
          status === "absent" 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "border-red-300 text-red-600 hover:bg-red-50"
        )}
      >
        <X className="h-4 w-4" />
        Absent
      </Button>
    </div>
  )
}