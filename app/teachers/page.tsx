"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, GraduationCap, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: number
  teacher_id: string
  name: string
  subject: string
  phone: string
  email: string
  qualification: string
  experience_years: number
  salary: number
  status: string
  assigned_classes: string
  joining_date: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { toast } = useToast()

  const [newTeacher, setNewTeacher] = useState({
    teacher_id: "",
    name: "",
    subject: "",
    phone: "",
    email: "",
    qualification: "",
    experience_years: 0,
    salary: 0,
    assigned_classes: "",
    joining_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      if (!response.ok) {
        throw new Error("Failed to fetch teachers")
      }
      const data = await response.json()
      // Ensure data is an array
      setTeachers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching teachers:", error)
      setTeachers([]) // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Teacher added successfully",
        })
        setIsAddModalOpen(false)
        setNewTeacher({
          teacher_id: "",
          name: "",
          subject: "",
          phone: "",
          email: "",
          qualification: "",
          experience_years: 0,
          salary: 0,
          assigned_classes: "",
          joining_date: new Date().toISOString().split('T')[0],
        })
        fetchTeachers()
      } else {
        throw new Error("Failed to add teacher")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add teacher",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading teachers...</div>
      </div>
    )
  }

  const safeTeachers = Array.isArray(teachers) ? teachers : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage teaching staff and their assignments</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacher_id">Teacher ID</Label>
                  <Input
                    id="teacher_id"
                    value={newTeacher.teacher_id}
                    onChange={(e) => setNewTeacher({ ...newTeacher, teacher_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={newTeacher.experience_years}
                    onChange={(e) =>
                      setNewTeacher({ ...newTeacher, experience_years: Number.parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={newTeacher.qualification}
                    onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({ ...newTeacher, salary: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="assigned_classes">Assigned Classes (comma separated)</Label>
                  <Input
                    id="assigned_classes"
                    value={newTeacher.assigned_classes}
                    onChange={(e) => setNewTeacher({ ...newTeacher, assigned_classes: e.target.value })}
                    placeholder="e.g., 10A, 11B"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="joining_date">Joining Date</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={newTeacher.joining_date}
                    onChange={(e) => setNewTeacher({ ...newTeacher, joining_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Teacher</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeTeachers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Taught</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(safeTeachers.map((t) => t.subject)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeTeachers.length > 0
                ? Math.round(safeTeachers.reduce((sum, t) => sum + t.experience_years, 0) / safeTeachers.length)
                : 0}{" "}
              years
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeTeachers.filter((t) => t.status === "active").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teaching Staff ({safeTeachers.length} teachers)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No teachers found. Add your first teacher to get started.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                safeTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.teacher_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground">{teacher.qualification}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{teacher.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {teacher.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {teacher.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.experience_years} years</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{teacher.assigned_classes}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.status === "active" ? "default" : "secondary"}>{teacher.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
