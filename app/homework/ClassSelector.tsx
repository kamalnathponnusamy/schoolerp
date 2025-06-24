"use client"

import React, { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Class } from "@/lib/db"

interface ClassSelectorProps {
  selectedClass: Class | null
  onClassSelect: (classData: Class | null) => void
}

export default function ClassSelector({ selectedClass, onClassSelect }: ClassSelectorProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/classes")
      
      if (!response.ok) {
        throw new Error("Failed to fetch classes")
      }

      const data = await response.json()
      setClasses(data.classes || data || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClassChange = (classId: string) => {
    const selectedClassData = classes.find(cls => cls.id.toString() === classId)
    onClassSelect(selectedClassData || null)
  }

  return (
    <Select 
      value={selectedClass?.id.toString() || ""} 
      onValueChange={handleClassChange}
      disabled={loading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading classes..." : "Select a class"} />
      </SelectTrigger>
      <SelectContent>
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <SelectItem key={classItem.id} value={classItem.id.toString()}>
              {classItem.class_name} - {classItem.section}
            </SelectItem>
          ))
        ) : (
          <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none text-muted-foreground">
            {loading ? "Loading..." : "No classes available"}
          </div>
        )}
      </SelectContent>
    </Select>
  )
}