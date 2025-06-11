"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Calendar, Eye, Edit, Trash2 } from "lucide-react"
import { Suspense } from "react"

interface Assignment {
  id: number
  title: string
  description: string
  subject_name: string
  class_name: string
  section: string
  teacher_name: string
  due_date: string
  assigned_date: string
}

interface Class {
  id: number
  class_name: string
  section: string
}

interface Subject {
  id: number
  subject_name: string
  class_id: number
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_id: "",
    class_id: "",
    due_date: "",
  })

  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      try {
        setError(null)
        setLoading(true)
        
        const [assignmentsResponse, classesResponse] = await Promise.all([
          fetch("/api/assignments"),
          fetch("/api/classes")
        ])

        if (!mounted) return

        if (!assignmentsResponse.ok || !classesResponse.ok) {
          throw new Error("Failed to fetch initial data")
        }

        const [assignmentsData, classesData] = await Promise.all([
          assignmentsResponse.json(),
          classesResponse.json()
        ])

        if (!mounted) return

        setAssignments(assignmentsData.assignments || [])
        setClasses(classesData.classes || [])
        setIsInitialized(true)
      } catch (err) {
        if (!mounted) return
        setError("Failed to initialize page data")
        console.error("Initialization error:", err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeData()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (formData.class_id) {
      fetchSubjectsByClass(formData.class_id)
    }
  }, [formData.class_id])

  const fetchSubjectsByClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/subjects/by-class?classId=${classId}`)
      if (response.ok) {
        const data = await response.json()
        setSubjects(data || [])
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setSubjects([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Assignment created successfully!")
        setFormData({
          title: "",
          description: "",
          subject_id: "",
          class_id: "",
          due_date: "",
        })
        const assignmentsResponse = await fetch("/api/assignments")
        if (assignmentsResponse.ok) {
          const data = await assignmentsResponse.json()
          setAssignments(data.assignments || [])
        }
      } else {
        alert("Failed to create assignment")
      }
    } catch (error) {
      console.error("Error creating assignment:", error)
      alert("Error creating assignment")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold">Error</h2>
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
              <p className="text-gray-600">Create and manage student assignments</p>
            </div>
            <Button onClick={() => (window.location.href = "/dashboard")}>Back to Dashboard</Button>
          </div>

          <Tabs defaultValue="create-assignment" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="create-assignment">Create Assignment</TabsTrigger>
              <TabsTrigger value="view-assignments">View Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="create-assignment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Assignment
                  </CardTitle>
                  <CardDescription>Create assignments for students</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Assignment Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Enter assignment title"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date *</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => handleInputChange("due_date", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="class_id">Class *</Label>
                        <Select value={formData.class_id} onValueChange={(value) => handleInputChange("class_id", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.length > 0 ? (
                              classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                  {cls.class_name} - {cls.section}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no_classes" disabled>
                                No classes available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject_id">Subject *</Label>
                        <Select
                          value={formData.subject_id}
                          onValueChange={(value) => handleInputChange("subject_id", value)}
                          disabled={!formData.class_id}
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Enter assignment description and instructions"
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? "Creating..." : "Create Assignment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="view-assignments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    All Assignments ({assignments.length})
                  </CardTitle>
                  <CardDescription>View and manage all assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading assignments...</div>
                  ) : assignments.length > 0 ? (
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{assignment.title}</h3>
                              <p className="text-gray-600 mt-1">{assignment.description}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span>
                                  <strong>Subject:</strong> {assignment.subject_name}
                                </span>
                                <span>
                                  <strong>Class:</strong> {assignment.class_name} - {assignment.section}
                                </span>
                                <span>
                                  <strong>Teacher:</strong> {assignment.teacher_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Due: {assignment.due_date}
                                </Badge>
                                <Badge variant="secondary">Assigned: {assignment.assigned_date}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No assignments found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Suspense>
  )
}
