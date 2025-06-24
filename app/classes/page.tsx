"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, BookOpen, Edit, Eye, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Class {
  id: number
  class_name: string
  section: string
  teacher_name: string
  student_count: number
  academic_year: string
}

interface Teacher {
  id: number
  full_name: string
}

interface Summary {
  totalClasses: number
  totalSections: number
  totalStudents: number
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalClasses: 0,
    totalSections: 0,
    totalStudents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const [newClass, setNewClass] = useState({
    class_name: "",
    section: "A",
    class_teacher_id: "",
    academic_year: "2024-25",
  })

  useEffect(() => {
    fetchClasses()
    fetchTeachers()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/classes")
      const data = await response.json()

      if (response.ok) {
        setClasses(data.classes || [])
        setSummary(data.summary || { totalClasses: 0, totalSections: 0, totalStudents: 0 })
      } else {
        throw new Error(data.error || "Failed to fetch classes")
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
      setError("Failed to load classes. Please try again.")
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      const data = await response.json()
      setTeachers(data || [])
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newClass,
          class_teacher_id: newClass.class_teacher_id ? Number(newClass.class_teacher_id) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Class created successfully",
        })
        setIsAddModalOpen(false)
        setNewClass({
          class_name: "",
          section: "A",
          class_teacher_id: "",
          academic_year: "2024-25",
        })
        fetchClasses()
      } else {
        throw new Error("Failed to create class")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      })
    }
  }

  const viewClassDetails = (classId: number) => {
    // Navigate to class details page
    window.location.href = `/classes/${classId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* <div className="lg:pl-64"> */}
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Loading classes...</p>
            </div>
          </div>
        {/* </div> */}
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
              <AlertDescription>
                {error}
                <Button variant="outline" size="sm" className="ml-2" onClick={fetchClasses}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Classes Management</h1>
              <p className="text-muted-foreground">Manage classes, sections, and teacher assignments</p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClass} className="space-y-4">
                  <div>
                    <Label htmlFor="class_name">Class Name</Label>
                    <Select
                      value={newClass.class_name}
                      onValueChange={(value) => setNewClass({ ...newClass, class_name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LKG">LKG</SelectItem>
                        <SelectItem value="UKG">UKG</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={`Class ${i + 1}`}>
                            Class {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={newClass.section}
                      onValueChange={(value) => setNewClass({ ...newClass, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class_teacher_id">Class Teacher (Optional)</Label>
                    <Select
                      value={newClass.class_teacher_id}
                      onValueChange={(value) => setNewClass({ ...newClass, class_teacher_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">No teacher assigned</SelectItem>
                        {teachers.length > 0 ? (
                          teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                              {teacher.full_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_teachers" disabled>
                            No teachers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Input
                      id="academic_year"
                      value={newClass.academic_year}
                      onChange={(e) => setNewClass({ ...newClass, academic_year: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Class</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                    <p className="text-2xl font-bold">{summary.totalClasses}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{summary.totalStudents}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sections</p>
                    <p className="text-2xl font-bold">{summary.totalSections}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">📊</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Class Size</p>
                    <p className="text-2xl font-bold">
                      {summary.totalClasses > 0 ? Math.round(summary.totalStudents / summary.totalClasses) : 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">📅</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        Section {classItem.section}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Students</span>
                    </div>
                    <Badge variant="secondary">{classItem.student_count || 0}</Badge>
                  </div>

                  {classItem.teacher_name && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Class Teacher</span>
                      </div>
                      <span className="text-sm text-muted-foreground truncate max-w-24" title={classItem.teacher_name}>
                        {classItem.teacher_name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Academic Year</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{classItem.academic_year}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => viewClassDetails(classItem.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Class Hierarchy */}
          <Card>
            <CardHeader>
              <CardTitle>Class Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {["LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map((className) => {
                  const classData = classes.filter((c) => c.class_name === className)
                  const totalStudentsInClass = classData.reduce((sum, c) => sum + Number(c.student_count || 0), 0)

                  return (
                    <div
                      key={className}
                      className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-lg">{className}</div>
                      <div className="text-sm text-muted-foreground">
                        {classData.length} section{classData.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-sm font-medium text-blue-600">{totalStudentsInClass} students</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      {/* </div> */}
    </div>
  )
}
