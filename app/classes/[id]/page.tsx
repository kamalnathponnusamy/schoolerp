"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, BookOpen, Phone, Mail } from "lucide-react"

interface Student {
  id: number
  student_id: string
  name: string
  gender: string
  phone: string
  email: string
  transport_route: string
  fee_status: string
}

interface ClassDetails {
  id: number
  class_name: string
  section: string
  teacher_name: string
  academic_year: string
  student_count: number
}

export default function ClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClassDetails()
      fetchClassStudents()
    }
  }, [params.id])

  const fetchClassDetails = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      const classData = data.classes?.find((c: ClassDetails) => c.id === Number(params.id))
      setClassDetails(classData || null)
    } catch (error) {
      console.error("Error fetching class details:", error)
    }
  }

  const fetchClassStudents = async () => {
    try {
      const response = await fetch(`/api/classes/${params.id}/students`)
      const data = await response.json()
      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching class students:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading class details...</div>
      </div>
    )
  }

  if (!classDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Class not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {classDetails.class_name} - Section {classDetails.section}
          </h1>
          <p className="text-muted-foreground">Academic Year: {classDetails.academic_year}</p>
        </div>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Class Teacher</p>
                <p className="text-lg font-semibold">{classDetails.teacher_name || "Not Assigned"}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fee Status</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="default">{students.filter((s) => s.fee_status === "Paid").length} Paid</Badge>
                  <Badge variant="destructive">
                    {students.filter((s) => s.fee_status === "Pending").length} Pending
                  </Badge>
                </div>
              </div>
              <span className="text-2xl">ðŸ’°</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List ({students.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Fee Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Badge variant={student.gender === "male" ? "default" : "secondary"}>{student.gender}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {student.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.transport_route}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.fee_status === "Paid" ? "default" : "destructive"}>
                      {student.fee_status}
                    </Badge>
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
