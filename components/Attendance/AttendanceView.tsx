"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, RefreshCw, Calendar as CalendarIcon, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ClassSelector from "./ClassSelector"
import DatePicker from "./DatePicker"

interface Class {
  id: string
  class_name: string
  section: string
}

interface AttendanceRecord {
  id: string
  student_id: string
  student_name: string
  status: "present" | "absent"
  marked_by_teacher: string
  date: string
}

interface AttendanceViewProps {
  selectedClass: Class | null
  selectedDate: Date
  onClassSelect: (classData: Class | null) => void
  onDateSelect: (date: Date) => void
}

export default function AttendanceView({ 
  selectedClass, 
  selectedDate, 
  onClassSelect, 
  onDateSelect 
}: AttendanceViewProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedClass) {
      fetchAttendanceRecords()
    }
  }, [selectedClass, selectedDate])

  const fetchAttendanceRecords = async () => {
    if (!selectedClass) return

    try {
      setLoading(true)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/attendance?class_id=${selectedClass.id}&date=${dateStr}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch attendance records")
      }

      const data = await response.json()
      setAttendanceRecords(data.attendance || [])
    } catch (error) {
      console.error("Error fetching attendance records:", error)
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const presentCount = attendanceRecords.filter(record => record.status === "present").length
  const absentCount = attendanceRecords.filter(record => record.status === "absent").length
  const totalStudents = attendanceRecords.length
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassSelector 
              selectedClass={selectedClass}
              onClassSelect={onClassSelect}
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
              onDateSelect={onDateSelect}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Students:</span>
              <Badge variant="outline">{totalStudents}</Badge>
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

      {/* Attendance Records */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Attendance Records
                </CardTitle>
                <CardDescription>
                  {selectedClass.class_name} - {selectedClass.section} | {selectedDate.toLocaleDateString()}
                </CardDescription>
              </div>
              <Button 
                onClick={fetchAttendanceRecords}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading attendance records...</span>
              </div>
            ) : attendanceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Student ID</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Student Name</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{record.student_id}</td>
                        <td className="border border-gray-200 px-4 py-2 font-medium">{record.student_name}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          <Badge 
                            variant={record.status === "present" ? "default" : "destructive"}
                            className={
                              record.status === "present" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {record.status === "present" ? "Present" : "Absent"}
                          </Badge>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">{record.marked_by_teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
                <p className="text-gray-600">
                  No attendance has been marked for this class on {selectedDate.toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Selected</h3>
              <p className="text-gray-600">Please select a class to view attendance records</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}