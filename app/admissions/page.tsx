"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Upload, Download, Search, Eye, Edit, Trash2, FileSpreadsheet } from "lucide-react"
import { Suspense } from "react"

interface Class {
  id: number
  class_name: string
  section: string
  academic_year: string
}

interface Student {
  id: number
  student_id: string
  full_name: string
  class_name: string
  section: string
  admission_date: string
  status: string
}

export default function Admissions() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    class_id: "",
    admission_number: "",
    admission_date: "",
    father_name: "",
    mother_name: "",
    guardian_phone: "",
    blood_group: "",
    transport_opted: false,
  })

  const fetchData = async () => {
    try {
      setError(null)
      setLoading(true)
      
      const [classesResponse, studentsResponse] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/students/list")
      ])

      if (!classesResponse.ok || !studentsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [classesData, studentsData] = await Promise.all([
        classesResponse.json(),
        studentsResponse.json()
      ])

      setClasses(classesData.classes || [])
      setStudents(studentsData.students || [])
    } catch (err) {
      setError("Failed to fetch data")
      console.error("Data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeData = async () => {
      try {
        setError(null)
        setLoading(true)
        
        const [classesResponse, studentsResponse] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/students/list")
        ])

        if (!mounted) return

        if (!classesResponse.ok || !studentsResponse.ok) {
          throw new Error("Failed to fetch initial data")
        }

        const [classesData, studentsData] = await Promise.all([
          classesResponse.json(),
          studentsResponse.json()
        ])

        if (!mounted) return

        setClasses(classesData.classes || [])
        setStudents(studentsData.students || [])
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

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return []
    
    const searchLower = searchTerm.toLowerCase()
    return students.filter((student) => {
      if (!student) return false
      return (
        (student.full_name?.toLowerCase() || "").includes(searchLower) ||
        (student.student_id?.toLowerCase() || "").includes(searchLower)
      )
    })
  }, [students, searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Student admitted successfully! Student ID: ${result.student_id}`)
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          date_of_birth: "",
          address: "",
          class_id: "",
          admission_number: "",
          admission_date: "",
          father_name: "",
          mother_name: "",
          guardian_phone: "",
          blood_group: "",
          transport_opted: false,
        })
        await fetchData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error submitting form")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      "full_name",
      "email",
      "phone",
      "date_of_birth",
      "address",
      "class_id",
      "admission_number",
      "father_name",
      "mother_name",
      "guardian_phone",
      "blood_group",
      "transport_opted",
    ]

    const sampleData = [
      "John Doe",
      "john.doe@example.com",
      "+91-9876543210",
      "2010-01-15",
      "123 Main St, Chennai",
      "1",
      "ADM2024001",
      "Robert Doe",
      "Jane Doe",
      "+91-9876543211",
      "O+",
      "false",
    ]

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "student_admission_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", uploadFile)

    try {
      const response = await fetch("/api/students/bulk-upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully uploaded ${result.count} students`)
        await fetchData()
        setUploadFile(null)
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file")
    } finally {
      setUploading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:ml-64">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:ml-64">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Admissions</h1>
              <p className="text-gray-600">Manage student admissions and records</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          <Tabs defaultValue="new-admission" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="new-admission">New Admission</TabsTrigger>
              <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
              <TabsTrigger value="student-list">Student List</TabsTrigger>
            </TabsList>

            <TabsContent value="new-admission">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    New Student Admission
                  </CardTitle>
                  <CardDescription>Fill in the student details for admission</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange("full_name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">Date of Birth *</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="blood_group">Blood Group</Label>
                          <Select onValueChange={(value) => handleInputChange("blood_group", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="father_name">Father's Name</Label>
                          <Input
                            id="father_name"
                            value={formData.father_name}
                            onChange={(e) => handleInputChange("father_name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mother_name">Mother's Name</Label>
                          <Input
                            id="mother_name"
                            value={formData.mother_name}
                            onChange={(e) => handleInputChange("mother_name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardian_phone">Guardian Phone *</Label>
                          <Input
                            id="guardian_phone"
                            value={formData.guardian_phone}
                            onChange={(e) => handleInputChange("guardian_phone", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="class_id">Class & Section *</Label>
                          <Select onValueChange={(value) => handleInputChange("class_id", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
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
                        <div className="space-y-2">
                          <Label htmlFor="admission_number">Admission Number</Label>
                          <Input
                            id="admission_number"
                            value={formData.admission_number}
                            onChange={(e) => handleInputChange("admission_number", e.target.value)}
                            placeholder="Auto-generated if empty"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admission_date">Admission Date *</Label>
                          <Input
                            id="admission_date"
                            type="date"
                            value={formData.admission_date}
                            onChange={(e) => handleInputChange("admission_date", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Transport Option */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Transport</h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="transport_opted"
                          checked={formData.transport_opted}
                          onCheckedChange={(checked) => handleInputChange("transport_opted", checked)}
                        />
                        <Label htmlFor="transport_opted">Opt for school transport (Additional fees will apply)</Label>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Processing..." : "Submit Admission"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Student Upload
                  </CardTitle>
                  <CardDescription>Upload multiple students using CSV/Excel file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Choose CSV or Excel file to upload
                        </span>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </Label>
                      {uploadFile && <p className="mt-2 text-sm text-gray-600">Selected: {uploadFile.name}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={downloadTemplate} variant="outline" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                    <Button onClick={handleFileUpload} disabled={!uploadFile || uploading} className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Students"}
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Upload Instructions:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Download the template first to see the required format</li>
                      <li>• Fill in all required fields (marked with *)</li>
                      <li>• Use class_id numbers (1, 2, 3, etc.) for class selection</li>
                      <li>• Date format should be YYYY-MM-DD</li>
                      <li>• Transport opted should be true/false</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="student-list">
              <Card>
                <CardHeader>
                  <CardTitle>Student List</CardTitle>
                  <CardDescription>View and manage all admitted students ({students.length} total)</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.class_name} - {cls.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Student ID</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Class</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Admission Date</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.slice(0, 20).map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">{student.student_id}</td>
                            <td className="border border-gray-200 px-4 py-2">{student.full_name}</td>
                            <td className="border border-gray-200 px-4 py-2">
                              {student.class_name} - {student.section}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">{student.admission_date}</td>
                            <td className="border border-gray-200 px-4 py-2">
                              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                {student.status}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
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
                            </td>
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
    </Suspense>
  )
}
