"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Plus, Trash2, User, BookOpen, Shield, Eye, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface Class {
  id: number
  class_name: string
  section: string
}

interface Subject {
  id: number
  subject_name: string
}

interface Teacher {
  id: number
  teacher_name: string
  user_id: number
  full_name: string
  subject: string
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

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [userRole, setUserRole] = useState<string>("admin")
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const [newEntry, setNewEntry] = useState({
    class_id: "",
    subject_id: "",
    teacher_id: "",
    day_of_week: "",
    start_time: "08:00",
    end_time: "08:45",
    room_number: "",
  })

  useEffect(() => {
    // Get user role and ID from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserRole(user.role || "admin")
        setCurrentUserId(user.id)
      } catch (e) {
        console.error("Error parsing user data:", e)
        setUserRole("admin")
      }
    }

    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.all([fetchTimetable(), fetchClasses(), fetchSubjects(), fetchTeachers()])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load data. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTimetable = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedClass && selectedClass !== "all") {
        params.append("class_id", selectedClass)
      }

      if (userRole === "teacher" && currentUserId) {
        const teacherResponse = await fetch(`/api/teachers?user_id=${currentUserId}`)
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json()
          if (teacherData.length > 0) {
            params.append("teacher_id", teacherData[0].id.toString())
          }
        }
      }

      console.log('Fetching timetable with params:', params.toString())
      const response = await fetch(`/api/timetable?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Received timetable data:', data)
        setTimetable(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to fetch timetable")
      }
    } catch (error) {
      console.error("Error fetching timetable:", error)
      setTimetable([])
    }
  }

  // Add useEffect to refetch timetable when selectedClass changes
  useEffect(() => {
    if (!loading) {
      fetchTimetable()
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(Array.isArray(data.classes) ? data.classes : [])
      } else {
        throw new Error("Failed to fetch classes")
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
      setClasses([])
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects")
      if (response.ok) {
        const data = await response.json()
        setSubjects(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to fetch subjects")
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setSubjects([])
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to fetch teachers")
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
      setTeachers([])
    }
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEntry,
          class_id: Number.parseInt(newEntry.class_id),
          subject_id: Number.parseInt(newEntry.subject_id),
          teacher_id: Number.parseInt(newEntry.teacher_id),
          day_of_week: Number.parseInt(newEntry.day_of_week),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "Timetable entry added successfully!",
        })
        setIsAddModalOpen(false)
        resetForm()
        fetchTimetable()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add timetable entry",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding timetable entry:", error)
      toast({
        title: "Error",
        description: "Failed to add timetable entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEntry = async (id: number) => {
    if (confirm("Are you sure you want to delete this timetable entry?")) {
      try {
        const response = await fetch(`/api/timetable?id=${id}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (response.ok) {
          toast({
            title: "Success",
            description: result.message || "Timetable entry deleted successfully!",
          })
          fetchTimetable()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete timetable entry",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting timetable entry:", error)
        toast({
          title: "Error",
          description: "Failed to delete timetable entry. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setNewEntry({
      class_id: "0",
      subject_id: "0",
      teacher_id: "0",
      day_of_week: "0",
      start_time: "08:00",
      end_time: "08:45",
      room_number: "",
    })
  }

  const getTimetableGrid = () => {
    const grid: { [key: string]: TimetableEntry[] } = {}
    console.log('Creating timetable grid with entries:', timetable)

    DAYS.forEach((day) => {
      TIME_SLOTS.forEach((time) => {
        const key = `${day.value}-${time}`
        const entries = timetable.filter((entry) => {
          const entryTimeFormatted = entry.start_time ? entry.start_time.substring(0, 5) : ''; // Extract HH:MM
          const matches = entry.day_of_week === day.value && entryTimeFormatted === time
          if (matches) {
            console.log('Found matching entry:', entry, 'for key:', key)
          }
          return matches
        })
        grid[key] = entries
      })
    })

    console.log('Final timetable grid:', grid)
    return grid
  }

  const timetableGrid = getTimetableGrid()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading timetable...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <div className="lg:pl-64"> */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {userRole === "admin" && <Shield className="h-8 w-8 text-blue-600" />}
                {userRole === "teacher" && <User className="h-8 w-8 text-green-600" />}
                {userRole === "student" && <Eye className="h-8 w-8 text-purple-600" />}
                Timetable Management
              </h1>
              <p className="text-muted-foreground">
                {userRole === "admin" && "Schedule and manage class timetables"}
                {userRole === "teacher" && "View your teaching schedule"}
                {userRole === "student" && "View your class timetable"}
              </p>
              <Badge variant="outline" className="mt-2">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Access
              </Badge>
            </div>
            {userRole === "admin" && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Timetable Entry</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddEntry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="class_id">Class *</Label>
                        <Select
                          value={newEntry.class_id}
                          onValueChange={(value) => setNewEntry({ ...newEntry, class_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.class_name} {cls.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject_id">Subject *</Label>
                        <Select
                          value={newEntry.subject_id}
                          onValueChange={(value) => setNewEntry({ ...newEntry, subject_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.length > 0 ? (
                              subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.subject_name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no_subjects" disabled>
                                No subjects available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="teacher_id">Teacher *</Label>
                        <Select
                          value={newEntry.teacher_id}
                          onValueChange={(value) => setNewEntry({ ...newEntry, teacher_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                {teacher.full_name} - {teacher.subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="day_of_week">Day *</Label>
                        <Select
                          value={newEntry.day_of_week}
                          onValueChange={(value) => setNewEntry({ ...newEntry, day_of_week: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time *</Label>
                        <Select
                          value={newEntry.start_time}
                          onValueChange={(value) => setNewEntry({ ...newEntry, start_time: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time *</Label>
                        <Select
                          value={newEntry.end_time}
                          onValueChange={(value) => setNewEntry({ ...newEntry, end_time: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select end time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="room_number">Room Number *</Label>
                        <Input
                          id="room_number"
                          value={newEntry.room_number}
                          onChange={(e) => setNewEntry({ ...newEntry, room_number: e.target.value })}
                          placeholder="e.g., Room 101"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Entry</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Class Filter */}
          {(userRole === "admin" || userRole === "student") && (
            <Card>
              <CardHeader>
                <CardTitle>Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.class_name} {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timetable Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Timetable
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
                                  className={`mb-1 p-2 border rounded text-xs ${
                                    userRole === "teacher"
                                      ? "bg-green-50 border-green-200"
                                      : userRole === "student"
                                        ? "bg-purple-50 border-purple-200"
                                        : "bg-blue-50 border-blue-200"
                                  }`}
                                >
                                  <div className="font-medium">{entry.subject_name}</div>
                                  <div className="text-gray-600">{entry.class_name}</div>
                                  <div className="text-gray-600">{entry.teacher_name}</div>
                                  <div className="text-gray-600">{entry.room_number}</div>
                                  {userRole === "admin" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 mt-1"
                                      onClick={() => handleDeleteEntry(entry.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <CardTitle className="text-sm font-medium">
                  {userRole === "admin"
                    ? "Active Teachers"
                    : userRole === "teacher"
                      ? "Your Classes"
                      : "Weekly Classes"}
                </CardTitle>
                <User className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userRole === "admin" ? new Set(timetable.map((t) => t.teacher_id)).size : timetable.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(timetable.length * 0.75)}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      {/* </div> */}
    </div>
  )
}
