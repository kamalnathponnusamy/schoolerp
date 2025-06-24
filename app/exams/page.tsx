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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Clock, BookOpen, Edit, Trash2, AlertCircle, Search, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Exam {
  id: number
  exam_code: string
  exam_name: string
  exam_type: string
  class_name: string
  section: string
  subject_name: string
  exam_date: string
  start_time: string
  end_time: string
  total_marks: number
  passing_marks: number
  results_entered: number
  status: string
  syllabus?: string
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

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [newExam, setNewExam] = useState({
    exam_name: "",
    exam_type: "",
    class_id: "",
    subject_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    total_marks: "",
    passing_marks: "",
    syllabus: "",
  })

  useEffect(() => {
    fetchExams()
    fetchClasses()
    fetchSubjects()
  }, [])

  const fetchExams = async () => {
    try {
      setError("")
      const response = await fetch("/api/exams")

      if (response.ok) {
        const data = await response.json()
        setExams(Array.isArray(data.exams) ? data.exams : [])
      } else {
        throw new Error("Failed to fetch exams")
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
      setError("Failed to load exams. Please refresh the page.")
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(Array.isArray(data.classes) ? data.classes : [])
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
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setSubjects([])
    }
  }

  const handleScheduleExam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (
        !newExam.exam_name ||
        !newExam.exam_type ||
        !newExam.class_id ||
        !newExam.subject_id ||
        !newExam.exam_date ||
        !newExam.start_time ||
        !newExam.end_time ||
        !newExam.total_marks ||
        !newExam.passing_marks
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const totalMarks = Number(newExam.total_marks)
      const passingMarks = Number(newExam.passing_marks)

      // Validate numeric fields
      if (isNaN(totalMarks) || isNaN(passingMarks) || totalMarks <= 0 || passingMarks <= 0) {
        toast({
          title: "Error",
          description: "Please enter valid marks values",
          variant: "destructive",
        })
        return
      }

      if (passingMarks > totalMarks) {
        toast({
          title: "Error",
          description: "Passing marks cannot be greater than total marks",
          variant: "destructive",
        })
        return
      }

      // Validate time
      if (newExam.start_time >= newExam.end_time) {
        toast({
          title: "Error",
          description: "End time must be after start time",
          variant: "destructive",
        })
        return
      }

      const examData: Record<string, any> = {
        ...newExam,
        class_id: Number(newExam.class_id),
        subject_id: Number(newExam.subject_id),
        total_marks: totalMarks,
        passing_marks: passingMarks,
        syllabus: newExam.syllabus || null,
      }

      // Remove any undefined values
      Object.keys(examData).forEach(key => {
        if (examData[key] === undefined) {
          examData[key] = null;
        }
      });

      console.log('Sending exam data:', JSON.stringify(examData, null, 2))

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "Exam scheduled successfully",
        })
        setIsAddModalOpen(false)
        resetForm()
        fetchExams()
      } else {
        console.error('Exam creation failed:', result)
        toast({
          title: "Error",
          description: result.error || "Failed to schedule exam",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scheduling exam:", error)
      toast({
        title: "Error",
        description: "Failed to schedule exam. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewExam({
      exam_name: "",
      exam_type: "",
      class_id: "",
      subject_id: "",
      exam_date: "",
      start_time: "",
      end_time: "",
      total_marks: "",
      passing_marks: "",
      syllabus: "",
    })
  }

  const upcomingExams = exams.filter((exam) => new Date(exam.exam_date) > new Date()).length
  const completedExams = exams.filter((exam) => exam.status === "completed").length
  const ongoingExams = exams.filter((exam) => exam.status === "ongoing").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const filteredExams = exams.filter(
    (exam) =>
      exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.class_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading exams...</p>
        </div>
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Exams Management</h1>
              <p className="text-muted-foreground">Schedule and manage examinations</p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule New Exam</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleScheduleExam} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exam_name">Exam Name *</Label>
                      <Input
                        id="exam_name"
                        value={newExam.exam_name}
                        onChange={(e) => setNewExam({ ...newExam, exam_name: e.target.value })}
                        placeholder="First Term Mathematics"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="exam_type">Exam Type *</Label>
                      <Select
                        value={newExam.exam_type}
                        onValueChange={(value) => setNewExam({ ...newExam, exam_type: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unit_test">Unit Test</SelectItem>
                          <SelectItem value="quarterly">Quarterly Exam</SelectItem>
                          <SelectItem value="half_yearly">Half Yearly Exam</SelectItem>
                          <SelectItem value="annual">Annual Exam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class_id">Class *</Label>
                      <Select
                        value={newExam.class_id}
                        onValueChange={(value) => setNewExam({ ...newExam, class_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.length > 0 ? (
                            classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.class_name} {cls.section}
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
                    <div>
                      <Label htmlFor="subject_id">Subject *</Label>
                      <Select
                        value={newExam.subject_id}
                        onValueChange={(value) => setNewExam({ ...newExam, subject_id: value })}
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
                      <Label htmlFor="exam_date">Exam Date *</Label>
                      <Input
                        id="exam_date"
                        type="date"
                        value={newExam.exam_date}
                        onChange={(e) => setNewExam({ ...newExam, exam_date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_time">Start Time *</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={newExam.start_time}
                        onChange={(e) => setNewExam({ ...newExam, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time *</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={newExam.end_time}
                        onChange={(e) => setNewExam({ ...newExam, end_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_marks">Total Marks *</Label>
                      <Input
                        id="total_marks"
                        type="number"
                        min="1"
                        value={newExam.total_marks}
                        onChange={(e) => setNewExam({ ...newExam, total_marks: e.target.value })}
                        placeholder="100"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="passing_marks">Passing Marks *</Label>
                      <Input
                        id="passing_marks"
                        type="number"
                        min="1"
                        value={newExam.passing_marks}
                        onChange={(e) => setNewExam({ ...newExam, passing_marks: e.target.value })}
                        placeholder="35"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="syllabus">Syllabus</Label>
                    <Textarea
                      id="syllabus"
                      value={newExam.syllabus}
                      onChange={(e) => setNewExam({ ...newExam, syllabus: e.target.value })}
                      placeholder="Chapters 1-5: Algebra, Geometry, Trigonometry"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Schedule Exam</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Exams</p>
                    <p className="text-2xl font-bold">{exams.length}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">{upcomingExams}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ongoing</p>
                    <p className="text-2xl font-bold text-yellow-600">{ongoingExams}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedExams}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exams Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <CardTitle>Scheduled Exams ({filteredExams.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Code</TableHead>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.exam_code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{exam.exam_name}</div>
                            <Badge variant="outline" className="mt-1">
                              {exam.exam_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{exam.class_name}</Badge>
                        </TableCell>
                        <TableCell>{exam.subject_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatDate(exam.exam_date)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {exam.start_time && exam.end_time && (
                            <span className="text-sm">
                              {Math.round(
                                (Number(new Date(`2000-01-01T${exam.end_time}`).getTime()) - Number(new Date(`2000-01-01T${exam.start_time}`).getTime())) /
                                  (1000 * 60),
                              )}{" "}
                              min
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{exam.total_marks} marks</div>
                            <div className="text-muted-foreground">Pass: {exam.passing_marks}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      {/* </div> */}
    </div>
  )
}
