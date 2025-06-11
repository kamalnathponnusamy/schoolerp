"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, UserPlus, Download, Search, Bus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Student {
  id: number
  student_id: string
  name: string
  email: string
  phone: string
  class_name: string
  section: string
  admission_number: string
  admission_date: string
  father_name?: string
  mother_name?: string
  guardian_phone?: string
  blood_group?: string
  transport_opted: boolean
  transport_route?: string
  status: string
}

interface Class {
  id: number
  class_name: string
  section: string
}

interface TransportRoute {
  id: number
  route_name: string
  monthly_fee: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [newStudent, setNewStudent] = useState({
    student_id: "",
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    class_id: "",
    admission_number: "",
    admission_date: new Date().toISOString().split("T")[0],
    father_name: "",
    mother_name: "",
    guardian_phone: "",
    blood_group: "",
    transport_opted: false,
    transport_route_id: "",
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (searchTerm || classFilter) {
      fetchStudents()
    }
  }, [searchTerm, classFilter])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      await Promise.all([fetchStudents(), fetchClasses(), fetchTransportRoutes()])
    } catch (err) {
      setError("Failed to load data. Please refresh the page.")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (classFilter) params.append("class", classFilter)

      const response = await fetch(`/api/students?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStudents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setClasses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching classes:", error)
      setClasses([])
    }
  }

  const fetchTransportRoutes = async () => {
    try {
      const response = await fetch("/api/transport/routes")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTransportRoutes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching transport routes:", error)
      setTransportRoutes([])
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const studentData = {
        ...newStudent,
        transport_route_id:
          newStudent.transport_opted && newStudent.transport_route_id
            ? Number.parseInt(newStudent.transport_route_id)
            : null,
      }

      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      })

      if (!response.ok) {
        throw new Error("Failed to add student")
      }

      alert("Student added successfully!")
      setIsAddModalOpen(false)
      resetForm()
      fetchStudents()
    } catch (error) {
      console.error("Error adding student:", error)
      alert("Failed to add student. Please try again.")
    }
  }

  const resetForm = () => {
    setNewStudent({
      student_id: "",
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      address: "",
      class_id: "",
      admission_number: "",
      admission_date: new Date().toISOString().split("T")[0],
      father_name: "",
      mother_name: "",
      guardian_phone: "",
      blood_group: "",
      transport_opted: false,
      transport_route_id: "",
    })
  }

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/students/export?format=${format}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "students.csv"
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "students.json"
        a.click()
        window.URL.revokeObjectURL(url)
      }

      alert(`Students exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export students")
    }
  }

  const uniqueClasses = [...new Set(students.map((s) => s.class_name).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading students...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchAllData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student records and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                  </div>
                  <div>
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                      id="student_id"
                      value={newStudent.student_id}
                      onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admission_number">Admission Number</Label>
                    <Input
                      id="admission_number"
                      value={newStudent.admission_number}
                      onChange={(e) => setNewStudent({ ...newStudent, admission_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={newStudent.full_name}
                      onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newStudent.date_of_birth}
                      onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="class_id">Class</Label>
                    <Select
                      value={newStudent.class_id}
                      onValueChange={(value) => setNewStudent({ ...newStudent, class_id: value })}
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
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select
                      value={newStudent.blood_group}
                      onValueChange={(value) => setNewStudent({ ...newStudent, blood_group: value })}
                    >
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

                  {/* Contact Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStudent.address}
                      onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                      required
                    />
                  </div>

                  {/* Parent Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Parent/Guardian Information</h3>
                  </div>
                  <div>
                    <Label htmlFor="father_name">Father's Name</Label>
                    <Input
                      id="father_name"
                      value={newStudent.father_name}
                      onChange={(e) => setNewStudent({ ...newStudent, father_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mother_name">Mother's Name</Label>
                    <Input
                      id="mother_name"
                      value={newStudent.mother_name}
                      onChange={(e) => setNewStudent({ ...newStudent, mother_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardian_phone">Guardian Phone</Label>
                    <Input
                      id="guardian_phone"
                      value={newStudent.guardian_phone}
                      onChange={(e) => setNewStudent({ ...newStudent, guardian_phone: e.target.value })}
                    />
                  </div>

                  {/* Transport Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Transport Information</h3>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="transport_opted"
                        checked={newStudent.transport_opted}
                        onCheckedChange={(checked) =>
                          setNewStudent({ ...newStudent, transport_opted: checked as boolean })
                        }
                      />
                      <Label htmlFor="transport_opted">Opt for school transport</Label>
                    </div>
                  </div>
                  {newStudent.transport_opted && (
                    <div className="col-span-2">
                      <Label htmlFor="transport_route_id">Transport Route</Label>
                      <Select
                        value={newStudent.transport_route_id}
                        onValueChange={(value) => setNewStudent({ ...newStudent, transport_route_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport route" />
                        </SelectTrigger>
                        <SelectContent>
                          {transportRoutes.length > 0 ? (
                            transportRoutes.map((route) => (
                              <SelectItem key={route.id} value={route.id.toString()}>
                                {route.route_name} - ₹{route.monthly_fee}/month
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no_routes" disabled>
                              No routes available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Student</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transport Users</CardTitle>
            <Bus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter((s) => s.transport_opted).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueClasses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Admissions</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => new Date(s.admission_date).getFullYear() === new Date().getFullYear()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, student ID, or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List ({students.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    {student.class_name} {student.section}
                  </TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{student.father_name}</TableCell>
                  <TableCell>{student.guardian_phone || student.phone}</TableCell>
                  <TableCell>
                    {student.transport_opted ? (
                      <Badge variant="secondary">
                        <Bus className="h-3 w-3 mr-1" />
                        {student.transport_route || "Assigned"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Transport</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
