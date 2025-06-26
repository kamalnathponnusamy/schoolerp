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

function AdminDashboard({ stats, students, fees }: any) {
  return (
    <>
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="bg-blue-500" trend="up" trendValue={12} description="Active enrollments" onClick={() => (window.location.href = "/students")} delay={0} />
        <StatCard title="Teaching Staff" value={stats.totalTeachers} icon={GraduationCap} color="bg-green-500" trend="up" trendValue={5} description="Qualified educators" onClick={() => (window.location.href = "/teachers")} delay={200} />
        <StatCard title="Active Classes" value={stats.totalClasses} icon={BookOpen} color="bg-purple-500" trend="up" trendValue={8} description="Running sessions" onClick={() => (window.location.href = "/classes")} delay={400} />
        <StatCard title="Pending Fees" value={Math.round(stats.pendingFees / 1000)} icon={CreditCard} color="bg-red-500" trend="down" trendValue={15} description="Outstanding (₹K)" onClick={() => (window.location.href = "/fees")} delay={600} />
        <StatCard title="Attendance Rate" value={stats.todayAttendance} icon={UserCheck} color="bg-emerald-500" trend="up" trendValue={3} description="Today's presence (%)" onClick={() => (window.location.href = "/attendance")} delay={800} />
        <StatCard title="Upcoming Exams" value={stats.upcomingExams} icon={Calendar} color="bg-orange-500" trend="up" trendValue={25} description="This month" onClick={() => (window.location.href = "/exams")} delay={1000} />
      </div>
      {/* ...rest of admin widgets (Quick Actions, Tabs, etc.) ... */}
      {/* Copy/paste the rest of the admin-only content here as needed */}
    </>
  );
}

function TeacherDashboardSummary({ user }: any) {
  // You can fetch teacher-specific data here or pass as props
  return (
    <div className="grid gap-6">
      {/* Assigned Classes */}
      <Card>
        <CardHeader><CardTitle>Assigned Classes</CardTitle></CardHeader>
        <CardContent>
          {/* TODO: Render teacher's assigned classes here */}
          <div>Assigned classes will be listed here.</div>
        </CardContent>
      </Card>
      {/* Today's Schedule */}
      <Card>
        <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
        <CardContent>
          {/* TODO: Render today's timetable for teacher */}
          <div>Today's schedule will be shown here.</div>
        </CardContent>
      </Card>
      {/* Homework/Assignment to Review */}
      <Card>
        <CardHeader><CardTitle>Homework / Assignments</CardTitle></CardHeader>
        <CardContent>
          {/* TODO: Render homework/assignment summary for teacher */}
          <div>Homework/assignment summary will be shown here.</div>
        </CardContent>
      </Card>
      {/* Notices/Admin Announcements */}
      <Card>
        <CardHeader><CardTitle>Notices / Admin Announcements</CardTitle></CardHeader>
        <CardContent>
          {/* TODO: Render notices for teacher */}
          <div>Notices from admin will be shown here.</div>
        </CardContent>
      </Card>
    </div>
  );
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
      <div className="p-6 space-y-6">
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
        {/* Role-based dashboard rendering */}
        {userRole === "admin" ? (
          <AdminDashboard stats={stats} students={students} fees={fees} />
        ) : userRole === "teacher" ? (
          <TeacherDashboardSummary user={user} />
        ) : (
          <div className="p-8 text-center text-muted-foreground">You do not have access to this dashboard.</div>
        )}
      </div>
    </div>
  )
}
