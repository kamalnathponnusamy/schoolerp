"use client"

import React, { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Class {
  id: string
  class_name: string
  section: string
}

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
    const selectedClassData = classes.find(cls => cls.id === classId)
    onClassSelect(selectedClassData || null)
  }

  return (
    <Select 
      value={selectedClass?.id || ""} 
      onValueChange={handleClassChange}
      disabled={loading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading classes..." : "Select a class"} />
      </SelectTrigger>
      <SelectContent>
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <SelectItem key={classItem.id} value={classItem.id}>
              {classItem.class_name} - {classItem.section}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-classes" disabled>
            {loading ? "Loading..." : "No classes available"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}