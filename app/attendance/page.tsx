"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { UserCheck, CalendarIcon, Save, Eye } from "lucide-react"

interface Class {
  id: number
  class_name: string
  section: string
}

interface Student {
  id: number
  student_id: string
  full_name: string
  status?: "present" | "absent" | "late" | "half_day"
}

interface AttendanceRecord {
  id: number
  student_name: string
  student_id: string
  class_name: string
  section: string
  status: string
  date: string
  marked_by_teacher: string
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClasses()
    fetchTodayAttendance()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass)
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchStudentsByClass = async (classId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students/by-class?classId=${classId}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students.map((student: any) => ({ ...student, status: "present" })))
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch("/api/attendance/today")
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data.attendance)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
    }
  }

  const updateStudentStatus = (studentId: number, status: "present" | "absent" | "late" | "half_day") => {
    setStudents((prev) => prev.map((student) => (student.id === studentId ? { ...student, status } : student)))
  }

  const saveAttendance = async () => {
    if (!selectedClass) {
      alert("Please select a class")
      return
    }

    setSaving(true)
    try {
      const attendanceData = students.map((student) => ({
        student_id: student.id,
        date: selectedDate.toISOString().split("T")[0],
        status: student.status,
        class_id: selectedClass,
      }))

      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attendance: attendanceData }),
      })

      if (response.ok) {
        alert("Attendance saved successfully!")
        fetchTodayAttendance()
      } else {
        alert("Failed to save attendance")
      }
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert("Error saving attendance")
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "half_day":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600">Mark and track student attendance</p>
          </div>
          <Button onClick={() => (window.location.href = "/dashboard")}>Back to Dashboard</Button>
        </div>

        <Tabs defaultValue="mark-attendance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view-attendance">View Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="mark-attendance">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Select Date & Class
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Class</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.class_name} - {cls.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedClass && students.length > 0 && (
                      <Button onClick={saveAttendance} disabled={saving} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Attendance"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Student List */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Students ({students.length})
                    </CardTitle>
                    <CardDescription>
                      {selectedClass
                        ? `Mark attendance for ${selectedDate.toLocaleDateString()}`
                        : "Select a class to view students"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading students...</div>
                    ) : students.length > 0 ? (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-gray-600">{student.student_id}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={student.status === "present" ? "default" : "outline"}
                                onClick={() => updateStudentStatus(student.id, "present")}
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={student.status === "absent" ? "destructive" : "outline"}
                                onClick={() => updateStudentStatus(student.id, "absent")}
                              >
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant={student.status === "late" ? "secondary" : "outline"}
                                onClick={() => updateStudentStatus(student.id, "late")}
                              >
                                Late
                              </Button>
                              <Button
                                size="sm"
                                variant={student.status === "half_day" ? "secondary" : "outline"}
                                onClick={() => updateStudentStatus(student.id, "half_day")}
                              >
                                Half Day
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {selectedClass ? "No students found in this class" : "Please select a class"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="view-attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Today's Attendance Records
                </CardTitle>
                <CardDescription>View attendance marked for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Student ID</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Class</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Marked By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">{record.student_id}</td>
                          <td className="border border-gray-200 px-4 py-2">{record.student_name}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            {record.class_name} - {record.section}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">{record.marked_by_teacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
