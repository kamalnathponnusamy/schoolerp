"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, Save, Eye, Calendar as CalendarIcon, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ClassSelector from "./ClassSelector"
import DatePicker from "./DatePicker"
import StudentList from "./StudentList"
import AttendanceView from "./AttendanceView"

interface Class {
  id: string
  class_name: string
  section: string
}

interface Student {
  id: string
  student_id: string
  full_name: string
  status?: "present" | "absent"
}

interface AttendanceRecord {
  student_id: string
  status: "present" | "absent"
}

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false)
  const { toast } = useToast()

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id)
      checkAttendanceStatus()
    }
  }, [selectedClass, selectedDate])

  const fetchStudents = async (classId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students?class_id=${classId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }

      const data = await response.json()
      // Initialize all students as present by default
      const studentsWithStatus = data.map((student: Student) => ({
        ...student,
        status: "present" as const
      }))
      
      setStudents(studentsWithStatus)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAttendanceStatus = async () => {
    if (!selectedClass) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/attendance?class_id=${selectedClass.id}&date=${dateStr}`)
      
      if (response.ok) {
        const data = await response.json()
        setAttendanceSubmitted(data.attendance && data.attendance.length > 0)
      }
    } catch (error) {
      console.error("Error checking attendance status:", error)
    }
  }

  const handleStudentStatusChange = (studentId: string, status: "present" | "absent") => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status }
          : student
      )
    )
  }

  const handleSubmitAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      toast({
        title: "Error",
        description: "Please select a class and ensure students are loaded",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const attendanceData = {
        class_id: selectedClass.id,
        date: selectedDate.toISOString().split('T')[0],
        attendance: students.map(student => ({
          student_id: student.id,
          status: student.status || "present"
        }))
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit attendance")
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: result.message || "Attendance submitted successfully!",
      })
      
      setAttendanceSubmitted(true)
    } catch (error) {
      console.error("Error submitting attendance:", error)
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const presentCount = students.filter(s => s.status === "present").length
  const absentCount = students.filter(s => s.status === "absent").length
  const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-blue-600" />
              Attendance Management
            </h1>
            <p className="text-gray-600">Mark and track student attendance</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {selectedDate.toLocaleDateString()}
          </Badge>
        </div>

        <Tabs defaultValue="mark-attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view-attendance">View Records</TabsTrigger>
          </TabsList>

          <TabsContent value="mark-attendance" className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Class</CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassSelector 
                    selectedClass={selectedClass}
                    onClassSelect={setSelectedClass}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <DatePicker 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <Badge variant="outline">{students.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <Badge className="bg-green-100 text-green-800">{presentCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent:</span>
                    <Badge className="bg-red-100 text-red-800">{absentCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <Badge variant="secondary">{attendancePercentage}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student List */}
            {selectedClass && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {selectedClass.class_name} - {selectedClass.section}
                      </CardTitle>
                      <CardDescription>
                        Mark attendance for {selectedDate.toLocaleDateString()}
                        {attendanceSubmitted && (
                          <Badge className="ml-2 bg-green-100 text-green-800">
                            Attendance Already Submitted
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={handleSubmitAttendance}
                      disabled={saving || students.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading students...</span>
                    </div>
                  ) : (
                    <StudentList 
                      students={students}
                      onStatusChange={handleStudentStatusChange}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {!selectedClass && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Selected</h3>
                    <p className="text-gray-600">Please select a class to view students and mark attendance</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="view-attendance" className="space-y-6">
            <AttendanceView 
              selectedClass={selectedClass}
              selectedDate={selectedDate}
              onClassSelect={setSelectedClass}
              onDateSelect={setSelectedDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}