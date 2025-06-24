"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useCounterAnimation } from "@/hooks/use-counter-animation"
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Calendar,
  UserCheck,
  AlertCircle,
  FileText,
  Award,
  Clock,
  Target,
  Activity,
  Star,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react"

interface DashboardStats {
  stats: {
    totalStudents: number
    totalTeachers: number
    totalClasses: number
    pendingFees: number
    attendancePercentage: number
    upcomingExams: number
    recentActivities: Array<{
      type: string
      description: string
      date: string
      class?: string
    }>
    feeCollection: {
      totalFees: number
      collectedFees: number
      totalRecords: number
      collectionRate: number
    }
  }
}

interface Student {
  id: number
  student_id: string
  full_name: string
  class_name: string
  section: string
  admission_date: string
  status: string
  transport_opted: boolean
  route_name?: string
}

interface Fee {
  id: number
  student_name: string
  student_id: string
  class_name: string
  section: string
  total_amount: number
  paid_amount: number
  status: string
  due_date: string
}

// Enhanced Stat Card Component
function StatCard({ title, value, icon: Icon, color, trend, trendValue, description, onClick, delay = 0 }: any) {
  const animatedValue = useCounterAnimation(value, 2000 + delay)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">{animatedValue.toLocaleString()}</p>
              {trend && trendValue && (
                <div className="flex items-center space-x-1">
                  {trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {trendValue}%
                  </span>
                </div>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingFees: 0,
    todayAttendance: 0,
    upcomingExams: 0
  })
  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [userRole, setUserRole] = useState<string>("admin")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      window.location.href = "/"
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setUserRole(parsedUser.role)
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const statsResponse = await fetch("/api/dashboard/stats")
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats({
          totalStudents: data.stats.totalStudents,
          totalTeachers: data.stats.totalTeachers,
          totalClasses: data.stats.totalClasses,
          pendingFees: data.stats.pendingFees,
          todayAttendance: data.stats.attendancePercentage,
          upcomingExams: data.stats.upcomingExams
        })
      }

      const studentsResponse = await fetch("/api/students/list")
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData)
      }

      const feesResponse = await fetch("/api/fees/summary")
      if (feesResponse.ok) {
        const feesData = await feesResponse.json()
        setFees(feesData)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    document.cookie = "session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/*<div className="lg:pl-64">*/}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "User"}! Here's your school overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                <Calendar className="w-4 h-4 mr-2" />
                Academic Year 2024-25
              </Badge>
              <Badge className="px-3 py-1">
                <Star className="w-4 h-4 mr-2" />
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {/* Statistics Grid */}
          {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">*/}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"> 
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              color="bg-blue-500"
              trend="up"
              trendValue={12}
              description="Active enrollments"
              onClick={() => (window.location.href = "/students")}
              delay={0}
            />
            <StatCard
              title="Teaching Staff"
              value={stats.totalTeachers}
              icon={GraduationCap}
              color="bg-green-500"
              trend="up"
              trendValue={5}
              description="Qualified educators"
              onClick={() => (window.location.href = "/teachers")}
              delay={200}
            />
            <StatCard
              title="Active Classes"
              value={stats.totalClasses}
              icon={BookOpen}
              color="bg-purple-500"
              trend="up"
              trendValue={8}
              description="Running sessions"
              onClick={() => (window.location.href = "/classes")}
              delay={400}
            />
            <StatCard
              title="Pending Fees"
              value={Math.round(stats.pendingFees / 1000)}
              icon={CreditCard}
              color="bg-red-500"
              trend="down"
              trendValue={15}
              description="Outstanding (₹K)"
              onClick={() => (window.location.href = "/fees")}
              delay={600}
            />
            <StatCard
              title="Attendance Rate"
              value={stats.todayAttendance}
              icon={UserCheck}
              color="bg-emerald-500"
              trend="up"
              trendValue={3}
              description="Today's presence (%)"
              onClick={() => (window.location.href = "/attendance")}
              delay={800}
            />
            <StatCard
              title="Upcoming Exams"
              value={stats.upcomingExams}
              icon={Calendar}
              color="bg-orange-500"
              trend="up"
              trendValue={25}
              description="This month"
              onClick={() => (window.location.href = "/exams")}
              delay={1000}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => (window.location.href = "/admissions")}
                >
                  <Users className="h-6 w-6" />
                  <span>Add Student</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => (window.location.href = "/attendance")}
                >
                  <UserCheck className="h-6 w-6" />
                  <span>Mark Attendance</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => (window.location.href = "/assignments")}
                >
                  <BookOpen className="h-6 w-6" />
                  <span>Create Assignment</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => (window.location.href = "/reports")}
                >
                  <FileText className="h-6 w-6" />
                  <span>Generate Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {students.slice(0, 5).map((student) => (
                        <div key={student.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                            {student.full_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.class_name} - {student.section} • {student.student_id}
                            </p>
                          </div>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Attendance Rate</span>
                          <span className="font-medium">{stats.todayAttendance}%</span>
                        </div>
                        <Progress value={stats.todayAttendance} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Fee Collection</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Academic Progress</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Parent-Teacher Meeting</p>
                          <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Award className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Science Exhibition</p>
                          <p className="text-sm text-muted-foreground">March 15, 2024</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Monthly Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {[85, 92, 78, 96, 88, 94, 90].map((value, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div
                            className="w-8 bg-primary rounded-t-md"
                            style={{ height: `${(value / 100) * 200}px` }}
                          ></div>
                          <span className="text-xs text-muted-foreground">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Fee Collection Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Paid</span>
                        </div>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Pending</span>
                        </div>
                        <span className="font-medium">12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Overdue</span>
                        </div>
                        <span className="font-medium">3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Overview ({students.length} total)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Student</th>
                          <th className="text-left py-3 px-4 font-medium">Class</th>
                          <th className="text-left py-3 px-4 font-medium">Transport</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 8).map((student) => (
                          <tr key={student.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                                  {student.full_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium">{student.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{student.student_id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">
                                {student.class_name} - {student.section}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {student.transport_opted ? (
                                <Badge className="bg-green-100 text-green-800">{student.route_name || "Yes"}</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={student.status === "active" ? "default" : "secondary"}>
                                {student.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      Critical Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">Fee Collection Due</p>
                          <p className="text-sm text-muted-foreground">₹{stats.pendingFees.toLocaleString()} pending</p>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive">
                        View
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">Low Attendance</p>
                          <p className="text-sm text-muted-foreground">Class 10-A below 80%</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Check
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">100% Attendance</p>
                        <p className="text-sm text-muted-foreground">Class 9-B achieved perfect attendance</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <Star className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Top Performance</p>
                        <p className="text-sm text-muted-foreground">Mathematics exam results excellent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    // </div>
  )
}
