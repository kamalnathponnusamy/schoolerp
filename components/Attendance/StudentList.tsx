"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AttendanceToggle from "./AttendanceToggle"

interface Student {
  id: string
  student_id: string
  full_name: string
  status?: "present" | "absent"
}

interface StudentListProps {
  students: Student[]
  onStatusChange: (studentId: string, status: "present" | "absent") => void
}

export default function StudentList({ students, onStatusChange }: StudentListProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No students found in this class</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {students.map((student, index) => (
        <Card key={student.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                  <p className="text-sm text-gray-600">{student.student_id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={student.status === "present" ? "default" : "destructive"}
                  className={
                    student.status === "present" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }
                >
                  {student.status === "present" ? "Present" : "Absent"}
                </Badge>
                
                <AttendanceToggle
                  studentId={student.id}
                  status={student.status || "present"}
                  onStatusChange={onStatusChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}