"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon, BookMarked, CheckCircle2, Clock, Upload, Camera, FileText } from "lucide-react"
import { toast } from "sonner"
import { Class } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Homework {
  id: number
  title: string
  description: string
  class_id: number
  subject_id: number
  due_date: string
  status: "pending" | "completed"
  assigned_by: string
  attachment_path?: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  token: string
}

export default function HomeworkPage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadType, setUploadType] = useState<"file" | "camera">("file")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    class_id: "",
    subject_id: "",
    due_date: new Date(),
  })

  // Reset form state when closing - prevents state persistence issues
  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedClass(null)
    setSelectedFile(null)
    setNewHomework({
      title: "",
      description: "",
      class_id: "",
      subject_id: "",
      due_date: new Date(),
    })
  }

  const handleClassSelect = (classData: Class | null) => {
    setSelectedClass(classData)
    setNewHomework(prev => ({
      ...prev,
      class_id: classData?.id.toString() || ""
    }))
  }

  // Initialize data with proper error handling and user validation
  useEffect(() => {
    const initializeData = async () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          await fetchClasses(parsedUser)
        } else {
          toast.error("Please log in to view classes")
        }
      } catch (error) {
        console.error("Error initializing data:", error)
        toast.error("Failed to initialize data")
      }
    }

    initializeData()
    fetchHomework()
  }, [])

  // Optimized class fetching with duplicate prevention and type safety
  const fetchClasses = async (currentUser: User) => {
    if (!currentUser) {
      toast.error("Please log in to view classes")
      setClasses([])
      return
    }
    try {
      setIsLoadingClasses(true)
      const response = await fetch("/api/classes/by-teacher", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch classes: ${response.statusText}`)
      }
      const data = await response.json()
      const classArray = Array.isArray(data) ? data : data.classes
      if (!classArray || !Array.isArray(classArray)) {
        console.error("Invalid response format:", data)
        throw new Error("Invalid response format from server")
      }
      // Type-safe validation and duplicate removal using Set
      const uniqueClassIds = new Set<number>()
      const uniqueClasses = classArray.filter((item): item is Class => {
        if (!item || typeof item !== 'object') return false
        
        const isValidClass = (
          typeof item.id === 'number' &&
          typeof item.class_name === 'string' &&
          typeof item.section === 'string' &&
          typeof item.academic_year === 'string'
        )

        if (isValidClass && !uniqueClassIds.has(item.id)) {
          uniqueClassIds.add(item.id)
          return true
        }
        return false
      })

      if (uniqueClasses.length === 0) {
        toast.info("No classes available")
      }

      setClasses(uniqueClasses)
    } catch (error) {
      console.error("Error fetching classes:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch classes")
      setClasses([])
    } finally {
      setIsLoadingClasses(false)
    }
  }

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/homework")
      if (!response.ok) {
        throw new Error("Failed to fetch homework")
      }
      const data = await response.json()
      setHomework(data)
    } catch (error) {
      console.error("Error fetching homework:", error)
      toast.error("Failed to fetch homework")
    } finally {
      setLoading(false)
    }
  }

  // File handling with size and type validation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size should be less than 5MB")
        return
      }
      setSelectedFile(file)
    }
  }

  // Camera capture with proper error handling
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Implement camera capture logic here
      toast.info("Camera access granted")
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast.error("Failed to access camera")
    }
  }

  // Form submission with proper validation and error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) {
      toast.error("Please select a class")
      return
    }

    // Input validation with trimming
    if (!newHomework.title.trim() || !newHomework.description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("title", newHomework.title.trim())
      formData.append("description", newHomework.description.trim())
      formData.append("class_id", selectedClass.id.toString())
      formData.append("subject_id", newHomework.subject_id)
      formData.append("due_date", format(newHomework.due_date, "yyyy-MM-dd"))
      if (selectedFile) {
        formData.append("attachment", selectedFile)
      }

      const response = await fetch("/api/homework", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create homework")
      }

      toast.success("Homework assigned successfully")
      handleCloseForm()
      fetchHomework()
    } catch (error) {
      console.error("Error creating homework:", error)
      toast.error(error instanceof Error ? error.message : "Failed to assign homework")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setNewHomework(prev => ({
        ...prev,
        due_date: date
      }))
    }
  }

  const handleClassChange = (value: string) => {
    const classData = classes.find(c => c.id.toString() === value)
    if (classData) {
      handleClassSelect(classData)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Homework Management</h1>
          <p className="text-gray-500">Assign and track homework assignments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Assign New Homework"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 md:p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Title</label>
                <Input
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                  placeholder="Enter homework title"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Class</label>
                <Select
                  value={selectedClass ? selectedClass.id.toString() : ""}
                  onValueChange={(value: string) => {
                    if (!value) {
                      setSelectedClass(null)
                      return
                    }
                    const classData = classes.find(c => c.id.toString() === value)
                    if (classData) {
                      handleClassSelect(classData)
                    }
                  }}
                  disabled={isLoadingClasses || isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingClasses ? "Loading classes..." : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        {isLoadingClasses ? "Loading..." : "No classes available"}
                      </SelectItem>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.class_name} - {cls.section}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Subject</label>
                <Select
                  value={newHomework.subject_id}
                  onValueChange={(value: string) => setNewHomework({ ...newHomework, subject_id: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mathematics</SelectItem>
                    <SelectItem value="2">Science</SelectItem>
                    <SelectItem value="3">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Due Date</label>
                <div className="relative">
                  <Calendar
                    mode="single"
                    selected={newHomework.due_date}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    required
                    disabled={isSubmitting}
                    initialFocus
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <Textarea
                value={newHomework.description}
                onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                placeholder="Enter homework description"
                required
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Attachment</label>
              <Tabs value={uploadType} onValueChange={(value: string) => setUploadType(value as "file" | "camera")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" disabled={isSubmitting}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="camera" disabled={isSubmitting}>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                    {selectedFile && (
                      <Badge>
                        {selectedFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, JPG, PNG (max 5MB)
                  </p>
                </TabsContent>
                <TabsContent value="camera" className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleCameraCapture}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Open Camera
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Homework"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homework.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500">Assigned by {item.assigned_by}</p>
              </div>
              {item.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-gray-600 mb-4">{item.description}</p>
            {item.attachment_path && (
              <div className="mb-4">
                <Badge className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {item.attachment_path.split('/').pop()}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due: {format(new Date(item.due_date), "MMM d, yyyy")}</span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                item.status === "completed" 
                  ? "border-transparent bg-green-100 text-green-800" 
                  : "border-transparent bg-yellow-100 text-yellow-800"
              }`}>
                {item.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 