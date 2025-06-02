"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BookOpen, MapPin } from "lucide-react"

interface TimetableEntry {
  id: number
  class_id: number
  subject_id: number
  teacher_id: number
  day_of_week: number
  start_time: string
  end_time: string
  room_number: string
  class_name: string
  section: string
  subject_name: string
  teacher_name: string
}

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

const TIME_SLOTS = ["08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "12:30", "13:15", "14:00", "14:45", "15:30"]

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)

  useEffect(() => {
    // Get teacher ID from user data
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role === "teacher") {
        // You'll need to get the teacher ID from the teachers table
        fetchTeacherId(user.id)
      }
    }
  }, [])

  const fetchTeacherId = async (userId: number) => {
    try {
      const response = await fetch(`/api/teachers?user_id=${userId}`)
      if (response.ok) {
        const teachers = await response.json()
        if (teachers.length > 0) {
          setTeacherId(teachers[0].id)
          fetchTimetable(teachers[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching teacher ID:", error)
      setLoading(false)
    }
  }

  const fetchTimetable = async (teacherId: number) => {
    try {
      const response = await fetch(`/api/timetable?teacher_id=${teacherId}`)
      if (response.ok) {
        const data = await response.json()
        setTimetable(data)
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimetableGrid = () => {
    const grid: { [key: string]: TimetableEntry[] } = {}

    DAYS.forEach((day) => {
      TIME_SLOTS.forEach((time) => {
        const key = `${day.value}-${time}`
        grid[key] = timetable.filter((entry) => entry.day_of_week === day.value && entry.start_time === time)
      })
    })

    return grid
  }

  const getTodayClasses = () => {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    const adjustedToday = today === 0 ? 7 : today // Convert Sunday to 7
    return timetable
      .filter((entry) => entry.day_of_week === adjustedToday)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  const timetableGrid = getTimetableGrid()
  const todayClasses = getTodayClasses()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your timetable...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Timetable</h1>
        <p className="text-muted-foreground">Your teaching schedule and class assignments</p>
      </div>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayClasses.map((entry) => (
                <div key={entry.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="default">
                      {entry.start_time} - {entry.end_time}
                    </Badge>
                    <Badge variant="outline">{entry.room_number}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{entry.subject_name}</h3>
                  <p className="text-gray-600">
                    {entry.class_name} {entry.section}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {entry.room_number}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No classes scheduled for today</p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Time</th>
                  {DAYS.map((day) => (
                    <th key={day.value} className="border border-gray-200 px-4 py-2 text-center">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => (
                  <tr key={time}>
                    <td className="border border-gray-200 px-4 py-2 font-medium bg-gray-50">{time}</td>
                    {DAYS.map((day) => {
                      const entries = timetableGrid[`${day.value}-${time}`] || []
                      return (
                        <td key={`${day.value}-${time}`} className="border border-gray-200 px-2 py-2">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="mb-1 p-2 bg-green-50 border border-green-200 rounded text-xs"
                            >
                              <div className="font-medium">{entry.subject_name}</div>
                              <div className="text-gray-600">
                                {entry.class_name} {entry.section}
                              </div>
                              <div className="text-gray-600">{entry.room_number}</div>
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetable.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetable.length * 0.75}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(timetable.map((t) => t.subject_name)).size}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
